import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CONFIG_API = process.env.APP_URL || "http://localhost:3000";

if (!BOT_TOKEN) {
  console.error("[Bot] ❌ DISCORD_BOT_TOKEN not set in .env");
  process.exit(1);
}

const defaultConfig = {
  prefix: "n!",
  welcomeConfig: {
    enabled: true,
    channelId: "general",
    messageTemplate:
      "🐾 Welcome {user}! You are our official #{count} kitty! 🌸",
    embedEnabled: true,
    embedColor: "#E0533C",
    avatarAsThumbnail: true,
    bannerUrl: "",
  },
  autoModConfig: {
    enabled: true,
    rules: [
      {
        id: "rule_invites",
        name: "Discord Invite Block",
        enabled: true,
        triggerType: "invites",
        action: "delete" as const,
      },
      {
        id: "rule_links",
        name: "External Links Block",
        enabled: false,
        triggerType: "links",
        action: "delete" as const,
      },
      {
        id: "rule_words",
        name: "Bad Words Filter",
        enabled: true,
        triggerType: "bad_words",
        blockedWords: ["spam123", "scamlink", "toxicguy"],
        action: "delete" as const,
      },
    ],
    ignoredChannels: [],
    ignoredRoles: [],
  },
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});

interface ConfigCacheEntry {
  config: any;
  fetchedAt: number;
}
const configCache = new Map<string, ConfigCacheEntry>();
const CACHE_TTL = 60 * 1000; 

async function getGuildConfig(guildId: string): Promise<any> {
  const cached = configCache.get(guildId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.config;
  }

  try {
    const response = await fetch(
      `${CONFIG_API}/api/guild/config?guildId=${guildId}`,
      {
        signal: AbortSignal.timeout(2000), 
        headers: {
          "x-bot-token": BOT_TOKEN!, 
        },
      }
    );

    if (response.ok) {
      const data = (await response.json()) as any;
      if (data.config) {
        configCache.set(guildId, {
          config: data.config,
          fetchedAt: Date.now(),
        });
        return data.config;
      }
    }
  } catch (err) {
  }

  configCache.set(guildId, {
    config: defaultConfig,
    fetchedAt: Date.now(),
  });
  return defaultConfig;
}

