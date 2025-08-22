# 🚗 RideMate - React Version

> **"Share the Ride. Save the Cost."** - Now built with React + Vite!

A modern React-based ride-sharing platform designed for students to coordinate auto/car sharing from college to nearby stations or areas.

## 🎯 Features

- **Modern React Architecture**: Built with React 18, Vite, and React Router
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication System**: Login/signup with context-based state management
- **Ride Management**: Post rides, join others' rides, track active & past rides
- **Smart Status Tracking**: Color-coded status based on seats filled
- **User Dashboard**: Manage posted rides, joined rides, and ride history
- **Real-time Notifications**: Toast notifications for user feedback
- **WhatsApp Integration**: Direct contact links for ride participants

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Icons**: Font Awesome 6
- **Build Tool**: Vite
- **Package Manager**: npm

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. **Navigate to the React project directory**
   ```bash
   cd frontend-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

## 📁 Project Structure

```
frontend-react/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation component
│   │   └── Footer.jsx      # Footer component
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page
│   │   ├── Login.jsx       # Login page
│   │   ├── Signup.jsx      # Signup page
│   │   ├── LiveRides.jsx   # Browse rides page
│   │   ├── CreateRide.jsx  # Post new ride page
│   │   └── MyRides.jsx     # User dashboard page
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx # Authentication context
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   │   ├── helpers.js      # Helper functions
│   │   └── notifications.js # Notification system
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── vite.config.js          # Vite configuration
```

## 🎨 UI Features

- ✅ Responsive design (mobile-friendly)
- ✅ Modern UI with Tailwind CSS
- ✅ Interactive components with hover effects
- ✅ Color-coded ride status indicators
- ✅ Loading states and animations
- ✅ Form validation and error handling
- ✅ Toast notifications
- ✅ Tabbed interfaces
- ✅ Card-based layouts

## 📱 Core Pages

- **Home**: Landing page with hero section and features
- **Login**: User authentication with form validation
- **Signup**: User registration with password confirmation
- **Live Rides**: Browse and filter available rides
- **Create Ride**: Form to post new rides with validation
- **My Rides**: User dashboard with tabs for posted/joined rides

## 🔄 Development Phases

1. ✅ **Phase 1**: Responsive UI with Tailwind CSS (Original)
2. ✅ **Phase 2**: React integration and interactivity (Current)
3. ⏳ **Phase 3**: Backend API and database
4. ⏳ **Phase 4**: Authentication and real-time features
5. ⏳ **Phase 5**: Deployment and CI/CD

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom color scheme:
- Primary: Blue (#3B82F6)
- Secondary: Green (#10B981)
- Accent: Yellow (#F59E0B)
- Danger: Red (#EF4444)

### Environment Variables
Create a `.env` file in the root directory for any environment-specific variables:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

This is a learning project following a progressive development approach. Each phase builds upon the previous one.

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🔗 Migration Notes

This React version is a complete rewrite of the original HTML/CSS/JS version with the following improvements:

- **Component-based architecture** for better maintainability
- **React Router** for client-side navigation
- **Context API** for state management
- **Custom hooks** for reusable logic
- **Modern build system** with Vite
- **Better developer experience** with hot reload
- **Type-safe props** (can be enhanced with TypeScript)
- **Modular CSS** with Tailwind utilities

The original functionality has been preserved while making the codebase more scalable and maintainable.
