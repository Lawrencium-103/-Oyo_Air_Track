
import json
import re

try:
    with open('oyo-boundaries.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract JSON part using regex standard pattern
    # Looking for: const oyoLGABoundaries = { ... };
    match = re.search(r'const oyoLGABoundaries = ({.*});', content, re.DOTALL)
    if match:
        json_str = match.group(1)
        data = json.loads(json_str)
        names = [f['properties']['name'] for f in data['features']]
        print("Found Names:")
        for n in sorted(names):
            print(f"- '{n}'")
    else:
        print("Could not parse JS file")

except Exception as e:
    print(f"Error: {e}")
