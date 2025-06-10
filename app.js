const express = require('express');
const axios = require('axios');

const app = express();
app.set('json spaces', 4);

const PORT = process.env.PORT || 3000;

const STOCK_UPDATE_INTERVAL_MINUTES = 1;
const STOCK_UPDATE_INTERVAL_MS = STOCK_UPDATE_INTERVAL_MINUTES * 60 * 1000;

const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    html {
        scroll-behavior: smooth;
    }
    body {
        font-family: 'Gotham SSm A', 'Gotham SSm B', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 0;
        padding-top: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
        color: #EAEAEA; 
        background: linear-gradient(135deg, #23153C, #4A1A54, #8A2E7D, #D75A87, #FCA06E, #23153C);
        background-size: 700% 700%; 
        animation: galaxyFlowAnimation 15s ease infinite; 
        overflow-x: hidden;
    }

    @keyframes galaxyFlowAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    .hamburger-menu {
        display: block; 
        position: fixed;
        top: 18px;
        right: 25px;
        z-index: 1002;
        cursor: pointer;
        padding: 5px;
    }
    .hamburger-menu .bar {
        display: block;
        width: 30px;
        height: 4px;
        margin: 6px auto;
        background-color: #EAEAEA; 
        border-radius: 2px;
        transition: all 0.3s ease-in-out;
    }
    .mobile-nav {
        display: none; 
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(35, 21, 60, 0.98); 
        z-index: 1001;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow-y: auto; 
    }
    .mobile-nav.active {
        display: flex;
    }
    .mobile-nav a {
        color: #FCA06E; 
        text-decoration: none;
        font-family: 'Press Start 2P', cursive;
        font-size: 1.0em; 
        padding: 20px;
        display: block;
        text-align: center;
        width: 90%;
        max-width: 280px; 
        margin: 8px 0;
        border-radius: 8px;
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    .mobile-nav a:hover {
        color: #23153C; 
        background-color: #FCA06E; 
    }
    .hamburger-menu.active .bar:nth-child(1) {
        transform: translateY(10px) rotate(45deg);
    }
    .hamburger-menu.active .bar:nth-child(2) {
        opacity: 0;
    }
    .hamburger-menu.active .bar:nth-child(3) {
        transform: translateY(-10px) rotate(-45deg);
    }

    .container {
        width: 90%;
        max-width: 850px; 
        margin: 15px auto;
        padding: 10px;
        text-align: center;
        padding-bottom: 110px;
    }
    h1 {
        font-family: 'Press Start 2P', cursive;
        font-size: 1.7em; 
        color: #FCA06E; 
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5), 0 0 15px #D75A87; 
        margin-top: 10px; 
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1.3;
    }
    h1 .icon {
        font-size: 1em;
        margin: 0 8px;
        animation: pulse 2s infinite ease-in-out;
        filter: drop-shadow(0 0 5px #D75A87); 
    }
    #countdown-container {
        font-family: 'Press Start 2P', cursive;
        color: #EAEAEA; 
        background-color: rgba(50, 30, 80, 0.75); 
        padding: 8px 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 0.85em; 
        border: 1px solid #8A2E7D; 
        box-shadow: 0 0 10px rgba(215, 90, 135, 0.5); 
    }
    #countdown-timer {
        font-weight: bold;
        color: #FCA06E; 
        margin-left: 8px;
    }
    .data-card {
        background-color: rgba(30, 15, 50, 0.8); 
        border: 1px solid #4A1A54; 
        border-radius: 12px; 
        padding: 18px; 
        margin-top: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); 
        backdrop-filter: blur(4px); 
        text-align: left;
        color: #D5D5D5; 
    }
    .section-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        border-bottom: 1px solid #8A2E7D; 
        padding-bottom: 12px;
    }
    .section-header h2 {
        font-family: 'Press Start 2P', cursive;
        color: #FCA06E; 
        font-size: 1.1em; 
        margin: 0;
        text-align: center;
    }
    .section-icon {
        font-size: 1.2em; 
        margin-right: 12px;
        filter: drop-shadow(0 0 4px #D75A87); 
    }
    .weather-details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
        gap: 12px;
        margin-bottom: 12px;
    }
    .weather-details-grid > div {
        background-color: rgba(60, 30, 80, 0.7); 
        padding: 10px;
        border-radius: 6px;
        border-left: 3px solid #D75A87; 
    }
    .weather-details-grid strong {
        color: #FCA06E; 
        display: block;
        margin-bottom: 4px;
        font-weight: 700;
        font-size: 0.85em;
    }
    .weather-details-grid p, .api-docs p, .api-docs li {
        font-size: 0.9em; 
        margin-top: 2px;
        line-height: 1.5;
        color: #C0C0C0; 
    }
    .api-docs code {
        background-color: rgba(252, 160, 110, 0.15); 
        padding: 2px 5px;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
        color: #FCA06E; 
    }
    .api-docs ul {
        padding-left: 18px;
        list-style: disc;
    }
     .api-docs strong {
        color: #FCA06E;
    }
    .weather-description {
        font-style: italic;
        margin-bottom: 12px !important;
        padding-bottom: 12px;
        border-bottom: 1px dashed #8A2E7D; 
        color: #EAEAEA; 
    }
    .weather-mutations {
        margin-bottom: 12px;
    }
    .weather-mutations strong {
        color: #FCA06E;
        display: block;
        margin-bottom: 4px;
        font-weight: 700;
        font-size: 0.85em;
    }
    .weather-mutations ul {
        list-style-type: none;
        padding-left: 0;
    }
    .weather-mutations li {
        background-color: rgba(215, 90, 135, 0.25); 
        padding: 4px 8px;
        border-radius: 4px;
        margin-bottom: 4px;
        color: #D5D5D5; 
        font-size: 0.9em;
    }
    .stock-subsection {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px dashed #8A2E7D;
    }
    .stock-subsection:last-of-type {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    .stock-subsection h3 {
        font-family: 'Press Start 2P', cursive;
        color: #FCA06E; 
        font-size: 0.95em; 
        margin-top: 0;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
    }
    .subsection-icon {
        font-size: 1.0em; 
        margin-right: 10px;
        filter: drop-shadow(0 0 3px #D75A87);
    }
    .stock-list {
        list-style-type: none;
        padding-left: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
        gap: 8px;
    }
    .stock-list li {
        background-color: rgba(74, 26, 84, 0.5); 
        padding: 8px 12px;
        border-radius: 6px;
        color: #D5D5D5;
        font-size: 0.95em;
        border-left: 3px solid #D75A87; 
        transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
    }
    .stock-list li:hover {
        transform: translateY(-2px);
        background-color: rgba(138, 46, 125, 0.6); 
    }
    .stock-list li strong {
        color: #FCA06E; 
        font-weight: bold;
        margin-left: 4px;
    }
    .updated-at {
        font-size: 0.8em; 
        color: #FCA06E; 
        text-align: right;
        margin-top: 15px;
        border-top: 1px solid rgba(138, 46, 125, 0.7); 
        padding-top: 8px;
    }
    .error-display {
        padding: 12px;
        background-color: rgba(215, 90, 135, 0.3); 
        border: 1px solid #D75A87; 
        border-radius: 6px;
        color: #FFD0D0; 
    }
    .error-display strong {
        color: #FFB0B0;
    }

    .stay-updated-info {
        text-align: center; 
    }
    .stay-updated-info p {
        font-size: 0.9em;
        margin-top: 2px;
        line-height: 1.5;
        margin-bottom: 10px;
        color: #C0C0C0;
    }
    .stay-updated-info button {
        font-family: 'Press Start 2P', cursive;
        background-color: #D75A87; 
        color: #fff; 
        border: 1px solid #FCA06E; 
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.75em; 
        transition: background-color 0.3s, transform 0.2s;
        margin-bottom: 8px;
    }
    .stay-updated-info button:hover {
        background-color: #FCA06E; 
        color: #23153C; 
        transform: scale(1.05);
    }
    .stay-updated-info button:disabled {
        background-color: #4A1A54; 
        color: #8A2E7D; 
        cursor: not-allowed;
    }
    #notificationStatusMsg {
        font-size: 0.8em;
        color: #FCA06E;
        margin-top: 4px;
    }
    .stay-updated-info em {
        font-size: 0.8em;
        color: #FCA06E; 
        display: block;
        margin-top: 12px;
        font-style: italic;
    }

    footer {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        padding: 8px 0; 
        font-size: 0.75em;
        color: #EAEAEA; 
        background-color: rgba(35, 21, 60, 0.9); 
        text-align: center;
        z-index: 1000; 
        box-shadow: 0 -2px 8px rgba(0,0,0,0.3);
    }
    @media (max-width: 768px) {
        body { padding-top: 50px; } 
        .hamburger-menu { top: 12px; right: 15px; }
        .hamburger-menu .bar { width: 25px; height: 3px; margin: 5px auto; background-color: #EAEAEA; }
        .hamburger-menu.active .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
        .hamburger-menu.active .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
        .mobile-nav a { font-size: 1em; padding: 18px; }


        h1 { font-size: 1.5em; }
        #countdown-container { font-size: 0.8em; }
        .data-card { padding: 15px; }
        .section-header h2 { font-size: 1.0em; }
        .section-icon { font-size: 1.1em; }
        .stock-subsection h3 { font-size: 0.9em; }
        .subsection-icon { font-size: 0.95em; }
        .stock-list li, .weather-details-grid > div p, .weather-mutations li, .api-docs p, .api-docs li, .stay-updated-info p { font-size: 0.88em; }
        .stock-list { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
        .weather-details-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        footer { font-size: 0.7em; padding: 6px 0; }
    }
    @media (max-width: 480px) {
        body { padding-top: 40px; }
        .hamburger-menu { top: 10px; right: 10px; }
        h1 { font-size: 1.2em; }
        #countdown-container { font-size: 0.75em; }
        h1 .icon { font-size: 0.85em; }
        .data-card { padding: 12px; border-radius: 10px; }
        .section-header h2 { font-size: 0.95em; }
        .section-icon { font-size: 1.0em; }
        .stock-subsection h3 { font-size: 0.85em; }
        .subsection-icon { font-size: 0.9em; }
        .stock-list, .weather-details-grid { grid-template-columns: 1fr; gap: 6px; }
        .stock-list li, .weather-details-grid > div p, .weather-mutations li, .api-docs p, .api-docs li, .stay-updated-info p { font-size: 0.85em; }
        .updated-at { font-size: 0.75em; }
        .stay-updated-info button { font-size: 0.7em; padding: 7px 10px; }
        footer { font-size: 0.65em; padding: 5px 0; }
    }
`;

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        if (unsafe === null || unsafe === undefined) return '';
        unsafe = String(unsafe);
    }
    return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"').replace(/'/g, "'");
}

function formatDateWithManilaTimezone(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function parseStockItem(itemString) {
    const parts = itemString.split(' **x');
    const itemName = parts[0];
    let quantity = '';
    if (parts.length > 1 && parts[1]) {
        quantity = parts[1].replace(/\*\*/g, '');
    }
    return { name: escapeHtml(itemName), quantity: quantity ? `<strong>x${escapeHtml(quantity)}</strong>` : '' };
}

async function fetchAllGagData() {
    const timestamp = Date.now();
    const apiEndpoints = [
        { key: 'weatherData', url: `https://growagardenstock.com/api/stock/weather?ts=${timestamp}&_=${timestamp}` },
        { key: 'stockData', url: `https://growagardenstock.com/api/stock?type=gear-seeds&ts=${timestamp}` },
        { key: 'honeyData', url: `https://growagardenstock.com/api/special-stock?type=honey&ts=${timestamp}` },
        { key: 'cosmeticsData', url: `https://growagardenstock.com/api/special-stock?type=cosmetics&ts=${timestamp}` },
        { key: 'eggData', url: `https://growagardenstock.com/api/stock?type=egg&ts=${timestamp}` }
    ];

    const fetchedData = {};
    const fetchErrors = {};
    let nextStockUpdateTime = 0;

    const promises = apiEndpoints.map(endpoint =>
        axios.get(endpoint.url)
            .then(response => ({ key: endpoint.key, data: response.data }))
            .catch(error => {
                let errorMessage;
                if (error.response) {
                    errorMessage = `API Error ${error.response.status} for ${endpoint.key.replace('Data', '')}`;
                } else if (error.request) {
                    errorMessage = `No response for ${endpoint.key.replace('Data', '')}`;
                } else {
                    errorMessage = `Network Error for ${endpoint.key.replace('Data', '')}: ${error.message}`;
                }
                return { key: endpoint.key, error: errorMessage };
            })
    );

    const results = await Promise.all(promises);

    results.forEach(result => {
        if (result.data) { fetchedData[result.key] = result.data; }
        if (result.error) { fetchErrors[result.key.replace('Data', 'Error')] = result.error; }
    });

    let latestStockUpdatedAt = 0;
    const allSourcesForUpdatedAt = ['weatherData', 'stockData', 'honeyData', 'cosmeticsData', 'eggData'];
    allSourcesForUpdatedAt.forEach(sourceKey => {
        if (fetchedData[sourceKey] && fetchedData[sourceKey].updatedAt) {
            latestStockUpdatedAt = Math.max(latestStockUpdatedAt, fetchedData[sourceKey].updatedAt);
        }
    });

    if (latestStockUpdatedAt > 0) {
        let proposedNextUpdate = latestStockUpdatedAt + STOCK_UPDATE_INTERVAL_MS;
        const now = Date.now();
        while (proposedNextUpdate < now) {
            proposedNextUpdate += STOCK_UPDATE_INTERVAL_MS;
        }
        nextStockUpdateTime = proposedNextUpdate;
    }

    return {
        data: fetchedData,
        errors: fetchErrors,
        nextStockUpdateTime: nextStockUpdateTime
    };
}

function getHtmlPageContent(data, errors, nextStockUpdateTime) {
    const { weatherData, stockData, honeyData, cosmeticsData, eggData } = data;
    const { weatherError, stockError, honeyError, cosmeticsError, eggError } = errors;

    const clientSideTimestamps = JSON.stringify({
        weather: weatherData?.updatedAt || null,
        stock: stockData?.updatedAt || null,
        egg: eggData?.updatedAt || null,
        honey: honeyData?.updatedAt || null,
        cosmetics: cosmeticsData?.updatedAt || null
    });


    let weatherHtml = '';
    if (weatherError) {
        weatherHtml = `<div class="error-display"><strong>Weather Error:</strong> ${escapeHtml(weatherError)}</div>`;
    } else if (weatherData) {
        const mutationsHtml = (weatherData.mutations && weatherData.mutations.length > 0)
            ? `<ul>${weatherData.mutations.map(mutation => `<li>${escapeHtml(mutation)}</li>`).join('')}</ul>`
            : `<p>None active.</p>`;
        weatherHtml = `
            <div class="weather-description">
                <span style="font-size: 1.8em; margin-right: 8px;">${escapeHtml(weatherData.icon)}</span>
                <strong>${escapeHtml(weatherData.currentWeather)}:</strong> ${escapeHtml(weatherData.description)}
            </div>
            <div class="weather-details-grid">
                <div><strong>Visual Cue:</strong> <p>${escapeHtml(weatherData.visualCue)}</p></div>
                <div><strong>Crop Bonuses:</strong> <p>${escapeHtml(weatherData.cropBonuses)}</p></div>
                <div><strong>Rarity:</strong> <p>${escapeHtml(weatherData.rarity)}</p></div>
                <div><strong>Weather Type:</strong> <p>${escapeHtml(weatherData.weatherType)}</p></div>
            </div>
            ${weatherData.mutations && weatherData.mutations.length > 0 ? `<div class="weather-mutations"><strong>Mutations:</strong> ${mutationsHtml}</div>` : ''}
            <p class="updated-at">Weather Last Updated: ${formatDateWithManilaTimezone(weatherData.updatedAt)}</p>
        `;
    } else { weatherHtml = `<p>Loading weather data...</p>`; }

    let generalStockHtml = '';
    if (stockError) {
        generalStockHtml = `<div class="error-display"><strong>General Stock Error:</strong> ${escapeHtml(stockError)}</div>`;
    } else if (stockData) {
        const gearItemsHtml = stockData.gear && stockData.gear.length > 0
            ? stockData.gear.map(item => { const p = parseStockItem(item); return `<li>${p.name}${p.quantity}</li>`; }).join('')
            : '<li>No gear available.</li>';
        const seedsItemsHtml = stockData.seeds && stockData.seeds.length > 0
            ? stockData.seeds.map(item => { const p = parseStockItem(item); return `<li>${p.name}${p.quantity}</li>`; }).join('')
            : '<li>No seeds available.</li>';
        generalStockHtml = `
            ${(stockData.gear && stockData.gear.length > 0) || (!stockData.seeds || stockData.seeds.length === 0) ? `
            <div class="stock-subsection">
                <h3><span class="subsection-icon">⚙️</span> Gear</h3>
                <ul class="stock-list">${gearItemsHtml}</ul>
            </div>` : ''}
            ${(stockData.seeds && stockData.seeds.length > 0) || (!stockData.gear || stockData.gear.length === 0) ? `
            <div class="stock-subsection">
                <h3><span class="subsection-icon">🌱</span> Seeds</h3>
                <ul class="stock-list">${seedsItemsHtml}</ul>
            </div>` : ''}
            ${ (stockData.gear && stockData.gear.length > 0) || (stockData.seeds && stockData.seeds.length > 0) ? `<p class="updated-at">Stock Last Updated: ${formatDateWithManilaTimezone(stockData.updatedAt)}</p>` : (stockError ? '' : '<p>No general stock available.</p>')}
        `;
    } else { generalStockHtml = `<p>Loading general stock data...</p>`; }
    
    let specialStockHtml = '';
    if (honeyError && cosmeticsError && (!honeyData || honeyData.honey.length === 0) && (!cosmeticsData || cosmeticsData.cosmetics.length === 0) ) {
        specialStockHtml = `<div class="error-display"><strong>Special Stock Error:</strong> Could not load Honey or Cosmetics.</div>`;
    } else {
        let hasSpecialContent = false;
        if ((honeyData && honeyData.honey && honeyData.honey.length > 0) || honeyError) { 
            hasSpecialContent = true;
            const honeyItemsHtml = honeyData && honeyData.honey && honeyData.honey.length > 0
                ? honeyData.honey.map(item => { const p = parseStockItem(item); return `<li>${p.name}${p.quantity}</li>`; }).join('')
                : '<li>No honey items available.</li>';
            specialStockHtml += `
                <div class="stock-subsection">
                    <h3><span class="subsection-icon">🍯</span> Honey</h3>
                    ${honeyError ? `<div class="error-display" style="margin-bottom:10px;">Error: ${escapeHtml(honeyError)}</div>` : `<ul class="stock-list">${honeyItemsHtml}</ul>`}
                </div>`;
        }
        if ((cosmeticsData && cosmeticsData.cosmetics && cosmeticsData.cosmetics.length > 0) || cosmeticsError) { 
            hasSpecialContent = true;
            const cosmeticsItemsHtml = cosmeticsData && cosmeticsData.cosmetics && cosmeticsData.cosmetics.length > 0
                ? cosmeticsData.cosmetics.map(item => { const p = parseStockItem(item); return `<li>${p.name}${p.quantity}</li>`; }).join('')
                : '<li>No cosmetic items available.</li>';
            specialStockHtml += `
                <div class="stock-subsection">
                    <h3><span class="subsection-icon">🎨</span> Cosmetics</h3>
                    ${cosmeticsError ? `<div class="error-display" style="margin-bottom:10px;">Error: ${escapeHtml(cosmeticsError)}</div>` : `<ul class="stock-list">${cosmeticsItemsHtml}</ul>`}
                </div>`;
        }
        
        const honeyUpdatedAt = honeyData ? honeyData.updatedAt : 0;
        const cosmeticsUpdatedAt = cosmeticsData ? cosmeticsData.updatedAt : 0;
        const specialStockUpdatedAt = Math.max(honeyUpdatedAt, cosmeticsUpdatedAt);

        if (specialStockUpdatedAt > 0 && hasSpecialContent) {
            specialStockHtml += `<p class="updated-at">Special Stock Last Updated: ${formatDateWithManilaTimezone(specialStockUpdatedAt)}</p>`;
        } else if (!hasSpecialContent && !honeyError && !cosmeticsError) {
             specialStockHtml += `<p>No special stock available.</p>`;
        } else if (!hasSpecialContent) { 
             specialStockHtml += `<p>Loading special stock data...</p>`;
        }
    }

    let eggStockHtml = '';
    if (eggError) {
        eggStockHtml = `<div class="error-display"><strong>Egg Stock Error:</strong> ${escapeHtml(eggError)}</div>`;
    } else if (eggData && eggData.egg && eggData.egg.length > 0) {
        const eggItemsHtml = eggData.egg.map(item => { const p = parseStockItem(item); return `<li>${p.name}${p.quantity}</li>`; }).join('');
        eggStockHtml = `
            <div class="stock-subsection">
                <h3><span class="subsection-icon">🥚</span> Eggs</h3>
                <ul class="stock-list">${eggItemsHtml}</ul>
            </div>
            <p class="updated-at">Egg Stock Last Updated: ${formatDateWithManilaTimezone(eggData.updatedAt)}</p>
        `;
    } else if (eggData) {
         eggStockHtml = `
            <div class="stock-subsection">
                <h3><span class="subsection-icon">🥚</span> Eggs</h3>
                <ul class="stock-list"><li>No eggs available.</li></ul>
            </div>
            <p class="updated-at">Egg Stock Last Updated: ${formatDateWithManilaTimezone(eggData.updatedAt)}</p>
        `;
    }
    else { eggStockHtml = `<p>Loading egg stock data...</p>`; }

    const apiDocumentationHtml = `
        <div class="api-docs">
            <p>This service provides a JSON API endpoint for accessing consolidated Grow A Garden (GAG) game data.</p>
            
            <p><strong>Endpoint:</strong> <a href="/api/gag-tracker" target="_blank" style="color: #D75A87; text-decoration: underline;"><code>/api/gag-tracker</code></a></p>
            <p><strong>Method:</strong> <code>GET</code></p>
            
            <p><strong>Description:</strong></p>
            <p>The API returns current game data including:</p>
            <ul>
                <li>Weather conditions and mutations.</li>
                <li>General stock: Gear and Seeds.</li>
                <li>Egg stock.</li>
                <li>Special stock: Honey and Cosmetics.</li>
            </ul>
            <p>It also provides information about the next expected data refresh and credits.</p>

            <p><strong>Response Structure Overview:</strong></p>
            <p>The JSON response is structured with the following main keys:</p>
            <ul>
                <li><code>weather</code>: Object containing current weather details.</li>
                <li><code>general_stock</code>: Object containing <code>gear</code> and <code>seeds</code> arrays.</li>
                <li><code>egg_stock</code>: Object containing an <code>egg</code> array.</li>
                <li><code>special_stock</code>: Object containing:
                    <ul>
                        <li><code>honey</code>: Object with honey items.</li>
                        <li><code>cosmetics</code>: Object with cosmetic items.</li>
                    </ul>
                </li>
                <li><code>next_refresh_info</code>: Object with details about the next data update cycle (<code>timestamp_ms</code>, <code>time_manila</code>, <code>interval_minutes</code>).</li>
                <li><code>crafted_by</code>: Object with owner and contact channel.</li>
            </ul>
            <p>Each data section (<code>weather</code>, <code>general_stock</code>, <code>egg_stock</code>, <code>honey</code>, <code>cosmetics</code>) includes an <code>updatedAt</code> field (Unix timestamp in milliseconds) indicating when its data was last updated by the source, and an <code>error</code> field which will be non-null if data retrieval for that specific section failed.</p>
            <p>The JSON response is pretty-printed for readability.</p>
        </div>
    `;
    
    const notificationInfoHtml = `
        <div class="stay-updated-info">
            <p>Enable browser notifications to get alerts when GAG Tracker data updates.</p>
            <button id="enableNotificationsBtn">Enable Notifications</button>
            <p id="notificationStatusMsg"></p>
            <p><em>Note: Notifications are shown when data update times change. Ensure your browser permits notifications for this site.</em></p>
        </div>
    `;


    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Grow a Garden Tracker</title>
            <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>">
            <style>${styles}</style>
        </head>
        <body>
            <div class="hamburger-menu" id="hamburgerMenu">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
            <nav class="mobile-nav" id="mobileNav">
                <a href="#top-header" class="nav-link">Dashboard Home</a>
                <a href="#api-documentation" class="nav-link">API Documentation</a>
                <a href="#stay-updated" class="nav-link">Notifications</a>
            </nav>

            <div class="container" id="top-header">
                <h1><span class="icon">🌌</span> G.A.G. Tracker <span class="icon">📊</span></h1>
                <div id="countdown-container">
                    Page Auto-Refresh in: <span id="countdown-timer">--:--:--</span>
                </div>
                <div class="data-card">
                    <div class="section-header"><span class="section-icon">🌦️</span><h2>Current Weather</h2></div>
                    ${weatherHtml}
                </div>
                <div class="data-card">
                    <div class="section-header"><span class="section-icon">🛍️</span><h2>General Stock</h2></div>
                    ${generalStockHtml}
                </div>
                 <div class="data-card">
                    <div class="section-header"><span class="section-icon">🥚</span><h2>Egg Stock</h2></div>
                    ${eggStockHtml}
                </div>
                <div class="data-card">
                    <div class="section-header"><span class="section-icon">✨</span><h2>Special Stock</h2></div>
                    ${specialStockHtml}
                </div>
                <div id="stay-updated" class="data-card">
                    <div class="section-header"><span class="section-icon">🔔</span><h2>Stay Updated!</h2></div>
                    ${notificationInfoHtml}
                </div>
                <div id="api-documentation" class="data-card">
                    <div class="section-header"><span class="section-icon">🔌</span><h2>API Documentation</h2></div>
                    ${apiDocumentationHtml}
                </div>
            </div>
            <footer>
                <p>crafted by @sinontop | channel: @mksln</p>
            </footer>
            <script>
                const nextStockUpdateTimestamp = ${nextStockUpdateTime || 'null'}; 
                const currentDataTimestamps = ${clientSideTimestamps};
                const countdownElement = document.getElementById('countdown-timer');
                let countdownInterval;

                function updateCountdown() {
                    if (!nextStockUpdateTimestamp) {
                        countdownElement.textContent = "Unknown";
                        if(countdownInterval) clearInterval(countdownInterval);
                        return;
                    }

                    const now = new Date().getTime();
                    const distance = nextStockUpdateTimestamp - now;

                    if (distance < 0) {
                        countdownElement.textContent = "REFRESHING...";
                        clearInterval(countdownInterval);
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000); 
                        return;
                    }

                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    const pad = (num) => num.toString().padStart(2, '0');
                    countdownElement.textContent = \`\${pad(hours)}:\${pad(minutes)}:\${pad(seconds)}\`;
                }

                if (countdownElement && nextStockUpdateTimestamp > 0) {
                    updateCountdown(); 
                    countdownInterval = setInterval(updateCountdown, 1000);
                } else if (countdownElement) {
                     countdownElement.textContent = "Unavailable";
                }

                const hamburger = document.getElementById('hamburgerMenu');
                const mobileNav = document.getElementById('mobileNav');
                const navLinks = document.querySelectorAll('.nav-link');

                hamburger.addEventListener('click', () => {
                    hamburger.classList.toggle('active');
                    mobileNav.classList.toggle('active');
                    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
                });

                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        hamburger.classList.remove('active');
                        mobileNav.classList.remove('active');
                        document.body.style.overflow = '';
                    });
                });

                const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
                const notificationStatusMsg = document.getElementById('notificationStatusMsg');
                const LS_NOTIF_ENABLED_KEY = 'gagTrackerNotificationsEnabled_v4';
                
                const LS_TIMESTAMP_KEYS = {
                    weather: 'gagTrackerLastWeatherTimestamp_v4',
                    stock: 'gagTrackerLastStockTimestamp_v4',
                    egg: 'gagTrackerLastEggTimestamp_v4',
                    honey: 'gagTrackerLastHoneyTimestamp_v4',
                    cosmetics: 'gagTrackerLastCosmeticsTimestamp_v4'
                };

                function updateNotificationUI() {
                    if (!('Notification' in window)) {
                        notificationStatusMsg.textContent = "Browser does not support notifications.";
                        enableNotificationsBtn.disabled = true;
                        return;
                    }

                    const permission = Notification.permission;
                    const notificationsEnabled = localStorage.getItem(LS_NOTIF_ENABLED_KEY) === 'true';

                    if (permission === 'granted') {
                        enableNotificationsBtn.textContent = notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications';
                        enableNotificationsBtn.disabled = false;
                        notificationStatusMsg.textContent = notificationsEnabled ? 'Update notifications are ON.' : 'Update notifications are OFF. Click to enable.';
                    } else if (permission === 'denied') {
                        notificationStatusMsg.textContent = "Notification permission denied. Please check browser settings.";
                        enableNotificationsBtn.disabled = true;
                        enableNotificationsBtn.textContent = 'Permission Denied';
                    } else { 
                        notificationStatusMsg.textContent = "Click to allow notifications for data updates.";
                        enableNotificationsBtn.textContent = 'Enable Notifications';
                        enableNotificationsBtn.disabled = false;
                    }
                }

                function requestNotificationPermission() {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            localStorage.setItem(LS_NOTIF_ENABLED_KEY, 'true');
                            setInitialTimestamps(true); 
                        }
                        updateNotificationUI();
                    });
                }
                
                function setInitialTimestamps(force = false) {
                    for (const [dataType, lsKey] of Object.entries(LS_TIMESTAMP_KEYS)) {
                        if (force || !localStorage.getItem(lsKey)) {
                            const currentTimestamp = currentDataTimestamps[dataType];
                             if (currentTimestamp !== null && currentTimestamp !== undefined) { 
                                localStorage.setItem(lsKey, currentTimestamp);
                            } else {
                                localStorage.setItem(lsKey, '0'); 
                            }
                        }
                    }
                }


                enableNotificationsBtn.addEventListener('click', () => {
                    if (Notification.permission === 'default') {
                        requestNotificationPermission();
                    } else if (Notification.permission === 'granted') {
                        const currentlyEnabled = localStorage.getItem(LS_NOTIF_ENABLED_KEY) === 'true';
                        localStorage.setItem(LS_NOTIF_ENABLED_KEY, !currentlyEnabled);
                        if (!currentlyEnabled) { 
                            setInitialTimestamps(true); 
                        }
                        updateNotificationUI();
                         new Notification('GAG Tracker', { 
                            body: \`Update notifications have been \${!currentlyEnabled ? 'enabled' : 'disabled'}!\`,
                            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>'
                        });
                    }
                });

                function showNotification(title, body) {
                    if (Notification.permission === 'granted' && localStorage.getItem(LS_NOTIF_ENABLED_KEY) === 'true') {
                        new Notification(title, { 
                            body: body,
                            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>'
                        });
                    }
                }

                function checkForTimestampChangesAndNotify() {
                    if (localStorage.getItem(LS_NOTIF_ENABLED_KEY) !== 'true' || Notification.permission !== 'granted') {
                        return;
                    }

                    const checkAndNotify = (dataTypeKey, currentTimestamp, lsKey, friendlyName) => {
                        const previousTimestamp = parseInt(localStorage.getItem(lsKey), 10) || 0; 
                        
                        const newTimestamp = parseInt(currentTimestamp, 10) || 0;

                        if (newTimestamp > 0 && newTimestamp > previousTimestamp) {
                            showNotification('GAG Tracker: Data Update!', \`\${friendlyName} has been updated!\`);
                            localStorage.setItem(lsKey, newTimestamp.toString());
                        } else if (newTimestamp > 0 && previousTimestamp === 0) { 
                            localStorage.setItem(lsKey, newTimestamp.toString());
                        }
                    };
                    
                    if (currentDataTimestamps) { 
                        checkAndNotify('weather', currentDataTimestamps.weather, LS_TIMESTAMP_KEYS.weather, 'Weather');
                        checkAndNotify('stock', currentDataTimestamps.stock, LS_TIMESTAMP_KEYS.stock, 'General Stock');
                        checkAndNotify('egg', currentDataTimestamps.egg, LS_TIMESTAMP_KEYS.egg, 'Egg Stock');
                        checkAndNotify('honey', currentDataTimestamps.honey, LS_TIMESTAMP_KEYS.honey, 'Honey Stock');
                        checkAndNotify('cosmetics', currentDataTimestamps.cosmetics, LS_TIMESTAMP_KEYS.cosmetics, 'Cosmetics Stock');
                    }
                }

                updateNotificationUI();
                setInitialTimestamps(); 
                checkForTimestampChangesAndNotify();

            </script>
        </body>
        </html>
    `;
}

app.get('/', async (req, res) => {
    try {
        const { data, errors, nextStockUpdateTime } = await fetchAllGagData();
        const htmlOutput = getHtmlPageContent(data, errors, nextStockUpdateTime);
        res.send(htmlOutput);
    } catch (error) {
        const htmlOutput = getHtmlPageContent({}, {
            weatherError: "Overall system error encountered.", stockError: "Overall system error encountered.",
            honeyError: "Overall system error encountered.", cosmeticsError: "Overall system error encountered.",
            eggError: "Overall system error encountered."
        }, 0);
        res.status(500).send(htmlOutput);
    }
});

app.get('/api/gag-tracker', async (req, res) => {
    try {
        const { data, errors, nextStockUpdateTime } = await fetchAllGagData();

        const apiResponse = {
            weather: {
                updatedAt: data.weatherData?.updatedAt || null,
                ...(data.weatherData || {}),
                error: errors.weatherError || null
            },
            general_stock: {
                updatedAt: data.stockData?.updatedAt || null,
                gear: data.stockData?.gear || [],
                seeds: data.stockData?.seeds || [],
                error: errors.stockError || null
            },
            egg_stock: {
                updatedAt: data.eggData?.updatedAt || null,
                egg: data.eggData?.egg || [],
                error: errors.eggError || null
            },
            special_stock: {
                honey: {
                    updatedAt: data.honeyData?.updatedAt || null,
                    honey: data.honeyData?.honey || [],
                    error: errors.honeyError || null
                },
                cosmetics: {
                    updatedAt: data.cosmeticsData?.updatedAt || null,
                    cosmetics: data.cosmeticsData?.cosmetics || [],
                    error: errors.cosmeticsError || null
                }
            },
            next_refresh_info: {
                timestamp_ms: nextStockUpdateTime || null,
                time_manila: nextStockUpdateTime ? formatDateWithManilaTimezone(nextStockUpdateTime) : "Unknown",
                interval_minutes: STOCK_UPDATE_INTERVAL_MINUTES
            },
            crafted_by: {
                owner: "@sinontop",
                channel: "@mksln"
            }
        };
        
        if (!data.weatherData && !errors.weatherError) apiResponse.weather.error = "Weather data not available";
        if (!data.stockData && !errors.stockError) apiResponse.general_stock.error = "General stock data not available";
        if (!data.eggData && !errors.eggError) apiResponse.egg_stock.error = "Egg stock data not available";
        if (!data.honeyData && !errors.honeyError) apiResponse.special_stock.honey.error = "Honey data not available";
        if (!data.cosmeticsData && !errors.cosmeticsError) apiResponse.special_stock.cosmetics.error = "Cosmetics data not available";

        res.json(apiResponse);

    } catch (error) {
        res.status(500).json({
            error: "An internal server error occurred while processing GAG Tracker API.",
            details: error.message,
            crafted_by: {
                owner: "@sinontop",
                channel: "@mksln"
            }
        });
    }
});

function displayStartupMessage() {
    const boxWidth = 40;
    const title = "gag tracker";
    const padding = Math.floor((boxWidth - 2 - title.length) / 2);
    const remainder = (boxWidth - 2 - title.length) % 2;

    console.log("\n" + '*'.repeat(boxWidth));
    console.log("*" + ' '.repeat(boxWidth - 2) + "*");
    console.log("*" + ' '.repeat(padding) + title + ' '.repeat(padding + remainder) + "*");
    console.log("*" + ' '.repeat(boxWidth - 2) + "*");
    console.log('*'.repeat(boxWidth));
    console.log("\nServer is running on http://localhost:" + PORT);
    console.log("HTML Page & API Docs: http://localhost:" + PORT + "/");
    console.log("JSON API Endpoint:    http://localhost:" + PORT + "/api/gag-tracker");
    console.log("Crafted by: @sinontop");
    console.log("Channel: @mksln");
    console.log("\n" + "-".repeat(boxWidth));
}

app.listen(PORT, () => {
    displayStartupMessage();
});
