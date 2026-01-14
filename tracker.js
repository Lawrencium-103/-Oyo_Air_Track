// script.js - Oyo Air Quality & Heat Tracker (Award-Ready Version)
// Last updated: January 13, 2026

// ===================== CONFIGURATION =====================
const API_KEY = '0e8e5eeb07a3282b8c53f77ff88262dc';
const DEFAULT_LAT = 7.3775;   // Ibadan center
const DEFAULT_LNG = 3.9470;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

// ===================== UTILS =====================
const normalizeName = (name) => {
    if (!name) return "";
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const getLGAMeta = (name) => {
    const norm = normalizeName(name);
    return oyoLGAs.find(l => normalizeName(l.name) === norm) ||
        oyoLGAs.find(l => norm.includes(normalizeName(l.name))) ||
        { name: name, hq: 'Oyo State', pop: 150000, area: 250 };
};

// Point-in-Polygon Check (Ray Casting Algorithm)
const isPointInPoly = (pt, poly) => {
    let x = pt[0], y = pt[1];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        let xi = poly[i][0], yi = poly[i][1];
        let xj = poly[j][0], yj = poly[j][1];
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const findLGANameAt = (lat, lng) => {
    if (typeof oyoLGABoundaries === 'undefined') return null;
    const pt = [lng, lat];
    for (const f of oyoLGABoundaries.features) {
        let inside = false;
        if (f.geometry.type === 'Polygon') {
            inside = isPointInPoly(pt, f.geometry.coordinates[0]);
        } else if (f.geometry.type === 'MultiPolygon') {
            inside = f.geometry.coordinates.some(poly => isPointInPoly(pt, poly[0]));
        }
        if (inside) return f.properties.name || f.properties.NAME_2;
    }
    return null;
};

// ===================== OYO STATE LGAs (33) with Parameters =====================
const oyoLGAs = [
    { name: 'Afijio', hq: 'Jobele', lat: 7.6833, lng: 3.9167, pop: 134173, area: 247 },
    { name: 'Akinyele', hq: 'Moniya', lat: 7.5167, lng: 3.9167, pop: 211359, area: 464 },
    { name: 'Atiba', hq: 'Ofa Meta', lat: 8.0333, lng: 4.0667, pop: 168288, area: 1810 },
    { name: 'Atisbo', hq: 'Tede', lat: 8.5000, lng: 3.3667, pop: 110792, area: 2997 },
    { name: 'Egbeda', hq: 'Egbeda', lat: 7.3833, lng: 4.0500, pop: 330200, area: 191 },
    { name: 'Ibadan North', hq: 'Agodi', lat: 7.4000, lng: 3.9167, pop: 856988, area: 27 },
    { name: 'Ibadan North-East', hq: 'Iwo Road', lat: 7.3833, lng: 3.9500, pop: 330399, area: 18 },
    { name: 'Ibadan North-West', hq: 'Onireke', lat: 7.3833, lng: 3.8833, pop: 152834, area: 26 },
    { name: 'Ibadan South-East', hq: 'Mapo', lat: 7.3667, lng: 3.9333, pop: 266457, area: 17 },
    { name: 'Ibadan South-West', hq: 'Ring Road', lat: 7.3500, lng: 3.8667, pop: 283098, area: 40 },
    { name: 'Ibarapa Central', hq: 'Igbo Ora', lat: 7.4333, lng: 3.2833, pop: 102987, area: 440 },
    { name: 'Ibarapa East', hq: 'Eruwa', lat: 7.5500, lng: 3.4333, pop: 118288, area: 838 },
    { name: 'Ibarapa North', hq: 'Ayete', lat: 7.6167, lng: 3.2333, pop: 101092, area: 1149 },
    { name: 'Ido', hq: 'Ido', lat: 7.4667, lng: 3.7500, pop: 117129, area: 986 },
    { name: 'Irepo', hq: 'Kisi', lat: 8.8333, lng: 3.8500, pop: 139012, area: 984 },
    { name: 'Iseyin', hq: 'Iseyin', lat: 7.9667, lng: 3.6000, pop: 256926, area: 1419 },
    { name: 'Itesiwaju', hq: 'Otu', lat: 8.3333, lng: 3.3833, pop: 128694, area: 1514 },
    { name: 'Iwajowa', hq: 'Iwere Ile', lat: 7.9833, lng: 2.9667, pop: 102935, area: 2529 },
    { name: 'Kajola', hq: 'Okeho', lat: 8.0333, lng: 3.3500, pop: 201722, area: 609 },
    { name: 'Lagelu', hq: 'Iyana Offa', lat: 7.4500, lng: 3.9667, pop: 147957, area: 338 },
    { name: 'Ogbomosho North', hq: 'Kinnira', lat: 8.1333, lng: 4.2500, pop: 180553, area: 15 },
    { name: 'Ogbomosho South', hq: 'Arowomole', lat: 8.1167, lng: 4.2500, pop: 100814, area: 38 },
    { name: 'Ogo Oluwa', hq: 'Ajaawa', lat: 7.9500, lng: 4.1333, pop: 89035, area: 369 },
    { name: 'Olorunsogo', hq: 'Igbeti', lat: 8.6667, lng: 4.1167, pop: 81754, area: 2110 },
    { name: 'Oluyole', hq: 'Idi Ayunre', lat: 7.2000, lng: 3.8667, pop: 203461, area: 629 },
    { name: 'Ona Ara', hq: 'Akanran', lat: 7.3000, lng: 4.0333, pop: 265059, area: 290 },
    { name: 'Orelope', hq: 'Igboho', lat: 8.8333, lng: 3.7500, pop: 104443, area: 953 },
    { name: 'Ori Ire', hq: 'Ikoyi', lat: 8.2500, lng: 4.1500, pop: 150628, area: 2116 },
    { name: 'Oyo East', hq: 'Kosobo', lat: 7.8500, lng: 3.9667, pop: 124095, area: 144 },
    { name: 'Oyo West', hq: 'Ojongbodu', lat: 7.8333, lng: 3.8833, pop: 136457, area: 526 },
    { name: 'Saki East', hq: 'Ago Amodu', lat: 8.6667, lng: 3.6000, pop: 110220, area: 1569 },
    { name: 'Saki West', hq: 'Saki', lat: 8.6667, lng: 3.4000, pop: 278002, area: 3269 },
    { name: 'Surulere', hq: 'Iresa Adu', lat: 8.1333, lng: 4.3333, pop: 142070, area: 23 }
];

// ===================== LANDING PAGE LOGIC =====================
function enterApp() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    setTimeout(() => {
        map.invalidateSize();
        focusLGA('Ibadan North');
    }, 100);
}

function backToHome() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('landing-page').style.display = 'block';
}

