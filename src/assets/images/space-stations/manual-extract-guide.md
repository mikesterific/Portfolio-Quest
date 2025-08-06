# Manual Space Station Extraction Guide

## 🚀 Overview
Extract high-quality space station sprites from source images using image editing software.

## 📁 Source Files
- `Five Intricate Space Stations in Orbit.png` (1024x1024) - Primary source
- `More Space Stations.png` (1536x1024) - Additional designs

## 🎯 Target Output
8 sprite files, each 80x80px:
```
station-a-blue.png    (Frontend - Compact Research)
station-a-green.png   (Testing - Compact Research)  
station-b-orange.png  (Architecture - Industrial Platform)
station-b-gray.png    (Security - Industrial Platform)
station-c-purple.png  (Tooling - Large Hub)
station-c-gold.png    (Leadership - Large Hub)
station-d-cyan.png    (AI - Specialized Research)
station-e-red.png     (DevOps - Command Station)
```

## 🔧 Extraction Process

### Step 1: Identify Station Types

Open both source images in your preferred editor (Photoshop, GIMP, etc.) and identify:

**From "Five Intricate Space Stations in Orbit.png":**
- Look for 5 distinct station architectures
- Identify the most detailed/interesting designs
- Note their approximate positions

**Station Type Categories to Look For:**
- **Type A (Compact Research)**: Small, modular stations
- **Type B (Industrial Platform)**: Rectangular, industrial-looking
- **Type C (Large Hub)**: Circular or large central stations  
- **Type D (Specialized Research)**: Unique, specialized designs
- **Type E (Command Station)**: Command-center appearance

### Step 2: Extract Base Stations

For each of the 5 station types:

1. **Select the station** using selection tools
2. **Copy to new layer/document**
3. **Crop tightly** around the station
4. **Resize to 80x80px** (maintain aspect ratio, add padding if needed)
5. **Save as PNG** with transparency
6. **Name as**: `station-base-[a/b/c/d/e].png`

### Step 3: Create Color Variants

For each base station, create colored variants:

#### Color Palette:
```
Blue:   #4A6FA5  (Frontend)
Green:  #5FB85F  (Testing)
Orange: #E67E22  (Architecture)  
Purple: #9B59B6  (Tooling)
Red:    #E74C3C  (DevOps)
Gray:   #7F8C8D  (Security)
Cyan:   #1ABC9C  (AI)
Gold:   #F39C12  (Leadership)
```

#### Coloring Methods:

**Method 1: Color Overlay (Recommended)**
1. Duplicate base station layer
2. Create color overlay layer set to "Multiply" or "Color" blend mode
3. Use target color with 30-50% opacity
4. Flatten and save

**Method 2: Hue/Saturation Adjustment**
1. Use Hue/Saturation adjustment layer
2. Check "Colorize"
3. Adjust hue to match target color
4. Fine-tune saturation and lightness

**Method 3: Color Balance**
1. Use Color Balance adjustment
2. Shift towards target color family
3. Maintain metallic/industrial look

### Step 4: Quality Check

For each sprite:
- ✅ **Size**: Exactly 80x80px
- ✅ **Format**: PNG with transparency
- ✅ **Quality**: Clear details at game size
- ✅ **Color**: Matches skill category
- ✅ **Naming**: Exact convention `station-[type]-[color].png`

### Step 5: File Organization

Save all sprites to:
```
src/assets/images/space-stations/
├── station-a-blue.png
├── station-a-green.png  
├── station-b-orange.png
├── station-b-gray.png
├── station-c-purple.png
├── station-c-gold.png
├── station-d-cyan.png
└── station-e-red.png
```

## 🚀 Quick Tips

### Extraction Tips:
- **Use high zoom** when selecting stations for precision
- **Include some surrounding space** to avoid cutting off details
- **Maintain consistent lighting** across variants
- **Preserve metallic/industrial textures**

### Coloring Tips:
- **Don't over-saturate** - maintain realistic space aesthetic
- **Test at actual game size** (80x80px) during process
- **Keep structural details visible** after coloring
- **Use multiply blend mode** to preserve shadows/highlights

### Time-Saving:
- **Extract all base stations first**, then batch color
- **Create actions/macros** for repetitive coloring steps
- **Use layer styles** that can be copied between stations

## 🔍 Alternative: Semi-Automated

If manual extraction is time-consuming:

1. **Extract 3-4 most distinct stations**
2. **Reuse stations with different colors** (Type A can be used twice)
3. **Focus on visual variety** rather than perfect type mapping

## ✅ Testing

After extraction:
1. **Place files** in correct directory
2. **Reload the game** (clear cache: `rm -rf node_modules/.vite`)
3. **Visit Skills Command Center**
4. **Verify all 8 stations load** with correct colors
5. **Test performance** - should maintain 60 FPS

## 🎯 Success Criteria

- All 8 stations display as actual sprites (not geometric fallbacks)
- Colors clearly distinguish skill categories
- Professional space aesthetic maintained
- Game performance remains smooth
- No console warnings about missing sprites

---

**Expected Time**: 30-60 minutes depending on image editing experience
**Result**: Professional, high-quality space station sprites matching your source artwork 