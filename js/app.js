let apiKey = "d932c65c56128a6198aad585e55419a9";
let weatherEndpoint =
  "https://api.openweathermap.org/data/2.5/weather?appid=d932c65c56128a6198aad585e55419a9&q=";
let cityInp = document.getElementById("cityInp");
let city = document.getElementById("cityName");
let day = document.getElementById("day");
let humidity = document.getElementById("humidity");
let pressure = document.getElementById("pressure");
let temperature = document.getElementById("temperature");
let windDirection = document.getElementById("windDirection");
let windSpeed = document.getElementById("windSpeed");
let imageIcon = document.getElementById("imageIcon");
let country = document.getElementById("country");
let futureForecastSec = document.getElementById("futureForecastSec");
let citySuggesstion = document.getElementById("citySuggesstion");

cityInp.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    getWeatherDetails(cityInp.value);
    citySuggesstion.innerHTML = "";
  } else {
    getSuggestions(cityInp.value);
  }
});

let getOptions = async (cityName) => {
  let response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},&limit=5&appid=d932c65c56128a6198aad585e55419a9`
  );
  let suggestions = await response.json();
  return suggestions;
};

const getSuggestions = async (cityName) => {
  let Options = await getOptions(cityName);
  citySuggesstion.innerHTML = "";

  if (cityName.length > 0) {
    // console.log(cityName);
    Options.forEach((suggest) => {
      citySuggesstion.innerHTML += `<option>${suggest.name},${suggest.state}</option>`;
    });
  }
};

const getWeatherIconImage = (iconId) => {
  if (iconId >= 701 && iconId <= 781) {
    return "images/mist.png";
  } else if ((iconId >= 600 && iconId <= 622) || iconId === 511) {
    return "images/snow.png";
  } else if (iconId >= 500 && iconId <= 504) {
    return "images/rain.png";
  } else if (iconId >= 200 && iconId <= 232) {
    return "images/thunderstrom.png";
  } else if (iconId >= 300 && iconId <= 321) {
    return "images/shower-rain.png";
  } else if (iconId === 803 || iconId === 804) {
    return "images/broken-clouds.png";
  } else if (iconId === 802) {
    return "images/scattered-clouds.png";
  } else if (iconId === 801) {
    return "images/few-clouds.png";
  } else if (iconId === 800) {
    return "images/clear-sky.png";
  }
};

const getWindDirection = (deg) => {
  if (deg >= 45 && deg < 135) {
    return "East, ";
  } else if (deg >= 135 && deg < 225) {
    return "South, ";
  } else if (deg >= 225 && deg < 315) {
    return "West, ";
  } else {
    return "North, ";
  }
};

const getWeatherDay = (miliSec) => {
  let today = new Date(miliSec);
  let day = today.toLocaleDateString("en", { weekday: "long" });
  return day;
};

const getIcon = (iconId) => {
  let iconUrl = `https://openweathermap.org/img/wn/${iconId}@2x.png`;
  return iconUrl;
};

const getFutureWeather = async (cityName) => {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=d932c65c56128a6198aad585e55419a9&units=metric`
  );
  let futureWeather = await response.json();
  let futureWeatherList = [];
  futureWeather.list.forEach((data) => {
    if (new Date(data.dt_txt).getHours() === 12) {
      futureWeatherList.push(data);
    }
  });
  // console.log("futureWeatherList", futureWeatherList);
  futureForecastSec.innerHTML = "";
  futureWeatherList.forEach((eachDay) => {
    let weatherDay = getWeatherDay(eachDay.dt_txt);
    let iconPath = getIcon(eachDay.weather[0].icon);
    let temp =
      eachDay.main.temp > 0
        ? `+${Math.round(eachDay.main.temp, 0)}`
        : Math.round(eachDay.main.temp, 2);
    futureForecastSec.innerHTML +=
      `<div class="col-lg col-md-4 col-sm-6 p-2">
          <div class="card bg-light text-body bg-opacity-25 py-3 rounded-4">
            <img src="${iconPath}" class="card-img" alt="...">
            <div class="card-img-overlay">
              <h5 class="card-title fw-bold">${weatherDay}</h5>
              <h3><span>${temp}</span> &#8451;</h3>
            </div>
        </div>
      </div>`;
  });
};

const getTodaysWeather = async (cityName) => {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?appid=d932c65c56128a6198aad585e55419a9&units=metric&q=${cityName}`
  );
  let todaysWeather = await response.json();
  console.log(todaysWeather.cod);
  if (todaysWeather.cod === "404") {
    Swal.fire({
      title: "Error: 404",
      text: "Invalid input given by user.",
      icon: "error",
    });
    getCurrentCityWeather();
  }
  let iconSrc = "";
  city.innerText = todaysWeather.name;
  todaysWeather.sys.country
    ? (country.innerText = `, ${todaysWeather.sys.country}`)
    : (country.innerText = "");
  humidity.innerText = todaysWeather.main.humidity;
  pressure.innerText = todaysWeather.main.pressure;
  todaysWeather.main.temp > 0
    ? (temperature.innerText = `+${Math.round(todaysWeather.main.temp, 0)}`)
    : (temperature.innerText = Math.round(todaysWeather.main.temp, 0));
  windSpeed.innerText = todaysWeather.wind.speed;
  windDirection.innerText = getWindDirection(todaysWeather.wind.deg);
  iconSrc = getWeatherIconImage(todaysWeather.weather[0].id);
  imageIcon.setAttribute("src", iconSrc);
  day.innerText = getWeatherDay(todaysWeather.dt * 1000);
  return true;
};

const getWeatherDetails = async (cityName) => {
  let cityIsValid = await getTodaysWeather(cityName);
  if (cityIsValid) {
    getFutureWeather(cityName);
  }
};

const getCityName = async (lat, lon) => {
  let response = await fetch(
    `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=${1}&appid=d932c65c56128a6198aad585e55419a9`
  );
  let cityDetails = await response.json();
  getWeatherDetails(cityDetails[0].name);
};

function getCurrentCityWeather() {
  let options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 };

  navigator.geolocation.getCurrentPosition(getPosition, cannotGetPos, options);

  function cannotGetPos(failed) {
    Swal.fire({
      title: "Error",
      text: "Please allow the browser to get current location!!",
      icon: "error",
    });
  }

  function getPosition(pos) {
    let latitude = pos.coords.latitude;
    let longitude = pos.coords.longitude;
    getCityName(latitude, longitude);
    Swal.fire({
      title: "Success",
      text: "Current City Weather Forecast",
      icon: "success",
    });
  }
}

window.addEventListener("load", () => {
  getCurrentCityWeather();
});