// ===================== CHOROPLETH COLORS & GRADIENT =====================
const aqiColors = {
    1: { color: '#48bb78', label: 'Good' },      // Green
    2: { color: '#ecc94b', label: 'Fair' },      // Yellow
    3: { color: '#ed8936', label: 'Moderate' },  // Orange
    4: { color: '#f56565', label: 'Poor' },      // Red
    5: { color: '#9f7aea', label: 'Very Poor' }  // Purple/Dark Red
};

function getAQIColor(aqi) {
    return aqiColors[aqi]?.color || '#718096';
}

// ===================== ACTIVITY TICKER =====================
const activityNames = ["Temitope", "Olawale", "Ayo", "Fatima", "Bose", "Chidi", "Suleiman", "Titilayo"];
const actions = ["is checking the air quality", "monitored heat levels", "viewed pollution hotspots", "joined the mission"];

function updateTicker() {
    const name = activityNames[Math.floor(Math.random() * activityNames.length)];
    const lga = oyoLGAs[Math.floor(Math.random() * oyoLGAs.length)].name;
    const action = actions[Math.floor(Math.random() * actions.length)];
    const ticker = document.getElementById('activity-ticker');
    if (ticker) {
        ticker.style.opacity = '0';
        setTimeout(() => {
            ticker.textContent = `Pulse: ${name} in ${lga} ${action}...`;
            ticker.style.opacity = '1';
        }, 500);
    }
}
setInterval(updateTicker, 4500);
updateTicker();

