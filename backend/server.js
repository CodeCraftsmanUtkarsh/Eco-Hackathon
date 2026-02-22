const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let vehicleData = [];
let gridEmissionFactors = {};
let batteryEmissionFactors = {};
let manufacturingEmissions = {};

// Load EPA Data
function loadEPAData() {
  const epaFile = path.join(__dirname, 'data/vehicles.csv');

  if (!fs.existsSync(epaFile)) {
    loadSampleData();
    return;
  }

  const results = [];

  fs.createReadStream(epaFile)
    .pipe(csv())
    .on('data', (row) => {
      if (row.id && row.make && row.model) {
        results.push({
          id: row.id,
          year: parseInt(row.year),
          make: row.make,
          model: row.model,
          vehicleClass: row.vehicleClass || 'Unknown',
          fuelType: row.fuelType || 'Unknown',
          isElectric: row.isElectric === 'true',
          isHybrid: row.isHybrid === 'true',
          combinedMPG: parseFloat(row.combinedMPG) || 0,
          co2EmissionsGramPerMile: parseFloat(row.co2EmissionsGramPerMile) || 0,
          batteryCapacity: parseFloat(row.batteryCapacity) || 0,
          efficiencyMilesPerKWh: parseFloat(row.efficiencyMilesPerKWh) || 0
        });
      }
    })
    .on('end', () => {
      vehicleData = results;
      console.log(`✅ Loaded ${vehicleData.length} vehicles from Indian dataset`);
    })
    .on('error', (error) => {
      console.error('❌ Error loading vehicle data:', error.message);
      loadSampleData();
    });
}

function loadSampleData() {
  vehicleData = [
    { id: '2024-Tesla-Model 3', year: 2024, make: 'Tesla', model: 'Model 3', vehicleClass: 'Compact Cars', fuelType: 'Electricity', isElectric: true, isHybrid: false, combinedMPG: 132, co2EmissionsGramPerMile: 0, batteryCapacity: 60, efficiencyMilesPerKWh: 4.2 },
    { id: '2024-Tesla-Model Y', year: 2024, make: 'Tesla', model: 'Model Y', vehicleClass: 'Small SUV', fuelType: 'Electricity', isElectric: true, isHybrid: false, combinedMPG: 121, co2EmissionsGramPerMile: 0, batteryCapacity: 75, efficiencyMilesPerKWh: 3.8 },
    { id: '2024-Nissan-Leaf', year: 2024, make: 'Nissan', model: 'Leaf', vehicleClass: 'Compact Cars', fuelType: 'Electricity', isElectric: true, isHybrid: false, combinedMPG: 111, co2EmissionsGramPerMile: 0, batteryCapacity: 62, efficiencyMilesPerKWh: 3.8 },
    { id: '2024-Chevrolet-Bolt EV', year: 2024, make: 'Chevrolet', model: 'Bolt EV', vehicleClass: 'Compact Cars', fuelType: 'Electricity', isElectric: true, isHybrid: false, combinedMPG: 120, co2EmissionsGramPerMile: 0, batteryCapacity: 65, efficiencyMilesPerKWh: 4.0 },
    { id: '2024-Toyota-Prius', year: 2024, make: 'Toyota', model: 'Prius', vehicleClass: 'Midsize Cars', fuelType: 'Gasoline/Hybrid', isElectric: false, isHybrid: true, combinedMPG: 56, co2EmissionsGramPerMile: 158, batteryCapacity: 8.8, efficiencyMilesPerKWh: 0 },
    { id: '2024-Toyota-RAV4 Hybrid', year: 2024, make: 'Toyota', model: 'RAV4 Hybrid', vehicleClass: 'Small SUV', fuelType: 'Gasoline/Hybrid', isElectric: false, isHybrid: true, combinedMPG: 40, co2EmissionsGramPerMile: 222, batteryCapacity: 18.1, efficiencyMilesPerKWh: 0 },
    { id: '2024-Honda-Civic', year: 2024, make: 'Honda', model: 'Civic', vehicleClass: 'Compact Cars', fuelType: 'Gasoline', isElectric: false, isHybrid: false, combinedMPG: 35, co2EmissionsGramPerMile: 254, batteryCapacity: 0, efficiencyMilesPerKWh: 0 },
    { id: '2024-Honda-Accord', year: 2024, make: 'Honda', model: 'Accord', vehicleClass: 'Midsize Cars', fuelType: 'Gasoline', isElectric: false, isHybrid: false, combinedMPG: 33, co2EmissionsGramPerMile: 269, batteryCapacity: 0, efficiencyMilesPerKWh: 0 },
    { id: '2024-Ford-F-150', year: 2024, make: 'Ford', model: 'F-150', vehicleClass: 'Standard Pickup Trucks', fuelType: 'Gasoline', isElectric: false, isHybrid: false, combinedMPG: 20, co2EmissionsGramPerMile: 445, batteryCapacity: 0, efficiencyMilesPerKWh: 0 },
    { id: '2024-BMW-330i', year: 2024, make: 'BMW', model: '330i', vehicleClass: 'Compact Cars', fuelType: 'Gasoline', isElectric: false, isHybrid: false, combinedMPG: 30, co2EmissionsGramPerMile: 296, batteryCapacity: 0, efficiencyMilesPerKWh: 0 }
  ];
  console.log(`✅ Loaded ${vehicleData.length} sample vehicles`);
}

