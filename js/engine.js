/**
 * Smart Message Generation Engine
 * Auto-generates emotional and personalized birthday lines
 */

const MessageLibrary = {
    // Relationship-based categories
    friend: {
        wholesome: [
            "You make ordinary moments unforgettable 😂💖",
            "Life becomes brighter whenever you smile 💖",
            "A best friend like you deserves the happiest birthday ever 🎂",
            "Thank you for always turning bad days into happy memories 🌸"
        ],
        funny: [
            "Another year older, but definitely not any wiser! 😂",
            "I was going to make a joke about how old you are, but I'm afraid I'd get hit with a cane! 👴👵",
            "You're the only person I'd actually share my food with. That's a big deal! 🍕",
            "Stay crazy, stay weird, stay exactly as you are! 🤪✨"
        ],
        emotional: [
            "You are honestly one of the most caring people I’ve ever met ✨",
            "Thank you for being the person I can always count on. ❤️",
            "Your friendship is the greatest gift I've ever received. 🎁",
            "I'm so lucky to have you in my corner through everything. 🌸"
        ]
    },
    romantic: {
        soft: [
            "My favorite place is wherever you are ❤️",
            "Every day with you feels like a beautiful dream. ✨",
            "You're the best thing that ever happened to me. 💖",
            "Being with you is my favorite adventure. 🌸"
        ],
        emotional: [
            "You have my heart, today and every day. ❤️",
            "I love you more than words could ever express. 🌹",
            "You're the missing piece I never knew I was looking for. ✨",
            "My world is so much more beautiful with you in it. 💖"
        ],
        cute: [
            "You're my favorite person to annoy! 😘",
            "I love you more than pizza (and that's saying a lot!). 🍕❤️",
            "You're the sprinkle to my cupcake. 🧁✨",
            "Let's grow old and grumpy together! 👴👵💕"
        ]
    },
    crush: {
        shy: [
            "Maybe today is your birthday… but your smile is everyone’s gift 🌸",
            "I hope your day is as amazing as you are. ✨",
            "Just wanted to say you look extra bright today! 😊",
            "I'm so glad our paths crossed. 💖"
        ],
        playful: [
            "Is it hot in here or is it just your birthday glow? 🔥😉",
            "I'd definitely swipe right on you in real life! 📱✨",
            "You're pretty cool... for a birthday human. 😎",
            "Hope your birthday is full of things that make you smile. 🌸"
        ]
    },
    family: {
        warm: [
            "To the best sibling/family member anyone could ask for! ❤️",
            "So glad we're in this crazy family together. 🏡✨",
            "You've always been there for me, and I'll always be here for you. 🌸",
            "Family wouldn't be the same without your light. 💖"
        ]
    },

    // Personality-based categories
    funny: [
        "Your energy is literally infectious! 😂✨",
        "Never stop being the hilarious person you are. 💖",
        "The world needs more of your crazy, amazing self! 🤪",
        "You're the human equivalent of a Saturday morning. ☀️"
    ],
    caring: [
        "Your caring heart makes every moment feel safe ✨",
        "You are literally the reason so many people smile 💖",
        "The way you look after everyone is truly inspiring. 🌸",
        "You're a rare soul with so much kindness to give. ✨"
    ],
    cute: [
        "You're just too adorable for words! 🎀",
        "The world is a cuter place with you in it. 🌸✨",
        "Stay sweet, stay kind, stay you. 💖",
        "You're like a warm hug in human form. 🤗✨"
    ]
};

/**
 * Main Engine Function
 */
