# WolflyWeather Plugin for Omegga

This plugin for Omegga that dynamically adjusts in-game weather and time based on real-time weather data fetched from Tomorrow.io. It enhances gameplay by mirroring real-world weather conditions and synchronizing in-game time with real-world time.

## Features

- Fetches real-time weather data every 10 minutes from Tomorrow.io.
- Updates in-game weather conditions including rain/snow intensity, cloud coverage, and fog density.
- Synchronizes in-game time with real-world time, updating every 30 seconds.
- Customizable update intervals and weather API settings including location specifics.

## Prerequisites

- Node.js
- Omegga Server
- Axios (for API requests)

## Installation

1. **Clone the Plugin**:
   ```bash
   git clone https://github.com/yourusername/weather-sync-plugin.git
   cd weather-sync-plugin
2. **install dependencies**
    ```bash
    npm install
3. **Configuration***
Make sure that the longitude and latitude are changed to reflect the proper location you want, to give an example, Longitude: 40.0640 and Latitude -80.7209. 

Also make sure to change the weatherAPIKey variable to your api key from tomorrow.io.

# Usage
To start using the plugin, make sure your Omegga server is running, and place the plugin in the appropriate directory as per the Omegga documentation. Once that is done, enter the web panel and enter the apikey, longitude, and latitude. The plugin will automatically start fetching weather data and updating the environment once activated.

# Support
If you encounter any issues or have suggestions, please file an issue on the GitHub repository. I know my code isn't exactly the best but hey, it worked didn't it?