// Load Grid Data
function loadGridData() {
  const gridFile = path.join(__dirname, 'data/grid_emissions.csv');

  if (!fs.existsSync(gridFile)) {
    loadDefaultGridData();
    return;
  }

  fs.createReadStream(gridFile)
    .pipe(csv())
    .on('data', (row) => {
      const key = row.state || row.region;
      gridEmissionFactors[key] = {
        gCO2_per_kWh: parseFloat(row.gCO2_per_kWh),
        year: parseInt(row.year) || 2022,
        source: row.source || 'EPA eGRID'
      };
    })
    .on('end', () => {
      console.log(`✅ Loaded ${Object.keys(gridEmissionFactors).length} grid factors`);
    })
    .on('error', (error) => {
      console.error('❌ Error loading grid data:', error.message);
      console.log('❌ Grid data loading failed - application cannot continue without grid emission factors');
      process.exit(1);
    });
}


// Load Battery Data
function loadBatteryData() {
  const batteryFile = path.join(__dirname, 'data/battery_lifecycle.csv');

  if (!fs.existsSync(batteryFile)) {
    loadDefaultBatteryData();
    return;
  }

  fs.createReadStream(batteryFile)
    .pipe(csv())
    .on('data', (row) => {
      batteryEmissionFactors[row.batteryType] = {
        manufacturingKgCO2_per_kWh: parseFloat(row.manufacturingKgCO2_per_kWh),
        disposalKgCO2_per_kWh: parseFloat(row.disposalKgCO2_per_kWh)
      };
    })
    .on('end', () => {
      console.log(`✅ Loaded ${Object.keys(batteryEmissionFactors).length} battery factors`);
    })
    .on('error', () => loadDefaultBatteryData());
}

function loadDefaultBatteryData() {
  batteryEmissionFactors = {
    'NMC': { manufacturingKgCO2_per_kWh: 75, disposalKgCO2_per_kWh: 15 },
    'LFP': { manufacturingKgCO2_per_kWh: 65, disposalKgCO2_per_kWh: 12 },
    'NCA': { manufacturingKgCO2_per_kWh: 80, disposalKgCO2_per_kWh: 16 }
  };
  console.log(`✅ Loaded ${Object.keys(batteryEmissionFactors).length} default battery factors`);
}

// Load Manufacturing Data
function loadManufacturingData() {
  const mfgFile = path.join(__dirname, 'data/vehicle_manufacturing.csv');

  if (!fs.existsSync(mfgFile)) {
    loadDefaultManufacturingData();
    return;
  }

  fs.createReadStream(mfgFile)
    .pipe(csv())
    .on('data', (row) => {
      manufacturingEmissions[row.vehicleClass] = {
        bodyManufacturingKgCO2: parseFloat(row.bodyManufacturingKgCO2)
      };
    })
    .on('end', () => {
      console.log(`✅ Loaded ${Object.keys(manufacturingEmissions).length} manufacturing factors`);
    })
    .on('error', () => loadDefaultManufacturingData());
}

function loadDefaultManufacturingData() {
  manufacturingEmissions = {
    'Compact Cars': { bodyManufacturingKgCO2: 6800 },
    'Midsize Cars': { bodyManufacturingKgCO2: 7500 },
    'Small SUV': { bodyManufacturingKgCO2: 8500 },
    'Standard Pickup Trucks': { bodyManufacturingKgCO2: 9500 }
  };
  console.log(`✅ Loaded ${Object.keys(manufacturingEmissions).length} default manufacturing factors`);
}

