# Free PDF Editor

A completely free, open-source PDF editor that runs entirely in your browser. No subscriptions, no tricks, no data sent to servers.

## Features

- **Add Text**: Click anywhere on the PDF to add custom text
- **Draw Signatures**: Create and add hand-drawn signatures
- **Drag & Position**: Move text and signatures anywhere on the page
- **Customization**: Change font size and color
- **Multi-page Support**: Navigate and edit multiple pages
- **Download**: Save your edited PDF locally
- **100% Private**: Everything happens in your browser - your files never leave your device

## Project Structure

```
pdf-editor/
├── webapp/              # Standalone web application
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── chrome-extension/    # Chrome browser extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── editor.html
│   ├── styles.css
│   ├── app.js
│   └── icons/
└── embeddable/          # Widget for embedding in websites
    ├── pdf-editor-embed.js
    ├── example-inline.html
    ├── example-modal.html
    └── dist/
```

## Usage Options

### 1. Standalone Web App

Simply open the web app in your browser:

```bash
cd webapp
# Open index.html in your browser
# On Linux:
xdg-open index.html
# On Mac:
open index.html
# On Windows:
start index.html
```

Or serve it with a local server:

```bash
cd webapp
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

### 2. Chrome Extension

Install the extension in Chrome:

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The PDF Editor icon will appear in your Chrome toolbar

**Using the Extension:**
- Click the extension icon to open the PDF editor in a new tab
- Or click "Edit Current Page PDF" if you're viewing a PDF

### 3. Embed in Your Website

Add the PDF editor to your existing webpages:

**Option A: Inline Embedding**

```html
<!-- Include the widget script -->
<script src="path/to/pdf-editor-embed.js"></script>

<!-- Add a container -->
<div id="pdf-editor-container"></div>

<!-- Initialize -->
<script>
  PDFEditorWidget.init('pdf-editor-container', {
    width: '100%',
    height: '800px'
  });
</script>
```

**Option B: Modal/Popup**

```html
<!-- Include the widget script -->
<script src="path/to/pdf-editor-embed.js"></script>

<!-- Add a button -->
<button onclick="PDFEditorWidget.openModal()">Edit PDF</button>
```

See `embeddable/example-inline.html` and `embeddable/example-modal.html` for complete examples.

## How to Use the Editor

1. **Upload a PDF**: Click "Upload PDF" and select your PDF file
2. **Add Text**:
   - Click the "Text" tool (active by default)
   - Click anywhere on the PDF
   - Enter your text in the prompt
   - Drag the text to position it
3. **Add Signature**:
   - Click the "Signature" tool
   - Click where you want the signature
   - Draw your signature in the popup
   - Click "Add to PDF"
   - Drag to position and resize as needed
4. **Customize**:
   - Use the "Size" field to change text size
   - Use the "Color" picker to change text color
5. **Navigate Pages**: Use Previous/Next buttons for multi-page PDFs
6. **Download**: Click "Download PDF" to save your edited document

## Technologies Used

- **PDF.js**: Mozilla's PDF rendering library
- **PDF-lib**: PDF manipulation library
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility
- **HTML5 Canvas**: For signature drawing

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Opera: Full support

## Deployment

### Deploy as a Website

You can deploy the `webapp` folder to any static hosting service:

- **GitHub Pages**: Push to a GitHub repo and enable Pages
- **Netlify**: Drag and drop the `webapp` folder
- **Vercel**: Deploy with the Vercel CLI
- **AWS S3**: Upload to an S3 bucket with static hosting

### Deploy the Chrome Extension

To publish on the Chrome Web Store:

1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Zip the `chrome-extension` folder
3. Upload the zip file
4. Fill in the required information
5. Submit for review

## Customization

### Change Colors

Edit `styles.css` and update the gradient colors:

```css
/* Change the purple gradient to your brand colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add More Features

The code is modular and easy to extend:

- `app.js` contains the main PDFEditor class
- Add new tools by extending the `handleCanvasClick` method
- Add new annotation types in the `createAnnotationElement` method

## Privacy & Security

- **No Server Upload**: All PDF processing happens in your browser
- **No Tracking**: No analytics or tracking code
- **No Data Collection**: Your files are never sent anywhere
- **Open Source**: All code is visible and auditable

## License

This project is completely free and open source. Feel free to use, modify, and distribute as needed.

## Troubleshooting

### Icons Not Showing in Chrome Extension

1. Open `chrome-extension/icons/generate-icons.html` in your browser
2. Right-click each canvas and "Save image as..."
3. Save as `icon16.png`, `icon48.png`, and `icon128.png` in the `icons` folder

Or run the icon generator:
```bash
cd chrome-extension
node create-icons.js
```

### PDF Not Rendering

Make sure you're accessing the app via HTTP/HTTPS, not the file:// protocol. Use a local server:

```bash
cd webapp
python3 -m http.server 8000
```

### Signature Not Saving

Ensure you've drawn something in the signature box before clicking "Add to PDF".

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## Support

This tool is completely free with no hidden costs. If you find it useful, consider:
- Sharing it with others who need a free PDF editor
- Starring the project if hosted on GitHub
- Providing feedback for improvements

---

Built with ❤️ to provide a free alternative to subscription-based PDF editors.
