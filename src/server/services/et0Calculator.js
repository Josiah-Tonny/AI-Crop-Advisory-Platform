/**
 * ET0 Calculator Service
 * Calculates reference evapotranspiration using FAO-56 Penman-Monteith equation
 *
 * FAO-56 Penman-Monteith Formula:
 * ET0 = (0.408 × Δ × (Rn - G) + γ × (900/(T+273)) × u2 × (es - ea)) / (Δ + γ × (1 + 0.34 × u2))
 *
 * Where:
 * - ET0 = reference evapotranspiration (mm/day)
 * - Δ = slope of saturation vapor pressure curve (kPa/°C)
 * - Rn = net radiation (MJ/m²/day)
 * - G = soil heat flux (MJ/m²/day) ≈ 0 for daily calculations
 * - γ = psychrometric constant (kPa/°C)
 * - T = mean daily air temperature (°C)
 * - u2 = wind speed at 2m height (m/s)
 * - es = saturation vapor pressure (kPa)
 * - ea = actual vapor pressure (kPa)
 */

/**
 * Calculate solar declination (δ) in radians
 * @param {number} dayOfYear - Day of year (1-365)
 * @returns {number} Solar declination in radians
 */
function getSolarDeclination(dayOfYear) {
  return 0.409 * Math.sin((2 * Math.PI * dayOfYear / 365) - 1.39);
}

/**
 * Calculate sunset hour angle (ωs) in radians
 * @param {number} latitude - Latitude in degrees
 * @param {number} solarDeclination - Solar declination in radians
 * @returns {number} Sunset hour angle in radians
 */
function getSunsetHourAngle(latitude, solarDeclination) {
  const latRad = latitude * Math.PI / 180;
  const value = -Math.tan(latRad) * Math.tan(solarDeclination);

  // Ensure value is within valid range for acos
  const clampedValue = Math.max(-1, Math.min(1, value));

  return Math.acos(clampedValue);
}

/**
 * Calculate inverse relative distance Earth-Sun (dr)
 * @param {number} dayOfYear - Day of year (1-365)
 * @returns {number} Inverse relative distance
 */
function getInverseRelativeDistance(dayOfYear) {
  return 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);
}

/**
 * Calculate extraterrestrial radiation (Ra) in MJ/m²/day
 * @param {number} latitude - Latitude in degrees
 * @param {number} dayOfYear - Day of year (1-365)
 * @returns {number} Extraterrestrial radiation in MJ/m²/day
 */
function getExtraterrestrialRadiation(latitude, dayOfYear) {
  const latRad = latitude * Math.PI / 180;
  const solarDeclination = getSolarDeclination(dayOfYear);
  const sunsetHourAngle = getSunsetHourAngle(latitude, solarDeclination);
  const dr = getInverseRelativeDistance(dayOfYear);

  // Solar constant Gsc = 0.0820 MJ/m²/min
  const Gsc = 0.0820;

  const Ra = (24 * 60 / Math.PI) * Gsc * dr * (
    sunsetHourAngle * Math.sin(latRad) * Math.sin(solarDeclination) +
    Math.cos(latRad) * Math.cos(solarDeclination) * Math.sin(sunsetHourAngle)
  );

  return Ra;
}

/**
 * Calculate clear sky solar radiation (Rso) in MJ/m²/day
 * @param {number} altitude - Altitude in meters
 * @param {number} Ra - Extraterrestrial radiation in MJ/m²/day
 * @returns {number} Clear sky radiation in MJ/m²/day
 */
function getClearSkyRadiation(altitude, Ra) {
  return (0.75 + 2e-5 * altitude) * Ra;
}

/**
 * Estimate solar radiation (Rs) from temperature difference
 * Uses Hargreaves radiation formula when sunshine hours not available
 * @param {number} Ra - Extraterrestrial radiation in MJ/m²/day
 * @param {number} tempMax - Maximum temperature (°C)
 * @param {number} tempMin - Minimum temperature (°C)
 * @returns {number} Solar radiation in MJ/m²/day
 */
