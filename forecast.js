// 1. Update date : 
function updateDate() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = dateString;
}
updateDate();

// 2. Weather API : 
const apiKey = 'c9b92b37a781099bfe61bb33f698ac80'; 

function setWeatherIcon(main, isMainCard = false, forecastTime = null) {
    main = main.toLowerCase();
    const timeToUse = forecastTime ? new Date(forecastTime * 1000) : new Date();
    // icon based on time , moon for night and sun for day 
    const hour = timeToUse.getHours();
    const isNight = hour >= 18 || hour < 6;
    
    if (main.includes('cloud')) {
        if (isMainCard) {
            // White icons for main card : moon for night time and sun for morning
            return isNight ? 'assests/clouds-night-white.png' : 'assests/clouds-white.png';
        } else {
            // Colored icons for forecast cards
            return isNight ? 'assests/clouds-night.png' : 'assests/clouds-colour.png';
        }
    }
    
    if (main.includes('rain')) {
        return isMainCard ? 'assests/rain-white.png' : 'assests/colour-rain.png';
    }
    
    if (main.includes('clear')) {
        if (isMainCard) {
                    return isNight ? 'assests/moon-white.png' : 'assests/sunny-white.png';
        } else {
            return isNight ? 'assests/moon-colour.png' : 'assests/sunny-colour.png';
        }
    }
    
    if (main.includes('snow')) {
        return isMainCard ? 'assests/snow-white.png' : 'assests/snow-colour.png';
    }
    
    if (main.includes('storm') || main.includes('thunder')) {
        return isMainCard ? 'assests/storm-white.png' : 'assests/storm_colour.png';
    }
    
    // Default : 
    return isMainCard ? 'assests/sunny-white.png' : 'assests/sunny-colour.png';
}


//fetch nature backgrounds for the main card based on time
function updateBackground() {
    const pixabayApiKey = "51349180-43074c1dd435338ee2dcb1b5e";
    const hour = new Date().getHours();
    
    let searchQuery = 'nature landscape';
    
    if (hour >= 5 && hour < 8) {
        // Early morning (5-8 AM) : Sunrise
        searchQuery = 'sunrise nature landscape';
    } 
    else if (hour >= 8 && hour < 12) {
        // Morning (8-12 PM) : Bright day
        searchQuery = 'sunny nature landscape day';
    } 
    else if (hour >= 12 && hour < 16) {
        // Afternoon (12-4 PM) : Peak sun
        searchQuery = 'nature landscape bright day';
    } 
    else if (hour >= 16 && hour < 19) {
        // Late afternoon (4-7 PM) : Golden hour
        searchQuery = 'sunset nature landscape golden hour';
    } 
    else if (hour >= 19 && hour < 21) {
        // Evening (7-9 PM) : Dusk
        searchQuery = 'dusk nature landscape evening';
    } 
    else {
        // Night (9 PM - 5 AM) : Night sky
        searchQuery = 'night sky stars nature';
    }
    
    fetch(`https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&per_page=10&safesearch=true&order=popular&min_width=1920&min_height=1080`)
        .then(response => response.json())
        .then(data => {
            const weatherBg = document.getElementById('weather-bg');
            
            if (data.hits && data.hits.length > 0) {
                const goodImage = data.hits.find(hit => 
                    (hit.tags.toLowerCase().includes("nature") ||
                     hit.tags.toLowerCase().includes("landscape") ||
                     hit.tags.toLowerCase().includes("sky")) &&
                    hit.imageWidth >= 1920 &&
                    hit.imageHeight >= 1080 &&
                    !hit.tags.toLowerCase().includes("city") &&
                    !hit.tags.toLowerCase().includes("building")
                );
                
                const natureImage = goodImage ? goodImage.webformatURL : data.hits[0].webformatURL;
                weatherBg.style.backgroundImage = `url('${natureImage}')`;
            } else {
                weatherBg.style.backgroundImage = "url('assests/forcastbg.png')";
            }
        })
        .catch(() => {
            document.getElementById('weather-bg').style.backgroundImage = "url('assests/forcastbg.png')";
        });
}
// fetch today-s forecast
function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert('City not found!');
                return;
            }
            
            updateBackground();
            
            // City and country
            document.getElementById('city-name').textContent = data.name;
            document.getElementById('country-name').textContent = data.sys.country;

            // Temperature
            document.getElementById('current-temp').textContent = Math.round(data.main.temp) + '°';

            // Weather description
            document.getElementById('weather-description').textContent = data.weather[0].description;

            // High/Low
            document.getElementById('temp-high').textContent = Math.round(data.main.temp_max) + '°';
            document.getElementById('temp-low').textContent = Math.round(data.main.temp_min) + '°';

            // Wind and humidity
            document.getElementById('wind-speed').textContent = Math.round(data.wind.speed) + ' km/h';
            document.getElementById('humidity').textContent = data.main.humidity + '%';

            // Weather icon (main card - white icons)
            document.getElementById('weather-icon-img').src = setWeatherIcon(data.weather[0].main, true);
            document.getElementById('weather-icon-img').alt = data.weather[0].description;
            
            // Update today's highlight section
            updateTodayHighlight(data);
            
            // Fetch 5-day forecast
            fetchForecast(city);
        })
        .catch(() => {
            alert('Error fetching weather data!');
        });
}

