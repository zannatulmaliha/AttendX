# AttendX - React Teacher Dashboard

A modern, reactive teacher dashboard built with React for managing classes and attendance via QR codes.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - The app will run on `http://localhost:5173`
   - Open this URL in your browser

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
AttendX/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Shared layout with header & navigation
│   ├── pages/
│   │   ├── QRGenerator.jsx     # QR code generation page
│   │   ├── MyClasses.jsx       # Class management page
│   │   └── AttendanceReports.jsx # Reports page
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # React entry point
│   └── style.css               # Styles
├── index.html
├── package.json
└── vite.config.js
```

## ✨ Features

### Reactive Components
- **Dynamic Class Selection**: QR Generator updates in real-time when you select a class
- **State Management**: Uses React hooks (useState) for reactive data
- **Client-side Routing**: Seamless navigation with React Router
- **Interactive UI**: Buttons and forms respond to user actions

### Pages
1. **QR Generator** - Select a class and generate QR codes for attendance
2. **My Classes** - View all your classes in a grid layout
3. **Attendance Reports** - Placeholder for future reporting features

## 🎨 Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **CSS** - Styling (preserved from original design)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Notes

- The original HTML/CSS design has been fully preserved
- All styling is maintained in `src/style.css`
- The app is fully responsive and works on all screen sizes