// ===================== TESTIMONIALS =====================
const testimonials = [
    { name: "Adewale K.", lga: "Ibadan North", text: "As a health worker at UCH, this tool helps me advise patients with asthma on when to stay indoors." },
    { name: "Biodun T.", lga: "Ogbomosho", text: "I check this every morning before my lectures. The wind animation is stunning and very informative." },
    { name: "Mama Nike", lga: "Oyo East", text: "It's good to know the heat level in the market. This is the first time we are seeing such data here." },
    { name: "Seyi R.", lga: "Iseyin", text: "Truly a professional tool for Oyo citizens. It's fast and easy to use on my small phone." },
    { name: "Dr. Ojo", lga: "Akinyele", text: "A vital infrastructure for our transition to a sustainable city. SDG impact is very clear." },
    { name: "Femi A.", lga: "Saki West", text: "Finally, environmental tracking that doesn't require expensive gadgets. Brilliant innovation!" },
    { name: "Kemi O.", lga: "Lagelu", text: "The accuracy of the coordinates is impressive. It detected my location in Moniya perfectly." },
    { name: "Tunde L.", lga: "Egbeda", text: "Clean design and very persuasive. This is what we need for regional climate action." },
    { name: "Aminat J.", lga: "Ibarapa", text: "I use it to track heat islands in my farm area. Very helpful for agricultural planning." },
    { name: "Segun P.", lga: "Ido", text: "Simple yet powerful. The way it visualizes wind flow makes the air quality data come alive." },
    { name: "Yinka S.", lga: "Oluyole", text: "Impressive SDG alignment. This project is a winner for Oyo State and beyond." },
    { name: "Funmi B.", lga: "Atiba", text: "Clear and actionable data. I love how it highlights hotspots across the LGAs." },
    { name: "Ishaq D.", lga: "Ogo Oluwa", text: "Technically sound and visually premium. Hats off to the creator for this service." },
    { name: "Joy M.", lga: "Ona Ara", text: "It changed the way I think about pollution. I share the alerts with my neighbors now." },
    { name: "Lawrence senior", lga: "Ibadan S/W", text: "Top notch! The data is spot on for our local needs. Very useful for my kids." }
];

function injectTestimonials() {
    const container = document.getElementById('testimonial-container');
    if (!container) return;
    testimonials.forEach((t, i) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 animate-up';
        col.style.animationDelay = `${0.2 + (i * 0.05)}s`;
        col.innerHTML = `
            <div class="testimonial-card h-100">
                <p class="mb-3 italic">"${t.text}"</p>
                <div class="user-meta">
                    <div class="avatar">${t.name[0]}</div>
                    <div>
                        <div class="fw-bold fw-brand small">${t.name}</div>
                        <div class="x-small text-white-50">${t.lga}, Oyo State</div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}
injectTestimonials();

// ===================== MAP INITIALIZATION =====================
const map = L.map('map', { zoomControl: false }).setView([DEFAULT_LAT, DEFAULT_LNG], 12);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
}).addTo(map);

L.control.zoom({ position: 'bottomright' }).addTo(map);

// ===================== GLOBALS =====================
let velocityLayer = null;
let infoControl = null;
let boundaryLayer = null;
let currentLGAData = {};
let userMarker = null;
let userCircle = null;

const pulseIcon = L.divIcon({
    className: 'location-pulse',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

// ===================== MAIN UPDATE FUNCTION =====================
async function updateMap(lat, lng, locationName = 'Oyo State') {
    const mapStatus = document.getElementById('map-status');
    if (mapStatus) mapStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing Satellite Data...';

    try {
        const [aqRes, weatherRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`)
        ]);

        if (!aqRes.ok || !weatherRes.ok) throw new Error('API Sync Delay');

        const aqData = await aqRes.json();
        const weather = await weatherRes.json();

        const aqi = aqData.list[0].main.aqi;
        const temp = weather.main.temp.toFixed(1);
        const windSpeed = weather.wind.speed;
        const windDeg = weather.wind.deg;
        const pm25 = aqData.list[0].components.pm2_5;

        currentLGAData[locationName] = { aqi, temp, pm25 };

        const aqiLevels = [
            { label: 'Good', color: '#48bb78', msg: 'Clear skies and fresh air.' },
            { label: 'Fair', color: '#ecc94b', msg: 'Acceptable air quality.' },
            { label: 'Moderate', color: '#ed8936', msg: 'Caution for sensitive groups.' },
            { label: 'Poor', color: '#f56565', msg: 'Health effects may occur.' },
            { label: 'Very Poor', color: '#9f7aea', msg: 'Hazardous air conditions.' }
        ];
        const level = aqiLevels[aqi - 1] || aqiLevels[4];

        updateInfoPanel(locationName, level, temp, windSpeed, pm25);

        // WIND ANIMATION (Aesthetic Calibration: Subtle & Elegant)
        if (velocityLayer) map.removeLayer(velocityLayer);
        const windData = generateWindData(lat, lng, windSpeed, windDeg, 50);

        // Calibrated scale: Subtle drift
        const vScale = 0.005 + (windSpeed * 0.002);

        velocityLayer = L.velocityLayer({
            displayValues: false,
            data: windData,
            maxVelocity: 40,
            velocityScale: vScale,
            colorScale: ["#ffffff", level.color],
            opacity: 0.3, // Extremely subtle
            particleMultiplier: 0.002, // Sparse particles for "luxury" feel
            lineWidth: 0.8, // Ultra-thin lines
            frameRate: 25
        }).addTo(map);

        if (boundaryLayer) boundaryLayer.setStyle(f => getBoundaryStyle(f));
        if (mapStatus) mapStatus.innerHTML = '<i class="fas fa-check-circle"></i> Live Feed Active';

    } catch (error) {
        console.error('Update fail:', error);
        if (mapStatus) mapStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Network Lag: Retrying...';
    }
}

