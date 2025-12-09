ReRouteLah (AR Bus Validator)


Current Features:

AR Compass: A digital arrow overlaid on the camera feed.

Bus Safety Validator: Real-time crowd density checks using the LTA DataMall API (Green = Safe, Red = Crowded).

1. Prerequisites

Before starting, ensure you have:

Node.js installed (v18 or newer).

An LTA DataMall API Key (Check your email from LTA).

2. Installation

Open your terminal in this project folder.

Install the required dependencies:

npm install


3. Configuration (Critical!)

You must add your API Key for the bus data to work.

Navigate to the file: app/api/lta/bus-arrival/route.js

Open it and find this line:

const LTA_API_KEY = 'YOUR_ACTUAL_LTA_API_KEY_HERE';


Replace 'YOUR_ACTUAL_LTA_API_KEY_HERE' with your actual key string.

Optional: Change Demo Bus Stop
To test with a bus stop near you:

Open app/page.tsx.

Modify these lines at the top:

const DEMO_BUS_STOP = '83139'; // Change to your bus stop code
const DEMO_BUS_SERVICE = '15'; // Change to a bus service at that stop


4. Running the App

Option A: Laptop Testing (Localhost)

Use this to check if the code runs, but Camera/AR will likely fail (browsers block cameras on http://).

Run the development server:

npm run dev


Open http://localhost:3000 in your browser.

To test the raw API data, visit: http://localhost:3000/test-api
