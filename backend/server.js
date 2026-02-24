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
let eeaVehicleData = [];
let epaVehicleData = [];

// Load EPA Data
function loadEPAData() {
  const epaFile = path.join(__dirname, 'data/epa_vehicles.csv');

  if (!fs.existsSync(epaFile)) {
    console.log('EPA vehicles file not found, skipping...');
    return [];
  }

  const results = [];

  fs.createReadStream(epaFile)
    .pipe(csv())
    .on('data', (row) => {
      if (row.make && row.model) {
        results.push({
          id: `EPA-${row.year}-${row.make}-${row.model}`,
          year: parseInt(row.year),
          make: row.make,
          model: row.model,
          vehicleClass: row.VClass || 'Unknown',
          fuelType: row.fuelType1 || 'Unknown',
          isElectric: row.fuelType1 === 'Electricity',
          isHybrid: row.fuelType1 === 'Gasoline/Hybrid',
          combinedMPG: parseFloat(row.comb08) || 0,
          co2EmissionsGramPerMile: parseFloat(row.co2TailpipeGpm) || 0,
          batteryCapacity: parseFloat(row.batteryCapacity) || 0,
          efficiencyMilesPerKWh: parseFloat(row.efficiencyMPGe) || 0,
          source: 'EPA'
        });
      }
    })
    .on('end', () => {
      epaVehicleData = results;
      console.log(`✅ Loaded ${results.length} vehicles from EPA dataset`);
    })
    .on('error', (error) => {
      console.error('Error reading EPA vehicles:', error);
    });
}

// Load EEA Data (European Standard)
function loadEEAData() {
  const eeaFile = path.join(__dirname, 'data/eea_vehicles.csv');

  if (!fs.existsSync(eeaFile)) {
    console.log('EEA vehicles file not found, skipping...');
    return [];
  }

  const results = [];

  fs.createReadStream(eeaFile)
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
          efficiencyMilesPerKWh: parseFloat(row.efficiencyMilesPerKWh) || 0,
          source: 'EEA'
        });
      }
    })
    .on('end', () => {
      eeaVehicleData = results;
      console.log(`✅ Loaded ${results.length} vehicles from EEA dataset`);
    })
    .on('error', (error) => {
      console.error('Error reading EEA vehicles:', error);
    });
}

// Load all vehicles
function loadVehicles() {
  loadEPAData();
  loadEEAData();

  // Combine both datasets after a short delay to ensure CSV reading completes
  setTimeout(() => {
    vehicleData = [...epaVehicleData, ...eeaVehicleData];
    console.log(`🎯 Total vehicles loaded: ${vehicleData.length}`);
    console.log(`📊 Data sources: EPA (${epaVehicleData.length}), EEA (${eeaVehicleData.length})`);
  }, 2000); // Increased delay for CSV reading
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

function loadDefaultGridData() {
  gridEmissionFactors = {
    'Northern Grid': { gCO2_per_kWh: 820, year: 2024, source: 'Central Electricity Authority (CEA)' },
    'Western Grid': { gCO2_per_kWh: 950, year: 2024, source: 'Central Electricity Authority (CEA)' },
    'Eastern Grid': { gCO2_per_kWh: 780, year: 2024, source: 'Central Electricity Authority (CEA)' },
    'Southern Grid': { gCO2_per_kWh: 620, year: 2024, source: 'Central Electricity Authority (CEA)' },
    'Maharashtra': { gCO2_per_kWh: 750, year: 2024, source: 'Central Electricity Authority (CEA)' }
  };
  console.log('✅ Loaded default grid factors');
}

function loadDefaultBatteryData() {
  batteryEmissionFactors = {
    'NMC': { manufacturingKgCO2_per_kWh: 75, disposalKgCO2_per_kWh: 15 },
    'LFP': { manufacturingKgCO2_per_kWh: 65, disposalKgCO2_per_kWh: 12 },
    'NCA': { manufacturingKgCO2_per_kWh: 80, disposalKgCO2_per_kWh: 16 }
  };
  console.log('✅ Loaded default battery factors');
}

function loadDefaultManufacturingData() {
  manufacturingEmissions = {
    'Compact Cars': { bodyManufacturingKgCO2: 6500 },
    'Midsize Cars': { bodyManufacturingKgCO2: 7200 },
    'Small SUV': { bodyManufacturingKgCO2: 8200 },
    'Midsize SUV': { bodyManufacturingKgCO2: 9500 },
    'Standard Pickup Trucks': { bodyManufacturingKgCO2: 11000 }
  };
  console.log('✅ Loaded default manufacturing factors');
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
  if (vehicle.isHybrid) {
    // Hybrid vehicles: Use fuel-based calculation with improved efficiency
    const gallonsUsed = totalMiles / vehicle.combinedMPG;
    operationalCO2 = gallonsUsed * 8.89;
  } else if (vehicle.isElectric) {
    // Pure EV vehicles: Use grid electricity calculation
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
    // ICE vehicles: Use fuel-based calculation
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

  // Frequently bought European cars for additional recommendations
  const popularEuropeanCars = [
    'VW Golf', 'VW Polo', 'VW Passat', 'VW Tiguan',
    'Renault Clio', 'Renault Megane', 'Renault Captur',
    'Peugeot 208', 'Peugeot 3008', 'Peugeot 2008',
    'Ford Fiesta', 'Ford Focus', 'Ford Kuga',
    'Opel Corsa', 'Opel Astra', 'Opel Mokka',
    'Toyota Yaris', 'Toyota Corolla', 'Toyota RAV4',
    'Nissan Qashqai', 'Nissan Juke',
    'Dacia Sandero', 'Dacia Duster',
    'Skoda Octavia', 'Skoda Fabia'
  ];

  // Find popular European cars in our dataset
  const popularRecommendations = vehicleData
    .filter(v => popularEuropeanCars.some(popCar =>
      v.make + ' ' + v.model === popCar ||
      v.model.includes(popCar.split(' ')[1]) ||
      v.make === popCar.split(' ')[0]
    ))
    .slice(0, 5)
    .map(v => {
      const emissions = calculateLifecycle(v, dailyMiles, yearsOwnership, region);
      return { vehicle: v, emissions, isPopular: true };
    });

  res.json({
    results,
    recommendation: results[0],
    popularEuropeanCars: popularRecommendations
  });
});

// Initialize and Start
console.log('\n🚗 Carbon-Wise Backend API\n');

// Initialize application
loadVehicles();
loadGridData();
loadDefaultBatteryData();
loadDefaultManufacturingData();

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}\n`);
});

module.exports = app;
