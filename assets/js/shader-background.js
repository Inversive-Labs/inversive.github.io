// WebGL Shader Background Implementation
class ShaderBackground {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.startTime = Date.now();
        this.animationId = null;
        this.isVisible = true;
        this.pausedTime = 0;
        this.lastActiveTime = Date.now();

        this.init();
        this.setupVisibilityHandling();
    }

    setupVisibilityHandling() {
        // Handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                this.isVisible = false;
                this.pausedTime = Date.now() - this.lastActiveTime;
            } else {
                this.isVisible = true;
                this.startTime += Date.now() - this.lastActiveTime - this.pausedTime;
                this.lastActiveTime = Date.now();
            }
        };

        // Listen for visibility change events
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also handle window blur/focus for additional coverage
        window.addEventListener('blur', () => {
            this.isVisible = false;
            this.pausedTime = Date.now() - this.lastActiveTime;
        });

        window.addEventListener('focus', () => {
            this.isVisible = true;
            this.startTime += Date.now() - this.lastActiveTime - this.pausedTime;
            this.lastActiveTime = Date.now();
        });
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
        this.canvas.style.zIndex = '1';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.6';

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
        // Check if we're on the home page
        const isHomePage = document.body.classList.contains('home-page');

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
            uniform float u_scrollProgress;

            void main() {
                vec2 fragCoord = gl_FragCoord.xy;

                ${isHomePage ? `
                vec2 p = (fragCoord.xy * 3.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

                // Add random offsets to create unique tunnel patterns
                float offset1 = u_randomSeed * 0.123;
                float offset2 = u_randomSeed * 0.456;
                float offset3 = u_randomSeed * 0.789;

                // Unique startup effect - tunnel formation from quantum foam
                float startupDuration = 3.0;
                float startupProgress = min(u_time / startupDuration, 1.0);

                float camZ = 0.3 * u_time;
                vec2 cam = vec2(
                    0.0 + sin((camZ + offset1) * 0.07) * 0.7 + sin(cos((camZ + offset2) * 0.025) * 3.0) * 0.4 + sin(sin((camZ + offset3) * 0.01) * 2.0) * 0.2,
                    0.0 + cos((camZ + offset1) * 0.07) * 0.7 + cos(cos((camZ + offset2) * 0.025) * 3.0) * 0.4 + cos(sin((camZ + offset3) * 0.01) * 2.0) * 0.2
                ) * 1.0;

                float dt = 1.1;
                float camZ2 = 0.3 * (u_time + dt);
                vec2 cam2 = vec2(
                    0.0 + sin((camZ2 + offset1) * 0.07) * 0.7 + sin(cos((camZ2 + offset2) * 0.025) * 3.0) * 0.4 + sin(sin((camZ2 + offset3) * 0.01) * 2.0) * 0.2,
                    0.0 + cos((camZ2 + offset1) * 0.07) * 0.7 + cos(cos((camZ2 + offset2) * 0.025) * 3.0) * 0.4 + cos(sin((camZ2 + offset3) * 0.01) * 2.0) * 0.2
                ) * 1.0;
                vec2 dcamdt = (cam2 - cam) / dt;

                vec3 f = vec3(0.0);
                for(int j = 1; j < 100; j++) {
                    float i = float(j);
                    float realZ = floor(camZ) + i;
                    float screenZ = realZ - camZ;
                    float r = 20.0 / screenZ;
                    vec2 pos = vec2(
                        0.0 + sin((realZ + offset1) * 0.07) * 0.7 + sin(cos((realZ + offset2) * 0.025) * 3.0) * 0.4 + sin(sin((realZ + offset3) * 0.01) * 2.0) * 0.2,
                        0.0 + cos((realZ + offset1) * 0.07) * 0.7 + cos(cos((realZ + offset2) * 0.025) * 3.0) * 0.4 + cos(sin((realZ + offset3) * 0.01) * 2.0) * 0.2
                    ) * 1.0;
                    vec2 c = (pos - cam) * 12.0 / screenZ - dcamdt * 0.1;

                    // Site color scheme: cyan (#10ebff), purple (#b91aee), pink
                    float progression = realZ * 0.03;
                    vec3 cyan = vec3(0.063, 0.922, 1.0);        // #10ebff
                    vec3 purple = vec3(0.725, 0.102, 0.933);    // #b91aee
                    vec3 pink = vec3(1.0, 0.078, 0.576);        // #ff1493

                    vec3 color;
                    float t = mod(progression, 3.0);
                    if (t < 1.0) {
                        color = mix(cyan, purple, t);
                    } else if (t < 2.0) {
                        color = mix(purple, pink, t - 1.0);
                    } else {
                        color = mix(pink, cyan, t - 2.0);
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
                ` : `
                // Just the grid background for non-home pages - no vortex
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                `}
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
            randomSeed: this.gl.getUniformLocation(this.program, 'u_randomSeed'),
            scrollProgress: this.gl.getUniformLocation(this.program, 'u_scrollProgress')
        };
        
        // Generate random seed for unique tunnel patterns each load
        this.randomSeed = Math.random() * 1000.0;

        // Get attribute location
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');

        // Track scroll position
        this.scrollProgress = 0;
        this.setupScrollTracking();
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

    setupScrollTracking() {
        // Track scroll to detect when dark sections are visible
        const updateScroll = () => {
            const heroSection = document.querySelector('.service-hero-minimal');
            if (heroSection) {
                const heroHeight = heroSection.offsetHeight;
                const scrollY = window.scrollY;
                const viewportHeight = window.innerHeight;

                // Calculate how much of the viewport shows dark sections
                if (scrollY > heroHeight - viewportHeight / 2) {
                    // Dark section is entering view
                    const darkProgress = Math.min((scrollY - (heroHeight - viewportHeight / 2)) / viewportHeight, 1.0);
                    this.scrollProgress = darkProgress;
                } else {
                    this.scrollProgress = 0;
                }
            } else {
                // Fallback for other pages
                this.scrollProgress = Math.min(window.scrollY / window.innerHeight * 0.5, 1.0);
            }
        };

        window.addEventListener('scroll', updateScroll);
        updateScroll(); // Initial call
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

        // Don't render if tab is not visible
        if (!this.isVisible) {
            this.animationId = requestAnimationFrame(() => this.render());
            return;
        }

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
        this.gl.uniform1f(this.uniforms.scrollProgress, this.scrollProgress);
        
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