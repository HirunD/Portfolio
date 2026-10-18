document.addEventListener('DOMContentLoaded', () => {

    // 1. Save as PDF via the print stylesheet
    document.getElementById('print-btn').addEventListener('click', () => window.print());

    // 2. Show the real portfolio address (prints with the page)
    if (location.protocol.startsWith('http')) {
        document.getElementById('site-url').textContent =
            location.host + location.pathname.replace(/cv\d\/(index\.html)?$/, '');
    }
});
