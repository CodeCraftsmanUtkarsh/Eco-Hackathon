const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// DATA STORAGE
// ============================================================================

let vehicleData = [];
let gridEmissionFactors = {};
let batteryEmissionFactors = {};
let manufacturingEmissions = {};

// ============================================================================
// DATASET 1: EPA FUEL ECONOMY DATA
// ============================================================================
// Download from: https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip
// File: vehicles.csv (Unzip first)
// Place in: ./data/vehicles.csv
//
// Key columns from EPA dataset:
// - year: Model year
// - make: Manufacturer (e.g., Tesla, Toyota, Honda)
// - model: Model name
// - VClass: Vehicle class (e.g., Compact Cars, Small SUV)
// - fuelType1: Primary fuel type (Electricity, Gasoline, Diesel)
// - city08: City MPG or MPGe for electric
// - highway08: Highway MPG or MPGe
// - comb08: Combined MPG or MPGe
// - co2TailpipeGpm: Tailpipe CO2 in grams per mile
// - cylinders: Number of cylinders
// - displ: Engine displacement in liters
// - drive: Drive type (FWD, RWD, AWD, 4WD)
// - trany: Transmission type
// ============================================================================

function loadEPAData() {
  const epaFile = path.join(__dirname, 'data/vehicles.csv');
  
  // Check if file exists
  if (!fs.existsSync(epaFile)) {
    console.warn('⚠️  EPA dataset not found at:', epaFile);
    console.warn('📥 Download from: https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip');
    console.warn('📁 Unzip and place in: ./data/vehicles.csv');
    console.warn('🔄 Using sample data instead...\n');
    loadSampleEPAData();
    return;
  }

  const results = [];
  
  fs.createReadStream(epaFile)
    .pipe(csv())
    .on('data', (row) => {
      // Only include vehicles with complete fuel economy data
      if (row.year && row.make && row.model && row.comb08) {
        
        // Determine if it's an EV (electricity only)
        const isElectric = row.fuelType1 === 'Electricity';
        
        // Determine if it's a hybrid (contains both fuel types)
        const isHybrid = row.fuelType1 && row.fuelType1.toLowerCase().includes('hybrid') ||
                        row.fuelType1 && row.fuelType1.includes('/');
        
        // Estimate battery capacity for EVs (if not provided)
        let batteryCapacity = parseFloat(row.batteryCapacity) || 0;
        if (isElectric && !batteryCapacity) {
          // Estimate based on vehicle class and year
          if (row.VClass === 'Compact Cars') batteryCapacity = 60;
          else if (row.VClass === 'Midsize Cars') batteryCapacity = 65;
          else if (row.VClass === 'Small SUV') batteryCapacity = 75;
          else batteryCapacity = 70;
        } else if (isHybrid && !batteryCapacity) {
          batteryCapacity = row.VClass === 'Small SUV' ? 18 : 8.8;
        }
        
        // Calculate efficiency for EVs (miles per kWh)
        let efficiencyMilesPerKWh = 0;
        if (isElectric && row.comb08) {
          // EPA MPGe can be converted to miles/kWh
          // 1 gallon gasoline equivalent = 33.7 kWh
          efficiencyMilesPerKWh = parseFloat(row.comb08) / 33.7;
        }
        
        results.push({
          id: row.id || `${row.year}-${row.make}-${row.model}`,
          year: parseInt(row.year),
          make: row.make,
          model: row.model,
          vehicleClass: row.VClass || 'Unknown',
          fuelType: row.fuelType1 || 'Unknown',
          isElectric,
          isHybrid,
          cityMPG: parseFloat(row.city08) || 0,
          highwayMPG: parseFloat(row.highway08) || 0,
          combinedMPG: parseFloat(row.comb08) || 0,
          co2EmissionsGramPerMile: parseFloat(row.co2TailpipeGpm) || 0,
          cylinders: parseInt(row.cylinders) || 0,
          displacement: parseFloat(row.displ) || 0,
          drive: row.drive || 'Unknown',
          transmission: row.trany || 'Unknown',
          batteryCapacity,
          efficiencyMilesPerKWh: efficiencyMilesPerKWh || (isElectric ? 4.0 : 0)
        });
      }
    })
    .on('end', () => {
      vehicleData = results;
      console.log(`✅ Loaded ${vehicleData.length} vehicles from EPA dataset`);
      
      // Show some statistics
      const evCount = results.filter(v => v.isElectric).length;
      const hybridCount = results.filter(v => v.isHybrid).length;
      const iceCount = results.length - evCount - hybridCount;
      
      console.log(`   📊 EVs: ${evCount}, Hybrids: ${hybridCount}, ICE: ${iceCount}`);
      console.log(`   📅 Years: ${Math.min(...results.map(v => v.year))} - ${Math.max(...results.map(v => v.year))}\n`);
    })
    .on('error', (error) => {
      console.error('❌ Error loading EPA data:', error.message);
      loadSampleEPAData();
    });
}

