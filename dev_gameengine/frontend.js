import './../assets/scss/frontend.scss';

import { initTabs } from './frontend/tabs';
import { initRewards } from './frontend/rewards';
import { initShare } from './frontend/share';

const init = () => {
    initTabs();
    initRewards();
    initShare();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
