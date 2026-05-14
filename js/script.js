/**
 * AI Birthday Surprise Generator - Unified App
 * Handlers: Dashboard UI, Story Generation, and Playback Engine.
 */

// --- Global State ---
let pages = [];
let currentIdx = 0;
let musicOn = false;

// --- DOM Elements (Initialized in init) ---
let creatorView, viewerView, loadingScreen, contentArea, progressBar, bgMusic, clickSfx;

// --- Initialization ---
function init() {
    // Initialize elements
    creatorView = document.getElementById('creator-view');
    viewerView = document.getElementById('viewer-view');
    loadingScreen = document.getElementById('loading-screen');
    contentArea = document.getElementById('content');
    progressBar = document.getElementById('progress');
    bgMusic = document.getElementById('bg-music');
    clickSfx = document.getElementById('click-sound');

    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('d');
    const theme = urlParams.get('t');

    console.log("App Init - Mode:", data ? "Viewer" : "Creator");

    if (data) {
        // Mode: VIEWER
        creatorView.classList.add('hidden');
        viewerView.classList.remove('hidden');
        if (theme) document.body.setAttribute('data-theme', theme);
        loadViewer(data);
    } else {
        // Mode: CREATOR
        creatorView.classList.remove('hidden');
        viewerView.classList.add('hidden');
        setupDashboard();
    }

    createFloatingDecor();
    createParticles();
}

// --- Background Magic ---
function createParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
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

// --- Dashboard Logic ---
function setupDashboard() {
    const form = document.getElementById('generator-form');
    const themeCards = document.querySelectorAll('.theme-card');
    const animalCards = document.querySelectorAll('.animal-card');

    // Theme Selection
    themeCards.forEach(card => {
        card.onclick = () => {
            themeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            document.body.setAttribute('data-theme', card.dataset.theme);
        };
    });

    // Animal Selection
    animalCards.forEach(card => {
        card.onclick = () => {
            animalCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        };
    });

    // Form Submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted!");

        try {
            const nameEl = document.getElementById('name');
            const themeEl = document.querySelector('.theme-card.active');
            const animalEl = document.querySelector('.animal-card.active');

            if (!nameEl || !nameEl.value) {
                alert("Please enter a name first! ✨");
                return;
            }

            const data = {
                name: nameEl.value,
                nickname: document.getElementById('nickname').value || nameEl.value,
                rel: document.getElementById('relationship').value,
                desc: document.getElementById('description').value,
                theme: themeEl ? themeEl.dataset.theme : 'cute',
                animal: animalEl ? animalEl.dataset.animal : 'cat',
                img: document.getElementById('image-url').value,
                music: document.getElementById('music-url').value
            };

            await startGenerationFlow(data);
        } catch (err) {
            console.error("Submit handler error:", err);
            alert("Error: " + err.message);
        }
    };
}

