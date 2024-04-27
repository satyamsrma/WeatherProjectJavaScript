

const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");//for class
const searchForm = document.querySelector("[data-searchForm]");//for custom attribute
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially vairables need????

let oldTab = userTab;//by default apni webpage usertab p open hogi ie your weather tab
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");//current tab p kch property set kr rhe hai jo css m defined hai currenr-tab k
getfromSessionStorage();

function switchTab(newTab) { 
    if(newTab != oldTab) {//new tab jo click kiya hai vo old tab ni j
        oldTab.classList.remove("current-tab");//old tab k classlist m jake vo sare css prop hta do
        oldTab = newTab;//newtab ko oldtab bna diya 
        oldTab.classList.add("current-tab");//curr tab ki prop add kr di newtab m, old tab me background colour add krna hai

        if(!searchForm.classList.contains("active")) {//if searchform active ni hai mtlb ispe click hua hai, isko active krna hai
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");//user info page se active class remove krna hai(your weather)
            grantAccessContainer.classList.remove("active");//grand access vle page se active class remove krna hai(acess page)
            searchForm.classList.add("active");//search form vle page me active class dalna hai(search weather)
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we have saved them there.
            getfromSessionStorage();//to get latitide and longitude from storage
        }
    }
}

userTab.addEventListener("click", () => {//user tab p click krege to usertab khulega dusre tab se
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {//searchtab p search krege to ye khulega dusre tab se
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");//sessionStorage me user_coordinates naam k item hai
    if(!localCoordinates) {
        //agar local coordinates nahi mile mtlb location grant ni hua hai to grant tab active hoga
        grantAccessContainer.classList.add("active");
    }
    else {//cordinates hai storage me
        const coordinates = JSON.parse(localCoordinates);//cordinates fetch liya
        fetchUserWeatherInfo(coordinates);//api call fucn
    }

}

async function fetchUserWeatherInfo(coordinates) {//api call thats why async
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");//loading screen visible hoga waiting time m

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();//json m convert krna hai response ko

        loadingScreen.classList.remove("active");//response aagya h to loder ko hta dete h
        userInfoContainer.classList.add("active");//result dikhane k liye infotab ko dikhan ahi
        renderWeatherInfo(data);///data m se value nikal k ui p dynamically input krega 
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        //HW

    }

}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fethc the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);
    //optional chaining operator
    //user?.adress?.pincode --> it sybolises in user goto adress then in adress goto pincode data
//use json formatter to see which component is where in the api call response
    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;//country nikal k lowercase m covert krke call kr diya flag k liye
    desc.innerText = weatherInfo?.weather?.[0]?.description;//weather ek array h uske phle element k liye[0]k use kiya usme discreption m gye
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;//we put the whole statement in placeholder to add degree c sign as string
    
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}

function getLocation() {
    if(navigator.geolocation) {//if support available hai to find
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,//to find lat
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));//session storage m store krlo cordinates ko
    fetchUserWeatherInfo(userCoordinates);//fucn call

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);//click krne p fucn call krna h getlocation

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {//jb submit kkya jayega to e arrow fucn ko call kr dege
    e.preventDefault();//revome default ction
    let cityName = searchInput.value;

    if(cityName === "")//if searched nothing
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");//search krte time, loading dikhao
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();//json m convert
        loadingScreen.classList.remove("active");//response aagya to loadingscreen hta do
        userInfoContainer.classList.add("active");//ab weather dikha do
        renderWeatherInfo(data);
    }
    catch(err) {
        //hW
    }
}