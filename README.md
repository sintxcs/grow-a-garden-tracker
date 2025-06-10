# G.A.G. Tracker 🌌📊

A Node.js application that tracks and displays real-time data for the game "Grow A Garden" (GAG). It provides a user-friendly web dashboard with a retro-galaxy theme and a JSON API endpoint for developers.

## Features

*   **Comprehensive Dashboard:** Displays current GAG data including:
    *   Weather conditions, description, visual cues, crop bonuses, rarity, type, and active mutations.
    *   General stock (Gear & Seeds) with item names and quantities.
    *   Egg stock with item names and quantities.
    *   Special stock (Honey & Cosmetics) with item names and quantities.
*   **Real-time Updates:** Data is fetched from official GAG APIs and the dashboard indicates the last update time for each section.
*   **Next Refresh Countdown:** A timer on the dashboard shows an estimated time for the next data refresh cycle for the page itself, based on the game's typical update interval.
*   **Browser Notifications:** Users can opt-in to receive browser notifications when the underlying game data (weather, stock, etc.) is updated on the source APIs.
*   **Responsive Design:** The web interface is designed to work on various screen sizes, featuring a mobile-friendly hamburger menu for navigation.
*   **JSON API:** Provides a public API endpoint (`/api/gag-tracker`) for developers to access the consolidated GAG data in JSON format.
*   **API Documentation:** Integrated API documentation on the main dashboard page, detailing the JSON API endpoint, method, and response structure.
*   **Error Handling:** Gracefully handles and displays errors if GAG APIs are temporarily unavailable for specific data sections, both on the UI and in the JSON API.
*   **Retro Galaxy Theme:** A visually appealing interface with a "Press Start 2P" font for headers, a dynamic animated galaxy-themed background, and themed data cards.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **HTTP Client:** Axios (for making requests to GAG APIs)
*   **Frontend:** HTML, CSS (embedded), Vanilla JavaScript (for interactivity, countdown, and notifications)
*   **Font:** Google Fonts (Press Start 2P, Gotham SSm A/B - though Gotham is a fallback)

## Setup and Running

### Prerequisites

*   Node.js (v14.x or later recommended)
*   npm (Node Package Manager, comes with Node.js) or yarn

### Installation

1.  **Save the code:**
    Save the provided Python code as a `.js` file (e.g., `server.js`) in a new project directory.

2.  **Initialize your project (optional but recommended):**
    Open your terminal in the project directory and run:
    ```bash
    npm init -y
    ```
    This will create a `package.json` file.

3.  **Install dependencies:**
    In the same terminal, install the necessary packages:
    ```bash
    npm install express axios
    ```
    If you created a `package.json`, you can use `npm install express axios --save` to add them as dependencies.

### Running the Application

1.  **Start the server:**
    Navigate to your project directory in the terminal and run:
    ```bash
    node app.js
    ```
    (Replace `app.js` with the actual name of your file if different).

2.  **Access the application:**
    Once the server is running (you'll see a startup message in the console), you can access:
    *   **Web Dashboard & API Docs:** Open your browser and navigate to `http://localhost:3000` (or the port specified by the `PORT` environment variable if set).
    *   **JSON API:** Access `http://localhost:3000/api/gag-tracker`.

### Configuration

*   **Port:** The server runs on port `3000` by default. You can change this by setting the `PORT` environment variable before running the script (e.g., `PORT=8080 node server.js`).
*   **Stock Update Interval:** The assumed interval for GAG stock updates is set to `1` minute (`STOCK_UPDATE_INTERVAL_MINUTES`). This is used to calculate the next *potential* refresh time for display and page auto-refresh. This can be changed directly in the code.

## API Endpoints

### 1. Web Dashboard & Documentation

*   **URL:** `/`
*   **Method:** `GET`
*   **Description:** Renders the HTML dashboard. This page displays all GAG data, a countdown timer for page auto-refresh, options for browser notifications, and detailed documentation for the JSON API.

### 2. JSON API for GAG Data

*   **URL:** `/api/gag-tracker`
*   **Method:** `GET`
*   **Description:** Returns a JSON object containing consolidated GAG data, including weather, general stock, egg stock, special stock, next refresh information, and credits.
*   **Response Structure (Simplified Example):**
    ```json
    {
        "weather": {
            "updatedAt": 1678886400000, // Unix timestamp (ms) of last GAG API update
            "currentWeather": "Rainy",
            "description": "Don't forget your umbrella!",
            "icon": "🌧️",
            // ... other weather details (visualCue, cropBonuses, rarity, weatherType, mutations)
            "error": null // or error message string if data fetch failed
        },
        "general_stock": {
            "updatedAt": 1678886400000,
            "gear": ["Shovel **x1**", "Watering Can **x1**"],
            "seeds": ["Tomato Seed **x5**"],
            "error": null
        },
        "egg_stock": {
            "updatedAt": 1678886400000,
            "egg": ["Basic Egg **x3**"],
            "error": null
        },
        "special_stock": {
            "honey": {
                "updatedAt": 1678886400000,
                "honey": ["Golden Honey **x1**"],
                "error": null
            },
            "cosmetics": {
                "updatedAt": 1678886400000,
                "cosmetics": ["Cool Hat **x1**"],
                "error": null
            }
        },
        "next_refresh_info": {
            "timestamp_ms": 1678886460000, // Estimated next potential GAG data update timestamp (ms)
            "time_manila": "Mar 15, 2023, 04:01:00 PM", // Same as above, formatted for Asia/Manila timezone
            "interval_minutes": 1 // The STOCK_UPDATE_INTERVAL_MINUTES value
        },
        "crafted_by": {
            "owner": "@sinontop",
            "channel": "@mksln"
        }
    }
    ```
    *   Each main data section (`weather`, `general_stock`, `egg_stock`) and sub-sections within `special_stock` (`honey`, `cosmetics`) includes an `updatedAt` field (Unix timestamp in milliseconds from the source GAG API) and an `error` field (null if successful, or an error message string if data retrieval for that specific section failed).
    *   Stock items are strings, often formatted as `"Item Name **xQuantity**"`.

## Browser Notifications

*   Users can enable browser notifications via a button on the dashboard ("Enable Notifications").
*   If permission is granted and notifications are enabled by the user:
    *   The browser will attempt to show an alert when the `updatedAt` timestamp for any of the tracked data categories (weather, general stock, egg stock, honey, cosmetics) changes compared to the last known timestamp stored in `localStorage`.
    *   This means notifications are triggered when new data is detected from the GAG APIs upon page load/refresh.
*   This feature relies on browser support for the Notification API.
*   Notification preferences and the last seen timestamps for each data category are stored in the browser's `localStorage`.

## Credits & Acknowledgements

*   **Crafted by:** @sinontop
*   **TG Channel:** @mksln
*   **Primary Data Source:** This application relies on the public APIs provided by **growagardenstock.com** for all Grow A Garden game data. Special thanks to the maintainers of that service.

## Disclaimer

This project fetches data from external APIs hosted at `growagardenstock.com`. The availability, accuracy, and update frequency of the GAG data are dependent on these external services. This tracker application merely consolidates and presents the data as provided.
