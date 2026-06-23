import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000");
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

app.set("trust proxy", 1);
app.use(express.json({ limit: "100kb" }));

const allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const geminiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: "AI rate limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many auth attempts" },
  standardHeaders: true,
  legacyHeaders: false,
});


const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: { "User-Agent": "aistudio-build" },
    },
  });
  console.log("[Init] Gemini AI initialized");
} else {
  console.warn("[Init] GEMINI_API_KEY not set — fallback mode");
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    list[parts.shift()!.trim()] = decodeURI(parts.join("="));
  });
  return list;
}

const DISCORD_API = "https://discord.com/api/v10";

async function discordBotFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  if (!BOT_TOKEN) {
    throw new Error("DISCORD_BOT_TOKEN not configured");
  }
  return fetch(`${DISCORD_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

function hexToInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16) || 0;
}

function intToHex(int: number): string {
  return "#" + int.toString(16).padStart(6, "0").toUpperCase();
}

interface SessionData {
  user: any;
  guilds: any[];
  createdAt: number;
}
const sessions = new Map<string, SessionData>();

setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  let cleaned = 0;
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt > maxAge) {
      sessions.delete(id);
      cleaned++;
    }
  }
  if (cleaned > 0) console.log(`[Cleanup] Removed ${cleaned} sessions`);
}, 60 * 60 * 1000);

const userGeminiQuotas = new Map<string, { count: number; resetAt: number }>();
const DAILY_GEMINI_LIMIT = 20;

function checkUserGeminiQuota(userId: string): boolean {
  const now = Date.now();
  const quota = userGeminiQuotas.get(userId);

  if (!quota || now > quota.resetAt) {
    userGeminiQuotas.set(userId, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000,
    });
    return true;
  }

  if (quota.count >= DAILY_GEMINI_LIMIT) return false;
  quota.count++;
  return true;
}


function requireAuth(req: any, res: express.Response, next: express.NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies["session_id"];

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  req.session = sessions.get(sessionId);
  req.sessionId = sessionId;
  next();
}

function requireAuthOrBot(req: any, res: express.Response, next: express.NextFunction) {
  const botToken = req.headers["x-bot-token"];
  if (botToken && BOT_TOKEN && botToken === BOT_TOKEN) {
    req.isBot = true;
    return next();
  }
  return requireAuth(req, res, next);
}

function requireGuildAdmin(req: any, res: express.Response, next: express.NextFunction) {
  if (req.isBot) return next();

  const guildId =
    (req.query.guildId as string) ||
    req.body?.config?.id ||
    req.body?.guildId;

  if (!guildId) {
    return res.status(400).json({ success: false, error: "guildId required" });
  }

  const hasAccess = req.session.guilds.some((g: any) => g.id === guildId);
  if (!hasAccess) {
    return res.status(403).json({ success: false, error: "Access denied" });
  }

  req.guildId = guildId;
  next();
}


const defaultGuildConfig = {
  id: "992520265773",
  name: "Nyanchi Sanctuary",
  icon: "😸",
  memberCount: 1337,
  channels: [
    { id: "ch_general", name: "general-chat", type: "text" },
    { id: "ch_welcome", name: "welcome-logs", type: "text" },
    { id: "ch_rules", name: "rules-and-info", type: "text" },
    { id: "ch_voice_main", name: "Cute voice lounge", type: "voice" },
  ],
  roles: [
    { id: "role_mod", name: "Admin / Mod 🛡️", color: "#E0533C", memberCount: 3, isSelfAssignable: false },
    { id: "role_gamer", name: "Gamer 🎮", color: "#2980B9", emoji: "🎮", memberCount: 521, isSelfAssignable: true },
    { id: "role_artist", name: "Artist 🎨", color: "#8E44AD", emoji: "🎨", memberCount: 142, isSelfAssignable: true },
    { id: "role_weeb", name: "Anime Fan 🌸", color: "#E0533C", emoji: "🌸", memberCount: 789, isSelfAssignable: true },
  ],
  prefix: "n!",
  welcomeConfig: {
    enabled: true,
    channelId: "ch_welcome",
    messageTemplate:
      "Welcome to our home, {user}! You are our official #{count} kitty! 🐾🌸",
    embedEnabled: true,
    embedColor: "#E0533C",
    avatarAsThumbnail: true,
    bannerUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800&auto=format&fit=crop&q=80",
  },
  autoModConfig: {
    enabled: true,
    rules: [
      { id: "rule_spam", name: "Anti-Spam Filter", nameRu: "Защита от спама", enabled: true, triggerType: "spam", thresholdMaxMessages: 5, thresholdSeconds: 3, action: "delete" },
      { id: "rule_links", name: "External URL Blocker", nameRu: "Фильтр сторонних ссылок", enabled: true, triggerType: "links", action: "delete" },
      { id: "rule_words", name: "Toxicity Filter", nameRu: "Проверка запрещенных слов", enabled: true, triggerType: "bad_words", blockedWords: ["spam123", "scamlink", "toxicguy"], action: "timeout", timeoutDurationSeconds: 60 },
      { id: "rule_invites", name: "Discord Invite Block", nameRu: "Блокировка серверов-приглашений", enabled: true, triggerType: "invites", action: "warn" },
    ],
    ignoredChannels: [],
    ignoredRoles: [],
  },
};

const guildConfigs: Record<string, typeof defaultGuildConfig> = {
  "992520265773": { ...defaultGuildConfig },
};


app.get("/api/auth/url", authLimiter, (req, res) => {
  const hasClient = !!process.env.DISCORD_CLIENT_ID;

  if (!hasClient) {
    return res.json({ success: true, demo: true, url: "/auth/demo-callback" });
  }

  if (!process.env.APP_URL) {
    return res.status(500).json({ success: false, error: "APP_URL not configured" });
  }

  const redirectUri = `${process.env.APP_URL}/auth/callback`;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
  });

  res.json({
    success: true,
    demo: false,
    url: `https://discord.com/oauth2/authorize?${params.toString()}`,
  });
});

