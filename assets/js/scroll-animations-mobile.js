// Optimized scroll-triggered animations for mobile performance
(function() {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                     || window.innerWidth <= 768;

    // Intersection Observer options optimized for mobile
    const observerOptions = {
        root: null,
        rootMargin: isMobile ? '50px' : '0px', // Earlier trigger on mobile for smoother feel
        threshold: isMobile ? 0.05 : 0.15 // Lower threshold for mobile
    };

    // Use requestAnimationFrame for smoother animations
    let animationQueue = [];
    let isProcessing = false;

    function processAnimationQueue() {
        if (isProcessing || animationQueue.length === 0) return;

        isProcessing = true;
        requestAnimationFrame(() => {
            const element = animationQueue.shift();
            if (element) {
                element.classList.add('animate-in');
            }
            isProcessing = false;

            // Process next item if exists
            if (animationQueue.length > 0) {
                setTimeout(processAnimationQueue, isMobile ? 100 : 50); // Stagger animations
            }
        });
    }

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                // Add to animation queue instead of animating immediately
                if (!entry.target.classList.contains('animate-in')) {
                    animationQueue.push(entry.target);
                    processAnimationQueue();
                }

                // Stop observing after queuing
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function initScrollAnimations() {
        // Get all sections except the first one (hero)
        const sections = document.querySelectorAll('.section:not(.first)');

        console.log('Mobile-optimized scroll animations initialized for', sections.length, 'sections');

        // Add will-change property for mobile optimization
        if (isMobile) {
            sections.forEach(function(section) {
                // Add will-change before animation
                section.style.willChange = 'opacity, transform';

                // Remove will-change after animation completes
                section.addEventListener('transitionend', function() {
                    section.style.willChange = 'auto';
                }, { once: true });
            });
        }

        // Observe each section
        sections.forEach(function(section) {
            // Check if section is already in viewport on page load
            const rect = section.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

            if (isInViewport) {
                // If already visible, show immediately without animation on mobile
                if (isMobile) {
                    section.classList.add('animate-in', 'no-transition');
                    // Re-enable transitions after a frame
                    requestAnimationFrame(() => {
                        section.classList.remove('no-transition');
                    });
                } else {
                    section.classList.add('animate-in');
                }
            } else {
                // Otherwise, observe for scroll
                observer.observe(section);
            }
        });
    }

    // Debounce function for scroll performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Optional: Add passive scroll listener for better mobile performance
    if (isMobile) {
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateAnimations);
                ticking = true;
            }
        }

        function updateAnimations() {
            // Any additional scroll-based updates can go here
            ticking = false;
        }

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    // Handle dynamic content loading
    window.addEventListener('load', function() {
        // Reinitialize for any late-loaded content
        setTimeout(initScrollAnimations, 100);
    });
})();