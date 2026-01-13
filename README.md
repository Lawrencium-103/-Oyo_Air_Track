# 🍃 Oyo AirTrack: Precision Environmental Intelligence

[![SDG Alignment](https://img.shields.io/badge/SDGs-3%2C%2011%2C%2013-blue.svg)](https://sdgs.un.org/goals)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Oyo AirTrack** is a high-performance, precision environmental monitoring platform designed to democratize air quality and thermal data for the citizens of Oyo State, Nigeria. Built on a "Zero-Cost Infrastructure" philosophy, it synthesizes aerospace-grade satellite data with localized GIS intelligence to protect public health and advance urban resilience.

---

## 💎 The Vision
In most developing regions, the "Data Divide" prevents proactive climate action. Invisible killers like Particulate Matter (PM2.5) and Urban Heat Islands go unmonitored due to the prohibitive cost of physical sensors. **Oyo AirTrack** bridges this gap by turning the atmosphere into a digital twin, providing every citizen with a professional-grade personal monitor in their pocket.

---

## 🏗️ Technical Moat: Edge-GIS Intelligence
What separates Oyo AirTrack from generic weather apps is its **Proprietary Edge-GIS Engine**. 

*   **Sub-Meter Precision Geolocation:** Unlike standard apps that approximate location, AirTrack implements a custom **Ray Casting (Point-in-Polygon) Algorithm** locally in the browser. This allows for near-instant identification of Local Government Area (LGA) administrative boundaries without expensive server-side GIS processing.
*   **Atmospheric Fluid Phisics:** The wind visualization isn't just an animation; it’s a mathematical representation of spatial turbulence and atmospheric drift, calibrated to real-world meteorological vectors.
*   **Zero-Latency PWA Architecture:** Engineered as a Progressive Web App, it operates with "Network-First" logic, ensuring critical health data is cached and available even in low-connectivity areas typical of rural Oyo.

---

## 🚀 Key Features

-   **Smart LGA Detector:** Automatic administrative boundary detection using localized GIS logic.
-   **Vibrant Choropleth Mapping:** Real-time color-coded health risk visualization across 33 LGAs.
-   **Precision GPS Marker:** Pulsing high-fidelity location tracking with sub-pixel alignment.
-   **Atmospheric Currents:** Real-time wind speed and direction dashboard.
-   **SDG Integration:** Direct alignment with UN Goals 3 (Health), 11 (Cities), and 13 (Climate Action).

---

## 🛠️ Built With
-   **GIS:** Leaflet.js with custom GeoJSON boundary logic.
-   **Meteorology:** OpenWeatherMap OneCall API & Air Pollution API.
-   **Intelligence:** Custom Javascript-based Ray Casting Engine.
-   **UI/UX:** Luxury Dark Glassmorphism Design System (Vanilla CSS).

---

## 📦 Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/Lawrencium-103/-Oyo_Air_Track.git
    ```
2.  Open `index.html` in any modern browser.
3.  (Optional) For full PWA support, serve via a local server (e.g., Live Server or Nginx).

---

## 📜 License
Published under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 👤 Author
**Lawrence Oladeji**  
*Data Scientist & SDG Advocate*  
"Data is the sunlight of sustainable development."

[Email Me](mailto:oladeji.lawrence@gmail.com) | [Connect on WhatsApp](https://wa.me/2349038819790)