// ============================================================================
// DATASET 2: GRID EMISSION FACTORS (EPA eGRID)
// ============================================================================
// Download from: https://www.epa.gov/egrid/download-data
// File: egrid2022_data.xlsx → Export "SRL22" sheet to CSV
// Place in: ./data/grid_emissions.csv
//
// Key columns:
// - SUBRGN: Subregion acronym (CAMX, ERCT, NYCW, etc.)
// - SUBRGNNM: Subregion name
// - SRL22: CO2 emission rate (lb/MWh) - convert to g/kWh
//
// Or use pre-processed format:
// region,state,gCO2_per_kWh,year,source
// ============================================================================

function loadGridEmissionData() {
  const gridFile = path.join(__dirname, 'data/grid_emissions.csv');
  
  if (!fs.existsSync(gridFile)) {
    console.warn('⚠️  Grid emissions dataset not found');
    console.warn('📥 Download from: https://www.epa.gov/egrid/download-data');
    console.warn('🔄 Using default values...\n');
    loadDefaultGridData();
    return;
  }

  fs.createReadStream(gridFile)
    .pipe(csv())
    .on('data', (row) => {
      const regionKey = row.region || row.state || row.SUBRGN;
      gridEmissionFactors[regionKey] = {
        gCO2_per_kWh: parseFloat(row.gCO2_per_kWh || row.emissions),
        year: parseInt(row.year) || 2022,
        source: row.source || 'EPA eGRID',
        name: row.name || row.SUBRGNNM || regionKey
      };
    })
    .on('end', () => {
      console.log(`✅ Loaded ${Object.keys(gridEmissionFactors).length} grid emission factors\n`);
    })
    .on('error', (error) => {
      console.error('❌ Error loading grid data:', error.message);
      loadDefaultGridData();
    });
}

// ============================================================================
// DATASET 3: BATTERY LIFECYCLE EMISSIONS
// ============================================================================
// Sources:
// 1. IVL Swedish Environmental Research Institute (2019)
//    "Greenhouse gas emissions from battery electric vehicle production"
//    Link: https://www.ivl.se/english/ivl/topmenu/press/news-and-press-releases/
//    Data: NMC battery = 75 kg CO2/kWh manufacturing
//
// 2. Argonne National Laboratory GREET Model
//    Link: https://greet.es.anl.gov/
//    Data: Disposal emissions = 10-20 kg CO2/kWh
//
// Pre-processed format:
// batteryType,manufacturingKgCO2_per_kWh,disposalKgCO2_per_kWh,source,year
// ============================================================================

