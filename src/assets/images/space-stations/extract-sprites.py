#!/usr/bin/env python3
"""
Space Station Sprite Extractor
Extracts individual space stations from source images and creates color variants
"""

import os
import sys
from PIL import Image, ImageEnhance, ImageOps
import numpy as np

# Configuration
SOURCE_IMAGES = [
    "../Five Intricate Space Stations in Orbit.png",
    "../More Space Stations.png"
]

OUTPUT_DIR = "./"
TARGET_SIZE = (80, 80)

# Color palette for skill categories
COLOR_PALETTE = {
    'blue': (74, 111, 165),      # Frontend
    'green': (95, 184, 95),      # Testing  
    'orange': (230, 126, 34),    # Architecture
    'purple': (155, 89, 182),    # Tooling
    'red': (231, 76, 60),        # DevOps
    'gray': (127, 140, 141),     # Security
    'cyan': (26, 188, 156),      # AI
    'gold': (243, 156, 18),      # Leadership
}

# Station mapping
STATION_CONFIGS = [
    {'id': 'station-a-blue', 'type': 'A', 'color': 'blue', 'skill': 'Frontend'},
    {'id': 'station-a-green', 'type': 'A', 'color': 'green', 'skill': 'Testing'},
    {'id': 'station-b-orange', 'type': 'B', 'color': 'orange', 'skill': 'Architecture'},
    {'id': 'station-b-gray', 'type': 'B', 'color': 'gray', 'skill': 'Security'},
    {'id': 'station-c-purple', 'type': 'C', 'color': 'purple', 'skill': 'Tooling'},
    {'id': 'station-c-gold', 'type': 'C', 'color': 'gold', 'skill': 'Leadership'},
    {'id': 'station-d-cyan', 'type': 'D', 'color': 'cyan', 'skill': 'AI'},
    {'id': 'station-e-red', 'type': 'E', 'color': 'red', 'skill': 'DevOps'},
]

def load_source_images():
    """Load and analyze source images"""
    images = []
    for img_path in SOURCE_IMAGES:
        if os.path.exists(img_path):
            try:
                img = Image.open(img_path)
                images.append((img_path, img))
                print(f"✅ Loaded: {img_path} ({img.size})")
            except Exception as e:
                print(f"❌ Error loading {img_path}: {e}")
        else:
            print(f"❌ File not found: {img_path}")
    return images

def extract_station_regions(img, num_stations=5):
    """Extract potential station regions from source image"""
    width, height = img.size
    
    # Strategy 1: Grid-based extraction for "Five Intricate Space Stations"
    if "Five" in str(img.filename):
        # Assume stations are arranged in the image
        # Try to detect distinct regions
        stations = []
        
        # Convert to numpy for analysis
        img_array = np.array(img)
        
        # For now, let's manually define regions based on common arrangements
        # This would ideally use computer vision to detect stations automatically
        
        if width == 1024 and height == 1024:
            # Common arrangements for 5 stations in 1024x1024
            regions = [
                (200, 200, 350, 350),   # Top-left station
                (674, 200, 824, 350),   # Top-right station  
                (200, 674, 350, 824),   # Bottom-left station
                (674, 674, 824, 824),   # Bottom-right station
                (437, 437, 587, 587),   # Center station
            ]
            
            for i, (x1, y1, x2, y2) in enumerate(regions):
                try:
                    station = img.crop((x1, y1, x2, y2))
                    stations.append(station)
                    print(f"  Extracted station {i+1}: {x1},{y1} to {x2},{y2}")
                except Exception as e:
                    print(f"  Failed to extract station {i+1}: {e}")
    
    # Strategy 2: For "More Space Stations" - horizontal arrangement
    elif "More" in str(img.filename):
        stations = []
        if width == 1536 and height == 1024:
            # Assume stations are arranged horizontally
            station_width = width // 6  # Try 6 stations horizontally
            for i in range(6):
                x1 = i * station_width
                x2 = (i + 1) * station_width
                y1 = height // 4
                y2 = 3 * height // 4
                
                try:
                    station = img.crop((x1, y1, x2, y2))
                    stations.append(station)
                    print(f"  Extracted station {i+1}: {x1},{y1} to {x2},{y2}")
                except Exception as e:
                    print(f"  Failed to extract station {i+1}: {e}")
    
    return stations