function getSolarRadiation(Ra, tempMax, tempMin) {
  const tempDiff = Math.abs(tempMax - tempMin);
  const Rs = 0.16 * Math.sqrt(tempDiff) * Ra;
  return Rs;
}

/**
 * Calculate net shortwave radiation (Rns) in MJ/m²/day
 * @param {number} Rs - Solar radiation in MJ/m²/day
 * @param {number} albedo - Albedo (default 0.23 for grass reference)
 * @returns {number} Net shortwave radiation in MJ/m²/day
 */
function getNetShortwaveRadiation(Rs, albedo = 0.23) {
  return (1 - albedo) * Rs;
}

/**
 * Calculate net longwave radiation (Rnl) in MJ/m²/day
 * @param {number} tempMax - Maximum temperature (°C)
 * @param {number} tempMin - Minimum temperature (°C)
 * @param {number} ea - Actual vapor pressure (kPa)
 * @param {number} Rs - Solar radiation (MJ/m²/day)
 * @param {number} Rso - Clear sky radiation (MJ/m²/day)
 * @returns {number} Net longwave radiation in MJ/m²/day
 */
function getNetLongwaveRadiation(tempMax, tempMin, ea, Rs, Rso) {
  // Stefan-Boltzmann constant (MJ/K⁴/m²/day)
  const sigma = 4.903e-9;

  // Convert temperatures to Kelvin
  const TmaxK = tempMax + 273.16;
  const TminK = tempMin + 273.16;

  const Rnl = sigma * ((Math.pow(TmaxK, 4) + Math.pow(TminK, 4)) / 2) *
    (0.34 - 0.14 * Math.sqrt(ea)) *
    (1.35 * Math.min(Rs / Rso, 1.0) - 0.35);

  return Rnl;
}

/**
 * Calculate net radiation (Rn) in MJ/m²/day
 * @param {number} Rs - Solar radiation (MJ/m²/day)
 * @param {number} tempMax - Maximum temperature (°C)
 * @param {number} tempMin - Minimum temperature (°C)
 * @param {number} ea - Actual vapor pressure (kPa)
 * @param {number} Rso - Clear sky radiation (MJ/m²/day)
 * @returns {number} Net radiation in MJ/m²/day
 */
function getNetRadiation(Rs, tempMax, tempMin, ea, Rso) {
  const Rns = getNetShortwaveRadiation(Rs);
  const Rnl = getNetLongwaveRadiation(tempMax, tempMin, ea, Rs, Rso);
  return Rns - Rnl;
}

/**
 * Calculate saturation vapor pressure (es) in kPa
 * @param {number} temperature - Temperature in °C
 * @returns {number} Saturation vapor pressure in kPa
 */
function getSaturationVaporPressure(temperature) {
  return 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
}

/**
 * Calculate actual vapor pressure (ea) in kPa
 * @param {number} humidity - Relative humidity (%)
 * @param {number} es - Saturation vapor pressure (kPa)
 * @returns {number} Actual vapor pressure in kPa
 */
function getActualVaporPressure(humidity, es) {
  return (humidity / 100) * es;
}

/**
 * Calculate slope of saturation vapor pressure curve (Δ) in kPa/°C
 * @param {number} temperature - Temperature in °C
 * @returns {number} Slope of vapor pressure curve in kPa/°C
 */
function getSlopeVaporPressure(temperature) {
  return 4098 * getSaturationVaporPressure(temperature) /
    Math.pow(temperature + 237.3, 2);
}

/**
 * Calculate psychrometric constant (γ) in kPa/°C
 * @param {number} altitude - Altitude in meters
 * @returns {number} Psychrometric constant in kPa/°C
 */
function getPsychrometricConstant(altitude) {
  // Atmospheric pressure (kPa)
  const P = 101.3 * Math.pow((293 - 0.0065 * altitude) / 293, 5.26);

  // Psychrometric constant
  const gamma = 0.000665 * P;

  return gamma;
}

