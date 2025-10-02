const axios = require("axios");
const admin = require("firebase-admin");

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com" // ganti dengan URL DB kamu
});
const db = admin.database();

const TOKEN = process.env.TELEGRAM_TOKEN; // isi di Railway Variables
const API = `https://api.telegram.org/bot${TOKEN}`;

async function polling() {
  let offset = 0;

  while (true) {
    try {
      const res = await axios.get(`${API}/getUpdates?offset=${offset+1}&timeout=30`);
      const updates = res.data.result;

      for (let update of updates) {
        offset = update.update_id;

        // Simpan data ke Firebase
        await db.ref("telegram_updates").push({
          update,
          createdAt: Date.now()
        });

        // Balas pesan kalau ada teks
        if (update.message && update.message.text) {
          await axios.post(`${API}/sendMessage`, {
            chat_id: update.message.chat.id,
            text: `✅ Pesan "${update.message.text}" sudah disimpan di Firebase`
          });
        }
      }
    } catch (err) {
      console.error("Polling error:", err.message);
    }
  }
}

polling();
