# 🔷 Polygon Task

A production-grade React Native task management application built for **Polygon**. Features role-based access (Admin/Employee), full CRUD task management, beautiful animations, and a premium design system.

## 📱 Screenshots

| Login | Admin Dashboard | Task List | Employee View |
|-------|----------------|-----------|---------------|
| _Gradient login with form validation_ | _Animated stats + recent tasks_ | _Search, filter, FlashList_ | _Status updates with haptics_ |

## 🚀 Project Overview
Polygon Task is a cross-platform mobile application designed to streamline internal task assignment and tracking. 
It supports real-time filtering, employee-specific dashboards, and administrative oversight capabilities, wrapped in a polished, responsive user interface.

## 🛠 Tech Stack

### Mobile (Frontend)
| Package | Version |
|---------|---------|
| Expo SDK | ~55.0.0 |
| React Native | 0.83.x |
| TypeScript | ^5.9.0 |
| NativeWind | ^4.0.1 |
| Redux Toolkit | ^2.2.0 |
| Expo Router | ~55.0.0 |
| React Native Reanimated | ^4.2.0 |

### Backend
| Package | Version |
|---------|---------|
| Node.js | ^20.x |
| Express | ^4.19.0 |
| MySQL2 | ^3.9.0 |
| JWT | ^9.0.0 |

## 📋 Prerequisites

- **Node.js** >= 20.x
- **Expo CLI** (`npm install -g expo-cli`)
- **MySQL** >= 8.0
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)

## 🚀 Installation Steps

### 1. Clone the repository
```bash
git clone <repository-url>
cd polygon-task
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

## ⚙️ Environment Configuration

**Mobile** — Create `.env` in project root:
```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api
```

**Backend** — Copy and edit `.env.example`:
```bash
cp backend/.env.example backend/.env
```
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=polygon_tasks
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

## 🗄 Database Setup Instructions

1. Start your MySQL server.
2. Run the provided schema to create tables and seed initial data:
```bash
mysql -u root -p < database/schema.sql
```
3. This creates the `polygon_tasks` database with seed data.

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@polygon.com | password123 |
| Employee | jane@polygon.com | password123 |
| Employee | john@polygon.com | password123 |

## ▶️ Build & Run Instructions

### Local Development

**Start the backend:**
```bash
cd backend
npm run dev
```

**Start the mobile app:**
```bash
npm start
```
Press `a` for Android or `i` for iOS to launch the simulator.

### Production Build

**Build APK for Android:**
```bash
npx eas build --platform android --profile preview
```

**Build for iOS:**
```bash
npx eas build --platform ios --profile preview
```

## 🎨 Design System

- **Colors**: Polygon brand palette (magenta, purple, red, orange, amber)
- **Typography**: Poppins font family (5 weights)
- **Animations**: Reanimated v3 spring/timing animations
- Responsive spacing and safe area insets on all screens

## 📄 License

Private — Polygon Internal Use Only
