const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
};

const HTML_ESCAPE_REGEX = /[&<>"']/g;

/**
 * Escapes special characters in a string for use in HTML to prevent injection attacks.
 * @param {string} str The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(HTML_ESCAPE_REGEX, (match) => HTML_ESCAPES[match]);
}

module.exports = {
    escapeHtml
};
