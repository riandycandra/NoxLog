const AppExporter = require('../exporter');
const fs = require('fs').promises;
const path = require('path');

async function runBenchmark(numApps = 1000) {
    const exporter = new AppExporter();
    const apps = [];
    for (let i = 0; i < numApps; i++) {
        apps.push({
            name: `App ${i}`,
            version: `1.${i}.0`,
            category: 'Miscellaneous'
        });
    }

    const filename = `benchmark_output_${numApps}.xlsx`;

    console.log(`Running benchmark with ${numApps} apps...`);

    const start = process.hrtime.bigint();

    // We want to measure how much it blocks the event loop
    // But for now let's just measure execution time of the call
    await exporter.toExcel(filename, apps);

    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1000000;

    console.log(`Duration: ${durationMs.toFixed(2)}ms`);

    // Cleanup
    try {
        await fs.unlink(filename);
    } catch (e) {
        // Ignore
    }

    return durationMs;
}

async function main() {
    const results = [];
    // Warmup
    await runBenchmark(100);

    for (let i = 0; i < 5; i++) {
        const duration = await runBenchmark(5000);
        results.push(duration);
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    console.log(`\nAverage Duration for 5000 apps: ${avg.toFixed(2)}ms`);
}

main().catch(console.error);
