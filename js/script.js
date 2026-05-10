/**
 * Cute Birthday Surprise Website - Premium Edition
 * Features: Interactive story, dodging button, Instagram-style post, 
 * background music, floating decorations, and confetti.
 */

const pages = [
    {
        id: 1,
        image: "assets/cat_gift.png",
        text: "READY FOR A SMALL SURPRISE, AISHU? 👀✨",
        buttons: [
            { text: "YES!", action: "next" },
            { text: "NO..", action: "dodge", id: "no-btn" }
        ]
    },
    {
        id: 2,
        image: "assets/aishu_1.png",
        text: "I KNOW YOU LIKE THESE! 💖",
        buttons: [
            { text: "OMG YES! 😍", action: "next" }
        ]
    },
    {
        id: 3,
        image: "assets/cat_confused.png",
        text: "WAIT.. DO YOU LOVE ME? 🥺❤️",
        buttons: [
            { text: "YES!", action: "next" },
            { text: "NO..", action: "dodge", id: "no-btn" }
        ]
    },
    {
        id: 4,
        image: "assets/aishu_2.png",
        text: "YOU ARE SOMEONE SPECIAL! 🧸✨",
        buttons: [
            { text: "Aww, Thank You! 🌸", action: "next" }
        ]
    },
    {
        id: 5,
        image: "assets/cat_gift.png",
        text: "HEHE, I LOVE YOUR SMILE! 😊",
        buttons: [
            { text: "Ofc YES! 💖", action: "next" }
        ]
    },
    {
        id: 6,
        type: "message",
        content: `Hello Aishu, wish you many more happy returns of the day ❤️ Stay blessed and may all your dreams come true.
I’m not able to come, meet you, or give gifts, so this small presentation is for you 😄 Thank you for all your love, care, and the special feelings you’ve given me.
From the first time I saw you till now, you’ve given me so many beautiful memories.
Ninu yavaglu khushi agirbeku 😊 Be happy and healthy always.
Aishu, I love you ♥️ Take care of yourself.`
    },
    {
        id: 7,
        type: "post",
        user: "Aishu's Secret Surprise ✨",
        image: "assets/cat_birthday.png",
        likes: "1,245,678",
        caption: "<b>Happy Birthday Aishu!</b> 🎂 Wishing you a day filled with magic, laughter, and everything that makes you smile. You deserve the world and more! Stay amazing always. 💖🌸✨",
        final: true
    }
];

let currentIdx = 0;
let musicOn = false;

const contentArea = document.getElementById('content');
const progressBar = document.getElementById('progress');
const bgMusic = document.getElementById('bg-music');
const clickSfx = document.getElementById('click-sound');

/**
 * Initialize the app
 */
function init() {
    createFloatingDecor();
    renderPage(0);
}

/**
 * Renders page content based on index
 */
function renderPage(idx) {
    const page = pages[idx];

    // Progress Bar Update
    progressBar.style.width = `${((idx + 1) / pages.length) * 100}%`;

    // Clear and Fade In
    contentArea.innerHTML = '';
    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(15px) scale(0.98)';

    setTimeout(() => {
        if (page.type === 'post') {
            renderPost(page);
        } else if (page.type === 'message') {
            renderMessage(page);
        } else {
            renderStandard(page);
        }
        contentArea.style.opacity = '1';
        contentArea.style.transform = 'translateY(0) scale(1)';
    }, 350);
}

function renderStandard(page) {
    const img = document.createElement('img');
    img.src = page.image;
    img.className = 'cat-image';
    img.alt = 'Cute surprise image';
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
            if (!musicOn) {
                bgMusic.play().catch(() => console.log("Music blocked"));
                musicOn = true;
            }
            if (b.action === 'next') renderPage(++currentIdx);
        };

        if (b.action === 'dodge') {
            btn.onmouseover = () => dodge(btn);
            btn.ontouchstart = (e) => { e.preventDefault(); dodge(btn); };
            btn.onclick = (e) => { e.preventDefault(); dodge(btn); };
            btn.style.transition = 'left 0.2s ease, top 0.2s ease'; // Make it jump smoothly but fast
        }

        group.appendChild(btn);
    });

    contentArea.appendChild(group);
}

function renderMessage(page) {
    const container = document.createElement('div');
    container.className = 'message-slide';

    const p = document.createElement('p');
    p.innerText = page.content;
    container.appendChild(p);

    // Continue button
    const group = document.createElement('div');
    group.className = 'btn-group';
    const btn = document.createElement('button');
    btn.innerText = "Next 🌸";
    btn.onclick = () => {
        playSfx();
        renderPage(++currentIdx);
    };
    group.appendChild(btn);
    container.appendChild(group);

    contentArea.appendChild(container);
}

function renderPost(page) {
    const post = document.createElement('div');
    post.className = 'birthday-post';
    post.innerHTML = `
        <div class="post-header">
            <div class="avatar">${page.user[0]}</div>
            <div class="username">${page.user}</div>
        </div>
        <img src="${page.image}" class="post-img" alt="Birthday celebration">
        <div class="post-info">
            <div class="post-actions">❤️ 💬 🚀</div>
            <span class="likes">${page.likes} likes</span>
            <div class="caption">${page.caption}</div>
        </div>
    `;
    contentArea.appendChild(post);
    startConfetti();
}

/**
 * Playful Dodging Logic
 */
function dodge(btn) {
    // If it's the first time dodging, move it to the body so it breaks out of the card's overflow:hidden
    if (btn.parentElement !== document.body) {
        document.body.appendChild(btn);
    }

    // Roam across the entire window
    const x = Math.random() * (window.innerWidth - btn.offsetWidth - 20);
    const y = Math.random() * (window.innerHeight - btn.offsetHeight - 20);

    btn.style.position = 'fixed';
    btn.style.left = `${Math.max(10, x)}px`;
    btn.style.top = `${Math.max(10, y)}px`;
    btn.style.zIndex = '1000';
}

function playSfx() {
    clickSfx.currentTime = 0;
    clickSfx.play().catch(() => { });
}

/**
 * Background Decorations
 */
function createFloatingDecor() {
    const emojis = ['🎈', '✨', '💖', '🎂', '🌸', '🎁', '💫', '⭐'];
    setInterval(() => {
        const item = document.createElement('div');
        item.className = 'floating-item';
        item.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        item.style.left = Math.random() * 95 + 'vw';
        item.style.animationDuration = (Math.random() * 5 + 6) + 's';
        item.style.fontSize = (Math.random() * 0.8 + 1.2) + 'rem';
        document.body.appendChild(item);
        setTimeout(() => item.remove(), 12000);
    }, 1000);
}

/**
 * Confetti Effect
 */
function startConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = [
        '#ff2d78', '#ff6b9d', '#c77dff', '#ffd700',
        '#00d4ff', '#ff8fa3', '#a855f7', '#fb923c'
    ];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            c.style.width = (Math.random() * 6 + 5) + 'px';
            c.style.height = (Math.random() * 8 + 10) + 'px';
            c.style.animationDuration = (Math.random() * 1.5 + 2.5) + 's';
            c.style.animationDelay = (Math.random() * 0.5) + 's';
            container.appendChild(c);
            setTimeout(() => c.remove(), 5000);
        }, i * 25);
    }
}

window.onload = init;
