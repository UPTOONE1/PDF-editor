# Quick Start Guide

## Option 1: Test the Web App (Easiest)

```bash
cd /home/vengace94/pdf-editor
./start-server.sh
```

Then open your browser to: **http://localhost:8000**

## Option 2: Install Chrome Extension

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable "Developer mode" (toggle switch in top-right)
3. Click "Load unpacked"
4. Navigate to: `/home/vengace94/pdf-editor/chrome-extension`
5. Click "Select Folder"
6. The PDF Editor icon will appear in your toolbar!

## Option 3: Embed in Your Webpage

### Inline Embedding

```html
<script src="/home/vengace94/pdf-editor/embeddable/pdf-editor-embed.js"></script>
<div id="pdf-editor"></div>
<script>
  PDFEditorWidget.init('pdf-editor', {
    width: '100%',
    height: '800px'
  });
</script>
```

### Modal/Popup

```html
<script src="/home/vengace94/pdf-editor/embeddable/pdf-editor-embed.js"></script>
<button onclick="PDFEditorWidget.openModal()">Edit PDF</button>
```

## Test the Examples

### Inline Example
```bash
cd /home/vengace94/pdf-editor/embeddable
python3 -m http.server 8001
# Open http://localhost:8001/example-inline.html
```

### Modal Example
```bash
cd /home/vengace94/pdf-editor/embeddable
python3 -m http.server 8001
# Open http://localhost:8001/example-modal.html
```

## Features to Try

1. Upload a PDF document
2. Click anywhere to add text
3. Click the Signature button and draw your signature
4. Drag text and signatures to position them
5. Change font size and color
6. Download your edited PDF

## Troubleshooting

**Extension icons not showing?**
```bash
cd /home/vengace94/pdf-editor/chrome-extension
node create-icons.js
```

**Need better quality icons?**
Open `chrome-extension/icons/generate-icons.html` in your browser and save each canvas as PNG.

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the colors in `webapp/styles.css`
- Deploy to a hosting service to share with others
- Add the Chrome extension to Chrome Web Store

---

**Location**: `/home/vengace94/pdf-editor/`

**No subscriptions. No tracking. 100% Free.**
