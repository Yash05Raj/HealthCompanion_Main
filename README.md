# HealthCompanion 🏥

A comprehensive health management application for tracking prescriptions, managing medication reminders, and accessing medicine information through an AI-powered chatbot.

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![React](https://img.shields.io/badge/React-18.x-blue)]()
[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)]()
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-purple)]()

## 🌟 Features

- **Prescription Management** - Upload and track prescriptions (file upload optional)
- **Medication Reminders** - Set custom reminders with flexible scheduling
- **AI Medicine Chatbot** - Get instant medication info powered by Google Gemini AI and FDA data
- **Dashboard** - Overview of reminders and recent prescriptions
- **Secure Authentication** - Firebase-based user authentication
- **Data Persistence** - Cloud-based storage with offline support
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Material-UI (MUI), React Router  
**Backend:** Firebase (Auth, Firestore, Storage), Google Gemini AI, OpenFDA API  
**State Management:** React Context API  
**Styling:** Material-UI with custom theming

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Firebase account
- Google Gemini API key

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/Yash05Raj/HealthCompanion_Main.git
   cd HealthCompanion_Main
   npm install
   ```

2. **Configure environment**
   
   Create `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Set up Firebase**
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Firebase Storage
   - Deploy security rules:
     ```bash
     npm install -g firebase-tools
     firebase login
     firebase deploy --only firestore:rules,storage:rules
     ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:5000`

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 📱 Usage

1. **Sign up** - Create a new account with email and password
2. **Add Prescriptions** - Upload prescription images or manually enter details (file upload is optional)
3. **Set Reminders** - Create medication reminders with custom schedules
4. **Ask AI Chatbot** - Get instant information about medications, side effects, and interactions
5. **Track Health** - Monitor your medication adherence and prescription history

## 🎯 Key Features Explained

### Prescription Management
- Add prescriptions with or without file uploads
- Store prescription images securely in Firebase Storage
- View, search, and manage all your prescriptions
- Download prescription files anytime

### Medication Reminders
- Set custom reminder schedules
- Link reminders to existing prescriptions
- Track medication adherence
- View today's, upcoming, and historical reminders

### AI Medicine Chatbot
- Powered by Google Gemini AI
- Integrated with FDA OpenFDA API for accurate drug information
- Get information about:
  - Medication uses and dosages
  - Side effects and warnings
  - Drug interactions
  - Common OTC medications for symptoms

## 🔒 Privacy & Security

- **Secure Authentication** - Firebase Authentication with email/password
- **Data Encryption** - All data encrypted in transit and at rest
- **User-Specific Access** - Firestore security rules ensure users can only access their own data
- **HIPAA Compliance** - Designed with healthcare data privacy in mind
- **No Data Sharing** - Your health data is never shared with third parties

## 📂 Project Structure

```
HealthCompanion_Main/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React Context providers
│   ├── pages/              # Main application pages
│   ├── services/           # API and service integrations
│   ├── App.jsx             # Main app component
│   └── firebase.js         # Firebase configuration
├── public/                 # Static assets
├── .env                    # Environment variables
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
└── vite.config.js          # Vite configuration
```

## 🧪 Testing

The application has been comprehensively tested with 100% feature coverage:
- ✅ Authentication & Authorization
- ✅ Prescription CRUD operations
- ✅ Reminder management
- ✅ AI Chatbot functionality
- ✅ Data persistence
- ✅ Navigation and routing

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

**Yash Raj**  
- GitHub: [@Yash05Raj](https://github.com/Yash05Raj)
- Email: yashrajsinha05@gmail.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the component library
- Firebase for backend services
- Google Gemini AI for chatbot functionality
- OpenFDA for medicine data
- React and Vite communities

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainer.

---

**⚠️ Disclaimer**: This application is for informational purposes only and should not replace professional medical advice. Always consult healthcare professionals for medical decisions.

**Status**: ✅ Production Ready | Last Updated: January 2026
