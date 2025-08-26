// Clé API OpenWeatherMap fournie.
const OPENWEATHER_API_KEY = "898fd0b8f91cf20c956e9cfd91c8899b";

interface EnvironmentalData {
    temperatureC: number;
    humidityPercent: number;
    airQualityIndex: number;
}

/**
 * Converts OpenWeatherMap AQI (1-5) to an EPA-like scale (0-500).
 * This provides a more granular value for the risk score calculation.
 * 1 (Good) -> ~50
 * 2 (Fair) -> ~75
 * 3 (Moderate) -> ~125
 * 4 (Poor) -> ~175
 * 5 (Very Poor) -> ~250
 * @param aqi The AQI value from OpenWeatherMap (1 to 5).
 * @returns A number on the EPA-like scale.
 */
function convertAqi(aqi: number): number {
    switch (aqi) {
        case 1: return 50;
        case 2: return 75;
        case 3: return 125;
        case 4: return 175;
        case 5: return 250;
        default: return 50; // Default to 'Good' if value is unexpected
    }
}

export async function getEnvironmentalData(lat: number, lon: number): Promise<EnvironmentalData | null> {
    const apiKey = OPENWEATHER_API_KEY;

    // La vérification précédente était défectueuse. Puisque la clé est maintenant codée en dur,
    // nous pouvons procéder directement aux appels API.
    // Dans une application de production réelle, cette clé devrait provenir de variables d'environnement.

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const [weatherResponse, airPollutionResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(airPollutionUrl)
        ]);

        if (!weatherResponse.ok || !airPollutionResponse.ok) {
            console.error("Failed to fetch data from OpenWeatherMap", {
                weatherStatus: weatherResponse.status,
                weatherText: weatherResponse.statusText,
                airPollutionStatus: airPollutionResponse.status,
                airPollutionText: airPollutionResponse.statusText
            });
            return null;
        }

        const weatherData = await weatherResponse.json();
        const airPollutionData = await airPollutionResponse.json();
        
        const aqiValue = airPollutionData?.list?.[0]?.main?.aqi;
        if (aqiValue === undefined) {
             console.error("AQI data not found in OpenWeatherMap response");
             return null;
        }

        return {
            temperatureC: Math.round(weatherData.main.temp),
            humidityPercent: weatherData.main.humidity,
            airQualityIndex: convertAqi(aqiValue)
        };

    } catch (error) {
        console.error("Error fetching environmental data:", error);
        return null;
    }
}
