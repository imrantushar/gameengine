/**
 * Handles Tab Switching for Gamify Frontend Dashboard
 */
export const initGamifyTabs = () => {
    const tabButtons = document.querySelectorAll('.gamify-tab-btn');
    const tabContents = document.querySelectorAll('.gamify-tab-content');

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetTab = this.dataset.tab;

                // Remove active class from all buttons and contents
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to current button and target content
                this.classList.add('active');
                const contentElement = document.getElementById(targetTab);
                if (contentElement) {
                    contentElement.classList.add('active');
                }
            });
        });
    }
};