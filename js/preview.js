/**
 * Preview Viewer Logic
 */

let pages = [];
let currentIdx = 0;
let musicOn = false;

const viewerView = document.getElementById('viewer-view');
const errorView = document.getElementById('error-view');
const contentArea = document.getElementById('content');
const progressBar = document.getElementById('progress');
const bgMusic = document.getElementById('bg-music');
const clickSfx = document.getElementById('click-sound');

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = 'create.html';
        return;
    }

    let data = null;

    // 1. Try LocalStorage (Fastest for the creator)
    const localData = localStorage.getItem(`birthday-${id}`);
    if (localData) {
        data = JSON.parse(localData);
        console.log("Loaded from LocalStorage");
    }

    // 2. Try Supabase (If not in local or if shared with friend)
    if (!data && _supabase) {
        try {
            const { data: record, error } = await _supabase
                .from('surprises')
                .select('data')
                .eq('id', id)
                .single();
            if (record) data = record.data;
            console.log("Loaded from Supabase");
        } catch (err) {
            console.error("Supabase Load Failed:", err.message);
        }
    }

    if (data) {
        setupViewer(data);
    } else {
        errorView.classList.remove('hidden');
    }

    createFloatingDecor();
    createParticles();
}

function setupViewer(d) {
    document.body.setAttribute('data-theme', d.theme);
    
    // Auto-generate story based on relationship
    pages = generateStory(d);
    
    if (d.music) bgMusic.src = d.music;
    else bgMusic.src = "https://raw.githubusercontent.com/Adit-Kumbhare/Happy-Birthday/main/happy-birthday.mp3";

    viewerView.classList.remove('hidden');
    renderPage(0);
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
            content: `Happy Birthday ${d.nickname}! 🎂\n\n${d.desc || "You're incredible!"}\n\nStay amazing always! ❤️`
        },
        {
            id: 4,
            type: "post",
            user: `${d.nickname}'s Special Day ✨`,
            image: mainImg,
            likes: "1,245,678",
            caption: `<b>Happy Birthday ${d.name}!</b> 🎂 Wishing you the most magical day ever. 💖🌸✨`,
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