def apply_color_tint(img, target_color, intensity=0.3):
    """Apply color tint to image while preserving details"""
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Create color overlay
    overlay = Image.new('RGBA', img.size, target_color + (int(255 * intensity),))
    
    # Blend with original
    tinted = Image.alpha_composite(img, overlay)
    
    return tinted

def process_station(base_img, config):
    """Process a base station image into final sprite"""
    # Resize to target size
    station = base_img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    
    # Apply color tint
    target_color = COLOR_PALETTE[config['color']]
    tinted_station = apply_color_tint(station, target_color)
    
    # Enhance contrast and sharpness
    enhancer = ImageEnhance.Contrast(tinted_station)
    station = enhancer.enhance(1.2)
    
    enhancer = ImageEnhance.Sharpness(station)
    station = enhancer.enhance(1.1)
    
    return station

def create_fallback_stations():
    """Create geometric fallback stations if extraction fails"""
    print("🔄 Creating fallback geometric stations...")
    
    fallback_stations = []
    for config in STATION_CONFIGS:
        # Create simple geometric station
        img = Image.new('RGBA', TARGET_SIZE, (0, 0, 0, 0))
        
        # This would create basic geometric shapes similar to our current system
        # For now, just create colored rectangles as placeholders
        color = COLOR_PALETTE[config['color']]
        
        # Simple rectangle for demonstration
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.rectangle([20, 30, 60, 50], fill=color + (255,))
        
        fallback_stations.append(img)
        print(f"  Created fallback: {config['id']}")
    
    return fallback_stations

def main():
    print("🚀 Space Station Sprite Extractor")
    print("=" * 50)
    
    # Load source images
    source_images = load_source_images()
    
    if not source_images:
        print("❌ No source images found!")
        print("📍 Expected files:")
        for img_path in SOURCE_IMAGES:
            print(f"  - {img_path}")
        return
    
    # Extract stations from each source image
    all_extracted_stations = []
    for img_path, img in source_images:
        print(f"\n🔍 Extracting from: {os.path.basename(img_path)}")
        stations = extract_station_regions(img)
        all_extracted_stations.extend(stations)
        print(f"  Found {len(stations)} stations")
    
    # Use extracted stations or create fallbacks
    if len(all_extracted_stations) >= 5:
        print(f"\n✅ Using {len(all_extracted_stations)} extracted stations")
        base_stations = all_extracted_stations[:5]  # Use first 5 unique types
    else:
        print("\n⚠️  Insufficient extracted stations, using fallbacks")
        base_stations = create_fallback_stations()
    
    # Create final sprites
    print(f"\n🎨 Creating {len(STATION_CONFIGS)} final sprites...")
    
    for i, config in enumerate(STATION_CONFIGS):
        # Map station types to base stations
        type_mapping = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
        base_index = type_mapping.get(config['type'], 0)
        
        if base_index < len(base_stations):
            base_station = base_stations[base_index]
        else:
            # Use first station if not enough variety
            base_station = base_stations[0]
        
        # Process into final sprite
        final_sprite = process_station(base_station, config)
        
        # Save
        output_path = os.path.join(OUTPUT_DIR, f"{config['id']}.png")
        final_sprite.save(output_path, 'PNG')
        print(f"  ✅ Created: {config['id']}.png ({config['skill']})")
    
    print(f"\n🎉 Extraction complete!")
    print(f"📁 {len(STATION_CONFIGS)} sprites saved to: {OUTPUT_DIR}")
    print(f"🎮 Ready to load in Portfolio Quest!")

if __name__ == "__main__":
    main() 