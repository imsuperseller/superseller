const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// UAD garage door phone numbers from config
const phoneNumbers = [
    "+1-972-954-2407",
    "+1-972-628-3587", 
    "+1-469-625-0960",
    "+1-469-535-7538"
];

// Create garage door images with embedded phone numbers
const generateUADImages = () => {
    console.log('🚪 Generating UAD garage door images...');
    
    phoneNumbers.forEach((phone, index) => {
        const outputPath = `/tmp/img_uad_${index}.png`;
        
        // Use ImageMagick to create garage door image with phone number
        const command = `convert -size 800x600 xc:white \\
            -font Arial-Bold -pointsize 48 -fill '#1a3a5c' \\
            -draw "text 50,80 'GARAGE DOOR SERVICES'" \\
            -pointsize 36 -fill '#2c5f2d' \\
            -draw "text 50,140 'Professional Installation & Repair'" \\
            -pointsize 32 -fill black \\
            -draw "text 50,200 'UAD Garage Doors'" \\
            -pointsize 28 -fill '#d32f2f' \\
            -draw "text 50,250 '✓ 24/7 Emergency Service'" \\
            -draw "text 50,290 '✓ Licensed & Insured'" \\
            -draw "text 50,330 '✓ Free Estimates'" \\
            -pointsize 42 -fill '#1565c0' -weight bold \\
            -draw "text 50,420 'CALL NOW: ${phone}'" \\
            -pointsize 24 -fill '#424242' \\
            -draw "text 50,480 'Dallas, TX & Surrounding Areas'" \\
            -draw "text 50,520 'Licensed • Bonded • Insured'" \\
            ${outputPath}`;
            
        try {
            execSync(command, { stdio: 'pipe' });
            console.log(`✅ Generated: ${outputPath}`);
        } catch (error) {
            console.error(`❌ Failed to generate ${outputPath}:`, error.message);
        }
    });
    
    console.log('🎯 UAD garage door images generation complete!');
    console.log('📁 Images saved to /tmp/img_uad_*.png');
    
    // List generated files with sizes
    phoneNumbers.forEach((phone, index) => {
        const filePath = `/tmp/img_uad_${index}.png`;
        try {
            const stats = fs.statSync(filePath);
            console.log(`📊 img_uad_${index}.png: ${stats.size} bytes (Phone: ${phone})`);
        } catch (error) {
            console.log(`❌ img_uad_${index}.png: File not found`);
        }
    });
};

// Run generation
if (require.main === module) {
    generateUADImages();
}

module.exports = { generateUADImages };