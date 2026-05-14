/**
 * Creator Dashboard Logic - Supabase Version
 */

const form = document.getElementById('generator-form');
const themeCards = document.querySelectorAll('.theme-card');
const animalCards = document.querySelectorAll('.animal-card');
const loadingScreen = document.getElementById('loading-screen');
const resultArea = document.getElementById('result-area');

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

form.onsubmit = async (e) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    if (typeof _supabase === 'undefined' || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        alert("Please configure your Supabase URL and Key in js/supabase-config.js first! ✨");
        return;
    }

    const data = {
        name: document.getElementById('name').value,
        nickname: document.getElementById('nickname').value || document.getElementById('name').value,
        rel: document.getElementById('relationship').value,
        desc: document.getElementById('description').value,
        wish: document.getElementById('wish').value,
        theme: document.querySelector('.theme-card.active').dataset.theme,
        animal: document.querySelector('.animal-card.active').dataset.animal,
        img: document.getElementById('image-url').value,
        music: document.getElementById('music-url').value
    };

    form.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    
    const progressInner = document.getElementById('gen-progress');
    const steps = [0.2, 0.4, 0.6, 0.8, 1];
    
    for(let p of steps) {
        progressInner.style.width = `${p * 100}%`;
        await new Promise(r => setTimeout(r, 400));
    }

    try {
        // Generate a random slug for the short link
        const slug = data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
        
        // Save to Supabase
        const { error } = await _supabase
            .from('surprises')
            .insert([
                { id: slug, name: data.name, data: data }
            ]);

        if (error) throw error;

        showResult(slug);
    } catch (err) {
        console.error("Save failed:", err);
        alert("Failed to save to database. Make sure you created the 'surprises' table in Supabase!");
        loadingScreen.classList.add('hidden');
        form.classList.remove('hidden');
    }
};

function showResult(slug) {
    loadingScreen.classList.add('hidden');
    resultArea.classList.remove('hidden');

    const finalUrl = `${window.location.origin}${window.location.pathname.replace('create.html', 'index.html')}?id=${slug}`;
    const shareLink = document.getElementById('share-link');
    shareLink.innerText = finalUrl;

    // Social Sharing
    const text = `Hey! I made a special birthday surprise for you! Check it out here: `;
    document.getElementById('whatsapp-btn').href = `https://wa.me/?text=${encodeURIComponent(text + finalUrl)}`;
    document.getElementById('telegram-btn').href = `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(text)}`;

    // QR Code
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: finalUrl,
        width: 128,
        height: 128,
        colorDark: "#ff2d78",
        colorLight: "#ffffff",
    });

    document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(finalUrl);
        document.getElementById('copy-btn').innerText = "Copied! ✅";
        setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Link", 2000);
    };

    document.getElementById('preview-btn').onclick = () => {
        window.location.href = finalUrl;
    };
}