function loadBatteryEmissionData() {
  const batteryFile = path.join(__dirname, 'data/battery_lifecycle.csv');
  
  if (!fs.existsSync(batteryFile)) {
    console.warn('⚠️  Battery emissions dataset not found');
    console.warn('🔄 Using research-based defaults...\n');
    loadDefaultBatteryData();
    return;
  }

  fs.createReadStream(batteryFile)
    .pipe(csv())
    .on('data', (row) => {
      batteryEmissionFactors[row.batteryType] = {
        manufacturingKgCO2_per_kWh: parseFloat(row.manufacturingKgCO2_per_kWh),
        disposalKgCO2_per_kWh: parseFloat(row.disposalKgCO2_per_kWh),
        recyclingKgCO2_per_kWh: parseFloat(row.recyclingKgCO2_per_kWh) || 0,
        source: row.source,
        year: parseInt(row.year)
      };
    })
    .on('end', () => {
      console.log(`✅ Loaded ${Object.keys(batteryEmissionFactors).length} battery emission factors\n`);
    })
    .on('error', (error) => {
      console.error('❌ Error loading battery data:', error.message);
      loadDefaultBatteryData();
    });
}

// ============================================================================
// DATASET 4: VEHICLE MANUFACTURING EMISSIONS
// ============================================================================
// Source: Argonne National Laboratory GREET Model
// Link: https://greet.es.anl.gov/
//
// Pre-processed format:
// vehicleClass,bodyManufacturingKgCO2,source,year
// ============================================================================

function loadManufacturingEmissionData() {
  const mfgFile = path.join(__dirname, 'data/vehicle_manufacturing.csv');
  
  if (!fs.existsSync(mfgFile)) {
    console.warn('⚠️  Manufacturing emissions dataset not found');
    console.warn('🔄 Using GREET model defaults...\n');
    loadDefaultManufacturingData();
    return;
  }

  fs.createReadStream(mfgFile)
    .pipe(csv())
    .on('data', (row) => {
      manufacturingEmissions[row.vehicleClass] = {
        bodyManufacturingKgCO2: parseFloat(row.bodyManufacturingKgCO2),
        source: row.source,
        year: parseInt(row.year)
      };
    })
    .on('end', () => {
      console.log(`✅ Loaded ${Object.keys(manufacturingEmissions).length} manufacturing emission factors\n`);
    })
    .on('error', (error) => {
      console.error('❌ Error loading manufacturing data:', error.message);
      loadDefaultManufacturingData();
    });
}

// ============================================================================
// FALLBACK DATA LOADERS (When real datasets are not available)
// ============================================================================

