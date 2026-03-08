// Scroll-responsive Aurora Background
// Flowing gradient blobs that shift with scroll for continuous Framer-like depth
(function() {
    var canvas = document.createElement('canvas');
    canvas.id = 'aurora-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var scrollY = 0;
    var targetScrollY = 0;
    var time = 0;
    var w = 0, h = 0;
    var isMobile = window.innerWidth <= 768;

    // Aurora blobs with subtle colors matching the theme
    var blobs = [
        // Blue glow (top-right)
        { baseX: 0.75, baseY: 0.12, radius: 0.55, speed: 0.1, parallax: 0.06,
          r: 100, g: 140, b: 220, opacity: 0.12, driftX: 100, driftY: 50, phase: 0 },
        // Purple glow (left-center)
        { baseX: 0.1, baseY: 0.5, radius: 0.5, speed: 0.07, parallax: 0.14,
          r: 140, g: 80, b: 200, opacity: 0.08, driftX: 70, driftY: 80, phase: 2.1 },
        // Teal glow (bottom-right)
        { baseX: 0.85, baseY: 0.7, radius: 0.45, speed: 0.12, parallax: 0.18,
          r: 60, g: 180, b: 160, opacity: 0.07, driftX: 80, driftY: 60, phase: 4.2 },
        // Faint blue (center)
        { baseX: 0.4, baseY: 0.35, radius: 0.4, speed: 0.08, parallax: 0.1,
          r: 80, g: 120, b: 200, opacity: 0.05, driftX: 90, driftY: 70, phase: 1.5 },
        // Deep purple (far bottom-left)
        { baseX: 0.15, baseY: 1.0, radius: 0.5, speed: 0.05, parallax: 0.22,
          r: 120, g: 60, b: 180, opacity: 0.06, driftX: 60, driftY: 40, phase: 3.3 },
        // Subtle teal (top-left)
        { baseX: 0.25, baseY: 0.05, radius: 0.35, speed: 0.15, parallax: 0.04,
          r: 50, g: 160, b: 140, opacity: 0.05, driftX: 50, driftY: 60, phase: 5.0 },
    ];

    if (isMobile) {
        blobs = blobs.slice(0, 4);
        blobs.forEach(function(b) {
            b.opacity *= 0.6;
            b.driftX *= 0.4;
            b.driftY *= 0.4;
        });
    }

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        isMobile = w <= 768;
        var scale = isMobile ? 0.3 : 0.4;
        canvas.width = Math.floor(w * scale);
        canvas.height = Math.floor(h * scale);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
    }

    function draw() {
        // Smooth scroll interpolation for fluid motion
        scrollY += (targetScrollY - scrollY) * 0.06;

        var cw = canvas.width;
        var ch = canvas.height;
        var scaleX = cw / w;
        var scaleY = ch / h;

        ctx.clearRect(0, 0, cw, ch);

        // Page scroll progress (0-1)
        var totalHeight = document.documentElement.scrollHeight;
        var scrollProgress = targetScrollY / Math.max(totalHeight - h, 1);

        for (var i = 0; i < blobs.length; i++) {
            var blob = blobs[i];

            // Position: base + organic drift + scroll parallax
            var cx = blob.baseX * cw + Math.sin(time * blob.speed + blob.phase) * blob.driftX * scaleX;
            var cy = blob.baseY * ch + Math.cos(time * blob.speed * 0.7 + blob.phase) * blob.driftY * scaleY;

            // Scroll effect: shift blobs at different rates for parallax depth
            var scrollShift = scrollY * blob.parallax * scaleY;
            cy -= scrollShift;

            // Slowly rotate position based on scroll for organic feel
            var rotAngle = scrollProgress * Math.PI * 0.5 * (i % 2 === 0 ? 1 : -1);
            var rotCx = cx + Math.cos(rotAngle + blob.phase) * 30 * scaleX;
            var rotCy = cy + Math.sin(rotAngle + blob.phase) * 20 * scaleY;

            var r = blob.radius * Math.min(cw, ch);

            var gradient = ctx.createRadialGradient(rotCx, rotCy, 0, rotCx, rotCy, r);
            var color = 'rgba(' + blob.r + ',' + blob.g + ',' + blob.b + ',';
            gradient.addColorStop(0, color + blob.opacity + ')');
            gradient.addColorStop(0.3, color + (blob.opacity * 0.6) + ')');
            gradient.addColorStop(0.7, color + (blob.opacity * 0.15) + ')');
            gradient.addColorStop(1, color + '0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, cw, ch);
        }

        time += 0.004;
        requestAnimationFrame(draw);
    }

    window.addEventListener('scroll', function() {
        targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
    }, { passive: true });

    window.addEventListener('resize', resize);
    resize();
    draw();
})();
