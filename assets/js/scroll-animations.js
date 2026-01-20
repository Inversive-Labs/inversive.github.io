// Scroll-triggered animations for sections
(function() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                // Add animation class when section comes into view
                entry.target.classList.add('animate-in');

                // Stop observing after animation (one-time animation only)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function initScrollAnimations() {
        // Get all sections except the first one (hero)
        const sections = document.querySelectorAll('.section:not(.first)');

        console.log('Scroll animations initialized for', sections.length, 'sections');

        // Observe each section
        sections.forEach(function(section) {
            // Check if section is already in viewport on page load
            const rect = section.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

            if (isInViewport) {
                // If already visible, show immediately without animation
                section.classList.add('animate-in');
            } else {
                // Otherwise, observe for scroll
                observer.observe(section);
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }
})();
