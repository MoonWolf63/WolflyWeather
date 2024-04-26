const axios = require('axios');

class WeatherSyncPlugin {
  constructor(omegga, config, store) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
    this.weatherAPIKey = this.config.apikey; // Your Tomorrow.io API key
    this.weatherEndpoint = `https://api.tomorrow.io/v4/timelines?location=${this.config.Latitude},${this.config.Longitude}&fields=precipitationType,precipitationIntensity,cloudCover,visibility&units=imperial&apikey=${this.weatherAPIKey}`;
  }

  async fetchWeatherData() {
    try {
      const response = await axios.get(this.weatherEndpoint);
      const data = response.data.data.timelines[0].intervals[0].values;
      return {
        rainIntensity: data.precipitationIntensity,
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

    const environmentPreset = {
      type: 'Environment',
      data: {
        groups: {
          Sky: {
            weatherIntensity: precipitationType === 'rain' ? rainIntensity * 100 : (precipitationType === 'snow' ? 100 : 0),
            cloudCoverage: decimalCloudCoverage,  // Now correctly using a decimal value
            precipitationParticleAmount: (precipitationType === 'rain' || precipitationType === 'snow') ? 100 : 0,
            fogDensity: Math.max(0.005, Math.min(3, 3 * (1 - (visibility / 10))))
          }
        }
      }
    };

    // Load the environment data into the game
    await this.omegga.loadEnvironmentData(environmentPreset);
    console.log(`Weather updated: ${JSON.stringify(environmentPreset)}`);
}




  convertToGameTime() {
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
            timeOfDay: gameHour
          }
        }
      }
    };

    // Load the environment data into the game
    this.omegga.loadEnvironmentData(environmentPreset);
    console.log(`Game time set to ${gameHour} based on real-world time.`);
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
