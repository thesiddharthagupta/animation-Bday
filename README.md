# BirthdayBloom - Interactive Birthday Wish Generator

BirthdayBloom is a premium interactive birthday card generator that lets users create a personalized birthday surprise with animated wish popups, tab-wise card pages, uploaded photos, music, confetti, glassmorphism effects, and a playful moving "No / Never" button.

The project is designed as a polished, mobile-first birthday experience rather than a simple static greeting card.

## Features

- Professional dark glassmorphism UI
- Neon pink, violet, and gold gradient styling
- Mobile-first responsive design
- Recipient name, nickname, relationship, date, and message inputs
- User photo upload with live preview
- Optional background music URL
- Theme and mascot selection
- Tab-wise card journey:
  - Intro
  - Wish 1
  - Wish 2
  - Memory
  - Reveal
- Animated popup wish cards
- Smooth card transitions with layered glass effects
- Floating hearts, balloons, gifts, sparkles, and particles
- Confetti burst on final reveal
- Typewriter-style birthday message
- Playful "No / Never" button that moves away on hover or tap
- Shareable birthday card link
- Copy link, open card, QR code, replay, and share actions
- Supabase database and storage integration behind the scenes

## UI/UX Direction

The app should feel magical, emotional, playful, and premium.

Visual style:

- Dark plum / near-black background
- Frosted glass cards with glowing borders
- Pink, violet, and gold lighting
- Soft depth blur and stardust texture
- Kawaii birthday mascot illustrations
- Smooth animations and micro-interactions
- Modern typography such as Poppins or Quicksand

The user-facing interface should not show backend branding or technical database details.

## Main Screens

### 1. Create + Upload

The user creates the birthday surprise by entering:

- Recipient name
- Nickname
- Relationship
- Birthday date
- Custom message
- Theme
- Mascot
- Uploaded photo
- Optional music URL

The upload card should include:

- Drag and drop area
- Image preview
- Remove image button
- File hint such as `JPG, PNG up to 5MB`
- Glowing border and glass effect

### 2. Tab-Wise Card Journey

After generation, the birthday surprise should behave like a multi-page animated journey.

Tabs:

- `Intro`
- `Wish 1`
- `Wish 2`
- `Memory`
- `Reveal`

Each tab should reveal a new glass card with transitions, sparkles, progress dots, and a clear `Next Card` action.

### 3. Popup Wishes

Wishes should appear as animated popup cards.

Each popup should include:

- Wish count, such as `Wish 2 of 5`
- Cute mascot visual
- Uploaded photo frame where relevant
- Personalized wish text
- Progress bar or dots
- Primary action such as `Aww, Continue`
- Secondary negative button such as `No` or `Never`

### 4. Moving No / Never Button

The negative button should be playful and difficult to click.

Expected behavior:

- On hover, the button moves away.
- On touch, the button moves before the tap completes.
- The movement should stay within a safe visible area.
- Motion trails or a small playful label like `can't catch me` can be shown.

Example behavior:

```js
const noBtn = document.querySelector("#no-btn");

function moveNoButton() {
  const padding = 24;
  const maxX = window.innerWidth - noBtn.offsetWidth - padding;
  const maxY = window.innerHeight - noBtn.offsetHeight - padding;

  noBtn.style.position = "fixed";
  noBtn.style.left = `${Math.max(padding, Math.random() * maxX)}px`;
  noBtn.style.top = `${Math.max(padding, Math.random() * maxY)}px`;
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("mouseover", moveNoButton);
noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
});
```

### 5. Final Reveal

The final screen should feel like a complete birthday celebration.

Include:

- Title: `Happy Birthday, [Name]!`
- Uploaded image in an elegant glowing frame
- Cute mascot with cake and balloons
- Glass message panel
- Music controls
- Confetti animation
- Replay button
- Share button

## Supabase Integration

Supabase should be used only behind the scenes.

Use Supabase for:

- Saving birthday card data
- Uploading user photos
- Uploading or storing music references
- Generating shareable card IDs
- Loading cards through URL parameters

Do not show Supabase branding, database status, or technical backend panels in the user interface.

## Suggested Database Schema

```sql
create table birthday_cards (
  id uuid primary key default gen_random_uuid(),
  recipient_name text not null,
  nickname text,
  relationship text,
  birthday_date date,
  message text not null,
  theme text default 'cute',
  mascot text default 'cat',
  photo_url text,
  music_url text,
  privacy text default 'public',
  wishes jsonb,
  created_at timestamptz default now()
);
```

Suggested storage bucket:

```text
birthday-uploads
```

## Recommended File Structure

```text
birthday-bloom/
  index.html
  create.html
  preview.html
  css/
    style.css
  js/
    app.js
    create.js
    engine.js
    preview.js
    supabase.js
  assets/
    mascots/
    backgrounds/
    icons/
```

## Build Prompt

```text
Build a full working professional BirthdayBloom birthday wish generator web app.

Create a premium mobile-first interface with dark plum glassmorphism, neon pink/violet/gold gradients, glowing frosted cards, floating birthday particles, sparkles, hearts, balloons, gifts, confetti, and cute kawaii mascot visuals.

The app must include a create screen where users enter recipient details, choose a theme and mascot, upload the recipient photo, add a custom message, and optionally add music.

After generation, create a tab-wise animated birthday journey with tabs: Intro, Wish 1, Wish 2, Memory, Reveal. Each tab should reveal a new animated glass card with smooth transitions, progress indicators, particles, and a Next Card button.

Birthday wishes should appear as animated popup cards with glass effects. Add a playful No / Never button that moves away when the user hovers or taps near it, while the positive button continues the journey.

The final reveal must show the uploaded image in a glowing frame, a cute mascot, cake, balloons, confetti, music controls, a typewriter birthday message, Replay and Share buttons.

Integrate Supabase behind the scenes for database and storage. Save card data in Supabase, upload images to Supabase Storage, generate unique card IDs, create public share links, and load cards from URL parameters. Do not show Supabase branding or backend status in the UI.

Make the final result responsive, animated, polished, professional, and fully working.
```

## Design Reference

The UI/UX should match the professional direction of the generated design board:

```text
birthday-upload-tabs-glass-uiux.png
```

## License

Use this project as a personal or portfolio birthday surprise template.