async function startGenerationFlow(data) {
    console.log("Starting Generation Flow...", data);
    
    if (!creatorView || !loadingScreen) {
        console.error("Critical UI elements missing!");
        return;
    }

    creatorView.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    
    const progressInner = document.getElementById('gen-progress');
    const loadingText = document.getElementById('loading-text');
    const steps = [
        "Analyzing relationships...",
        "Crafting cute messages...",
        "Selecting the perfect vibe...",
        "Generating magic link...",
        "Almost ready! ✨"
    ];

    for (let i = 0; i < steps.length; i++) {
        if (loadingText) loadingText.innerText = steps[i];
        if (progressInner) progressInner.style.width = `${((i + 1) / steps.length) * 100}%`;
        await new Promise(r => setTimeout(r, 600));
    }

    try {
        const generatedPages = generateStory(data);
        const json = JSON.stringify(generatedPages);
        
        // Robust Unicode Encoding
        const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
        
        // Safer URL construction
        const currentUrl = window.location.href.split('?')[0];
        const finalUrl = `${currentUrl}?d=${encodeURIComponent(encoded)}&t=${data.theme}`;
        
        console.log("Generated Link:", finalUrl);

        loadingScreen.classList.add('hidden');
        creatorView.classList.remove('hidden');
        
        const resultArea = document.getElementById('result-area');
        const shareLink = document.getElementById('share-link');
        
        if (resultArea && shareLink) {
            resultArea.classList.remove('hidden');
            shareLink.innerText = finalUrl;
            setTimeout(() => {
                resultArea.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

        document.getElementById('copy-btn').onclick = () => {
            navigator.clipboard.writeText(finalUrl);
            document.getElementById('copy-btn').innerText = "Copied! ✅";
            setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Link", 2000);
        };

        document.getElementById('preview-btn').onclick = () => {
            window.location.href = finalUrl;
        };
    } catch (err) {
        console.error("Generation failed:", err);
        alert("Generation failed: " + err.message);
        loadingScreen.classList.add('hidden');
        creatorView.classList.remove('hidden');
    }
}

function generateStory(d) {
    const animalAssets = {
        cat: "assets/cat_gift.png",
        bunny: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/v8xKVYYZ4H6Y7tD59N/giphy.gif",
        panda: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/7NoNw4pMNTvgc/giphy.gif",
        dog: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/v8xKVYYZ4H6Y7tD59N/giphy.gif",
        bear: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/v8xKVYYZ4H6Y7tD59N/giphy.gif"
    };

    const mainImg = d.img || animalAssets[d.animal] || animalAssets.cat;

    const story = [
        {
            id: 1,
            image: animalAssets[d.animal] || animalAssets.cat,
            text: `HEY ${d.name.toUpperCase()} 👀\nREADY FOR SOMETHING SPECIAL?`,
            buttons: [{ text: "YES!", action: "next" }, { text: "NO..", action: "dodge", id: "no-btn" }]
        },
        {
            id: 2,
            image: mainImg,
            text: `YOU ARE ONE OF THE MOST ${d.desc ? d.desc.toUpperCase() : 'AMAZING'} PEOPLE 💖`,
            buttons: [{ text: "How much? 😍", action: "next" }]
        },
        {
            id: 3,
            image: mainImg,
            text: `THE WORLD IS BETTER WITH YOUR SMILE ✨`,
            buttons: [{ text: "Aww! 🌸", action: "next" }]
        },
        {
            id: 4,
            type: "message",
            content: `Happy Birthday ${d.nickname}! 🎂\n\nYou deserve a day as wonderful as you are. Thank you for being such an incredible ${d.rel}. Stay amazing always! ❤️`
        },
        {
            id: 5,
            type: "post",
            user: `${d.nickname}'s Special Day ✨`,
            image: mainImg,
            likes: "1,245,678",
            caption: `<b>Happy Birthday ${d.name}!</b> 🎂 Wishing you the most magical day ever. You are truly one in a million. 💖🌸✨`,
            music: d.music,
            final: true
        }
    ];

    return story;
}

// --- Viewer Logic ---
function loadViewer(data) {
    try {
        console.log("Loading Viewer with data length:", data.length);
        const base64 = data.replace(/ /g, '+');
        
        // Robust Unicode Decoding
        const decodedStr = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(decodedStr);
        console.log("Viewer Data Decoded:", decoded);
        
        if (Array.isArray(decoded)) {
            pages = decoded;
            const finalPage = pages.find(p => p.final);
            if (finalPage && finalPage.music) bgMusic.src = finalPage.music;
            renderPage(0);
        }
    } catch (e) {
        console.error("Viewer error:", e);
        alert("Failed to load the surprise. The link might be broken.");
    }
}

function renderPage(idx) {
    const page = pages[idx];
    progressBar.style.width = `${((idx + 1) / pages.length) * 100}%`;
    contentArea.innerHTML = '';
    contentArea.style.opacity = '0';

    setTimeout(() => {
        if (page.type === 'post') renderPost(page);
        else if (page.type === 'message') renderMessage(page);
        else renderStandard(page);
        contentArea.style.opacity = '1';
    }, 350);
}

function renderStandard(page) {
    const img = document.createElement('img');
    img.src = page.image;
    img.className = 'cat-image';
    contentArea.appendChild(img);

    const h1 = document.createElement('h1');
    h1.innerText = page.text;
    contentArea.appendChild(h1);

    const group = document.createElement('div');
    group.className = 'btn-group';

    page.buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.innerText = b.text;
        if (b.id) btn.id = b.id;
        btn.onclick = () => {
            playSfx();
            if (!musicOn) { bgMusic.play().catch(() => {}); musicOn = true; }
            if (b.action === 'next') renderPage(++currentIdx);
        };
        if (b.action === 'dodge') {
            btn.onmouseover = () => dodge(btn);
            btn.style.transition = 'left 0.2s ease, top 0.2s ease';
        }
        group.appendChild(btn);
    });
    contentArea.appendChild(group);
}

function renderMessage(page) {
    const container = document.createElement('div');
    container.className = 'message-slide';
    
    const p = document.createElement('p');
    p.id = 'typewriter-text';
    container.appendChild(p);
    
    const btn = document.createElement('button');
    btn.innerText = "Next 🌸";
    btn.style.opacity = '0';
    btn.onclick = () => { playSfx(); renderPage(++currentIdx); };
    container.appendChild(btn);
    
    contentArea.appendChild(container);

    // Typewriter Logic
    let i = 0;
    const speed = 40;
    function typeWriter() {
        if (i < page.content.length) {
            p.innerText += page.content.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else {
            btn.style.opacity = '1';
            btn.style.transition = 'opacity 0.5s ease';
        }
    }
    typeWriter();
}

function renderPost(page) {
    const post = document.createElement('div');
    post.className = 'birthday-post';
    post.innerHTML = `
        <div class="post-header">
            <div class="avatar">${page.user[0]}</div>
            <div class="username">${page.user}</div>
        </div>
        <img src="${page.image}" class="post-img">
        <div class="post-info">
            <div class="post-actions">❤️ 💬 🚀</div>
            <span class="likes">${page.likes} likes</span>
            <div class="caption">${page.caption}</div>
        </div>
    `;
    contentArea.appendChild(post);
    startConfetti();
}

// --- Utils ---
function dodge(btn) {
    if (btn.parentElement !== document.body) document.body.appendChild(btn);
    const x = Math.random() * (window.innerWidth - btn.offsetWidth - 20);
    const y = Math.random() * (window.innerHeight - btn.offsetHeight - 20);
    btn.style.position = 'fixed';
    btn.style.left = `${Math.max(10, x)}px`;
    btn.style.top = `${Math.max(10, y)}px`;
    btn.style.zIndex = '1000';
}

function playSfx() { clickSfx.currentTime = 0; clickSfx.play().catch(() => {}); }

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

function startConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.backgroundColor = ['#ff2d78', '#c77dff', '#ffd700'][Math.floor(Math.random() * 3)];
            container.appendChild(c);
            setTimeout(() => c.remove(), 5000);
        }, i * 25);
    }
}

window.onload = init;
