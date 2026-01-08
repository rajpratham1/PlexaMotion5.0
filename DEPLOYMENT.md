# Deploying PlexaMotion 5.0 & Installing as App

## 1. Free Deployment (Required)
To use this on your phone without cables, you must host it online. **Vercel** and **Netlify** are the best free options.

### Option A: Drag & Drop (Netlify) - Easiest
1.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Drag your entire project folder (`PlexaMotion 5.0`) into the box.
3.  Wait a few seconds. Netlify will give you a link (e.g., `https://brave-wescoff...netlify.app`).
4.  **Done!** Send this link to your phone and laptop.

### Option B: GitHub + Vercel (Professional)
1.  Upload your folder to a GitHub repository.
2.  Go to [vercel.com](https://vercel.com) -> "Add New Project".
3.  Import your GitHub repo.
4.  Click "Deploy".

## 2. Installing as an Application (PWA)
I have converted this project into a **Progressive Web App (PWA)**. You don't need the App Store.

### On Android (Chrome)
1.  Open your deployed link (from Netlify/Vercel) in Chrome.
2.  Tap the **Settings Menu** (three dots).
3.  Tap **"Install App"** or **"Add to Home Screen"**.
4.  PlexaMotion will appear in your app drawer like a real app!

### On iOS (Safari)
1.  Open your deployed link in Safari.
2.  Tap the **Share Button** (box with arrow up).
3.  Scroll down and tap **"Add to Home Screen"**.
4.  It will now launch fullscreen without browser bars.

## 3. Using Remote Link Globally
Once deployed, the "Remote Link" works across the internet (thanks to PeerJS), not just local WiFi!
1.  Open the site on Laptop -> Click **Display**.
2.  Open the site on Phone (4G/5G/WiFi) -> Click **Sensor**.
3.  Connect and track from anywhere!
