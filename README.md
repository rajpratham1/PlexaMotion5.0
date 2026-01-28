# PlexaMotion 6.0 "Titanium Edition" 🌐🦾

> **The Next-Generation Neural Interface System for Web Browsers.**

![PlexaMotion 6.0 Badge](https://img.shields.io/badge/PlexaMotion-6.0_Titanium-00f3ff?style=for-the-badge)
![Status](https://img.shields.io/badge/System-ONLINE-0aff60?style=for-the-badge)
![Tech](https://img.shields.io/badge/Powered_By-MediaPipe-ff0077?style=for-the-badge)

**PlexaMotion 6.0** is a cutting-edge web application that transforms your device's camera into an intelligent motion controller. Completely rebuilt with a **Cyberpunk/Glassmorphism** aesthetic, it features real-time body tracking, voice AI coaching, and persistent gamification.

---

## ✨ New in Version 6.0 (Titanium Upgrade)

-   **🎨 Premium Cyber-UI**: A complete visual overhaul featuring neon glows, dynamic glass panels, scan lines, and "Titanium" design elements.
-   **🗣️ Voice AI Coach**: The system now **speaks** to you. It counts your reps during workouts, announces game events, and confirms gestures.
-   **💾 Smart Persistence**: Your high scores and total workout stats are now saved locally. Never lose your progress on refresh.
-   **🔒 Privacy-First Logic**: The camera stream automatically **terminates** when you return to the main menu, ensuring your privacy and saving battery.
-   **🧩 Modular Architecture**: The codebase has been refactored into professional ES6 modules (`camera-manager`, `ui-manager`, `audio-manager`) for stability and scalability.

---

## 🚀 Features & Modes

### 1. 🏋️ Fitness AI Coach
*Your personal holographic trainer.*
-   **Real-Time Rep Counting**: Uses skeletal tracking to count squats with precision.
-   **Audio Feedback**: "Down... Up... One!" - The AI counts out loud so you can focus on form, not the screen.
-   **Form Correction**: Detects if you aren't going low enough or if your full body isn't visible.

### 2. 🎮 Motion Game: "Motion Dodge"
*A full-body interactive arcade experience.*
-   **Body Controller**: Move your physical body left and right to control the on-screen player.
-   **High Score Saving**: compete against your best self.
-   **Voice Announcements**: "Game Over! New High Score!"

### 3. 🖐️ Gesture Control
*Touchless interface demonstration.*
-   **Swipe Navigation**: Wave your hand in the air to swipe through a futuristic image gallery.
-   **Audio Confirmation**: Hear a satisfying "Swipe" sound effect on successful detection.

### 4. 📡 Remote Sensor Link
*Multi-device synergy.*
-   **Phone-to-Laptop**: Use your phone as a remote sensor to send motion data to your laptop over PeerJS.
-   **No Server Required**: Direct peer-to-peer connection.

---

## 🛠️ Technology Stack

This project is built with vanilla web technologies, pushed to the limit:

-   **Frontend**: HTML5, **Titanium CSS** (Variables, Glassmorphism, Animations).
-   **Core Logic**: Modern JavaScript (ES6 Modules).
-   **Computer Vision**: [Google MediaPipe Pose](https://developers.google.com/mediapipe) (WASM).
-   **Audio**: Web Speech API (Synthesis).
-   **Data**: LocalStorage API.
-   **Networking**: [PeerJS](https://peerjs.com/).

---

## 📖 How to Use

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/rajpratham1/PlexaMotion5.0.git
    ```
2.  **Run Locally**:
    -   Simply open `index.html` in any modern browser (Chrome/Edge recommended).
    -   *Note: For the best experience, use a local server (e.g., Live Server in VS Code) to ensure camera permissions work correctly.*
3.  **Allow Permissions**:
    -   Click "Allow" when asked for Camera access.
    -   Click "Allow" for Location (optional, for Environment mode).

---

## 📂 Project Structure

```text
PlexaMotion 5.0/
├── index.html          # Main application interface
├── style.css           # Titanium Theme styles
├── app.js              # Main entry point
├── camera-manager.js   # MediaPipe & Webcam logic
├── ui-manager.js       # DOM manipulation & Screens
├── audio-manager.js    # Text-to-Speech logic
├── storage-manager.js  # LocalStorage persistence
├── game.js             # Canvas game logic
├── fitness.js          # Exercise analysis logic
└── gestures.js         # Hand gesture algorithm
```

---

## 🚀 Deployment

This project is static-ready. You can deploy it instantly:

1.  Push to **GitHub**.
2.  Import to **Vercel** or **Netlify**.
3.  Deploy! (No build step required).

---

<div align="center">
    <h3>System Status: 🟢 OPERATIONAL</h3>
    <p>Built with ❤️ by Raj Pratham</p>
</div>