function loadSampleEPAData() {
  vehicleData = [
    {
      id: '2024-Tesla-Model 3',
      year: 2024,
      make: 'Tesla',
      model: 'Model 3',
      vehicleClass: 'Compact Cars',
      fuelType: 'Electricity',
      isElectric: true,
      isHybrid: false,
      cityMPG: 141,
      highwayMPG: 123,
      combinedMPG: 132,
      co2EmissionsGramPerMile: 0,
      cylinders: 0,
      displacement: 0,
      drive: 'FWD',
      transmission: 'A1',
      batteryCapacity: 60,
      efficiencyMilesPerKWh: 4.2
    },
    {
      id: '2024-Toyota-Prius',
      year: 2024,
      make: 'Toyota',
      model: 'Prius',
      vehicleClass: 'Midsize Cars',
      fuelType: 'Gasoline/Hybrid',
      isElectric: false,
      isHybrid: true,
      cityMPG: 57,
      highwayMPG: 56,
      combinedMPG: 56,
      co2EmissionsGramPerMile: 158,
      cylinders: 4,
      displacement: 1.8,
      drive: 'FWD',
      transmission: 'CVT',
      batteryCapacity: 8.8,
      efficiencyMilesPerKWh: 0
    },
    {
      id: '2024-Honda-Civic',
      year: 2024,
      make: 'Honda',
      model: 'Civic',
      vehicleClass: 'Compact Cars',
      fuelType: 'Gasoline',
      isElectric: false,
      isHybrid: false,
      cityMPG: 32,
      highwayMPG: 42,
      combinedMPG: 35,
      co2EmissionsGramPerMile: 254,
      cylinders: 4,
      displacement: 2.0,
      drive: 'FWD',
      transmission: 'CVT',
      batteryCapacity: 0,
      efficiencyMilesPerKWh: 0
    },
    {
      id: '2024-Nissan-Leaf',
      year: 2024,
      make: 'Nissan',
      model: 'Leaf',
      vehicleClass: 'Compact Cars',
      fuelType: 'Electricity',
      isElectric: true,
      isHybrid: false,
      cityMPG: 123,
      highwayMPG: 99,
      combinedMPG: 111,
      co2EmissionsGramPerMile: 0,
      cylinders: 0,
      displacement: 0,
      drive: 'FWD',
      transmission: 'A1',
      batteryCapacity: 62,
      efficiencyMilesPerKWh: 3.8
    },
    {
      id: '2024-Ford-F-150',
      year: 2024,
      make: 'Ford',
      model: 'F-150',
      vehicleClass: 'Standard Pickup Trucks',
      fuelType: 'Gasoline',
      isElectric: false,
      isHybrid: false,
      cityMPG: 18,
      highwayMPG: 24,
      combinedMPG: 20,
      co2EmissionsGramPerMile: 445,
      cylinders: 6,
      displacement: 3.5,
      drive: '4WD',
      transmission: 'A10',
      batteryCapacity: 0,
      efficiencyMilesPerKWh: 0
    },
    {
      id: '2024-Chevrolet-Bolt EV',
      year: 2024,
      make: 'Chevrolet',
      model: 'Bolt EV',
      vehicleClass: 'Compact Cars',
      fuelType: 'Electricity',
      isElectric: true,
      isHybrid: false,
      cityMPG: 127,
      highwayMPG: 108,
      combinedMPG: 120,
      co2EmissionsGramPerMile: 0,
      cylinders: 0,
      displacement: 0,
      drive: 'FWD',
      transmission: 'A1',
      batteryCapacity: 65,
      efficiencyMilesPerKWh: 4.0
    },
    {
      id: '2024-Toyota-RAV4 Hybrid',
      year: 2024,
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      vehicleClass: 'Small SUV',
      fuelType: 'Gasoline/Hybrid',
      isElectric: false,
      isHybrid: true,
      cityMPG: 41,
      highwayMPG: 38,
      combinedMPG: 40,
      co2EmissionsGramPerMile: 222,
      cylinders: 4,
      displacement: 2.5,
      drive: 'AWD',
      transmission: 'CVT',
      batteryCapacity: 18.1,
      efficiencyMilesPerKWh: 0
    },
    {
      id: '2024-BMW-330i',
      year: 2024,
      make: 'BMW',
      model: '330i',
      vehicleClass: 'Compact Cars',
      fuelType: 'Gasoline',
      isElectric: false,
      isHybrid: false,
      cityMPG: 27,
      highwayMPG: 36,
      combinedMPG: 30,
      co2EmissionsGramPerMile: 296,
      cylinders: 4,
      displacement: 2.0,
      drive: 'RWD',
      transmission: 'A8',
      batteryCapacity: 0,
      efficiencyMilesPerKWh: 0
    }
  ];
  console.log(`✅ Loaded ${vehicleData.length} sample vehicles`);
}

function loadDefaultGridData() {
  // EPA eGRID 2022 data
  gridEmissionFactors = {
    'California': { gCO2_per_kWh: 200, year: 2022, source: 'EPA eGRID', name: 'California (CAMX)' },
    'Texas': { gCO2_per_kWh: 420, year: 2022, source: 'EPA eGRID', name: 'Texas (ERCT)' },
    'New York': { gCO2_per_kWh: 280, year: 2022, source: 'EPA eGRID', name: 'New York (NYCW)' },
    'Washington': { gCO2_per_kWh: 120, year: 2022, source: 'EPA eGRID', name: 'Washington (NWPP)' },
    'Florida': { gCO2_per_kWh: 390, year: 2022, source: 'EPA eGRID', name: 'Florida (FRCC)' },
    'Midwest': { gCO2_per_kWh: 450, year: 2022, source: 'EPA eGRID', name: 'Midwest (MROW)' },
    'US Average': { gCO2_per_kWh: 390, year: 2022, source: 'EPA eGRID', name: 'US National Average' },
    'Coal-heavy region': { gCO2_per_kWh: 600, year: 2022, source: 'Estimate', name: 'Coal-heavy (example)' },
    'Renewable-heavy region': { gCO2_per_kWh: 100, year: 2022, source: 'Estimate', name: 'Renewable-heavy (example)' }
  };
  console.log(`✅ Loaded ${Object.keys(gridEmissionFactors).length} default grid factors`);
}

