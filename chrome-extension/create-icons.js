// Run this with Node.js to create icon files
// Usage: node create-icons.js

const fs = require('fs');
const path = require('path');

// Simple 16x16 icon (purple gradient with white document shape)
const icon16 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE3SURBVDiNpZM9TsNAEIW/WTuOE5wQJFoKKiQaJCg4ABUlN+AAdBy' +
    'BGyBxCVpuQEMBDRUSEhISEgVCQiIOHluexY4dx06AxJNG+/btzs7OzKdlNBoRRRGmaQIQxzFxHJOmKZ7n4fs+QRDgeR6u6+J5HlEUYRgGSZKQJAme5+H7PkEQ4Lou' +
    'tm3jOA6WZWHbNkEQ4DgOjuMQRRG2bWMYBqZpkiQJhmFgGAZRFGHbNo7j4Ps+QRBgGAa2bROGIUmS4Ps+hmEQhiGGYRAEAb7vEwQBtm0ThiFBEOD7PqZpEoYhjuPg' +
    'OA5RFGHbNqZpEkURjuPgui6u6+I4Dq7rYhgGSZJgWRamaeI4Dq7r4jgOlmURhiGO4+C6LmEYYts2pmkSBAGO4+C6LmEYYlkWvu8ThiFBEGBZFr7v4zgO/wcuvwG0' +
    'C1qgMUqc8QAAAABJRU5ErkJggg==',
    'base64'
);

// Simple 48x48 icon
const icon48 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAASAAAAEgARslrPgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAPnSURBVGiB1ZpNbBNXEMd/7+16v+xdZ+3dN' +
    'fYaO3YwDkkcQj4gCVAhqhaoqIAeUKUeKnHgQHvhgMSBC0JC4lKpFy5VT1w4cUFCVBUoqKhKQ0IhhCQ4JMEO2MTr9a7X3rU3+1W/5e0aY2InJKFC/aSRZnbe7P/NzJu' +
    'ZWQ3DMEAQBFpaWjAMA13XURSF/v5+stks7e3tZLNZ0uk0iqLQ29tLIpFAVVU0TcMwDEzTRNd1NE1DURSi0Sj9/f1ks1k0TaO7u5tEIoGu6+i6TjabRdd1VFVFURRi' +
    'sRjZbBZFUcjlciiKQjweR9d1NE1DURR6enqIx+Ooqoqu6/T396OqKrFYjGQyiaZpJBIJVFVF13U0TaO3txdd19F1HUVR6O/vJ5VKkUgk0HUdVVXp7+8nmUyiaRqJRIL+/' +
    'n5UVSWRSJBMJtE0jWQySTabJZlMEo/HSaVSaJpGKpUimUyiKAqJRAJN00ilUuRyOVKpFLFYjEQiQSqVQlEU4vE4mqaRTCZJpVLkcjkSiQSJRIJEIoGmaWiaRiKRwDB+' +
    'A4YBwE+APwERAE5JREREREREREREREREfm9+ApxtbW1YloVt21iWRaVSwbZtbNvGsixM08SyLCzLolqtUq1WMU0T0zSpVCpUq1VM08SyLEzTpFKpUC6XKZfLWJZFuVymXC5jWRblchnLsqhUKliWRblcxrIsTNOkXC5jWRblchnTNLEsi0qlgmVZVCoVLMvCsiwqlQrlchnLsqhWq1iWRbVaxbZtLMuiVqtRq9WwbRvbtrFtm1qthmVZ2LaNbdvYtk2tVsO2bWq1GrZtY1kWtVqNWq2GZVnYto1t21Sr1f8eoFarsbe3x97eHnt7e9RqNfb396nVauzv77O/v0+tVuPg4ICDgwP29/c5ODhgf3+fWq2GaZqYpomqqti2jaIoqKqKaZqoqoqiKCiKgqIomKaJqqpomkYsFkPXdTRNQ1EU+vr6iMViqKpKX18fiUSCaDRKLBYjFosRiUTo6+sjmUzS19dHNBollUoRi8WIx+MkEgl0Xaevr494PM7AwACRSIRYLEY0GiWRSJBMJonH4wwODpJIJBgcHKS/v59kMkkymSSZTJJKpRgaGiKZTDI4OEgymSSdTpNOpxkeHiadTjM8PEw6nWZkZIR0Os3w8DCpVIqhoSFSqRRDQ0Ok02lGRkZIp9Nks1lGRkbIZDJkMhmy2SyZTIZsNks2m2V0dJRMJsPo6CijoyNkMhlGR0fJZrOMjY0xNjbG+Pg442NjjI+PMz4+ztTUFFNTU0xNTTE1NcX09DTT09PMzMwwMzPD7OwsH33wAR9/+CGXL1/m0qVLAHwJ/PoL/APwZ+AvwDcAAAAASUVORK5CYII=',
    'base64'
);

// Simple 128x128 icon
const icon128 = icon48; // We'll use the same for now since we need tools to create proper ones

const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Write icon files
fs.writeFileSync(path.join(iconsDir, 'icon16.png'), icon16);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), icon48);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), icon48); // Using 48 as placeholder

console.log('Icons created successfully!');
console.log('Note: icon128.png is using the same image as icon48.png');
console.log('For better quality, open icons/generate-icons.html in a browser');
console.log('and save each canvas as the appropriate PNG file.');
