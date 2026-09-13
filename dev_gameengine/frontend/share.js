import { getText } from './i18n';

/**
 * Share buttons on unlocked achievements (`a[data-gameengine-share]`).
 *
 * Opens the device's share sheet where there is one, and copies the link
 * otherwise. Without either, the link opens as a normal link.
 */
export const initShare = () => {
    if (document.documentElement.dataset.gameengineShareReady) {
        return;
    }
    document.documentElement.dataset.gameengineShareReady = '1';

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-gameengine-share]');

        if (!link || (!navigator.share && !navigator.clipboard)) {
            return;
        }

        event.preventDefault();

        if (navigator.share) {
            navigator.share({ title: link.dataset.gameengineShare, url: link.href }).catch(() => {});
            return;
        }

        navigator.clipboard
            .writeText(link.href)
            .then(() => {
                const label = link.querySelector('[data-gameengine-share-label]');
                if (!label || label.dataset.gameengineOriginal) {
                    return;
                }
                label.dataset.gameengineOriginal = label.textContent;
                label.textContent = getText('linkCopied', 'Link copied');
                window.setTimeout(() => {
                    label.textContent = label.dataset.gameengineOriginal;
                    delete label.dataset.gameengineOriginal;
                }, 2000);
            })
            .catch(() => {});
    });
};
