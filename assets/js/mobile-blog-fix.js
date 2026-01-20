// Special handling for Latest Blogs section on mobile
(function() {
    // Only run on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                     || window.innerWidth <= 768;

    if (!isMobile) return;

    function smoothBlogReveal() {
        const blogSection = document.querySelector('#latest-blogs');
        if (!blogSection) return;

        // Create a dedicated observer just for the blog section
        const blogObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    // Use RAF for smooth animation
                    requestAnimationFrame(() => {
                        // First, ensure the section is ready
                        entry.target.style.willChange = 'opacity, transform';

                        // Add the animate class with a slight delay for smoothness
                        setTimeout(() => {
                            entry.target.classList.add('animate-in');

                            // Clean up after animation
                            setTimeout(() => {
                                entry.target.style.willChange = 'auto';
                            }, 400);
                        }, 16); // One frame delay
                    });

                    blogObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '100px 0px', // Start earlier
            threshold: 0.01 // Very low threshold
        });

        // Special handling for blog section
        blogSection.classList.remove('animate-in'); // Reset if already animated

        // Check if already in view
        const rect = blogSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Already in view, show immediately
            blogSection.classList.add('animate-in');
        } else {
            // Observe for scroll
            blogObserver.observe(blogSection);
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', smoothBlogReveal);
    } else {
        smoothBlogReveal();
    }

    // Also handle dynamic content
    window.addEventListener('load', smoothBlogReveal);
})();