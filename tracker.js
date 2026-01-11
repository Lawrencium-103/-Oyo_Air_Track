// script.js - Oyo Air Quality & Heat Tracker (Clean & Error-Free Version)
// Last updated: January 10, 2026

// ===================== CONFIGURATION =====================
const API_KEY = '0e8e5eeb07a3282b8c53f77ff88262dc'; // ← REPLACE THIS with a fresh key from https://home.openweathermap.org/api_keys
// If you get 401 error → the key is invalid/expired. Get a new one (free).

const DEFAULT_LAT = 7.3775;   // Ibadan center
const DEFAULT_LNG = 3.9470;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// ===================== MAP INITIALIZATION =====================
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true
}).setView([DEFAULT_LAT, DEFAULT_LNG], 12);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Force map to recalculate size after layout settles (fixes tile misalignment)
setTimeout(() => map.invalidateSize(), 400);
window.addEventListener('resize', () => map.invalidateSize());

// ===================== LGA BOUNDARY LAYER =====================
// Include boundary data (in production, this would be loaded from oyo-boundaries.js)
// For now, we'll create a basic boundary layer with sample data
function initializeBoundaries() {
    // Load boundary data from external file or use fallback
    let boundaryData = null;

    // Try to load from external file, fallback to sample if not available
    try {
        // In production, boundaries would be loaded from oyo-boundaries.js
        if (typeof oyoLGABoundaries !== 'undefined') {
            boundaryData = oyoLGABoundaries;
        }
    } catch (e) {
        console.log('Boundary data not loaded, using fallback');
    }

    // If no boundary data, create basic boundaries from LGA coordinates
    if (!boundaryData) {
        boundaryData = createFallbackBoundaries();
    }

    // Create boundary layer with styling
    boundaryLayer = L.geoJSON(boundaryData, {
        style: function (feature) {
            return {
                color: '#2c7a7b',      // Oyo State theme color
                weight: 2,             // Border width
                opacity: 0.8,
                fillColor: getLGAAQIColor(feature.properties.name), // Color based on AQI (placeholder)
                fillOpacity: 0.1,     // Semi-transparent fill
                dashArray: '5, 5'     // Dashed border
            };
        },
        onEachFeature: function (feature, layer) {
            // Add popup with LGA information
            const popupContent = `
                <div class="boundary-popup">
                    <h6 class="fw-bold">${feature.properties.name}</h6>
                    <div class="small text-muted">
                        <div>HQ: ${feature.properties.headquarters || 'N/A'}</div>
                        <div>Area: ${feature.properties.area_km2 || 'N/A'} km²</div>
                        <div>Population: ${feature.properties.population ? feature.properties.population.toLocaleString() : 'N/A'}</div>
                    </div>
                    <button class="btn btn-sm btn-primary mt-2" onclick="selectLGABoundary('${feature.properties.name}')">
                        Monitor Air Quality
                    </button>
                </div>
            `;

            layer.bindPopup(popupContent);

            // Add hover effects
            layer.on({
                mouseover: function (e) {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        fillOpacity: 0.3
                    });
                },
                mouseout: function (e) {
                    boundaryLayer.resetStyle(e.target);
                },
                click: function (e) {
                    // Highlight selected LGA
                    boundaryLayer.eachLayer(function (layer) {
                        boundaryLayer.resetStyle(layer);
                    });
                    e.target.setStyle({
                        weight: 4,
                        fillOpacity: 0.4,
                        color: '#1a5f5f'
                    });
                }
            });
        }
    }).addTo(map);

    console.log('LGA boundaries loaded successfully');
}

// Create fallback boundaries when real data isn't available
function createFallbackBoundaries() {
    const features = oyoLGAs.map(lga => {
        // Create approximate rectangular boundaries around each LGA HQ
        // In production, replace with actual boundary polygons
        const size = 0.05; // Approximate size in degrees
        return {
            type: "Feature",
            properties: {
                name: lga.name,
                headquarters: lga.hq,
                lga_code: lga.name.substring(0, 3).toUpperCase(),
                population: null, // Would be populated from real data
                area_km2: null
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [lga.lng - size, lga.lat - size],
                    [lga.lng + size, lga.lat - size],
                    [lga.lng + size, lga.lat + size],
                    [lga.lng - size, lga.lat + size],
                    [lga.lng - size, lga.lat - size]
                ]]
            }
        };
    });

    return {
        type: "FeatureCollection",
        features: features
    };
}

