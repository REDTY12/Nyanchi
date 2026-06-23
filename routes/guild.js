import express from "express";
import { discordBotRequest, hexToInt, intToHex } from "../utils/discord.js";

const router = express.Router();

// Простое in-memory хранилище конфигов (в проде используй БД!)
const configsDB = new Map();

// Middleware: проверка авторизации
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: "Not authorized" });
  }
  next();
}

// Middleware: проверка что юзер админ этого сервера
function requireGuildAdmin(req, res, next) {
  const guildId = req.query.guildId || req.body.guildId || req.params.guildId;
  const userGuilds = req.session.guilds || [];
  
  if (!userGuilds.some(g => g.id === guildId)) {
    return res.status(403).json({ success: false, error: "No access to this guild" });
  }
  next();
}

// ─── GET CONFIG ───
router.get("/config", requireAuth, requireGuildAdmin, async (req, res) => {
  const { guildId, name } = req.query;
  
  let config = configsDB.get(guildId);
  
  if (!config) {
    // Получаем имя и иконку с Discord
    let guildName = name || "Unknown Guild";
    let memberCount = 0;
    
    try {
      const guildRes = await discordBotRequest(`/guilds/${guildId}?with_counts=true`);
      if (guildRes.ok) {
        const guildData = await guildRes.json();
        guildName = guildData.name;
        memberCount = guildData.approximate_member_count || 0;
      }
    } catch (err) {
      console.warn("Failed to fetch guild info:", err.message);
    }
    
    // Дефолтный конфиг
    config = {
      id: guildId,
      name: guildName,
      memberCount,
      welcomeConfig: {
        enabled: true,
        targetChannelId: "",
        messageTemplate: "Welcome to our home, {user}! You are our official #{count} kitty! 🐾🌸",
        embedEnabled: true,
        embedColor: "#E0533C",
        avatarAsThumbnail: true,
        bannerUrl: "",
      },
      autoModConfig: {
        enabled: true,
        antiSpam: true,
        antiInvite: true,
        antiToxic: true,
        bannedWords: [],
        action: "warn",
      },
      roles: [],
    };
    
    configsDB.set(guildId, config);
  }
  
  res.json({ success: true, config });
});

// ─── SAVE CONFIG ───
router.post("/config", requireAuth, async (req, res) => {
  const { config } = req.body;
  if (!config?.id) return res.status(400).json({ success: false, error: "Invalid config" });
  
  const userGuilds = req.session.guilds || [];
  if (!userGuilds.some(g => g.id === config.id)) {
    return res.status(403).json({ success: false, error: "No access" });
  }
  
  configsDB.set(config.id, config);
  res.json({ success: true });
});

// ─── GET CHANNELS ───
router.get("/channels", requireAuth, requireGuildAdmin, async (req, res) => {
  const { guildId } = req.query;
  
  try {
    const response = await discordBotRequest(`/guilds/${guildId}/channels`);
    
    if (response.status === 403 || response.status === 404) {
      return res.json({ 
        success: false, 
        error: "Bot not in guild",
        botInGuild: false,
      });
    }
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: "Discord API error" });
    }
    
    const channels = await response.json();
    const textChannels = channels
      .filter(c => c.type === 0) // 0 = GUILD_TEXT
      .map(c => ({ id: c.id, name: c.name, position: c.position }))
      .sort((a, b) => a.position - b.position);
    
    res.json({ success: true, channels: textChannels, botInGuild: true });
  } catch (err) {
    console.error("Channels error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET ROLES ───
router.get("/roles", requireAuth, requireGuildAdmin, async (req, res) => {
  const { guildId } = req.query;
  
  try {
    const response = await discordBotRequest(`/guilds/${guildId}/roles`);
    
    if (response.status === 403 || response.status === 404) {
      return res.json({ success: false, error: "Bot not in guild", botInGuild: false });
    }
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false });
    }
    
    const roles = await response.json();
    const filtered = roles
      .filter(r => r.name !== "@everyone")
      .map(r => ({
        id: r.id,
        name: r.name,
        color: intToHex(r.color),
        position: r.position,
        managed: r.managed,
      }))
      .sort((a, b) => b.position - a.position);
    
    res.json({ success: true, roles: filtered, botInGuild: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── CREATE ROLE ───
router.post("/roles", requireAuth, async (req, res) => {
  const { guildId, name, color, hoist, mentionable } = req.body;
  
  const userGuilds = req.session.guilds || [];
  if (!userGuilds.some(g => g.id === guildId)) {
    return res.status(403).json({ success: false, error: "No access" });
  }
  
  try {
    const response = await discordBotRequest(`/guilds/${guildId}/roles`, {
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
      console.error("Discord role error:", errText);
      
      if (response.status === 403) {
        return res.status(403).json({ 
          success: false, 
          error: "Bot has no permission to create roles. Make sure bot has 'Manage Roles' permission." 
        });
      }
      
      return res.status(response.status).json({ success: false, error: errText });
    }
    
    const role = await response.json();
    res.json({ 
      success: true, 
      role: {
        id: role.id,
        name: role.name,
        color: intToHex(role.color),
      }
    });
  } catch (err) {
    console.error("Create role error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE ROLE ───
router.delete("/roles/:roleId", requireAuth, async (req, res) => {
  const { roleId } = req.params;
  const { guildId } = req.query;
  
  const userGuilds = req.session.guilds || [];
  if (!userGuilds.some(g => g.id === guildId)) {
    return res.status(403).json({ success: false, error: "No access" });
  }
  
  try {
    const response = await discordBotRequest(`/guilds/${guildId}/roles/${roleId}`, {
      method: "DELETE",
    });
    
    if (!response.ok && response.status !== 204) {
      return res.status(response.status).json({ success: false });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;