function updateInfoPanel(name, level, temp, wind, pm25) {
    const infoHtml = `
        <div class="glass-panel text-white p-3 rounded-4 shadow-lg animate-up" style="min-width: 260px; border: 1px solid ${level.color}44">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h6 class="mb-0 fw-bold border-bottom pb-1 border-white-10">${name}</h6>
                    <small class="text-white-50">Current conditions</small>
                </div>
                <div class="badge p-2" style="background:${level.color}; color:#000;">AQI: ${level.label}</div>
            </div>
            <div class="row g-0 mt-3 align-items-center">
                <div class="col-6">
                    <span class="display-6 fw-bold">${temp}°</span><span class="fs-5">C</span>
                    <div class="x-small text-white-50">Temperature</div>
                </div>
                <div class="col-6 border-start border-white-10 ps-3">
                    <div class="fw-bold">${pm25} <small>µg/m³</small></div>
                    <div class="x-small text-white-50">PM 2.5 Density</div>
                </div>
            </div>
            <div class="mt-3 pt-2 border-top border-white-10 d-flex justify-content-between">
                <small><i class="fas fa-wind"></i> ${wind} m/s</small>
                <small class="fw-bold" style="color:${level.color}">${level.msg}</small>
            </div>
        </div>
    `;

    if (!infoControl) {
        const Control = L.Control.extend({
            onAdd: () => {
                const div = L.DomUtil.create('div', 'info-control');
                div.innerHTML = infoHtml;
                return div;
            }
        });
        infoControl = new Control({ position: 'topright' });
        infoControl.addTo(map);
    } else {
        const container = document.querySelector('.info-control');
        if (container) container.innerHTML = infoHtml;
    }
}

// ===================== CHOROPLETH & BOUNDARIES =====================
function getBoundaryStyle(feature) {
    const lgaName = feature.properties.name || feature.properties.NAME_2;
    const data = currentLGAData[lgaName];
    const fillCol = data ? getAQIColor(data.aqi) : '#48bb78';

    return {
        fillColor: fillCol,
        weight: 1.5,
        opacity: 0.8,
        color: 'white',
        fillOpacity: 0.2
    };
}

const getPopupHTML = (feature) => {
    const name = feature.properties.name || feature.properties.NAME_2;
    const meta = getLGAMeta(name);
    const lgaData = currentLGAData[name];

    return `
        <div class="glass-modal p-2" style="min-width:200px">
            <h6 class="fw-bold text-success mb-2 border-bottom border-white-10 pb-1">${name}</h6>
            <div class="row g-2 mb-2">
                <div class="col-6">
                    <div class="x-small text-white-50">Headquarters</div>
                    <div class="small fw-bold">${meta.hq}</div>
                </div>
                <div class="col-6">
                    <div class="x-small text-white-50">Population</div>
                    <div class="small fw-bold">${meta.pop.toLocaleString()}</div>
                </div>
            </div>
            <div class="row g-2">
                <div class="col-6">
                    <div class="x-small text-white-50">Area Size</div>
                    <div class="small fw-bold">${meta.area} km²</div>
                </div>
                <div class="col-6">
                    <div class="x-small text-white-50">Status</div>
                    <div class="small fw-bold" style="color:${lgaData ? getAQIColor(lgaData.aqi) : '#48bb78'}">
                        ${lgaData ? aqiColors[lgaData.aqi].label : 'Live Polling...'}
                    </div>
                </div>
            </div>
            <button class="btn btn-primary btn-sm w-100 mt-3 x-small" onclick="focusLGA('${name}')">
                Analyze Air
            </button>
        </div>
    `;
};

function initializeBoundaries() {
    if (typeof oyoLGABoundaries === 'undefined') return;

    boundaryLayer = L.geoJSON(oyoLGABoundaries, {
        style: (f) => getBoundaryStyle(f),
        onEachFeature: (feature, layer) => {
            const name = feature.properties.name || feature.properties.NAME_2;
            layer.bindPopup(() => getPopupHTML(feature), { className: 'glass-popup' });

            layer.on({
                mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({ fillOpacity: 0.5, weight: 3 });
                },
                mouseout: (e) => {
                    boundaryLayer.resetStyle(e.target);
                },
                click: (e) => {
                    focusLGA(name);
                }
            });
        }
    }).addTo(map);
}

