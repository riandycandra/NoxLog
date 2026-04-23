/**
 * Escapes special characters in a string for use in HTML to prevent injection attacks.
 * @param {string} str The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = {
    escapeHtml
};
