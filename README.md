# CodeMentor - Interactive Learning Platform 🚀

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
</div>

## 📱 Overview

CodeMentor is an interactive learning platform designed to make coding education engaging and accessible. The platform combines gamification elements with comprehensive learning materials to create an immersive educational experience.

![App Screenshot](client/assets/screenshots/app-preview.jpg)

## ✨ Features

### 🎮 Gamified Learning Experience
- **XP System**: Earn experience points as you progress
- **Achievements**: Unlock badges and achievements
- **Streak Tracking**: Maintain your learning streak
- **Level Progression**: Level up as you learn

### 📚 Comprehensive Learning Materials
- **Structured Courses**: Well-organized learning paths
- **Progress Tracking**: Monitor your learning journey
- **Offline Access**: Learn anytime, anywhere

### 👤 User Experience
- **Personalized Dashboard**: Track your progress
- **Profile Management**: Customize your learning profile
- **Dark Mode**: Eye-friendly interface
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend
- React Native
- TypeScript
- Redux for state management
- React Navigation
- Expo

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- RESTful API

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/flklr-dev/codementor.git
```

2. Install dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables
```bash
# Create .env file in server directory
cp .env.example .env
```

4. Start the development servers
```bash
# Start the client (in client directory)
npm start

# Start the server (in server directory)
npm run dev
```

## 📁 Project Structure

```
codementor/
├── client/                 # React Native frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # App screens
│   │   ├── navigation/    # Navigation configuration
│   │   ├── services/      # API services
│   │   └── store/         # Redux store
│   └── assets/            # Images, fonts, etc.
│
└── server/                # Node.js backend
    ├── routes/            # API routes
    ├── models/            # Database models
    ├── services/          # Business logic
    ├── middleware/        # Custom middleware
    └── utils/             # Utility functions
```

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- Rate limiting
- Input validation
- CORS protection
- Data encryption

## 📊 Performance Optimizations

- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- Database indexing
- API response compression

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)

## 📞 Support

For support, email kitadrian.diocares@dorsu.edu.ph or join our 

## 📱 Download

<div align="center">
  Made with ❤️ by the Kit Adrian
</div>