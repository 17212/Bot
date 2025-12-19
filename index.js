const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. مفتاح Gemini بتاعك
const GEMINI_API_KEY = "AIzaSyCA859z2Xrpl1Fp_N9NFzFrURMh0EIAZtc";

// إعداد Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// إعداد الواتس اب
const client = new Client({
    authStrategy: new LocalAuth() // عشان يحفظ الدخول وميطلبش QR كل مرة
});

// لما يطلع QR Code
client.on('qr', (qr) => {
    console.log('⚡ امسك موبايلك واعمل Link Device للـ QR ده:');
    qrcode.generate(qr, { small: true });
});

// لما ينجح الاتصال
client.on('ready', () => {
    console.log('✅ Bot is Online via WhatsApp Web!');
});

// لما تيجي رسالة
client.on('message', async msg => {
    console.log('📩 رسالة جديدة:', msg.body);

    // تجاهل رسائل الجروبات أو الستاتس (اختياري)
    // لو عايز يرد على الخاص بس سيبها، لو عايز كله، شيل الشرط ده
    // if (msg.from.includes('@g.us')) return; 

    try {
        // خلي Gemini يفكر
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are 'Not Human', a sarcastic AI assistant on WhatsApp. Answer briefly in Egyptian Franco." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Ok. Mafi4 2alb. Ana gahez." }],
                },
            ],
        });

        const result = await chat.sendMessage(msg.body);
        const response = result.response.text();

        // الرد على الرسالة
        msg.reply(response);

    } catch (error) {
        console.error("Error:", error);
    }
});

// تشغيل البوت
client.initialize();