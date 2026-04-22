const { exec } = require('child_process');
const fs = require('fs').promises;

/**
 * AppScanner handles retrieving and formatting installed applications on macOS.
 */
class AppScanner {
    /**
     * Executes the system_profiler command and returns the raw JSON output.
     * @returns {Promise<Object>}
     */
    async getRawAppData() {
        return new Promise((resolve, reject) => {
            // SPApplicationsDataType provides info about all installed apps
            exec('system_profiler SPApplicationsDataType -json', { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
                if (error) {
                    return reject(new Error(`Execution Error: ${error.message}`));
                }
                if (stderr) {
                    console.warn(`System Profiler Warning: ${stderr}`);
                }
                try {
                    const data = JSON.parse(stdout);
                    resolve(data);
                } catch (parseError) {
                    reject(new Error(`Failed to parse JSON output: ${parseError.message}`));
                }
            });
        });
    }

    /**
     * Retrieves the list of installed applications and filters for name and version.
     * @returns {Promise<Array<{name: string, version: string}>>}
     */
    /**
     * Categorizes an application based on its name.
     * @param {string} name 
     * @returns {string}
     */
    categorizeApp(name) {
        const lowerName = name.toLowerCase();
        
        const mapping = {
            'Development': ['cursor', 'xcode', 'sublime text', 'python', 'postman', 'dbeaver', 'instruments', 'filemerge', 'create ml', 'iterm', 'terminal-notifier', 'reality composer pro', 'itermai', 'mongodb compass'],
            'DevOps & Servers': ['lens', 'orbstack', 'herd', 'redis insight', 'termius', 'forticlient', 'cloudflare warp', 'docker'],
            'Productivity & Office': ['microsoft', 'office', 'excel', 'word', 'powerpoint', 'onenote', 'outlook', 'teams', 'onedrive', 'pages', 'numbers', 'keynote', 'pdfgear', 'windows app', 'dbeaver', 'dia'],
            'Web Browsers': ['chrome', 'firefox', 'tor browser', 'safari'],
            'Communication': ['zoom', 'discord', 'slack', 'teams', 'whatsapp', 'telegram'],
            'Entertainment & Media': ['steam', 'warthunder', 'spotify', 'vlc', 'daVinci', 'bmdpanel'],
            'System & Utilities': ['cleanmymac', 'autoclicker', 'mouse jiggler', 'lightshot', 'rar extractor', 'xprotect', 'mrt', 'updater', 'reporter', 'devicehelper', 'sync', 'crash reporter', 'software update']
        };

        for (const [category, keywords] of Object.entries(mapping)) {
            if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
                return category;
            }
        }

        return 'Miscellaneous';
    }

    /**
     * Retrieves the list of installed applications, filters system apps, and categorizes them.
     * @returns {Promise<Array<{name: string, version: string, category: string}>>}
     */
    async getInstalledApps() {
        try {
            const rawData = await this.getRawAppData();
            const apps = rawData.SPApplicationsDataType || [];

            return apps
                .filter(app => {
                    const hasPath = app.path && !app.path.startsWith('/System/');
                    const hasVersion = app.version && app.version !== 'Unknown';
                    return hasPath && hasVersion;
                })
                .map(app => ({
                    name: app._name || 'Unknown',
                    version: app.version,
                    category: this.categorizeApp(app._name || '')
                }))
                .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        } catch (error) {
            throw new Error(`Failed to retrieve application list: ${error.message}`);
        }
    }

    /**
     * Groups applications by category.
     * @param {Array} apps 
     * @returns {Object}
     */
    groupAppsByCategory(apps) {
        return apps.reduce((acc, app) => {
            if (!acc[app.category]) {
                acc[app.category] = [];
            }
            acc[app.category].push({ name: app.name, version: app.version });
            return acc;
        }, {});
    }

    /**
     * Compares current apps with a previous grouped list.
     * @param {Array} currentApps 
     * @param {Object} previousGrouped 
     * @returns {Object} { newApps: Array, updatedApps: Array, hasChanges: boolean }
     */
    compareWithPrevious(currentApps, previousData) {
        // Handle both old flat structure and new metadata-inclusive structure
        const previousGrouped = previousData.apps || previousData;

        // Flatten previous grouped data for easier comparison
        const previousApps = {};
        Object.values(previousGrouped).forEach(apps => {
            if (Array.isArray(apps)) {
                apps.forEach(app => {
                    previousApps[app.name] = app.version;
                });
            }
        });

        const newApps = [];
        const updatedApps = [];

        currentApps.forEach(app => {
            const oldVersion = previousApps[app.name];
            if (!oldVersion) {
                newApps.push(app);
            } else if (oldVersion !== app.version) {
                updatedApps.push({
                    name: app.name,
                    oldVersion: oldVersion,
                    newVersion: app.version
                });
            }
        });

        return {
            newApps,
            updatedApps,
            hasChanges: newApps.length > 0 || updatedApps.length > 0
        };
    }
    async saveToFile(filePath, data) {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            throw new Error(`Failed to save results to ${filePath}: ${error.message}`);
        }
    }
}

module.exports = AppScanner;
