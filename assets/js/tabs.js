// Manual Tabs functionality
(function() {
    function initTabs() {
        const tabLinks = document.querySelectorAll('.w-tab-link[data-w-tab]');
        const tabPanes = document.querySelectorAll('.w-tab-pane[data-w-tab]');

        if (tabLinks.length === 0 || tabPanes.length === 0) {
            console.log('No tabs found on this page');
            return;
        }

        console.log('Tabs initialized:', tabLinks.length, 'tab links,', tabPanes.length, 'tab panes');

        // Add click handlers to each tab link
        tabLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                const targetTab = this.getAttribute('data-w-tab');
                console.log('Clicked tab:', targetTab);

                // Remove active class from all tab links
                tabLinks.forEach(function(l) {
                    l.classList.remove('w--current');
                });

                // Add active class to clicked tab
                this.classList.add('w--current');

                // Hide all tab panes
                tabPanes.forEach(function(pane) {
                    pane.classList.remove('w--tab-active');
                });

                // Show the target tab pane
                const targetPane = document.querySelector('.w-tab-pane[data-w-tab="' + targetTab + '"]');
                console.log('Target pane:', targetPane);

                if (targetPane) {
                    // Small delay to ensure CSS transition works
                    setTimeout(function() {
                        targetPane.classList.add('w--tab-active');
                        console.log('Activated tab pane:', targetTab);
                    }, 10);
                } else {
                    console.error('Could not find tab pane for:', targetTab);
                }
            });
        });

        // Initialize first tab as active on page load
        if (tabLinks.length > 0) {
            // Check if there's already an active tab
            const activeTab = document.querySelector('.w-tab-link.w--current');
            const activePane = document.querySelector('.w-tab-pane.w--tab-active');

            if (!activeTab || !activePane) {
                console.log('No active tab found, initializing first tab');
                tabLinks[0].click();
            } else {
                console.log('Active tab already set');
            }
        }
    }

    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabs);
    } else {
        initTabs();
    }
})();
