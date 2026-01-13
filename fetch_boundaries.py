import requests
import json

# URL for Nigeria LGA GeoJSON
URL = "https://raw.githubusercontent.com/qedsoftware/geojson_data/main/nigeria-lga.geojson"

def fetch_and_filter():
    print(f"Fetching data from {URL}...")
    try:
        response = requests.get(URL)
        response.raise_for_status()
        data = response.json()
        
        print(f"Total features found: {len(data['features'])}")
        
        # DEBUG: Print properties of first 5 features
        for i in range(5):
             print(f"Feature {i} props: {data['features'][i].get('properties')}")
             
        # Filter for Oyo State
        # Based on debug: NAME_1 is State, NAME_2 is LGA
        oyo_features = []
        
        for feature in data['features']:
            props = feature.get('properties', {})
            state = props.get('NAME_1')
            
            if state and 'Oyo' in state:
                # Normalize 'name' property for the app
                props['name'] = props.get('NAME_2') or props.get('VARNAME_2')
                
                # Add extra props expected by the app if missing, to prevent UI errors
                if 'headquarters' not in props:
                    props['headquarters'] = 'N/A' 
                if 'area_km2' not in props:
                    props['area_km2'] = 'N/A'
                if 'population' not in props:
                    props['population'] = 'N/A'
                    
                oyo_features.append(feature)
                
        print(f"Filtered {len(oyo_features)} LGAs for Oyo State.")
        
        result = {
            "type": "FeatureCollection",
            "features": oyo_features
        }
        
        # Write to js file as a variable
        content = f"const oyoLGABoundaries = {json.dumps(result, indent=2)};\n\n"
        content += "if (typeof module !== 'undefined' && module.exports) {\n    module.exports = oyoLGABoundaries;\n}"
        
        with open('oyo-boundaries.js', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("Successfully wrote oyo-boundaries.js")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch_and_filter()
