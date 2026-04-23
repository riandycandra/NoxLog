const AppScanner = require('./scanner');
const EmailService = require('./email_service');
const fs = require('fs').promises;
require('dotenv').config({ quiet: true});

async function main() {
    const scanner = new AppScanner();
    const emailService = new EmailService();
    const AppExporter = require('./exporter');
    const exporter = new AppExporter();
    
    const outputFilename = 'installed_apps.json';

    // Parse arguments
    const args = process.argv.slice(2);
    const outputArgIndex = args.indexOf('-o');
    let exportFormat = null;
    if (outputArgIndex !== -1 && args[outputArgIndex + 1]) {
        exportFormat = args[outputArgIndex + 1].toLowerCase();
    }

    console.log('🔍 Noxlog is scanning for installed applications...');

    try {
        const apps = await scanner.getInstalledApps();
        
        // Handle export if requested
        if (exportFormat) {
            console.log(`\n📤 Exporting results as ${exportFormat.toUpperCase()}...`);
            try {
                const exportedFile = await exporter.export(exportFormat, apps);
                console.log(`✅ Export successful: ${exportedFile}`);
            } catch (exportError) {
                console.error(`❌ Export failed: ${exportError.message}`);
            }
        }
        
        // Try to load previous data
        let previousData = {};
        try {
            const fileContent = await fs.readFile(outputFilename, 'utf8');
            previousData = JSON.parse(fileContent);
        } catch (e) {
            console.log('ℹ️ No previous scan found. This is the first run.');
        }

        // Compare
        const { newApps, updatedApps, hasChanges } = scanner.compareWithPrevious(apps, previousData);
        
        const lastScanned = new Date().toLocaleString();
        const groupedApps = scanner.groupAppsByCategory(apps);
        const outputData = {
            lastScanned,
            totalApps: apps.length,
            apps: groupedApps
        };

        // Always save to file to update lastScanned timestamp (helps monitor cronjob)
        await scanner.saveToFile(outputFilename, outputData);

        if (hasChanges) {
            console.log(`\n🔔 Changes detected at ${lastScanned}!`);
            if (newApps.length > 0) console.log(`   🆕 ${newApps.length} new apps`);
            if (updatedApps.length > 0) console.log(`   🆙 ${updatedApps.length} updates`);

            // Output to formatted table
            console.table(apps);
            console.log(`\n💾 Results updated in: ${outputFilename}`);

            // Send Email
            if (process.env.EMAIL_USER && process.env.EMAIL_TO) {
                await emailService.sendNotification(process.env.EMAIL_TO, { newApps, updatedApps }, apps);
            } else {
                console.warn('⚠️ Email configuration missing. Skipping email notification.');
            }
        } else {
            console.log(`\n✅ No changes detected since last scan. Timestamp updated: ${lastScanned}`);
        }

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();
