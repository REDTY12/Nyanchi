import express from "express";

const router = express.Router();

// Симуляция сообщения (для песочницы)
router.post("/simulate-message", (req, res) => {
  const { message, activeRoles, username, lang, guildId } = req.body;
  
  if (!message) return res.json({ success: false, error: "No message" });
  
  // Простая логика AutoMod
  const lower = message.toLowerCase();
  let automodTriggered = false;
  let reason = "";
  let action = "warn";
  
  // Anti-invite
  if (/discord\.gg\/|discord\.com\/invite/.test(lower)) {
    automodTriggered = true;
    reason = lang === "ru" ? "Обнаружено приглашение Discord" : "Discord invite detected";
    action = "delete";
  }
  // Anti-spam (много заглавных)
  else if (message.length > 10 && message.replace(/[^A-ZА-Я]/g, "").length / message.length > 0.7) {
    automodTriggered = true;
    reason = lang === "ru" ? "Слишком много заглавных букв" : "Too many CAPS";
    action = "warn";
  }
  // Anti-toxic
  else if (/(idiot|stupid|тупой|дурак)/i.test(lower)) {
    automodTriggered = true;
    reason = lang === "ru" ? "Токсичное поведение" : "Toxic behavior";
    action = "warn";
  }
  
  let botReply = "";
  
  if (automodTriggered) {
    botReply = lang === "ru" 
      ? `Мяу! ${username}, пожалуйста, соблюдай правила. ${reason} 🐾`
      : `Meow! ${username}, please follow the rules. ${reason} 🐾`;
  } else {
    // Просто дружеский ответ
    const responses = lang === "ru" ? [
      `Мур-мур! Привет, ${username}! 🐱`,
      `Ня! Интересное сообщение! 🌸`,
      `*виляет хвостом* 🐾`,
    ] : [
      `Purr! Hi ${username}! 🐱`,
      `Nya! Interesting message! 🌸`,
      `*wags tail* 🐾`,
    ];
    botReply = responses[Math.floor(Math.random() * responses.length)];
  }
  
  res.json({
    success: true,
    automodTriggered,
    reason,
    action,
    botReply,
  });
});

export default router;