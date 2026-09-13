/**
 * Tabs for `[data-gameengine-tabs]` blocks, such as the member profile.
 *
 * Follows the ARIA tabs pattern: the arrow keys, Home and End move between
 * tabs, and only the selected tab is in the tab order. The server renders the
 * first panel visible and the others `hidden`.
 */
export const initTabs = () => {
    document.querySelectorAll('[data-gameengine-tabs]').forEach((root) => {
        const tabs = [...root.querySelectorAll(':scope > [role="tablist"] > [role="tab"]')];

        if (!tabs.length || root.dataset.gameengineTabsReady) {
            return;
        }
        root.dataset.gameengineTabsReady = '1';

        const select = (tab, moveFocus) => {
            tabs.forEach((item) => {
                const selected = item === tab;
                const panel = document.getElementById(item.getAttribute('aria-controls'));

                item.setAttribute('aria-selected', selected ? 'true' : 'false');
                item.tabIndex = selected ? 0 : -1;
                if (panel) {
                    panel.hidden = !selected;
                }
            });

            if (moveFocus) {
                tab.focus();
            }
        };

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => select(tab, false));

            tab.addEventListener('keydown', (event) => {
                const rtl = 'rtl' === window.getComputedStyle(root).direction;
                const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
                const back = rtl ? 'ArrowRight' : 'ArrowLeft';
                let next;

                if (event.key === forward) {
                    next = tabs[(index + 1) % tabs.length];
                } else if (event.key === back) {
                    next = tabs[(index - 1 + tabs.length) % tabs.length];
                } else if (event.key === 'Home') {
                    next = tabs[0];
                } else if (event.key === 'End') {
                    next = tabs[tabs.length - 1];
                } else {
                    return;
                }

                event.preventDefault();
                select(next, true);
            });
        });
    });
};
