/**
 * Global Configuration & Utils
 */

// Placeholder for Supabase - User should fill these
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let _supabase = null;
try {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.warn("Supabase not initialized:", e.message);
}

// Unique ID Generator
function generateId() {
    return Math.random().toString(36).substring(2, 8);
}

// Background Decoration
function createFloatingDecor() {
    const emojis = ['🎈', '✨', '💖', '🎂', '🌸', '🎁', '💫', '⭐'];
    setInterval(() => {
        const item = document.createElement('div');
        item.className = 'floating-item';
        item.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        item.style.left = Math.random() * 95 + 'vw';
        item.style.animationDuration = (Math.random() * 5 + 6) + 's';
        document.body.appendChild(item);
        setTimeout(() => item.remove(), 12000);
    }, 1000);
}

function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 8 + 4;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `${Math.random() * 100}vh`;
        p.style.animationDelay = `${Math.random() * 10}s`;
        p.style.animationDuration = `${Math.random() * 10 + 10}s`;
        container.appendChild(p);
    }
}
