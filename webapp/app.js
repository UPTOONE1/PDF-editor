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

    addTextAnnotation(x, y) {
        const text = prompt('Enter text:');
        if (!text) return;

        const annotation = {
            type: 'text',
            page: this.currentPage,
            x: x,
            y: y,
            text: text,
            fontSize: parseInt(this.fontSize.value),
            color: this.fontColor.value,
            id: Date.now()
        };

        this.annotations.push(annotation);
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
            div.innerHTML = `
                <div class="annotation-text" style="font-size: ${annotation.fontSize}px; color: ${annotation.color};">
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

        // Select on click
        div.addEventListener('click', () => {
            document.querySelectorAll('.annotation').forEach(el =>
                el.classList.remove('selected')
            );
            div.classList.add('selected');
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
                    // Convert data URL to image
                    const imageBytes = this.dataURLToBytes(annotation.dataURL);
                    const image = await pdfDoc.embedPng(imageBytes);

                    page.drawImage(image, {
                        x: annotation.x / this.scale,
                        y: height - ((annotation.y + annotation.height) / this.scale),
                        width: annotation.width / this.scale,
                        height: annotation.height / this.scale
                    });
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
            alert('Failed to save PDF. Please try again.');
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
}

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Initialize app
const app = new PDFEditor();