app.get(["/auth/callback", "/auth/callback/"], authLimiter, async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("No authorization code");
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    return res.status(500).send("Discord OAuth not configured");
  }
  if (!process.env.APP_URL) {
    return res.status(500).send("APP_URL not configured");
  }

  try {
    const redirectUri = `${process.env.APP_URL}/auth/callback`;
    const tokenParams = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[OAuth] Token exchange failed:", errorText);
      return res.status(500).send("Token exchange failed");
    }

    const tokens = (await tokenResponse.json()) as any;
    const accessToken = tokens.access_token;

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) return res.status(500).send("Failed to load user");

    const user = (await userRes.json()) as any;

    const guildsRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const guilds = guildsRes.ok ? ((await guildsRes.json()) as any[]) : [];

    const adminGuilds = Array.isArray(guilds)
      ? guilds
          .filter((g: any) => {
            const perm = BigInt(g.permissions || "0");
            return (
              (perm & BigInt(0x8)) === BigInt(0x8) ||
              (perm & BigInt(0x20)) === BigInt(0x20)
            );
          })
          .map((g: any) => ({
            id: g.id,
            name: g.name,
            icon: g.icon
              ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
              : "💬",
          }))
      : [];

    const sessionId =
      "discord_" +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);

    sessions.set(sessionId, {
      user: {
        id: user.id,
        username: user.global_name || user.username,
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : "🌸",
      },
      guilds: adminGuilds,
      createdAt: Date.now(),
    });
    const isHttps = process.env.APP_URL?.startsWith("https://");
    const cookieFlags = isHttps
      ? "HttpOnly; Secure; SameSite=None"
      : "HttpOnly; SameSite=Lax";

    res.setHeader(
      "Set-Cookie",
      `session_id=${sessionId}; Path=/; ${cookieFlags}; Max-Age=2592000`
    );

    res.send(`
      <html>
        <body style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #1a1a1a; color: white;">
          <h2 style="color: #4ade80;">🐾 Авторизация пройдена!</h2>
          <p style="color: #a3a3a3;">Окно закроется автоматически...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("[OAuth] Exception:", err);
    res.status(500).send("Auth exception");
  }
});

app.get(["/auth/demo-callback", "/auth/demo-callback/"], authLimiter, (req, res) => {
  if (process.env.DISCORD_CLIENT_ID) {
    return res.status(403).send("Demo mode disabled");
  }

  const demoSessionId = "demo_" + Math.random().toString(36).substring(2);
  sessions.set(demoSessionId, {
    user: {
      id: "999999",
      username: "Simulated_Admin_Cat",
      avatar: "😸",
    },
    guilds: [
      { id: "992520265773", name: "Nyanchi Sanctuary", icon: "😸" },
      { id: "111222333444", name: "My Lovely Gaming Guild 🌸", icon: "✨" },
      { id: "555666777888", name: "Main Developer League 🛡️", icon: "🎮" },
    ],
    createdAt: Date.now(),
  });

  const isHttps = process.env.APP_URL?.startsWith("https://");
  const cookieFlags = isHttps
    ? "HttpOnly; Secure; SameSite=None"
    : "HttpOnly; SameSite=Lax";

  res.setHeader(
    "Set-Cookie",
    `session_id=${demoSessionId}; Path=/; ${cookieFlags}; Max-Age=2592000`
  );

  res.send(`
    <html>
      <body style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #1a1a1a; color: white;">
        <h2 style="color: #4ade80;">🐾 Имитация входа пройдена!</h2>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});

