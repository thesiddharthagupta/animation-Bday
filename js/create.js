/**
 * BirthdayBloom — Studio Creator & Interactive Popup Controller
 * Manages Screen 1 Form, Multi-Stage Popup Wishes, and the Playful Moving No Button
 */

let activeSurpriseState = {
    id: '',
    name: 'Aarya',
    nickname: 'Aaryu',
    relationship: 'bestie',
    date: '2025-05-24',
    message: 'Wishing you a day as special as you are! Stay happy always! 💕',
    theme: 'dreamy',
    mascot: 'cat',
    photoUrl: 'assets/aishu_1.png',
    musicUrl: '',
    shareUrl: ''
};

let uploadedPhotoFile = null;
let currentWishStep = 1;
let dodgeCount = 0;
let isAudioActive = false;

document.addEventListener('DOMContentLoaded', () => {
    initAmbientDecor();
    initScreen1Form();
    initThemeAndMascotSelectors();
    initPhotoDropzone();
    initMovingNoButton();
});

// --- 1. SCREEN 1: CREATE FORM & INPUTS ---

function initScreen1Form() {
    const form = document.getElementById('form-create');
    const msgInput = document.getElementById('input-message');
    const counter = document.getElementById('char-counter');

    if (msgInput && counter) {
        msgInput.addEventListener('input', () => {
            counter.innerText = `${msgInput.value.length}/200`;
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameVal = document.getElementById('input-name').value.trim();
            if (!nameVal) {
                showToast("Please enter recipient name! 🌸");
                document.getElementById('input-name').focus();
                return;
            }

            // Sync state
            activeSurpriseState.id = generateCardId();
            activeSurpriseState.name = nameVal;
            activeSurpriseState.nickname = document.getElementById('input-nickname').value.trim() || nameVal;
            activeSurpriseState.relationship = document.getElementById('select-relationship').value;
            activeSurpriseState.date = document.getElementById('input-date').value || '2025-05-24';
            activeSurpriseState.message = msgInput.value.trim() || "Wishing you a day as special as you are! Stay happy always! 💕";

            // Upload photo to Supabase storage if selected
            if (uploadedPhotoFile && window.SupabaseBackend) {
                try {
                    const uploadedUrl = await window.SupabaseBackend.uploadPhoto(uploadedPhotoFile, activeSurpriseState.id);
                    if (uploadedUrl) activeSurpriseState.photoUrl = uploadedUrl;
                } catch (err) {
                    console.warn("Storage upload fallback used");
                }
            }

            // Save to database
            if (window.SupabaseBackend) {
                await window.SupabaseBackend.saveCard(activeSurpriseState);
            }
            localStorage.setItem('birthdaybloom_last_id', activeSurpriseState.id);

            // Generate working share URL
            activeSurpriseState.shareUrl = generateCardShareUrl(activeSurpriseState.id, activeSurpriseState);

            // Populate personalized details across popup cards
            populatePopupCards(activeSurpriseState);

            // Launch Popup Wish Flow
            startPopupFlow();
        });
    }
}

function initThemeAndMascotSelectors() {
    // Theme Chips (Dreamy, Elegant, Cute, Starry)
    const chips = document.querySelectorAll('.theme-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const theme = chip.dataset.theme;
            activeSurpriseState.theme = theme;
            document.body.setAttribute('data-theme', theme);
        });
    });

    // Mascot Cards (Kitty, Bunny, Panda, Puppy)
    const mascots = document.querySelectorAll('.mascot-avatar-card');
    mascots.forEach(card => {
        card.addEventListener('click', () => {
            mascots.forEach(m => m.classList.remove('active'));
            card.classList.add('active');
            activeSurpriseState.mascot = card.dataset.mascot;
        });
    });
}

function initPhotoDropzone() {
    const dropzone = document.getElementById('photo-dropzone');
    const input = document.getElementById('file-photo');
    const thumb = document.getElementById('photo-thumb-img');

    if (!dropzone || !input) return;

    dropzone.addEventListener('click', () => input.click());

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadedPhotoFile = file;
            const reader = new FileReader();
            reader.onload = (evt) => {
                thumb.src = evt.target.result;
                activeSurpriseState.photoUrl = evt.target.result;
                showToast("Photo added! 📸");
            };
            reader.readAsDataURL(file);
        }
    });
}

// --- 2. POPUP WISH EXPERIENCE CONTROLLER ---

function startPopupFlow() {
    document.getElementById('screen-create')?.classList.add('hidden');
    const popupView = document.getElementById('screen-popup-flow');
    if (popupView) {
        popupView.classList.remove('hidden');
        popupView.classList.add('active', 'animate-pop');
    }

    goToStep(1);
    startBackgroundMelody();
}