// Calculate Lifecycle
function calculateLifecycle(vehicle, dailyMiles, yearsOwnership, region) {
  const totalMiles = dailyMiles * 365 * yearsOwnership;

  let manufacturingCO2 = manufacturingEmissions[vehicle.vehicleClass]?.bodyManufacturingKgCO2 || 7000;

  if (vehicle.batteryCapacity > 0) {
    const batteryType = vehicle.isElectric ? 'NMC' : 'NMC';
    manufacturingCO2 += vehicle.batteryCapacity * (batteryEmissionFactors[batteryType]?.manufacturingKgCO2_per_kWh || 75);
  }

  let operationalCO2 = 0;
  if (vehicle.isElectric) {
    const gridFactor = gridEmissionFactors[region] || gridEmissionFactors['US Average'] || gridEmissionFactors['National'];
    if (!gridFactor || !gridFactor.gCO2_per_kWh) {
      console.error(`Grid factor not found for region: ${region}`);
      return {
        manufacturing: 0,
        operational: 0,
        disposal: 0,
        total: 0,
        totalTons: '0.00',
        kgPerMile: '0.000',
        error: `Grid factor not available for region: ${region}`
      };
    }
    const kWhUsed = totalMiles / vehicle.efficiencyMilesPerKWh;
    operationalCO2 = kWhUsed * (gridFactor.gCO2_per_kWh / 1000);
  } else {
    const gallonsUsed = totalMiles / vehicle.combinedMPG;
    operationalCO2 = gallonsUsed * 8.89;
  }

  let disposalCO2 = 200;
  if (vehicle.batteryCapacity > 0) {
    const batteryType = vehicle.isElectric ? 'NMC' : 'NMC';
    disposalCO2 += vehicle.batteryCapacity * (batteryEmissionFactors[batteryType]?.disposalKgCO2_per_kWh || 15);
  }

  const totalCO2 = manufacturingCO2 + operationalCO2 + disposalCO2;

  return {
    manufacturing: Math.round(manufacturingCO2),
    operational: Math.round(operationalCO2),
    disposal: Math.round(disposalCO2),
    total: Math.round(totalCO2),
    totalTons: (totalCO2 / 1000).toFixed(2),
    kgPerMile: (totalCO2 / totalMiles).toFixed(3)
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    vehicles: vehicleData.length,
    gridFactors: Object.keys(gridEmissionFactors).length
  });
});

app.get('/api/vehicles', (req, res) => {
  const { make, year, limit = 50 } = req.query;
  let filtered = vehicleData;

  if (make) filtered = filtered.filter(v => v.make.toLowerCase().includes(make.toLowerCase()));
  if (year) filtered = filtered.filter(v => v.year === parseInt(year));

  res.json({ count: filtered.length, vehicles: filtered.slice(0, parseInt(limit)) });
});

app.get('/api/makes', (req, res) => {
  const makes = [...new Set(vehicleData.map(v => v.make))].sort();
  res.json(makes);
});

app.get('/api/grid-emissions', (req, res) => {
  res.json(gridEmissionFactors);
});

app.post('/api/calculate', (req, res) => {
  const { vehicleIds, dailyMiles, yearsOwnership, region } = req.body;

  const results = vehicleIds.map(id => {
    const vehicle = vehicleData.find(v => v.id === id);
    if (!vehicle) return null;

    const emissions = calculateLifecycle(vehicle, dailyMiles, yearsOwnership, region);
    if (emissions.error) {
      console.error(`Calculation error for vehicle ${id}:`, emissions.error);
      return null;
    }
    return { vehicle, emissions };
  }).filter(r => r !== null);

  if (results.length === 0) {
    return res.status(400).json({
      error: 'Unable to calculate emissions. Please check your region selection and try again.',
      availableRegions: Object.keys(gridEmissionFactors)
    });
  }

  results.sort((a, b) => a.emissions.total - b.emissions.total);

  res.json({ results, recommendation: results[0] });
});

// Initialize and Start
console.log('\n🚗 Carbon-Wise Backend API\n');
loadEPAData();
loadGridData();
loadBatteryData();
loadManufacturingData();

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}\n`);
});

module.exports = app;
