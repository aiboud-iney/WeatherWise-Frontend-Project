document.addEventListener('DOMContentLoaded', function() {
  
  const cityInput = document.getElementById('city-input');
  const cityBtn = document.getElementById('city-validate-btn');
  const cityError = document.getElementById('city-error');

  cityInput.value = 'Setif';
  setTimeout(() => cityBtn.click(), 100);

  cityInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      cityBtn.click();
    }
  });

  // Weather card elements

  const locationDisplay = document.querySelector('.location-selector input');
  const mainImg = document.querySelector('.weather-icon');
  const tempDisplay = document.querySelector('.current-temp');
  const descDisplay = document.querySelector('.weather-details .detail-item span:last-child');
  const dateDisplay = document.querySelector('.date');
  const timeDisplay = document.querySelector('.time');

  const apiKey = 'c9b92b37a781099bfe61bb33f698ac80';
  const pixabayApiKey = '51349180-43074c1dd435338ee2dcb1b5e';

  //fetch city photo 
  function setCityPhoto(city) {
    const pixabayUrl = `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(city + ' city')}&image_type=photo&orientation=horizontal&category=buildings&safesearch=true&per_page=3`;
    
    fetch(pixabayUrl)
      .then(res => res.json())
      .then(data => {
        const mainWeatherIcon = document.getElementById('main-weather-icon');
        if (data.hits && data.hits.length > 0) {
          const cityPhoto = data.hits[0].webformatURL;
          mainWeatherIcon.src = cityPhoto;
          mainWeatherIcon.alt = `${city} city photo`;
          mainWeatherIcon.style.objectFit = 'cover';
          mainWeatherIcon.style.borderRadius = '10px';
          mainWeatherIcon.style.width = '100%';
          mainWeatherIcon.style.height = 'auto';
          mainWeatherIcon.style.maxHeight = '200px';
        } else {
          //default 
          mainWeatherIcon.src = 'assests/nightweather.png';
          mainWeatherIcon.alt = 'Night Weather';
        }
      })
      .catch(error => {
        console.error('Error fetching city photo:', error);
        // default
        const mainWeatherIcon = document.getElementById('main-weather-icon');
        mainWeatherIcon.src = 'assests/nightweather.png';
        mainWeatherIcon.alt = 'Night Weather';
      });
  }

  function setWeatherIcon(main, isMainCard = false) {
      main = main.toLowerCase();
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;

      if (main.includes('cloud')) {
          if (isMainCard) {
              return isNight ? 'assests/clouds-night-white.png' : 'assests/clouds-white.png';
          } else {
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
      return isMainCard ? 'assests/sunny-white.png' : 'assests/sunny-colour.png';
  }

  cityBtn.addEventListener('click', function() {
    const city = cityInput.value.trim();
    if (!city) {
      cityError.textContent = 'Please enter a city name.';
      cityError.style.display = 'inline';
      cityInput.style.border = '1.5px solid #4a0404ff';
      return;
    } 
    
    else {
      cityError.textContent = '';
      cityError.style.display = 'none';
      cityInput.style.border = '';
    }


    // Fetch current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
      .then(res => res.json())
      .then(data => {

        if (data.cod !== 200) {
          cityError.textContent = 'City not found.';
          cityError.style.display = 'inline';
          cityInput.style.border = '1.5px solid #4a0404ff';
          return;
        }


        // Update card
        tempDisplay.textContent = Math.round(data.main.temp) + '°';
        descDisplay.textContent = data.weather[0].main;

        // Fetch and set city photo from Pixabay
        setCityPhoto(city);

        // Update weather details icons (keep these as weather icons)
        const detailIcons = document.querySelectorAll('.weather-details .detail-item .weathericon img');
        if (detailIcons[0]) detailIcons[0].src = setWeatherIcon(data.weather[0].main, false);
        if (detailIcons[1]) detailIcons[1].src = 'assests/wind.png';
        if (detailIcons[2]) detailIcons[2].src = 'assests/cloud-rain.png';
        if (detailIcons[1]) detailIcons[1].style.width = '20px';
        if (detailIcons[2]) detailIcons[2].style.width = '20px';
        if (detailIcons[1]) detailIcons[1].style.height = '20px';
        if (detailIcons[2]) detailIcons[2].style.height = '20px';


        // Set date and time (current time, not city-specific)
        const now = new Date();
        dateDisplay.textContent = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'long' });
        timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        

        // Update humidity and wind
        document.querySelectorAll('.weather-details .detail-item')[1].querySelector('span:last-child').textContent = data.wind.speed + ' km/h';
        document.querySelectorAll('.weather-details .detail-item')[2].querySelector('span:last-child').textContent = data.main.humidity + '%';


        // Update the weather condition text
        document.querySelectorAll('.weather-details .detail-item')[0].querySelector('span:last-child').textContent = data.weather[0].main;


        // Update the mini forecast cards (next 5 days)
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
          .then(res => res.json())
          .then(forecastData => {
            const forecastItems = document.querySelectorAll('.forecast-item');
            // Group forecast by day
            const days = {};
            forecastData.list.forEach(item => {
              const date = new Date(item.dt_txt);
              const day = date.toLocaleDateString('en-US', { weekday: 'short' });
              if (!days[day]) days[day] = [];
              days[day].push(item);
            });
            // Get the next 5 days (including today)
            const dayNames = Object.keys(days).slice(0, 5);
            dayNames.forEach((day, i) => {
              const items = days[day];
              // Use the forecast at noon if available, else the first
              let forecast = items.find(it => new Date(it.dt_txt).getHours() === 12) || items[0];
              if (forecast && forecastItems[i]) {
                // Set day name
                forecastItems[i].querySelector('.forecast-time').textContent = i === 0 ? 'Now' : day;
                // Set temp
                forecastItems[i].querySelector('.forecast-temp').textContent = Math.round(forecast.main.temp) + '°';
                // Set icon (WHITE/NIGHT for home page mini cards)
                let icon = setWeatherIcon(forecast.weather[0].main, true);
                const miniIcon = forecastItems[i].querySelector('.forecast-icon img');
                miniIcon.src = icon;
                miniIcon.alt = forecast.weather[0].main;
                miniIcon.style.width = '38px';
                miniIcon.style.height = '38px';
              }
            });
          });

      })

      .catch(() => {
        cityError.textContent = 'Error fetching weather.';
        cityError.style.display = 'inline';
        cityInput.style.border = '1.5px solid #4a0404ff';
      });
  });


  
  // Weather News Section

  const newsApiKey = "d917e18c73624063830b34efa1f4bb18";
  const newsUrl = `https://newsapi.org/v2/everything?q=weather OR storm OR rain OR flood OR climate&sortBy=publishedAt&language=en&pageSize=10&apiKey=${newsApiKey}`;

  fetch(newsUrl)
    .then(res => res.json())
    .then(data => {
      // Only weather-related news
      const weatherKeywords = [
        "weather", "storm", "rain", "flood", "climate", "snow", "temperature",
        "hurricane", "tornado", "heatwave", "drought", "typhoon", "cyclone", 
        "blizzard", "forecast", "meteorology", "atmosphere", "precipitation"
      ];
      const articles = (data.articles || []).filter(a => {
        const text = (a.title + " " + a.description).toLowerCase();
        return weatherKeywords.some(word => text.includes(word));
      });

      // Main news : 

      const main = articles[0];
      if (main) {
        const mainNews = document.querySelector('.main-news');
        if (mainNews) {
          mainNews.querySelector('img').src = main.urlToImage;
          mainNews.querySelector('img').alt = main.title;
          const mainLink = mainNews.querySelector('.main-news-link');
          if (mainLink) {
            mainLink.href = main.url;
            mainLink.querySelector('h3').textContent = main.title;
          }
          mainNews.querySelector('p').textContent = main.description;
        }
      }

      // Side news

      const sideNewsItems = document.querySelectorAll('.side-news-item');
      articles.slice(1, 4).forEach((article, i) => {
        const item = sideNewsItems[i];
        if (item) {
          const img = item.querySelector('img');
          const sideLink = item.querySelector('.side-news-link');
          const h4 = sideLink ? sideLink.querySelector('h4') : null;
          const p = item.querySelector('p');
          if (img) {
            img.src = article.urlToImage;
            img.alt = article.title;
          }
          if (sideLink) sideLink.href = article.url;
          if (h4) h4.textContent = article.title;
          if (p) p.textContent = article.description;
        }
      });
    });

  });

  