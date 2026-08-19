import fs from 'fs';
import https from 'https';
import path from 'path';

const fontsDir = path.join(process.cwd(), 'public', 'fonts');

// Ensure directory exists
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

// Inter Regular (as fallback for Neue Haas Grotesk)
const interUrl = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2';
// Playfair Display Regular (as fallback for Canela)
const playfairUrl = 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2';

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function main() {
    console.log('Downloading fallback fonts...');
    try {
        await downloadFile(interUrl, path.join(fontsDir, 'NeueHaasGrotesk.woff2'));
        console.log('Downloaded NeueHaasGrotesk.woff2 (Inter fallback)');
        
        await downloadFile(playfairUrl, path.join(fontsDir, 'Canela.woff2'));
        console.log('Downloaded Canela.woff2 (Playfair fallback)');
        
        console.log('Done.');
    } catch (error) {
        console.error('Error downloading fonts:', error);
    }
}

main();
