# PlexaMotion 5.0 🌐🦾

> **Futuristic Real-Time Body Tracking & Remote Sensing System**
> *Built with MediaPipe, PeerJS, and Open Web Technologies.*

![PlexaMotion Banner](https://via.placeholder.com/1200x400/0a192f/00f3ff?text=PlexaMotion+5.0)

**PlexaMotion 5.0** is a cutting-edge web application that transforms any device into a motion intelligence sensor. It features a futuristic **Glassmorphism UI** and enables **"Through-Wall" Visibility** by linking a phone (Sensor) to a laptop (Display) via specific Peer-to-Peer data streaming.

---

## ✨ Key Features

### 🧍 Real-Time Body Intelligence
-   **Full Skeleton Tracking**: Uses MediaPipe Pose to detect 33 skeletal landmarks at 30+ FPS.
-   **Neon Aesthetic**: Visualizes motion with glowing cyan connections and pink joints.
-   **Mirror & Adjust**: Manual mirror toggle and auto-alignment for perfect viewing.

### 📡 Remote Sensor Link (PeerJS)
-   **The "Through-Wall" Solution**: Turn your laptop into a "Mission Control" display.
-   **Wireless Streaming**: Walk away with your phone; it streams Body & GPS data instantly to your laptop screen over the internet.
-   **Zero Backend**: Uses WebRTC for direct device-to-device communication.

### 📱 Mobile-First & PWA
-   **Installable App**: Add to Home Screen for a native app experience (fullscreen, no URL bar).
-   **Dual Camera Support**: Switch between Front and Back cameras for environmental scanning.
-   **Live GPS**: Continuous `watchPosition` updates for real-world location tracking.

---

## 🛠️ Technology Stack

-   **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid, Glassmorphism).
-   **Logic**: Modern JavaScript (ES6+ Modules).
-   **AI/CV Core**: [Google MediaPipe Pose](https://developers.google.com/mediapipe).
-   **Networking**: [PeerJS](https://peerjs.com/) (WebRTC wrapper) for P2P data sync.
-   **Maps/Env**: HTML5 Geolocation API.

---

## 🚀 Deployment Guide (GitHub & Vercel)

This project is optimized for **Vercel** deployment. Follow these steps to make it live for free:

### Step 1: Push to GitHub
1.  Create a new repository on [GitHub](https://github.com).
2.  Upload/Push the `PlexaMotion 5.0` folder to the repository.

### Step 2: Deploy on Vercel
1.  Go to [Vercel.com](https://vercel.com) and sign up/log in.
2.  Click **"Add New Project"**.
3.  Select **"Import"** next to your GitHub repository.
4.  Keep all settings default (Framework Preset: **Other**).
5.  Click **Deploy**.
6.  🎉 **Success!** You will get a link (e.g., `https://plexamotion.vercel.app`).

---

## 📖 How to Use

### Mode A: Single Device (Local)
1.  Open the app on your Laptop or Phone.
2.  Allow Camera & Location permissions.
3.  See your skeleton in real-time.

### Mode B: Remote Sensor Link (Professional)
*Use this to track yourself behind walls or remotely.*

1.  **Laptop (The Display)**:
    -   Open the App.
    -   Click **[Laptop Display]**.
    -   Note the **4-digit ID** shown (e.g., `8521`).

2.  **Phone (The Sensor)**:
    -   Open the App on your phone.
    -   Click **[Phone Sensor]**.
    -   Enter the Laptop's ID.
    -   Click **CONNECT**.

3.  **Execute**:
    -   Walk into another room with your phone.
    -   Your laptop screen will display your live skeleton and GPS location!

---

## 📲 Install as App
1.  Open your Vercel link on your phone (Chrome/Safari).
2.  Tap **Share (iOS)** or **Menu (Android)**.
3.  Select **"Add to Home Screen"**.
4.  Launch from your home screen for the full fullscreen experience.

---

*Developed by rajpratham| 2026*

