# PlexaMotion 7.0 "Ultimate Edition" 🌐🦾🧘

> **The Next-Generation Neural Interface System for Web Browsers.**

![PlexaMotion 7.0 Badge](https://img.shields.io/badge/PlexaMotion-7.0_Ultimate-ff0077?style=for-the-badge)
![Status](https://img.shields.io/badge/System-ONLINE-0aff60?style=for-the-badge)
![Tech](https://img.shields.io/badge/Powered_By-MediaPipe-00f3ff?style=for-the-badge)

**PlexaMotion 7.0** is a cutting-edge web application that transforms your device's camera into an intelligent motion controller. Now featuring **PWA support**, **Synthesized Sound Effects**, and a new **Yoga Master Mode**.

---

## ✨ New in Version 7.0

-   **🧘 Yoga Master Mode**: A new AI coach that guides you through poses. Challenge yourself to hold the **"Warrior II"** pose for 10 seconds with real-time form correction.
-   **🔊 Sci-Fi Sound Effects**: Fully synthesized audio interface. Hear futuristic chirps, clicks, and confirmations generated dynamically by the Web Audio API—no external files needed.
-   **📱 Progressive Web App (PWA)**: Install PlexaMotion on your phone or desktop! Works offline and launches instantly from your home screen.
-   **🎨 Dynamic Mobile UI**: Fully responsive design with stacked layouts and optimized typography for mobile devices.

---

## 🚀 Features & Modes

### 1. 🏋️ Fitness AI Coach
*Your personal holographic trainer.*
-   **Real-Time Rep Counting**: Uses skeletal tracking to count squats with precision.
-   **Audio Feedback**: "Down... Up... One!" - The AI counts out loud so you can focus on form.

### 2. 🎮 Motion Game: "Motion Dodge"
*A full-body interactive arcade experience.*
-   **Body Controller**: Move your physical body left and right to control the on-screen player.
-   **High Score Saving**: Tracks your best runs locally.

### 3. 🖐️ Gesture Control
*Touchless interface demonstration.*
-   **Swipe Navigation**: Wave your hand in the air to swipe through a futuristic image gallery.

### 4. 🧘 Yoga Master (NEW)
*Balance and Focus.*
-   **Pose Detection**: Detects widely recognized static poses.
-   **Balance Timer**: Hold the pose perfectly to fill the progress bar.

### 5. 📡 Remote Sensor Link
*Multi-device synergy.*
-   **Phone-to-Laptop**: Use your phone as a remote sensor to send motion data to your laptop over PeerJS.

---

## 🛠️ Technology Stack

-   **Frontend**: HTML5, **Titanium CSS** (Variables, Glassmorphism, Animations).
-   **Core Logic**: Modern JavaScript (ES6 Modules).
-   **Computer Vision**: [Google MediaPipe Pose](https://developers.google.com/mediapipe) (WASM).
-   **Audio**: Web Speech API (Voice) + Web Audio API (SFX).
-   **Data**: LocalStorage API & Service Workers (Offline Caching).
-   **Networking**: [PeerJS](https://peerjs.com/).

---

## 📖 How to Use

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/rajpratham1/PlexaMotion5.0.git
    ```
2.  **Run Locally**:
    -   Simply open `index.html` in any modern browser.
    -   **To Install**: Look for the "Install" icon in your browser address bar (Desktop) or "Add to Home Screen" (Mobile).
3.  **Allow Permissions**:
    -   Click "Allow" when asked for Camera access.

---

## 📂 Project Structure

```text
PlexaMotion 7.0/
├── index.html          # Main application interface
├── style.css           # Titanium Theme styles
├── app.js              # Main entry point
├── camera-manager.js   # MediaPipe & Webcam logic
├── ui-manager.js       # DOM & SFX triggers
├── audio-manager.js    # Voice AI & Synthesized SFX
├── yoga.js             # Yoga pose detection logic
├── service-worker.js   # PWA Offline Caching
├── manifest.json       # App Metadata
└── ...
```

---

<div align="center">
    <h3>System Status: 🟢 OPERATIONAL</h3>
    <p>Built with ❤️ by Raj Pratham</p>
</div>
