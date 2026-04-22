const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        const port = parseInt(process.env.EMAIL_PORT || '587');
        
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: port,
            // secure: true for port 465, false for other ports (like 587)
            secure: port === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                // Helps with some mail server certificate issues
                rejectUnauthorized: false
            }
        });
    }

    /**
     * Sends a beautiful HTML email with application changes and full inventory.
     * @param {string} to 
     * @param {Object} changes 
     * @param {Array} allApps
     */
    async sendNotification(to, changes, allApps = []) {
        const { newApps, updatedApps } = changes;
        const timestamp = new Date().toLocaleString();
        
        // Detect OS for the logo
        const osIcons = {
            'darwin': '',
            'win32': '🪟'
        };
        const osIcon = osIcons[process.platform] || '🖥';
        
        let html = `
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
                    <h2>${osIcon} AppSentinel Report</h2>
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
                                    <td><b>${app.name}</b></td>
                                    <td>v${app.version}</td>
                                </tr>
                            `).join('')}
                            ${updatedApps.map(app => `
                                <tr>
                                    <td><span class="badge badge-update">UPDATE</span></td>
                                    <td><b>${app.name}</b></td>
                                    <td><span class="version-old">${app.oldVersion}</span> → <span class="version-new">${app.newVersion}</span></td>
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
                                <td><b>${app.name}</b></td>
                                <td>${app.version}</td>
                                <td class="category">${app.category}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    This is an automated security and inventory report from your system monitor.<br>
                    Generated by AppSentinel Node.js Service.
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"AppSentinel Monitor" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: `🚀 [AppSentinel] Changes Detected: ${newApps.length + updatedApps.length} updates`,
            html: html
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('📧 Premium notification email sent successfully.');
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            throw error;
        }
    }
}

module.exports = EmailService;
