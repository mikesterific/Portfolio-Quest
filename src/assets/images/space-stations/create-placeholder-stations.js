// Placeholder Space Station Generator
// This script creates simple but recognizable space station sprites for development

const fs = require('fs');
const { createCanvas } = require('canvas');

// Station configurations
const stationConfigs = [
  { id: 'station-a-blue', type: 'A', color: '#4A6FA5', skill: 'Frontend' },
  { id: 'station-a-green', type: 'A', color: '#5FB85F', skill: 'Testing' },
  { id: 'station-b-orange', type: 'B', color: '#E67E22', skill: 'Architecture' },
  { id: 'station-c-purple', type: 'C', color: '#9B59B6', skill: 'Tooling' },
  { id: 'station-e-red', type: 'E', color: '#E74C3C', skill: 'DevOps' },
  { id: 'station-b-gray', type: 'B', color: '#7F8C8D', skill: 'Security' },
  { id: 'station-d-cyan', type: 'D', color: '#1ABC9C', skill: 'AI' },
  { id: 'station-c-gold', type: 'C', color: '#F39C12', skill: 'Leadership' }
];

function createStationSprite(config) {
  const size = 80;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Clear background
  ctx.clearRect(0, 0, size, size);
  
  // Station type specific designs
  switch (config.type) {
    case 'A': // Compact research module
      drawCompactStation(ctx, config.color, size);
      break;
    case 'B': // Industrial platform
      drawIndustrialStation(ctx, config.color, size);
      break;
    case 'C': // Large hub station
      drawHubStation(ctx, config.color, size);
      break;
    case 'D': // Specialized research
      drawResearchStation(ctx, config.color, size);
      break;
    case 'E': // Command station
      drawCommandStation(ctx, config.color, size);
      break;
  }
  
  return canvas;
}

function drawCompactStation(ctx, color, size) {
  const center = size / 2;
  
  // Main body
  ctx.fillStyle = color;
  ctx.fillRect(center - 20, center - 15, 40, 30);
  
  // Communication arrays
  ctx.fillStyle = '#34495E';
  ctx.fillRect(center - 25, center - 5, 10, 2);
  ctx.fillRect(center + 15, center - 5, 10, 2);
  ctx.fillRect(center - 25, center + 3, 10, 2);
  ctx.fillRect(center + 15, center + 3, 10, 2);
  
  // Central hub
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(center - 8, center - 8, 16, 16);
  
  // Status light
  ctx.fillStyle = '#00FF88';
  ctx.beginPath();
  ctx.arc(center, center, 3, 0, 2 * Math.PI);
  ctx.fill();
}

function drawIndustrialStation(ctx, color, size) {
  const center = size / 2;
  
  // Main platform
  ctx.fillStyle = color;
  ctx.fillRect(center - 25, center - 10, 50, 20);
  
  // Docking bays
  ctx.fillStyle = '#34495E';
  ctx.fillRect(center - 30, center - 5, 8, 10);
  ctx.fillRect(center + 22, center - 5, 8, 10);
  
  // Central tower
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(center - 6, center - 20, 12, 25);
  
  // Industrial details
  ctx.fillStyle = '#BDC3C7';
  ctx.fillRect(center - 15, center - 3, 6, 6);
  ctx.fillRect(center + 9, center - 3, 6, 6);
}

function drawHubStation(ctx, color, size) {
  const center = size / 2;
  
  // Central hub
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(center, center, 18, 0, 2 * Math.PI);
  ctx.fill();
  
  // Multiple sections
  const sections = 6;
  for (let i = 0; i < sections; i++) {
    const angle = (i * 2 * Math.PI) / sections;
    const x = center + Math.cos(angle) * 25;
    const y = center + Math.sin(angle) * 25;
    
    ctx.fillStyle = '#34495E';
    ctx.fillRect(x - 4, y - 8, 8, 16);
  }
  
  // Central core
  ctx.fillStyle = '#2C3E50';
  ctx.beginPath();
  ctx.arc(center, center, 8, 0, 2 * Math.PI);
  ctx.fill();
}

function drawResearchStation(ctx, color, size) {
  const center = size / 2;
  
  // Unique architecture - hexagonal
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = center + Math.cos(angle) * 20;
    const y = center + Math.sin(angle) * 20;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  
  // Research arrays
  ctx.fillStyle = '#34495E';
  ctx.fillRect(center - 2, center - 30, 4, 15);
  ctx.fillRect(center - 2, center + 15, 4, 15);
  
  // Sensor dish
  ctx.fillStyle = '#BDC3C7';
  ctx.beginPath();
  ctx.arc(center, center - 25, 6, 0, 2 * Math.PI);
  ctx.fill();
}

function drawCommandStation(ctx, color, size) {
  const center = size / 2;
  
  // Main command structure
  ctx.fillStyle = color;
  ctx.fillRect(center - 18, center - 12, 36, 24);
  
  // Control towers
  ctx.fillStyle = '#34495E';
  ctx.fillRect(center - 25, center - 20, 8, 30);
  ctx.fillRect(center + 17, center - 20, 8, 30);
  
  // Command bridge
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(center - 12, center - 18, 24, 8);
  
  // Communication array
  ctx.fillStyle = '#BDC3C7';
  ctx.fillRect(center - 1, center - 28, 2, 12);
}

// Generate all station sprites
console.log('Generating placeholder space station sprites...');

stationConfigs.forEach(config => {
  const canvas = createStationSprite(config);
  const buffer = canvas.toBuffer('image/png');
  const filename = `./src/assets/images/space-stations/${config.id}.png`;
  
  try {
    fs.writeFileSync(filename, buffer);
    console.log(`✓ Created ${config.id}.png for ${config.skill} skill`);
  } catch (error) {
    console.error(`✗ Failed to create ${config.id}.png:`, error.message);
  }
});

console.log('Station sprite generation complete!');
console.log('\nTo run this script:');
console.log('npm install canvas');
console.log('node src/assets/images/space-stations/create-placeholder-stations.js'); 