// Get AQI-based color for LGA (placeholder function)
function getLGAAQIColor(lgaName) {
    // In production, this would fetch real AQI data for each LGA
    // For now, return a random color to show variation
    const colors = ['#48bb78', '#ecc94b', '#ed8936', '#f56565', '#9f7aea'];
    const hash = lgaName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

// Function to select LGA from boundary click
function selectLGABoundary(lgaName) {
    const lga = oyoLGAs.find(l => l.name === lgaName);
    if (lga) {
        // Update dropdown selection
        const select = document.getElementById('lga-select');
        select.value = `${lga.lat},${lga.lng},${lga.name}`;

        // Update map
        updateMap(lga.lat, lga.lng, lga.name);
    }
}

// Toggle boundary visibility
function toggleBoundaries() {
    if (boundaryVisible) {
        map.removeLayer(boundaryLayer);
        boundaryVisible = false;
    } else {
        boundaryLayer.addTo(map);
        boundaryVisible = true;
    }

    // Update button text
    const btn = document.getElementById('toggle-boundaries');
    if (btn) {
        btn.innerHTML = boundaryVisible ?
            '<i class="fas fa-layer-group"></i> Hide Boundaries' :
            '<i class="fas fa-layer-group"></i> Show Boundaries';
    }
}

// ===================== OYO STATE LGAs (33) =====================
const oyoLGAs = [
    { name: 'Afijio', hq: 'Jobele', lat: 7.6833, lng: 3.9167 },
    { name: 'Akinyele', hq: 'Moniya', lat: 7.5167, lng: 3.9167 },
    { name: 'Atiba', hq: 'Ofa Meta', lat: 8.0333, lng: 4.0667 },
    { name: 'Atisbo', hq: 'Tede', lat: 8.5000, lng: 3.3667 },
    { name: 'Egbeda', hq: 'Egbeda', lat: 7.3833, lng: 4.0500 },
    { name: 'Ibadan North', hq: 'Agodi Gate', lat: 7.4000, lng: 3.9167 },
    { name: 'Ibadan North-East', hq: 'Iwo Road', lat: 7.3833, lng: 3.9500 },
    { name: 'Ibadan North-West', hq: 'Onireke', lat: 7.3833, lng: 3.8833 },
    { name: 'Ibadan South-East', hq: 'Mapo', lat: 7.3667, lng: 3.9333 },
    { name: 'Ibadan South-West', hq: 'Ring Road', lat: 7.3500, lng: 3.8667 },
    { name: 'Ibarapa Central', hq: 'Igbo Ora', lat: 7.4333, lng: 3.2833 },
    { name: 'Ibarapa East', hq: 'Eruwa', lat: 7.5500, lng: 3.4333 },
    { name: 'Ibarapa North', hq: 'Ayete', lat: 7.6167, lng: 3.2333 },
    { name: 'Ido', hq: 'Ido', lat: 7.4667, lng: 3.7500 },
    { name: 'Irepo', hq: 'Kisi', lat: 8.8333, lng: 3.8500 },
    { name: 'Iseyin', hq: 'Iseyin', lat: 7.9667, lng: 3.6000 },
    { name: 'Itesiwaju', hq: 'Otu', lat: 8.3333, lng: 3.3833 },
    { name: 'Iwajowa', hq: 'Iwere Ile', lat: 7.9833, lng: 2.9667 },
    { name: 'Kajola', hq: 'Okeho', lat: 8.0333, lng: 3.3500 },
    { name: 'Lagelu', hq: 'Iyana Offa', lat: 7.4500, lng: 3.9667 },
    { name: 'Ogbomosho North', hq: 'Kinnira', lat: 8.1333, lng: 4.2500 },
    { name: 'Ogbomosho South', hq: 'Arowomole', lat: 8.1167, lng: 4.2500 },
    { name: 'Ogo Oluwa', hq: 'Ajaawa', lat: 7.9500, lng: 4.1333 },
    { name: 'Olorunsogo', hq: 'Igbeti', lat: 8.6667, lng: 4.1167 },
    { name: 'Oluyole', hq: 'Idi Ayunre', lat: 7.2000, lng: 3.8667 },
    { name: 'Ona Ara', hq: 'Akanran', lat: 7.3000, lng: 4.0333 },
    { name: 'Orelope', hq: 'Igboho', lat: 8.8333, lng: 3.7500 },
    { name: 'Ori Ire', hq: 'Ikoyi', lat: 8.2500, lng: 4.1500 },
    { name: 'Oyo East', hq: 'Kosobo', lat: 7.8500, lng: 3.9667 },
    { name: 'Oyo West', hq: 'Ojongbodu', lat: 7.8333, lng: 3.8833 },
    { name: 'Saki East', hq: 'Ago Amodu', lat: 8.6667, lng: 3.6000 },
    { name: 'Saki West', hq: 'Saki', lat: 8.6667, lng: 3.4000 },
    { name: 'Surulere', hq: 'Iresa Adu', lat: 8.1333, lng: 4.3333 }
];

// ===================== POPULATE DROPDOWN =====================
const lgaSelect = document.getElementById('lga-select');
if (lgaSelect) {
    oyoLGAs.forEach(lga => {
        const option = document.createElement('option');
        option.value = `${lga.lat},${lga.lng},${lga.name}`;
        option.textContent = `${lga.name} (${lga.hq})`;
        lgaSelect.appendChild(option);
    });
}

// ===================== GLOBALS =====================
let velocityLayer = null;
let infoControl = null;
let boundaryLayer = null;
let boundaryVisible = true;

// ===================== MAIN UPDATE FUNCTION =====================
async function updateMap(lat, lng, locationName = 'Custom Location') {
    // Show loading indicator
    // Show loading indicator (Glassmorphism Toast)
    let loading = document.getElementById('loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading';
        loading.className = 'glass-panel text-white';
        loading.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Fetching satellite data...`;
        loading.style.position = 'absolute';
        loading.style.top = '100px';
        loading.style.left = '50%';
        loading.style.transform = 'translateX(-50%)';
        loading.style.borderRadius = '30px';
        loading.style.padding = '10px 24px';
        loading.style.zIndex = '2000';
        loading.style.fontSize = '0.9rem';
        loading.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        loading.style.backdropFilter = 'blur(8px)';
        loading.style.background = 'rgba(23, 25, 35, 0.7)';
        loading.style.border = '1px solid rgba(255,255,255,0.1)';
        document.body.appendChild(loading);
    }

    try {
        map.setView([lat, lng], 13);

        const [aqRes, weatherRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`)
        ]);

        if (!aqRes.ok || !weatherRes.ok) throw new Error('API Error');

        const aqData = await aqRes.json();
        const weather = await weatherRes.json();

        const aqi = aqData.list?.[0]?.main?.aqi ?? 1;
        const temp = weather.main?.temp?.toFixed(1) ?? 'N/A';
        const windSpeed = weather.wind?.speed ?? 0;
        const windDeg = weather.wind?.deg ?? 0;

        // Colors
        const aqiLevels = [
            { max: 1, label: 'Good', color: '#48bb78' },
            { max: 2, label: 'Fair', color: '#ecc94b' },
            { max: 3, label: 'Moderate', color: '#ed8936' },
            { max: 4, label: 'Poor', color: '#f56565' },
            { max: 5, label: 'Very Poor', color: '#9f7aea' }
        ];
        const level = aqiLevels.find(l => aqi <= l.max) || aqiLevels[4];

        // 1. UPDATE WIND/HEAT ANIMATION
        if (velocityLayer) map.removeLayer(velocityLayer);

        // Generate noticeable wind movement
        const windData = generateWindData(lat, lng, windSpeed, windDeg, 25);
        velocityLayer = L.velocityLayer({
            data: windData,
            minVelocity: 0,
            maxVelocity: 15,
            velocityScale: 0.02, // Increased scale for visibility
            colorScale: [level.color, '#ffffff'], // Tint wind with AQI color
            lineWidth: 2,
            particleMultiplier: 1.0, // More particles
            displayValues: true,
            displayOptions: {
                velocityType: 'Wind',
                position: 'bottomleft',
                emptyString: 'No wind data',
                angleConvention: 'bearingCW',
                speedUnit: 'm/s'
            }
        }).addTo(map);

        // 2. SHOW INFO PANEL (Floating Toast)
        const infoHtml = `
            <div class="glass-panel text-white p-3 rounded-3 shadow-sm" style="min-width: 250px;">
                <h6 class="mb-2 fw-bold border-bottom pb-1 border-light-subtle">${locationName}</h6>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge" style="background:${level.color}; color: #000;">AQI: ${level.label}</span>
                    <span class="fs-5 fw-bold">${temp}°C</span>
                </div>
                <div class="small text-white-50">
                    <i class="fas fa-wind"></i> ${windSpeed} m/s 
                    <i class="fas fa-droplet ms-2"></i> PM2.5: ${aqData.list[0].components.pm2_5}
                </div>
            </div>
        `;

        // Safe Control Update
        if (!infoControl) {
            const InfoControl = L.Control.extend({
                onAdd: function () {
                    const div = L.DomUtil.create('div', 'info-control');
                    div.innerHTML = infoHtml;
                    return div;
                }
            });
            infoControl = new InfoControl({ position: 'topright' });
            infoControl.addTo(map);
        } else {
            // Standard way to update content if wrapper exists
            const container = document.querySelector('.info-control');
            if (container) container.innerHTML = infoHtml;
        }

        loading.remove();

    } catch (error) {
        console.error('Update failed:', error);
        loading.innerHTML = `<i class="fas fa-exclamation-triangle text-warning"></i> Using simulated data (${error.message})`;
        setTimeout(() => loading.remove(), 3000);

        // Fallback Animation
        if (velocityLayer) map.removeLayer(velocityLayer);
        velocityLayer = L.velocityLayer({
            data: generateWindData(lat, lng, 5, 180, 20),
            velocityScale: 0.02,
            colorScale: ['#e53e3e', '#ffffff'] // Red for fallback
        }).addTo(map);
    }
}

