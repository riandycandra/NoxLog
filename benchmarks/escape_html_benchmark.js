const { escapeHtml } = require('../utils');

const testCases = [
    "Hello World!",
    "<script>alert('xss')</script>",
    "App & Co. <v1.0.0> \"test\"",
    "Clean string without any HTML special characters 12345"
];

function runBenchmark(iterations = 1000000) {
    console.log(`Running benchmark with ${iterations} iterations per string...`);
    const start = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
        for (const str of testCases) {
            escapeHtml(str);
        }
    }

    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1000000;
    console.log(`Total duration: ${durationMs.toFixed(2)}ms`);
    return durationMs;
}

function main() {
    // Warmup
    runBenchmark(100000);

    const results = [];
    for (let i = 0; i < 5; i++) {
        results.push(runBenchmark(1000000));
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    console.log(`\nAverage duration (5 runs of 1M iterations): ${avg.toFixed(2)}ms`);
}

main();
