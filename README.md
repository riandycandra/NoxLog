# 🕵️ Noxlog

**Noxlog** is a silent, universal application monitoring and version logging service. It scans your installed software, categorizes them by purpose, and sends beautifully styled HTML email reports whenever a change is detected (new installs or version updates).

Designed to be run as a recurring background service (cronjob), Noxlog ensures you always have a clear, automated pulse on your software environment without any manual effort.

---

## ✨ Key Features

- 🔍 **Intelligent Scanning**: Retrieves all non-system applications and their precise versions.
- 🏷️ **Auto-Categorization**: Automatically groups apps into categories like *Development*, *DevOps*, *Productivity*, and *Communication*.
- 🔔 **Delta Notifications**: Only sends email reports when changes are detected (reduces inbox noise).
- 📧 **Premium HTML Reports**: Receive sleek, modern email reports with status badges and full inventory tables.
- 🌐 **OS-Aware Branding**: Automatically adapts its visual identity (logos/icons) based on the host operating system.
- 💾 **Historical Tracking**: Maintains a local `installed_apps.json` to track state changes over time.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- macOS (Universal support coming soon)

### 2. Installation
You can install Noxlog locally for development or globally to use the CLI command anywhere.

**Global Installation (Recommended):**
```bash
npm install -g @riandycandra/noxlog
```

**Local Development:**
```bash
git clone https://github.com/riandycandra/Noxlog.git
cd noxlog
npm install
```

### 3. Configuration
Copy the environment template and fill in your SMTP details:
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
- `EMAIL_HOST`: Your SMTP server (e.g., smtp.gmail.com)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your app-specific password
- `EMAIL_TO`: Recipient address

### 4. Usage
Run a manual scan using the global command:
```bash
noxlog
```

Export results to a specific format:
```bash
# Export to Excel
noxlog -o xlsx

# Export to Markdown
noxlog -o md

# Export to HTML
noxlog -o html
```

---

## 🛠️ Roadmap (TODO)

- [x] **Windows Support**: Implement `wmic` or `Get-ItemProperty` scanners for Windows environments.
- [ ] **Linux Support**: Add support for `dpkg`, `rpm`, and `snap` package managers.
- [ ] **Dashboard UI**: A local web interface to visualize software trends over time.
- [x] **Export Options**: Support for Excel, Markdown, or HTML export formats.
- [ ] **Slack/Discord Integration**: Send change alerts directly to chat channels.
- [ ] **Dependency Audit**: Integrate security vulnerability scanning for installed versions.
- [x] **Global CLI**: Convert the project into an NPM package to support `npx noxlog` or global `noxlog` commands.

---

## 📄 License
This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---
*Generated with 🕵️ by Noxlog.*