// Data Generator Helper (Fixed for leaflet-velocity format)
function generateWindData(lat, lng, speed, deg, gridSize) {
    const uData = [];
    const vData = [];
    const minSpeed = Math.max(speed, 2); // Ensure movement

    for (let i = 0; i < gridSize * gridSize; i++) {
        const rand = 0.8 + Math.random() * 0.4;
        const angleVar = (Math.random() - 0.5) * 20;
        const rad = (deg + angleVar) * Math.PI / 180;

        // Calculate components (U = East-West, V = North-South)
        // Standard met conversion: u = -speed * sin(dir), v = -speed * cos(dir)
        const u = -minSpeed * rand * Math.sin(rad);
        const v = -minSpeed * rand * Math.cos(rad);

        uData.push(u);
        vData.push(v);
    }

    const headerBase = {
        parameterCategory: 2,
        nx: gridSize, ny: gridSize,
        lo1: lng - 0.5, la1: lat + 0.5,
        lo2: lng + 0.5, la2: lat - 0.5,
        dx: 1 / (gridSize - 1), dy: 1 / (gridSize - 1),
        refTime: new Date().toISOString(), forecastTime: 0
    };

    return [
        {
            header: { ...headerBase, parameterNumber: 2 }, // U-component (Eastward)
            data: uData
        },
        {
            header: { ...headerBase, parameterNumber: 3 }, // V-component (Northward)
            data: vData
        }
    ];
}

