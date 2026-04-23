const { test, describe } = require('node:test');
const assert = require('node:assert');
const AppScanner = require('../scanner');

describe('AppScanner.compareWithPrevious', () => {
    const scanner = new AppScanner();

    test('should return no changes when current and previous apps are identical', () => {
        const currentApps = [
            { name: 'App1', version: '1.0.0', category: 'Misc' },
            { name: 'App2', version: '2.1.0', category: 'Misc' }
        ];
        const previousData = {
            'Misc': [
                { name: 'App1', version: '1.0.0' },
                { name: 'App2', version: '2.1.0' }
            ]
        };

        const result = scanner.compareWithPrevious(currentApps, previousData);

        assert.strictEqual(result.hasChanges, false);
        assert.strictEqual(result.newApps.length, 0);
        assert.strictEqual(result.updatedApps.length, 0);
    });

    test('should detect new apps', () => {
        const currentApps = [
            { name: 'App1', version: '1.0.0', category: 'Misc' },
            { name: 'App2', version: '2.1.0', category: 'Misc' }
        ];
        const previousData = {
            'Misc': [
                { name: 'App1', version: '1.0.0' }
            ]
        };

        const result = scanner.compareWithPrevious(currentApps, previousData);

        assert.strictEqual(result.hasChanges, true);
        assert.strictEqual(result.newApps.length, 1);
        assert.strictEqual(result.newApps[0].name, 'App2');
        assert.strictEqual(result.updatedApps.length, 0);
    });

    test('should detect updated app versions', () => {
        const currentApps = [
            { name: 'App1', version: '1.1.0', category: 'Misc' }
        ];
        const previousData = {
            'Misc': [
                { name: 'App1', version: '1.0.0' }
            ]
        };

        const result = scanner.compareWithPrevious(currentApps, previousData);

        assert.strictEqual(result.hasChanges, true);
        assert.strictEqual(result.newApps.length, 0);
        assert.strictEqual(result.updatedApps.length, 1);
        assert.strictEqual(result.updatedApps[0].name, 'App1');
        assert.strictEqual(result.updatedApps[0].oldVersion, '1.0.0');
        assert.strictEqual(result.updatedApps[0].newVersion, '1.1.0');
    });

    test('should handle new metadata-inclusive structure (previousData.apps)', () => {
        const currentApps = [
            { name: 'App1', version: '1.0.0', category: 'Misc' }
        ];
        const previousData = {
            apps: {
                'Misc': [
                    { name: 'App1', version: '1.0.0' }
                ]
            },
            metadata: { scanTime: '2023-01-01' }
        };

        const result = scanner.compareWithPrevious(currentApps, previousData);

        assert.strictEqual(result.hasChanges, false);
    });

    test('should handle empty inputs', () => {
        const result = scanner.compareWithPrevious([], {});
        assert.strictEqual(result.hasChanges, false);
        assert.strictEqual(result.newApps.length, 0);
        assert.strictEqual(result.updatedApps.length, 0);
    });

    test('should detect both new and updated apps', () => {
        const currentApps = [
            { name: 'App1', version: '1.1.0', category: 'Misc' },
            { name: 'App3', version: '3.0.0', category: 'Misc' }
        ];
        const previousData = {
            'Misc': [
                { name: 'App1', version: '1.0.0' },
                { name: 'App2', version: '2.0.0' }
            ]
        };

        const result = scanner.compareWithPrevious(currentApps, previousData);

        assert.strictEqual(result.hasChanges, true);
        assert.strictEqual(result.newApps.length, 1);
        assert.strictEqual(result.newApps[0].name, 'App3');
        assert.strictEqual(result.updatedApps.length, 1);
        assert.strictEqual(result.updatedApps[0].name, 'App1');
    });
});