app.get("/api/auth/me", apiLimiter, (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies["session_id"];

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    return res.json({
      success: true,
      loggedIn: true,
      user: session.user,
      guilds: session.guilds,
    });
  }

  res.json({ success: true, loggedIn: false });
});

app.post("/api/auth/logout", apiLimiter, (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies["session_id"];

  if (sessionId) sessions.delete(sessionId);

  const isHttps = process.env.APP_URL?.startsWith("https://");
  const cookieFlags = isHttps
    ? "HttpOnly; Secure; SameSite=None"
    : "HttpOnly; SameSite=Lax";

  res.setHeader(
    "Set-Cookie",
    `session_id=; Path=/; ${cookieFlags}; Max-Age=0`
  );
  res.json({ success: true });
});


app.get(
  "/api/guild/config",
  apiLimiter,
  requireAuthOrBot,
  requireGuildAdmin,
  (req: any, res) => {
    const guildId = req.guildId || (req.query.guildId as string);

    let config = guildConfigs[guildId];
    if (!config) {
      config = JSON.parse(JSON.stringify(defaultGuildConfig));
      config.id = guildId;
      if (req.query.name) {
        config.name = req.query.name as string;
      }
      guildConfigs[guildId] = config;
    }

    res.json({ success: true, config });
  }
);

app.post(
  "/api/guild/config",
  apiLimiter,
  requireAuth,
  requireGuildAdmin,
  (req: any, res) => {
    const { config } = req.body;

    if (!config || !config.id) {
      return res.status(400).json({ success: false, error: "Missing config" });
    }

    if (config.id !== req.guildId) {
      return res.status(403).json({ success: false, error: "Guild ID mismatch" });
    }

    guildConfigs[config.id] = { ...config };
    res.json({ success: true, config: guildConfigs[config.id] });
  }
);

