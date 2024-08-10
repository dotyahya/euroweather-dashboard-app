var cityMap = new Map();

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);

    // logging the parsed data
    // console.log('CSV data:', allText) // data successfully being read and parsed

    var headers = allTextLines[0].split(',');

    // ensuring the dropdown is empty initially
    $('#city-dropdown').empty();
    $('#city-country').empty();

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var lat = data[0];
            var lon = data[1]
            var city = data[2];
            var country = data[3];

            cityMap.set(city, { lat: lat, lon: lon, country: country });

            var listItem = $('<li></li>');
            var linkItem = $('<a></a>')
                .addClass('dropdown-item')
                .attr('href', '#')
                .text(city + ', ' + country)
                .data('city', city)
                .data('country', country)
                .data('lat', lat)
                .data('lon', lon);

            listItem.append(linkItem);
            $('#city-dropdown').append(listItem);
        }
    }

    // event listener for dropdown item
    $('#city-dropdown').on('click', '.dropdown-item', function () {
        var city = $(this).data('city');
        var country = $(this).data('country');
        var lat = $(this).data('lat');
        var lon = $(this).data('lon');

        
        $('#city-dropdown-menu').text(city + ', ' + country);
        $('#city-country').text(city + ', ' + country);
        fetchWeatherData(lon, lat);
    });
}

function formatDate(dateNum) {
    // extraction of year, month, and day 
    const dateStr = dateNum.toString();

    // (YYYYMMDD)
    if (dateStr.length !== 8) {
        console.error('Invalid date format:', dateStr);
        return '';
    }

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6) - 1; // Months are 0-indexed in JavaScript Date?
    const day = dateStr.substring(6, 8);

    const date = new Date(year, month, day);

    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };

    return date.toLocaleDateString('en-US', options);
}

// fetch API for hitting 7Timer endpoint
function fetchWeatherData(lon, lat) {
    const spinner = $('#loading-spinner');
    spinner.show();

    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch(`http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json`, requestOptions)
        .then(response => response.json())
        .then(result => {
            const forecastCards = document.getElementById('forecast-cards');
            forecastCards.innerHTML = ''; // existing cards to be cleared
            const weatherData = result.dataseries;

            if (weatherData.length === 0) {
                forecastCards.innerHTML = '<p>No data available.</p>';
                spinner.hide();
                return;
            }

            const weatherCardsHtml = weatherData.map(day => {
                const weatherImage = getWeatherImage(day.weather);
                const weatherName = getWeatherName(day.weather);
                
                return `
                    <div class="weather__card d-flex flex-column align-items-center">
                        <div class="p-0 text-center">
                            <img src="${weatherImage}" alt="Weather Icon">
                        </div>
                        <div class="d-flex flex-column justify-content-center align-items-center">
                            <div class="p-2 text-center">
                                <h2>Hi: ${day.temp2m.max}&deg;</h2>
                                <h2>Lo: ${day.temp2m.min}&deg;</h2>
                            </div>
                            <div class="p-2 text-center">
                                <h5>${formatDate(day.date)}</h5>
                                <h3>${weatherName}</h3>
                            </div>
                            <div class="weather__status">
                                <img src="https://svgur.com/i/oKS.svg" alt="Wind Icon">
                                <span>${day.wind10m_max} km/h</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            forecastCards.innerHTML = weatherCardsHtml;
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            spinner.hide();
        });
}

function getWeatherImage(weather) {
    switch (weather) {
        case 'mcloudy': return './assets/images/mcloudy.png';
        case 'cloudy': return './assets/images/cloudy.png';
        case 'lightrain': return './assets/images/rain.png';
        case 'pcloudy': return './assets/images/pcloudy.png';
        case 'clear': return './assets/images/clear.png';
        case 'rain': return './assets/images/rain.png'; 
        case 'snow': return './assets/images/snow.png'; 
        case 'ts': return './assets/images/ts.png'; 
        case 'oshower': return './assets/images/sleet.png'; 
        case 'ishower': return './assets/images/sleet.png'; 
        default: return './assets/images/clear.png';
    }
}

function getWeatherName(weather) {
    switch (weather) {
        case 'mcloudy': return 'Mostly Cloudy';
        case 'cloudy': return 'Cloudy';
        case 'lightrain': return 'Light Rain';
        case 'pcloudy': return 'Partly Cloudy';
        case 'clear': return 'Clear';
        case 'rain': return 'Rain'; 
        case 'snow': return 'Snow'; 
        case 'ts': return 'Thunderstorm'; 
        case 'oshower': return 'Occassional Showers'; 
        case 'ishower': return 'Isolated Showers'; 
        default: return 'Clear';
    }
}

function initializeNavbarDropdown() {
    $('#popular-city-dropdown').on('click', '.dropdown-item', function(event) {
        event.preventDefault(); // ignores refreshing the page

        var cityCountry = $(this).text().trim().split(', ');
        var city = cityCountry[0];
        var country = cityCountry[1];
        var lat = $(this).data('lat');
        var lon = $(this).data('lon');

        $('#city-country').text(city + ', ' + country);
        $('#city-dropdown-menu').text(city + ', ' + country);

        console.log(city, " ", country, " ", lat , " ", lon);

        fetchWeatherData(lon, lat);
    });
}

document.getElementById('city-search-form').addEventListener('submit', function (event) {
    event.preventDefault(); // prevents form submission

    var searchInput = document.getElementById('search-city').value.trim();
    
    if (searchInput.length > 0) {
        var foundCity = null;
        
        cityMap.forEach((value, key) => {
            if (key.toLowerCase() === searchInput.toLowerCase()) {
                foundCity = { name: key, ...value };
            }
        });

        if (foundCity) {
            $('#city-dropdown-menu').text(foundCity.name + ', ' + foundCity.country);
            $('#city-country').text(foundCity.name + ', ' + foundCity.country);

            fetchWeatherData(foundCity.lon, foundCity.lat);
        } 
        
        else {
            alert('City not found. Please try another search.');
        }
    } 
    
    else {
        alert('Please enter a city name.');
    }
});

//  read csv file, parse and populate the dropdown menu for city selection
$(document).ready(function () {
    initializeNavbarDropdown();

    $.ajax({
        type: "GET",
        url: "./city_coordinates.csv",
        dataType: "text",
        success: function (data) { processData(data); }
    });
});
