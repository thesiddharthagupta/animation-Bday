"""
BirthdayBloom — Python Flask & Supabase Server
Provides REST API for card creation, retrieval, photo upload, and link sharing,
backed by Supabase with seamless local fallback.
"""

import os
import json
import uuid
import sqlite3
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, render_template

# Initialize Flask app
BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=str(BASE_DIR), template_folder=str(BASE_DIR))

# Supabase configuration (reads from env vars or defaults)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://YOUR_PROJECT_ID.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "YOUR_SUPABASE_ANON_KEY")
SUPABASE_TABLE = "birthday_cards"
SUPABASE_BUCKET = "birthday-uploads"

# Local DB initialization (fallback & cache)
DB_PATH = BASE_DIR / "birthdaybloom.db"
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)

def init_local_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS birthday_cards (
            id TEXT PRIMARY KEY,
            recipient_name TEXT NOT NULL,
            nickname TEXT,
            relationship TEXT,
            birthday_date TEXT,
            message TEXT,
            theme TEXT DEFAULT 'dreamy',
            mascot TEXT DEFAULT 'cat',
            photo_url TEXT,
            music_url TEXT,
            privacy TEXT DEFAULT 'public',
            wishes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_local_db()

# Initialize Supabase client if valid credentials exist
supabase_client = None
is_supabase_ready = False

try:
    if SUPABASE_URL and not SUPABASE_URL.startswith("https://YOUR_PROJECT_ID") and SUPABASE_KEY != "YOUR_SUPABASE_ANON_KEY":
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        is_supabase_ready = True
        print("[BirthdayBloom] Supabase Client Connected ✅")
    else:
        print("[BirthdayBloom] Supabase credentials not set. Running with built-in SQLite database fallback.")
except Exception as e:
    print(f"[BirthdayBloom] Supabase initialization notice: {e}. Using local storage fallback.")

# -----------------
# STATIC & WEB ROUTES
# -----------------

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/index.html")
def index_file():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/preview.html")
def preview_file():
    return send_from_directory(BASE_DIR, "preview.html")

@app.route("/preview")
def preview_short():
    return send_from_directory(BASE_DIR, "preview.html")

@app.route("/create.html")
def create_file():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(BASE_DIR / "assets", filename)

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory(BASE_DIR / "css", filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory(BASE_DIR / "js", filename)

@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# -----------------
# API ENDPOINTS
# -----------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "BirthdayBloom Backend",
        "supabase_connected": is_supabase_ready,
        "database": "supabase" if is_supabase_ready else "sqlite_fallback"
    })

@app.route("/api/cards", methods=["POST"])
def create_card():
    """Save a new birthday card to Supabase (and local SQLite)."""
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        card_id = data.get("id") or str(uuid.uuid4())[:8]
        recipient_name = data.get("name") or data.get("recipient_name") or "Aarya"
        nickname = data.get("nickname") or recipient_name
        relationship = data.get("relationship", "Best Friend")
        birthday_date = data.get("date") or data.get("birthday_date", "2025-05-24")
        message = data.get("message", "Wishing you a day as special as you are! Stay happy always! 💕")
        theme = data.get("theme", "dreamy")
        mascot = data.get("mascot", "cat")
        photo_url = data.get("photoUrl") or data.get("photo_url", "assets/aishu_1.png")
        music_url = data.get("musicUrl") or data.get("music_url", "assets/birthday_music.wav")
        privacy = "private" if data.get("isPrivate") else "public"
        wishes = json.dumps(data.get("wishes", []))

        # 1. Save to Local SQLite DB
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO birthday_cards
            (id, recipient_name, nickname, relationship, birthday_date, message, theme, mascot, photo_url, music_url, privacy, wishes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (card_id, recipient_name, nickname, relationship, birthday_date, message, theme, mascot, photo_url, music_url, privacy, wishes))
        conn.commit()
        conn.close()

        # 2. Save to Supabase if configured
        if is_supabase_ready and supabase_client:
            try:
                row = {
                    "id": card_id,
                    "recipient_name": recipient_name,
                    "nickname": nickname,
                    "relationship": relationship,
                    "birthday_date": birthday_date,
                    "message": message,
                    "theme": theme,
                    "mascot": mascot,
                    "photo_url": photo_url,
                    "music_url": music_url,
                    "privacy": privacy,
                    "wishes": data.get("wishes", [])
                }
                supabase_client.table(SUPABASE_TABLE).upsert(row).execute()
                print(f"[BirthdayBloom] Saved card {card_id} to Supabase ✅")
            except Exception as se:
                print(f"[BirthdayBloom] Supabase upsert note: {se}")

        # Construct full share URL
        base_host = request.host_url.rstrip("/")
        share_url = f"{base_host}/preview.html?id={card_id}"

        return jsonify({
            "success": True,
            "id": card_id,
            "share_url": share_url,
            "card": {
                "id": card_id,
                "name": recipient_name,
                "nickname": nickname,
                "relationship": relationship,
                "date": birthday_date,
                "message": message,
                "theme": theme,
                "mascot": mascot,
                "photoUrl": photo_url,
                "musicUrl": music_url
            }
        })

    except Exception as e:
        print(f"[BirthdayBloom] Error creating card: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/cards/<card_id>", methods=["GET"])
