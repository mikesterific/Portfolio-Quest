# Space Station Sprite Extraction Guide

## Source Images Available
- `Five Intricate Space Stations in Orbit.png` - Primary source with 5 detailed stations
- `More Space Stations.png` - Additional station designs

## Extraction Strategy

### Target Sprites Needed (8 total for skills)
Based on our station configuration system, we need these station types:

1. **Station Type A** (Compact Research) - 2 variants needed
   - `station-a-blue.png` - Frontend Development  
   - `station-a-green.png` - Testing Systems

2. **Station Type B** (Industrial Platform) - 2 variants needed
   - `station-b-orange.png` - Architecture Hub
   - `station-b-gray.png` - Security Fortress

3. **Station Type C** (Large Hub) - 2 variants needed
   - `station-c-purple.png` - Tooling Platform
   - `station-c-gold.png` - Leadership Center

4. **Station Type D** (Specialized Research) - 1 variant needed
   - `station-d-cyan.png` - AI Research Station

5. **Station Type E** (Command Station) - 1 variant needed
   - `station-e-red.png` - DevOps Command

### Extraction Process

#### Step 1: Identify Station Types in Source Images
1. Open both PNG files in image editor
2. Identify 5 distinct station architectures that match our type system:
   - **Compact stations** (good for Type A)
   - **Industrial/rectangular stations** (good for Type B) 
   - **Large hub/circular stations** (good for Type C)
   - **Unique/specialized designs** (good for Type D)
   - **Command/tower stations** (good for Type E)

#### Step 2: Extract Base Stations
1. Extract each of the 5 station types as separate 80x80px PNG files
2. Save as base templates:
   - `station-base-a.png`
   - `station-base-b.png`
   - `station-base-c.png`
   - `station-base-d.png`
   - `station-base-e.png`

#### Step 3: Create Color Variants
For each base station, create color-tinted versions:

**Color Palette**:
- Blue: #4A6FA5 (Frontend)
- Green: #5FB85F (Testing)  
- Orange: #E67E22 (Architecture)
- Purple: #9B59B6 (Tooling)
- Red: #E74C3C (DevOps)
- Gray: #7F8C8D (Security)
- Cyan: #1ABC9C (AI)
- Gold: #F39C12 (Leadership)

#### Step 4: Optimization
- **Size**: 80x80px for optimal game performance
- **Format**: PNG with transparency
- **Quality**: Balance detail with file size
- **Naming**: Follow exact convention: `station-[type]-[color].png`

### Quick Extraction Method

If manual extraction is time-consuming, we can:
1. Use the most visually distinct stations from the source images
2. Apply color overlays programmatically
3. Start with 3-4 station types and reuse with different colors

### File Placement
All extracted sprites should be placed in:
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

### Testing
After extraction:
1. Update SkillSpaceScene to load sprite assets
2. Test each station loads correctly
3. Verify colors match skill categories
4. Confirm 60 FPS performance maintained 