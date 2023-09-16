let endpoint_weather = "https://api.openweathermap.org/data/2.5/weather?";
let endpoint_forcast = "https://api.openweathermap.org/data/2.5/forecast?";
let endpoint_suggestions = "http://api.openweathermap.org/geo/1.0/direct?";
let endpoint_loaction = "https://api.openweathermap.org/data/2.5/weather?";

let srch_box = document.querySelector(".country_search");
let city = document.querySelector(".city_name");
let day = document.querySelector(".day_name");
let humidity = document.querySelector(".humidity-indicator");
let wind = document.querySelector(".wind-indicator");
let pressure = document.querySelector(".pressure-indicator");
let temp = document.querySelector(".temprature");
let forcast_div = document.querySelector(".forcast_week");
let weather_icon = document.querySelector("img#icon");
let suggestion_datalist = document.querySelector("datalist#suggestion");

let change_weather_details = (weather_list)=>{

    let wind_dir = weather_list.wind.deg;
    if(wind_dir >=45 && wind_dir<= 135)
        wind_dir = 'East';
    if(wind_dir >=135 && wind_dir<= 225)
        wind_dir = 'South';
    if(wind_dir >=225 && wind_dir<= 315)
        wind_dir = 'West';
    else
    wind_dir = 'North'

    let act_temp = Math.round(weather_list.main.temp);

    let full_city_name = `${weather_list.name} ${weather_list.sys.country?","+weather_list.sys.country:""}`;
    city.innerText=full_city_name;
    let week_day = get_day(weather_list.dt);
    day.innerText = week_day;
    humidity.innerText = weather_list.main.humidity;
    pressure.innerText = weather_list.main.pressure;
    wind.innerText = `${wind_dir}, ${weather_list.wind.speed}`;
    temp.innerHTML =  act_temp> 0?`+${act_temp}`:act_temp;
    
    let id = weather_list.weather[0].id;
    let url="";
    if (id>=701 && id<=781)
        url =  "/Images/mist.png";
    else if ((id>=600 && id<=722) || id===511)
        url = "/Images/snow.png";
    else if (id>=500 && id<=504)
        url = "/Images/rain.png";
    else if (id>=200 && id<=232)
        url = "/Images/thunderstrom.png";
    else if (id>=300 && id<=321)
        url = "/Images/shower-rain.png";
    else if (id===803 || id===804)
        url = "/Images/broken-clouds.png";
    else if (id===802)
        url = "/Images/scattered-clouds.png";
    else if (id===801)
        url = "/Images/few-clouds.png";
    else if (id===800)
        url = "/Images/clear-sky.png";

    weather_icon.setAttribute("src",url);
};

let get_day = (dt)=>{
    let ms = dt*1000;
    let current = new Date(ms);
    return current.toLocaleDateString("en-EN",{weekday:"long"});
};

let get_forcast_details = async (url)=>{
    let response = await fetch(url);
    let forcast_json =  response.json();
    return forcast_json;
};

let change_forcast_details = (forcast_list)=>{
    forcast_days = [];
    forcast_list.forEach(week_obj => {
        let hour = new Date(week_obj.dt_txt.replace(" ","T")).getHours();
        if(hour===12){
            forcast_days.push(week_obj);
        }
    });
    forcast_div.innerHTML = "";
    forcast_days.forEach((obj)=>{
        let act_temp = Math.round(obj.main.temp);
        let url = `https://openweathermap.org/img/wn/${obj.weather[0].icon}@2x.png`;
        forcast_div.innerHTML +=` 
        <article class="week_card">
            <div>
                <img class="week_icon" src=${url} />
            </div>
            <h3 class="week_day">${get_day(obj.dt)}</h3>
            <p>
                <span>${act_temp> 0?`+${act_temp}`:act_temp}</span>&deg;C
            </p>
        </article>`
    });

};

let get_suggestions = async(url)=>{

    let response = await fetch(url);
    let suggest_json = await response.json();
    return suggest_json;
};

let display_suggest_options = (suggest_list)=>{
    
    suggestion_datalist.innerHTML = "";
    if(suggest_list.length > 0){
        suggest_list.forEach((suggest_obj)=>{
            suggestion_datalist.innerHTML += `
                <option class='suggestion-option' value=${suggest_obj.name},${suggest_obj.state},${suggest_obj.country} >
            `;
        });
    }
};

let get_dialouge = (obj)=>{
    if(obj.cod==='404')
    {
        let options = {title:"Error!",text:`${obj.message}`,icon:"error"};
        Swal.fire(options);
        srch_box.value = "";
    }
    else if(obj.coords)
    {
        let options = {title:"Success!",text:`Current city Temprature.`,icon:"success"};
        Swal.fire(options);
    }
    
};

let get_weather_details = async (url)=>{
    let response = await fetch(url);
    let weather_json = response.json();
    return weather_json;
};

let handle_weather_details = async(evt)=>{
        if(evt.key==='Enter'){
            let full_endpoint_weather = `${endpoint_weather}q=${srch_box.value}&units=metric&appid=f63f0ff3bfdba021cdb5dae198676e5b`;
            let weather_dets = await get_weather_details(full_endpoint_weather);
            if(weather_dets.cod === '404')
            {
                get_dialouge(weather_dets);
                return false;
            }
            change_weather_details(weather_dets);
    
            let full_endpoint_forcast = `${endpoint_forcast}q=${srch_box.value}&units=metric&appid=f63f0ff3bfdba021cdb5dae198676e5b`;
            let forcast_dets = await get_forcast_details(full_endpoint_forcast);
            change_forcast_details(forcast_dets.list);
        }
}

srch_box.addEventListener("input",async()=>{
    let full_endpoint_suggestions = `${endpoint_suggestions}q=${srch_box.value}&limit=5&appid=f63f0ff3bfdba021cdb5dae198676e5b`;
    let suggestions = await get_suggestions(full_endpoint_suggestions);
    display_suggest_options(suggestions);
});

let get_location = async (url)=>{
    let response = await fetch(url);
    let loc_json = response.json();
    return loc_json;
}

srch_box.addEventListener("keydown",handle_weather_details);

window.addEventListener("load",async()=>{

    let options = {
        enableHighAccuracy:true,
        timeout: 5000,
        maximumAge:10000
    };

    navigator.geolocation.getCurrentPosition(async(success_obj)=>{
        let lon = success_obj.coords.longitude;
        let lat = success_obj.coords.latitude;
        let full_endpoint_loaction = `${endpoint_loaction}lat=${lat}&lon=${lon}&units=metric&appid=f63f0ff3bfdba021cdb5dae198676e5b`;
        let location = await get_location(full_endpoint_loaction);
        change_weather_details(location);
        get_dialouge(success_obj);
        let full_endpoint_forcast = `${endpoint_forcast}q=${location.name}&units=metric&appid=f63f0ff3bfdba021cdb5dae198676e5b`;
        let forcast_dets = await get_forcast_details(full_endpoint_forcast);
        change_forcast_details(forcast_dets.list);
    },
    (failed_obj)=>{
        console.log(failed_obj);
    },
    options
    );

});