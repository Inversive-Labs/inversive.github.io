// Clip path animations to body bounds
(function() {
    var lastClipPath = '';

    function updateClipPath() {
        var body = document.body;
        var rect = body.getBoundingClientRect();

        // Calculate clip path based on body position
        var top = Math.max(0, rect.top);
        var left = Math.max(0, rect.left);
        var right = Math.max(0, window.innerWidth - rect.right);
        var bottom = Math.max(0, window.innerHeight - rect.bottom);

        var clipPath = 'inset(' + top + 'px ' + right + 'px ' + bottom + 'px ' + left + 'px)';

        // Skip if clip path hasn't changed (avoids unnecessary repaints)
        if (clipPath === lastClipPath) return;
        lastClipPath = clipPath;

        var shaderCanvas = document.getElementById('shader-canvas');
        var instantPaths = document.getElementById('instant-paths');

        if (shaderCanvas) {
            shaderCanvas.style.clipPath = clipPath;
            shaderCanvas.style.webkitClipPath = clipPath;
        }
        if (instantPaths) {
            instantPaths.style.clipPath = clipPath;
            instantPaths.style.webkitClipPath = clipPath;
        }
    }

    // Use MutationObserver to wait for shader-canvas to be created
    var observer = new MutationObserver(function() {
        var shaderCanvas = document.getElementById('shader-canvas');
        if (shaderCanvas) {
            updateClipPath();
        }
    });

    function init() {
        updateClipPath();
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Update on load, resize, and orientation change only — NOT on scroll.
    // During normal scrolling the clip is always inset(0 0 0 0); updating it
    // every scroll tick forces layout + repaint on the fixed canvas, which
    // causes flickering on mobile GPUs.
    window.addEventListener('load', updateClipPath);
    window.addEventListener('resize', updateClipPath);
    window.addEventListener('orientationchange', updateClipPath);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setTimeout(updateClipPath, 100);
    setTimeout(updateClipPath, 500);
    setTimeout(updateClipPath, 1000);
})();
