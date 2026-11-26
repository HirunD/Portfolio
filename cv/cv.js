// "Download PDF" opens the browser's print dialog; the print stylesheet lays it out as A4.
// Wait for the web fonts first, so the fallback fonts never lay out (and overflow) the page.
document.getElementById('print-btn').addEventListener('click', () => {
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => window.print());
});