// fetch 5-day forecast
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(tab => tab.classList.remove('active'));

            // Add active class to clicked 
            this.classList.add('active');
            
            const tabType = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabType);
            
            if (tabType === 'today') {
                if (window.todayForecasts) {
                    console.log('Switching to today forecasts:', window.todayForecasts.length);
                    updateCardsWithData(window.todayForecasts);
                } else {
                    console.log('No today forecasts available');
                }
            } else if (tabType === 'week') {
                if (window.weekForecasts) {
                    console.log('Switching to week forecasts:', window.weekForecasts.length);
                    updateCardsWithData(window.weekForecasts);
                } else {
                    console.log('No week forecasts available');
                }
            }
        });
    });
});

function updateCardsWithData(forecastData) {
    console.log('Updating cards with data:', forecastData.length, 'forecasts');
    const forecastCards = document.querySelectorAll('.forecast-card');
    console.log('Found', forecastCards.length, 'forecast cards in DOM');
    
    forecastCards.forEach(card => {
        card.style.display = 'block';
    });
    
    forecastCards.forEach((card, index) => {
        const dateTimeElement = card.querySelector('.card-date-time');
        const conditionElement = card.querySelector('.card-weather-condition');
        const tempElement = card.querySelector('.card-info-item:first-child .card-value');
        const humidityElement = card.querySelector('.card-info-item:last-child .card-value');
        const iconElement = card.querySelector('.card-weather-icon');
        
        if (forecastData[index]) {
            const forecast = forecastData[index];
            
            const forecastDate = new Date(forecast.dt * 1000);
            const dateOptions = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            };
            const timeOptions = { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            };
            const dateStr = forecastDate.toLocaleDateString('en-US', dateOptions);
            const timeStr = forecastDate.toLocaleTimeString('en-US', timeOptions);
            dateTimeElement.textContent = `${dateStr}, ${timeStr}`;
            
            conditionElement.textContent = forecast.weather[0].description;
            
            // Update temperature
            tempElement.textContent = Math.round(forecast.main.temp) + '°';
            
            // Update humidity
            humidityElement.textContent = forecast.main.humidity + '%';
            
            iconElement.src = setWeatherIcon(forecast.weather[0].main, false, forecast.dt);
            iconElement.alt = forecast.weather[0].description;
            
            console.log(`Card ${index + 1} updated:`, dateStr, timeStr, forecast.weather[0].description);
        } else {
            // Hide card if no data : 
            card.style.display = 'none';
            console.log(`Card ${index + 1} hidden - no data`);
        }
    });
}

