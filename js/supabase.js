/**
 * BirthdayBloom — Supabase Backend Integration
 * Handles Supabase Database CRUD and Storage uploads.
 * Gracefully falls back to LocalStorage & URL encoding when Supabase keys are not set or offline.
 */

const SUPABASE_CONFIG = {
    // Replace with your Supabase Project details
    URL: 'https://YOUR_PROJECT_ID.supabase.co',
    ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
    TABLE_NAME: 'birthday_cards',
    STORAGE_BUCKET: 'birthday-photos'
};

let supabaseClient = null;
let isSupabaseConfigured = false;

// Initialize Supabase Client if library and keys are present
try {
    if (typeof supabase !== 'undefined' && 
        SUPABASE_CONFIG.URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
        SUPABASE_CONFIG.ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
        isSupabaseConfigured = true;
        console.log("BirthdayBloom: Supabase Backend Connected ✅");
    } else {
        console.log("BirthdayBloom: Operating in serverless client-mode with LocalStorage & portable URL encoding.");
    }
} catch (err) {
    console.warn("BirthdayBloom: Supabase initialization skipped:", err.message);
}

/**
 * Upload a photo file to Supabase Storage bucket
 * @param {File} file 
 * @param {string} cardId 
 * @returns {Promise<string|null>} Public URL of the uploaded image
 */
async function uploadPhotoToSupabase(file, cardId) {
    if (!isSupabaseConfigured || !supabaseClient || !file) {
        // Fallback: convert file to local base64 / blob URL for client-side storage
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${cardId}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabaseClient.storage
            .from(SUPABASE_CONFIG.STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.warn("Storage upload failed, using base64 fallback:", error.message);
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        const { data: publicUrlData } = supabaseClient.storage
            .from(SUPABASE_CONFIG.STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error("Upload error:", err);
        return null;
    }
}

/**
 * Save Birthday Card to Supabase Database
 * @param {Object} cardData 
 * @returns {Promise<{success: boolean, id: string}>}
 */
async function saveCardToDatabase(cardData) {
    const cardId = cardData.id;

    // 1. Always cache in LocalStorage for instant local retrieval
    try {
        localStorage.setItem(`birthdaybloom_${cardId}`, JSON.stringify(cardData));
        const myCards = JSON.parse(localStorage.getItem('birthdaybloom_my_cards') || '[]');
        if (!myCards.some(c => c.id === cardId)) {
            myCards.unshift(cardData);
            localStorage.setItem('birthdaybloom_my_cards', JSON.stringify(myCards.slice(0, 20)));
        }
    } catch (e) {
        console.warn("LocalStorage cache error:", e);
    }

    // 2. Save to Supabase Table if configured
    if (isSupabaseConfigured && supabaseClient) {
        try {
            const row = {
                id: cardId,
                recipient_name: cardData.name,
                nickname: cardData.nickname || cardData.name,
                relationship: cardData.relationship,
                birthday_date: cardData.date,
                message: cardData.message,
                theme: cardData.theme,
                mascot: cardData.mascot,
                photo_url: cardData.photoUrl,
                music_url: cardData.musicUrl,
                is_private: cardData.isPrivate,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.TABLE_NAME)
                .insert([row]);

            if (error) throw error;
            console.log("Card saved to Supabase:", cardId);
            return { success: true, id: cardId };
        } catch (err) {
            console.warn("Supabase database insert warning:", err.message);
            // Non-fatal, local fallback succeeds
        }
    }

    return { success: true, id: cardId };
}

/**
 * Load Birthday Card by ID from Supabase Database (or LocalStorage/encoded URL fallback)
 * @param {string} cardId 
 * @param {string} [encodedData] 
 * @returns {Promise<Object|null>}
 */
async function loadCardFromDatabase(cardId, encodedData) {
    // 1. Try Supabase first if configured
    if (isSupabaseConfigured && supabaseClient && cardId) {
        try {
            const { data, error } = await supabaseClient
                .from(SUPABASE_CONFIG.TABLE_NAME)
                .select('*')
                .eq('id', cardId)
                .single();

            if (data && !error) {
                return {
                    id: data.id,
                    name: data.recipient_name,
                    nickname: data.nickname,
                    relationship: data.relationship,
                    date: data.birthday_date,
                    message: data.message,
                    theme: data.theme,
                    mascot: data.mascot,
                    photoUrl: data.photo_url,
                    musicUrl: data.music_url,
                    isPrivate: data.is_private,
                    createdAt: data.created_at
                };
            }
        } catch (err) {
            console.warn("Supabase fetch warning:", err.message);
        }
    }

    // 2. Try LocalStorage
    if (cardId) {
        try {
            const cached = localStorage.getItem(`birthdaybloom_${cardId}`);
            if (cached) return JSON.parse(cached);
        } catch (e) {}
    }

    // 3. Try URL encoded payload fallback (for portable sharing without backend credentials)
    if (encodedData && typeof decodeSurpriseData === 'function') {
        const decoded = decodeSurpriseData(encodedData);
        if (decoded) {
            if (cardId) {
                try {
                    localStorage.setItem(`birthdaybloom_${cardId}`, JSON.stringify(decoded));
                } catch (e) {}
            }
            return decoded;
        }
    }

    return null;
}

window.SupabaseBackend = {
    isConfigured: () => isSupabaseConfigured,
    uploadPhoto: uploadPhotoToSupabase,
    saveCard: saveCardToDatabase,
    loadCard: loadCardFromDatabase
};
