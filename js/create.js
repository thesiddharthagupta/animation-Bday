/**
 * Creator Dashboard Logic
 */

const form = document.getElementById('generator-form');
const themeCards = document.querySelectorAll('.theme-card');
const animalCards = document.querySelectorAll('.animal-card');
const loadingScreen = document.getElementById('loading-screen');

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
    
    const surpriseId = generateId();
    const data = {
        name: document.getElementById('name').value,
        nickname: document.getElementById('nickname').value || document.getElementById('name').value,
        rel: document.getElementById('relationship').value,
        desc: document.getElementById('description').value,
        theme: document.querySelector('.theme-card.active').dataset.theme,
        animal: document.querySelector('.animal-card.active').dataset.animal,
        img: document.getElementById('image-url').value,
        music: document.getElementById('music-url').value,
        createdAt: new Date().toISOString()
    };

    // Show Loading
    form.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    const progressInner = document.getElementById('gen-progress');
    
    // Simulate generation steps
    const steps = [20, 50, 80, 100];
    for(let p of steps) {
        progressInner.style.width = `${p}%`;
        await new Promise(r => setTimeout(r, 400));
    }

    // --- SAVE DATA ---
    
    // 1. Save to LocalStorage (Always works for local testing)
    localStorage.setItem(`birthday-${surpriseId}`, JSON.stringify(data));
    console.log("Saved to LocalStorage:", surpriseId);

    // 2. Save to Supabase (If configured)
    if (_supabase) {
        try {
            const { error } = await _supabase
                .from('surprises')
                .insert([{ id: surpriseId, data: data }]);
            if (error) throw error;
            console.log("Saved to Supabase:", surpriseId);
        } catch (err) {
            console.error("Supabase Save Failed:", err.message);
        }
    }

    // --- SHOW RESULT ---
    loadingScreen.classList.add('hidden');
    const resultArea = document.getElementById('result-area');
    const shareLink = document.getElementById('share-link');
    
    // Generate clean link
    const finalUrl = `${window.location.origin}${window.location.pathname.replace('create.html', 'preview.html')}?id=${surpriseId}`;
    
    resultArea.classList.remove('hidden');
    shareLink.innerText = finalUrl;

    // Social Sharing
    const shareText = `Hey! I made a special birthday surprise for you! Check it out here: ${finalUrl}`;
    document.getElementById('whatsapp-btn').href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    document.getElementById('telegram-btn').href = `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent("Check out this birthday surprise! ✨")}`;

    // Copy Button
    document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(finalUrl);
        document.getElementById('copy-btn').innerText = "Copied! ✅";
        setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Link", 2000);
    };

    // Preview Button
    document.getElementById('preview-btn').onclick = () => {
        window.open(finalUrl, '_blank');
    };

    resultArea.scrollIntoView({ behavior: 'smooth' });
};

// Initial Decor
createFloatingDecor();
