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

    // Show Loading with AI-like status
    form.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    const progressInner = document.getElementById('gen-progress');
    const loadingText = document.getElementById('loading-text');
    
    // AI Status Updates
    const statusMessages = [
        "Analyzing relationship dynamics...",
        "Scanning personality keywords...",
        "Crafting emotional build-up...",
        "Generating personalized magic...",
        "Finalizing your surprise! ✨"
    ];

    const steps = [20, 40, 60, 80, 100];
    for(let i=0; i<steps.length; i++) {
        progressInner.style.width = `${steps[i]}%`;
        loadingText.innerText = statusMessages[i];
        await new Promise(r => setTimeout(r, 600));
    }

    // --- SAVE DATA ---
    
    // 1. Save to LocalStorage (Always works for local testing)
    localStorage.setItem(`birthday-${surpriseId}`, JSON.stringify(data));
    console.log("Saved to LocalStorage:", surpriseId);

    // 2. Save to Supabase (If configured)
    let saveSuccessful = false;
    if (isCloudReady && _supabase) {
        try {
            const { error } = await _supabase
                .from('surprises')
                .insert([{ id: surpriseId, data: data }]);
            if (error) throw error;
            console.log("Saved to Supabase:", surpriseId);
            saveSuccessful = true;
        } catch (err) {
            console.error("Supabase Save Failed:", err.message);
        }
    }

    // --- SHOW RESULT ---
    loadingScreen.classList.add('hidden');
    const resultArea = document.getElementById('result-area');
    const shareLink = document.getElementById('share-link');
    
    // Generate clean link using the robust utility
    const finalUrl = generateShareableLink(surpriseId);
    
    resultArea.classList.remove('hidden');
    shareLink.innerText = finalUrl;

    // Cloud Warning Logic
    const warningEl = document.getElementById('cloud-warning');
    if (!saveSuccessful) {
        warningEl.classList.remove('hidden');
        warningEl.innerHTML = `
            <div style="background: rgba(255, 166, 0, 0.1); border: 1px solid orange; padding: 10px; border-radius: 12px; font-size: 0.8rem; margin: 10px 0; color: #ffcc00;">
                ⚠️ <b>Local Only:</b> Supabase is not configured. This link will only work on <b>your device</b>. Set your API keys in <code>js/app.js</code> to share with others!
            </div>
        `;
    } else {
        warningEl.classList.add('hidden');
    }

    // Social Sharing
    const shareText = `Hey! I made a special birthday surprise for you! Check it out here: ${finalUrl}`;
    document.getElementById('whatsapp-btn').href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    document.getElementById('telegram-btn').href = `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent("Check out this birthday surprise! ✨")}`;

    // Copy Button
    document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(finalUrl).then(() => {
            const originalText = document.getElementById('copy-btn').innerText;
            document.getElementById('copy-btn').innerText = "Copied! ✅";
            document.getElementById('copy-btn').style.background = "var(--accent)";
            setTimeout(() => {
                document.getElementById('copy-btn').innerText = originalText;
                document.getElementById('copy-btn').style.background = "";
            }, 2000);
        });
    };

    // Preview Button
    document.getElementById('preview-btn').onclick = () => {
        window.open(finalUrl, '_blank');
    };

    resultArea.scrollIntoView({ behavior: 'smooth' });
};

// Initial Decor
createFloatingDecor();
