const state = {
    currentStep: 1,
    formData: {
        firmSize: '',
        sector: '',
        services: [],
        aiType: '',
        autonomy: ''
    }
};

const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4')
};

const progressSteps = document.querySelectorAll('.progress-step');

function nextStep(currentStepNum) {
    if (!validateStep(currentStepNum)) return;
    
    saveStepData(currentStepNum);
    
    steps[currentStepNum].classList.remove('active');
    steps[currentStepNum].hidden = true;
    
    const nextStepNum = currentStepNum + 1;
    steps[nextStepNum].classList.add('active');
    steps[nextStepNum].hidden = false;
    
    updateProgress(nextStepNum);
    
    if (progressSteps[currentStepNum - 1]) {
        progressSteps[currentStepNum - 1].classList.remove('active');
        progressSteps[currentStepNum - 1].classList.add('completed');
    }
    
    state.currentStep = nextStepNum;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(currentStepNum) {
    const prevStepNum = currentStepNum - 1;
    
    steps[currentStepNum].classList.remove('active');
    steps[currentStepNum].hidden = true;
    
    steps[prevStepNum].classList.add('active');
    steps[prevStepNum].hidden = false;
    
    updateProgress(prevStepNum);
    
    if (progressSteps[currentStepNum - 1]) {
        progressSteps[currentStepNum - 1].classList.remove('completed');
        progressSteps[currentStepNum - 1].classList.remove('active');
    }
    
    if (progressSteps[prevStepNum - 1]) {
        progressSteps[prevStepNum - 1].classList.remove('completed');
        progressSteps[prevStepNum - 1].classList.add('active');
    }
    
    state.currentStep = prevStepNum;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(stepNum) {
    progressSteps.forEach((step, index) => {
        const stepIndex = index + 1;
        step.classList.remove('active');
        
        if (stepIndex === stepNum) {
            step.classList.add('active');
        } else if (stepIndex < stepNum) {
            step.classList.add('completed');
        }
    });
    
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.setAttribute('aria-valuenow', stepNum);
    }
}

function validateStep(stepNum) {
    let isValid = true;
    let errorMessage = '';
    
    switch(stepNum) {
        case 1:
            const firmSize = document.getElementById('firm-size').value;
            const sector = document.querySelector('input[name="sector"]:checked');
            
            if (!firmSize) {
                isValid = false;
                errorMessage = 'Veuillez sélectionner la taille de votre organisation.';
            } else if (!sector) {
                isValid = false;
                errorMessage = 'Veuillez sélectionner votre secteur d\'activité.';
            }
            break;
            
        case 3:
            const aiType = document.querySelector('input[name="ai-type"]:checked');
            const autonomy = document.querySelector('input[name="autonomy"]:checked');
            
            if (!aiType) {
                isValid = false;
                errorMessage = 'Veuillez indiquer le type de systèmes d\'IA utilisés.';
            } else if (!autonomy) {
                isValid = false;
                errorMessage = 'Veuillez préciser le niveau d\'autonomie décisionnelle.';
            }
            break;
    }
    
    if (!isValid) {
        showValidationError(errorMessage);
    }
    
    return isValid;
}

function showValidationError(message) {
    const existingError = document.querySelector('.validation-error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.cssText = `
        background-color: rgba(220, 38, 38, 0.1);
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 4px solid #dc2626;
        font-weight: 500;
    `;
    errorDiv.textContent = message;
    
    const currentStepEl = steps[state.currentStep];
    const stepHeader = currentStepEl.querySelector('.step-header');
    stepHeader.insertAdjacentElement('afterend', errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function saveStepData(stepNum) {
    switch(stepNum) {
        case 1:
            state.formData.firmSize = document.getElementById('firm-size').value;
            state.formData.sector = document.querySelector('input[name="sector"]:checked')?.value;
            break;
            
        case 2:
            const services = document.querySelectorAll('input[name="services"]:checked');
            state.formData.services = Array.from(services).map(cb => cb.value);
            break;
            
        case 3:
            state.formData.aiType = document.querySelector('input[name="ai-type"]:checked')?.value;
            state.formData.autonomy = document.querySelector('input[name="autonomy"]:checked')?.value;
            break;
    }
}

function calculateRisk() {
    if (!validateStep(3)) return;
    saveStepData(3);
    
    const { services, aiType, autonomy } = state.formData;
    let riskTier = 'minimal';
    let riskCategory = 'Risque minimal';
    
    const highRiskServices = ['biometric', 'automated-decision', 'risk-assessment'];
    const hasHighRiskService = services.some(s => highRiskServices.includes(s));
    
    if (aiType === 'prohibited') {
        riskTier = 'high';
        riskCategory = 'Pratiques interdites ou à haut risque';
    } else if (hasHighRiskService && autonomy === 'automated') {
        riskTier = 'high';
        riskCategory = 'Système à haut risque';
    } else if (hasHighRiskService || (aiType === 'specialized' && autonomy === 'automated')) {
        riskTier = 'high';
        riskCategory = 'Système à haut risque';
    } else if (services.includes('content-generation') && autonomy === 'automated') {
        riskTier = 'limited';
        riskCategory = 'Risque limité (transparence requise)';
    } else if (aiType === 'specialized' || services.length > 2) {
        riskTier = 'limited';
        riskCategory = 'Risque limité';
    } else if (aiType === 'general' && autonomy !== 'automated') {
        riskTier = 'minimal';
        riskCategory = 'Risque minimal';
    } else if (aiType === 'none') {
        riskTier = 'minimal';
        riskCategory = 'Risque minimal (préventif)';
    } else {
        riskTier = 'limited';
        riskCategory = 'Risque limité';
    }
    
    displayResults(riskTier, riskCategory);
    
    steps[3].classList.remove('active');
    steps[3].hidden = true;
    steps[4].classList.add('active');
    steps[4].hidden = false;
    updateProgress(4);
    state.currentStep = 4;
    
    updateCountdown();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayResults(tier, category) {
    const badge = document.getElementById('risk-badge');
    const level = document.getElementById('risk-level');
    const cat = document.getElementById('risk-category');
    const legalText = document.getElementById('legal-meaning-text');
    const obligationsList = document.getElementById('obligations-list');
    const governanceText = document.getElementById('governance-text');
    const strategicText = document.getElementById('strategic-text');
    
    badge.className = `risk-badge ${tier}`;
    level.textContent = tier === 'minimal' ? 'Risque Minimal' : 
                       tier === 'limited' ? 'Risque Limité' : 'Haut Risque';
    cat.textContent = category;
    
    const content = getRiskContent(tier);
    
    legalText.textContent = content.legal;
    governanceText.textContent = content.governance;
    strategicText.textContent = content.strategic;
    
    obligationsList.innerHTML = '';
    content.obligations.forEach(obligation => {
        const li = document.createElement('li');
        li.textContent = obligation;
        obligationsList.appendChild(li);
    });
}

function getRiskContent(tier) {
    const contents = {
        minimal: {
            legal: 'Votre utilisation de l\'IA relève de la catégorie à risque minimal selon l\'Article 6 du Règlement AI Act. Vous n\'êtes pas soumis aux obligations strictes des systèmes à haut risque, mais vous devez respecter les exigences de transparence de base (Article 52) si vous utilisez des chatbots ou de la génération de contenu.',
            obligations: [
                'Transparence envers les utilisateurs (si chatbots ou deepfakes)',
                'Respect du droit d\'auteur et des données d\'entraînement',
                'Documentation interne des usages d\'IA',
                'Veille réglementaire pour anticiper l\'évolution'
            ],
            governance: 'Exposition gouvernance faible. Aucune obligation de conformity assessment. Cependant, la direction doit s\'assurer que l\'usage reste dans cette catégorie et ne glisse pas vers des usages à haut risque sans autorisation du board.',
            strategic: 'Positionnement prudent recommandé. Profitez de cette période pour établir une gouvernance éthique volontaire. Anticipez l\'évolution réglementaire en documentant vos processus. C\'est le moment idéal pour structurer une politique IA avant que les obligations ne se durcissent.'
        },
        limited: {
            legal: 'Votre exposition est classée risque limité (Article 52). Vous utilisez probablement des systèmes d\'IA généraliste (GPAI) ou des outils spécialisés avec supervision humaine. Des obligations de transparence s\'appliquent, notamment l\'information des utilisateurs et la documentation des capacités et limites des systèmes.',
            obligations: [
                'Information claire des utilisateurs sur l\'interaction avec l\'IA',
                'Documentation technique des systèmes déployés',
                'Étiquetage du contenu généré par IA (deepfakes, texte)',
                'Mise en place d\'une supervision humaine effective',
                'Évaluation des impacts sur les droits fondamentaux'
            ],
            governance: 'Exposition modérée au niveau board. La direction doit valider les cas d\'usage et s\'assurer de la traçabilité. Un responsable de la conformité IA doit être désigné, même formellement. Les décisions d\'achat d\'outils IA doivent inclure une review juridique systématique.',
            strategic: 'Opportunité de structuration. Vous êtes dans une zone où l\'investissement en gouvernance proactive sera un avantage compétitif. Les clients demandent de plus en plus des preuves de conformité. Structurez maintenant pour éviter les coûts de mise en conformité urgente plus tard.'
        },
        high: {
            legal: 'ALERTE RÉGLEMENTAIRE : Vous êtes probablement concerné par les systèmes à haut risque (Article 6 et Annexe III). Cela inclut les systèmes de biométrie, les évaluations de risque pour l\'accès à des services essentiels, ou les décisions automatisées ayant un impact juridique significatif. Des obligations strictes s\'appliquent avant mise sur le marché.',
            obligations: [
                'Conformity assessment obligatoire avant déploiement',
                'Système de gestion de la qualité et de la documentation',
                'Supervision humaine significative (humain dans la boucle)',
                'Transparence et fourniture d\'informations aux utilisateurs',
                'Enregistrement dans la base de données UE d\'IA',
                'Gestion des incidents et correction des non-conformités',
                'Conservation des logs pendant 6 mois minimum'
            ],
            governance: 'EXPOSITION CRITIQUE AU NIVEAU BOARD. Les dirigeants encourent des sanctions personnelles en cas de non-conformité. Un système de gouvernance robuste est obligatoire, avec un responsable de la conformité, des audits internes réguliers, et une revue board trimestrielle obligatoire. La responsabilité civile est engagée.',
            strategic: 'ACTION IMMÉDIATE REQUISE. Vous devez immobiliser des ressources significatives pour la mise en conformité avant août 2026. Le non-respect expose à des sanctions jusqu\'à 7% du CA mondial. Cependant, une conformité démontrée deviendra un avantage compétitif majeur face aux concurrents non préparés.'
        }
    };
    
    return contents[tier] || contents.minimal;
}

function updateCountdown() {
    const targetDate = new Date('2026-08-02T00:00:00');
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.textContent = `${months} mois et ${remainingDays} jours restants`;
        }
    }
}

function resetAssessment() {
    state.currentStep = 1;
    state.formData = {
        firmSize: '',
        sector: '',
        services: [],
        aiType: '',
        autonomy: ''
    };
    
    document.getElementById('firm-size').value = '';
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    
    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    Object.values(steps).forEach((step, index) => {
        step.classList.remove('active');
        step.hidden = index !== 0;
        if (index === 0) step.classList.add('active');
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    updateProgress(1);
    
    document.querySelectorAll('.assessment-step').forEach(step => {
        step.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const currentStepNum = parseInt(step.id.split('-')[1]);
                if (currentStepNum < 4) {
                    nextStep(currentStepNum);
                }
            }
        });
    });
});
