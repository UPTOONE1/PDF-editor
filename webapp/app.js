// PDF Editor Application
class PDFEditor {
    constructor() {
        this.pdfDoc = null;
        this.pdfBytes = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.annotations = [];
        this.currentTool = 'text';
        this.signatureDataURL = null;
        this.isSelectingRegion = false;
        this.selectionStart = null;
        this.detectedFont = null;
        this.undoStack = [];
        this.redoStack = [];

        this.initializeElements();
        this.attachEventListeners();
        this.initializeSignatureCanvas();
    }

    initializeElements() {
        this.pdfInput = document.getElementById('pdfInput');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.textBtn = document.getElementById('textBtn');
        this.signatureBtn = document.getElementById('signatureBtn');
        this.smartDetectBtn = document.getElementById('smartDetectBtn');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.pageInfo = document.getElementById('pageInfo');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.fontSize = document.getElementById('fontSize');
        this.fontColor = document.getElementById('fontColor');
        this.signatureModal = document.getElementById('signatureModal');
        this.signatureCanvas = document.getElementById('signatureCanvas');
        this.closeModal = document.getElementById('closeModal');
        this.clearSignature = document.getElementById('clearSignature');
        this.saveSignature = document.getElementById('saveSignature');

        // Text Editor elements
        this.textEditorModal = document.getElementById('textEditorModal');
        this.textEditorInput = document.getElementById('textEditorInput');
        this.textEditorFont = document.getElementById('textEditorFont');
        this.textEditorSize = document.getElementById('textEditorSize');
        this.textEditorColor = document.getElementById('textEditorColor');
        this.closeTextEditor = document.getElementById('closeTextEditor');
        this.cancelTextEditor = document.getElementById('cancelTextEditor');
        this.saveTextEditor = document.getElementById('saveTextEditor');
        this.textBold = document.getElementById('textBold');
        this.textItalic = document.getElementById('textItalic');
        this.textUnderline = document.getElementById('textUnderline');
        this.textAlignLeft = document.getElementById('textAlignLeft');
        this.textAlignCenter = document.getElementById('textAlignCenter');
        this.textAlignRight = document.getElementById('textAlignRight');
    }

