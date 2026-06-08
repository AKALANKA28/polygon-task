# 🔷 Polygon Task

A production-grade React Native task management application built for **Polygon**. Features role-based access (Admin/Employee), full CRUD task management, beautiful animations, and a premium design system.

## 📱 Screenshots

| Login | Admin Dashboard | Task List | Employee View |
|-------|----------------|-----------|---------------|
| _Gradient login with form validation_ | _Animated stats + recent tasks_ | _Search, filter, FlashList_ | _Status updates with haptics_ |

## 🛠 Tech Stack

### Mobile (Frontend)
| Package | Version |
|---------|---------|
| Expo SDK | ~55.0.0 |
| React Native | 0.83.x |
| TypeScript | ^5.9.0 |
| NativeWind | ^4.0.1 |
| TailwindCSS | ^3.4.0 |
| Redux Toolkit | ^2.2.0 |
| React Redux | ^9.1.0 |
| Expo Router | ~55.0.0 |
| React Native Reanimated | ^4.2.0 |
| Axios | ^1.7.0 |
| React Hook Form + Zod | Latest |
| date-fns | ^3.6.0 |
| FlashList | ^1.6.4 |

### Backend
| Package | Version |
|---------|---------|
| Node.js | ^20.x |
| Express | ^4.19.0 |
| MySQL2 | ^3.9.0 |
| JWT | ^9.0.0 |
| bcryptjs | ^2.4.3 |

## 📋 Prerequisites

- **Node.js** >= 20.x
- **Expo CLI** (`npm install -g expo-cli`)
- **MySQL** >= 8.0
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd polygon-task
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

**Mobile** — Create `.env` in project root:
```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api
```

**Backend** — Copy and edit:
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

## 🗄 Database Setup

1. Start MySQL server
2. Run the schema:
```bash
mysql -u root -p < database/schema.sql
```
3. This creates the `polygon_tasks` database with seed data

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@polygon.com | password123 |
| Employee | jane@polygon.com | password123 |
| Employee | john@polygon.com | password123 |

## ▶️ Running the App

### Start the backend
```bash
cd backend
npm run dev
```

### Start the mobile app
```bash
npm start
```

Then press `a` for Android or `i` for iOS.

## 📦 Building APK

```bash
npx eas build --platform android --profile preview
```

## 🎨 Design System

The app uses a comprehensive design token system:
- **Colors**: Polygon brand palette (magenta, purple, red, orange, amber)
- **Typography**: Poppins font family (5 weights)
- **Spacing**: 4px-based scale
- **Shadows**: Brand-colored elevation system
- **Animations**: Reanimated v3 spring/timing animations

## ✅ Features

- [x] JWT login/logout with AsyncStorage session persistence
- [x] Role-based routing (Admin/Employee)
- [x] Admin: Create, view, edit, delete tasks
- [x] Admin: Assign tasks to specific employees
- [x] Admin: Employee progress dashboard with visual progress bars
- [x] Employee: View assigned tasks
- [x] Employee: Update task status with haptic feedback
- [x] Employee: Profile management
- [x] Real-time search with debounce
- [x] Status + priority filtering
- [x] Pull-to-refresh on all lists
- [x] Animated stat cards with count-up
- [x] Skeleton loading states
- [x] Empty states with illustrations
- [x] Toast notifications
- [x] Form validation (Zod + React Hook Form)
- [x] Keyboard avoiding on all form screens
- [x] Safe area insets on all screens

## 📝 Git History

```
feat(init): scaffold project structure with Expo Router, Redux, NativeWind
feat(db): add MySQL schema, seed data, and backend Express setup
feat(auth): implement JWT login/logout with AsyncStorage session persistence
feat(admin-tasks): add full task CRUD API routes and admin task screens
feat(employee): implement employee task view and status update flow
feat(ui): build design system — Button, Card, Badge, Input, EmptyState components
feat(animations): add Reanimated transitions, count-up stats, skeleton loading
feat(search-filter): implement task search and status/priority filtering
feat(profile): complete employee profile edit screen and admin employee list
chore(build): finalize README documentation
```

## 📄 License

Private — Polygon Internal Use Only
