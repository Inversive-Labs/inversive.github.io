// Mobile Menu Handler - Overwrites Webflow default behavior
(function() {
    function init() {
        const menuButton = document.querySelector('.w-nav-button');
        const navMenu = document.querySelector('.w-nav-menu');
        const navbar = document.querySelector('.w-nav');

        if (!menuButton || !navMenu) {
            console.log('Mobile menu elements not found');
            return;
        }

        console.log('Mobile menu initialized');

        // Remove Webflow's default click handlers by cloning the button
        const newMenuButton = menuButton.cloneNode(true);
        menuButton.parentNode.replaceChild(newMenuButton, menuButton);

        // Toggle menu on button click
        newMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = navMenu.classList.contains('w--open');

            if (isOpen) {
                navMenu.classList.remove('w--open');
                newMenuButton.classList.remove('w--open');
                navbar.classList.remove('w--open');
                document.body.style.overflow = '';
            } else {
                navMenu.classList.add('w--open');
                newMenuButton.classList.add('w--open');
                navbar.classList.add('w--open');
                document.body.style.overflow = 'hidden';
            }
        });

        // Close menu when clicking on a nav link
        const navLinks = navMenu.querySelectorAll('.navlink');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('w--open');
                newMenuButton.classList.remove('w--open');
                navbar.classList.remove('w--open');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navbar.contains(event.target);

            if (!isClickInside && navMenu.classList.contains('w--open')) {
                navMenu.classList.remove('w--open');
                newMenuButton.classList.remove('w--open');
                navbar.classList.remove('w--open');
                document.body.style.overflow = '';
            }
        });
    }

    // Wait for everything to load, including Webflow
    window.addEventListener('load', function() {
        setTimeout(init, 100);
    });
})();
