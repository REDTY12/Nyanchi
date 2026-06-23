import React, { useState } from "react";
import { GuildConfig } from "../types";
import { TranslationKeys } from "../translations";
import { Link, CheckCircle, HelpCircle, ArrowUpRight, Copy, Check, Users } from "lucide-react";

interface SetupGuideProps {
  guildConfig: GuildConfig;
  t: TranslationKeys;
  lang?: "ru" | "en";
}

export default function SetupGuide({ guildConfig, t, lang = "ru" }: SetupGuideProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [checks, setChecks] = useState({
    invite: true,
    hierarchy: false,
    channels: false,
    sandbox: false,
  });

  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=123456789123456789&permissions=8&scope=bot%20applications.commands&guild_id=${guildConfig.id}`;
  const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "http://localhost:3000/auth/callback";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks({ ...checks, [key]: !checks[key] });
  };

  return (
    <div className="space-y-6" id="setup-guide">
      <div className="border-b border-amber-900/10 pb-5">
        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2">
          <span>📚</span> {t.setupTitle}
        </h2>
        <p className="text-sm text-stone-500 mt-1 leading-relaxed max-w-xl">
          {t.setupDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {[
            {
              id: "invite",
              num: "Step 01",
              title: t.step1Title,
              desc: t.step1Desc,
              element: (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{t.inviteBtn}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  <button
                    onClick={handleCopyLink}
                    type="button"
                    className="px-4 py-2.5 border border-stone-200 hover:border-stone-300 bg-white text-stone-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-[#2D7345]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-stone-400" />
                        <span>Copy Authorize link</span>
                      </>
                    )}
                  </button>
                </div>
              ),
            },
            {
              id: "hierarchy",
              num: "Step 02",
              title: t.step2Title,
              desc: t.step2Desc,
              element: (
                <div className="mt-4 bg-stone-100/65 border border-stone-200/60 p-4 rounded-xl max-w-md space-y-2">
                  <h5 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">
                    Server Role Order Example
                  </h5>
                  <div className="space-y-1.5 font-sans">
                    <div className="flex items-center gap-2 text-xs bg-white py-1.5 px-3 rounded-lg border border-stone-200 shadow-sm font-bold text-[#E0533C]">
                      <span>👑</span> <span>Nyanchi Bot (Active Moderator)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-stone-50 py-1.5 px-3 rounded-lg border border-stone-200/50 text-stone-400">
                      <span>•</span> <span>Admin / Mod 🛡️</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-stone-50 py-1.5 px-3 rounded-lg border border-stone-200/50 text-stone-500">
                      <span>•</span> <span>Gamer 🎮</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1 italic">
                    💡 High-level priority allows instant censorship blocks and mod warning flags!
                  </p>
                </div>
              ),
            },
            {
              id: "channels",
              num: "Step 03",
              title: t.step3Title,
              desc: t.step3Desc,
              element: (
                <div className="mt-2 text-xs text-stone-500">
                  Select your custom system logger target inside the <strong className="text-stone-700 font-semibold">"Greetings"</strong> tab to log user entrance streams in beautiful localized styles.
                </div>
              ),
            },
            {
              id: "sandbox",
              num: "Step 04",
              title: t.step4Title,
              desc: t.step4Desc,
              element: null,
            },
          ].map((item) => (
            <div
              key={item.id}
              className={`p-6 bg-white/75 backdrop-blur-sm border rounded-2xl transition-all shadow-sm flex items-start gap-5 ${
                checks[item.id as keyof typeof checks]
                  ? "border-[#2D7345]/30 bg-white"
                  : "border-stone-200"
              }`}
              id={`setup-step-${item.id}`}
            >
              <button
                onClick={() => toggleCheck(item.id as keyof typeof checks)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer mt-1 transition-all ${
                  checks[item.id as keyof typeof checks]
                    ? "bg-[#2D7345] border-[#2D7345] text-white"
                    : "border-stone-300 bg-white hover:border-stone-400"
                }`}
              >
                {checks[item.id as keyof typeof checks] && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-stone-400 font-bold uppercase tracking-widest">
                    {item.num}
                  </span>
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-semibold">
                    {checks[item.id as keyof typeof checks] ? "Completed" : "Pending action"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-800 font-serif mt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-xl">
                  {item.desc}
                </p>

                {item.element}
              </div>
            </div>
          ))}
          <div className="bg-[#5865F2]/5 border border-[#5865F2]/25 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚙️</span>
              <h3 className="text-base font-serif font-black text-stone-900 leading-none">
                {lang === "ru" ? "Инструкция по настройке в Discord Developer Portal" : "Discord Developer Portal Configuration Manual"}
              </h3>
            </div>
            
            <p className="text-xs text-stone-650 leading-relaxed font-medium">
              {lang === "ru" 
                ? "Выполните эти 5 простых шагов на официальном портале Discord, чтобы создать своего бота и связать его с данной панелью управления:" 
                : "Complete these 5 straightforward steps on the official Discord developer console to spin up your custom bot and bind its configs:"}
            </p>

            <div className="space-y-4 font-sans text-xs border-stone-250">
              <div className="space-y-1">
                <span className="font-extrabold text-[#5865F2]">1. {lang === "ru" ? "Создайте приложение" : "Create Application"}</span>
                <p className="text-stone-500 leading-relaxed pl-3 border-l border-stone-200">
                  {lang === "ru" 
                    ? "Откройте Discord Developer Portal (кликните по кнопке ниже) → нажмите New Application → введите любое имя бота (например, Nyanchi) и сохраните." 
                    : "Open Discord Developer Portal (by tapping the link button below) → click New Application → choose any custom name (like Nyanchi) and submit."}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-[#5865F2]">2. {lang === "ru" ? "Настройте Redirect URI в OAuth2" : "Configure OAuth2 Redirect URIs"}</span>
                <div className="text-stone-500 leading-relaxed pl-3 border-l border-stone-200 space-y-2">
                  <span>
                    {lang === "ru" 
                      ? "В левом меню выберите OAuth2 → General → в секции Redirects нажмите Add Redirect. Вставьте ваш callback-адрес и нажмите Save Changes:" 
                      : "In the left-hand menu, navigate to OAuth2 → General → scroll to Redirects → click Add Redirect. Insert the exact callback URL below and save:"}
                  </span>
                  <span className="flex items-center gap-1.5 mt-1.5 p-1.5 bg-stone-100 border border-stone-200 rounded-lg max-w-md font-mono select-all">
                    <span className="truncate flex-1 text-[10px] text-stone-600">{callbackUrl}</span>
                    <button onClick={handleCopyCallback} className="p-1 hover:bg-stone-200 rounded text-stone-500 shrink-0 cursor-pointer" title="Copy Redirect URL">
                      {copiedCallback ? <Check className="w-3 h-3 text-[#2D7345]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-[#5865F2]">3. {lang === "ru" ? "Задайте переменные в AI Studio" : "Define Credentials in AI Studio"}</span>
                <p className="text-stone-500 leading-relaxed pl-3 border-l border-stone-200">
                  {lang === "ru" 
                    ? "Скопируйте Client ID и Client Secret со вкладки OAuth2 → General и вставьте в настройки окружения в AI Studio как DISCORD_CLIENT_ID и DISCORD_CLIENT_SECRET. Также зайдите во вкладку Bot, нажмите Reset Token и задайте токен в DISCORD_TOKEN." 
                    : "Copy both Client ID and Client Secret on the OAuth2 → General page, then update AI Studio secrets with DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET. Choose Bot → click Reset Token, and update DISCORD_TOKEN."}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-[#5865F2]">4. {lang === "ru" ? "Активируйте Privileged Gateway Intents" : "Enable Privileged Gateway Intents"}</span>
                <p className="text-stone-500 leading-relaxed pl-3 border-l border-stone-200">
                  {lang === "ru" 
                    ? "Важнейший шаг! Перейдите в раздел Bot, найдите блок Privileged Gateway Intents и включите три тумблера: Presence Intent, Server Members Intent, и Message Content Intent. Это позволит Нянчи обрабатывать сообщения и приветствовать игроков." 
                    : "Crucial step! Go into Bot settings, locate the Privileged Gateway Intents subheader, and toggle all 3 triggers: Presence, Server Members, and Message Content. This allows Nyanchi to greet newcomers and sweep spam."}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-[#5865F2]">5. {lang === "ru" ? "Сгенерируйте ссылку приглашения" : "Generate Invitation URL"}</span>
                <p className="text-stone-500 leading-relaxed pl-3 border-l border-stone-200">
                  {lang === "ru" 
                    ? "В боковом меню выберите OAuth2 → URL Generator. В колонке SCOPES отметьте bot и applications.commands. В появившейся колонке BOT PERMISSIONS выберите Administrator. Перейдите по сгенерированной внизу ссылке и авторизуйте бота на свой сервер!" 
                    : "In the OAuth2 → URL Generator sidebar, tick scopes for bot and applications.commands. In the subsequent permissions grid, select Administrator. Open the output link in any new browser tab to add the bot!"}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer duration-150"
              >
                <span>Discord Developer Portal</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative">
              <span className="text-3xl">😽🌸</span>
              <h3 className="text-lg font-serif tracking-tight text-white leading-snug">
                Authorized Guard
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                Nyanchi secures your online gaming, lifestyle, and developer chat guilds. Configs from this panel are deployed in milliseconds.
              </p>

              <div className="pt-4 border-t border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Guarded Server</span>
                  <span className="font-bold text-stone-200">{guildConfig.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Live Filter Speed</span>
                  <span className="font-bold text-[#2D7345]">~3ms</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Service Status</span>
                  <span className="font-bold text-[#2D7345]">OPERATIONAL</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Deployment Protocol
              </span>
              <HelpCircle className="w-4 h-4 text-stone-500 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>

          <div className="bg-white/70 border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-widest">
              Setup F.A.Q.
            </h4>
            <div className="space-y-2">
              <div>
                <h5 className="text-xs font-bold text-stone-700">Does it charge fees?</h5>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                  No, Nyanchi's core configuration system, including AutoMod, reaction roles, and greet cards, is fully free!
                </p>
              </div>
              <div>
                <h5 className="text-xs font-bold text-stone-700">Need specific invite permissions?</h5>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                  The bot requests administrative rights to delete message violations and handle user timeout commands automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
