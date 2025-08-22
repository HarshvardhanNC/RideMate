# 🚗 RideMate - Student Ride Sharing Platform

> **"Share the Ride. Save the Cost."**

A web-based ride-sharing platform designed for students to coordinate auto/car sharing from college to nearby stations or areas.

## 🎯 Features

- **Ride Management**: Post rides, join others' rides, track active & past rides
- **Smart Capacity Tracking**: Color-coded status based on seats filled
- **User Dashboard**: Manage posted rides, joined rides, and ride history
- **Secure Communication**: WhatsApp contact links for ride participants
- **Real-time Notifications**: Get updates when users join/leave rides

## 🛠 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Coming soon (Node.js + Express)
- **Database**: Coming soon (MongoDB)

## 🚀 Quick Start

1. **Navigate to frontend directory**
   ```bash
   cd frontend
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
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
RideMate/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── LiveRides.jsx
│   │   │   ├── CreateRide.jsx
│   │   │   └── MyRides.jsx
│   │   ├── context/           # React Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── utils/             # Utility functions
│   │   │   ├── helpers.js
│   │   │   └── notifications.js
│   │   ├── hooks/             # Custom React hooks
│   │   ├── assets/            # Static assets
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── public/                # Public assets
│   ├── package.json           # Dependencies and scripts
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── postcss.config.js      # PostCSS configuration
│   └── vite.config.js         # Vite configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

## 🎨 UI Features

- ✅ Responsive design (mobile-friendly)
- ✅ Modern UI with Tailwind CSS
- ✅ Interactive React components
- ✅ Color-coded ride status
- ✅ Form validation and user feedback
- ✅ Toast notifications

## 📱 Core Pages

- **Home**: Landing page with app overview
- **Login/Signup**: User authentication
- **Create Ride**: Form to post new rides
- **Live Rides**: Browse and filter available rides
- **My Rides**: User dashboard and ride management

## ⚛️ React Hooks Implementation

### useState Examples:
- **Form State**: Manage form data in CreateRide component
- **Filter State**: Handle search and filter in LiveRides
- **Tab State**: Manage active tabs in MyRides

### useEffect Examples:
- **Data Fetching**: Load mock rides data on component mount
- **Authentication**: Check user session on app initialization
- **Conditional Loading**: Load user-specific data when logged in

### useContext Examples:
- **AuthContext**: Global authentication state management
- **User State**: Share user data across all components
- **Login/Logout**: Centralized authentication logic

### Custom Hooks:
- **useAuth**: Reusable authentication hook
- **Error Handling**: Ensure proper context usage

## 🔄 Development Phases

1. ✅ **Phase 1**: HTML + Tailwind CSS (Completed)
2. ✅ **Phase 2**: React + Vite conversion (Completed)
3. ✅ **Phase 3**: React Hooks implementation (Completed)
4. ⏳ **Phase 4**: Backend API and database
5. ⏳ **Phase 5**: Real-time features and deployment

## 🎯 Current Status

- ✅ **React Conversion**: Complete HTML to React conversion
- ✅ **Component Architecture**: Modular component structure
- ✅ **State Management**: React Hooks implementation
- ✅ **Routing**: React Router setup
- ✅ **Styling**: Tailwind CSS integration
- ✅ **Mock Data**: Frontend-only development with localStorage
- ⏳ **Backend Integration**: Coming soon
- ⏳ **Real Database**: Coming soon

## 🤝 Contributing

This is a learning project demonstrating React Hooks and modern frontend development practices.

## 📄 License

MIT License - feel free to use this project for learning and development! 