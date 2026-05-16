/**
 * Global Configuration & Utils
 * Centralized for both Creator and Viewer
 */

// --- 1. CONFIGURATION ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let _supabase = null;
let isCloudReady = false;

try {
    if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isCloudReady = true;
    }
} catch (e) {
    console.warn("Supabase not initialized:", e.message);
}

// --- 2. UTILITIES ---

/**
 * Robust URL Generator
 * Works across file://, localhost, and deployed environments
 */
function generateShareableLink(id) {
    const url = new URL(window.location.href);
    
    // If we are on create.html or index.html, point to preview.html
    let path = url.pathname;
    if (path.endsWith('create.html') || path.endsWith('index.html')) {
        path = path.replace(/(create|index)\.html$/, 'preview.html');
    } else if (path.endsWith('/')) {
        path += 'preview.html';
    } else {
        // If it's just a folder like /bday, we append preview.html
        path = path.substring(0, path.lastIndexOf('/') + 1) + 'preview.html';
    }

    url.pathname = path;
    url.searchParams.set('id', id);
    return url.toString();
}

/**
 * Unique ID Generator
 */
function generateId() {
    return Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
}

// --- 3. COMMON UI EFFECTS ---

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