    attachEventListeners() {
        this.pdfInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        this.undoBtn.addEventListener('click', () => this.undo());
        this.redoBtn.addEventListener('click', () => this.redo());
        this.textBtn.addEventListener('click', () => this.setTool('text'));
        this.signatureBtn.addEventListener('click', () => this.setTool('signature'));
        this.smartDetectBtn.addEventListener('click', () => this.setTool('smartDetect'));
        this.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.nextPageBtn.addEventListener('click', () => this.changePage(1));
        this.closeModal.addEventListener('click', () => this.closeSignatureModal());
        this.clearSignature.addEventListener('click', () => this.clearSignatureCanvas());
        this.saveSignature.addEventListener('click', () => this.saveSignatureToAnnotations());

        // Close modal when clicking outside
        this.signatureModal.addEventListener('click', (e) => {
            if (e.target === this.signatureModal) {
                this.closeSignatureModal();
            }
        });

        // Text Editor event listeners
        this.closeTextEditor.addEventListener('click', () => this.closeTextEditorModal());
        this.cancelTextEditor.addEventListener('click', () => this.closeTextEditorModal());
        this.saveTextEditor.addEventListener('click', () => this.saveTextAnnotation());

        // Close text editor modal when clicking outside
        this.textEditorModal.addEventListener('click', (e) => {
            if (e.target === this.textEditorModal) {
                this.closeTextEditorModal();
            }
        });

        // Live preview updates
        this.textEditorInput.addEventListener('input', () => this.updateTextPreview());
        this.textEditorFont.addEventListener('change', () => this.updateTextPreview());
        this.textEditorSize.addEventListener('input', () => this.updateTextPreview());
        this.textEditorColor.addEventListener('input', () => this.updateTextPreview());

        // Formatting buttons
        this.textBold.addEventListener('click', () => this.toggleFormat('bold'));
        this.textItalic.addEventListener('click', () => this.toggleFormat('italic'));
        this.textUnderline.addEventListener('click', () => this.toggleFormat('underline'));

        // Alignment buttons
        this.textAlignLeft.addEventListener('click', () => this.setAlignment('left'));
        this.textAlignCenter.addEventListener('click', () => this.setAlignment('center'));
        this.textAlignRight.addEventListener('click', () => this.setAlignment('right'));

        // Add paste event listener for images and text
        document.addEventListener('paste', (e) => this.handlePaste(e));

        // Add keyboard shortcuts for undo/redo
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Ctrl+Y or Ctrl+Shift+Z for redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
        });
    }

    initializeSignatureCanvas() {
        let drawing = false;

        // Get correct canvas coordinates accounting for scaling
        const getCanvasCoordinates = (clientX, clientY) => {
            const rect = this.signatureCanvas.getBoundingClientRect();
            const scaleX = this.signatureCanvas.width / rect.width;
            const scaleY = this.signatureCanvas.height / rect.height;

            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        };

        const startDrawing = (clientX, clientY) => {
            drawing = true;
            const coords = getCanvasCoordinates(clientX, clientY);
            const ctx = this.signatureCanvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        };

        const draw = (clientX, clientY) => {
            if (!drawing) return;
            const coords = getCanvasCoordinates(clientX, clientY);
            const ctx = this.signatureCanvas.getContext('2d');
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000';
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        };

        const stopDrawing = () => {
            drawing = false;
        };

        // Mouse events
        this.signatureCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrawing(e.clientX, e.clientY);
        });

        this.signatureCanvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!drawing) return;
            draw(e.clientX, e.clientY);
        });

        this.signatureCanvas.addEventListener('mouseup', stopDrawing);
        this.signatureCanvas.addEventListener('mouseleave', stopDrawing);

        // Touch events
        this.signatureCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startDrawing(touch.clientX, touch.clientY);
        });

        this.signatureCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!drawing) return;
            const touch = e.touches[0];
            draw(touch.clientX, touch.clientY);
        });

        this.signatureCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopDrawing();
        });
    }

    resizeSignatureCanvas() {
        // Set canvas size based on parent width
        const width = this.signatureCanvas.parentElement.offsetWidth;
        this.signatureCanvas.width = width;
        this.signatureCanvas.height = 300;

        // Canvas is now transparent (no white background)
        // This allows the signature to be placed over PDF content
    }

    setTool(tool) {
        // Close any open modals when switching tools
        this.closeTextEditorModal();
        this.closeSignatureModal();

        // Remove any detection result modal
        const detectionModal = document.getElementById('detectionResultModal');
        if (detectionModal) detectionModal.remove();

        this.currentTool = tool;
        this.textBtn.classList.toggle('active', tool === 'text');
        this.signatureBtn.classList.toggle('active', tool === 'signature');
        this.smartDetectBtn.classList.toggle('active', tool === 'smartDetect');

        const canvas = document.getElementById('pdfCanvas');
        if (canvas) {
            if (tool === 'smartDetect') {
                canvas.style.cursor = 'crosshair';
            } else if (tool === 'text') {
                canvas.style.cursor = 'crosshair';
            } else {
                canvas.style.cursor = 'default';
            }
        }
    }

    showDetectInstructions() {
        const message = document.createElement('div');
        message.id = 'detectInstructions';
        message.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(102, 126, 234, 0.95);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        message.textContent = '✨ Draw a box around text to detect its font and size';
        document.body.appendChild(message);

        setTimeout(() => {
            const existing = document.getElementById('detectInstructions');
            if (existing) existing.remove();
        }, 4000);
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfBytes = new Uint8Array(arrayBuffer);
            await this.loadPDF();
            this.downloadBtn.disabled = false;
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF. Please try again.');
        }
    }

    async loadPDF() {
        const loadingTask = pdfjsLib.getDocument({ data: this.pdfBytes });
        this.pdfDoc = await loadingTask.promise;
        this.totalPages = this.pdfDoc.numPages;
        this.currentPage = 1;
        this.annotations = [];
        await this.renderPage();
        this.updatePageControls();
    }

    async renderPage() {
        const page = await this.pdfDoc.getPage(this.currentPage);
        const viewport = page.getViewport({ scale: this.scale });

        // Clear container
        this.canvasContainer.innerHTML = '';

        // Create wrapper for canvas and annotations
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'pdfCanvas';
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        wrapper.appendChild(canvas);

        // Add handlers for adding annotations and smart detect
        canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e, canvas));
        canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e, canvas));
        canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e, canvas));
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e, canvas));

        this.canvasContainer.appendChild(wrapper);

        // Re-render existing annotations for this page
        this.renderAnnotations();
    }

    handleCanvasMouseDown(event, canvas) {
        if (this.currentTool !== 'smartDetect') return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.isSelectingRegion = true;
        this.selectionStart = { x, y };

        // Create selection overlay
        const overlay = document.createElement('div');
        overlay.id = 'selectionOverlay';
        overlay.style.cssText = `
            position: absolute;
            border: 2px dashed #667eea;
            background: rgba(102, 126, 234, 0.1);
            pointer-events: none;
            left: ${rect.left + x}px;
            top: ${rect.top + y}px;
            width: 0;
            height: 0;
            z-index: 998;
        `;
        document.body.appendChild(overlay);
    }

    handleCanvasMouseMove(event, canvas) {
        if (!this.isSelectingRegion || this.currentTool !== 'smartDetect') return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const overlay = document.getElementById('selectionOverlay');
        if (!overlay) return;

        const width = Math.abs(x - this.selectionStart.x);
        const height = Math.abs(y - this.selectionStart.y);
        const left = Math.min(x, this.selectionStart.x);
        const top = Math.min(y, this.selectionStart.y);

        overlay.style.left = (rect.left + left) + 'px';
        overlay.style.top = (rect.top + top) + 'px';
        overlay.style.width = width + 'px';
        overlay.style.height = height + 'px';
    }

    async handleCanvasMouseUp(event, canvas) {
        if (!this.isSelectingRegion || this.currentTool !== 'smartDetect') return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const width = Math.abs(x - this.selectionStart.x);
        const height = Math.abs(y - this.selectionStart.y);
        const left = Math.min(x, this.selectionStart.x);
        const top = Math.min(y, this.selectionStart.y);

        // Remove overlay
        const overlay = document.getElementById('selectionOverlay');
        if (overlay) overlay.remove();

        this.isSelectingRegion = false;

        // Only process if selection is large enough
        if (width > 20 && height > 10) {
            // Convert CSS coordinates to canvas coordinates
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const canvasLeft = left * scaleX;
            const canvasTop = top * scaleY;
            const canvasWidth = width * scaleX;
            const canvasHeight = height * scaleY;

            await this.detectFontInRegion(canvas, canvasLeft, canvasTop, canvasWidth, canvasHeight);
        }
    }

    handleCanvasClick(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (this.currentTool === 'text') {
            this.addTextAnnotation(x, y);
        } else if (this.currentTool === 'signature') {
            this.openSignatureModal(x, y);
        }
    }

    async detectFontInRegion(canvas, x, y, width, height) {
        // Show loading indicator
        const loading = document.createElement('div');
        loading.id = 'aiLoading';
        loading.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 30px;
            border-radius: 8px;
            font-size: 16px;
            z-index: 1002;
        `;
        loading.innerHTML = '🤖 AI analyzing text...<br><small>Reading PDF font data</small>';
        document.body.appendChild(loading);

        try {
            // Get the current page from PDF.js
            const page = await this.pdfDoc.getPage(this.currentPage);
            const textContent = await page.getTextContent();

            // Get viewport for coordinate conversion
            const viewport = page.getViewport({ scale: this.scale });

            // Add margin for better detection (30px padding on each side)
            const margin = 30;
            const selX1 = x - margin;
            const selY1 = y - margin;
            const selX2 = x + width + margin;
            const selY2 = y + height + margin;

            console.log('=== AI DETECTION DEBUG ===');
            console.log('Canvas selection (input):', { x, y, width, height });
            console.log('Selection with margin:', { selX1, selY1, selX2, selY2 });
            console.log('Viewport dimensions:', { width: viewport.width, height: viewport.height });
            console.log('Scale:', this.scale);

            // Find text items within the selected region
            const itemsInRegion = [];
            const allTextItems = [];

            for (const item of textContent.items) {
                if (item.transform && item.str.trim()) {
                    // Get text position from transform matrix
                    // transform[4] = x position, transform[5] = y position (from bottom)
                    const tx = item.transform[4];
                    const ty = item.transform[5];
                    const textHeight = Math.abs(item.transform[0]); // Font size
                    const textWidth = item.width || (item.str.length * textHeight * 0.6);

                    // Y coordinate in PDF is from bottom, canvas is from top
                    // So we need: canvasY = viewportHeight - pdfY
                    const canvasY = viewport.height - ty;

                    allTextItems.push({
                        text: item.str,
                        x: tx,
                        y: canvasY,
                        width: textWidth,
                        height: textHeight
                    });

                    // Check if text bounds intersect with selection box
                    // Text item bounds: [tx, canvasY] to [tx + textWidth, canvasY + textHeight]
                    // Selection bounds: [selX1, selY1] to [selX2, selY2]
                    const intersects =
                        tx < selX2 &&
                        tx + textWidth > selX1 &&
                        canvasY < selY2 &&
                        canvasY + textHeight > selY1;

                    if (intersects) {
                        itemsInRegion.push(item);
                    }
                }
            }

            // Debug logging
            console.log(`Total text items on page: ${allTextItems.length}`);
            console.log('First 10 text items:', allTextItems.slice(0, 10));
            console.log(`Items in selection: ${itemsInRegion.length}`);
            if (itemsInRegion.length > 0) {
                console.log('Found items:', itemsInRegion.map(i => i.str).join(' '));
                console.log('Found items details:', itemsInRegion.map(i => ({
                    text: i.str,
                    x: i.transform[4],
                    y: viewport.height - i.transform[5],
                    fontSize: Math.abs(i.transform[0])
                })));
            }
            console.log('======================');

            if (itemsInRegion.length === 0) {
                // Show visual debug overlay of all text positions
                this.showTextDebugOverlay(canvas, allTextItems);
                throw new Error('No text found in selected area. The page has ' + allTextItems.length + ' text items total. Check console for their positions.');
            }

            // Extract font information from the first text item
            const firstItem = itemsInRegion[0];

            // Get font size from transform matrix (element [0] is horizontal scaling)
            const fontSize = Math.abs(firstItem.transform[0]);
            const actualFontSize = Math.round(fontSize);

            // Get font name
            let fontName = firstItem.fontName || 'unknown';
            let detectedFont = 'Helvetica'; // Default

            // Map PDF font names to web fonts
            if (fontName.includes('Helvetica') || fontName.includes('Arial')) {
                detectedFont = 'Helvetica';
            } else if (fontName.includes('Times') || fontName.includes('Serif')) {
                detectedFont = 'Times New Roman';
            } else if (fontName.includes('Courier') || fontName.includes('Mono')) {
                detectedFont = 'Courier';
            } else if (fontName.includes('Georgia')) {
                detectedFont = 'Georgia';
            } else if (fontName.includes('Verdana')) {
                detectedFont = 'Verdana';
            }

            // Collect sample text
            const sampleText = itemsInRegion.map(item => item.str).join(' ').substring(0, 100);

            loading.remove();

            // Show results
            this.showDetectionResults(actualFontSize, detectedFont, sampleText, fontName);

        } catch (error) {
            loading.remove();
            alert(`AI Detection failed: ${error.message}\n\nTip: Make sure to select an area with text in it.`);
            console.error('Detection Error:', error);
        }
    }

    showTextDebugOverlay(canvas, allTextItems) {
        // Remove existing debug overlay
        const existing = document.getElementById('textDebugOverlay');
        if (existing) existing.remove();

        // Create debug overlay showing all text positions
        const overlay = document.createElement('div');
        overlay.id = 'textDebugOverlay';
        overlay.style.cssText = `
            position: absolute;
            left: ${canvas.offsetLeft}px;
            top: ${canvas.offsetTop}px;
            width: ${canvas.offsetWidth}px;
            height: ${canvas.offsetHeight}px;
            pointer-events: none;
            z-index: 999;
        `;

        // Draw boxes around each text item
        allTextItems.forEach(item => {
            const box = document.createElement('div');
            box.style.cssText = `
                position: absolute;
                left: ${item.x}px;
                top: ${item.y}px;
                width: ${item.width}px;
                height: ${item.height}px;
                border: 1px solid rgba(255, 0, 0, 0.5);
                background: rgba(255, 0, 0, 0.1);
                font-size: 10px;
                color: red;
                overflow: hidden;
                white-space: nowrap;
            `;
            box.textContent = item.text;
            overlay.appendChild(box);
        });

        document.body.appendChild(overlay);

        // Auto-remove after 10 seconds
        setTimeout(() => overlay.remove(), 10000);

        console.log('Debug overlay added showing ' + allTextItems.length + ' text items');
    }

    showDetectionResults(fontSize, fontFamily, sampleText, pdfFontName) {
        // Close any open modals first
        this.closeTextEditorModal();
        this.closeSignatureModal();

        // Remove any existing detection result
        const existing = document.getElementById('detectionResultModal');
        if (existing) existing.remove();

        const result = document.createElement('div');
        result.id = 'detectionResultModal';
        result.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1002;
            max-width: 450px;
        `;

        result.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #667eea;">✨ Font Detection Results</h3>
            <div style="margin-bottom: 15px; line-height: 1.6;">
                <strong>PDF Font:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${pdfFontName || 'Unknown'}</code><br>
                <strong>Matched To:</strong> ${fontFamily}<br>
                <strong>Font Size:</strong> ${fontSize}px<br>
                <strong>Sample Text:</strong> <em style="color: #666;">"${sampleText.trim()}"</em>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelDetect" style="padding: 10px 20px; border: none; background: #6c757d; color: white; border-radius: 6px; cursor: pointer;">Cancel</button>
                <button id="applyDetect" style="padding: 10px 20px; border: none; background: #667eea; color: white; border-radius: 6px; cursor: pointer;">Use This Format</button>
            </div>
        `;

        document.body.appendChild(result);

        document.getElementById('cancelDetect').addEventListener('click', () => {
            result.remove();
            this.setTool('text');
        });

        document.getElementById('applyDetect').addEventListener('click', () => {
            // Apply detected font settings to both toolbar and editor
            this.textEditorFont.value = fontFamily;
            this.textEditorSize.value = fontSize;
            this.fontSize.value = fontSize;

            // Remove modal
            result.remove();

            // Switch to text tool
            this.setTool('text');

            // Show success message
            const success = document.createElement('div');
            success.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: #10b981;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                z-index: 1001;
                font-weight: 600;
            `;
            success.textContent = `✓ Font set to ${fontFamily} ${fontSize}px - Click on PDF to add text`;
            document.body.appendChild(success);
            setTimeout(() => success.remove(), 3000);
        });
    }

    async handlePaste(event) {
        // Only handle paste when a PDF is loaded
        if (!this.pdfDoc) return;

        // Don't handle paste if user is typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const items = event.clipboardData?.items;
        if (!items) return;

        let handled = false;

        // Check for images first
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Handle image paste (screenshots, copied images, etc.)
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const blob = item.getAsFile();
                await this.handleImagePaste(blob);
                handled = true;
                break;
            }
        }

        // If no image found, check for text
        if (!handled) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type === 'text/plain') {
                    event.preventDefault();
                    item.getAsString((text) => {
                        this.handleTextPaste(text);
                    });
                    handled = true;
                    break;
                }
            }
        }

        if (handled) {
            console.log('Paste handled successfully');
        }
    }

    async handleImagePaste(blob) {
        // Convert blob to data URL
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataURL = e.target.result;

            // Get canvas center position for pasted image
            const canvas = document.getElementById('pdfCanvas');
            if (!canvas) return;

            const centerX = canvas.width / 2 - 100; // Center image (assuming 200px width)
            const centerY = canvas.height / 2 - 50; // Center image (assuming 100px height)

            const annotation = {
                type: 'signature', // Reuse signature type for pasted images
                page: this.currentPage,
                x: centerX,
                y: centerY,
                dataURL: dataURL,
                width: 200,
                height: 100,
                id: Date.now()
            };

            this.saveState(); // Save state before adding
            this.annotations.push(annotation);
            this.renderAnnotations();

            // Show feedback
            console.log('Image pasted successfully at center of page');
        };
        reader.readAsDataURL(blob);
    }

    handleTextPaste(text) {
        // Get canvas center position for pasted text
        const canvas = document.getElementById('pdfCanvas');
        if (!canvas) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const annotation = {
            type: 'text',
            page: this.currentPage,
            x: centerX,
            y: centerY,
            text: text,
            fontSize: parseInt(this.fontSize.value),
            color: this.fontColor.value,
            id: Date.now()
        };

        this.saveState(); // Save state before adding
        this.annotations.push(annotation);
        this.renderAnnotations();

        // Show feedback
        console.log('Text pasted successfully at center of page');
    }

    addTextAnnotation(x, y) {
        // Open the text editor modal instead of prompt
        this.openTextEditorModal(x, y);
    }

    openTextEditorModal(x, y) {
        this.textEditorModal.classList.add('active');
        this.pendingTextPosition = { x, y };

        // Create or get the editable text div
        let editableDiv = document.getElementById('directEditableText');
        if (!editableDiv) {
            editableDiv = document.createElement('div');
            editableDiv.id = 'directEditableText';
            editableDiv.contentEditable = 'true';
            editableDiv.setAttribute('spellcheck', 'true');
            editableDiv.style.position = 'absolute';
            editableDiv.style.minWidth = '200px';
            editableDiv.style.minHeight = '30px';
            editableDiv.style.outline = '2px solid #667eea';
            editableDiv.style.padding = '5px';
            editableDiv.style.background = 'rgba(255, 255, 255, 0.1)';
            editableDiv.style.zIndex = '999';
            editableDiv.style.cursor = 'text';
            editableDiv.style.whiteSpace = 'pre-wrap';
            editableDiv.style.wordWrap = 'break-word';
            document.getElementById('canvasContainer').appendChild(editableDiv);
        }

        // Position the editable div at click location
        const canvas = document.getElementById('pdfCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const containerRect = document.getElementById('canvasContainer').getBoundingClientRect();

            // Convert click coordinates to container-relative position
            editableDiv.style.left = (rect.left - containerRect.left + x) + 'px';
            editableDiv.style.top = (rect.top - containerRect.top + y) + 'px';
        }

        editableDiv.innerHTML = '';

        // Position the toolbar near the editable text box
        const modalContent = this.textEditorModal.querySelector('.modal-content');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const containerRect = document.getElementById('canvasContainer').getBoundingClientRect();

            // Position toolbar just below the editable text
            const toolbarLeft = rect.left - containerRect.left + x;
            const toolbarTop = rect.top - containerRect.top + y + 60; // 60px below text box

            modalContent.style.position = 'fixed';
            modalContent.style.left = (containerRect.left + toolbarLeft) + 'px';
            modalContent.style.top = (containerRect.top + toolbarTop) + 'px';
            modalContent.style.transform = 'none';
            modalContent.style.margin = '0';
        }

        // Reset editor state
        this.textEditorFont.value = 'Helvetica';
        this.textEditorSize.value = this.fontSize.value;
        this.textEditorColor.value = this.fontColor.value;
        this.currentTextFormat = {
            bold: false,
            italic: false,
            underline: false,
            align: 'left'
        };

        // Reset button states
        this.textBold.classList.remove('active');
        this.textItalic.classList.remove('active');
        this.textUnderline.classList.remove('active');
        this.textAlignLeft.classList.add('active');
        this.textAlignCenter.classList.remove('active');
        this.textAlignRight.classList.remove('active');

        // Apply initial formatting to editable div
        this.applyFormattingToEditableDiv();

        // Focus the editable div
        setTimeout(() => {
            editableDiv.focus();
        }, 100);
    }

    closeTextEditorModal() {
        this.textEditorModal.classList.remove('active');
        this.pendingTextPosition = null;

        // Remove the editable div
        const editableDiv = document.getElementById('directEditableText');
        if (editableDiv) {
            editableDiv.remove();
        }
    }

    updateTextPreview() {
        // Apply formatting to the editable div instead of textarea
        this.applyFormattingToEditableDiv();
    }

    applyFormattingToEditableDiv() {
        const editableDiv = document.getElementById('directEditableText');
        if (!editableDiv) return;

        const font = this.textEditorFont.value;
        const size = this.textEditorSize.value + 'px';
        const color = this.textEditorColor.value;

        let fontWeight = this.currentTextFormat?.bold ? 'bold' : 'normal';
        let fontStyle = this.currentTextFormat?.italic ? 'italic' : 'normal';
        let textDecoration = this.currentTextFormat?.underline ? 'underline' : 'none';
        let textAlign = this.currentTextFormat?.align || 'left';

        editableDiv.style.fontFamily = font;
        editableDiv.style.fontSize = size;
        editableDiv.style.color = color;
        editableDiv.style.fontWeight = fontWeight;
        editableDiv.style.fontStyle = fontStyle;
        editableDiv.style.textDecoration = textDecoration;
        editableDiv.style.textAlign = textAlign;
    }

    toggleFormat(format) {
        if (!this.currentTextFormat) {
            this.currentTextFormat = { bold: false, italic: false, underline: false, align: 'left' };
        }

        this.currentTextFormat[format] = !this.currentTextFormat[format];

        // Update button state
        if (format === 'bold') {
            this.textBold.classList.toggle('active', this.currentTextFormat.bold);
        } else if (format === 'italic') {
            this.textItalic.classList.toggle('active', this.currentTextFormat.italic);
        } else if (format === 'underline') {
            this.textUnderline.classList.toggle('active', this.currentTextFormat.underline);
        }

        this.updateTextPreview();
    }

    setAlignment(align) {
        if (!this.currentTextFormat) {
            this.currentTextFormat = { bold: false, italic: false, underline: false, align: 'left' };
        }

        this.currentTextFormat.align = align;

        // Update button states
        this.textAlignLeft.classList.toggle('active', align === 'left');
        this.textAlignCenter.classList.toggle('active', align === 'center');
        this.textAlignRight.classList.toggle('active', align === 'right');

        this.updateTextPreview();
    }

    saveTextAnnotation() {
        const editableDiv = document.getElementById('directEditableText');
        if (!editableDiv) return;

        const text = editableDiv.innerText.trim();
        if (!text) {
            alert('Please enter some text.');
            return;
        }

        const annotation = {
            type: 'text',
            page: this.currentPage,
            x: this.pendingTextPosition.x,
            y: this.pendingTextPosition.y,
            text: text,
            fontSize: parseInt(this.textEditorSize.value),
            color: this.textEditorColor.value,
            fontFamily: this.textEditorFont.value,
            bold: this.currentTextFormat.bold,
            italic: this.currentTextFormat.italic,
            underline: this.currentTextFormat.underline,
            align: this.currentTextFormat.align,
            id: Date.now()
        };

        this.saveState(); // Save state before adding
        this.annotations.push(annotation);
        this.closeTextEditorModal();
        this.renderAnnotations();
    }

    openSignatureModal(x, y) {
        this.signatureModal.classList.add('active');
        this.pendingSignaturePosition = { x, y };

        // Resize canvas after modal is visible
        setTimeout(() => {
            this.resizeSignatureCanvas();
        }, 10);
    }

    closeSignatureModal() {
        this.signatureModal.classList.remove('active');
        this.pendingSignaturePosition = null;
    }

    clearSignatureCanvas() {
        // Resize the canvas which also clears it
        this.resizeSignatureCanvas();
    }

    saveSignatureToAnnotations() {
        const dataURL = this.signatureCanvas.toDataURL('image/png');

        // Check if signature is blank by looking for any non-transparent pixels with color
        const ctx = this.signatureCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, this.signatureCanvas.width, this.signatureCanvas.height);

        // Check if any pixel has been drawn (non-transparent with color)
        let hasDrawing = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            const alpha = imageData.data[i + 3];
            // If alpha > 0, there's a drawn pixel
            if (alpha > 0) {
                hasDrawing = true;
                break;
            }
        }

        if (!hasDrawing) {
            alert('Please draw your signature first.');
            return;
        }

        const annotation = {
            type: 'signature',
            page: this.currentPage,
            x: this.pendingSignaturePosition.x,
            y: this.pendingSignaturePosition.y,
            dataURL: dataURL,
            width: 200,
            height: 100,
            id: Date.now()
        };

        this.saveState(); // Save state before adding
        this.annotations.push(annotation);
        this.closeSignatureModal();
        this.renderAnnotations();
    }

    renderAnnotations() {
        // Remove existing annotation elements
        document.querySelectorAll('.annotation').forEach(el => el.remove());

        const canvas = document.getElementById('pdfCanvas');
        if (!canvas) return;

        const wrapper = canvas.parentElement;

        // Render annotations for current page
        this.annotations
            .filter(ann => ann.page === this.currentPage)
            .forEach(ann => {
                const element = this.createAnnotationElement(ann);
                wrapper.appendChild(element);
            });
    }

    createAnnotationElement(annotation) {
        const div = document.createElement('div');
        div.className = 'annotation';
        div.style.left = annotation.x + 'px';
        div.style.top = annotation.y + 'px';
        div.dataset.id = annotation.id;

        if (annotation.type === 'text') {
            const fontFamily = annotation.fontFamily || 'Helvetica';
            const fontWeight = annotation.bold ? 'bold' : 'normal';
            const fontStyle = annotation.italic ? 'italic' : 'normal';
            const textDecoration = annotation.underline ? 'underline' : 'none';
            const textAlign = annotation.align || 'left';

            div.innerHTML = `
                <div class="annotation-text" style="
                    font-size: ${annotation.fontSize}px;
                    color: ${annotation.color};
                    font-family: ${fontFamily};
                    font-weight: ${fontWeight};
                    font-style: ${fontStyle};
                    text-decoration: ${textDecoration};
                    text-align: ${textAlign};
                ">
                    ${this.escapeHtml(annotation.text)}
                </div>
                <button class="annotation-delete">×</button>
            `;
        } else if (annotation.type === 'signature') {
            div.className += ' signature-annotation';
            div.style.width = annotation.width + 'px';
            div.style.height = annotation.height + 'px';
            div.innerHTML = `
                <img src="${annotation.dataURL}" alt="Signature" />
                <button class="annotation-delete">×</button>
            `;
        }

        // Make draggable
        this.makeDraggable(div, annotation);

        // Delete button
        const deleteBtn = div.querySelector('.annotation-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteAnnotation(annotation.id);
        });

        // Select/unselect on click (toggle)
        div.addEventListener('click', () => {
            const isCurrentlySelected = div.classList.contains('selected');

            // Remove selection from all annotations
            document.querySelectorAll('.annotation').forEach(el =>
                el.classList.remove('selected')
            );

            // If this annotation wasn't selected, select it
            // If it was selected, leave it unselected (toggle behavior)
            if (!isCurrentlySelected) {
                div.classList.add('selected');
            }
        });

        return div;
    }

    makeDraggable(element, annotation) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('annotation-delete')) return;
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            element.style.left = x + 'px';
            element.style.top = y + 'px';
            annotation.x = x;
            annotation.y = y;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'move';
            }
        });
    }

    deleteAnnotation(id) {
        this.saveState(); // Save state before deleting
        this.annotations = this.annotations.filter(ann => ann.id !== id);
        this.renderAnnotations();
    }

    saveState() {
        // Save current annotations state to undo stack
        this.undoStack.push(JSON.parse(JSON.stringify(this.annotations)));
        // Clear redo stack when new action is performed
        this.redoStack = [];
        // Limit undo stack to 50 states
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length === 0) return;

        // Save current state to redo stack
        this.redoStack.push(JSON.parse(JSON.stringify(this.annotations)));

        // Restore previous state
        this.annotations = this.undoStack.pop();
        this.renderAnnotations();
        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        // Save current state to undo stack
        this.undoStack.push(JSON.parse(JSON.stringify(this.annotations)));

        // Restore next state
        this.annotations = this.redoStack.pop();
        this.renderAnnotations();
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        this.undoBtn.disabled = this.undoStack.length === 0;
        this.redoBtn.disabled = this.redoStack.length === 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage < 1 || newPage > this.totalPages) return;
        this.currentPage = newPage;
        await this.renderPage();
        this.updatePageControls();
    }

    updatePageControls() {
        this.pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages;
    }

    async downloadPDF() {
        try {
            // Load PDF with pdf-lib
            const pdfDoc = await PDFLib.PDFDocument.load(this.pdfBytes);
            const pages = pdfDoc.getPages();

            // Embed fonts
            const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

            // Add annotations to PDF
            for (const annotation of this.annotations) {
                const page = pages[annotation.page - 1];
                const { height } = page.getSize();

                if (annotation.type === 'text') {
                    // Convert color hex to RGB
                    const rgb = this.hexToRgb(annotation.color);

                    page.drawText(annotation.text, {
                        x: annotation.x / this.scale,
                        y: height - (annotation.y / this.scale),
                        size: annotation.fontSize / this.scale,
                        font: helveticaFont,
                        color: PDFLib.rgb(rgb.r / 255, rgb.g / 255, rgb.b / 255)
                    });
                } else if (annotation.type === 'signature') {
                    try {
                        // Convert data URL to image
                        const imageBytes = this.dataURLToBytes(annotation.dataURL);

                        // Try to embed as PNG first, fallback to JPG if it fails
                        let image;
                        try {
                            image = await pdfDoc.embedPng(imageBytes);
                        } catch (pngError) {
                            console.warn('PNG embed failed, trying JPG conversion:', pngError);
                            // Convert to JPG format
                            const jpgBytes = await this.convertToJpg(annotation.dataURL);
                            image = await pdfDoc.embedJpg(jpgBytes);
                        }

                        page.drawImage(image, {
                            x: annotation.x / this.scale,
                            y: height - ((annotation.y + annotation.height) / this.scale),
                            width: annotation.width / this.scale,
                            height: annotation.height / this.scale
                        });
                    } catch (imgError) {
                        console.error('Error embedding signature image:', imgError);
                        throw new Error(`Failed to embed signature: ${imgError.message}`);
                    }
                }
            }

            // Save PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'edited-document.pdf';
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert(`Failed to save PDF: ${error.message || 'Unknown error'}. Please check the console for details.`);
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    dataURLToBytes(dataURL) {
        const base64 = dataURL.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    async convertToJpg(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Create a canvas to convert to JPG
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // Fill white background (JPG doesn't support transparency)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the image
                ctx.drawImage(img, 0, 0);

                // Convert to JPG data URL
                const jpgDataURL = canvas.toDataURL('image/jpeg', 0.95);
                const jpgBytes = this.dataURLToBytes(jpgDataURL);
                resolve(jpgBytes);
            };
            img.onerror = () => reject(new Error('Failed to load image for conversion'));
            img.src = dataURL;
        });
    }
}

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Initialize app
const app = new PDFEditor();
