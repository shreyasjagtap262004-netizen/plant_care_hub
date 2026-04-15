// WebAR Plant Preview (Future enhancement)
function initARPreview() {
    if ('AR' in window || 'WebXR' in window) {
        console.log('AR supported! 🌟');
        // A-Frame or 8th Wall integration would go here
    }
}

// Placeholder for AR button
function showARPreview(plantModel) {
    alert(`🕶️ AR Preview: Place ${plantModel} in your space!\n(WebAR support coming soon)`);
}