function updateForecastCards(forecastList) {
    console.log('Updating forecast cards with data:', forecastList.length, 'forecasts');
    
    const dailyForecasts = {};
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString(); 
        
        if (!dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = [];
        }
        dailyForecasts[dayKey].push(item);
    });
    
    console.log('Daily forecasts organized:', Object.keys(dailyForecasts));
    
    const uniqueDays = Object.keys(dailyForecasts).slice(0, 5);
    
    window.todayForecasts = [];
    window.weekForecasts = [];
    
    const today = new Date();
    const todayKey = today.toDateString();
    console.log('Today:', todayKey);
    
    if (dailyForecasts[todayKey]) {
        const todayForecasts = dailyForecasts[todayKey];
        console.log('Today forecasts available:', todayForecasts.length);
        
        // Sort forecasts by time
        todayForecasts.sort((a, b) => a.dt - b.dt);
        
        const step = Math.max(1, Math.floor(todayForecasts.length / 5));
        for (let i = 0; i < 5 && i * step < todayForecasts.length; i++) {
            window.todayForecasts.push(todayForecasts[i * step]);
        }
        
        while (window.todayForecasts.length < 5 && todayForecasts.length > window.todayForecasts.length) {
            const remainingForecasts = todayForecasts.filter(f => 
                !window.todayForecasts.some(tf => tf.dt === f.dt)
            );
            if (remainingForecasts.length > 0) {
                window.todayForecasts.push(remainingForecasts[0]);
            } else {
                break;
            }
        }
        
        // Sort by time to ensure chronological order
        window.todayForecasts.sort((a, b) => a.dt - b.dt);
        
        console.log('Selected today forecasts with times:', window.todayForecasts.map(f => {
            const date = new Date(f.dt * 1000);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }));
    } else {
        const firstDay = uniqueDays[0];
        if (firstDay && dailyForecasts[firstDay]) {
            console.log('No today data, using first available day:', firstDay);
            const dayForecasts = dailyForecasts[firstDay];
            const step = Math.max(1, Math.floor(dayForecasts.length / 5));
            for (let i = 0; i < 5 && i * step < dayForecasts.length; i++) {
                window.todayForecasts.push(dayForecasts[i * step]);
            }
        }
    }
    
    if (window.todayForecasts.length === 0 && uniqueDays.length > 0) {
        const firstDay = uniqueDays[0];
        if (dailyForecasts[firstDay]) {
            console.log('No today forecasts found, using first day data');
            const dayForecasts = dailyForecasts[firstDay];
            const step = Math.max(1, Math.floor(dayForecasts.length / 5));
            for (let i = 0; i < 5 && i * step < dayForecasts.length; i++) {
                window.todayForecasts.push(dayForecasts[i * step]);
            }
        }
    }
    
    // Week forecasts 
    uniqueDays.forEach(dayKey => {
        const dayForecasts = dailyForecasts[dayKey];
        if (dayForecasts.length > 0) {
            const noonForecast = dayForecasts.find(f => {
                const hour = new Date(f.dt * 1000).getHours();
                return hour >= 11 && hour <= 13;
            }) || dayForecasts[0];
            window.weekForecasts.push(noonForecast);
        }
    });
    
    if (window.weekForecasts.length === 0 && uniqueDays.length > 0) {
        console.log('No week forecasts found, using available data');
        uniqueDays.forEach(dayKey => {
            const dayForecasts = dailyForecasts[dayKey];
            if (dayForecasts.length > 0) {
                window.weekForecasts.push(dayForecasts[0]);
            }
        });
    }
    
    console.log('Today forecasts:', window.todayForecasts.length);
    console.log('Week forecasts:', window.weekForecasts.length);
    
    updateCardsWithData(window.todayForecasts);
}

function fetchForecast(city) {
    console.log('Fetching forecast for:', city);
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            console.log('Forecast API response:', data);
            if (data.cod !== '200') {
                console.log('Error fetching forecast:', data.message);
                return;
            }
            
            console.log('Forecast data received:', data.list.length, 'forecasts');
            updateForecastCards(data.list);
        })
        .catch((error) => {
            console.log('Error fetching forecast data:', error);
        });
}

function updateTodayHighlight(weatherData) {
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    
    // Update highlight date
    document.getElementById('highlight-date').textContent = now.toLocaleDateString('en-US', dateOptions);
    
    // Update high and low temperatures
    document.getElementById('highlight-high').textContent = Math.round(weatherData.main.temp_max) + '°';
    document.getElementById('highlight-low').textContent = Math.round(weatherData.main.temp_min) + '°';
    
    //update temperature variation
    const variation = Math.round(weatherData.main.temp_max - weatherData.main.temp_min);
    document.getElementById('temp-variation').textContent = variation + '°';
}