function generateSmartStory(data) {
    const { name, nickname, rel, desc, theme, animal } = data;
    const selectedLines = [];
    
    // 1. Analyze Keywords in Description
    const keywords = desc.toLowerCase();
    const traits = [];
    if (keywords.includes('funny') || keywords.includes('crazy') || keywords.includes('energetic')) traits.push('funny');
    if (keywords.includes('caring') || keywords.includes('supportive') || keywords.includes('kind') || keywords.includes('safe')) traits.push('caring');
    if (keywords.includes('cute') || keywords.includes('soft') || keywords.includes('shy') || keywords.includes('sweet')) traits.push('cute');

    // 2. Select Relationship Lines
    let relKey = 'friend';
    if (['girlfriend', 'boyfriend'].includes(rel)) relKey = 'romantic';
    if (['crush'].includes(rel)) relKey = 'crush';
    if (['sister', 'brother', 'family'].includes(rel)) relKey = 'family';

    const relCategories = Object.keys(MessageLibrary[relKey]);
    const randomRelCat = relCategories[Math.floor(Math.random() * relCategories.length)];
    selectedLines.push(...MessageLibrary[relKey][randomRelCat]);

    // 3. Select Personality Lines
    traits.forEach(trait => {
        if (MessageLibrary[trait]) {
            selectedLines.push(...MessageLibrary[trait]);
        }
    });

    // 4. Shuffle and pick unique lines
    const shuffled = selectedLines.sort(() => 0.5 - Math.random());
    const uniqueLines = [...new Set(shuffled)].slice(0, 3);

    // 5. Construct Final Paragraph
    const finalParagraph = generateFinalParagraph(data, traits);

    // 6. Build the Story Array
    const animalAssets = {
        cat: "assets/cat_gift.png",
        bunny: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/v8xKVYYZ4H6Y7tD59N/giphy.gif",
        panda: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/7NoNw4pMNTvgc/giphy.gif",
        dog: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/v8xKVYYZ4H6Y7tD59N/giphy.gif",
        bear: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1eXp1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/v8xKVYYZ4H6Y7tD59N/giphy.gif"
    };
    const mainImg = data.img || animalAssets[animal] || animalAssets.cat;

    return [
        {
            id: 1,
            image: animalAssets[animal] || animalAssets.cat,
            text: `HEY ${name.toUpperCase()} 👀\nSOMEONE HAS A SPECIAL MESSAGE FOR YOU...`,
            buttons: [{ text: "Open it! ✨", action: "next" }, { text: "No way..", action: "dodge", id: "no-btn" }]
        },
        {
            id: 2,
            image: mainImg,
            text: uniqueLines[0] || "You're one of the most amazing people I know! 💖",
            buttons: [{ text: "Really? 😍", action: "next" }]
        },
        {
            id: 3,
            image: mainImg,
            text: uniqueLines[1] || "Every moment with you is special. ✨",
            buttons: [{ text: "Keep going... 🌸", action: "next" }]
        },
        {
            id: 4,
            type: "message",
            content: `Happy Birthday ${nickname}! 🎂\n\n${finalParagraph}\n\nStay amazing always! ❤️`
        },
        {
            id: 5,
            type: "post",
            user: `${nickname}'s Special Day ✨`,
            image: mainImg,
            likes: "1,245,678",
            caption: `<b>Happy Birthday ${name}!</b> 🎂 Wishing you the most magical day ever. 💖🌸✨`,
            final: true
        }
    ];
}

function generateFinalParagraph(data, traits) {
    const { nickname, rel, desc } = data;
    let p = `To my dear ${rel}, ${nickname}. `;
    
    if (traits.includes('funny')) p += "You have this incredible way of making everyone around you laugh until their stomachs hurt. ";
    if (traits.includes('caring')) p += "Your kindness and the way you care for people is truly one of a kind. ";
    if (traits.includes('cute')) p += "You have such a sweet soul and a presence that just makes everything feel better. ";
    
    if (desc) p += `I especially love how you're ${desc}. `;
    
    p += "I hope this year brings you as much joy as you bring to everyone else. You deserve all the magic in the world! ✨";
    
    return p;
}

// Export for use in preview.js
window.generateSmartStory = generateSmartStory;
