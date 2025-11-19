/**
 * Crop Coefficients Database
 * Contains growth stage data and crop coefficients (Kc) for irrigation calculations
 * Based on FAO-56 guidelines for crop water requirements
 */

/**
 * Crop database with growth stages and coefficients
 * Each crop includes:
 * - stages: Growth stage data (initial, development, mid-season, late)
 * - totalDays: Total growing season length
 * - criticalDepletion: p-factor (fraction of available water that can be depleted)
 * - waterRequirement: Relative water need classification
 */
export const CROP_DATABASE = {
  maize: {
    name: 'Maize',
    stages: {
      initial: {
        days: 25,
        kc: 0.4,
        rootDepth: 0.3,
        description: 'Germination and early vegetative'
      },
      development: {
        days: 40,
        kc: 0.8,
        rootDepth: 0.8,
        description: 'Rapid vegetative growth'
      },
      midSeason: {
        days: 45,
        kc: 1.15,
        rootDepth: 1.5,
        description: 'Flowering and grain filling'
      },
      late: {
        days: 30,
        kc: 0.7,
        rootDepth: 1.5,
        description: 'Maturation and ripening'
      }
    },
    totalDays: 140,
    criticalDepletion: 0.55,
    waterRequirement: 'medium-high',
    sensitivity: 'Critical during flowering and grain filling'
  },

  rice: {
    name: 'Rice',
    stages: {
      initial: {
        days: 30,
        kc: 1.10,
        rootDepth: 0.2,
        description: 'Transplanting and establishment'
      },
      development: {
        days: 30,
        kc: 1.10,
        rootDepth: 0.4,
        description: 'Tillering'
      },
      midSeason: {
        days: 60,
        kc: 1.20,
        rootDepth: 0.5,
        description: 'Heading and flowering'
      },
      late: {
        days: 30,
        kc: 0.9,
        rootDepth: 0.5,
        description: 'Grain ripening'
      }
    },
    totalDays: 150,
    criticalDepletion: 0.20,
    waterRequirement: 'high',
    sensitivity: 'Requires continuous flooding or saturation'
  },

  beans: {
    name: 'Beans',
    stages: {
      initial: {
        days: 20,
        kc: 0.4,
        rootDepth: 0.3,
        description: 'Germination and seedling'
      },
      development: {
        days: 30,
        kc: 0.7,
        rootDepth: 0.5,
        description: 'Vegetative growth'
      },
      midSeason: {
        days: 40,
        kc: 1.10,
        rootDepth: 0.7,
        description: 'Flowering and pod formation'
      },
      late: {
        days: 20,
        kc: 0.9,
        rootDepth: 0.7,
        description: 'Pod filling and maturation'
      }
    },
    totalDays: 110,
    criticalDepletion: 0.45,
    waterRequirement: 'medium',
    sensitivity: 'Critical during flowering'
  },

  tomato: {
    name: 'Tomato',
    stages: {
      initial: {
        days: 30,
        kc: 0.45,
        rootDepth: 0.3,
        description: 'Transplanting and establishment'
      },
      development: {
        days: 40,
        kc: 0.75,
        rootDepth: 0.7,
        description: 'Vegetative growth'
      },
      midSeason: {
        days: 50,
        kc: 1.15,
        rootDepth: 1.0,
        description: 'Flowering and fruit development'
      },
      late: {
        days: 30,
        kc: 0.8,
        rootDepth: 1.0,
        description: 'Fruit ripening and harvest'
      }
    },
    totalDays: 150,
    criticalDepletion: 0.40,
    waterRequirement: 'medium-high',
    sensitivity: 'Sensitive to water stress during fruit development'
  },

  cassava: {
    name: 'Cassava',
    stages: {
      initial: {
        days: 30,
        kc: 0.3,
        rootDepth: 0.3,
        description: 'Planting and sprouting'
      },
      development: {
        days: 60,
        kc: 0.7,
        rootDepth: 0.8,
        description: 'Leaf development'
      },
      midSeason: {
        days: 120,
        kc: 0.8,
        rootDepth: 1.0,
        description: 'Tuber bulking'
      },
      late: {
        days: 60,
        kc: 0.5,
        rootDepth: 1.0,
        description: 'Tuber maturation'
      }
    },
    totalDays: 270,
    criticalDepletion: 0.65,
    waterRequirement: 'low-medium',
    sensitivity: 'Drought tolerant, critical during establishment'
  },

  coffee: {
    name: 'Coffee',
    stages: {
      initial: {
        days: 60,
        kc: 0.9,
        rootDepth: 0.5,
        description: 'Vegetative growth and flowering'
      },
      development: {
        days: 90,
        kc: 0.9,
        rootDepth: 1.0,
        description: 'Berry expansion'
      },
      midSeason: {
        days: 120,
        kc: 1.0,
        rootDepth: 1.5,
        description: 'Berry filling and ripening'
      },
      late: {
        days: 60,
        kc: 1.0,
        rootDepth: 1.5,
        description: 'Harvest and post-harvest'
      }
    },
    totalDays: 330,
    criticalDepletion: 0.40,
    waterRequirement: 'medium-high',
    sensitivity: 'Sensitive to water stress during flowering and berry development'
  }
};