function loadDefaultBatteryData() {
  // Based on IVL 2019 study and Argonne GREET model
  batteryEmissionFactors = {
    'NMC': {
      manufacturingKgCO2_per_kWh: 75,
      disposalKgCO2_per_kWh: 15,
      recyclingKgCO2_per_kWh: 10,
      source: 'IVL Swedish Environmental Research Institute',
      year: 2019
    },
    'NMC-622': {
      manufacturingKgCO2_per_kWh: 70,
      disposalKgCO2_per_kWh: 14,
      recyclingKgCO2_per_kWh: 9,
      source: 'IVL Update',
      year: 2021
    },
    'LFP': {
      manufacturingKgCO2_per_kWh: 65,
      disposalKgCO2_per_kWh: 12,
      recyclingKgCO2_per_kWh: 8,
      source: 'Various Studies',
      year: 2023
    },
    'NCA': {
      manufacturingKgCO2_per_kWh: 80,
      disposalKgCO2_per_kWh: 16,
      recyclingKgCO2_per_kWh: 11,
      source: 'Argonne GREET Model',
      year: 2023
    }
  };
  console.log(`✅ Loaded ${Object.keys(batteryEmissionFactors).length} default battery factors`);
}

function loadDefaultManufacturingData() {
  // Based on Argonne GREET model estimates
  manufacturingEmissions = {
    'Compact Cars': { bodyManufacturingKgCO2: 6800, source: 'Argonne GREET', year: 2023 },
    'Midsize Cars': { bodyManufacturingKgCO2: 7500, source: 'Argonne GREET', year: 2023 },
    'Large Cars': { bodyManufacturingKgCO2: 8200, source: 'Argonne GREET', year: 2023 },
    'Small SUV': { bodyManufacturingKgCO2: 8500, source: 'Argonne GREET', year: 2023 },
    'Midsize SUV': { bodyManufacturingKgCO2: 9500, source: 'Argonne GREET', year: 2023 },
    'Large SUV': { bodyManufacturingKgCO2: 11000, source: 'Argonne GREET', year: 2023 },
    'Standard Pickup Trucks': { bodyManufacturingKgCO2: 9500, source: 'Argonne GREET', year: 2023 },
    'Small Station Wagons': { bodyManufacturingKgCO2: 7200, source: 'Argonne GREET', year: 2023 },
    'Minivans': { bodyManufacturingKgCO2: 8800, source: 'Argonne GREET', year: 2023 }
  };
  console.log(`✅ Loaded ${Object.keys(manufacturingEmissions).length} default manufacturing factors`);
}

// ============================================================================
// LIFECYCLE CARBON CALCULATION ENGINE
// ============================================================================

