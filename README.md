# 🎮 Pahlawan Nusantara: Upgrade Your Power

A web-based RPG that brings legendary Indonesian heroes to life. Complete missions, earn EXP, and upgrade your heroes' stats.

---

## ✨ Features

- 🦸 **3 Legendary Heroes:** Gatotkaca, Srikandi, and Hanoman  
- 🔐 **Google / Guest Login:** Powered by Firebase Authentication  
- 🧠 **Level & EXP System:** Gain experience through missions  
- ⚔️ **Upgradeable Stats:** Power, Defense, Agility, and Magic  
- 💾 **Auto-Save Progress:** Stored securely in Firestore  
- 📱 **Responsive UI:** Optimized for desktop and mobile

---

## 🧩 Tech Stack

| Category | Tools & Tech |
|-----------|---------------|
| Frontend | HTML5, CSS3 (Tailwind via CDN), JavaScript (ES6 Modules) |
| Backend | Firebase Authentication + Cloud Firestore |
| Development | Visual Studio Code |

---

## 🗂️ Project Structure

```
           
pahlawan-nusantara/
├── index.html              
├── css/
│   └── styles.css          
├── js/
│   ├── config.js           
│   ├── characters.js       
│   ├── auth.js             
│   ├── firebase-db.js      
│   ├── game.js             
│   ├── ui.js               
│   └── main.js             
├── assets/
│   └── svg/                
└── README.md               

````

---

## 🎨 Design & Gameplay

---

## 🔧 How It Works

1. Choose your hero and begin your journey.  
2. Complete missions to gain EXP and upgrade points.  
3. Boost your stats: Strength, Defense, Agility, or Magic.  
4. Level up and unlock bonus points.  
5. Your progress is automatically saved in Firebase.

---

## 🧠 For Developers

Adding a new hero is as simple as editing `js/characters.js`:

```javascript
export const characters = {
  ...,
  arjuna: {
    name: "Arjuna",
    title: "The Swift Archer",
    description: "A master of focus and agility.",
    svg: `<svg>...</svg>`,
    stats: { power: 6, defense: 5, agility: 9, magic: 7 }
  }
};
````

---

## 📜 License

This project is licensed under
**[Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)**

You may share and adapt this work **for non-commercial purposes**,
with proper credit to the original creator.

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

---

## 📧 Contact

Created with ❤️ by herzbay (Bayu Herlambang)

 • LinkedIn
 • GitHub
 • Email

---

```