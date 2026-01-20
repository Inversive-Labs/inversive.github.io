// Clip path animations to body bounds
(function() {
    function updateClipPath() {
        const body = document.body;
        const rect = body.getBoundingClientRect();

        // Calculate clip path based on body position
        const top = Math.max(0, rect.top);
        const left = Math.max(0, rect.left);
        const right = Math.max(0, window.innerWidth - rect.right);
        const bottom = Math.max(0, window.innerHeight - rect.bottom);

        const clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;

        const shaderCanvas = document.getElementById('shader-canvas');
        const instantPaths = document.getElementById('instant-paths');

        if (shaderCanvas) {
            shaderCanvas.style.clipPath = clipPath;
            shaderCanvas.style.webkitClipPath = clipPath; // Safari support
        }
        if (instantPaths) {
            instantPaths.style.clipPath = clipPath;
            instantPaths.style.webkitClipPath = clipPath; // Safari support
        }
    }

    // Use MutationObserver to wait for shader-canvas to be created
    const observer = new MutationObserver(function(mutations) {
        const shaderCanvas = document.getElementById('shader-canvas');
        if (shaderCanvas) {
            updateClipPath();
            // Keep observing in case it gets recreated
        }
    });

    // Start observing when DOM is ready
    function init() {
        updateClipPath();
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Update on load, resize, and scroll
    window.addEventListener('load', updateClipPath);
    window.addEventListener('resize', updateClipPath);
    window.addEventListener('scroll', updateClipPath);
    window.addEventListener('orientationchange', updateClipPath);

    // Initial update
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also update after a short delay to catch any late-loading elements
    setTimeout(updateClipPath, 100);
    setTimeout(updateClipPath, 500);
    setTimeout(updateClipPath, 1000);
})();
