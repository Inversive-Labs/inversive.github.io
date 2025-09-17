// Enhanced JavaScript for sophisticated interactions

// Scroll progress indicator
function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.querySelector('.scroll-progress').style.width = scrollPercent + '%';
}

// Intersection Observer for section reveals
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            
            // Stagger animation for service cards
            if (entry.target.classList.contains('services-grid')) {
                const cards = entry.target.querySelectorAll('.service-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('reveal');
                    }, index * 150);
                });
            }
            
            // Stagger animation for CVE cards
            if (entry.target.classList.contains('cve-grid')) {
                const cards = entry.target.querySelectorAll('.service-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('reveal');
                    }, index * 200);
                });
            }
            
            // Stagger animation for team members
            if (entry.target.classList.contains('team-grid')) {
                const members = entry.target.querySelectorAll('.team-member');
                members.forEach((member, index) => {
                    setTimeout(() => {
                        member.classList.add('reveal');
                    }, index * 300);
                });
            }
        }
    });
}, observerOptions);

// Enhanced header scroll effect
function handleScroll() {
    const header = document.querySelector('header');
    
    // Add scrolled class for background change
    if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    updateScrollProgress();
}

// Enhanced smooth scrolling with better easing
function smoothScrollTo(target, duration = 1800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const headerHeight = document.querySelector('header').offsetHeight;
    const targetPosition = targetElement.offsetTop - headerHeight - 30;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let start = null;

    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuart(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Smoother easing function - quartic ease-in-out
    function easeInOutQuart(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    }

    requestAnimationFrame(animation);
}

// Enhanced navigation
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const scrollPos = window.pageYOffset + 200;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}


// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    if (hamburger && navLinks) {
        // Toggle menu
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking on nav items
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (item.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = item.getAttribute('href');
                    // Use slower scroll speed for mobile nav
                    smoothScrollTo(target, 2200);
                }
                
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Handle CTA button smooth scroll with faster speed for CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            // Use much faster scroll for CTA buttons
            const duration = this.classList.contains('cta-button') ? 400 : 1800;
            smoothScrollTo(target, duration);
        });
    });

    // Observe sections and grids
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
    
    document.querySelectorAll('.services-grid, .cve-grid, .team-grid').forEach(grid => {
        observer.observe(grid);
    });

    // Blog post animations
    const blogPosts = document.querySelectorAll('.blog-post-preview');
    if (blogPosts.length > 0) {
        blogPosts.forEach((post, index) => {
            // Add staggered delay for initial animation
            setTimeout(() => {
                post.classList.add('reveal');
            }, 800 + (index * 150));
            
            // Also observe for scroll-based animation
            observer.observe(post);
        });
    }
});

// Event listeners
window.addEventListener('scroll', handleScroll);
window.addEventListener('scroll', updateActiveNav);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateScrollProgress();
    updateActiveNav();
});