def get_card(card_id):
    """Retrieve card details by ID from Supabase or SQLite."""
    card = None

    # 1. Try Supabase first if ready
    if is_supabase_ready and supabase_client:
        try:
            res = supabase_client.table(SUPABASE_TABLE).select("*").eq("id", card_id).execute()
            if res.data and len(res.data) > 0:
                row = res.data[0]
                card = {
                    "id": row.get("id"),
                    "name": row.get("recipient_name"),
                    "nickname": row.get("nickname") or row.get("recipient_name"),
                    "relationship": row.get("relationship"),
                    "date": row.get("birthday_date"),
                    "message": row.get("message"),
                    "theme": row.get("theme", "dreamy"),
                    "mascot": row.get("mascot", "cat"),
                    "photoUrl": row.get("photo_url") or "assets/aishu_1.png",
                    "musicUrl": row.get("music_url") or "assets/birthday_music.wav",
                    "wishes": row.get("wishes")
                }
        except Exception as se:
            print(f"[BirthdayBloom] Supabase read note: {se}")

    # 2. Try SQLite fallback
    if not card:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, recipient_name, nickname, relationship, birthday_date, message, theme, mascot, photo_url, music_url, wishes FROM birthday_cards WHERE id = ?", (card_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            card = {
                "id": row[0],
                "name": row[1],
                "nickname": row[2] or row[1],
                "relationship": row[3],
                "date": row[4],
                "message": row[5],
                "theme": row[6] or "dreamy",
                "mascot": row[7] or "cat",
                "photoUrl": row[8] or "assets/aishu_1.png",
                "musicUrl": row[9] or "assets/birthday_music.wav",
                "wishes": json.loads(row[10]) if row[10] else []
            }

    if card:
        return jsonify({"success": True, "card": card})
    else:
        return jsonify({"error": "Card not found"}), 404

@app.route("/api/upload", methods=["POST"])
def upload_photo():
    """Upload photo to Supabase storage or local folder."""
    if "photo" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["photo"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{uuid.uuid4().hex[:12]}{ext}"

    # Try Supabase Storage
    if is_supabase_ready and supabase_client:
        try:
            file_bytes = file.read()
            res = supabase_client.storage.from_(SUPABASE_BUCKET).upload(
                path=filename,
                file=file_bytes,
                file_options={"content-type": file.content_type or "image/jpeg"}
            )
            public_url = supabase_client.storage.from_(SUPABASE_BUCKET).get_public_url(filename)
            return jsonify({"success": True, "photo_url": public_url})
        except Exception as se:
            print(f"[BirthdayBloom] Supabase storage upload note: {se}. Using local storage.")
            file.seek(0)

    # Local fallback
    save_path = UPLOAD_FOLDER / filename
    file.save(save_path)
    base_host = request.host_url.rstrip("/")
    photo_url = f"{base_host}/uploads/{filename}"

    return jsonify({"success": True, "photo_url": photo_url})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"[BirthdayBloom] Server running at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
