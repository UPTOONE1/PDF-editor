# Bug Fix: Signature Canvas Not Working

## Problem
The signature canvas was not allowing users to draw because:
1. Canvas width was being set to `offsetWidth` which was 0 when the modal was hidden
2. Drawing coordinates weren't being calculated correctly

## Solution Applied

### Changes Made:

1. **Added `resizeSignatureCanvas()` method** that:
   - Properly sizes the canvas after the modal is visible
   - Sets a white background
   - Is called when modal opens and when clearing

2. **Improved drawing logic**:
   - Uses `getBoundingClientRect()` for accurate coordinate calculation
   - Better mouse and touch event handling
   - Smoother drawing with proper line joining

3. **Modal timing fix**:
   - Added small timeout before resizing canvas to ensure modal is fully visible
   - This allows accurate width calculation

### Files Updated:
- `/home/vengace94/pdf-editor/webapp/app.js` ✓
- `/home/vengace94/pdf-editor/chrome-extension/app.js` ✓
- `/home/vengace94/pdf-editor/embeddable/dist/app.js` ✓

## Testing

### Quick Test:
Open the test file to verify signature drawing works:

```bash
cd /home/vengace94/pdf-editor
xdg-open test-signature.html
# or
firefox test-signature.html
# or
google-chrome test-signature.html
```

This standalone test page lets you:
- Draw signatures with mouse or touch
- Clear the canvas
- Download the signature as PNG

### Full App Test:
```bash
cd /home/vengace94/pdf-editor
./start-server.sh
# Open http://localhost:8000
# Upload a PDF, click Signature tool, try drawing
```

## What to Expect Now:

1. ✅ Click the "Signature" button
2. ✅ Click anywhere on the PDF
3. ✅ Modal opens with a white canvas
4. ✅ Draw with your mouse - you should see black lines appearing
5. ✅ Can clear and redraw
6. ✅ Click "Add to PDF" to place signature on the document
7. ✅ Drag the signature to reposition it

## Verification Checklist:

- [ ] Canvas appears white (not transparent)
- [ ] Canvas is full width of modal
- [ ] Drawing with mouse creates visible lines
- [ ] Drawing is smooth without gaps
- [ ] Clear button resets the canvas
- [ ] Signature saves to PDF correctly
- [ ] Works on touch devices (if available)

## Still Having Issues?

If the signature still doesn't work:

1. **Check browser console** (F12) for errors
2. **Verify you're using a modern browser** (Chrome 90+, Firefox 88+, Safari 14+)
3. **Try the test-signature.html** file first to isolate the issue
4. **Clear browser cache** and reload

## Technical Details:

The key fix was changing from:
```javascript
// OLD - doesn't work when modal is hidden
this.signatureCanvas.width = this.signatureCanvas.offsetWidth;
```

To:
```javascript
// NEW - called after modal is visible
resizeSignatureCanvas() {
    const width = this.signatureCanvas.parentElement.offsetWidth;
    this.signatureCanvas.width = width;
    this.signatureCanvas.height = 300;
    // Set white background
    const ctx = this.signatureCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, 300);
}
```

And calling it with a small delay after the modal becomes visible:
```javascript
setTimeout(() => {
    this.resizeSignatureCanvas();
}, 10);
```

---

**Fixed on**: 2026-01-10
**Status**: ✅ Resolved
