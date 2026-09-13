/**
 * Data and strings the server localizes for the frontend script
 * (GameEngineGlobal, see includes/assets.php).
 */
export const getGlobal = () => window.GameEngineGlobal || {};

/**
 * A localized string, or the fallback when the page did not provide it.
 *
 * @param {string} key      Key in GameEngineGlobal.i18n.
 * @param {string} fallback English text.
 * @return {string} The string.
 */
export const getText = (key, fallback) => {
    const strings = getGlobal().i18n || {};
    return strings[key] || fallback;
};

/**
 * Put a value into a translated "%s"/"%d" template.
 *
 * @param {string}        template Template with one placeholder.
 * @param {string|number} value    Value to insert.
 * @return {string} The filled string.
 */
export const fill = (template, value) => String(template).replace(/%(?:\d+\$)?[sd]/, String(value));

/**
 * Format a number for the page's language.
 *
 * @param {number|string} value Number.
 * @return {string} Formatted number.
 */
export const formatNumber = (value) => {
    const number = Number(value);
    if (Number.isNaN(number)) {
        return String(value);
    }
    try {
        return number.toLocaleString(document.documentElement.lang || undefined);
    } catch (error) {
        return number.toLocaleString();
    }
};
