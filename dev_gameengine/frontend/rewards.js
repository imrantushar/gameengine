import { fill, formatNumber, getGlobal, getText } from './i18n';

/**
 * Redeem buttons in the rewards catalogue ([gameengine_rewards]).
 *
 * The server decides everything (stock, per-member limits, balance); the
 * script only posts the redemption and shows the answer on the card it came
 * from.
 */
export const initRewards = () => {
    if (document.documentElement.dataset.gameengineRewardsReady) {
        return;
    }
    document.documentElement.dataset.gameengineRewardsReady = '1';

    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-gameengine-rewards] button[data-reward-id]');

        if (!button || button.disabled) {
            return;
        }

        const catalog = button.closest('[data-gameengine-rewards]');
        const card = button.closest('[data-reward-card]');
        const notice = catalog.querySelector('[data-gameengine-notice]');
        const label = button.textContent.trim();
        const { rest_url: restUrl = '', namespace = '', nonce = '' } = getGlobal();

        const showNotice = (message, ok) => {
            if (!notice) {
                return;
            }
            notice.className = `gameengine-notice gameengine-notice--${ok ? 'success' : 'error'}`;
            notice.textContent = message;
            notice.hidden = !message;
        };

        button.disabled = true;
        button.textContent = getText('redeeming', 'Redeeming…');

        window
            .fetch(`${restUrl}${namespace}rewards/${encodeURIComponent(button.dataset.rewardId)}/redeem`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
            })
            .then((response) => response.json().then((body) => ({ ok: response.ok, body: body || {} })))
            .then(({ ok, body }) => {
                showNotice(body.message || '', ok);

                if (!ok) {
                    button.disabled = false;
                    button.textContent = label;
                    return;
                }

                // The server checks balance, stock and per-member limits on every
                // redemption, so the button comes back for the next one unless
                // the reward just sold out.
                button.textContent = getText('redeemed', 'Redeemed');
                let soldOut = false;

                const balance = catalog.querySelector('[data-gameengine-balance]');
                if (balance && typeof body.remaining_points !== 'undefined') {
                    balance.textContent = fill(getText('points', '%s points'), formatNumber(body.remaining_points));
                }

                const stock = card && card.querySelector('[data-stock-label]');
                if (stock && typeof body.remaining_stock !== 'undefined' && Number(body.remaining_stock) >= 0) {
                    if (0 === Number(body.remaining_stock)) {
                        stock.remove();
                        button.textContent = getText('outOfStock', 'Out of Stock');
                        soldOut = true;
                    } else {
                        stock.textContent = fill(getText('stockLeft', '%d left'), body.remaining_stock);
                    }
                }

                if (!soldOut) {
                    window.setTimeout(() => {
                        button.disabled = false;
                        button.textContent = label;
                    }, 2000);
                }
            })
            .catch(() => {
                button.disabled = false;
                button.textContent = label;
                showNotice(getText('error', 'Something went wrong. Please try again.'), false);
            });
    });
};
