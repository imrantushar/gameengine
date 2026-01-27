/**
 * Handles Tab Switching for GameEngine Frontend Dashboard
 */
export const initGameEngineTabs = () => {
    const tabButtons = document.querySelectorAll('.gameengine-tab-btn');
    const tabContents = document.querySelectorAll('.gameengine-tab-content');

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetTab = this.dataset.tab;

                // Fix: Class name changed to gameengine-active to match CSS
                tabButtons.forEach(b => b.classList.remove('gameengine-active'));
                tabContents.forEach(c => c.classList.remove('gameengine-active'));

                // Add active class
                this.classList.add('gameengine-active');
                const contentElement = document.getElementById(targetTab);
                if (contentElement) {
                    contentElement.classList.add('gameengine-active');
                }
            });
        });
    }
};