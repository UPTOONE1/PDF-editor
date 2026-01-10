// Content script to detect PDFs on the page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'detectPDF') {
        // Look for PDF links or embedded PDFs
        const pdfLinks = Array.from(document.querySelectorAll('a[href$=".pdf"], embed[type="application/pdf"], object[type="application/pdf"]'));

        if (pdfLinks.length > 0) {
            const pdfUrl = pdfLinks[0].href || pdfLinks[0].src || pdfLinks[0].data;
            sendResponse({ hasPDF: true, pdfUrl: pdfUrl });
        } else {
            sendResponse({ hasPDF: false });
        }
    }
    return true;
});