client.once(Events.ClientReady, (c) => {
  console.log(`[Bot] 🐾 Nyanchi logged in as ${c.user.tag}`);
  console.log(`[Bot] Serving ${c.guilds.cache.size} guild(s):`);
  c.guilds.cache.forEach((guild) => {
    console.log(`  - ${guild.name} (${guild.id})`);
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const config = await getGuildConfig(member.guild.id);
    if (!config?.welcomeConfig?.enabled) return;

    const wc = config.welcomeConfig;

    let channel = member.guild.channels.cache.get(wc.channelId);
    if (!channel) {
      channel = member.guild.channels.cache.find(
        (ch) => ch.name === wc.channelId
      );
    }

    if (!channel || !channel.isTextBased()) {
      console.warn(`[Bot] Welcome channel not found in ${member.guild.name}`);
      return;
    }

    const message = wc.messageTemplate
      .replace(/{user}/g, `<@${member.id}>`)
      .replace(/{guild}/g, member.guild.name)
      .replace(/{count}/g, String(member.guild.memberCount));

    if (wc.embedEnabled) {
      await channel.send({
        embeds: [
          {
            description: message,
            color: parseInt(
              (wc.embedColor || "#E0533C").replace("#", ""),
              16
            ),
            thumbnail: wc.avatarAsThumbnail
              ? { url: member.user.displayAvatarURL() }
              : undefined,
            image: wc.bannerUrl ? { url: wc.bannerUrl } : undefined,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } else {
      await channel.send(message);
    }

    console.log(
      `[Bot] Welcomed ${member.user.tag} in ${member.guild.name}`
    );
  } catch (err) {
    console.error(`[Bot] Welcome error:`, err);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  try {
    const config = await getGuildConfig(message.guild.id);
    const text = message.content;

    if (config?.autoModConfig?.enabled) {
      if (
        config.autoModConfig.ignoredChannels?.includes(message.channel.id)
      ) {
        return;
      }

      if (message.member && config.autoModConfig.ignoredRoles?.length > 0) {
        const hasIgnoredRole = message.member.roles.cache.some((r) =>
          config.autoModConfig.ignoredRoles.includes(r.id)
        );
        if (hasIgnoredRole) return;
      }

      for (const rule of config.autoModConfig.rules) {
        if (!rule.enabled) continue;

        let triggered = false;
        let reason = "";

        if (rule.triggerType === "bad_words" && rule.blockedWords) {
          for (const word of rule.blockedWords) {
            if (text.toLowerCase().includes(word.toLowerCase())) {
              triggered = true;
              reason = `Prohibited word: "${word}"`;
              break;
            }
          }
        }

        if (rule.triggerType === "links") {
          if (/(https?:\/\/[^\s]+)/g.test(text)) {
            triggered = true;
            reason = "External links not allowed";
          }
        }

        if (rule.triggerType === "invites") {
          if (
            text.includes("discord.gg/") ||
            text.includes("discord.com/invite") ||
            text.includes("discordapp.com/invite")
          ) {
            triggered = true;
            reason = "Discord invites blocked";
          }
        }

        if (!triggered) continue;

        try {
          if (rule.action === "delete") {
            await message.delete();
            console.log(
              `[AutoMod] Deleted message from ${message.author.tag}: ${reason}`
            );
          } else if (rule.action === "warn") {
            await message.reply(
              `🐾 ${message.author}, нарушение: ${reason}! Веди себя прилично, мяу! 😿`
            );
          } else if (rule.action === "timeout" && message.member) {
            const duration = (rule.timeoutDurationSeconds || 60) * 1000;
            await message.member.timeout(duration, reason);
            await message.delete().catch(() => {});
            console.log(
              `[AutoMod] Timeout ${duration / 1000}s for ${message.author.tag}: ${reason}`
            );
          }
        } catch (err: any) {
          if (err.code === 50013) {
            console.error(
              `[Bot] Missing permissions in ${message.guild.name}`
            );
          } else {
            console.error(`[Bot] AutoMod action error:`, err);
          }
        }

        return; 
      }
    }

    const prefix = config?.prefix || "n!";
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift()?.toLowerCase();

    switch (cmd) {
      case "ping":
        await message.reply("🐾 Pong! Meow!");
        break;

      case "help":
        await message.reply(
          `🐾 **Nyanchi Commands**\n` +
            `\`${prefix}ping\` — проверка связи\n` +
            `\`${prefix}help\` — это сообщение\n` +
            `\`${prefix}info\` — информация о сервере\n` +
            `\`${prefix}reload\` — обновить конфиг (для админов)`
        );
        break;

      case "info":
        await message.reply(
          `🌸 **${message.guild.name}**\n` +
            `Members: ${message.guild.memberCount}\n` +
            `AutoMod: ${config?.autoModConfig?.enabled ? "✅" : "❌"}\n` +
            `Welcome: ${config?.welcomeConfig?.enabled ? "✅" : "❌"}`
        );
        break;

      case "reload":
        if (!message.member?.permissions.has("Administrator")) {
          await message.reply("🚫 Только для администраторов!");
          break;
        }
        configCache.delete(message.guild.id);
        await message.reply("🐾 Конфиг обновлён! Мяу!");
        break;
    }
  } catch (err) {
    console.error(`[Bot] Message handler error:`, err);
  }
});

client.on(Events.Error, (err) => {
  console.error("[Bot] Discord client error:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[Bot] Unhandled rejection:", err);
});

process.on("SIGINT", () => {
  console.log("[Bot] Shutting down...");
  client.destroy();
  process.exit(0);
});

client.login(BOT_TOKEN).catch((err) => {
  console.error("[Bot] Failed to login:", err.message);
  process.exit(1);
});