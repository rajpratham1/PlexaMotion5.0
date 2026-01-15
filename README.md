# PlexaMotion 5.0 - The Interactive Motion Suite 🌐🦾

> **An advanced, browser-based computer vision application that transforms your webcam into an interactive motion controller.**

![PlexaMotion Banner](https://via.placeholder.com/1200x600/0a192f/00f3ff?text=PlexaMotion+Interactive+Suite)

**PlexaMotion 5.0** has evolved from a simple body-tracking demo into a full suite of interactive experiences. Using the power of your device's camera and advanced machine learning models, this application offers multiple modes that turn your body's movements into direct input for fitness, gaming, and UI control.

---

## ✨ Features

PlexaMotion now includes four distinct modes, each designed for a unique purpose:

### 🏋️ AI Fitness Coach
-   **Intelligent Repetition Counting**: Automatically counts your squats using real-time analysis of your body's joints.
-   **Real-Time Form Feedback**: Provides on-screen advice to help you maintain proper form (e.g., "Great depth!", "Make sure your full body is visible!").
-   **Workout Dashboard**: A dedicated panel displays your current exercise, rep count, and feedback messages.

### 🎮 Interactive Motion Game
-   **Body-As-A-Controller**: Play a fun and challenging "dodge-the-block" game using your body's position.
-   **Intuitive Control**: Your player on screen mirrors your body's horizontal movement, controlled by the position of your nose.
-   **Scoring and Replayability**: The game tracks your score and features a "Game Over" screen with a quick restart option.

### 🖐️ Gesture-Based Control
-   **Hands-Free Navigation**: Control a user interface with simple hand gestures.
-   **Swipe Detection**: The application detects horizontal swipes of your right hand to navigate through a sample photo gallery.
-   **Futuristic UI Control**: A proof-of-concept for controlling presentations, media players, or other applications without a mouse or keyboard.

### 📡 Remote Sensor Link
-   **The "Through-Wall" Solution**: Turn a phone into a remote motion and GPS sensor, and view its data live on a separate laptop or desktop.
-   **Peer-to-Peer Streaming**: Uses WebRTC (via PeerJS) for direct, low-latency, device-to-device communication over the internet with no backend server required.

---

## 📖 How to Use

1.  Open the application in a modern web browser.
2.  Allow the required **Camera** and **Location** permissions when prompted.
3.  The application will start on the **Mode Selection** screen.

### Mode 1: AI Fitness Coach
1.  Click the **[Fitness AI]** button.
2.  Position yourself so your full body is visible to the camera.
3.  Start performing squats. The **Fitness AI** panel on the right will automatically count your reps and provide feedback.

### Mode 2: Motion Game
1.  Click the **[Motion Game]** button.
2.  The game screen will appear over the video feed. Click **[Start Game]**.
3.  Physically move your body left and right to control the player paddle at the bottom of the screen.
4.  Dodge the falling red blocks. Your score increases for every block you successfully dodge.

### Mode 3: Gesture Control
1.  Click the **[Gesture Control]** button.
2.  A sample photo gallery will appear over the video feed.
3.  Raise your right hand so it is clearly visible.
4.  **Swipe your hand horizontally** across your body to navigate between the photos.

---

## 🛠️ Technology Stack

-   **Frontend**: HTML5, CSS3 (Glassmorphism UI)
-   **Core Logic**: Modern JavaScript (ES6+ Modules)
-   **Computer Vision**: [Google MediaPipe Pose](https://developers.google.com/mediapipe) for real-time body landmark detection.
-   **P2P Networking**: [PeerJS](https://peerjs.com/) (A wrapper for WebRTC).
-   **Geolocation**: Standard HTML5 Geolocation API.

---

## 🚀 Deployment Guide

This project is optimized for free and instant deployment on **Vercel**.

1.  **Push to GitHub**: Create a GitHub repository and push the project files to it.
2.  **Import to Vercel**:
    -   Go to [Vercel.com](https://vercel.com) and sign in.
    -   Click **"Add New Project"** and import the repository you just created.
    -   Use the default settings (Framework Preset: **Other**).
    -   Click **Deploy**.

---