function resetToCreateScreen() {
    document.getElementById('screen-popup-flow')?.classList.add('hidden');
    document.getElementById('screen-create')?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function populatePopupCards(data) {
    const displayName = data.nickname || data.name || "Aarya";

    // Step 1
    const s1Head = document.getElementById('step-1-headline');
    if (s1Head) s1Head.innerText = `Hey ${displayName} ✨`;

    // Step 3 (Wish 2) photo and mascot
    const s3Photo = document.getElementById('step-3-photo');
    const s3Body = document.getElementById('step-3-body');
    if (s3Photo && data.photoUrl) s3Photo.src = data.photoUrl;
    if (s3Body) s3Body.innerText = `Having you as my ${data.relationship || 'best friend'} is the sweetest gift ever! 🌸`;

    // Step 5 (Reveal)
    const revTitle = document.getElementById('reveal-title');
    const revPhoto = document.getElementById('reveal-photo');
    const revMsg = document.getElementById('reveal-message');
    if (revTitle) revTitle.innerText = `Happy Birthday, ${displayName}!`;
    if (revPhoto && data.photoUrl) revPhoto.src = data.photoUrl;
    if (revMsg && data.message) revMsg.innerText = `"${data.message}"`;
}

function goToStep(stepIndex) {
    currentWishStep = stepIndex;

    // Update Stepper Tabs
    const tabs = document.querySelectorAll('#popup-stepper-tabs .step-tab-btn');
    tabs.forEach(tab => {
        const s = parseInt(tab.dataset.step);
        if (s === stepIndex) {
            tab.classList.add('active');
        } else if (s < stepIndex) {
            tab.classList.add('passed');
            tab.classList.remove('active');
        } else {
            tab.classList.remove('active', 'passed');
        }
    });

    // Switch Visible Card Layer
    for (let i = 1; i <= 5; i++) {
        const card = document.getElementById(`card-step-${i}`);
        if (card) {
            if (i === stepIndex) {
                card.classList.remove('hidden');
                card.classList.add('active', 'animate-pop');
            } else {
                card.classList.add('hidden');
                card.classList.remove('active');
            }
        }
    }

    // Update indicator
    const ind = document.getElementById('page-indicator');
    if (ind) ind.innerText = `Page ${stepIndex} of 5`;

    // Trigger celebration effects on Reveal step
    if (stepIndex === 5) {
        launchCelebrationConfetti();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextWishCard() {
    if (currentWishStep < 5) {
        goToStep(currentWishStep + 1);
    }
}

function prevWishCard() {
    if (currentWishStep > 1) {
        goToStep(currentWishStep - 1);
    }
}

// Bind tabs click
document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('#popup-stepper-tabs .step-tab-btn');
    if (tabBtn) {
        const step = parseInt(tabBtn.dataset.step);
        goToStep(step);
    }
});

// --- 3. MOVING "NO / NEVER" BUTTON BEHAVIOR ---

function initMovingNoButton() {
    const noBtn = document.querySelector("#no-btn");
    const hintTag = document.querySelector("#no-hint-tag");

    if (!noBtn) return;

    function moveNoButton() {
        dodgeCount++;
        const padding = 24;
        const maxX = window.innerWidth - noBtn.offsetWidth - padding;
        const maxY = window.innerHeight - noBtn.offsetHeight - padding;

        noBtn.style.position = "fixed";
        noBtn.style.left = Math.max(padding, Math.random() * maxX) + "px";
        noBtn.style.top = Math.max(padding, Math.random() * maxY) + "px";
        noBtn.style.zIndex = "999";

        // Playful hints
        const quips = ["can't catch me 💨", "too slow! 😜", "nope! 🙈", "just say yes! 💕", "never gonna happen! 🎂"];
        if (hintTag) {
            hintTag.innerText = quips[dodgeCount % quips.length];
        }
    }

    noBtn.addEventListener("mouseenter", moveNoButton);
    noBtn.addEventListener("mouseover", moveNoButton);
    noBtn.addEventListener("touchstart", function (e) {
        e.preventDefault();
        moveNoButton();
    }, { passive: false });
}

// --- 4. AUDIO MELODY & CONFETTI ---

function startBackgroundMelody() {
    if (isAudioActive) return;
    isAudioActive = true;
    const musicBtn = document.getElementById('header-music-btn');
    if (musicBtn) musicBtn.classList.add('playing');

    if (window.musicBoxSynth) {
        window.musicBoxSynth.playHappyBirthday();
    }
}

function toggleAudio() {
    const musicBtn = document.getElementById('header-music-btn');
    if (isAudioActive) {
        isAudioActive = false;
        if (musicBtn) musicBtn.classList.remove('playing');
        window.musicBoxSynth?.stop();
    } else {
        startBackgroundMelody();
    }
}

document.getElementById('header-music-btn')?.addEventListener('click', toggleAudio);

function launchCelebrationConfetti() {
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

// --- 5. SHARE & QR MODAL ---

function openShareModal() {
    const modal = document.getElementById('share-modal');
    const input = document.getElementById('modal-share-link');
    const target = document.getElementById('modal-qr-target');

    const shareUrl = activeSurpriseState.shareUrl || generateCardShareUrl(activeSurpriseState.id || 'DEMO', activeSurpriseState);

    if (input) input.value = shareUrl;

    if (target) {
        target.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            new QRCode(target, {
                text: shareUrl,
                width: 180,
                height: 180,
                colorDark: "#1a0833",
                colorLight: "#ffffff"
            });
        }
    }

    // Configure social buttons
    const wa = document.getElementById('modal-wa-btn');
    const msg = `🎉 Hey ${activeSurpriseState.name}! I made a magical birthday surprise for you! 🎂✨ Open it here: ${shareUrl}`;
    if (wa) wa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    const tg = document.getElementById('modal-tg-btn');
    if (tg) tg.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(msg)}`;

    modal?.classList.remove('hidden');
}

function closeShareModal() {
    document.getElementById('share-modal')?.classList.add('hidden');
}

function copyShareLink() {
    const input = document.getElementById('modal-share-link');
    if (input) {
        navigator.clipboard.writeText(input.value).then(() => {
            showToast("Magic Link Copied to Clipboard! 📋✨");
        });
    }
}

function openPreviewInNewTab() {
    const input = document.getElementById('modal-share-link');
    if (input && input.value) {
        window.open(input.value, '_blank');
    }
}
