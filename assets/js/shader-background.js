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

        // Performance monitoring
        this.frameCount = 0;
        this.lastFpsCheck = Date.now();
        this.avgFps = 60;
        this.qualityLevel = 1.0; // 1.0 = full quality, 0.5 = half resolution
        this.performanceChecked = false;

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
        this.canvas.style.opacity = '0'; // Start invisible
        this.canvas.style.transition = 'opacity 1.5s ease-in-out';

        // Insert canvas as first child of body
        document.body.insertBefore(this.canvas, document.body.firstChild);

        // Add shader-active class for fallback browsers
        document.body.classList.add('shader-active');

        // Trigger fade-in effect after a brief delay
        setTimeout(() => {
            this.canvas.style.opacity = '0.6';
        }, 100);

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
        // Check if we're on the home page - vortex for home, grid for others
        const isHomePage = document.body.classList.contains('home-page');

        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        // Fragment shader - optimized for performance
        const fragmentShaderSource = `
            precision lowp float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform float u_randomSeed;
            uniform float u_scrollProgress;

            void main() {
                vec2 fragCoord = gl_FragCoord.xy;

                ${isHomePage ? `
                vec2 p = (fragCoord.xy * 3.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

                // Pre-calculate constants outside loop
                const float offset1 = 0.123;
                const float offset2 = 0.456;
                const float offset3 = 0.789;

                float o1 = u_randomSeed * offset1;
                float o2 = u_randomSeed * offset2;
                float o3 = u_randomSeed * offset3;

                float camZ = 0.3 * u_time;

                // Camera follows a mostly straight path with subtle curves
                float spiralAngle = camZ * 0.15;  // Slow spiral
                float spiralRadius = 1.0;

                // Pre-calculate oscillations
                float osc1 = sin(cos(camZ * 0.025 + o2) * 3.0);
                float osc2 = cos(cos(camZ * 0.025 + o2) * 3.0);
                float osc3 = sin(sin(camZ * 0.01 + o3) * 2.0);
                float osc4 = cos(sin(camZ * 0.01 + o3) * 2.0);

                vec2 cam = vec2(
                    cos(spiralAngle) * spiralRadius + osc1 * 0.4 + osc3 * 0.2 - 0.8,
                    sin(spiralAngle) * spiralRadius + osc2 * 0.4 + osc4 * 0.2
                );

                // Camera velocity
                float camZ2 = camZ + 0.33;
                float spiralAngle2 = camZ2 * 0.15;
                float osc1_2 = sin(cos(camZ2 * 0.025 + o2) * 3.0);
                float osc2_2 = cos(cos(camZ2 * 0.025 + o2) * 3.0);
                float osc3_2 = sin(sin(camZ2 * 0.01 + o3) * 2.0);
                float osc4_2 = cos(sin(camZ2 * 0.01 + o3) * 2.0);

                vec2 cam2 = vec2(
                    cos(spiralAngle2) * spiralRadius + osc1_2 * 0.4 + osc3_2 * 0.2 - 0.8,
                    sin(spiralAngle2) * spiralRadius + osc2_2 * 0.4 + osc4_2 * 0.2
                );
                vec2 dcamdt = (cam2 - cam) * 0.909;

                // Color palette (pre-defined)
                const vec3 cyan = vec3(0.063, 0.922, 1.0);
                const vec3 purple = vec3(0.725, 0.102, 0.933);
                const vec3 pink = vec3(1.0, 0.078, 0.576);

                vec3 f = vec3(0.0);
                float floorCamZ = floor(camZ);

                // Main rendering loop - increased depth
                for(int j = 1; j < 70; j++) {
                    float realZ = floorCamZ + float(j);
                    float screenZ = realZ - camZ;
                    float invScreenZ = 1.0 / screenZ;

                    // Tunnel centerline follows the same path
                    float spiralAngleZ = realZ * 0.15;

                    // Pre-calculate oscillations
                    float oscz1 = sin(cos(realZ * 0.025 + o2) * 3.0);
                    float oscz2 = cos(cos(realZ * 0.025 + o2) * 3.0);
                    float oscz3 = sin(sin(realZ * 0.01 + o3) * 2.0);
                    float oscz4 = cos(sin(realZ * 0.01 + o3) * 2.0);

                    vec2 tunnelCenter = vec2(
                        cos(spiralAngleZ) * spiralRadius + oscz1 * 0.4 + oscz3 * 0.2,
                        sin(spiralAngleZ) * spiralRadius + oscz2 * 0.4 + oscz4 * 0.2
                    );

                    // Project the ring center onto screen
                    vec2 c = (tunnelCenter - cam) * 12.0 * invScreenZ;

                    // Ring radius (fixed size in world space, shrinks with distance)
                    float r = 20.0 * invScreenZ;

                    // Optimized color calculation
                    float t = fract(realZ * 0.01);
                    vec3 color;
                    if (t < 0.333) {
                        color = mix(cyan, purple, t * 3.0);
                    } else if (t < 0.666) {
                        color = mix(purple, pink, (t - 0.333) * 3.0);
                    } else {
                        color = mix(pink, cyan, (t - 0.666) * 3.0);
                    }

                    // Simplified intensity calculation
                    float intensity = 0.02;

                    f += color * intensity * invScreenZ / (abs(length(p - c) - r) + 0.01);
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
            // Apply quality scaling to resolution
            this.canvas.width = Math.floor(displayWidth * this.qualityLevel);
            this.canvas.height = Math.floor(displayHeight * this.qualityLevel);
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    checkPerformance() {
        this.frameCount++;
        const now = Date.now();
        const elapsed = now - this.lastFpsCheck;

        // Check FPS every 2 seconds
        if (elapsed >= 2000) {
            this.avgFps = (this.frameCount / elapsed) * 1000;
            this.frameCount = 0;
            this.lastFpsCheck = now;

            // Adjust quality based on FPS (only after first check at 3 seconds)
            if (!this.performanceChecked && now - this.startTime > 3000) {
                this.performanceChecked = true;

                // If FPS is below 30, reduce quality to 75%
                if (this.avgFps < 30) {
                    this.qualityLevel = 0.75;
                    this.resize();
                    console.log('Shader: Reduced quality for better performance');
                }
                // If FPS is below 20, reduce quality to 50%
                else if (this.avgFps < 20) {
                    this.qualityLevel = 0.5;
                    this.resize();
                    console.log('Shader: Reduced quality significantly for better performance');
                }
            }
        }
    }
    
    render() {
        if (!this.gl || !this.program) return;

        // Don't render if tab is not visible
        if (!this.isVisible) {
            this.animationId = requestAnimationFrame(() => this.render());
            return;
        }

        // Performance monitoring
        this.checkPerformance();

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