// Animated SVG Paths Background (shadcn style with React + Framer Motion)
(function() {
    function init() {
        if (typeof window.React === 'undefined' ||
            typeof window.ReactDOM === 'undefined') {
            setTimeout(init, 50); // Retry if React not loaded yet
            return;
        }

        const React = window.React;
        const ReactDOM = window.ReactDOM;
        const FramerMotion = window.Motion || window.FramerMotion;

        if (!FramerMotion || !FramerMotion.motion) {
            setTimeout(init, 50); // Retry if Framer Motion not loaded yet
            return;
        }

        const motion = FramerMotion.motion;

        const FloatingPaths = ({ position }) => {
            return React.createElement(
                'svg',
                {
                    viewBox: '0 0 696 316',
                    preserveAspectRatio: 'xMidYMid slice',
                    fill: 'none',
                    style: { position: 'absolute', width: '100%', height: '100%' }
                },
                // Use exact shadcn path formula
                Array.from({ length: 36 }).map((_, i) => {
                    const d = `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`;

                    // Grey stroke color matching your theme - reduced opacity for better readability
                    const strokeOpacity = 0.05 + i * 0.015;
                    const strokeWidth = 0.5 + i * 0.03;

                    // Slower animation duration (20-30 seconds range)
                    const duration = 20 + Math.random() * 10;
                    // Use negative delays to start animations already in progress
                    const delay = -(i * 0.0301);

                    return React.createElement(motion.path, {
                        key: i,
                        d: d,
                        stroke: '#808080', // Grey color matching your theme
                        strokeWidth: strokeWidth,
                        strokeOpacity: strokeOpacity,
                        initial: {
                            pathLength: 0,
                            opacity: 0
                        },
                        animate: {
                            pathLength: [0, 1, 1, 0],
                            opacity: [0, strokeOpacity, strokeOpacity, 0]
                        },
                        transition: {
                            duration: duration,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            times: [0, 0.2, 0.8, 1],
                            delay: delay,
                            repeatDelay: 0
                        }
                    });
                })
            );
        };

        const BackgroundPaths = () => {
            return React.createElement(
                'div',
                {
                    id: 'shader-canvas',
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: -1,
                        pointerEvents: 'none'
                    }
                },
                React.createElement(FloatingPaths, { position: 1 }),
                React.createElement(FloatingPaths, { position: -1 })
            );
        };

        // Create container and render
        const container = document.createElement('div');
        document.body.insertBefore(container, document.body.firstChild);

        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(BackgroundPaths));
    }

    // Call init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
