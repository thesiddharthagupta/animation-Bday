/**
 * BirthdayBloom — Popup Wish Story Engine ✨
 * Constructs the 5-stage magical birthday journey matching the reference design:
 * 1. Intro (Small wishes for a big-hearted you)
 * 2. Wish 1 (You make ordinary moments feel magical)
 * 3. Wish 2 (Your smile makes every moment brighter - Circular photo frame)
 * 4. Memory / Playful Moving "No" Button (One last question... Are you ready?)
 * 5. Reveal (Grand Celebration, Crown, Calligraphy, Cake & Music)
 */

function buildPopupWishStory(data) {
    const name = data.name || "Aarya";
    const nickname = data.nickname || name;
    const rel = data.relationship || "bestie";
    const userMessage = data.message || "Wishing you a day as special as you are! Stay happy always! 💕";
    const photo = data.photoUrl || "assets/aishu_1.png";
    const mascot = data.mascot || "cat";

    // Mascot asset mappings
    const mascotAssets = {
        cat: {
            heart: "assets/cat_gift.png",
            peek: "assets/envelope_magic.jpg",
            cake: "assets/preview_hero.jpg"
        },
        bunny: {
            heart: "assets/bunny_birthday.jpg",
            peek: "assets/bunny_birthday.jpg",
            cake: "assets/bunny_birthday.jpg"
        },
        panda: {
            heart: "assets/panda_birthday.jpg",
            peek: "assets/panda_birthday.jpg",
            cake: "assets/panda_birthday.jpg"
        },
        dog: {
            heart: "assets/dog_birthday.jpg",
            peek: "assets/dog_birthday.jpg",
            cake: "assets/dog_birthday.jpg"
        }
    };

    const currentMascot = mascotAssets[mascot] || mascotAssets.cat;

    return [
        // Step 1: Intro (Stacked cards)
        {
            stepIndex: 1,
            tabKey: "intro",
            tabLabel: "Intro",
            type: "intro",
            subtitle: "Page 1 of 5",
            mascotImg: currentMascot.heart,
            headline: "Hey " + name + " ✨",
            bodyText: "Small wishes for a big-hearted you 💕",
            ctaText: "Open Wish ➔"
        },

        // Step 2: Wish 1 (Emotional connection)
        {
            stepIndex: 2,
            tabKey: "wish1",
            tabLabel: "Wish 1",
            type: "wish1",
            progressText: "Wish 2 of 5",
            mascotImg: currentMascot.heart,
            headline: "You make ordinary moments feel magical 💖",
            bodyText: "Thank you for bringing so much laughter, warmth, and genuine light into the world.",
            ctaText: "Next Wish ➔"
        },

        // Step 3: Wish 2 (Circular Photo Frame with Mascot & Flowers)
        {
            stepIndex: 3,
            tabKey: "wish2",
            tabLabel: "Wish 2",
            type: "wish2",
            progressText: "Wish 3 of 5",
            photoUrl: photo,
            mascotImg: currentMascot.heart,
            headline: "Your smile makes every moment brighter ✨",
            bodyText: "Having you as my " + rel + " is the greatest gift ever! 🌸",
            ctaText: "Aww, Continue ➔"
        },

        // Step 4: Memory / Playful Moving "No" Button Screen
        {
            stepIndex: 4,
            tabKey: "memory",
            tabLabel: "Memory",
            type: "no_button",
            progressText: "Wish 4 of 5",
            peekImg: currentMascot.peek,
            headline: "One last question...",
            bodyText: "Are you ready for a special surprise? 💕",
            yesText: "Yes, I'm Ready! ✨",
            noText: "Never"
        },

        // Step 5: Reveal (Grand Birthday Celebration)
        {
            stepIndex: 5,
            tabKey: "reveal",
            tabLabel: "Reveal",
            type: "reveal",
            title: "Happy Birthday, " + name + "!",
            photoUrl: photo,
            cakeImg: currentMascot.cake,
            message: userMessage,
            songTitle: "A Birthday Song for You",
            songDuration: "3:28"
        }
    ];
}

window.buildPopupWishStory = buildPopupWishStory;
