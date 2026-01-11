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

        this.initializeElements();
        this.attachEventListeners();
        this.initializeSignatureCanvas();
    }

    initializeElements() {
        this.pdfInput = document.getElementById('pdfInput');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.textBtn = document.getElementById('textBtn');
        this.signatureBtn = document.getElementById('signatureBtn');
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
        this.textBtn.addEventListener('click', () => this.setTool('text'));
        this.signatureBtn.addEventListener('click', () => this.setTool('signature'));
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
        this.currentTool = tool;
        this.textBtn.classList.toggle('active', tool === 'text');
        this.signatureBtn.classList.toggle('active', tool === 'signature');
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

        // Add click handler for adding annotations
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e, canvas));

        this.canvasContainer.appendChild(wrapper);

        // Re-render existing annotations for this page
        this.renderAnnotations();
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

        // Reset editor state
        this.textEditorInput.value = '';
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

        // Update preview
        this.updateTextPreview();

        // Focus input
        setTimeout(() => {
            this.textEditorInput.focus();
        }, 100);
    }

    closeTextEditorModal() {
        this.textEditorModal.classList.remove('active');
        this.pendingTextPosition = null;
    }

    updateTextPreview() {
        const font = this.textEditorFont.value;
        const size = this.textEditorSize.value + 'px';
        const color = this.textEditorColor.value;

        let fontWeight = this.currentTextFormat?.bold ? 'bold' : 'normal';
        let fontStyle = this.currentTextFormat?.italic ? 'italic' : 'normal';
        let textDecoration = this.currentTextFormat?.underline ? 'underline' : 'none';
        let textAlign = this.currentTextFormat?.align || 'left';

        this.textEditorInput.style.fontFamily = font;
        this.textEditorInput.style.fontSize = size;
        this.textEditorInput.style.color = color;
        this.textEditorInput.style.fontWeight = fontWeight;
        this.textEditorInput.style.fontStyle = fontStyle;
        this.textEditorInput.style.textDecoration = textDecoration;
        this.textEditorInput.style.textAlign = textAlign;
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
        const text = this.textEditorInput.value.trim();
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
        this.annotations = this.annotations.filter(ann => ann.id !== id);
        this.renderAnnotations();
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