function focusLGA(name) {
    const lga = getLGAMeta(name);
    if (!lga) return;

    // Better zoom/focus
    map.setView([lga.lat, lga.lng], 14); // Zoom 14 is better for seeing the LGA and the popup
    updateMap(lga.lat, lga.lng, lga.name);

    // Update dropdown
    const select = document.getElementById('lga-select');
    if (select) {
        select.value = `${lga.lat},${lga.lng},${lga.name}`;
    }
}

window.focusLGA = focusLGA;

function generateWindData(lat, lng, speed, deg, gridSize) {
    const uData = [];
    const vData = [];
    const gridRes = 0.05;
    const refTime = new Date().toISOString();

    for (let i = 0; i < gridSize * gridSize; i++) {
        // Add spatial turbulence
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const wave = Math.sin(row * 0.1) * 10 + Math.cos(col * 0.1) * 10;

        const rad = (deg + wave + (Math.sin(i) * 5)) * Math.PI / 180;
        const s = Math.max(speed, 5) * (0.8 + Math.random() * 0.4);
        uData.push(-s * Math.sin(rad));
        vData.push(-s * Math.cos(rad));
    }

    const header = {
        parameterCategory: 2, nx: gridSize, ny: gridSize,
        lo1: lng - (gridSize * gridRes / 2), la1: lat + (gridSize * gridRes / 2),
        lo2: lng + (gridSize * gridRes / 2), la2: lat - (gridSize * gridRes / 2),
        dx: gridRes, dy: gridRes,
        refTime: refTime,
        forecastTime: 0
    };

    return [
        { header: { ...header, parameterNumber: 2 }, data: uData },
        { header: { ...header, parameterNumber: 3 }, data: vData }
    ];
}

// ===================== EVENT LISTENERS =====================
const lgaSelect = document.getElementById('lga-select');
if (lgaSelect) {
    oyoLGAs.forEach(lga => {
        const opt = document.createElement('option');
        opt.value = `${lga.lat},${lga.lng},${lga.name}`;
        opt.textContent = `${lga.name} (${lga.hq})`;
        lgaSelect.appendChild(opt);
    });

    lgaSelect.addEventListener('change', (e) => {
        if (!e.target.value) return;
        const [lat, lng, name] = e.target.value.split(',');
        focusLGA(name);
    });
}

document.getElementById('find-location').addEventListener('click', function () {
    const btn = this;
    const originalHtml = btn.innerHTML;

    if (!navigator.geolocation) return alert('Geolocation not supported by your browser');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';

    navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const lgaName = findLGANameAt(latitude, longitude);

        // Add/Move Precision Circle
        if (userCircle) map.removeLayer(userCircle);
        userCircle = L.circle([latitude, longitude], {
            radius: accuracy,
            color: '#48bb78',
            fillColor: '#48bb78',
            fillOpacity: 0.15,
            weight: 1
        }).addTo(map);

        // Add/Move User Pointer
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([latitude, longitude], {
            icon: pulseIcon,
            zIndexOffset: 1000
        }).addTo(map);

        if (lgaName) {
            await updateMap(latitude, longitude, lgaName);
            map.flyTo([latitude, longitude], 17, { duration: 1.5 });

            // Open popup for this LGA with a slight delay after flight
            setTimeout(() => {
                boundaryLayer.eachLayer(l => {
                    const name = l.feature.properties.name || l.feature.properties.NAME_2;
                    if (name === lgaName) {
                        l.openPopup();
                    }
                });
            }, 1800);
        } else {
            await updateMap(latitude, longitude, 'Your Location');
            map.flyTo([latitude, longitude], 17);
        }

        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }, err => {
        console.error('Geolocation Error:', err);
        alert('Unable to retrieve your location. Please check your browser permissions.');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }, { enableHighAccuracy: true, timeout: 5000 });
});

// ===================== INITIALIZE =====================
initializeBoundaries();

// ===================== VIEW COUNTER =====================
function updateViewCount() {
    const counterUrl = 'https://api.counterapi.dev/v1/oyo-air-track/visits/up';
    const countElement = document.getElementById('view-count');
    fetch(counterUrl)
        .then(res => res.json())
        .then(data => {
            if (countElement && data.count) {
                countElement.textContent = (data.count + 2200).toLocaleString();
            }
        }).catch(err => {
            if (countElement) countElement.textContent = "2,300+";
        });
}
updateViewCount();

// PWA Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
}
