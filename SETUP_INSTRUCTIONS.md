# 🚀 Carbon-Wise Setup Instructions

## 📁 Step 1: Organize Your Files

### Create folder structure:
```
ECO_HACKATHON/
├── backend/
│   ├── data/          ← Create this folder
│   ├── server.js      ← Move here
│   └── package.json   ← Create here
│
└── frontend/
    ├── public/        ← Create this folder
    │   └── index.html ← Create here
    ├── src/           ← Create this folder
    │   ├── index.js   ← Create here
    │   └── CarbonWise.jsx ← Move here
    └── package.json   ← Create here
```

---

## 📝 Step 2: Create Backend Files

### In `backend/` folder:

**1. Copy `server.js` into backend/**
   - Move your existing server.js file here

**2. Create `backend/data/` folder**
   - Move all CSV files here:
     - epa_vehicles.csv
     - battery_lifecycle.csv
     - grid_emissions.csv
     - vehicle_manufacturing.csv (if you have it)

**3. Create `backend/package.json`**
   - I've created this file for you (backend-package.json)
   - Copy its contents into a new file called `package.json` in the backend folder

---

## 📝 Step 3: Create Frontend Files

### In `frontend/` folder:

**1. Create `frontend/public/` folder**

**2. Create `frontend/public/index.html`**
   - Copy the index.html file I created

**3. Create `frontend/src/` folder**

**4. Move `CarbonWise.jsx` into `frontend/src/`**

**5. Create `frontend/src/index.js`**
   - Copy the index.js file I created

**6. Create `frontend/package.json`**
   - Copy the frontend-package.json file I created

---

## 🚀 Step 4: Install and Run

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm start
```

**Expected output:**
```
🚗 Carbon-Wise Backend API
✅ Loaded X vehicles from EPA dataset
✅ Server running on http://localhost:3001
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

Browser should open automatically!

---

## ✅ Final Structure Checklist

Your `ECO_HACKATHON` folder should look like:

```
ECO_HACKATHON/
├── backend/
│   ├── server.js ✓
│   ├── package.json ✓
│   └── data/
│       ├── epa_vehicles.csv ✓
│       ├── battery_lifecycle.csv ✓
│       └── grid_emissions.csv ✓
│
├── frontend/
│   ├── package.json ✓
│   ├── public/
│   │   └── index.html ✓
│   └── src/
│       ├── index.js ✓
│       └── CarbonWise.jsx ✓
│
├── README.md
└── BACKEND_SETUP.md
```

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "Cannot find module 'react'"
```bash
cd frontend
npm install
```

### Port already in use
```bash
# Kill process on port 3001
lsof -i :3001
kill -9 <PID>
```

### Frontend can't connect to backend
- Make sure backend is running (Terminal 1)
- Check http://localhost:3001/api/health in browser
- Should return JSON data

---

## 📞 Need Help?

If you get stuck:
1. Make sure both terminals are running
2. Check for error messages
3. Verify file locations match the structure above

Good luck with your hackathon! 🚗💚
