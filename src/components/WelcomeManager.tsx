import React, { useState, useEffect } from "react";
import { WelcomeConfig, GuildConfig } from "../types";
import { TranslationKeys } from "../translations";
import { Save, AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  config: WelcomeConfig;
  guildConfig: GuildConfig;
  onChange: (config: WelcomeConfig) => void;
  onSave: () => void;
  t: TranslationKeys;
}

interface Channel {
  id: string;
  name: string;
}

export default function WelcomeManager({ config, guildConfig, onChange, onSave, t }: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [botInGuild, setBotInGuild] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const currentChannelId = (config as any).targetChannelId || (config as any).targetChannel || "";

  const loadChannels = () => {
    if (!guildConfig?.id) return;

    setLoading(true);
    setErrorMsg("");
    
    fetch(`/api/guild/channels?guildId=${guildConfig.id}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        console.log("📡 Channels response:", data);
        if (data.success) {
          setChannels(data.channels);
          setBotInGuild(true);
          if (!currentChannelId && data.channels.length > 0) {
            onChange({ ...config, targetChannelId: data.channels[0].id } as any);
          }
        } else {
          setBotInGuild(data.botInGuild ?? false);
          setErrorMsg(data.error || "Не удалось загрузить каналы");
          setChannels([]);
        }
      })
      .catch(err => {
        console.error("Channels fetch error:", err);
        setErrorMsg("Ошибка сети: " + err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChannels();
  }, [guildConfig?.id]);

  const inputClass = "w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#E0533C]/30";
  
  const darkInputClass = "w-full px-4 py-2.5 bg-stone-900 dark:bg-stone-900 border border-stone-700 dark:border-stone-700 text-white dark:text-stone-100 placeholder-stone-500 rounded-xl text-sm font-mono transition focus:outline-none focus:ring-2 focus:ring-[#E0533C]/30";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-black flex items-center gap-2 text-stone-900 dark:text-stone-100">
            🐾 {t.welcomeTitle || "Премиальные Приветствия"}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
            {t.welcomeDesc || "Настройте яркие карточки приветствий, когда новый участник заходит на ваш Discord сервер."}
          </p>
        </div>
        <button
          type="button"
          title={config.enabled ? "Отключить" : "Включить"}
          aria-label="Toggle welcomes"
          onClick={() => onChange({ ...config, enabled: !config.enabled })}
          className={`relative w-12 h-7 rounded-full transition shrink-0 cursor-pointer ${
            config.enabled ? "bg-[#E0533C]" : "bg-stone-300 dark:bg-stone-700"
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition shadow-md ${
            config.enabled ? "left-6" : "left-1"
          }`} />
        </button>
      </div>

      {!botInGuild && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Бот не добавлен на сервер
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              Пригласите Nyanchi на сервер, чтобы увидеть список каналов.
            </p>
            {errorMsg && (
              <p className="text-[10px] text-amber-700/70 dark:text-amber-500/70 mt-2 font-mono">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={loadChannels}
            title="Обновить"
            aria-label="Refresh"
            className="p-2 rounded-lg hover:bg-amber-500/10 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      )}

      {config.enabled && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="welcome-channel" className="text-[10px] uppercase font-extrabold text-stone-500 dark:text-stone-400 tracking-widest">
                Целевой текстовый канал
              </label>
              <button
                type="button"
                onClick={loadChannels}
                title="Обновить список"
                aria-label="Refresh channels"
                className="text-[10px] text-stone-500 hover:text-[#E0533C] transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                Обновить
              </button>
            </div>

            {loading ? (
              <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs text-stone-500 dark:text-stone-400 animate-pulse">
                ⏳ Загрузка каналов...
              </div>
            ) : channels.length === 0 ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">
                  ❌ Каналов не найдено
                </p>
                {errorMsg && (
                  <p className="text-[10px] text-red-500 dark:text-red-400/80 font-mono">
                    {errorMsg}
                  </p>
                )}
                <p className="text-[10px] text-red-500/80 dark:text-red-400/70 leading-relaxed">
                  Проверьте: бот добавлен на сервер • у бота есть право <b>View Channels</b> • сервер выбран правильно
                </p>
              </div>
            ) : (
              <select
                id="welcome-channel"
                title="Выберите канал"
                aria-label="Welcome channel"
                value={currentChannelId}
                onChange={e => onChange({ ...config, targetChannelId: e.target.value } as any)}
                className={inputClass + " cursor-pointer"}
              >
                <option value="">— Выберите канал —</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}># {ch.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label htmlFor="welcome-template" className="text-[10px] uppercase font-extrabold text-stone-500 dark:text-stone-400 tracking-widest block mb-2">
              Шаблон сообщения
            </label>
            <textarea
              id="welcome-template"
              title="Шаблон приветствия"
              placeholder="Welcome to {guild}, {user}!"
              value={config.messageTemplate}
              onChange={e => onChange({ ...config, messageTemplate: e.target.value })}
              rows={3}
              className={inputClass + " font-mono resize-none"}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["{user}", "{guild}", "{count}"].map(v => (
                <span key={v} className="text-[10px] px-2 py-1 bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-md font-mono">
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-stone-100 dark:bg-stone-900/50 rounded-xl border border-stone-300 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              Использовать Embed карточки
            </span>
            <button
              type="button"
              title="Toggle embed"
              aria-label="Toggle embed"
              onClick={() => onChange({ ...config, embedEnabled: !config.embedEnabled })}
              className={`relative w-10 h-6 rounded-full transition cursor-pointer ${
                config.embedEnabled ? "bg-[#2D7345]" : "bg-stone-300 dark:bg-stone-700"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition shadow-md ${
                config.embedEnabled ? "left-5" : "left-1"
              }`} />
            </button>
          </div>

          {config.embedEnabled && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  title="Цвет embed"
                  aria-label="Embed color"
                  value={config.embedColor}
                  onChange={e => onChange({ ...config, embedColor: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0 shrink-0"
                />
                <input
                  type="text"
                  title="HEX код"
                  placeholder="#E0533C"
                  aria-label="HEX color"
                  value={config.embedColor}
                  onChange={e => onChange({ ...config, embedColor: e.target.value })}
                  className={inputClass + " font-mono"}
                />
              </div>
              <div>
                <label htmlFor="welcome-banner" className="text-[10px] uppercase font-extrabold text-stone-500 dark:text-stone-400 tracking-widest block mb-2">
                  URL баннера (опционально)
                </label>
                <input
                  id="welcome-banner"
                  type="url"
                  title="URL баннера"
                  placeholder="https://example.com/banner.png"
                  aria-label="Banner URL"
                  value={config.bannerUrl}
                  onChange={e => onChange({ ...config, bannerUrl: e.target.value })}
                  className={inputClass + " font-mono text-xs"}
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={onSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E0533C] hover:bg-[#C9472F] active:scale-[0.98] text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            Сохранить Конфигурацию
          </button>
        </div>
      )}
    </div>
  );
}