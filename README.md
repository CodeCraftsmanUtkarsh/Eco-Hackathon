# 🌱 Carbon-Wise: Lifecycle Vehicle Carbon Intelligence Platform

**Team Loop Breakers**: Atharva & Utkarsh

A comprehensive platform that calculates the **true lifecycle carbon footprint** of vehicles, exposing hidden emissions beyond marketing claims.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Your downloaded CSV datasets

---

## 📁 Project Structure

```
carbon-wise-app/
├── backend/
│   ├── server.js              # Express API server
│   ├── package.json
│   └── data/                  # PUT YOUR CSV FILES HERE
│       ├── vehicles.csv       # EPA fuel economy dataset
│       ├── grid_emissions.csv # Grid carbon intensity
│       ├── battery_lifecycle.csv
│       └── vehicle_manufacturing.csv
│
└── frontend/
    ├── CarbonWise.jsx         # Main React component
    └── package.json
```

---

## 🔧 Setup Instructions

### Step 1: Place Your CSV Files

**Copy your downloaded CSV files to the `backend/data/` directory:**

```bash
cd backend/data/

# Place these files here:
# - vehicles.csv (EPA dataset you downloaded)
# - grid_emissions.csv
# - battery_lifecycle.csv  
# - vehicle_manufacturing.csv
```

If you haven't created the CSV files yet, check the sample files already in the `/data` folder - they work out of the box!

---

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web server
- `cors` - Allow frontend to connect
- `csv-parser` - Read CSV files

---

### Step 3: Start the Backend

```bash
npm start
```

You should see:
```
🚗 Carbon-Wise Backend API

✅ Loaded 42,314 vehicles from EPA dataset
✅ Loaded 6 grid factors
✅ Loaded 3 battery factors
✅ Loaded 4 manufacturing factors

✅ Server running on http://localhost:3001
```

**Backend is now running at `http://localhost:3001`**

Keep this terminal open!

---

### Step 4: Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

This installs:
- `react` - UI framework
- `recharts` - Charts/graphs
- `react-scripts` - Development server

---

### Step 5: Start the Frontend

```bash
npm start
```

The browser should automatically open to `http://localhost:3000`

**You're now running Carbon-Wise! 🎉**

---

## 🎯 How to Use

### Dashboard View
1. **Set Your Inputs**:
   - Daily miles driven (default: 30)
   - Years of ownership (default: 10)
   - Your region (affects grid carbon intensity)

2. **Select Vehicles**:
   - Click vehicle cards to add/remove from comparison
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
GET http://localhost:3001/api/vehicles?make=Tesla&year=2024

# Get all car makes
GET http://localhost:3001/api/makes

# Get grid emission factors
GET http://localhost:3001/api/grid-emissions

# Calculate lifecycle emissions
POST http://localhost:3001/api/calculate
{
  "vehicleIds": ["2024-Tesla-Model 3", "2024-Toyota-Prius"],
  "dailyMiles": 30,
  "yearsOwnership": 10,
  "region": "California"
}
```

---

## 📊 Dataset Sources

### 1. EPA Fuel Economy Data
- **Source**: https://www.fueleconomy.gov/feg/download.shtml
- **File**: `vehicles.csv`
- **Contains**: 40,000+ vehicles with MPG, emissions, specs

### 2. EPA eGRID (Grid Emissions)
- **Source**: https://www.epa.gov/egrid/download-data
- **File**: `grid_emissions.csv`
- **Contains**: CO2 intensity by US region (g/kWh)

### 3. Battery Lifecycle Emissions
- **Source**: IVL Swedish Environmental Research (2019)
- **File**: `battery_lifecycle.csv`
- **Contains**: Manufacturing & disposal emissions per kWh

### 4. Vehicle Manufacturing
- **Source**: Argonne National Laboratory GREET Model
- **File**: `vehicle_manufacturing.csv`
- **Contains**: Body manufacturing emissions by vehicle class

---

## 🧪 Testing the Setup

### Test Backend
```bash
# In a terminal
curl http://localhost:3001/api/health

# Should return:
# {"status":"OK","vehicles":10,"gridFactors":6}
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

### CSV files not loading?
```bash
# Check file exists
ls backend/data/vehicles.csv

# Check file permissions
chmod 644 backend/data/*.csv

# Check file format (should have headers)
head backend/data/vehicles.csv
```

### No vehicles showing?
- Backend will use sample data if CSV not found
- Check browser console for errors (F12)
- Check backend terminal for loading messages

---

## 💡 Development Tips

### Add More Vehicles
Edit `backend/data/vehicles.csv` or download fresh EPA data

### Change Grid Regions
Edit `backend/data/grid_emissions.csv` to add your state/country

### Customize Calculations
Edit the `calculateLifecycle()` function in `backend/server.js`

### Styling Changes
All styles are inline in `frontend/CarbonWise.jsx` - easy to modify!

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
- **Recharts** - Data visualization
- **Fetch API** - Backend communication

### Backend
- **Node.js + Express** - REST API server
- **csv-parser** - Dataset loading
- **CORS** - Cross-origin support

### Data Sources
- **EPA** - Fuel economy & emissions
- **EEA** - European grid data
- **IVL** - Battery lifecycle research
- **Argonne GREET** - Manufacturing emissions

---

## 📖 How It Works

1. **User Inputs**: Daily miles, ownership years, region
2. **Data Loading**: Backend loads EPA vehicles.csv + other CSVs
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
✅ Grid carbon intensity mapping (regional)  
✅ Personalized recommendations  
✅ Greenwashing detection  
✅ Interactive dashboard with charts  
✅ Real-time calculations  
✅ Responsive design  
✅ RESTful API backend  
✅ EPA dataset integration  

---

## 📝 Notes

- Sample data is included if you don't have CSV files yet
- Backend falls back gracefully if files are missing
- Frontend updates in real-time as you change inputs
- All calculations based on peer-reviewed research

---

## 🤝 Contributing

To add features:
1. Backend: Edit `server.js` to add API endpoints
2. Frontend: Edit `CarbonWise.jsx` to add UI components
3. Data: Add new CSV files to `backend/data/`

---

## 📄 License

MIT License - Feel free to use in your projects!

---

## 👥 Team

**Loop Breakers**
- Atharva
- Utkarsh

Built for the Carbon-Wise hackathon challenge! 🌍💚
