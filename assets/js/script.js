let APIKey = "250170e71f5020acdde2e8bfe0470ffe";
let locations = [];


function getWeatherData(lat, lon, city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=,minutely,hourly,alerts&appid=" + APIKey;

    //call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        
        .then(function (response) {

            // console.log(response);

            showWeatherData(response, city);

        });           
 };


 //call the weather API based on ZipCode 
function loadWeatherZip(zipCpde, isClicked) {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?zip=" + zipCpde + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    // Here we run our AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        
        .then(function (response) { 

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);  //save the city and zip to local storage
                renderLocations();
            }


            //load weather
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function (response){
            alert("Not a vaild Zip Code")
        });
}

function loadWeatherCity(city, isClicked) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    //call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        
        .then(function (response) {

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);  //save the city and zip-code to the local storage
                renderLocations();
            }

            
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function(response){
            alert("Not a valid City");
        });
}

function showWeatherData(weatherData, city)
{
    //load current
    var iconURL = "http://openweathermap.org/img/w/" + weatherData.current.weather[0].icon + ".png";  //get weather icon
    $("#cityDate").html(city + " (" + new Date().toLocaleDateString() + ") <img id=\"icon\" src=\"" + iconURL  + "\" alt=\"Weather icon\"/>");

    var temp = parseInt(weatherData.current.temp);
    temp = Math.round(((temp-273.15)*1.8) + 32);
    $("#currentTemp").html(" " + temp +  "  &degF");
    $("#currentHumidity").html(weatherData.current.humidity + "%");
    $("#currentWindSpeed").html(weatherData.current.wind_speed + " MPH");

   
    var uvIndex = weatherData.current.uvi;

    var bgColor = "";  //background color for UV Index
    var textColor = "";  //text color for UV Index

    if (uvIndex < 3) //if uv index is low (1-2)
    {
        bgColor = "bg-success";
        textColor = "text-light";  
    }
    else if (uvIndex > 2 && uvIndex < 6)  
    {
        bgColor = "bg-warning";
        textColor = "text-dark";             
    }
    else  //if uv index is high 
    {
        bgColor = "bg-danger";
        textColor = "text-light";            
    }

    $("#currentUVIndex").html(uvIndex).addClass(bgColor + " p-1 " +  textColor); 


    //load 5 Day
    var ul5 = $("#fiveDay");
    ul5.empty();

    for (i=1; i < 6; i++)  
    {
        var div = $("<div>").addClass("bg-primary");

        var dateTime = parseInt(weatherData.daily[i].dt); 
        var dateHeading = $("<h6>").text(new Date(dateTime * 1000).toLocaleDateString());  
        var iconDayURL = "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0].icon + ".png";  //get weather icon
        var icon = $("<img>").attr("src", iconDayURL);

        temp = parseInt(weatherData.daily[i].temp.day);  
        temp = Math.round(((temp-273.15)*1.8) + 32);  //convert kelvin to Fahrenheit
        var temp5 = $("<p>").html("Temp: " + temp +  "  &degF");

        var humidity5 = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + "%");

        div.append(dateHeading);
        div.append(icon);
        div.append(temp5);
        div.append(humidity5);
        ul5.append(div);

    }

    $("#weatherData").show();
}

//load locations from local storage to the locations array
function loadLocations()
{
    var locationsArray = localStorage.getItem("locations");
    if (locationsArray) 
    {
      locations = JSON.parse(locationsArray);  
      renderLocations();
    }
    else {
      localStorage.setItem("locations", JSON.stringify(locations));  //if not make one and store it to local storage
    }
}

function renderLocations()
{
    var divLocations = $("#locationHistory");
    divLocations.empty();  //clear the cities list before rendering it from the local storage object

    $.each(locations, function(index, item){
        var a = $("<a>").addClass("list-group-item list-group-item-action city").attr("data-city", locations[index]).text(locations[index]);
        divLocations.append(a);
    });

    $("#locationHistory > a").off();

    $("#locationHistory > a").click(function (event)
    {   
        var element = event.target;
        var city = $(element).attr("data-city");

        loadWeatherCity(city, true);
    });

}

//save locations to the locations array and local storage
function saveLocations(data)
{

    var city = data.city.name; //get the city came

    locations.unshift(city);
    localStorage.setItem("locations", JSON.stringify(locations));  //convert to a string and sent to local storage

}

$(document).ready(function () {

    $("#weatherData").hide();  

    loadLocations();  

    $("#searchBtn").click(function (event) {  //event handler for the city search input
        var element = event.target; 
        var searchCriteria = $("#zipCode").val();  
        
        if (searchCriteria !== "")  
        {
            var zip = parseInt(searchCriteria); 

            if (!isNaN(zip)) 
            {
                loadWeatherZip(zip, false);
            }
            else
            {
                loadWeatherCity(searchCriteria, false);  
            }
        }
    });
});