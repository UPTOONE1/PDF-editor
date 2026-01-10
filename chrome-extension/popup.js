document.getElementById('openEditor').addEventListener('click', () => {
    // Open the PDF editor in a new tab
    chrome.tabs.create({
        url: chrome.runtime.getURL('editor.html')
    });
});

document.getElementById('editCurrentPDF').addEventListener('click', async () => {
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if current page is a PDF
    if (tab.url.endsWith('.pdf')) {
        // Download the PDF and open it in the editor
        chrome.tabs.create({
            url: chrome.runtime.getURL('editor.html') + '?pdf=' + encodeURIComponent(tab.url)
        });
    } else {
        // Inject content script to detect PDFs on the page
        chrome.tabs.sendMessage(tab.id, { action: 'detectPDF' }, (response) => {
            if (response && response.hasPDF) {
                chrome.tabs.create({
                    url: chrome.runtime.getURL('editor.html') + '?pdf=' + encodeURIComponent(response.pdfUrl)
                });
            } else {
                alert('No PDF detected on this page. Please open a PDF file or use the "Open PDF Editor" button to upload one.');
            }
        });
    }
});