/**
 * Get crop coefficient (Kc) for a specific crop and days after planting
 * @param {string} cropType - Crop type (maize, rice, beans, tomato, cassava, coffee)
 * @param {number} daysAfterPlanting - Days since planting
 * @returns {Object} Crop coefficient data { kc, stage, daysInStage, rootDepth, criticalDepletion }
 */
export function getCropCoefficient(cropType, daysAfterPlanting) {
  // Normalize crop type (case-insensitive)
  const normalizedCrop = cropType.toLowerCase().trim();

  const cropData = CROP_DATABASE[normalizedCrop];

  if (!cropData) {
    throw new Error(`Unsupported crop type: ${cropType}. Supported crops: ${Object.keys(CROP_DATABASE).join(', ')}`);
  }

  // Determine current growth stage based on days after planting
  let cumulativeDays = 0;
  let currentStage = 'initial';
  let stageData = cropData.stages.initial;
  let daysIntoStage = daysAfterPlanting;

  // Check initial stage
  if (daysAfterPlanting <= cropData.stages.initial.days) {
    currentStage = 'initial';
    stageData = cropData.stages.initial;
    daysIntoStage = daysAfterPlanting;
  }
  // Check development stage
  else if (daysAfterPlanting <= cropData.stages.initial.days + cropData.stages.development.days) {
    currentStage = 'development';
    stageData = cropData.stages.development;
    daysIntoStage = daysAfterPlanting - cropData.stages.initial.days;
  }
  // Check mid-season stage
  else if (daysAfterPlanting <= cropData.stages.initial.days + cropData.stages.development.days + cropData.stages.midSeason.days) {
    currentStage = 'midSeason';
    stageData = cropData.stages.midSeason;
    daysIntoStage = daysAfterPlanting - cropData.stages.initial.days - cropData.stages.development.days;
  }
  // Late stage or beyond
  else {
    currentStage = 'late';
    stageData = cropData.stages.late;
    daysIntoStage = daysAfterPlanting - cropData.stages.initial.days - cropData.stages.development.days - cropData.stages.midSeason.days;
  }

  // For development stage, interpolate Kc between initial and mid-season
  let kc = stageData.kc;
  if (currentStage === 'development') {
    const initialKc = cropData.stages.initial.kc;
    const midSeasonKc = cropData.stages.midSeason.kc;
    const developmentDays = cropData.stages.development.days;
    const progress = daysIntoStage / developmentDays;

    // Linear interpolation
    kc = initialKc + (midSeasonKc - initialKc) * progress;
  }

  return {
    kc: Math.round(kc * 100) / 100,
    stage: currentStage,
    stageName: stageData.description,
    daysInStage: daysIntoStage,
    rootDepth: stageData.rootDepth,
    criticalDepletion: cropData.criticalDepletion,
    waterRequirement: cropData.waterRequirement,
    sensitivity: cropData.sensitivity
  };
}

/**
 * Get complete crop information
 * @param {string} cropType - Crop type
 * @returns {Object} Complete crop data or null if not found
 */
export function getCropInfo(cropType) {
  const normalizedCrop = cropType.toLowerCase().trim();
  return CROP_DATABASE[normalizedCrop] || null;
}

/**
 * Get list of supported crops
 * @returns {Array<string>} Array of supported crop names
 */
export function getSupportedCrops() {
  return Object.keys(CROP_DATABASE);
}

/**
 * Validate if a crop type is supported
 * @param {string} cropType - Crop type to validate
 * @returns {boolean} True if crop is supported
 */
export function isCropSupported(cropType) {
  const normalizedCrop = cropType.toLowerCase().trim();
  return CROP_DATABASE.hasOwnProperty(normalizedCrop);
}

export default {
  CROP_DATABASE,
  getCropCoefficient,
  getCropInfo,
  getSupportedCrops,
  isCropSupported
};