function calculateLifecycleCost(vehicle, dailyMiles, yearsOwnership, region) {
  const totalMiles = dailyMiles * 365 * yearsOwnership;
  
  // 1. MANUFACTURING EMISSIONS
  let manufacturingCO2 = manufacturingEmissions[vehicle.vehicleClass]?.bodyManufacturingKgCO2 || 7000;
  
  // Add battery manufacturing if applicable
  if (vehicle.batteryCapacity > 0) {
    const batteryType = vehicle.isElectric ? 'NMC' : 'NMC';
    const batteryMfgFactor = batteryEmissionFactors[batteryType]?.manufacturingKgCO2_per_kWh || 75;
    manufacturingCO2 += vehicle.batteryCapacity * batteryMfgFactor;
  }
  
  // 2. OPERATIONAL EMISSIONS
  let operationalCO2 = 0;
  
  if (vehicle.isElectric) {
    // EV: Calculate based on grid intensity
    const gridFactor = gridEmissionFactors[region] || gridEmissionFactors['US Average'];
    const kWhUsed = totalMiles / vehicle.efficiencyMilesPerKWh;
    operationalCO2 = kWhUsed * (gridFactor.gCO2_per_kWh / 1000); // Convert g to kg
  } else {
    // ICE/Hybrid: Calculate based on fuel consumption
    const gallonsUsed = totalMiles / vehicle.combinedMPG;
    operationalCO2 = gallonsUsed * 8.89; // kg CO2 per gallon of gasoline
  }
  
  // 3. DISPOSAL EMISSIONS
  let disposalCO2 = 200; // Base vehicle disposal
  
  if (vehicle.batteryCapacity > 0) {
    const batteryType = vehicle.isElectric ? 'NMC' : 'NMC';
    const batteryDisposalFactor = batteryEmissionFactors[batteryType]?.disposalKgCO2_per_kWh || 15;
    disposalCO2 += vehicle.batteryCapacity * batteryDisposalFactor;
  }
  
  // TOTAL LIFECYCLE CO2
  const totalCO2 = manufacturingCO2 + operationalCO2 + disposalCO2;
  
  return {
    manufacturing: Math.round(manufacturingCO2),
    operational: Math.round(operationalCO2),
    disposal: Math.round(disposalCO2),
    total: Math.round(totalCO2),
    totalTons: (totalCO2 / 1000).toFixed(2),
    kgPerMile: (totalCO2 / totalMiles).toFixed(3),
    breakdown: {
      manufacturingPercent: ((manufacturingCO2 / totalCO2) * 100).toFixed(1),
      operationalPercent: ((operationalCO2 / totalCO2) * 100).toFixed(1),
      disposalPercent: ((disposalCO2 / totalCO2) * 100).toFixed(1)
    }
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dataLoaded: {
      vehicles: vehicleData.length,
      gridFactors: Object.keys(gridEmissionFactors).length,
      batteryFactors: Object.keys(batteryEmissionFactors).length,
      manufacturingFactors: Object.keys(manufacturingEmissions).length
    }
  });
});

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
  const { make, year, fuelType, limit = 100 } = req.query;
  
  let filtered = vehicleData;
  
  if (make) {
    filtered = filtered.filter(v => v.make.toLowerCase().includes(make.toLowerCase()));
  }
  if (year) {
    filtered = filtered.filter(v => v.year === parseInt(year));
  }
  if (fuelType) {
    if (fuelType.toLowerCase() === 'electric') {
      filtered = filtered.filter(v => v.isElectric);
    } else if (fuelType.toLowerCase() === 'hybrid') {
      filtered = filtered.filter(v => v.isHybrid);
    } else if (fuelType.toLowerCase() === 'gasoline' || fuelType.toLowerCase() === 'ice') {
      filtered = filtered.filter(v => !v.isElectric && !v.isHybrid);
    }
  }
  
  // Limit results
  filtered = filtered.slice(0, parseInt(limit));
  
  res.json({
    count: filtered.length,
    vehicles: filtered
  });
});

