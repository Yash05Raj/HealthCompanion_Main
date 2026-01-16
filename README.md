# HealthCompanion 🏥

A comprehensive health management application for tracking prescriptions, managing medication reminders, and accessing medicine information through an AI-powered chatbot.

## 🌟 Features

- **Prescription Management** - Upload and track prescriptions (file upload optional)
- **Medication Reminders** - Set custom reminders with flexible scheduling
- **AI Medicine Chatbot** - Get instant medication info powered by Google Gemini AI and FDA data
- **Dashboard** - Overview of reminders and recent prescriptions
- **Secure Authentication** - Firebase-based user authentication

## 🛠️ Tech Stack

**Frontend:** React, Vite, Material-UI, React Router  
**Backend:** Firebase (Auth, Firestore, Storage), Google Gemini AI, OpenFDA API

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
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
   
   Create `.env` file:
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
   - Enable Authentication, Firestore, and Storage
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

## 📱 Usage

1. Sign up or log in
2. Upload prescriptions (file optional)
3. Set medication reminders
4. Ask the AI chatbot about medicines

## 🔒 Privacy & Security

- Secure Firebase authentication
- User-specific data access controls
- HIPAA-compliant data handling

## 👨‍💻 Author

**Yash Raj** - [@Yash05Raj](https://github.com/Yash05Raj)

## 📄 License

MIT License

---

**Disclaimer**: This app is for informational purposes only. Always consult healthcare professionals for medical advice.
