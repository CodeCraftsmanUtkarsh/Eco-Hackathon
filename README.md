# 🌱 Carbon-Wise: Lifecycle Vehicle Carbon Intelligence Platform

**Team Loop Breakers**: Atharva & Utkarsh

A comprehensive platform that calculates **true lifecycle carbon footprint** of vehicles, exposing hidden emissions beyond marketing claims.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

---

## 📁 Project Structure

```
carbon-wise-app/
├── backend/
│   ├── server.js              # Express API server
│   ├── package.json
│   └── data/                  # Dataset files
│       ├── eea_vehicles.csv       # European vehicle dataset
│       ├── epa_vehicles.csv       # EPA vehicle dataset
│       ├── grid_emissions.csv       # Grid carbon intensity
│       ├── ivl_battery_lifecycle.csv
│       └── argonne_greet_manufacturing.csv
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main React app
    │   ├── Dashboard.jsx         # Vehicle comparison dashboard
    │   ├── Compare.jsx           # Detailed comparison view
    │   ├── Insights.jsx          # Analytics and education
    │   ├── LandingPage.jsx       # Landing page
    │   ├── Navigation.jsx        # Navigation component
    │   └── assets/
    │       └── logo.svg         # Website logo
    ├── public/
    │   └── index.html           # HTML template with favicon
    └── package.json
```

---

## 🔧 Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web server
- `cors` - Allow frontend to connect
- `csv-parser` - Read CSV files

---

### Step 2: Start Backend

```bash
npm start
```

You should see:
```
🚗 Carbon-Wise Backend API

✅ Loaded X vehicles from EPA dataset
✅ Loaded Y vehicles from EEA dataset
✅ Loaded Z grid factors
✅ Loaded 3 battery factors
✅ Loaded 4 manufacturing factors

✅ Server running on http://localhost:3001
```

**Backend is now running at `http://localhost:3001`**

Keep this terminal open!

---

### Step 3: Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

This installs:
- `react` - UI framework
- `react-router-dom` - Navigation
- `recharts` - Charts/graphs
- `react-scripts` - Development server

---

### Step 4: Start Frontend

```bash
npm start
```

---

## 🎯 How to Use

### Dashboard View
1. **Set Your Inputs**:
   - Daily miles driven (default: 30)
   - Years of ownership (default: 10)
   - Your region (affects grid carbon intensity)

2. **Select Vehicles**:
   - Click vehicle cards to add/remove from comparison
   - Choose from popular European vehicles or browse complete database
   - Need at least 1 vehicle selected

3. **View Results**:
   - 🏆 Best choice recommendation (lowest total emissions)
   - 📊 Lifecycle carbon comparison chart
   - Breakdown: Manufacturing + Operational + Disposal

### Compare View
- Side-by-side detailed comparison
- See exact emissions for each vehicle
- Compare price vs. environmental impact

### Insights View
- Learn about grid carbon intensity
- Understand manufacturing impact
- Greenwashing education

---

## 🔌 API Endpoints

The backend provides these REST APIs:

```bash
# Health check
GET http://localhost:3001/api/health

# Get all vehicles (with filters)
GET http://localhost:3001/api/vehicles?make=VW&year=2024

# Get all car makes
GET http://localhost:3001/api/makes

# Get grid emission factors
GET http://localhost:3001/api/grid-emissions

# Calculate lifecycle emissions
POST http://localhost:3001/api/calculate
{
  "vehicleIds": ["VW-Golf-2024", "Tesla-Model-3-2024"],
  "dailyMiles": 30,
  "yearsOwnership": 10,
  "region": "European Average"
}
```

---

## 📊 Dataset Sources

### 1. EEA European Vehicle Data
- **Source**: European Environment Agency
- **File**: `eea_vehicles.csv`
- **Contains**: European vehicle specifications and emissions

### 2. EPA Vehicle Data
- **Source**: https://www.fueleconomy.gov/feg/download.shtml
- **File**: `epa_vehicles.csv`
- **Contains**: 40,000+ vehicles with MPG, emissions, specs

