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

module.exports = {
    generateExportHtml
};
