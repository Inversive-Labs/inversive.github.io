// WebGL Shader Background Implementation
class ShaderBackground {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.startTime = Date.now();
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('shader-canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.5';

        // Insert canvas as first child of body
        document.body.insertBefore(this.canvas, document.body.firstChild);

        // Add shader-active class for fallback browsers
        document.body.classList.add('shader-active');

        // Initialize WebGL
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to CSS background');
            this.fallbackToCSS();
            return;
        }
        
        this.setupShaders();
        this.setupGeometry();
        this.resize();
        this.render();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }
    
    fallbackToCSS() {
        // Remove shader canvas and keep the existing CSS grid
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Remove shader-active class to show CSS fallback
        document.body.classList.remove('shader-active');
    }
    
    setupShaders() {
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Fragment shader - adapted from your Shadertoy code
        const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform float u_randomSeed;
            
            vec2 position(float z) {
                // Add random offsets to create unique tunnel patterns
                float offset1 = u_randomSeed * 0.123;
                float offset2 = u_randomSeed * 0.456;
                float offset3 = u_randomSeed * 0.789;
                
                return vec2(
                    0.0 + sin((z + offset1) * 0.07) * 0.7 + sin(cos((z + offset2) * 0.025) * 3.0) * 0.4 + sin(sin((z + offset3) * 0.01) * 2.0) * 0.2,
                    0.0 + cos((z + offset1) * 0.07) * 0.7 + cos(cos((z + offset2) * 0.025) * 3.0) * 0.4 + cos(sin((z + offset3) * 0.01) * 2.0) * 0.2
                ) * 1.0;
            }
            
            void main() {
                vec2 fragCoord = gl_FragCoord.xy;
                vec2 p = (fragCoord.xy * 3.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                
                // Unique startup effect - tunnel formation from quantum foam
                float startupDuration = 3.0;
                float startupProgress = min(u_time / startupDuration, 1.0);
                
                float camZ = 0.8 * u_time;
                vec2 cam = position(camZ);

                float dt = 1.1;
                float camZ2 = 0.2 * (u_time + dt);
                vec2 cam2 = position(camZ2);
                vec2 dcamdt = (cam2 - cam) / dt;
                
                vec3 f = vec3(0.0);
                for(int j = 1; j < 100; j++) {
                    float i = float(j);
                    float realZ = floor(camZ) + i;
                    float screenZ = realZ - camZ;
                    float r = 20.0 / screenZ;
                    vec2 c = (position(realZ) - cam) * 12.0 / screenZ - dcamdt * 0.1;
                    // Create progression: cyan -> pink -> purple -> dark purple
                    float progression = realZ * 0.03; // Slower color progression
                    
                    // Define color stops matching site color scheme
                    vec3 cyan = vec3(0.063, 0.922, 1.0);     // #10ebff (start)
                    vec3 pink = vec3(0.9, 0.3, 0.8);         // Pink transition
                    vec3 purple = vec3(0.725, 0.102, 0.933); // #b91aee
                    vec3 darkPurple = vec3(0.3, 0.1, 0.6);   // Dark purple (end)
                    
                    // Smooth interpolation between color stops
                    float t = mod(progression, 4.5);
                    vec3 color;
                    if (t < 1.5) {
                        // Stay in cyan a bit longer
                        color = cyan;
                    } else if (t < 2.5) {
                        // Cyan to pink
                        color = mix(cyan, pink, t - 1.5);
                    } else if (t < 3.5) {
                        // Pink to purple
                        color = mix(pink, purple, t - 2.5);
                    } else {
                        // Purple to dark purple
                        color = mix(purple, darkPurple, t - 3.5);
                    }
                    
                    // Apply smooth startup fade-in effect
                    float intensity = 0.02;
                    if (startupProgress < 1.0) {
                        // Simple smooth fade-in with gentle wave
                        float fadeIn = smoothstep(0.0, 1.0, startupProgress);
                        float gentleWave = 1.0 + sin(realZ * 2.0 + u_time * 1.0) * 0.15 * (1.0 - startupProgress);
                        intensity *= fadeIn * gentleWave;
                    }
                    
                    f += color * intensity / screenZ / (abs(length(p - c) - r) + 0.01);
                }

                gl_FragColor = vec4(f, 1.0);
            }
        `;
        
        // Create shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            this.fallbackToCSS();
            return;
        }
        
        // Create program
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        if (!this.program) {
            this.fallbackToCSS();
            return;
        }
        
        // Get uniform locations
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            randomSeed: this.gl.getUniformLocation(this.program, 'u_randomSeed')
        };
        
        // Generate random seed for unique tunnel patterns each load
        this.randomSeed = Math.random() * 1000.0;
        
        // Get attribute location
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Error compiling shader:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Error linking program:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    setupGeometry() {
        // Create a full-screen quad
        const positions = [
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ];
        
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }
    
    resize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    render() {
        if (!this.gl || !this.program) return;
        
        const currentTime = (Date.now() - this.startTime) * 0.001; // Convert to seconds
        
        // Clear canvas
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Use shader program
        this.gl.useProgram(this.program);
        
        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, currentTime);
        this.gl.uniform1f(this.uniforms.randomSeed, this.randomSeed);
        
        // Setup position attribute
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.render());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        
        // Remove shader-active class
        document.body.classList.remove('shader-active');
    }
}

// Initialize shader background when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        window.shaderBackground = new ShaderBackground();
    }, 100);
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (window.shaderBackground) {
        window.shaderBackground.destroy();
    }
});