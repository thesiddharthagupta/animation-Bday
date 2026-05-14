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

    // --- REDIRECT TO PREVIEW ---
    // In a real app, this would be a clean URL. For local dev, we use ?id=
    window.location.href = `preview.html?id=${surpriseId}`;
};

// Initial Decor
createFloatingDecor();
