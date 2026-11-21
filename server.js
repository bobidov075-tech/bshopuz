require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // public/index.html shu yerdan beriladi

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/api/order', async (req, res) => {
  try {
    const { name, phone, address, note, items, total } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: 'Ism va telefon raqam kerak' });
    }

    const itemsText = (items || [])
      .map(i => `• ${i.name} x${i.qty} — ${i.price.toLocaleString('ru-RU')} so'm`)
      .join('\n');

    const text =
      `🛍️ *Yangi buyurtma!*\n\n` +
      `👤 Ism: ${name}\n` +
      `📞 Tel: ${phone}\n` +
      `📍 Manzil: ${address || '-'}\n` +
      `📝 Izoh: ${note || '-'}\n\n` +
      `${itemsText}\n\n` +
      `💰 Jami: ${Number(total).toLocaleString('ru-RU')} so'm`;

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      }
    );

    const tgData = await tgResponse.json();
    if (!tgData.ok) {
      console.error('Telegram xatosi:', tgData);
      return res.status(500).json({ ok: false, error: 'Telegramga yuborib bo\'lmadi' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server xatosi' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlamoqda`));
