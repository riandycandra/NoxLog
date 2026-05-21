const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
    if (request === 'xlsx') {
        return {
            write: () => Buffer.from('mock excel data'),
            utils: {
                json_to_sheet: () => ({}),
                book_new: () => ({}),
                book_append_sheet: () => {}
            }
        };
    }
    return originalRequire.apply(this, arguments);
};

const { test, describe, mock } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const AppExporter = require('../exporter');

describe('AppExporter.export format validation', () => {
    test('should allow valid format xlsx', async () => {
        const exporter = new AppExporter();
        mock.method(exporter, 'toExcel', async () => {});
        const result = await exporter.export('xlsx', []);
        assert.ok(result.endsWith('.xlsx'));
        assert.strictEqual(exporter.toExcel.mock.calls.length, 1);
    });

    test('should allow valid format md', async () => {
        const exporter = new AppExporter();
        mock.method(exporter, 'toMarkdown', async () => {});
        const result = await exporter.export('md', []);
        assert.ok(result.endsWith('.md'));
        assert.strictEqual(exporter.toMarkdown.mock.calls.length, 1);
    });

    test('should allow valid format html', async () => {
        const exporter = new AppExporter();
        mock.method(exporter, 'toHtml', async () => {});
        const result = await exporter.export('html', []);
        assert.ok(result.endsWith('.html'));
        assert.strictEqual(exporter.toHtml.mock.calls.length, 1);
    });

    test('should throw error for invalid format', async () => {
        const exporter = new AppExporter();
        await assert.rejects(
            async () => {
                await exporter.export('pdf', []);
            },
            (err) => {
                assert.strictEqual(err.message, 'Unsupported export format: pdf');
                return true;
            }
        );
    });

    test('should prevent path traversal via format argument', async () => {
        const exporter = new AppExporter();
        const maliciousFormat = 'md; touch /tmp/pwned';
        await assert.rejects(
            async () => {
                await exporter.export(maliciousFormat, []);
            },
            (err) => {
                assert.strictEqual(err.message, `Unsupported export format: ${maliciousFormat}`);
                return true;
            }
        );

        const pathTraversal = '../../../etc/passwd';
        await assert.rejects(
            async () => {
                await exporter.export(pathTraversal, []);
            },
            (err) => {
                assert.strictEqual(err.message, `Unsupported export format: ${pathTraversal}`);
                return true;
            }
        );
    });
});