app.get(
  "/api/guild/channels",
  apiLimiter,
  requireAuth,
  requireGuildAdmin,
  async (req: any, res) => {
    const guildId = req.guildId;
    console.log(`[Channels] Fetching for guild: ${guildId}`);

    if (!BOT_TOKEN) {
      console.warn("[Channels] BOT_TOKEN not set!");
      return res.json({
        success: false,
        error: "Bot token not configured on server",
        botInGuild: false,
      });
    }

    try {
      const response = await discordBotFetch(`/guilds/${guildId}/channels`);
      console.log(`[Channels] Discord responded: ${response.status}`);

      if (response.status === 401) {
        return res.json({
          success: false,
          error: "Invalid bot token (401)",
          botInGuild: false,
        });
      }

      if (response.status === 403 || response.status === 404) {
        const errText = await response.text();
        console.warn(`[Channels] No access (${response.status}):`, errText);
        return res.json({
          success: false,
          error: response.status === 403
            ? "Bot has no View Channels permission"
            : "Bot is not in this guild",
          botInGuild: false,
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Channels] Discord error:`, errText);
        return res.status(response.status).json({
          success: false,
          error: "Discord API error",
        });
      }

      const channels = (await response.json()) as any[];
      const textChannels = channels
        .filter((c: any) => c.type === 0)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          position: c.position,
        }))
        .sort((a: any, b: any) => a.position - b.position);

      console.log(`[Channels] ✅ Found ${textChannels.length} text channels: ${textChannels.map(c => c.name).join(", ")}`);

      res.json({
        success: true,
        channels: textChannels,
        botInGuild: true,
      });
    } catch (err: any) {
      console.error("[Channels] Exception:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

app.get(
  "/api/guild/discord-roles",
  apiLimiter,
  requireAuth,
  requireGuildAdmin,
  async (req: any, res) => {
    const guildId = req.guildId;
    console.log(`[Roles GET] Fetching for guild: ${guildId}`);

    if (!BOT_TOKEN) {
      return res.json({ success: false, error: "Bot token not configured", botInGuild: false });
    }

    try {
      const response = await discordBotFetch(`/guilds/${guildId}/roles`);

      if (response.status === 403 || response.status === 404) {
        return res.json({ success: false, error: "Bot not in guild", botInGuild: false });
      }

      if (!response.ok) {
        return res.status(response.status).json({ success: false });
      }

      const roles = (await response.json()) as any[];
      const filtered = roles
        .filter((r: any) => r.name !== "@everyone" && !r.managed)
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          color: intToHex(r.color),
          position: r.position,
        }))
        .sort((a: any, b: any) => b.position - a.position);

      res.json({ success: true, roles: filtered, botInGuild: true });
    } catch (err: any) {
      console.error("[Roles GET] Exception:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

app.post(
  "/api/guild/discord-roles",
  apiLimiter,
  requireAuth,
  requireGuildAdmin,
  async (req: any, res) => {
    const guildId = req.guildId;
    const { name, color, hoist, mentionable } = req.body;

    console.log(`[Role CREATE] Guild: ${guildId}, name: "${name}", color: ${color}`);

    if (!BOT_TOKEN) {
      return res.json({ success: false, error: "Bot token not configured" });
    }

    if (!name || name.length > 100) {
      return res.status(400).json({ success: false, error: "Invalid role name" });
    }

    try {
      const response = await discordBotFetch(`/guilds/${guildId}/roles`, {
        method: "POST",
        body: JSON.stringify({
          name,
          color: hexToInt(color || "#99AAB5"),
          hoist: hoist ?? false,
          mentionable: mentionable ?? true,
          permissions: "0",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[Role CREATE] Discord error:", errText);

        if (response.status === 403) {
          return res.status(403).json({
            success: false,
            error: "Bot has no 'Manage Roles' permission, or bot's role is below in hierarchy.",
          });
        }
        return res.status(response.status).json({ success: false, error: errText });
      }

      const role = (await response.json()) as any;
      console.log(`[Role CREATE] ✅ Created: ${role.name} (${role.id})`);

      res.json({
        success: true,
        role: {
          id: role.id,
          name: role.name,
          color: intToHex(role.color),
        },
      });
    } catch (err: any) {
      console.error("[Role CREATE] Exception:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

app.delete(
  "/api/guild/discord-roles/:roleId",
  apiLimiter,
  requireAuth,
  requireGuildAdmin,
  async (req: any, res) => {
    const { roleId } = req.params;
    const guildId = req.guildId;
    console.log(`[Role DELETE] Guild: ${guildId}, role: ${roleId}`);

    if (!BOT_TOKEN) {
      return res.json({ success: false, error: "Bot token not configured" });
    }

    try {
      const response = await discordBotFetch(`/guilds/${guildId}/roles/${roleId}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const errText = await response.text();
        console.error("[Role DELETE] Discord error:", errText);
        return res.status(response.status).json({ success: false, error: errText });
      }

      console.log(`[Role DELETE] ✅ Deleted ${roleId}`);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Role DELETE] Exception:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);


app.post(
  "/api/bot/simulate-message",
  geminiLimiter,
  requireAuth,
  requireGuildAdmin,
  async (req: any, res) => {
    if (!checkUserGeminiQuota(req.session.user.id)) {
      return res.status(429).json({
        success: false,
        error: `Daily AI limit reached (${DAILY_GEMINI_LIMIT}/day)`,
      });
    }

    const { message, activeRoles, username, lang } = req.body;

    const userText = (message || "").substring(0, 1000);
    const targetUser = (username || "Muffin_Cat").substring(0, 50);
    const userRolesStr =
      activeRoles && Array.isArray(activeRoles)
        ? activeRoles.slice(0, 10).join(", ")
        : "User";
    const locale = lang === "en" ? "en" : "ru";

    const targetGuildId = req.guildId;
    const currentGuildConfig = guildConfigs[targetGuildId] || defaultGuildConfig;

    let triggeredRule = null;
    let automodAction = null;
    let automodReason = "";

    if (currentGuildConfig.autoModConfig.enabled) {
      for (const rule of currentGuildConfig.autoModConfig.rules) {
        if (!rule.enabled) continue;

        if (rule.triggerType === "bad_words" && rule.blockedWords) {
          for (const w of rule.blockedWords) {
            if (userText.toLowerCase().includes(w.toLowerCase())) {
              triggeredRule = rule;
              automodAction = rule.action;
              automodReason =
                locale === "ru"
                  ? `Запрещенное слово: "${w}"`
                  : `Prohibited term: "${w}"`;
              break;
            }
          }
        }

        if (rule.triggerType === "links") {
          if (/(https?:\/\/[^\s]+)/g.test(userText)) {
            triggeredRule = rule;
            automodAction = rule.action;
            automodReason =
              locale === "ru"
                ? "Использование сторонних ссылок запрещено"
                : "External links restricted";
          }
        }

        if (rule.triggerType === "invites") {
          if (
            userText.includes("discord.gg/") ||
            userText.includes("discord.com/invite")
          ) {
            triggeredRule = rule;
            automodAction = rule.action;
            automodReason =
              locale === "ru"
                ? "Реклама сторонних серверов"
                : "Discord server invites forbidden";
          }
        }
      }
    }

    if (triggeredRule && automodAction) {
      return res.json({
        success: true,
        automodTriggered: true,
        action: automodAction,
        reason: automodReason,
        botReply:
          locale === "ru"
            ? `🐾 ОЙ! Сообщение удалено (${automodReason})! Мяу! 😿`
            : `🐾 OOPS! Actioned by AutoMod (${automodReason})! Meow! 😿`,
      });
    }

    if (!ai) {
      const fallbacksRu = [
        `Мяу! Слышу тебя, ${targetUser}! 🐾`,
        `Фыррр... Твоя роль: [${userRolesStr}] выглядит круто! 🌸`,
        `Префикс моих команд: \`${currentGuildConfig.prefix}\`.`,
      ];
      const fallbacksEn = [
        `Meow! I hear you, ${targetUser}! 🐾`,
        `Purr... your role: [${userRolesStr}] is awesome! 🌸`,
        `My prefix: \`${currentGuildConfig.prefix}\`.`,
      ];
      const list = locale === "ru" ? fallbacksRu : fallbacksEn;
      return res.json({
        success: true,
        automodTriggered: false,
        botReply: list[Math.floor(Math.random() * list.length)],
      });
    }

    try {
      const prompt = `You are "Nyanchi" — an incredibly cute anime cat-bot mascot.
User "${targetUser}" with roles "[${userRolesStr}]" sent in ${locale === "ru" ? "Russian" : "English"}:
"${userText}"

Reply in character:
1. ${locale === "ru" ? "Russian" : "English"}
2. Cute, lively, playful. Use "Мяу"/"Meow", 🐾, 😸, 🌸
3. Under 3 sentences
4. Reference role if relevant

No formatting fences.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const botReply =
        response.text?.trim() ||
        (locale === "ru" ? "Мяу!" : "Meow!");

      res.json({
        success: true,
        automodTriggered: false,
        botReply,
      });
    } catch (error: any) {
      console.error("[Gemini] Error:", error);
      res.status(500).json({ success: false, error: "AI service unavailable" });
    }
  }
);



app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiEnabled: !!ai,
    discordConfigured: !!process.env.DISCORD_CLIENT_ID,
    botConfigured: !!BOT_TOKEN,
    appUrl: process.env.APP_URL || "not set",
    sessionsCount: sessions.size,
  });
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Init] DEVELOPMENT mode");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Init] PRODUCTION mode");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] 🐾 Nyanchi on port ${PORT}`);
    console.log(`[Server] APP_URL: ${process.env.APP_URL || "not set"}`);
    console.log(`[Server] Discord OAuth: ${process.env.DISCORD_CLIENT_ID ? "✅" : "❌ demo"}`);
    console.log(`[Server] Gemini AI: ${ai ? "✅" : "❌"}`);
    console.log(`[Server] Bot Token: ${BOT_TOKEN ? "✅" : "❌"}`);
  });
}

startServer().catch((err) => {
  console.error("[Fatal] Server failed:", err);
  process.exit(1);
});