// Helper for fallback animation
// Helper for fallback animation (Removed/Merged into generateWindData)

// ===================== LOCATION FINDER FUNCTIONS =====================
async function getDetailedLocation(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();

        if (data && data.address) {
            const address = data.address;
            return {
                display_name: data.display_name,
                road: address.road || '',
                suburb: address.suburb || address.neighbourhood || '',
                city: address.city || address.town || address.village || '',
                state: address.state || '',
                country: address.country || '',
                postcode: address.postcode || ''
            };
        }
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
    }
    return null;
}

function showLocationModal(lat, lng, locationDetails) {
    const modal = new bootstrap.Modal(document.getElementById('locationModal'));
    const locationInfo = document.getElementById('location-info');

    let infoHtml = `
        <div class="mb-3">
            <h6 class="text-success mb-3"><i class="fas fa-map-pin"></i> Coordinates Found</h6>
            <div class="row g-2">
                <div class="col-6">
                    <small class="text-white-50">Latitude</small>
                    <div class="fw-bold">${lat.toFixed(6)}</div>
                </div>
                <div class="col-6">
                    <small class="text-white-50">Longitude</small>
                    <div class="fw-bold">${lng.toFixed(6)}</div>
                </div>
            </div>
        </div>`;

    if (locationDetails) {
        infoHtml += `
        <div class="border-top border-light pt-3">
            <h6 class="text-info mb-3"><i class="fas fa-address-book"></i> Address Details</h6>
            <div class="location-details">`;

        if (locationDetails.road) infoHtml += `<div><strong>Road:</strong> ${locationDetails.road}</div>`;
        if (locationDetails.suburb) infoHtml += `<div><strong>Area:</strong> ${locationDetails.suburb}</div>`;
        if (locationDetails.city) infoHtml += `<div><strong>City:</strong> ${locationDetails.city}</div>`;
        if (locationDetails.state) infoHtml += `<div><strong>State:</strong> ${locationDetails.state}</div>`;
        if (locationDetails.postcode) infoHtml += `<div><strong>Postcode:</strong> ${locationDetails.postcode}</div>`;
        if (locationDetails.country) infoHtml += `<div><strong>Country:</strong> ${locationDetails.country}</div>`;

        infoHtml += `
            </div>
        </div>`;
    } else {
        infoHtml += `
        <div class="border-top border-light pt-3">
            <div class="text-warning">
                <i class="fas fa-exclamation-triangle"></i> Unable to get detailed address information.
            </div>
        </div>`;
    }

    locationInfo.innerHTML = infoHtml;
    modal.show();

    // Store coordinates for later use
    document.getElementById('use-this-location').dataset.lat = lat;
    document.getElementById('use-this-location').dataset.lng = lng;
    document.getElementById('use-this-location').dataset.name = locationDetails?.display_name?.split(',')[0] || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

function findUserLocation() {
    const button = document.getElementById('find-location');
    const originalText = button.innerHTML;

    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding...';
    button.disabled = true;

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        button.innerHTML = originalText;
        button.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Get detailed location info
            const locationDetails = await getDetailedLocation(lat, lng);

            // Show modal with location details
            showLocationModal(lat, lng, locationDetails);

            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
        },
        (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = 'Unable to find your location. ';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access and try again.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'An unknown error occurred.';
                    break;
            }

            alert(errorMessage);
            button.innerHTML = originalText;
            button.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        }
    );
}

