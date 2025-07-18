const apiKey = "d917e18c73624063830b34efa1f4bb18"; 
const url = `https://newsapi.org/v2/everything?q=weather OR storm OR rain OR flood OR climate OR hurricane OR tornado OR temperature OR forecast&sortBy=publishedAt&language=en&pageSize=50&apiKey=${apiKey}`;


// cut long texts 
function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Date Format :
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    // Format: "Jan 15, 2024 at 2:30 PM"
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

// filter weather articles : 
function WeatherArticle(article) {
  const keywords = [
    "weather", "storm", "rain", "flood", "climate", "snow", "temperature",
    "hurricane", "tornado", "heatwave", "drought", "typhoon", "cyclone", 
    "blizzard", "forecast", "meteorology", "atmosphere", "precipitation"
  ];
  const title = (article.title || "").toLowerCase();
  const description = (article.description || "").toLowerCase();
  const content = (article.content || "").toLowerCase();

  const inTitle = keywords.some(word => title.includes(word));
  const inDescription = keywords.some(word => description.includes(word));
  const inContent = keywords.some(word => content.includes(word));

  return inTitle || inDescription || inContent;
}


fetch(url)
  .then(response => response.json())
  .then(data => {

    // Filter weather articles
    const weatherArticles = data.articles.filter(WeatherArticle);

    if (!weatherArticles || weatherArticles.length === 0) {
      document.getElementById('main-news-title').textContent = "Latest Weather Updates";
      document.getElementById('main-news-desc').textContent = "Stay informed with the latest weather forecasts, storm warnings, and climate news. Our team is constantly monitoring weather patterns to bring you the most accurate and up-to-date information.";
      document.getElementById('main-news-date').textContent = formatDate(new Date());
      return;
    }

    console.log("Weather articles found:", weatherArticles.length);

    // 1. Main News : 
    const main = weatherArticles[0];
    document.getElementById('main-news-title').textContent = main.title || "";
    document.getElementById('main-news-image').src = main.urlToImage || "";
    document.getElementById('main-news-image').alt = main.title || "Main News Image";

    const mainText = main.description || main.content || "No summary available.";
    document.getElementById('main-news-desc').textContent = truncateText(mainText, 300);

    document.getElementById('main-news-author').textContent = main.author ? `By ${main.author}` : "";
    document.getElementById('main-news-date').textContent = formatDate(main.publishedAt);
    document.getElementById('main-news-link').href = main.url || "#";

    // 2. Right Side News :
    const sideNewsList = document.getElementById('side-news-list');
    sideNewsList.innerHTML = "";

    console.log("Creating side news cards...");
    console.log("Available articles for side news:", weatherArticles.slice(1, 4).length);

    weatherArticles.slice(1, 4).forEach((article, index) => {
      console.log(`Creating side news card ${index + 1}:`, article.title);
      const div = document.createElement('div');
      div.className = "side-news-card";
      div.innerHTML = `
        <img src="${article.urlToImage || ''}" alt="${article.title || 'News Image'}" class="side-news-img">
        <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
        <p>${truncateText(article.description || article.content || "", 80)}</p>
      `;
      sideNewsList.appendChild(div);
    });

    console.log("Side news list innerHTML:", sideNewsList.innerHTML);

    // 3. Breaking News 
    const breakingNewsList = document.getElementById('breaking-news-list');
    breakingNewsList.innerHTML = ""; 
    weatherArticles.slice(4, 7).forEach(article => {
      const div = document.createElement('div');
      div.className = "breaking-news-card";
      div.innerHTML = `
        <img src="${article.urlToImage || ''}" alt="${article.title || 'News Image'}" class="breaking-news-img">
        <h5><a href="${article.url}" target="_blank">${article.title}</a></h5>
        <span>${formatDate(article.publishedAt)}</span>
      `;
      breakingNewsList.appendChild(div);
    });

    if (sideNewsList.innerHTML === "") {

      // HTML :  
      sideNewsList.innerHTML = `
        <div class='side-news-card'>
          <h4><a href="#" target="_blank">Weather Alert System</a></h4>
          <p>Real-time weather alerts and emergency notifications for your area.</p>
        </div>
        <div class='side-news-card'>
          <h4><a href="#" target="_blank">Climate Change Updates</a></h4>
          <p>Latest research and developments in climate science and environmental protection.</p>
        </div>
        <div class='side-news-card'>
          <h4><a href="#" target="_blank">Storm Tracking</a></h4>
          <p>Advanced storm tracking and hurricane monitoring systems.</p>
        </div>
      `;
      document.querySelectorAll('.side-news-card').forEach(card => {
        card.classList.add('visible');
      });
      console.log("No side news articles found, showing professional fallback content");
    }
    
    if (breakingNewsList.innerHTML === "") {
      breakingNewsList.innerHTML = `
        <div class="breaking-news-card">
          <img src="assests/cloud-rain.png" alt="Weather Alert" class="breaking-news-img">
          <h5><a href="#" target="_blank">Severe Weather Warning</a></h5>
          <span>${formatDate(new Date())}</span>
        </div>

        <div class="breaking-news-card">
          <img src="assests/wind.png" alt="Storm Tracking" class="breaking-news-img">
          <h5><a href="#" target="_blank">Hurricane Monitoring</a></h5>
          <span>${formatDate(new Date())}</span>
        </div>

        <div class="breaking-news-card">
          <img src="assests/sun.png" alt="Climate Update" class="breaking-news-img">
          <h5><a href="#" target="_blank">Climate Report</a></h5>
          <span>${formatDate(new Date())}</span>
        </div>
      `;

      console.log("No breaking news articles ");
    }
  })
  .catch(error => {
    document.getElementById('main-news-title').textContent = "Could not load news.";
    console.error("Error fetching news:", error);
  });