document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('plantImage');
    const resultDiv = document.getElementById('diagnosisResult');
    const healthStatus = document.getElementById('healthStatus');
    const diagnosisText = document.getElementById('diagnosisText');
    const careTips = document.getElementById('careTips');

    fileInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Simulate AI processing
        const uploadArea = e.target.parentElement;
        uploadArea.innerHTML = `
            <div class="processing">
                <div class="spinner"></div>
                <p>🤖 AI analyzing your plant...</p>
                <small>This may take a moment</small>
            </div>
        `;

        setTimeout(() => performDiagnosis(), 2500);
    }

    function performDiagnosis() {
        // Simulate AI diagnosis with random but realistic results
        const issues = [
            {
                status: 'healthy',
                emoji: '✅',
                diagnosis: 'Your plant looks perfectly healthy!',
                tips: [
                    'Continue current care routine',
                    'Water when top 2 inches of soil are dry',
                    'Maintain bright, indirect light'
                ]
            },
            {
                status: 'warning',
                emoji: '⚠️',
                diagnosis: 'Mild overwatering detected',
                tips: [
                    'Let soil dry out completely before next watering',
                    'Check for root rot (brown mushy roots)',
                    'Improve air circulation around plant'
                ]
            },
            {
                status: 'critical',
                emoji: '🚨',
                diagnosis: 'Severe pest infestation detected',
                tips: [
                    'Isolate plant immediately',
                    'Apply neem oil or insecticidal soap',
                    'Remove heavily infested leaves',
                    'Monitor daily for 2 weeks'
                ]
            }
        ];

        const diagnosis = issues[Math.floor(Math.random() * issues.length)];
        
        healthStatus.innerHTML = `${diagnosis.emoji} ${diagnosis.status.toUpperCase()}`;
        healthStatus.className = `health-status ${diagnosis.status}`;
        diagnosisText.textContent = diagnosis.diagnosis;
        careTips.innerHTML = diagnosis.tips.map(tip => `<li>${tip}</li>`).join('');
        
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
});