// ===================== EVENT LISTENERS =====================
document.getElementById('lga-select').addEventListener('change', (e) => {
    if (!e.target.value) return;
    const [lat, lng, name] = e.target.value.split(',');
    updateMap(parseFloat(lat), parseFloat(lng), name);
});

document.getElementById('submit-custom').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('custom-lat').value);
    const lng = parseFloat(document.getElementById('custom-lng').value);

    if (isNaN(lat) || isNaN(lng) || lat < 7 || lat > 9.5 || lng < 2.8 || lng > 4.5) {
        alert('Please enter valid coordinates within Oyo State bounds (Lat 7–9.5, Lng 2.8–4.5).');
        return;
    }

    updateMap(lat, lng);
});

// Location finder event listeners
document.getElementById('find-location').addEventListener('click', findUserLocation);

document.getElementById('use-this-location').addEventListener('click', (e) => {
    const lat = parseFloat(e.target.dataset.lat);
    const lng = parseFloat(e.target.dataset.lng);
    const name = e.target.dataset.name;

    if (lat && lng) {
        updateMap(lat, lng, name);
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('locationModal')).hide();
    }
});

// Boundary toggle event listener
document.getElementById('toggle-boundaries').addEventListener('click', toggleBoundaries);

// ===================== INITIAL LOAD & AUTO-REFRESH =====================
// Initialize LGA boundaries
initializeBoundaries();

// Load default location
updateMap(DEFAULT_LAT, DEFAULT_LNG, 'Ibadan (Default)');

setInterval(() => {
    const center = map.getCenter();
    updateMap(center.lat, center.lng);
}, REFRESH_INTERVAL_MS);

// ===================== PWA SERVICE WORKER REGISTRATION =====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered:', reg.scope))
            .catch(err => console.error('SW Registration Failed:', err));
    });
}
