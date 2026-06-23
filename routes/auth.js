import express from "express";
import fetch from "node-fetch";
import { discordUserRequest } from "../utils/discord.js";

const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Генерация OAuth URL
router.get("/url", (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds",
    prompt: "consent",
  });
  res.json({ url: `https://discord.com/api/oauth2/authorize?${params}` });
});

// OAuth callback
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code");

  try {
    // Обмен code → access_token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error("Token error:", tokens);
      return res.status(400).send("OAuth failed");
    }

    // Получаем юзера
    const userRes = await discordUserRequest("/users/@me", tokens.access_token);
    const user = await userRes.json();

    // Получаем гильдии
    const guildsRes = await discordUserRequest("/users/@me/guilds", tokens.access_token);
    const allGuilds = await guildsRes.json();

    // Фильтруем только те где юзер админ (permissions включает MANAGE_GUILD = 0x20)
    const ADMIN_PERMS = BigInt(0x20); // MANAGE_GUILD
    const adminGuilds = allGuilds.filter(g => (BigInt(g.permissions) & ADMIN_PERMS) === ADMIN_PERMS);

    req.session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
        : "👤",
      accessToken: tokens.access_token,
    };

    req.session.guilds = adminGuilds.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon 
        ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` 
        : "🏰",
    }));

    // Закрываем попап и сообщаем фронту
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '${FRONTEND_URL}');
              window.close();
            } else {
              window.location.href = '${FRONTEND_URL}';
            }
          </script>
          <p>Авторизация успешна! Можете закрыть это окно.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).send("Internal error");
  }
});

// Текущая сессия
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.json({ success: true, loggedIn: false });
  }
  res.json({
    success: true,
    loggedIn: true,
    user: {
      id: req.session.user.id,
      username: req.session.user.username,
      avatar: req.session.user.avatar,
    },
    guilds: req.session.guilds || [],
  });
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router;