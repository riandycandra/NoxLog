const { escapeHtml } = require('./utils');

function generateExportHtml(apps, timestamp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noxlog Inventory Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 40px;
            background: #f4f7f9;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #eef2f5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 { margin: 0; color: #1a73e8; font-size: 28px; }
        .meta { text-align: right; color: #666; font-size: 14px; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th {
            text-align: left;
            padding: 15px;
            background: #f8f9fa;
            border-bottom: 2px solid #eef2f5;
            color: #5f6368;
            font-weight: 600;
        }
        td { padding: 15px; border-bottom: 1px solid #f1f3f4; }
        tr:hover { background-color: #fafafa; }
        .category { color: #70757a; font-style: italic; }
        .version { font-family: monospace; background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕵️ Noxlog Inventory Report</h1>
            <div class="meta">
                <div><strong>Total Applications:</strong> ${apps.length}</div>
                <div><strong>Exported:</strong> ${timestamp}</div>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">#</th>
                    <th>Application Name</th>
                    <th>Version</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                ${apps.map((app, i) => `
                    <tr>
                        <td style="color: #bdc1c6;">${i + 1}</td>
                        <td><strong>${escapeHtml(app.name)}</strong></td>
                        <td><span class="version">${escapeHtml(app.version)}</span></td>
                        <td class="category">${escapeHtml(app.category)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
}

function generateEmailHtml(osIcon, timestamp, newApps, updatedApps, allApps) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f7f9; }
                .container { max-width: 800px; margin: 20px auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .header { border-bottom: 2px solid #eef2f5; padding-bottom: 15px; margin-bottom: 25px; }
                .header h2 { margin: 0; color: #1a73e8; font-size: 24px; display: flex; align-items: center; gap: 10px; }
                .timestamp { font-size: 13px; color: #888; margin-top: 5px; }

                .section-title { font-size: 18px; font-weight: 600; margin: 25px 0 15px; color: #202124; border-left: 4px solid #1a73e8; padding-left: 12px; }

                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
                th { background-color: #f8f9fa; color: #5f6368; text-align: left; padding: 12px; border-bottom: 2px solid #eef2f5; font-weight: 600; }
                td { padding: 12px; border-bottom: 1px solid #f1f3f4; }
                tr:nth-child(even) { background-color: #fafafa; }

                .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
                .badge-new { background-color: #e6f4ea; color: #1e8e3e; }
                .badge-update { background-color: #fef7e0; color: #f9ab00; }
                .category { color: #70757a; font-style: italic; }
                .version-old { text-decoration: line-through; color: #9aa0a6; font-size: 12px; }
                .version-new { color: #1a73e8; font-weight: bold; }

                .footer { margin-top: 40px; font-size: 12px; color: #bdc1c6; text-align: center; border-top: 1px solid #f1f3f4; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>${osIcon} Noxlog Report</h2>
                    <div class="timestamp">Scan completed on ${timestamp}</div>
                </div>

                ${newApps.length > 0 || updatedApps.length > 0 ? `
                    <div class="section-title">🔔 Recent Changes Detected</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Application Name</th>
                                <th>Version Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${newApps.map(app => `
                                <tr>
                                    <td><span class="badge badge-new">NEW</span></td>
                                    <td><b>${escapeHtml(app.name)}</b></td>
                                    <td>v${escapeHtml(app.version)}</td>
                                </tr>
                            `).join('')}
                            ${updatedApps.map(app => `
                                <tr>
                                    <td><span class="badge badge-update">UPDATE</span></td>
                                    <td><b>${escapeHtml(app.name)}</b></td>
                                    <td><span class="version-old">${escapeHtml(app.oldVersion)}</span> → <span class="version-new">${escapeHtml(app.newVersion)}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : ''}

                <div class="section-title">📦 Full Application Inventory (${allApps.length})</div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Application Name</th>
                            <th>Version</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allApps.map((app, i) => `
                            <tr>
                                <td style="color: #bdc1c6;">${i + 1}</td>
                                <td><b>${escapeHtml(app.name)}</b></td>
                                <td>${escapeHtml(app.version)}</td>
                                <td class="category">${escapeHtml(app.category)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    This is an automated security and inventory report from your system monitor.<br>
                    Generated by Noxlog Node.js Service.
                </div>
            </div>
        </body>
        </html>
        `;
}

module.exports = {
    generateExportHtml,
    generateEmailHtml
};
