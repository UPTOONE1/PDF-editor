# Signature Offset Bug - FIXED ✅

## Problem
The signature was drawing about half an inch to the left of where the user clicked/drew. This was visible in the screenshot where the line appeared offset from the mouse position.

## Root Cause
The issue was caused by a **scale mismatch** between the canvas display size and its internal drawing buffer:

1. Canvas CSS: `width: 100%` (could be 540px on screen)
2. Canvas border: `3px dashed` border
3. Canvas internal dimensions: Set via JavaScript (could be 600px internally)

When the display size (540px) doesn't match the internal canvas size (600px), coordinates need to be scaled. We were using `e.clientX - rect.left` which gave us screen coordinates, but the canvas expected internal coordinates.

## The Fix

Added a coordinate transformation function that accounts for the scale difference:

```javascript
const getCanvasCoordinates = (clientX, clientY) => {
    const rect = this.signatureCanvas.getBoundingClientRect();
    const scaleX = this.signatureCanvas.width / rect.width;   // e.g., 600 / 540 = 1.11
    const scaleY = this.signatureCanvas.height / rect.height; // e.g., 300 / 300 = 1.0

    return {
        x: (clientX - rect.left) * scaleX,  // Scale the X coordinate
        y: (clientY - rect.top) * scaleY    // Scale the Y coordinate
    };
};
```

This ensures that screen coordinates are properly converted to canvas internal coordinates.

## Changes Made

### Before (Broken):
```javascript
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
});
```

### After (Fixed):
```javascript
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrawing(e.clientX, e.clientY);  // Pass raw client coords
});

// Inside the function:
const coords = getCanvasCoordinates(clientX, clientY);  // Scale them
ctx.moveTo(coords.x, coords.y);  // Use scaled coords
```

## Files Updated
- ✅ `/home/vengace94/pdf-editor/webapp/app.js`
- ✅ `/home/vengace94/pdf-editor/chrome-extension/app.js`
- ✅ `/home/vengace94/pdf-editor/embeddable/dist/app.js`
- ✅ `/home/vengace94/pdf-editor/test-signature.html`

## How to Test

### Quick Test:
```bash
cd /home/vengace94/pdf-editor
# Refresh your browser if already open, or open:
xdg-open test-signature.html
```

**What you should see:**
- ✅ Draw exactly where your mouse/finger is
- ✅ No offset to the left or right
- ✅ Smooth, accurate drawing
- ✅ Lines appear directly under your cursor

### Full App Test:
1. Refresh the PDF editor in your browser (Ctrl+F5 for hard refresh)
2. Upload a PDF
3. Click "Signature" button
4. Click on the PDF
5. Draw in the signature modal
6. **The line should now appear exactly where you draw!**

## Technical Details

The formula for coordinate conversion:
```
canvasX = (mouseX - canvasLeft) × (canvasWidth / displayWidth)
canvasY = (mouseY - canvasTop) × (canvasHeight / displayHeight)
```

Example with numbers:
- Display width: 540px (what you see on screen)
- Canvas width: 600px (internal buffer)
- Mouse at screen position: 270px from left edge
- Canvas position: `(270) × (600 / 540) = 300px`

Without scaling, we'd draw at 270px on a 600px canvas (too far left).
With scaling, we draw at 300px (center, exactly where mouse is on screen).

## Additional Improvements
- Increased line width from 2px to 3px for better visibility
- Added `e.preventDefault()` to prevent unwanted browser behaviors
- Better code organization with centralized coordinate calculation

---

**Status**: ✅ FIXED
**Tested**: Ready for use
**Date**: 2026-01-10
