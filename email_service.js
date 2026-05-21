const nodemailer = require('nodemailer');
const { generateEmailHtml } = require('./html_template');
require('dotenv').config({ quiet: true});

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
        
        let html = generateEmailHtml(osIcon, timestamp, newApps, updatedApps, allApps);

        const mailOptions = {
            from: `"Noxlog Monitor" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: `🚀 [Noxlog] Changes Detected: ${newApps.length + updatedApps.length} updates`,
            html: html
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('📧 Notification email sent successfully.');
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            throw error;
        }
    }
}

module.exports = EmailService;
