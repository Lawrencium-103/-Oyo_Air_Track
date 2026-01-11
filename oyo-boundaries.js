// oyo-boundaries.js - Oyo State LGA Boundaries
// This file contains GeoJSON data for Oyo State Local Government Areas
// In production, replace with official boundary data from:
// - Nigerian National Bureau of Statistics (NBS)
// - Humanitarian Data Exchange (HDX)
// - OpenStreetMap (OSM) exports
// - State GIS departments

const oyoLGABoundaries = {
    "type": "FeatureCollection",
    "features": [
        // Sample boundary for Ibadan North LGA (simplified polygon)
        // Replace with actual boundary coordinates
        {
            "type": "Feature",
            "properties": {
                "name": "Ibadan North",
                "lga_code": "IBN",
                "population": 306795,
                "headquarters": "Agodi Gate",
                "area_km2": 27.6
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [3.8667, 7.3833],
                    [3.9333, 7.3833],
                    [3.9333, 7.4333],
                    [3.8667, 7.4333],
                    [3.8667, 7.3833]
                ]]
            }
        },
        // Add other 32 LGAs here with their actual boundary coordinates
        // Example structure for each LGA:
        /*
        {
          "type": "Feature",
          "properties": {
            "name": "Akinyele",
            "lga_code": "AKY",
            "population": 211359,
            "headquarters": "Moniya",
            "area_km2": 464.9
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [actual boundary coordinates here...]
            ]]
          }
        }
        */
    ]
};

// Export for use in tracker.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = oyoLGABoundaries;
}