// Get specific vehicle
app.get('/api/vehicles/:make/:model', (req, res) => {
  const { make, model } = req.params;
  const { year } = req.query;
  
  let vehicle = vehicleData.find(v => 
    v.make.toLowerCase() === make.toLowerCase() &&
    v.model.toLowerCase().includes(model.toLowerCase()) &&
    (!year || v.year === parseInt(year))
  );
  
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

// Get all makes
app.get('/api/makes', (req, res) => {
  const makes = [...new Set(vehicleData.map(v => v.make))].sort();
  res.json(makes);
});

// Get models for a make
app.get('/api/models/:make', (req, res) => {
  const { make } = req.params;
  const models = [...new Set(
    vehicleData
      .filter(v => v.make.toLowerCase() === make.toLowerCase())
      .map(v => v.model)
  )].sort();
  res.json(models);
});

// Get grid emission factors
app.get('/api/grid-emissions', (req, res) => {
  res.json(gridEmissionFactors);
});

// Get grid emission for specific region
app.get('/api/grid-emissions/:region', (req, res) => {
  const { region } = req.params;
  const emissions = gridEmissionFactors[region];
  
  if (emissions) {
    res.json(emissions);
  } else {
    res.status(404).json({ error: 'Region not found' });
  }
});

// Get battery emission factors
app.get('/api/battery-emissions', (req, res) => {
  res.json(batteryEmissionFactors);
});

// Get manufacturing emission factors
app.get('/api/manufacturing-emissions', (req, res) => {
  res.json(manufacturingEmissions);
});

// Calculate lifecycle carbon cost
app.post('/api/calculate-lifecycle', (req, res) => {
  const { vehicleId, dailyMiles, yearsOwnership, region } = req.body;
  
  // Validation
  if (!vehicleId || !dailyMiles || !yearsOwnership || !region) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['vehicleId', 'dailyMiles', 'yearsOwnership', 'region']
    });
  }
  
  // Find vehicle
  const vehicle = vehicleData.find(v => v.id === vehicleId);
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  // Calculate emissions
  const emissions = calculateLifecycleCost(vehicle, dailyMiles, yearsOwnership, region);
  
  // Get grid info
  const gridInfo = gridEmissionFactors[region] || gridEmissionFactors['US Average'];
  
  res.json({
    vehicle: {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fuelType: vehicle.fuelType,
      vehicleClass: vehicle.vehicleClass,
      combinedMPG: vehicle.combinedMPG,
      batteryCapacity: vehicle.batteryCapacity
    },
    inputs: {
      dailyMiles,
      yearsOwnership,
      region,
      totalMiles: dailyMiles * 365 * yearsOwnership
    },
    emissions,
    gridInfo: {
      region,
      gCO2_per_kWh: gridInfo.gCO2_per_kWh,
      source: gridInfo.source,
      name: gridInfo.name
    }
  });
});

// Compare multiple vehicles
app.post('/api/compare', (req, res) => {
  const { vehicleIds, dailyMiles, yearsOwnership, region } = req.body;
  
  if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
    return res.status(400).json({ error: 'vehicleIds array required' });
  }
  
  const comparisons = vehicleIds.map(vehicleId => {
    const vehicle = vehicleData.find(v => v.id === vehicleId);
    if (!vehicle) return null;
    
    const emissions = calculateLifecycleCost(vehicle, dailyMiles, yearsOwnership, region);
    
    return {
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        fuelType: vehicle.fuelType
      },
      emissions
    };
  }).filter(c => c !== null);
  
  // Sort by total emissions
  comparisons.sort((a, b) => a.emissions.total - b.emissions.total);
  
  res.json({
    comparisons,
    recommendation: comparisons[0],
    inputs: { dailyMiles, yearsOwnership, region }
  });
});

// ============================================================================
// INITIALIZE DATA & START SERVER
// ============================================================================

console.log('\n🚗 Carbon-Wise Backend API');
console.log('==========================\n');
console.log('📊 Loading datasets...\n');

// Load all datasets
loadEPAData();
loadGridEmissionData();
loadBatteryEmissionData();
loadManufacturingEmissionData();

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log('\n📡 Available endpoints:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/vehicles?make=Tesla&year=2024&fuelType=electric');
  console.log('   GET  /api/vehicles/:make/:model');
  console.log('   GET  /api/makes');
  console.log('   GET  /api/models/:make');
  console.log('   GET  /api/grid-emissions');
  console.log('   GET  /api/grid-emissions/:region');
  console.log('   GET  /api/battery-emissions');
  console.log('   GET  /api/manufacturing-emissions');
  console.log('   POST /api/calculate-lifecycle');
  console.log('   POST /api/compare');
  console.log('\n📥 To use real EPA data:');
  console.log('   1. Download: https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip');
  console.log('   2. Unzip and place in: ./data/vehicles.csv');
  console.log('   3. Restart server\n');
});

module.exports = app;
