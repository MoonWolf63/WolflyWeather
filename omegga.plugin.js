const axios = require('axios');

class WeatherSyncPlugin {
  constructor(omegga, config, store) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
    this.weatherAPIKey = this.config.apikey; // Your Tomorrow.io API key
    this.devmode = true;
    this.weatherEndpoint = `https://api.tomorrow.io/v4/timelines?location=${this.config.Latitude},${this.config.Longitude}&fields=precipitationType,precipitationIntensity,rainIntensityAvg,cloudCover,visibility&units=imperial&apikey=${this.weatherAPIKey}`;
  }


  calculateMoonlightIntensity() {
    const now = new Date();
    const synodicMonth = 29.53058867; // Length of a synodic month (lunar cycle)
    const newMoon = new Date(Date.UTC(2000, 0, 6, 18, 14)); // Date of known new moon
    const phase = ((now - newMoon) / 1000 / 60 / 60 / 24) % synodicMonth;
    const moonlightIntensity = 50 * (1 - Math.cos((2 * Math.PI * phase) / synodicMonth)); // Approximating light intensity
    const decimalMoonlightIntensity = Math.min(0.99, Math.max(0, moonlightIntensity / 100)); // Convert to 0.00 - 0.99 range
    return decimalMoonlightIntensity;
  }

  async fetchWeatherData() {
    try {

      const response = await axios.get(this.weatherEndpoint);
      const data = response.data.data.timelines[0].intervals[0].values;
      if(this.devmode == true){
      console.log(data.rainIntensityAvg);
      console.log(data.precipitationIntensity);
      }
      return {
        rainIntensity: data.rainIntensityAvg,
        cloudCover: data.cloudCover,
        visibility: data.visibility,
        precipitationType: data.precipitationType
      };

    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      return null;
    }
    
  }

  async adjustWeather({ rainIntensity, cloudCover, visibility, precipitationType }) {
    // Convert the percentage to a decimal if it's given as a percentage (0-100)
    const decimalCloudCoverage = cloudCover / 100;  // Converts 25% directly to 0.25
    const maxRainIntensity = 0.4; // mm/hour considered as 100% intensity
    const rainIntensityPercentage = Math.min(100, Math.max(0, (rainIntensity / maxRainIntensity) * 100));
    const decimalWeatherIntensity = Math.min(1, Math.max(0, rainIntensityPercentage / 100));
    const environmentPreset = {
      type: 'Environment',
      data: {
        groups: {
          Sky: {
            weatherIntensity: decimalWeatherIntensity,
            cloudCoverage: decimalCloudCoverage,  // Now correctly using a decimal value
            fogDensity: Math.max(0.005, Math.min(3, 3 * (1 - (visibility / 10)))),
          }
        }
      }
    };

    // Load the environment data into the game
    await this.omegga.loadEnvironmentData(environmentPreset);
    if(this.devmode == true){
    console.log(`Weather updated: ${JSON.stringify(environmentPreset)}`);
    }
}




  convertToGameTime() {
    let moonlight = this.calculateMoonlightIntensity();
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const gameHour = hours + minutes / 60 + seconds / 3600;

    const environmentPreset = {
      type: 'Environment',
      data: {
        groups: {
          Sky: {
            timeOfDay: gameHour,
            moonlightIntensity: moonlight
          }
        }
      }
    };

    // Load the environment data into the game
    this.omegga.loadEnvironmentData(environmentPreset);
    if(this.devmode == true){
    console.log(`Game time set to ${gameHour} based on real-world time.`);
    }
  }

  async init() {
    // Setup weather interval
    this.weatherInterval = setInterval(async () => {
      const weatherData = await this.fetchWeatherData();
      if (weatherData) {
        await this.adjustWeather(weatherData);
      }
    }, 600000); // 10 minutes

    // Setup time sync interval
    this.timeInterval = setInterval(() => {
      this.convertToGameTime();
    }, 30000); // 30 seconds
  }

  async stop() {
    clearInterval(this.weatherInterval);
    clearInterval(this.timeInterval);
  }
}

module.exports = WeatherSyncPlugin;
