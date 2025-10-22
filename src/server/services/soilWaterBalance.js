/**
 * Soil Water Balance Service
 * Calculates soil moisture, water holding capacity, and irrigation requirements
 * Based on soil type characteristics and water balance principles
 */

/**
 * Soil type water holding capacities
 * Values represent available water capacity in mm per meter of soil depth
 */
const SOIL_CAPACITIES = {
  sandy: {
    capacity: 70, // mm/m
    infiltrationRate: 'high',
    drainageRate: 'fast',
    description: 'Sandy soils drain quickly, require frequent light irrigation'
  },
  loamy: {
    capacity: 150, // mm/m
    infiltrationRate: 'medium',
    drainageRate: 'moderate',
    description: 'Loamy soils balance water retention and drainage well'
  },
  clay: {
    capacity: 170, // mm/m
    infiltrationRate: 'low',
    drainageRate: 'slow',
    description: 'Clay soils hold water well but drain slowly'
  },
  silt: {
    capacity: 180, // mm/m
    infiltrationRate: 'medium-low',
    drainageRate: 'slow',
    description: 'Silty soils have high water retention'
  }
};

/**
 * Calculate soil water holding capacity
 * @param {string} soilType - Soil type (sandy, loamy, clay, silt)
 * @param {number} rootDepth - Root depth in meters (default: 1.0)
 * @returns {Object} Soil capacity data
 */
export function calculateSoilCapacity(soilType, rootDepth = 1.0) {
  // Normalize soil type
  const normalizedSoil = soilType.toLowerCase().trim();

  // Get soil data or default to loamy
  const soilData = SOIL_CAPACITIES[normalizedSoil] || SOIL_CAPACITIES.loamy;

  // Calculate total available water based on root depth
  const totalCapacity = soilData.capacity * rootDepth;

  return {
    soilType: normalizedSoil,
    capacityPerMeter: soilData.capacity,
    totalCapacity: totalCapacity,
    rootDepth: rootDepth,
    infiltrationRate: soilData.infiltrationRate,
    drainageRate: soilData.drainageRate,
    description: soilData.description
  };
}

/**
 * Estimate current soil moisture based on recent weather and water balance
 * @param {string} soilType - Soil type
 * @param {number} recentRainfall - Total rainfall in recent period (mm)
 * @param {number} recentET - Total evapotranspiration in recent period (mm)
 * @param {number} currentMoisture - Current moisture if known (%, 0-100)
 * @param {number} rootDepth - Root depth in meters
 * @returns {Object} Moisture estimation
 */
export function estimateSoilMoisture(
  soilType,
  recentRainfall = 0,
  recentET = 0,
  currentMoisture = null,
  rootDepth = 1.0
) {
  const soilCapacity = calculateSoilCapacity(soilType, rootDepth);
  const fieldCapacity = soilCapacity.totalCapacity;

  let moistureInMM;

  if (currentMoisture !== null && currentMoisture !== undefined) {
    // Convert percentage to mm
    moistureInMM = (currentMoisture / 100) * fieldCapacity;
  } else {
    // Estimate from water balance
    // Start with assumption of 70% field capacity
    moistureInMM = 0.70 * fieldCapacity;

    // Add rainfall
    moistureInMM += recentRainfall;

    // Subtract evapotranspiration
    moistureInMM -= recentET;

    // Account for drainage in different soil types
    if (soilType === 'sandy' && moistureInMM > fieldCapacity) {
      // Sandy soil drains excess quickly
      moistureInMM = fieldCapacity * 0.8; // Settles to 80% after drainage
    } else if (moistureInMM > fieldCapacity) {
      // Other soils can retain near field capacity
      moistureInMM = fieldCapacity;
    }

    // Ensure non-negative
    moistureInMM = Math.max(0, moistureInMM);
  }

  // Calculate percentage of field capacity
  const moisturePercent = (moistureInMM / fieldCapacity) * 100;

  // Determine moisture status
  let status;
  if (moisturePercent >= 80) {
    status = 'optimal';
  } else if (moisturePercent >= 60) {
    status = 'adequate';
  } else if (moisturePercent >= 40) {
    status = 'moderate';
  } else if (moisturePercent >= 20) {
    status = 'low';
  } else {
    status = 'critical';
  }

  return {
    moisturePercent: Math.round(moisturePercent),
    moistureMM: Math.round(moistureInMM * 10) / 10,
    fieldCapacity: fieldCapacity,
    status: status,
    soilType: soilType
  };
}

/**
 * Calculate irrigation need based on soil moisture and crop requirements
 * @param {number} currentMoisture - Current soil moisture (% of field capacity)
 * @param {number} cropETc - Daily crop evapotranspiration (mm/day)
 * @param {number} soilCapacity - Total soil water holding capacity (mm)
 * @param {number} criticalDepletion - Critical depletion fraction (p-factor, 0-1)
 * @param {number} daysToConsider - Number of days to plan ahead (default: 1)
 * @returns {Object} Irrigation need assessment
 */
