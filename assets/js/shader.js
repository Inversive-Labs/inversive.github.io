// Canvas Bezier Paths Background — scroll-morphing with velocity awareness
// Replaces React/Framer Motion SVG with pure Canvas 2D for per-frame curve morphing
(function() {
    var PATH_COUNT = 36;
    var POSITIONS = [1, -1];

    // Depth layers: far (faint, slow) → near (opaque, responsive)
    var LAYERS = [
        { start: 0,  end: 9,  timeScale: 0.6, morphScale: 0.4 },
        { start: 9,  end: 18, timeScale: 0.8, morphScale: 0.65 },
        { start: 18, end: 27, timeScale: 1.0, morphScale: 0.85 },
        { start: 27, end: 36, timeScale: 1.2, morphScale: 1.0 }
    ];

    // --- State ---
    var canvas, ctx;
    var paths = [];
    var w = 0, h = 0, cw = 0, ch = 0;
    var isMobile = false;

    // Coordinate mapping (SVG viewBox 0 0 696 316, xMidYMid slice)
    var coordScale = 1, coordOffX = 0, coordOffY = 0;

    // Scroll
    var targetScroll = 0;
    var smoothScroll = 0;
    var scrollVelocity = 0;
    var lastTargetScroll = 0;

    // Time
    var time = 0;
    var lastTimestamp = 0;
    var warmUpStart = 0;

    // Reusable dash array (avoid allocation per frame)
    var dashArr = [0, 0];

    // --- Path generation ---
    function getLayer(i) {
        for (var l = 0; l < LAYERS.length; l++) {
            if (i < LAYERS[l].end) return l;
        }
        return LAYERS.length - 1;
    }

    function generatePaths() {
        paths = [];
        for (var pi = 0; pi < POSITIONS.length; pi++) {
            var pos = POSITIONS[pi];
            for (var i = 0; i < PATH_COUNT; i++) {
                var layer = getLayer(i);
                var duration = 20 + seededRandom(i * 17 + pos * 3) * 10;
                paths.push({
                    index: i,
                    position: pos,
                    layer: layer,
                    strokeOpacity: 0.025 + i * 0.008,
                    strokeWidth: 0.5 + i * 0.03,
                    duration: duration,
                    // Phase offset: stagger like original -(i * 0.0301)
                    phaseOffset: (i * 0.0301) / duration,
                    seed: i * 0.17 + pos * 2.3,
                    totalLength: 0,
                    // 14 floats: 7 (x,y) pairs for M + C + C
                    base: new Float64Array(14),
                    current: new Float64Array(14)
                });
            }
        }

        // Compute base control points
        for (var p = 0; p < paths.length; p++) {
            var path = paths[p];
            var i = path.index;
            var pos = path.position;
            var b = path.base;

            // M
            b[0] = -(380 - i * 5 * pos);
            b[1] = -(189 + i * 6);
            // C1 cp1 (same as M)
            b[2] = b[0];
            b[3] = b[1];
            // C1 cp2
            b[4] = -(312 - i * 5 * pos);
            b[5] = 216 - i * 6;
            // C1 end
            b[6] = 152 - i * 5 * pos;
            b[7] = 343 - i * 6;
            // C2 cp1
            b[8] = 616 - i * 5 * pos;
            b[9] = 470 - i * 6;
            // C2 cp2 (same as end)
            b[10] = 684 - i * 5 * pos;
            b[11] = 875 - i * 6;
            // C2 end
            b[12] = b[10];
            b[13] = b[11];

            // Copy to current
            for (var k = 0; k < 14; k++) path.current[k] = b[k];
        }
    }

    // Deterministic pseudo-random from seed
    function seededRandom(seed) {
        var x = Math.sin(seed * 9301 + 49297) * 49297;
        return x - Math.floor(x);
    }

    // --- Measure path lengths via hidden SVG ---
    function measurePathLengths() {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        var pathEl = document.createElementNS(ns, 'path');
        svg.appendChild(pathEl);
        svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
        document.body.appendChild(svg);

        for (var p = 0; p < paths.length; p++) {
            var b = paths[p].base;
            pathEl.setAttribute('d',
                'M' + b[0] + ' ' + b[1] +
                'C' + b[2] + ' ' + b[3] + ' ' + b[4] + ' ' + b[5] + ' ' + b[6] + ' ' + b[7] +
                'C' + b[8] + ' ' + b[9] + ' ' + b[10] + ' ' + b[11] + ' ' + b[12] + ' ' + b[13]
            );
            paths[p].totalLength = pathEl.getTotalLength();
        }

        document.body.removeChild(svg);
    }

    // --- Canvas setup ---
    function createCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'shader-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
        document.body.insertBefore(canvas, document.body.firstChild);
        ctx = canvas.getContext('2d');
    }

    function resize() {
        var newW = window.innerWidth;
        var newH = window.innerHeight;
        isMobile = newW <= 768;

        // On mobile, the URL bar show/hide changes innerHeight by ~50-100px.
        // Setting canvas.width or .height clears the entire canvas, causing a
        // blank flash until the next rAF redraws. Skip resize when only the
        // height changed by a small amount (typical URL-bar toggle).
        var widthChanged = newW !== w;
        var heightDelta = Math.abs(newH - h);
        if (!widthChanged && isMobile && heightDelta > 0 && heightDelta < 150 && w > 0) {
            return;
        }

        w = newW;
        h = newH;

        // Render at full CSS pixel resolution for crisp lines
        cw = w;
        ch = h;
        canvas.width = cw;
        canvas.height = ch;

        // xMidYMid slice: scale to cover viewport, center both axes
        var scaleX = cw / 696;
        var scaleY = ch / 316;
        coordScale = Math.max(scaleX, scaleY);
        coordOffX = (cw - 696 * coordScale) / 2;
        coordOffY = (ch - 316 * coordScale) / 2;

        // Re-render immediately so the canvas is never blank after clearing
        render();
    }

    // --- Easing ---
    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    // --- PathLength animation ---
    function getDrawState(path, time) {
        // Cycle phase 0..1
        var cycleTime = time / path.duration + path.phaseOffset;
        var phase = cycleTime - Math.floor(cycleTime);

        // times: [0, 0.2, 0.8, 1.0]
        var progress, opacity;
        if (phase < 0.2) {
            var t = easeInOut(phase / 0.2);
            progress = t;
            opacity = t * t * path.strokeOpacity;
        } else if (phase < 0.8) {
            progress = 1.0;
            opacity = path.strokeOpacity;
        } else {
            var t = easeInOut((phase - 0.8) / 0.2);
            progress = 1.0 - t;
            opacity = (1.0 - t) * (1.0 - t) * path.strokeOpacity;
        }

        return { progress: progress, opacity: opacity };
    }

    // --- Scroll morphing ---
    function morphPath(path, scrollProgress, velocity, morphTime) {
        var i = path.index;
        var layerDef = LAYERS[path.layer];
        var layerFactor = layerDef.morphScale;
        var seed = path.seed;
        var t = morphTime * layerDef.timeScale;
        var s = scrollProgress;
        var b = path.base;
        var c = path.current;

        // Layered breathing waves — different scroll frequencies for organic non-repetition
        var breath1 = Math.sin(s * Math.PI * 2.0 + seed) * layerFactor;
        var breath2 = Math.sin(s * Math.PI * 3.0 + seed * 1.7 + t * 0.08) * layerFactor * 0.5;
        var breath3 = Math.cos(s * Math.PI * 1.5 + seed * 0.6) * layerFactor * 0.3;

        // Velocity turbulence (subtle)
        var velFactor = Math.min(Math.abs(velocity) * 0.008, 0.6);
        var turb = Math.sin(t * 1.5 + seed * 3.1) * velFactor;

        // Morph amplitude scales with path index (outer = bigger morph)
        var ampX = 15 + i * 0.8;
        var ampY = 12 + i * 0.6;

        // Start point: minimal drift (keeps field anchored)
        c[0] = b[0] + breath1 * ampX * 0.08;
        c[1] = b[1] + breath2 * ampY * 0.06;

        // C1 cp1: track start
        c[2] = c[0];
        c[3] = c[1];

        // C1 cp2: bends the first curve half
        var dx4 = (breath1 + breath3) * ampX * 0.4 + turb * ampX * 0.1;
        var dy4 = breath2 * ampY * 0.5 + turb * ampY * 0.06;
        c[4] = b[4] + dx4;
        c[5] = b[5] + dy4;

        // C2 cp1: bends the second curve half
        var dx8 = (breath1 * 0.6 + breath3) * ampX * 0.35;
        var dy8 = breath2 * ampY * 0.4 + turb * ampY * 0.06;
        c[8] = b[8] + dx8;
        c[9] = b[9] + dy8;

        // Mid-junction: average of neighbors for smooth tangent continuity
        c[6] = b[6] + (dx4 + dx8) * 0.35;
        c[7] = b[7] + (dy4 + dy8) * 0.35;

        // C2 cp2: minimal drift
        c[10] = b[10] + breath3 * ampX * 0.1;
        c[11] = b[11] + breath1 * ampY * 0.08;

        // End: track cp2
        c[12] = c[10];
        c[13] = c[11];
    }

    // --- Coordinate transform ---
    function tx(svgX) { return svgX * coordScale + coordOffX; }
    function ty(svgY) { return svgY * coordScale + coordOffY; }

    // --- Render ---
    function render() {
        ctx.clearRect(0, 0, cw, ch);

        // Scroll state
        var totalHeight = document.documentElement.scrollHeight;
        var maxScroll = Math.max(totalHeight - h, 1);
        var scrollProgress = smoothScroll / maxScroll;

        // Warm-up fade (0 → 1 over 2.5s)
        var elapsed = (performance.now() - warmUpStart) / 1000;
        var warmUp = Math.min(elapsed / 2.5, 1.0);
        warmUp = 1 - Math.pow(1 - warmUp, 3); // ease-out cubic

        // Velocity opacity boost
        var velAbs = Math.min(Math.abs(scrollVelocity) * 0.012, 1.0);
        var opacityBoost = 1.0 + velAbs * 0.25;

        // Depth fade: slightly dim paths at bottom of page
        var depthFade = 1.0 - scrollProgress * 0.2;

        ctx.lineCap = 'round';

        for (var p = 0; p < paths.length; p++) {
            var path = paths[p];

            // Morph control points
            morphPath(path, scrollProgress, scrollVelocity, time);

            // PathLength draw state
            var drawState = getDrawState(path, time);
            if (drawState.opacity < 0.001) continue; // skip invisible

            var finalOpacity = drawState.opacity * warmUp * opacityBoost * depthFade;
            if (finalOpacity < 0.001) continue;

            // Dash for partial draw — scale by coordScale since totalLength is in SVG units
            var scaledLen = path.totalLength * coordScale;
            var visLen = drawState.progress * scaledLen;
            var gapLen = scaledLen + 10;
            dashArr[0] = visLen;
            dashArr[1] = gapLen;

            ctx.setLineDash(dashArr);
            ctx.lineDashOffset = 0;

            // Subtle color shift with velocity: grey → slightly cool
            var colorShift = velAbs * 10;
            var r = 128;
            var g = Math.round(128 + colorShift * 0.3);
            var b = Math.round(128 + colorShift);

            ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + finalOpacity + ')';
            ctx.lineWidth = Math.max(path.strokeWidth * coordScale, 0.5);

            // Draw the morphed bezier
            var c = path.current;
            ctx.beginPath();
            ctx.moveTo(tx(c[0]), ty(c[1]));
            ctx.bezierCurveTo(tx(c[2]), ty(c[3]), tx(c[4]), ty(c[5]), tx(c[6]), ty(c[7]));
            ctx.bezierCurveTo(tx(c[8]), ty(c[9]), tx(c[10]), ty(c[11]), tx(c[12]), ty(c[13]));
            ctx.stroke();
        }

        // Reset dash
        ctx.setLineDash([]);
    }

    // --- Main loop ---
    function frame(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        var dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
        lastTimestamp = timestamp;

        // Advance time
        time += dt;

        // Smooth scroll
        smoothScroll += (targetScroll - smoothScroll) * 0.06;

        // Velocity (px/s, smoothed)
        var rawVel = (targetScroll - lastTargetScroll) / Math.max(dt, 0.001);
        lastTargetScroll = targetScroll;
        scrollVelocity += (rawVel - scrollVelocity) * 0.08;

        // Render
        render();

        requestAnimationFrame(frame);
    }

    // --- Init ---
    function init() {
        createCanvas();
        generatePaths();
        measurePathLengths();
        resize();

        window.addEventListener('resize', resize);
        window.addEventListener('scroll', function() {
            targetScroll = window.pageYOffset || document.documentElement.scrollTop;
        }, { passive: true });

        // Visibility: pause when tab hidden
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) lastTimestamp = 0;
        });

        warmUpStart = performance.now();
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
