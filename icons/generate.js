const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(0, 0, size, size);

    // Text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', size/2, size/2);

    return canvas.toBuffer('image/png');
}

// Generate icons
[16, 48, 128].forEach(size => {
    const buffer = generateIcon(size);
    fs.writeFileSync(`icon${size}.png`, buffer);
}); 