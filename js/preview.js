/**
 * BirthdayBloom — Standalone Recipient Popup Preview Controller
 * Manages the full 5-stage wish popup journey, moving No button, and grand Reveal
 */

let pCurrentStep = 1;
let pDodgeCount = 0;
let pCardData = null;

document.addEventListener('DOMContentLoaded', async () => {
    initAmbientDecor();
    await initStandalonePreview();
    initPreviewMovingNoButton();
});

async function initStandalonePreview() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    const encodedPayload = urlParams.get('d');

    const loadingEl = document.getElementById('preview-loading');
    const errorEl = document.getElementById('preview-error');
    const sceneEl = document.getElementById('preview-scene');

    try {
        let data = null;

        if (cardId) {
            try {
                const apiRes = await fetch(`/api/cards/${encodeURIComponent(cardId)}`);
                if (apiRes.ok) {
                    const apiData = await apiRes.json();
                    if (apiData.card) data = apiData.card;
                }
            } catch (apiErr) {
                console.log("Python backend fetch note:", apiErr);
            }
        }

        if (!data && (cardId || encodedPayload)) {
            if (window.SupabaseBackend) {
                data = await window.SupabaseBackend.loadCard(cardId, encodedPayload);
            }
        }

        if (!data || !data.name) {
            const lastId = localStorage.getItem('birthdaybloom_last_id');
            const myCards = JSON.parse(localStorage.getItem('birthdaybloom_my_cards') || '[]');

            if (lastId && localStorage.getItem(`birthdaybloom_${lastId}`)) {
                data = JSON.parse(localStorage.getItem(`birthdaybloom_${lastId}`));
            } else if (myCards.length > 0) {
                data = myCards[0];
            } else {
                // Default showcase celebration
                data = {
                    id: 'DEMO',
                    name: 'Aarya',
                    nickname: 'Aaryu',
                    relationship: 'bestie',
                    date: '2025-05-24',
                    message: 'May your days be as bright, beautiful and magical as you are! Here\'s to more laughter, bigger dreams and a year full of happiness! 💕',
                    theme: 'dreamy',
                    mascot: 'cat',
                    photoUrl: 'assets/aishu_1.png'
                };
            }
        }

        if (data && data.name) {
            pCardData = data;
            renderRecipientSurprise(data);
        } else {
            loadingEl?.classList.add('hidden');
            errorEl?.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Preview load error:", err);
        loadingEl?.classList.add('hidden');
        errorEl?.classList.remove('hidden');
    }
}

function renderRecipientSurprise(data) {
    document.body.setAttribute('data-theme', data.theme || 'dreamy');

    document.getElementById('preview-loading')?.classList.add('hidden');
    document.getElementById('preview-error')?.classList.add('hidden');
    const sceneEl = document.getElementById('preview-scene');
    if (sceneEl) {
        sceneEl.classList.remove('hidden');
        sceneEl.classList.add('active', 'animate-pop');
    }

    const displayName = data.nickname || data.name || "Aarya";

    // Step 1
    const s1Head = document.getElementById('pstep-1-headline');
    if (s1Head) s1Head.innerText = `Hey ${displayName} ✨`;

    // Step 3 (Wish 2) photo
    const s3Photo = document.getElementById('pstep-3-photo');
    const s3Body = document.getElementById('pstep-3-body');
    if (s3Photo && data.photoUrl) s3Photo.src = data.photoUrl;
    if (s3Body) s3Body.innerText = `Having you as my ${data.relationship || 'best friend'} is the sweetest gift ever! 🌸`;

    // Step 5 (Reveal)
    const revTitle = document.getElementById('preveal-title');
    const revPhoto = document.getElementById('preveal-photo');
    const revMsg = document.getElementById('preveal-message');
    if (revTitle) revTitle.innerText = `Happy Birthday, ${displayName}!`;
    if (revPhoto && data.photoUrl) revPhoto.src = data.photoUrl;
    if (revMsg && data.message) revMsg.innerText = `"${data.message}"`;

    pGoToStep(1);

    // Start background music box chime
    setTimeout(() => {
        window.musicBoxSynth?.playHappyBirthday();
    }, 500);
}

