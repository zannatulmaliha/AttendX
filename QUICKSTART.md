# Quick Start Guide

## 🚀 How to Run Your React Project

### Option 1: Use the Batch Script (Easiest)
1. Double-click `run.bat` in the AttendX folder
2. Wait for installation to complete
3. Browser will open automatically at `http://localhost:5173`

### Option 2: Manual Commands
Open Command Prompt in the AttendX folder and run:

```cmd
copy style.css src\style.css
npm install
npm run dev
```

Then open your browser to: `http://localhost:5173`

---

## 📋 What Changed?

Your static HTML project is now a **reactive React application**:

### Before (Static HTML):
- 3 separate HTML files
- No interactivity
- Page reloads on navigation

### After (React):
- Single-page application
- Real-time updates when selecting classes
- Smooth navigation without page reloads
- Component-based architecture

---

## 🎯 Test the Reactive Features

1. **Navigation**: Click between tabs - notice no page reload!
2. **QR Generator**: Change the class dropdown - info updates instantly
3. **My Classes**: All class cards are rendered from state

---

## 📁 Project Structure

```
AttendX/
├── src/
│   ├── components/
│   │   └── Layout.jsx       ← Header & Navigation
│   ├── pages/
│   │   ├── QRGenerator.jsx  ← Reactive class selection
│   │   ├── MyClasses.jsx    ← Class grid
│   │   └── AttendanceReports.jsx
│   ├── App.jsx              ← React Router
│   ├── main.jsx             ← Entry point
│   └── style.css            ← Your original styles
├── index.html
├── package.json
├── vite.config.js
├── run.bat                  ← Quick start script
└── README.md
```

---

## ❓ Troubleshooting

**If you get "Cannot find module" errors:**
- Make sure you ran `npm install`
- Check that `node_modules` folder exists

**If CSS doesn't load:**
- Verify `src\style.css` exists
- Run: `copy style.css src\style.css`

**If port 5173 is busy:**
- Vite will automatically use the next available port
- Check the terminal output for the correct URL

---

## 🎨 Next Steps

Your app is now reactive! You can easily add:
- Real QR code generation (using `qrcode.react`)
- Form to add new classes
- Backend API integration
- Authentication
- Database for storing attendance

Enjoy your new React app! 🎉
