import React, { useState } from "react";
import { TranslationKeys } from "../translations";
import { Sparkles, Shield, Users, Zap, ArrowRight, Bot, Star, Copy, Check, ExternalLink } from "lucide-react";
import { INVITE_URL } from "../config"; 

interface LandingPageProps {
  t: TranslationKeys;
  onStartConfigure: () => void;
  onInviteBot: () => void;
  isDarkMode: boolean;
  isLoggedIn: boolean;
  lang: "ru" | "en";
}
export default function LandingPage({ 
  t, 
  onStartConfigure, 
  onInviteBot, 
  isDarkMode, 
  isLoggedIn, 
  lang 
}: LandingPageProps) {

  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      const textarea = document.createElement("textarea");
      textarea.value = INVITE_URL;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: lang === "ru" ? "AI-приветствия" : "AI Welcomes",
      desc: lang === "ru" 
        ? "Уникальные приветствия для каждого нового участника" 
        : "Unique greetings for every new member",
      color: "#E0533C",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: lang === "ru" ? "Авто-модерация" : "Auto-Moderation",
      desc: lang === "ru" 
        ? "Защита от спама, инвайтов и токсичности 24/7" 
        : "Spam, invites, toxicity protection 24/7",
      color: "#2D7345",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: lang === "ru" ? "Управление ролями" : "Role Management",
      desc: lang === "ru" 
        ? "Reaction roles и кастомные права без головной боли" 
        : "Reaction roles and custom perms without headache",
      color: "#5865F2",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: lang === "ru" ? "Молниеносно" : "Lightning Fast",
      desc: lang === "ru" 
        ? "Минимальная задержка, максимум стабильности" 
        : "Minimal latency, maximum stability",
      color: "#F59E0B",
    },
  ];

  const stats = [
    { 
      value: "🛡️", 
      label: lang === "ru" ? "AutoMod" : "AutoMod" 
    },
    { 
      value: "👋", 
      label: lang === "ru" ? "Приветствия" : "Welcomes" 
    },
    { 
      value: "👑", 
      label: lang === "ru" ? "Роли" : "Roles" 
    },
    { 
      value: "🤖", 
      label: lang === "ru" ? "AI чат" : "AI Chat" 
    },
  ];
  return (
    <div className="space-y-20 py-8">
      <section className="text-center space-y-8 pt-12 pb-8">
        <div className="relative inline-block">
          <div className="text-8xl md:text-9xl animate-bounce relative z-10">🐱</div>
          <div className="absolute -top-2 -right-4 text-3xl animate-pulse">✨</div>
          <div className="absolute -bottom-2 -left-4 text-3xl animate-pulse delay-150">🌸</div>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${
          isDarkMode 
            ? "bg-[#E0533C]/10 border-[#E0533C]/30 text-[#E0533C]" 
            : "bg-[#E0533C]/10 border-[#E0533C]/20 text-[#E0533C]"
        }`}>
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{lang === "ru" ? "Бета-версия • Бесплатно" : "Beta • Free Forever"}</span>
        </div>
        <h1 className={`text-5xl md:text-7xl font-black tracking-tighter leading-none ${
          isDarkMode ? "text-stone-100" : "text-stone-900"
        }`}>
          {lang === "ru" ? (
            <>
              Самый <em className="text-[#E0533C] not-italic">милый</em><br />
              Discord-бот в мире
            </>
          ) : (
            <>
              The <em className="text-[#E0533C] not-italic">cutest</em><br />
              Discord bot ever
            </>
          )}
        </h1>
        <p className={`text-base md:text-xl max-w-2xl mx-auto leading-relaxed ${
          isDarkMode ? "text-stone-400" : "text-stone-600"
        }`}>
          {lang === "ru"
            ? "Nyanchi — это AI-powered бот для модерации, приветствий и управления вашим Discord-сервером. Просто настрой и забудь! 🐾"
            : "Nyanchi is an AI-powered bot for moderation, welcomes, and managing your Discord server. Just set it and forget it! 🐾"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <button
            onClick={onInviteBot}
            className="group flex items-center gap-2.5 px-7 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.97] text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-[#5865F2]/30 cursor-pointer duration-150"
          >
            <Bot className="w-4 h-4" />
            <span>{lang === "ru" ? "Пригласить Nyanchi" : "Invite Nyanchi"}</span>
            {!isLoggedIn && <span className="text-[10px] opacity-70">🔒</span>}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={onStartConfigure}
            className={`group flex items-center gap-2.5 px-7 py-3.5 border-2 active:scale-[0.97] text-sm font-bold rounded-full transition-all cursor-pointer duration-150 ${
              isDarkMode 
                ? "border-stone-700 hover:border-stone-500 text-stone-200 hover:bg-stone-900" 
                : "border-stone-300 hover:border-stone-500 text-stone-800 hover:bg-stone-50"
            }`}
          >
            <span>{lang === "ru" ? "Открыть конфигуратор" : "Open Configurator"}</span>
            {!isLoggedIn && <span className="text-[10px] opacity-70">🔒</span>}
          </button>
        </div>
        {!isLoggedIn && (
          <p className={`text-xs ${isDarkMode ? "text-stone-500" : "text-stone-400"}`}>
            {lang === "ru" 
              ? "🔐 Требуется вход через Discord для конфигурации" 
              : "🔐 Discord login required for configuration"}
          </p>
        )}
        {isLoggedIn && (
          <p className="text-xs text-[#2D7345] font-bold">
            {lang === "ru" 
              ? "✅ Вы вошли в систему!" 
              : "✅ You are logged in!"}
          </p>
        )}
      </section>
      <section className={`grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y ${
        isDarkMode ? "border-stone-800" : "border-stone-200"
      }`}>
        {stats.map((stat, i) => (
          <div key={i} className="text-center space-y-1">
            <div className={`text-3xl md:text-4xl font-black ${isDarkMode ? "text-stone-100" : "text-stone-900"}`}>
              {stat.value}
            </div>
            <div className={`text-[10px] uppercase font-bold tracking-widest ${isDarkMode ? "text-stone-500" : "text-stone-400"}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center gap-2 text-[10px] uppercase font-extrabold tracking-widest ${
            isDarkMode ? "text-stone-500" : "text-stone-400"
          }`}>
            <span className="w-1.5 h-1.5 bg-[#E0533C] rounded-full"></span>
            <span>{lang === "ru" ? "Возможности" : "Features"}</span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${
            isDarkMode ? "text-stone-100" : "text-stone-900"
          }`}>
            {lang === "ru" ? "Всё для вашего сервера" : "Everything for your server"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-6 border rounded-3xl space-y-3 transition hover:scale-[1.02] hover:shadow-lg cursor-default ${
                isDarkMode 
                  ? "bg-stone-900/50 border-stone-800 hover:bg-stone-900" 
                  : "bg-white border-stone-200 hover:bg-stone-50"
              }`}
            >
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className={`text-base font-extrabold ${isDarkMode ? "text-stone-100" : "text-stone-900"}`}>
                {feature.title}
              </h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center gap-2 text-[10px] uppercase font-extrabold tracking-widest ${
            isDarkMode ? "text-stone-500" : "text-stone-400"
          }`}>
            <span className="w-1.5 h-1.5 bg-[#E0533C] rounded-full"></span>
            <span>{lang === "ru" ? "Как это работает" : "How it works"}</span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${
            isDarkMode ? "text-stone-100" : "text-stone-900"
          }`}>
            {lang === "ru" ? "Запустите бота за 3 шага" : "Launch bot in 3 steps"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div
            className={`p-6 border rounded-3xl space-y-4 relative ${
              isDarkMode 
                ? "bg-stone-900/50 border-stone-800" 
                : "bg-white border-stone-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isLoggedIn 
                    ? "bg-[#2D7345] text-white" 
                    : isDarkMode ? "bg-stone-800 text-stone-400" : "bg-stone-200 text-stone-500"
                }`}>
                  {isLoggedIn ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-black">01</span>}
                </div>
                <span className={`text-[10px] uppercase font-extrabold tracking-widest ${
                  isDarkMode ? "text-stone-500" : "text-stone-400"
                }`}>
                  Step 01
                </span>
              </div>
              {isLoggedIn && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2D7345]/10 text-[#2D7345] border border-[#2D7345]/20">
                  {lang === "ru" ? "Готово" : "Completed"}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h3 className={`text-base font-extrabold ${isDarkMode ? "text-stone-100" : "text-stone-900"}`}>
                {lang === "ru" ? "1. Пригласите Nyanchi" : "1. Invite Nyanchi Bot"}
              </h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                {lang === "ru" 
                  ? "Используйте ссылку ниже, чтобы добавить бота на ваш активный сервер с безопасным набором прав." 
                  : "Use the link below to request our application into your active server and safe permissions registry."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={onInviteBot}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-[11px] font-bold rounded-xl transition cursor-pointer dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
              >
                <span className="truncate">
                  {lang === "ru" ? "АВТОРИЗОВАТЬ И ДОБАВИТЬ" : "AUTHORIZE & ADD TO SERVER"}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </button>

              <button
                onClick={handleCopyLink}
                title={copied ? (lang === "ru" ? "Скопировано!" : "Copied!") : INVITE_URL}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  copied
                    ? "bg-[#2D7345]/10 border-[#2D7345]/30 text-[#2D7345]"
                    : isDarkMode
                      ? "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="whitespace-nowrap">
                  {copied 
                    ? (lang === "ru" ? "Скопировано" : "Copied!") 
                    : (lang === "ru" ? "Копировать" : "Copy link")}
                </span>
              </button>
            </div>
          </div>
          <div
            className={`p-6 border rounded-3xl space-y-4 relative ${
              isDarkMode 
                ? "bg-stone-900/50 border-stone-800" 
                : "bg-white border-stone-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isLoggedIn 
                    ? "bg-[#2D7345] text-white" 
                    : isDarkMode ? "bg-stone-800 text-stone-400" : "bg-stone-200 text-stone-500"
                }`}>
                  {isLoggedIn ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-black">02</span>}
                </div>
                <span className={`text-[10px] uppercase font-extrabold tracking-widest ${
                  isDarkMode ? "text-stone-500" : "text-stone-400"
                }`}>
                  Step 02
                </span>
              </div>
              {isLoggedIn && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2D7345]/10 text-[#2D7345] border border-[#2D7345]/20">
                  {lang === "ru" ? "Готово" : "Completed"}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h3 className={`text-base font-extrabold ${isDarkMode ? "text-stone-100" : "text-stone-900"}`}>
                {lang === "ru" ? "2. Войдите через Discord" : "2. Login with Discord"}
              </h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                {lang === "ru" 
                  ? "Авторизуйтесь, чтобы получить доступ к настройкам своих серверов." 
                  : "Authorize to get access to your servers configuration."}
              </p>
            </div>

            <button
              onClick={onStartConfigure}
              disabled={isLoggedIn}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-bold rounded-xl transition cursor-pointer ${
                isLoggedIn 
                  ? "bg-[#2D7345]/10 text-[#2D7345] border border-[#2D7345]/20 cursor-default"
                  : "bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white"
              }`}
            >
              {isLoggedIn 
                ? (lang === "ru" ? "✓ Авторизован" : "✓ Logged in") 
                : (lang === "ru" ? "ВОЙТИ ЧЕРЕЗ DISCORD" : "LOGIN WITH DISCORD")}
            </button>
          </div>
          <div
            className={`p-6 border rounded-3xl space-y-4 relative ${
              isDarkMode 
                ? "bg-stone-900/50 border-stone-800" 
                : "bg-white border-stone-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-stone-800 text-stone-400" : "bg-stone-200 text-stone-500"
                }`}>
                  <span className="text-[10px] font-black">03</span>
                </div>
                <span className={`text-[10px] uppercase font-extrabold tracking-widest ${
                  isDarkMode ? "text-stone-500" : "text-stone-400"
                }`}>
                  Step 03
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className={`text-base font-extrabold ${isDarkMode ? "text-stone-100" : "text-stone-900"}`}>
                {lang === "ru" ? "3. Настройте всё" : "3. Configure everything"}
              </h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
                {lang === "ru" 
                  ? "Используйте удобный конфигуратор без кода для тонкой настройки." 
                  : "Use beautiful no-code configurator to fine-tune everything."}
              </p>
            </div>

            <button
              onClick={onStartConfigure}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[11px] font-bold rounded-xl transition cursor-pointer border ${
                isDarkMode
                  ? "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
                  : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {lang === "ru" ? "ОТКРЫТЬ КОНФИГУРАТОР" : "OPEN CONFIGURATOR"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>
      <section className={`relative overflow-hidden rounded-3xl p-10 md:p-16 text-center space-y-6 border ${
        isDarkMode 
          ? "bg-gradient-to-br from-[#E0533C]/10 via-stone-900 to-[#5865F2]/10 border-stone-800" 
          : "bg-gradient-to-br from-[#E0533C]/5 via-amber-50 to-[#5865F2]/5 border-stone-200"
      }`}>
        <div className="text-6xl">🐾</div>
        <h2 className={`text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto ${
          isDarkMode ? "text-stone-100" : "text-stone-900"
        }`}>
          {lang === "ru" 
            ? "Готовы сделать свой сервер уютнее?" 
            : "Ready to make your server cozier?"}
        </h2>
        <p className={`text-base max-w-xl mx-auto ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
          {lang === "ru"
            ? "Присоединяйтесь к тысячам сообществ, которые уже используют Nyanchi"
            : "Join thousands of communities already using Nyanchi"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <button
            onClick={onInviteBot}
            className="group flex items-center gap-2.5 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.97] text-white text-sm font-bold rounded-full transition-all shadow-xl hover:shadow-[#5865F2]/40 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>{lang === "ru" ? "Пригласить Nyanchi сейчас" : "Invite Nyanchi Now"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={handleCopyLink}
            className={`group flex items-center gap-2 px-6 py-4 border-2 text-sm font-bold rounded-full transition-all cursor-pointer ${
              copied 
                ? "border-[#2D7345] text-[#2D7345] bg-[#2D7345]/5"
                : isDarkMode 
                  ? "border-stone-700 hover:border-stone-500 text-stone-200 hover:bg-stone-900" 
                  : "border-stone-300 hover:border-stone-500 text-stone-800 hover:bg-white"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>
              {copied 
                ? (lang === "ru" ? "Скопировано!" : "Copied!")
                : (lang === "ru" ? "Скопировать ссылку" : "Copy invite link")}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
