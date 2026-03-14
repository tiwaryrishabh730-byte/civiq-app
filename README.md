# 📍 CIVIQ | Real-Time Urban Mobility Dashboard

**CIVIQ** is a high-performance, location-aware web application designed to bridge the gap between urban infrastructure and citizen needs. Built for the modern smart city, it provides real-time crowd insights and precise proximity data for Mumbai's major hubs.

---

## 🚀 Key Features

- **Live Geospatial Tracking:** Automatically detects user coordinates via browser GPS with a polished "Detecting Location" UI state.
- **Smart Proximity Logic:** Implements the **Haversine Formula** to calculate real-time distance from the user to key facilities (CST, Lilavati Hospital, NMIMS).
- **Cloud-Synced Dashboard:** Powered by **Firebase Realtime Database**, ensuring crowd density and wait times are updated instantly across all devices.
- **Dark-Mode Command Center:** A sleek, glassmorphic UI featuring a "Mumbai Live Network" spatial hero section for high visual impact.

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (React)
* **Styling:** Tailwind CSS (Dark Mode Optimized)
* **Database:** Firebase Realtime Database
* **Icons & Branding:** Lucide React & Custom Branded Identity
* **Deployment:** Vercel (CI/CD Pipeline)

## 🛡️ Security & Version Control

This project utilizes a professional **CI/CD pipeline**. During development, we successfully navigated:
- **Secret Scanning:** Implemented secure credential management to prevent sensitive API token leaks.
- **Automated Deployment:** Every `git push` triggers an immutable build on Vercel, ensuring high availability and zero downtime.

## 📈 Demo Instructions

1.  Open the https://civiq-app-eight.vercel.app/ on your mobile device.
2.  Allow location permissions to see the **Spatial Hero Section** calculate your distance to Mumbai's hubs.
3.  Observe the "Live Heartbeat" pulsing dot, indicating the system is actively polling cloud data.

---
Built with ⚡ by Rishabh Tiwary