//Fetch Breaking News
function fetchBreakingNews() {
    const newsApiKey = "d917e18c73624063830b34efa1f4bb18";
    
    // specific weather search : 
    const weatherSearchTerms = [
        "weather forecast",
        "storm warning", 
        "hurricane update",
        "climate change weather",
        "extreme weather",
        "weather alert",
        "meteorological forecast"
    ];
    
    const searchPromises = weatherSearchTerms.map(term => {
        const newsUrl = `https://newsapi.org/v2/everything?q="${term}"&sortBy=publishedAt&language=en&pageSize=5&apiKey=${newsApiKey}`;
        return fetch(newsUrl).then(response => response.json());
    });
    
    Promise.all(searchPromises)
        .then(results => {
            let allArticles = [];
            results.forEach(result => {
                if (result.articles) {
                    allArticles = allArticles.concat(result.articles);
                }
            });
            
            // Weather filtering
            const weatherKeywords = [
                "weather", "storm", "rain", "flood", "climate", "snow", "temperature",
                "hurricane", "tornado", "heatwave", "drought", "typhoon", "cyclone", 
                "blizzard", "forecast", "meteorology", "atmosphere", "precipitation",
                "weather forecast", "storm warning", "weather alert", "meteorological"
            ];
            
            const weatherArticles = allArticles.filter(article => {
                const title = (article.title || "").toLowerCase();
                const description = (article.description || "").toLowerCase();
                const content = title + " " + description;
                
                const keywordCount = weatherKeywords.filter(word => content.includes(word)).length;
                return keywordCount >= 2;
            });
            
            // Remove duplicates based on title : 
            const uniqueArticles = weatherArticles.filter((article, index, self) => 
                index === self.findIndex(a => a.title === article.title)
            );
            
            // Update news cards with weather articles : 
            uniqueArticles.slice(0, 3).forEach((article, index) => {
                const cardIndex = index + 1;
                
                const newsImg = document.getElementById(`news-img-${cardIndex}`);
                if (newsImg) {
                    newsImg.src = article.urlToImage || 'assests/default-news.jpg';
                    newsImg.alt = article.title;
                }
                
                const newsDate = document.getElementById(`news-date-${cardIndex}`);
                if (newsDate && article.publishedAt) {
                    const date = new Date(article.publishedAt);
                    newsDate.textContent = date.toLocaleDateString('en-GB');
                }
                
                const newsSource = document.getElementById(`news-source-${cardIndex}`);
                if (newsSource) {
                    newsSource.textContent = article.source.name || 'Weather News';
                }
                
                const newsSnippet = document.getElementById(`news-snippet-${cardIndex}`);
                if (newsSnippet) {
                    const snippet = article.description || article.title || 'Weather news article';
                    newsSnippet.textContent = snippet.length > 120 ? snippet.substring(0, 120) + '...' : snippet;
                }
                
                const newsAuthor = document.getElementById(`news-author-${cardIndex}`);
                if (newsAuthor) {
                    newsAuthor.textContent = article.author || 'Weather Reporter';
                }
                
                const newsLink = document.getElementById(`news-link-${cardIndex}`);
                if (newsLink) {
                    newsLink.href = article.url;
                }
            });
            
            if (uniqueArticles.length === 0) {
                for (let i = 1; i <= 3; i++) {
                    const newsSnippet = document.getElementById(`news-snippet-${i}`);
                    if (newsSnippet) {
                        newsSnippet.textContent = 'No weather news available at the moment';
                    }
                }
            }
        })
        .catch(error => {
            console.log('Error fetching weather news:', error);
            for (let i = 1; i <= 3; i++) {
                const newsSnippet = document.getElementById(`news-snippet-${i}`);
                if (newsSnippet) {
                    newsSnippet.textContent = 'Weather news temporarily unavailable';
                }
            }
        });
}

// Set setif as default city
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('city-input').value = 'Setif';
    fetchWeather('Setif');
    
    // Fetch breaking news
    fetchBreakingNews();
});

// Search bar : 
document.getElementById('city-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        fetchWeather(this.value);
    }
});

// all news => news.html
document.addEventListener('DOMContentLoaded', function() {
  const allNewsBtn = document.querySelector('.all-news-btn');
  if (allNewsBtn) {
    allNewsBtn.addEventListener('click', function() {
      window.location.href = 'news.html';
    });
  }
});


