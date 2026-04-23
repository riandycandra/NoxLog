const { exec } = require('child_process');
const fs = require('fs').promises;

/**
 * AppScanner handles retrieving and formatting installed applications on macOS and Windows.
 */
class AppScanner {
    /**
     * Executes the system_profiler command and returns the raw JSON output.
     * @returns {Promise<Object>}
     */
    async getRawAppData() {
        const isWin = process.platform === 'win32';
        // On Windows, we query the registry for installed programs.
        // On macOS, we use system_profiler.
        const command = isWin
            ? `powershell -Command "Get-ItemProperty HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object { $_.DisplayName -ne $null } | Select-Object @{Name='_name';Expression={$_.DisplayName}}, @{Name='version';Expression={$_.DisplayVersion}}, @{Name='path';Expression={$_.InstallLocation}} | ConvertTo-Json"`
            : 'system_profiler SPApplicationsDataType -json';

        return new Promise((resolve, reject) => {
            exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
                if (error) {
                    return reject(new Error(`Execution Error: ${error.message}`));
                }
                if (stderr) {
                    console.warn(`Scanner Warning: ${stderr}`);
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
        const mapping = {
            'Development': [/\bcursor\b/i, /\bvscode\b/i, /visual studio code/i, /sublime text/i, /\bpython\b/i, /\bpostman\b/i, /\bdbeaver\b/i, /\biterm\b/i, /\bterminal\b/i, /\bgit\b/i, /\bfork\b/i, /\bmitmproxy\b/i, /cheat engine/i, /\bmongodb\b/i, /\bsql\b/i, /\bmysql\b/i, /\bpostgre/i, /\bnode\.js\b/i, /\bwsl\b/i, /subsystem for linux/i, /\bzoc\b/i, /\bantigravity\b/i, /\bxcode\b/i, /\binstruments\b/i, /\bfilemerge\b/i, /\bcreate ml\b/i, /reality composer/i],
            'DevOps & Servers': [/\blens\b/i, /\borbstack\b/i, /\bherd\b/i, /\bredis\b/i, /\btermius\b/i, /\bforticlient\b/i, /cloudflare warp/i, /\bdocker\b/i, /\bkubernetes\b/i, /\baws\b/i, /\bazure\b/i, /\bvpn\b/i, /\beonvpn\b/i],
            'Games': [/\bsteam\b/i, /war thunder/i, /warthunder/i, /epic games/i, /riot games/i, /\bvalorant\b/i, /league of legends/i, /\bminecraft\b/i, /\bgaming\b/i, /\bfantech\b/i, /\bea app\b/i, /\borigin\b/i, /\buplay\b/i, /\bubisoft\b/i],
            'Web Browsers': [/\bchrome\b/i, /\bfirefox\b/i, /tor browser/i, /\bsafari\b/i, /\bedge\b/i, /\bbrave\b/i, /\bopera\b/i],
            'Communication': [/\bzoom\b/i, /\bdiscord\b/i, /\bslack\b/i, /\bteams\b/i, /\bwhatsapp\b/i, /\btelegram\b/i, /\bskype\b/i, /\bviber\b/i],
            'Entertainment & Media': [/\bspotify\b/i, /\bvlc\b/i, /media player/i, /\bdavinci\b/i, /\bbmdpanel\b/i, /obs studio/i, /\bhandbrake\b/i, /\bplex\b/i, /\bnetflix\b/i, /\byoutube\b/i],
            'Productivity & Office': [/microsoft 365/i, /microsoft office/i, /\bword\b/i, /\bexcel\b/i, /\bpowerpoint\b/i, /\bonenote\b/i, /\boutlook\b/i, /\bonedrive\b/i, /\bpages\b/i, /\bnumbers\b/i, /\bkeynote\b/i, /\bpdfgear\b/i, /\bacrobat\b/i, /adobe reader/i, /\bbitwarden\b/i, /\bnotion\b/i, /\btrello\b/i, /\bobsidian\b/i, /\boffice\b/i],
            'System & Utilities': [/\bnvidia\b/i, /\bintel\b/i, /\brealtek\b/i, /killer ethernet/i, /\bdriver\b/i, /\bupdate\b/i, /\bruntime\b/i, /\bframework\b/i, /\bredistributable\b/i, /visual c\+\+/i, /\.net/i, /\bcleanmymac\b/i, /\bautoclicker\b/i, /mouse jiggler/i, /\blightshot\b/i, /rar extractor/i, /\bwinrar\b/i, /\b7-zip\b/i, /\bxprotect\b/i, /\bmrt\b/i, /\bupdater\b/i, /\breporter\b/i, /\bdevicehelper\b/i, /\bsync\b/i, /\bnitro\b/i, /care center/i, /\bcopilot\b/i, /windows app/i, /\bmaintenance\b/i]
        };

        for (const [category, patterns] of Object.entries(mapping)) {
            if (patterns.some(pattern => pattern.test(name))) {
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
            const isWin = process.platform === 'win32';
            const apps = isWin ? (Array.isArray(rawData) ? rawData : [rawData]) : (rawData.SPApplicationsDataType || []);

            return apps
                .filter(app => {
                    if (isWin) {
                        return app._name; // Windows apps must have a name
                    }
                    const hasPath = app.path && !app.path.startsWith('/System/');
                    const hasVersion = app.version && app.version !== 'Unknown';
                    return hasPath && hasVersion;
                })
                .map(app => ({
                    name: app._name || 'Unknown',
                    version: app.version || 'Unknown',
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
