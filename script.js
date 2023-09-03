// weather API URL
const weather_api_Url = `https://api.openweathermap.org/data/2.5/weather`;
// Google map iframe API url
const map_iframe = "https://maps.google.com/maps";
// Open weather Account API key
const api_Key = "6222fb242bffc65d95646f978d8673f6";

// Get elements from html document using their IDs
var Weather_data_details = document.getElementById("Weather_data_details");
const lat_element = document.getElementById('lat');
const long_element = document.getElementById('long');
const mapCord = document.getElementById("map_iframe");


// API to fetch weather data from latitude and longitude
async function fetchWeatherData(latitude, longitude) {

    let url = `${weather_api_Url}?lat=${latitude}&lon=${longitude}&appid=${api_Key}`;
    try {
        let result = await fetch(url, { mode: "cors" });
        let response = await result.json();
        console.log("Response: ", response);

        // handle potential API errors or no data scenarios
        if (response.cod == "400") {
            alert(response.message);
        }
        return response;
    } catch (err) {
        // handle error here
        console.log("Error : fetchWeatherData: ", err);
        alert("Cannot fetch weather details for given co-ordinates");
    }
}

// Function to calculate wind direction from wind degree
async function calculateWindDirection(windDeg) {
    let direction = "";
    switch (windDeg) {
        case 0:
            direction = "North";
            break;
        case 90:
            direction = "East";
            break;
        case 180:
            direction = "South";
            break;
        case 270:
            direction = "West";
            break;
    }
    if (direction == "") {
        if (windDeg > 0 && windDeg < 90) {
            direction = "North East";
        }
        else if (windDeg > 90 && windDeg < 180) {
            direction = "South East";
        }
        else if (windDeg > 180 && windDeg < 270) {
            direction = "South West";
        }
        else if (windDeg > 270 && windDeg < 360) {
            direction = "North West";
        }
    }
    return direction;
}

// Function to convert m/s to km/hr
async function convertWindSpeed(speed) {
    return (3.6 * speed).toFixed(2);
}

// Function to convert hPa to atm
async function convertPressure(pressure) {
    return (pressure * 0.000987).toFixed(2);
}

// Geo location access success callback function
async function locationAccessSuccess(position) {
    var weatherData = [];
    console.log("got coords")
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.log("latitude: ", latitude);
    console.log("longitude: ", longitude);

    // Set latitude and longitude in buttons on top
    lat_element.innerHTML = ` Lat: ${latitude}`;
    long_element.innerHTML = ` Long: ${longitude}`;

    // Using the acquired latitude and longitude, show the user's location on Google Maps.
    mapCord.src = `${map_iframe}?q=${latitude},${longitude}&output=embed`;

    //Fetch weather data from latitude and longitude
    // Call `One Call API` from OpenWeatherMap to fetch the current weather data for the given coordinates
    weatherData = await fetchWeatherData(latitude, longitude);

    // handle potential API errors or no data scenarios
    if (weatherData && weatherData.cod == 200) {

        let wind_direction = await calculateWindDirection(weatherData.wind.deg);    //pass wind degree to convert to function
        console.log("wind direction: ", wind_direction);

        let wind_speed = await convertWindSpeed(weatherData.wind.speed);        //pass wind speed to conevrt to function
        console.log("wind speed: ", wind_speed, "kmph");

        let pressure = await convertPressure(weatherData.main.pressure);        //pass pressure to conevrt to function
        console.log("pressure: ", pressure, "atm");

        let weather_data_html = document.createElement("div");                  // Create element with weather data
        weather_data_html.classList.add("row");
        weather_data_html.innerHTML = `
            <div class="row">
                <div class="col-lg-12 col-md-12 col-xs-12"><h2 id="weather_data_heading">Your Weather Data</h2></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">Location: ${weatherData.name}</button></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">Wind Speed: ${wind_speed}kmph </button></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">Humidity: ${weatherData.main.humidity} </button></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">Time Zone: ${weatherData.timezone}</button></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">Pressure: ${pressure}atm </button></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">Wind Direction: ${wind_direction}</button></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">UV Index: 400 </button></div>
                <div class="col-lg-4 col-md-6 col-xs-12"><button type="button" class="btn btn-primary weather_data_btn">Feels like: ${weatherData.main.feels_like}°</button></div>
            </div>
        `;

        // append weather data to div in html div
        Weather_data_details.append(weather_data_html);
    } else {
        alert("No Weather data available...");
    }
}

// Geo location access Error callback function
async function locationAccessError(err){
    console.log("Error: ", err);
    alert("location access denied, hence cannot show weather data.");
}


// The function to be called on load of script
window.onload = (event) => {
    try {
        if ("geolocation" in navigator) {
            // Geolocation API to fetch the latitude and longitude of the user's current device
            navigator.geolocation.getCurrentPosition( locationAccessSuccess, locationAccessError);
        } else {
            alert("Geolocation is not available in this browser.");
        }
    } catch (err) {
        console.log("Error: ", err);
        alert("Something went wrong!");
    }
};