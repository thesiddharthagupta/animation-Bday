/**
 * BirthdayBloom ✨ — Global App Utilities & Ambient System
 * Includes QR Code Modal, Toast Manager, Audio Engine, and Robust URL Sharing
 */

// --- 1. UNIQUE CARD ID & DATA SERIALIZATION ---

function generateCardId() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

/**
 * Filter large binary blobs out of URL query payload so URLs stay clean & under 2KB
 */
function preparePortableCardData(cardData) {
    if (!cardData) return {};
    const copy = { ...cardData };
    // If photoUrl is a huge data URI, strip it from the URL string (it lives in localStorage & Supabase)
    if (copy.photoUrl && copy.photoUrl.startsWith('data:')) {
        delete copy.photoUrl;
    }
    delete copy.shareUrl;
    return copy;
}

/**
 * Unicode-safe Base64 serialization for sharing without backend dependencies
 */
function encodeSurpriseData(data) {
    try {
        const jsonStr = JSON.stringify(data);
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        let binary = '';
        for (let i = 0; i < utf8Bytes.length; i++) {
            binary += String.fromCharCode(utf8Bytes[i]);
        }
        return encodeURIComponent(btoa(binary));
    } catch (e) {
        console.error("Encoding error:", e);
        return '';
    }
}

function decodeSurpriseData(encodedStr) {
    try {
        if (!encodedStr) return null;
        const binary = atob(decodeURIComponent(encodedStr));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const jsonStr = new TextDecoder().decode(bytes);
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Decoding error:", e);
        return null;
    }
}

/**
 * Builds public shareable link reliably on localhost, custom domains, or file://
 */
function generateCardShareUrl(cardId, cardData) {
    try {
        const url = new URL(window.location.href);
        let path = url.pathname;

        if (path.endsWith('index.html') || path.endsWith('create.html')) {
            path = path.replace(/(index|create)\.html$/, 'preview.html');
        } else if (path.endsWith('/')) {
            path += 'preview.html';
        } else if (!path.endsWith('preview.html')) {
            path = path.substring(0, path.lastIndexOf('/') + 1) + 'preview.html';
        }

        url.pathname = path;
        url.search = '';
        url.searchParams.set('id', cardId);

        if (cardData) {
            const portable = preparePortableCardData(cardData);
            const encoded = encodeSurpriseData(portable);
            // Only attach if safely under 2000 characters
            if (encoded && encoded.length < 2000) {
                url.searchParams.set('d', encoded);
            }
        }

        return url.toString();
    } catch (e) {
        return `preview.html?id=${cardId}`;
    }
}

// --- 2. TOAST NOTIFICATIONS ---

function showToast(message, duration = 3800) {
    let toast = document.getElementById('bb-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'bb-toast';
        toast.className = 'bb-toast';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">✨</span>
            <span class="toast-text">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.classList.remove('show')">×</button>
        </div>
    `;

    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// --- 3. QR CODE MODAL ---

function openQrModal(shareUrl, recipientName) {
    let modal = document.getElementById('qr-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'qr-modal';
        modal.className = 'bb-modal-overlay hidden';
        modal.innerHTML = `
            <div class="bb-modal-card glass-card">
                <button class="modal-close-btn" id="modal-close-btn">&times;</button>
                <div class="modal-header">
                    <span class="modal-badge">📱 Scan & Surprise</span>
                    <h3 id="qr-modal-title">Magic Birthday QR</h3>
                    <p>Scan with any phone camera to instantly open the surprise!</p>
                </div>
                <div class="qr-code-wrapper" id="qr-code-target"></div>
                <div class="modal-actions">
                    <button class="glow-btn" id="qr-download-btn">Download QR Code</button>
                    <button class="action-pill-btn" id="qr-copy-btn">Copy Share Link</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#modal-close-btn').onclick = () => modal.classList.add('hidden');
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        };
    }

    document.getElementById('qr-modal-title').innerText = recipientName ? `Magic QR for ${recipientName} 🎂` : 'Magic Birthday QR';

    const target = document.getElementById('qr-code-target');
    target.innerHTML = '';

    // Generate QR using QRCode library or fallback
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(target, {
                text: shareUrl,
                width: 200,
                height: 200,
                colorDark: "#1a0833",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        } catch (e) {
            renderQrImageFallback(target, shareUrl);
        }
    } else {
        renderQrImageFallback(target, shareUrl);
    }

    document.getElementById('qr-copy-btn').onclick = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast("Magic link copied to clipboard! 📋");
        });
    };

    document.getElementById('qr-download-btn').onclick = () => {
        const canvas = target.querySelector('canvas');
        const img = target.querySelector('img');
        let dataUrl = null;

        if (canvas) {
            dataUrl = canvas.toDataURL('image/png');
        } else if (img && img.src && !img.src.startsWith('http')) {
            dataUrl = img.src;
        }

        if (dataUrl) {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `BirthdayBloom_${(recipientName || 'Card').replace(/\s+/g, '_')}_QR.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast("QR code downloaded! 📲");
        } else {
            showToast("QR ready! Take a screenshot to share 📸");
        }
    };

    modal.classList.remove('hidden');
}

function renderQrImageFallback(target, shareUrl) {
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;
    img.alt = "Birthday QR Code";
    img.style.borderRadius = "12px";
    img.style.maxWidth = "200px";
    target.appendChild(img);
}

// --- 4. AMBIENT VISUAL DECORATIONS ---

function initAmbientDecor() {
    const emojis = ['🎈', '✨', '💖', '🎂', '🌸', '🎁', '💫', '🧁', '🥳', '⭐', '🎀', '🎉'];
    
    // Spawn floating emoji periodically
    setInterval(() => {
        if (!document.body) return;
        const item = document.createElement('div');
        item.className = 'floating-item';
        item.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        item.style.left = Math.random() * 92 + 'vw';
        item.style.fontSize = (Math.random() * 1.2 + 1.1) + 'rem';
        item.style.animationDuration = (Math.random() * 5 + 7) + 's';
        item.setAttribute('aria-hidden', 'true');
        document.body.appendChild(item);
        setTimeout(() => item.remove(), 12000);
    }, 1300);

    // Initialize particles
    const container = document.getElementById('particles-container');
    if (container) {
        container.innerHTML = '';
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 6 + 3;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}vw`;
            p.style.top = `${Math.random() * 100}vh`;
            p.style.animationDelay = `${Math.random() * 8}s`;
            p.style.animationDuration = `${Math.random() * 12 + 8}s`;
            container.appendChild(p);
        }
    }
}

// --- 5. AUDIO SYNTHESIZER (ZERO-DEPENDENCY MUSIC BOX) ---

class MusicBoxSynthesizer {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.timer = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playNote(freq, start, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
    }

    playHappyBirthday() {
        this.init();
        if (!this.ctx) return;
        this.isPlaying = true;

        const notes = [
            { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 1.2 },
            { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.2 },
            { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 523.25, d: 0.7 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 0.7 }, { f: 293.66, d: 1.0 },
            { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.4 }
        ];

        let time = this.ctx.currentTime + 0.1;
        notes.forEach(n => {
            this.playNote(n.f, time, n.d * 1.3);
            time += n.d * 0.9;
        });

        const totalDuration = (time - this.ctx.currentTime) * 1000;
        this.timer = setTimeout(() => {
            if (this.isPlaying) {
                this.playHappyBirthday();
            }
        }, totalDuration + 1500);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) clearTimeout(this.timer);
    }
}

window.musicBoxSynth = new MusicBoxSynthesizer();
