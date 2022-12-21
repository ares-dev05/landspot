(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const navItems = document.querySelectorAll('[data-tab-link-id]');
        if (!navItems.length) {
            return;
        }

        for (let i = 0, node; (node = navItems[i++]);) {
            const selected = node.dataset.selected;
            if (selected) {
                const tabLinkId = node.dataset.tabLinkId;
                const link      = document.getElementById(tabLinkId);
                if (!link) return;

                if (link) {
                    const tabId              = link.dataset.tabContent;
                    const tabContent         = document.getElementById(tabId);
                    tabContent.style.display = 'flex';

                    link.classList.toggle('active', !link.classList.contains('active'));
                }
            }
        }

        const button = document.querySelector('button.navbar-toggle');
        if (!button) {
            return;
        }
        button.addEventListener('mousedown', function (event) {
            const menu = document.querySelector('div.navbar-collapse');
            if (menu.classList.contains('in')) {
                menu.classList.remove('in');
            } else {
                menu.classList.add('in');
            }
            event.stopPropagation();
        });

        const tabLinks = document.querySelectorAll('[data-toggle="tab"]');
        if (!tabLinks) {
            return;
        }

        function addNodeListEventListener(nodeList, event, fn) {
            for (let i = 0, node; (node = nodeList[i++]);) {
                node.addEventListener(event, fn, false);
            }
        }

        function openTab(event) {
            const tabLinks = document.querySelectorAll('[data-toggle="tab"]');
            for (let i = 0, node; (node = tabLinks[i++]);) {
                node.parentNode.classList.remove('active');
            }

            const tabContents = document.querySelectorAll('div.tab-pane');
            for (let i = 0, node; (node = tabContents[i++]);) {
                node.classList.remove('in');
                node.classList.remove('active');
            }

            const tabClass   = event.target.dataset.tab;
            const activeTabs = document.querySelectorAll(`div${tabClass}.tab-pane`);
            for (let i = 0, node; (node = activeTabs[i++]);) {
                node.classList.add('in');
                node.classList.add('active');
            }

            event.target.parentNode.classList.add('active');
            event.stopPropagation();
            event.preventDefault();
        }

        addNodeListEventListener(tabLinks, 'click', openTab);
    });
})();