### 3. European Grid Emissions
- **Source**: European electricity grid data
- **File**: `grid_emissions.csv`
- **Contains**: CO2 intensity by European regions (g/kWh)

### 4. Battery Lifecycle Emissions
- **Source**: IVL Swedish Environmental Research (2019)
- **File**: `ivl_battery_lifecycle.csv`
- **Contains**: Manufacturing & disposal emissions per kWh

### 5. Vehicle Manufacturing
- **Source**: Argonne National Laboratory GREET Model
- **File**: `argonne_greet_manufacturing.csv`
- **Contains**: Body manufacturing emissions by vehicle class

---

## 🧪 Testing Setup

### Test Backend
```bash
# In a terminal
curl http://localhost:3001/api/health

# Should return:
# {"status":"OK","vehicles":X,"gridFactors":Y}
```

### Test Frontend
1. Open browser to `http://localhost:3000`
2. You should see vehicles loading
3. Change inputs and see results update
4. Click between Dashboard/Compare/Insights tabs

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill existing process or use different port
PORT=3002 npm start
```

### Frontend can't connect to backend?
- Check backend is running (`http://localhost:3001/api/health`)
- Check CORS is enabled (already done in server.js)
- Check firewall isn't blocking port 3001

### No vehicles showing?
- Backend will use sample data if CSV not found
- Check browser console for errors (F12)
- Check backend terminal for loading messages

---

## 💡 Development Tips

### Add More Vehicles
Edit `backend/data/eea_vehicles.csv` or download fresh EEA data

### Change Grid Regions
Edit `backend/data/grid_emissions.csv` to add your region/country

### Customize Calculations
Edit the `calculateLifecycle()` function in `backend/server.js`

### Styling Changes
All styles are in `frontend/src/` components - easy to modify!

---

## 📦 Building for Production

### Backend
```bash
cd backend
# Already production-ready - just run
node server.js
```

### Frontend
```bash
cd frontend
npm run build

# Outputs to: frontend/build/
# Deploy this folder to any static host
```

---

## 🎓 Technical Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Fetch API** - Backend communication

### Backend
- **Node.js + Express** - REST API server
- **csv-parser** - Dataset loading
- **CORS** - Cross-origin support

### Data Sources
- **EEA** - European vehicle data
- **EPA** - Fuel economy & emissions
- **IVL** - Battery lifecycle research
- **Argonne GREET** - Manufacturing emissions

---

## 📖 How It Works

1. **User Inputs**: Daily miles, ownership years, region
2. **Data Loading**: Backend loads EEA + EPA vehicles + other CSVs
3. **Selection**: User picks vehicles to compare
4. **Calculation**:
   - Manufacturing = Body + Battery production
   - Operational = Fuel/electricity over lifetime
   - Disposal = End-of-life recycling/disposal
5. **Results**: Total lifecycle CO2 in tons
6. **Recommendation**: Vehicle with lowest total emissions

---

## 🏆 Features Implemented

✅ Total Lifecycle Carbon Cost calculator  
✅ Manufacturing + Operational + Disposal emissions  
✅ European grid carbon intensity mapping  
✅ Popular European vehicle selection  
✅ Personalized recommendations  
✅ Interactive dashboard with charts  
✅ Real-time calculations  
✅ Responsive design  
✅ RESTful API backend  
✅ EEA + EPA dataset integration  
✅ Professional navigation with logo  
✅ Favicon for browser tabs  

---

## 📝 Notes

- Sample data is included if you don't have CSV files yet
- Backend falls back gracefully if files are missing
- Frontend updates in real-time as you change inputs
- All calculations based on peer-reviewed research
- Vehicle IDs use format: Make-Model-Year (e.g., VW-Golf-2024)

---

## 🤝 Contributing

To add features:
1. Backend: Edit `server.js` to add API endpoints
2. Frontend: Edit React components in `frontend/src/`
3. Data: Add new CSV files to `backend/data/`

---

## 📄 License

MIT License - Feel free to use in your projects!

---

## 👥 Team

**Loop Breakers**
- Atharva
- Utkarsh

Built for Carbon-Wise hackathon challenge! 🌍💚