/**
 * Calculate reference evapotranspiration (ET0) using FAO-56 Penman-Monteith
 * @param {Object} weatherData - Weather data object
 * @param {number} weatherData.temperature - Mean temperature (°C)
 * @param {number} weatherData.humidity - Relative humidity (%)
 * @param {number} weatherData.windSpeed - Wind speed at 2m (m/s)
 * @param {number} weatherData.tempMax - Optional: Maximum temperature (°C)
 * @param {number} weatherData.tempMin - Optional: Minimum temperature (°C)
 * @param {number} latitude - Latitude in degrees
 * @param {Date} date - Date for calculation
 * @param {number} altitude - Altitude in meters (default: 0)
 * @returns {number} Reference evapotranspiration in mm/day
 */
export function calculateET0(weatherData, latitude, date, altitude = 0) {
  try {
    // Extract weather data
    const T = weatherData.temperature;
    const RH = weatherData.humidity;
    const u2 = weatherData.windSpeed;

    // Use temp range if available, otherwise estimate ±3°C from mean
    const Tmax = weatherData.tempMax || (T + 3);
    const Tmin = weatherData.tempMin || (T - 3);

    // Validate inputs
    if (T < -30 || T > 60) {
      throw new Error('Temperature out of reasonable range');
    }
    if (RH < 0 || RH > 100) {
      throw new Error('Humidity must be between 0 and 100');
    }
    if (u2 < 0 || u2 > 50) {
      throw new Error('Wind speed out of reasonable range');
    }

    // Get day of year (1-365)
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Calculate saturation vapor pressure for Tmax and Tmin
    const esMax = getSaturationVaporPressure(Tmax);
    const esMin = getSaturationVaporPressure(Tmin);
    const es = (esMax + esMin) / 2;

    // Calculate actual vapor pressure
    const ea = getActualVaporPressure(RH, es);

    // Calculate slope of saturation vapor pressure curve
    const Delta = getSlopeVaporPressure(T);

    // Calculate psychrometric constant
    const gamma = getPsychrometricConstant(altitude);

    // Calculate extraterrestrial radiation
    const Ra = getExtraterrestrialRadiation(latitude, dayOfYear);

    // Estimate solar radiation from temperature
    const Rs = getSolarRadiation(Ra, Tmax, Tmin);

    // Calculate clear sky radiation
    const Rso = getClearSkyRadiation(altitude, Ra);

    // Calculate net radiation
    const Rn = getNetRadiation(Rs, Tmax, Tmin, ea, Rso);

    // Soil heat flux (G) is approximately 0 for daily calculations
    const G = 0;

    // Apply FAO-56 Penman-Monteith equation
    const numerator = 0.408 * Delta * (Rn - G) +
      gamma * (900 / (T + 273)) * u2 * (es - ea);

    const denominator = Delta + gamma * (1 + 0.34 * u2);

    const ET0 = numerator / denominator;

    // Ensure ET0 is positive and reasonable (0-20 mm/day for most conditions)
    const clampedET0 = Math.max(0, Math.min(20, ET0));

    // Round to 2 decimal places
    return Math.round(clampedET0 * 100) / 100;

  } catch (error) {
    throw new Error(`ET0 calculation error: ${error.message}`);
  }
}

/**
 * Calculate ET0 for a forecast day with limited data
 * Simplified calculation when detailed weather parameters not available
 * @param {Object} forecastData - Forecast data
 * @param {number} latitude - Latitude in degrees
 * @param {Date} date - Date for calculation
 * @param {number} altitude - Altitude in meters
 * @returns {number} Reference evapotranspiration in mm/day
 */
export function calculateET0FromForecast(forecastData, latitude, date, altitude = 0) {
  const weatherData = {
    temperature: forecastData.avgTemp,
    humidity: forecastData.avgHumidity,
    windSpeed: forecastData.avgWindSpeed,
    tempMax: forecastData.high,
    tempMin: forecastData.low
  };

  return calculateET0(weatherData, latitude, date, altitude);
}

export default {
  calculateET0,
  calculateET0FromForecast
};
