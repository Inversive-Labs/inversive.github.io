// Enhanced JavaScript for sophisticated interactions

// Navbar Dropdowns (Portfolio & Services)
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.has-dropdown');

    dropdowns.forEach(dropdown => {
        const navDropdown = dropdown.querySelector('.nav-dropdown');
        const parentLink = dropdown.querySelector('a');

        if (navDropdown && parentLink) {
            // Track click count and timing for double-tap behavior
            let lastClickTime = 0;

            // Simple click handler for all devices
            parentLink.addEventListener('click', function(e) {
                // Check if on mobile (viewport width)
                if (window.innerWidth <= 768) {
                    const currentTime = new Date().getTime();
                    const timeDiff = currentTime - lastClickTime;

                    // If clicked within 500ms (double tap), allow navigation
                    if (timeDiff < 500 && navDropdown.classList.contains('show')) {
                        // Let the link navigate to the parent page
                        return;
                    }

                    e.preventDefault();
                    e.stopPropagation();
                    lastClickTime = currentTime;

                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            const otherDropdown = other.querySelector('.nav-dropdown');
                            if (otherDropdown) {
                                otherDropdown.classList.remove('show');
                            }
                        }
                    });

                    // Toggle current dropdown
                    navDropdown.classList.toggle('show');
                }
            });

            // Handle dropdown link clicks for smooth scrolling
            const dropdownLinks = navDropdown.querySelectorAll('.nav-dropdown-link');
            dropdownLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');

                    // Only handle anchor links (starting with #) for same-page scrolling
                    if (href.includes('#')) {
                        const targetId = href.split('#')[1];
                        // Only intercept if we're on the same base page AND there's a matching element
                        const currentPath = window.location.pathname.replace(/\/$/, '');
                        const linkPath = href.split('#')[0].replace(/\/$/, '');

                        if (currentPath === linkPath && document.getElementById(targetId)) {
                            e.preventDefault();
                            const targetSection = document.getElementById(targetId);

                            // Force visibility of the section
                            targetSection.style.opacity = '1';
                            targetSection.style.transform = 'translateY(0)';
                            targetSection.style.visibility = 'visible';
                            targetSection.classList.add('reveal');

                            const yOffset = -120;
                            const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

                            window.scrollTo({
                                top: y,
                                behavior: 'smooth'
                            });
                        }
                    }

                    // Close dropdown and mobile menu after clicking
                    navDropdown.classList.remove('show');
                    const hamburger = document.querySelector('.hamburger');
                    const navLinks = document.querySelector('.nav-links');
                    if (hamburger && navLinks) {
                        hamburger.classList.remove('active');
                        navLinks.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    }
                });
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.has-dropdown')) {
            dropdowns.forEach(dropdown => {
                const navDropdown = dropdown.querySelector('.nav-dropdown');
                if (navDropdown) {
                    navDropdown.classList.remove('show');
                }
            });
        }
    });
});

// Portfolio Navigation Dropdown
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio navigation script loaded');
    
    const navButton = document.getElementById('portfolioNavButton');
    const navMenu = document.getElementById('portfolioNavMenu');
    
    console.log('NavButton:', navButton);
    console.log('NavMenu:', navMenu);
    
    if (navButton && navMenu) {
        console.log('Portfolio navigation elements found');
        
        // Toggle dropdown menu
        navButton.addEventListener('click', function(e) {
            console.log('Button clicked');
            e.stopPropagation();
            navButton.classList.toggle('active');
            navMenu.classList.toggle('show');
            console.log('Menu classes:', navMenu.className);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!navButton.contains(e.target) && !navMenu.contains(e.target)) {
                navButton.classList.remove('active');
                navMenu.classList.remove('show');
            }
        });
        
        // Handle navigation link clicks
        const navLinks = document.querySelectorAll('.portfolio-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('href').substring(1);
                scrollToSection(sectionId);
                
                // Close dropdown after navigation
                navButton.classList.remove('active');
                navMenu.classList.remove('show');
            });
        });
    } else {
        console.log('Portfolio navigation elements not found');
    }
});

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Force the section to be visible in case it hasn't been revealed yet
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        section.style.visibility = 'visible';
        section.classList.add('reveal');
        
        const yOffset = -120; // Offset to show title properly
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
    }
}

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
                // Skip dropdown parent links on mobile
                if (window.innerWidth <= 768 && item.parentElement.classList.contains('has-dropdown')) {
                    // Let the dropdown handler manage this
                    return;
                }

                if (item.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = item.getAttribute('href');
                    // Use slower scroll speed for mobile nav
                    smoothScrollTo(target, 2200);
                }

                // Don't close menu if clicking on dropdown parent
                if (!item.parentElement.classList.contains('has-dropdown')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
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