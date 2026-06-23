import React, { useState, useEffect } from "react";
import { WelcomeConfig, AutoModConfig, DiscordRole, GuildConfig, ChatMessage } from "./types";
import { translations, TranslationKeys } from "./translations";
import WelcomeManager from "./components/WelcomeManager";
import AutoModManager from "./components/AutoModManager";
import RoleManager from "./components/RoleManager";
import SetupGuide from "./components/SetupGuide";
import DiscordMock from "./components/DiscordMock";
import LandingPage from "./components/LandingPage";
import { Heart, Moon, Sun, AlertCircle, X, LogIn } from "lucide-react";
import { INVITE_URL } from "./config";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  lang: "ru" | "en";
  reason: "configurator" | "invite" | null;
}

function LoginModal({ isOpen, onClose, onLogin, lang, reason }: LoginModalProps) {
  if (!isOpen) return null;

  const titles = {
    configurator: lang === "ru" ? "🔒 Требуется авторизация" : "🔒 Login Required",
    invite: lang === "ru" ? "🐾 Пригласи Nyanchi!" : "🐾 Invite Nyanchi!",
  };

  const descriptions = {
    configurator: lang === "ru" 
      ? "Чтобы настраивать своего бота, войдите через Discord. Мы получим только список ваших серверов где вы админ — никаких лишних данных!"
      : "To configure your bot, please login via Discord. We only need access to servers where you are admin — nothing else!",
    invite: lang === "ru"
      ? "Чтобы добавить Nyanchi на ваш сервер, сначала войдите через Discord."
      : "To add Nyanchi to your server, please login via Discord first.",
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          title={lang === "ru" ? "Закрыть" : "Close"}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-4 h-4 text-stone-500" />
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce">🐱</div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 mb-2">
            {reason ? titles[reason] : titles.configurator}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            {reason ? descriptions[reason] : descriptions.configurator}
          </p>
        </div>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition shadow-md cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36" aria-hidden="true">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1.07-.79,2.11-1.61,3.12-2.47a75,75,0,0,0,74.77,0c1,.86,2,1.68,3.12,2.47a68.18,68.18,0,0,1-10.5,5,77.06,77.06,0,0,0,6.63,10.85,105.38,105.38,0,0,0,31.62-18.83C129.54,49.12,122.75,26.4,107.7,8.07Z" />
          </svg>
          <span>{lang === "ru" ? "Войти через Discord" : "Login with Discord"}</span>
        </button>

        <p className="text-[10px] text-stone-400 dark:text-stone-500 text-center mt-4 leading-relaxed">
          {lang === "ru" 
            ? "🔐 Безопасно. Используется официальный Discord OAuth2."
            : "🔐 Secure. Uses official Discord OAuth2."}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<"welcome" | "automod" | "roles" | "setup">("welcome");
  const [guildConfig, setGuildConfig] = useState<GuildConfig | null>(null);

  const [session, setSession] = useState<{
    loggedIn: boolean;
    user?: { id: string; username: string; avatar: string };
    guilds?: { id: string; name: string; icon: string }[];
  }>({ loggedIn: false });
  const [selectedGuildId, setSelectedGuildId] = useState<string>("992520265773");

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<"configurator" | "invite" | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>(["role_gamer"]);
  const [botTyping, setBotTyping] = useState<boolean>(false);
  const [systemActivityLog, setSystemActivityLog] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const t: TranslationKeys = translations[lang];

  const fetchSession = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("/api/auth/me", { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.success) {
        setSession(data);
        if (data.loggedIn && data.guilds && data.guilds.length > 0) {
          const hasCurrent = data.guilds.some((g: any) => g.id === selectedGuildId);
          if (!hasCurrent) setSelectedGuildId(data.guilds[0].id);
        }
      }
    } catch (err) {
      console.warn("Session check failed:", err);
      setSession({ loggedIn: false });
    }
  };

  const fetchConfig = async (guildId: string, guildName?: string) => {
    if (!session.loggedIn) return;
    try {
      const url = `/api/guild/config?guildId=${guildId}${guildName ? `&name=${encodeURIComponent(guildName)}` : ""}`;
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) return;
      const data = await res.json();
      if (data.success && data.config) setGuildConfig(data.config);
    } catch (err) {
      console.error("Error loading config:", err);
    }
  };

  useEffect(() => {
    fetchSession();

    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes(window.location.host)) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchSession().then(() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        });
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  useEffect(() => {
    if (!session.loggedIn) return;
    const matchedGuild = session.guilds?.find((g: any) => g.id === selectedGuildId);
    fetchConfig(selectedGuildId, matchedGuild?.name);
  }, [selectedGuildId, session.loggedIn]);

  useEffect(() => {
    if (!guildConfig) return;
    const initMessages: ChatMessage[] = [
      {
        id: "msg_init_bot",
        userId: "bot_nyanchi",
        username: "Nyanchi",
        avatar: "🐱",
        timestamp: "12:00 PM",
        content: lang === "ru" 
          ? "Мяу! Я успешно запущена и готова защищать этот сервер! 🐾🌸"
          : "Meow! I'm successfully loaded and guarding this server! 🐾🌸",
        isBot: true,
      },
      {
        id: "msg_init_user",
        userId: "user_sim",
        username: "Muffin_Cat",
        avatar: "👤",
        timestamp: "12:01 PM",
        content: lang === "ru" 
          ? `Привет, Нянчи! Тестирую "${guildConfig.name}".`
          : `Hey Nyanchi! Testing "${guildConfig.name}".`,
      }
    ];
    setMessages(initMessages);
  }, [guildConfig?.id]);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('Failed to fetch auth URL');
      const { url } = await response.json();
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=750,status=no,resizable=yes');
      if (!authWindow) {
        alert(lang === "ru" ? "Разрешите всплывающие окна." : "Please allow popups.");
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSession({ loggedIn: false });
        setGuildConfig(null);
        setView("landing");
        setSelectedGuildId("992520265773");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleOpenDashboard = () => {
    if (!session.loggedIn) {
      setLoginReason("configurator");
      setPendingAction(() => () => setView("dashboard"));
      setLoginModalOpen(true);
      return;
    }
    setView("dashboard");
  };

  const handleInviteBot = () => {
    if (!session.loggedIn) {
      setLoginReason("invite");
      setPendingAction(() => () => window.open(INVITE_URL, "_blank"));
      setLoginModalOpen(true);
      return;
    }
    window.open(INVITE_URL, "_blank");
  };

  const handleLoginFromModal = () => {
    setLoginModalOpen(false);
    handleConnect();
  };

  const handleSaveConfigs = async (updatedConfig?: GuildConfig) => {
    const configToSave = updatedConfig || guildConfig;
    if (!configToSave) return;
    try {
      const response = await fetch("/api/guild/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: configToSave }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveStatus(t.savedSuccess);
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleWelcomeChange = (newWelcome: WelcomeConfig) => {
    if (!guildConfig) return;
    setGuildConfig({ ...guildConfig, welcomeConfig: newWelcome });
  };

  const handleAutoModChange = (newAutoMod: AutoModConfig) => {
    if (!guildConfig) return;
    setGuildConfig({ ...guildConfig, autoModConfig: newAutoMod });
  };

  const handleCreateRole = (name: string, color: string, isSelfAssignable: boolean, emoji?: string) => {
    if (!guildConfig) return;
    const newRole: DiscordRole = {
      id: `role_${Date.now()}`, name, color, emoji, memberCount: 0, isSelfAssignable,
    };
    const nextConfig = { ...guildConfig, roles: [...guildConfig.roles, newRole] };
    setGuildConfig(nextConfig);
    handleSaveConfigs(nextConfig);
  };

  const handleDeleteRole = (roleId: string) => {
    if (!guildConfig) return;
    const nextRoles = guildConfig.roles.filter((r) => r.id !== roleId);
    setActiveUserRoles(activeUserRoles.filter((id) => id !== roleId));
    const nextConfig = { ...guildConfig, roles: nextRoles };
    setGuildConfig(nextConfig);
    handleSaveConfigs(nextConfig);
  };

  const handleToggleUserRole = (roleId: string) => {
    if (activeUserRoles.includes(roleId)) {
      setActiveUserRoles(activeUserRoles.filter((id) => id !== roleId));
      addSystemLog(lang === "ru" ? `Снята роль: @${roleId}` : `Revoked: @${roleId}`);
    } else {
      setActiveUserRoles([...activeUserRoles, roleId]);
      addSystemLog(lang === "ru" ? `Выдана роль: @${roleId}` : `Claimed: @${roleId}`);
    }
  };

  const addSystemLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setSystemActivityLog((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 49)]);
  };

  const handleSendMessage = async (content: string) => {
    if (!guildConfig) return;
    const userMessageId = `msg_user_${Date.now()}`;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: userMessageId, userId: "user_sim", username: "Muffin_Cat",
      avatar: "👤", timestamp: timeString, content, roles: activeUserRoles,
    };
    setMessages((prev) => [...prev, userMsg]);
    setBotTyping(true);

    try {
      const response = await fetch("/api/bot/simulate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          activeRoles: activeUserRoles.map((id) => guildConfig.roles.find((r) => r.id === id)?.name || id),
          username: "Muffin_Cat",
          lang,
          guildId: guildConfig.id,
        }),
      });
      const data = await response.json();
      
      setTimeout(() => {
        setBotTyping(false);
        if (data.success) {
          if (data.automodTriggered) {
            addSystemLog(`⚠️ AutoMod: "Muffin_Cat" → [${data.action}]`);
            if (data.action === "delete") {
              setMessages((prev) => 
                prev.map((m) => m.id === userMessageId 
                  ? { ...m, content: lang === "ru" ? "⚠️ [УДАЛЕНО]" : "⚠️ [REMOVED]" } 
                  : m)
              );
            }
            const botWarningMsg: ChatMessage = {
              id: `msg_bot_warn_${Date.now()}`,
              userId: "bot_nyanchi",
              username: "Nyanchi",
              avatar: "🐱",
              timestamp: timeString,
              content: data.botReply,
              isBot: true,
              systemEvent: true,
              systemType: "moderation",
              embed: {
                title: lang === "ru" ? "Нарушение!" : "Alert!",
                description: `${data.reason}`,
                color: "#E0533C",
              }
            };
            setMessages((prev) => [...prev, botWarningMsg]);
          } else {
            const botReplyMsg: ChatMessage = {
              id: `msg_bot_${Date.now()}`,
              userId: "bot_nyanchi",
              username: "Nyanchi",
              avatar: "🐱",
              timestamp: timeString,
              content: data.botReply,
              isBot: true,
            };
            setMessages((prev) => [...prev, botReplyMsg]);
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Simulate error:", error);
      setBotTyping(false);
    }
  };

  const handleSimulateJoin = () => {
    if (!guildConfig) return;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    addSystemLog("📥 Simulated join");

    const welcomeMsg: ChatMessage = {
      id: `msg_join_${Date.now()}`,
      userId: "user_natsuki",
      username: "Natsuki_Chan",
      avatar: "👶",
      timestamp: timeString,
      content: "",
      systemEvent: true,
      systemType: "welcome",
      embed: guildConfig.welcomeConfig.embedEnabled ? {
        title: lang === "ru" ? "Новый Котёнок! 🐾" : "New Kitten! 🐾",
        description: guildConfig.welcomeConfig.messageTemplate
          .replace("{user}", "@Natsuki_Chan")
          .replace("{guild}", guildConfig.name)
          .replace("{count}", String(guildConfig.memberCount + 1)),
        thumbnailUrl: guildConfig.welcomeConfig.avatarAsThumbnail ? "https://images.unsplash.com" : undefined,
        imageUrl: guildConfig.welcomeConfig.bannerUrl || "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800&auto=format&fit=crop&q=80",
        color: guildConfig.welcomeConfig.embedColor,
      } : undefined,
    };

    if (!guildConfig.welcomeConfig.embedEnabled) {
      welcomeMsg.content = guildConfig.welcomeConfig.messageTemplate
        .replace("{user}", "@Natsuki_Chan")
        .replace("{guild}", guildConfig.name)
        .replace("{count}", String(guildConfig.memberCount + 1));
    }
    setMessages((prev) => [...prev, welcomeMsg]);
    setGuildConfig({ ...guildConfig, memberCount: guildConfig.memberCount + 1 });
  };

  const handleSimulateLeave = () => {
    if (!guildConfig) return;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    addSystemLog("📤 Simulated leave");

    const leaveMsg: ChatMessage = {
      id: `msg_leave_${Date.now()}`,
      userId: "user_natsuki",
      username: "Natsuki_Chan",
      avatar: "👶",
      timestamp: timeString,
      content: lang === "ru" 
        ? "🐾 Natsuki_Chan покинула. 😿"
        : "🐾 Natsuki_Chan left. 😿",
      systemEvent: true,
      systemType: "leave",
    };
    setMessages((prev) => [...prev, leaveMsg]);
  };
  const borderClass = isDarkMode ? "border-stone-800" : "border-stone-200";

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
      isDarkMode ? "dark bg-stone-950 text-stone-100" : "bg-[#FCFAF7] text-stone-900"
    }`}>
      
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setPendingAction(null);
        }}
        onLogin={handleLoginFromModal}
        lang={lang}
        reason={loginReason}
      />
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${
        isDarkMode ? "bg-stone-950/90 border-stone-800" : "bg-[#FCFAF7]/90 border-amber-900/10"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-18 flex justify-between items-center">
          
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setView("landing")} title="Home">
            <span className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-1.5 lowercase">
              <span className="w-2.5 h-2.5 bg-[#E0533C] rounded-full animate-ping absolute" aria-hidden="true"></span>
              <span className="w-2.5 h-2.5 bg-[#E0533C] rounded-full relative" aria-hidden="true"></span>
              <em>{t.appName}</em>
            </span>
          </div>

          <nav className={`flex items-center gap-1 border rounded-full p-0.5 ${borderClass} bg-stone-100/40`}>
            <button
              onClick={() => setView("landing")}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-full transition-all cursor-pointer ${
                view === "landing" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {t.navHome}
            </button>
            <button
              onClick={handleOpenDashboard}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                view === "dashboard" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {!session.loggedIn && <span className="text-[8px]" aria-hidden="true">🔒</span>}
              {t.navDashboard}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-xs font-semibold text-[#2D7345] bg-[#2D7345]/10 border border-[#2D7345]/20 px-3 py-1 rounded-full animate-pulse mr-2 hidden md:inline-block">
                ✓ {saveStatus}
              </span>
            )}

            {session.loggedIn && session.user ? (
              <div className="flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-semibold bg-[#5865F2]/10 border-[#5865F2]/20 max-w-[200px]" title={session.user.username}>
                <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-[#5865F2]/20 text-[10px]">
                  {session.user.avatar.length > 2 ? (
                    <img src={session.user.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={session.user.username} />
                  ) : (
                    session.user.avatar
                  )}
                </span>
                <span className="truncate max-w-[80px] hidden sm:inline text-stone-700 dark:text-stone-300">{session.user.username}</span>
                <button onClick={handleLogout} className="text-[10px] text-red-500 hover:text-red-600 transition ml-1 font-bold cursor-pointer underline decoration-dotted">
                  {lang === "ru" ? "Выйти" : "Logout"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white text-xs font-bold rounded-full transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 127.14 96.36" aria-hidden="true">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1.07-.79,2.11-1.61,3.12-2.47a75,75,0,0,0,74.77,0c1,.86,2,1.68,3.12,2.47a68.18,68.18,0,0,1-10.5,5,77.06,77.06,0,0,0,6.63,10.85,105.38,105.38,0,0,0,31.62-18.83C129.54,49.12,122.75,26.4,107.7,8.07Z"/>
                </svg>
                <span>{lang === "ru" ? "Войти через Discord" : "Login with Discord"}</span>
              </button>
            )}

            <div className={`flex items-center gap-1 border rounded-full p-0.5 bg-stone-100 ${borderClass}`}>
              <button
                onClick={() => setLang("ru")}
                className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full transition-all cursor-pointer ${
                  lang === "ru" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >RU</button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full transition-all cursor-pointer ${
                  lang === "en" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >EN</button>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 border rounded-full bg-stone-50 hover:bg-stone-100 transition border-stone-200 text-stone-600 hover:text-stone-950 cursor-pointer"
              title={lang === "ru" ? "Сменить тему" : "Toggle theme"}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>
          </div>
        </div>
      </header>
      <main className={`mx-auto px-6 py-8 transition-all duration-300 ${view === "landing" ? "max-w-7xl" : "max-w-[1536px]"}`}>
        
        {view === "landing" && (
          <LandingPage 
            t={t} 
            onStartConfigure={handleOpenDashboard}
            onInviteBot={handleInviteBot}
            isDarkMode={isDarkMode}
            isLoggedIn={session.loggedIn}
            lang={lang}
          />
        )}

        {view === "dashboard" && (
          <>
            {!session.loggedIn ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="text-7xl">🔒</div>
                <h2 className="text-2xl font-black">
                  {lang === "ru" ? "Требуется авторизация" : "Login Required"}
                </h2>
                <p className="text-sm text-stone-500 max-w-md text-center">
                  {lang === "ru" 
                    ? "Войдите через Discord, чтобы открыть конфигуратор."
                    : "Please login via Discord to access the configurator."}
                </p>
                <button
                  onClick={handleConnect}
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold rounded-2xl transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  {lang === "ru" ? "Войти через Discord" : "Login with Discord"}
                </button>
              </div>
            ) : !guildConfig ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <span className="text-4xl animate-bounce">😸</span>
                <p className="text-xs text-stone-500 font-mono font-bold animate-pulse">
                  LOADING GUILD CONFIG...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-6">

                  {session.guilds && session.guilds.length > 0 && (
                    <div className={`p-4 border rounded-2xl bg-stone-50 dark:bg-stone-900/30 space-y-3 ${borderClass}`}>
                      <span className="block text-[10px] uppercase font-extrabold text-[#706B63] tracking-widest">
                        {lang === "ru" ? "🛡️ Управляемые серверы" : "🛡️ Managed Guilds"}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {session.guilds.map((g) => {
                          const isSelected = g.id === selectedGuildId;
                          return (
                            <button
                              key={g.id}
                              onClick={() => setSelectedGuildId(g.id)}
                              className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all text-xs font-bold cursor-pointer ${
                                isSelected
                                  ? "bg-stone-900 border-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 dark:border-stone-100"
                                  : "bg-white hover:bg-stone-100 border-stone-200 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-stone-200 text-base">
                                {g.icon.length > 2 ? <img src={g.icon} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={g.name} /> : g.icon}
                              </span>
                              <span className="truncate">{g.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {session.user?.id === "999999" && (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5 leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold">{lang === "ru" ? "Демо-режим!" : "Demo mode!"}</span>{" "}
                        {lang === "ru" 
                          ? "Настройте DISCORD_CLIENT_ID и DISCORD_CLIENT_SECRET." 
                          : "Configure DISCORD_CLIENT_ID & SECRET."}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-wrap gap-1.5 p-1 bg-stone-100 border rounded-2xl ${borderClass}`}>
                    {[
                      { id: "welcome", label: t.tabWelcome, icon: "💬" },
                      { id: "automod", label: t.tabAutoMod, icon: "🛡️" },
                      { id: "roles", label: t.tabRoles, icon: "👑" },
                      { id: "setup", label: t.tabSetup, icon: "📚" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          activeTab === tab.id
                            ? "bg-white text-stone-900 shadow-md scale-[1.02]"
                            : "text-stone-500 hover:text-stone-800 hover:bg-white/40"
                        }`}
                      >
                        <span aria-hidden="true">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className={`bg-[#FAF8F5]/40 backdrop-blur border rounded-3xl p-6 min-h-[450px] ${borderClass}`}>
                    {activeTab === "welcome" && (
                      <WelcomeManager
                        config={guildConfig.welcomeConfig}
                        guildConfig={guildConfig}
                        onChange={handleWelcomeChange}
                        onSave={() => handleSaveConfigs()}
                        t={t}
                      />
                    )}
                    {activeTab === "automod" && (
                      <AutoModManager
                        config={guildConfig.autoModConfig}
                        guildConfig={guildConfig}
                        onChange={handleAutoModChange}
                        onSave={() => handleSaveConfigs()}
                        t={t}
                        lang={lang}
                      />
                    )}
                    {activeTab === "roles" && (
                      <RoleManager
                        roles={guildConfig.roles}
                        onCreateRole={handleCreateRole}
                        onDeleteRole={handleDeleteRole}
                        t={t}
                      />
                    )}
                    {activeTab === "setup" && (
                      <SetupGuide guildConfig={guildConfig} t={t} lang={lang} />
                    )}
                  </div>
                </div>

                <div className="lg:col-span-6 lg:sticky lg:top-24">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#706B63] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#E0533C] rounded-full" aria-hidden="true"></span>
                        {t.playgroundTitle}
                      </h3>
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-900/10 font-mono px-2 py-0.5 rounded-full font-bold">
                        Sandbox Mode
                      </span>
                    </div>
                    <DiscordMock
                      guildConfig={guildConfig}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      onSimulateJoin={handleSimulateJoin}
                      onSimulateLeave={handleSimulateLeave}
                      onToggleUserRole={handleToggleUserRole}
                      activeRoles={activeUserRoles}
                      t={t}
                      botTyping={botTyping}
                      systemActivityLog={systemActivityLog}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <footer className={`pt-16 pb-12 mt-20 relative overflow-hidden text-left border-t ${borderClass}`}>
        <div className="max-w-7xl mx-auto px-6 space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="space-y-4">
              <span className="text-2xl font-black lowercase flex items-center gap-1.5 select-none">
                <span className="w-3.5 h-3.5 bg-[#E0533C] rounded-full animate-ping absolute" aria-hidden="true"></span>
                <span className="w-3.5 h-3.5 bg-[#E0533C] rounded-full relative" aria-hidden="true"></span>
                <em>{t.appName}</em>
              </span>
              <p className="text-xs text-stone-400 font-bold max-w-sm leading-relaxed">
                Empowering Discord servers with cute, AI-powered moderation. 🐾
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              <a href="#about" className="hover:text-stone-700 transition">Security</a>
              <a href="#about" className="hover:text-stone-700 transition">T.O.S</a>
              <a href="#about" className="hover:text-stone-700 transition">API</a>
            </div>
          </div>
          <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400 font-semibold ${borderClass}`}>
            <span>&copy; {new Date().getFullYear()} Nyanchi Bot.</span>
            <span className="flex items-center gap-1 text-[11px]">
              Made with <Heart className="w-3.5 h-3.5 text-[#E0533C]" fill="#E0533C" /> by kitty team.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}