export function calculateIrrigationNeed(
  currentMoisture,
  cropETc,
  soilCapacity,
  criticalDepletion = 0.5,
  daysToConsider = 1
) {
  // Calculate readily available water (RAW)
  const RAW = soilCapacity * criticalDepletion;

  // Calculate current available water in mm
  const currentWater = soilCapacity * (currentMoisture / 100);

  // Calculate water needed over the planning period
  const waterLoss = cropETc * daysToConsider;

  // Calculate projected moisture after ET
  const projectedWater = currentWater - waterLoss;

  // Determine if irrigation is needed
  const needed = projectedWater < RAW;

  // Calculate amount needed to refill to 90% of field capacity
  const targetWater = soilCapacity * 0.90;
  const deficit = targetWater - currentWater;

  // Calculate urgency based on current and projected moisture
  let urgency;
  const currentPercent = currentMoisture;
  const projectedPercent = (projectedWater / soilCapacity) * 100;

  if (projectedPercent < 20) {
    urgency = 'high';
  } else if (projectedPercent < 40) {
    urgency = 'medium';
  } else if (projectedPercent < 60) {
    urgency = 'low';
  } else {
    urgency = 'none';
  }

  // Calculate recommended irrigation amount
  let recommendedAmount = 0;
  if (needed) {
    // If below RAW, irrigate to bring back to 90% field capacity
    recommendedAmount = Math.max(0, targetWater - projectedWater);
  }

  return {
    needed: needed,
    amount: Math.round(recommendedAmount * 10) / 10,
    urgency: urgency,
    currentMoisture: currentPercent,
    projectedMoisture: Math.round(projectedPercent),
    threshold: Math.round((RAW / soilCapacity) * 100),
    deficit: Math.round(deficit * 10) / 10,
    daysUntilCritical: needed ? 0 : Math.floor((currentWater - RAW) / cropETc)
  };
}

/**
 * Calculate effective rainfall (portion that infiltrates and is available to plants)
 * @param {number} rainfall - Total rainfall (mm)
 * @param {string} soilType - Soil type
 * @returns {number} Effective rainfall (mm)
 */
export function calculateEffectiveRainfall(rainfall, soilType) {
  if (rainfall <= 0) return 0;

  // Effective rainfall factors vary by soil type and rainfall amount
  let effectiveness;

  if (soilType === 'sandy') {
    // Sandy soils have high infiltration but lose water to deep drainage
    if (rainfall < 10) {
      effectiveness = 0.95;
    } else if (rainfall < 25) {
      effectiveness = 0.85;
    } else {
      effectiveness = 0.70; // More losses with heavy rain
    }
  } else if (soilType === 'clay') {
    // Clay soils have low infiltration, more runoff
    if (rainfall < 10) {
      effectiveness = 0.90;
    } else if (rainfall < 25) {
      effectiveness = 0.75;
    } else {
      effectiveness = 0.60; // Significant runoff with heavy rain
    }
  } else {
    // Loamy and silt soils
    if (rainfall < 10) {
      effectiveness = 0.95;
    } else if (rainfall < 25) {
      effectiveness = 0.85;
    } else {
      effectiveness = 0.75;
    }
  }

  return rainfall * effectiveness;
}

/**
 * Simulate soil water balance over multiple days
 * @param {Object} params - Parameters for simulation
 * @returns {Array} Daily water balance data
 */
export function simulateWaterBalance(params) {
  const {
    initialMoisture,
    soilCapacity,
    dailyET,
    dailyRainfall,
    soilType,
    days = 7
  } = params;

  const results = [];
  let currentMoisture = (initialMoisture / 100) * soilCapacity;

  for (let day = 0; day < days; day++) {
    const et = Array.isArray(dailyET) ? dailyET[day] : dailyET;
    const rainfall = Array.isArray(dailyRainfall) ? dailyRainfall[day] : dailyRainfall;

    // Calculate effective rainfall
    const effectiveRain = calculateEffectiveRainfall(rainfall, soilType);

    // Update moisture: add rainfall, subtract ET
    currentMoisture = currentMoisture + effectiveRain - et;

    // Limit to field capacity
    currentMoisture = Math.min(currentMoisture, soilCapacity);

    // Ensure non-negative
    currentMoisture = Math.max(0, currentMoisture);

    const moisturePercent = (currentMoisture / soilCapacity) * 100;

    results.push({
      day: day + 1,
      moisture: Math.round(moisturePercent),
      moistureMM: Math.round(currentMoisture * 10) / 10,
      rainfall: rainfall,
      effectiveRainfall: Math.round(effectiveRain * 10) / 10,
      et: et,
      waterBalance: Math.round((effectiveRain - et) * 10) / 10
    });
  }

  return results;
}

export default {
  calculateSoilCapacity,
  estimateSoilMoisture,
  calculateIrrigationNeed,
  calculateEffectiveRainfall,
  simulateWaterBalance
};
