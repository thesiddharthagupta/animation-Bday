/**
 * Viewer Logic - Supabase Version
 */

let pages = [];
let currentIdx = 0;
let musicOn = false;

let viewerView, errorView, contentArea, progressBar, bgMusic, clickSfx;

async function init() {
    viewerView = document.getElementById('viewer-view');
    errorView = document.getElementById('error-view');
    contentArea = document.getElementById('content');
    progressBar = document.getElementById('progress');
    bgMusic = document.getElementById('bg-music');
    clickSfx = document.getElementById('click-sound');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        await loadFromSupabase(id);
    } else {
        // No ID provided, redirect to creator
        window.location.href = 'create.html';
    }

    createFloatingDecor();
    createParticles();
}

async function loadFromSupabase(id) {
    try {
        if (typeof _supabase === 'undefined' || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
            throw new Error("Supabase not configured");
        }

        const { data: record, error } = await _supabase
            .from('surprises')
            .select('data')
            .eq('id', id)
            .single();

        if (error || !record) throw new Error("Surprise not found");

        const data = record.data;
        document.body.setAttribute('data-theme', data.theme);
        
        // Generate Story Pages
        pages = generateStory(data);
        
        if (data.music) bgMusic.src = data.music;
        else bgMusic.src = "https://raw.githubusercontent.com/Adit-Kumbhare/Happy-Birthday/main/happy-birthday.mp3";

        viewerView.classList.remove('hidden');
        renderPage(0);
    } catch (e) {
        console.error(e);
        errorView.classList.remove('hidden');
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

    const wishTemplates = {
        friend: "Happy Birthday to a wonderful friend! 🎂",
        bestie: "Happy Birthday Bestie! 🎈 You're family. Love you! 💖",
        girlfriend: "Happy Birthday to my beautiful queen! 🌹 Let's make this day perfect! ❤️✨",
        boyfriend: "Happy Birthday to my amazing man! 🎂 I love you to the moon and back! 🌙💖",
        sister: "Happy Birthday to the best sister ever! 🌸 Partner in crime! 💖✨",
        brother: "Happy Birthday Bro! 🎂 Let's celebrate! 🥳🔥",
        other: "Happy Birthday! 🎂 May this year be your best one yet! 🎈✨"
    };

    const mainImg = d.img || animalAssets[d.animal] || animalAssets.cat;
    const personalWish = d.wish || wishTemplates[d.rel] || wishTemplates.other;

    return [
        {
            id: 1,
            image: animalAssets[d.animal] || animalAssets.cat,
            text: `HEY ${d.name.toUpperCase()} 👀\nREADY FOR A SURPRISE?`,
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
            type: "message",
            content: personalWish
        },
        {
            id: 4,
            type: "post",
            user: `${d.nickname}'s Special Day ✨`,
            image: mainImg,
            likes: "1,245,678",
            caption: `<b>Happy Birthday ${d.name}!</b> 🎂 💖🌸✨`,
            final: true
        }
    ];
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

    let i = 0;
    function typeWriter() {
        if (i < page.content.length) {
            p.innerText += page.content.charAt(i);
            i++;
            setTimeout(typeWriter, 40);
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

function createParticles() {
    const container = document.getElementById('particles-container');
    if(!container) return;
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
