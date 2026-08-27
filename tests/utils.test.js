const { test, describe } = require('node:test');
const assert = require('node:assert');
const { escapeHtml } = require('../utils');

describe('utils.escapeHtml', () => {
    test('should return non-string input as is', () => {
        assert.strictEqual(escapeHtml(123), 123);
        assert.strictEqual(escapeHtml(null), null);
        assert.strictEqual(escapeHtml(undefined), undefined);
        const obj = {};
        assert.strictEqual(escapeHtml(obj), obj);
    });

    test('should escape HTML special characters correctly', () => {
        assert.strictEqual(escapeHtml('Hello & World'), 'Hello &amp; World');
        assert.strictEqual(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        assert.strictEqual(escapeHtml("It's a 'test'"), 'It&#039;s a &#039;test&#039;');
        assert.strictEqual(escapeHtml('No special chars'), 'No special chars');
    });
});