function pGoToStep(step) {
    pCurrentStep = step;

    // Update Stepper Tabs
    const tabs = document.querySelectorAll('#preview-stepper-tabs .step-tab-btn');
    tabs.forEach(tab => {
        const s = parseInt(tab.dataset.step);
        if (s === step) {
            tab.classList.add('active');
        } else if (s < step) {
            tab.classList.add('passed');
            tab.classList.remove('active');
        } else {
            tab.classList.remove('active', 'passed');
        }
    });

    // Switch Visible Card Layer
    for (let i = 1; i <= 5; i++) {
        const card = document.getElementById(`pcard-step-${i}`);
        if (card) {
            if (i === step) {
                card.classList.remove('hidden');
                card.classList.add('active', 'animate-pop');
            } else {
                card.classList.add('hidden');
                card.classList.remove('active');
            }
        }
    }

    const ind = document.getElementById('p-page-indicator');
    if (ind) ind.innerText = `Page ${step} of 5`;

    if (step === 5) {
        launchPreviewConfetti();
        const revMsg = document.getElementById('preveal-message');
        if (revMsg && pCardData && pCardData.message) {
            typewritePreviewText(revMsg, `"${pCardData.message}"`);
        }
        window.birthdayAudio?.bindControls();
        setTimeout(() => {
            window.birthdayAudio?.play();
        }, 300);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pShareCard() {
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast("Shareable link copied to clipboard! 🌸");
    } else {
        showToast("Share link ready! 🌸");
    }
    openQrModal(url, pCardData?.name || "Aarya");
}

function typewritePreviewText(element, text, speed = 25) {
    if (!element) return;
    if (element._twInterval) clearInterval(element._twInterval);
    element.textContent = '';
    let idx = 0;
    element._twInterval = setInterval(() => {
        if (idx < text.length) {
            element.textContent += text.charAt(idx);
            idx++;
        } else {
            clearInterval(element._twInterval);
            element._twInterval = null;
        }
    }, speed);
}

function pNextWish() {
    if (pCurrentStep < 5) pGoToStep(pCurrentStep + 1);
}

function pPrevWish() {
    if (pCurrentStep > 1) pGoToStep(pCurrentStep - 1);
}

// Bind tabs click
document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('#preview-stepper-tabs .step-tab-btn');
    if (tabBtn) {
        const step = parseInt(tabBtn.dataset.step);
        pGoToStep(step);
    }
});

// --- MOVING NO BUTTON FOR PREVIEW ---
function initPreviewMovingNoButton() {
    const noBtn = document.querySelector("#preview-scene #no-btn");
    const hintTag = document.querySelector("#preview-scene #p-no-hint-tag");

    if (!noBtn) return;

    function moveNoButton() {
        pDodgeCount++;
        const padding = 24;
        const maxX = window.innerWidth - noBtn.offsetWidth - padding;
        const maxY = window.innerHeight - noBtn.offsetHeight - padding;

        noBtn.style.position = "fixed";
        noBtn.style.left = Math.max(padding, Math.random() * maxX) + "px";
        noBtn.style.top = Math.max(padding, Math.random() * maxY) + "px";
        noBtn.style.zIndex = "999";

        const quips = ["can't catch me 💨", "too slow! 😜", "nope! 🙈", "just say yes! 💕", "never gonna happen! 🎂"];
        if (hintTag) {
            hintTag.innerText = quips[pDodgeCount % quips.length];
        }
    }

    noBtn.addEventListener("mouseenter", moveNoButton);
    noBtn.addEventListener("mouseover", moveNoButton);
    noBtn.addEventListener("touchstart", function (e) {
        e.preventDefault();
        moveNoButton();
    }, { passive: false });
}

function launchPreviewConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#ff2a85', '#b388ff', '#ffd166', '#00f5d4', '#ff66c4', '#ffffff'];
    const shapes = ['rect', 'star', 'circle'];

    for (let i = 0; i < 90; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            c.className = `confetti confetti-${shape}`;
            c.style.left = `${Math.random() * 100}vw`;
            c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            c.style.animationDuration = `${Math.random() * 2.5 + 2.5}s`;
            c.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(c);
            setTimeout(() => c.remove(), 5500);
        }, i * 35);
    }
}
