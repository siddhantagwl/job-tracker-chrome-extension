# 📌 Job Tracker – A Simple Chrome Extension

A lightweight Chrome extension that lets me **save job applications directly into a Google Sheet**, with a clean UI, autosave, and one-click tracking.

I designed this to remove the pain of remembering:

- Which jobs I applied to and when
- Which version of my CV was used
- Which job board it came from
- What notes or red flags I noticed

Built fully in the browser — **no backend required**.

---

## 🚀 Features

### ✔ One-click job saving
Pulls the current page URL and pre-fills Job Title + Job Board automatically.

### ✔ Autosave drafts
The extension remembers all fields **per tab**, so you never lose notes if the popup closes.

### ✔ Google Sheets integration
Data is saved using a tiny Apps Script webhook into your personal sheet.

### ✔ Clean, minimal UI
Carefully designed popup using a dark theme, smooth interactions, loading states, and clear grouping.

### ✔ Keyboard- and speed-friendly
Focus stays on input fields, lightweight, no lag, no heavy frameworks.

### ✔ Custom icons
icon set (16/48/128px).

---

## 🧩 Tech Stack

- Chrome Extensions Manifest V3
- HTML / CSS / Vanilla JavaScript
- Chrome Storage API (`chrome.storage.local`)
- Chrome Tabs API (`chrome.tabs`)
- Google Apps Script Web App (POST endpoint)
- Google Sheets as the database
- Dark UI theme using CSS variables

**No frameworks. No libraries. Small, fast, clean.**

---

## 📐 Architecture Overview

### **Popup (UI)**
Handles:
- Form inputs
- Autosave
- Validation
- Spinner + loading state
- Posting data to webhook

### **Apps Script (Backend Webhook)**
Handles:
- Receiving JSON via POST
- Appending a row to Google Sheet
- Sanitizing values
- Returning success/failure

### **Storage**
Used only for draft form data.

## 🧑‍💻 Author

**Siddhant Agarwal**, Software Engineer

## 🪪 License

MIT License.
Feel free to fork, modify, and build your own version.

