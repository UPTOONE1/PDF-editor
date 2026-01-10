/**
 * PDF Editor Embeddable Widget
 *
 * Usage:
 * 1. Include this script in your HTML:
 *    <script src="pdf-editor-embed.js"></script>
 *
 * 2. Add a container div where you want the editor:
 *    <div id="pdf-editor-container"></div>
 *
 * 3. Initialize the editor:
 *    <script>
 *      PDFEditorWidget.init('pdf-editor-container');
 *    </script>
 *
 * Or use as a modal/popup:
 *    <button onclick="PDFEditorWidget.openModal()">Edit PDF</button>
 */

(function(window) {
    'use strict';

    const PDFEditorWidget = {
        containerId: null,
        isModalMode: false,

        /**
         * Initialize the PDF editor in a container
         * @param {string} containerId - The ID of the container element
         * @param {object} options - Configuration options
         */
        init: function(containerId, options = {}) {
            this.containerId = containerId;
            this.options = {
                width: options.width || '100%',
                height: options.height || '800px',
                theme: options.theme || 'default',
                ...options
            };

            this.injectStyles();
            this.renderEditor();
        },

        /**
         * Open the PDF editor in a modal
         */
        openModal: function() {
            this.isModalMode = true;
            this.injectStyles();
            this.renderModal();
        },

        /**
         * Close the modal
         */
        closeModal: function() {
            const modal = document.getElementById('pdf-editor-modal');
            if (modal) {
                modal.remove();
            }
        },

        /**
         * Inject required styles
         */
        injectStyles: function() {
            if (document.getElementById('pdf-editor-styles')) return;

            const link = document.createElement('link');
            link.id = 'pdf-editor-styles';
            link.rel = 'stylesheet';
            link.href = this.getBasePath() + 'dist/pdf-editor.css';
            document.head.appendChild(link);
        },

        /**
         * Get the base path for loading assets
         */
        getBasePath: function() {
            const scripts = document.getElementsByTagName('script');
            const currentScript = scripts[scripts.length - 1];
            const scriptPath = currentScript.src;
            return scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
        },

        /**
         * Render the editor in a container
         */
        renderEditor: function() {
            const container = document.getElementById(this.containerId);
            if (!container) {
                console.error('PDF Editor: Container not found:', this.containerId);
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.id = 'pdf-editor-iframe';
            iframe.src = this.getBasePath() + 'dist/editor.html';
            iframe.style.width = this.options.width;
            iframe.style.height = this.options.height;
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';

            container.appendChild(iframe);
        },

        /**
         * Render the editor in a modal
         */
        renderModal: function() {
            // Remove existing modal if any
            this.closeModal();

            const modal = document.createElement('div');
            modal.id = 'pdf-editor-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                z-index: 999999;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                width: 100%;
                max-width: 1400px;
                height: 90%;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                overflow: hidden;
                position: relative;
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(0,0,0,0.5);
                color: white;
                font-size: 32px;
                cursor: pointer;
                border-radius: 50%;
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            `;
            closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(0,0,0,0.7)';
            closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(0,0,0,0.5)';
            closeBtn.onclick = () => this.closeModal();

            const iframe = document.createElement('iframe');
            iframe.src = this.getBasePath() + 'dist/editor.html';
            iframe.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
            `;

            modalContent.appendChild(closeBtn);
            modalContent.appendChild(iframe);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });

            // Close on ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
    };

    // Expose to window
    window.PDFEditorWidget = PDFEditorWidget;

})(window);
