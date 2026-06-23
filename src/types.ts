export interface WelcomeConfig {
  enabled: boolean;
  targetChannelId: string;        
  messageTemplate: string;
  embedEnabled: boolean;
  embedColor: string;
  avatarAsThumbnail: boolean;
  bannerUrl: string;
}

export interface AutoModConfig {
  enabled: boolean;
  antiSpam: boolean;
  antiInvite: boolean;
  antiToxic: boolean;
  bannedWords: string[];
  action: "warn" | "delete" | "kick" | "ban";
}

export interface DiscordRole {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  memberCount: number;
  isSelfAssignable: boolean;
}

export interface GuildConfig {
  id: string;
  name: string;
  memberCount: number;
  welcomeConfig: WelcomeConfig;
  autoModConfig: AutoModConfig;
  roles: DiscordRole[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  timestamp: string;
  content: string;
  roles?: string[];
  isBot?: boolean;
  systemEvent?: boolean;
  systemType?: "welcome" | "leave" | "moderation";
  embed?: {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    imageUrl?: string;
    color?: string;
  };
}