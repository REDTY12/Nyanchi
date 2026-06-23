import React, { useState } from "react";
import { AutoModConfig, AutoModRule, GuildConfig } from "../types";
import { TranslationKeys } from "../translations";
import { Shield, ShieldAlert, BadgeInfo, Check, Ban, AlertTriangle, MessageSquareCode } from "lucide-react";

interface AutoModManagerProps {
  config: AutoModConfig;
  guildConfig: GuildConfig;
  onChange: (newConfig: AutoModConfig) => void;
  onSave: () => void;
  t: TranslationKeys;
  lang: "ru" | "en";
}

export default function AutoModManager({
  config,
  guildConfig,
  onChange,
  onSave,
  t,
  lang,
}: AutoModManagerProps) {
  const [activeTab, setActiveTab] = useState<string>("rule_spam");

  const handleToggleAutoMod = (enabled: boolean) => {
    onChange({ ...config, enabled });
  };

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    const updatedRules = config.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled } : rule
    );
    onChange({ ...config, rules: updatedRules });
  };

  const handleRuleActionChange = (ruleId: string, action: "delete" | "timeout" | "warn") => {
    const updatedRules = config.rules.map((rule) => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          action,
          timeoutDurationSeconds: action === "timeout" ? 60 : undefined,
        };
      }
      return rule;
    });
    onChange({ ...config, rules: updatedRules });
  };

  const handleWordsChange = (ruleId: string, value: string) => {
    const wordList = value
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
    const updatedRules = config.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, blockedWords: wordList } : rule
    );
    onChange({ ...config, rules: updatedRules });
  };

  const handleSpamMessagesChange = (ruleId: string, threshold: number) => {
    const updatedRules = config.rules.map((rule) =>
      rule.id === ruleId ? { ...rule, thresholdMaxMessages: threshold } : rule
    );
    onChange({ ...config, rules: updatedRules });
  };

  return (
    <div className="space-y-6" id="automod-manager">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/10 pb-5">
        <div>
          <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-150 flex items-center gap-2">
            <span>🛡️</span> {t.autoModTitle}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed max-w-xl">
            {t.autoModDesc}
          </p>
        </div>
        <button
          onClick={() => handleToggleAutoMod(!config.enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            config.enabled ? "bg-[#2D7345]" : "bg-stone-200"
          }`}
          id="automod-master-switch"
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              config.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {config.enabled ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-widest mb-2 px-1">
              Safety Checkpoints
            </h3>

            {config.rules.map((rule) => {
              const isActive = activeTab === rule.id;
              const getIcon = () => {
                if (rule.triggerType === "spam") return <ShieldAlert className="w-4 h-4" />;
                if (rule.triggerType === "links") return <Ban className="w-4 h-4" />;
                if (rule.triggerType === "bad_words") return <MessageSquareCode className="w-4 h-4" />;
                return <AlertTriangle className="w-4 h-4" />;
              };

              const titleText = lang === "ru" ? rule.nameRu : rule.name;

              return (
                <button
                  key={rule.id}
                  onClick={() => setActiveTab(rule.id)}
                  className={`w-full text-left p-4 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-stone-900 border-[#E0533C]/30 dark:border-[#E0533C]/60 shadow-md ring-1 ring-[#E0533C]/10"
                      : "bg-white/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700"
                  }`}
                  id={`automod-rule-tab-${rule.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        rule.enabled
                          ? isActive
                            ? "bg-[#E0533C] text-white"
                            : "bg-[#2D7345]/15 text-[#2D7345] dark:text-[#52c174]"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500"
                      }`}
                    >
                      {getIcon()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                        {titleText}
                      </h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                        Trigger: <span className="font-bold uppercase">{rule.triggerType}</span>
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      rule.enabled ? "bg-[#2D7345]" : "bg-stone-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <div className="lg:col-span-2 space-y-6">
            {config.rules
              .filter((rule) => rule.id === activeTab)
              .map((rule) => {
                const titleText = lang === "ru" ? rule.nameRu : rule.name;
                const getRuleDesc = () => {
                  if (rule.triggerType === "spam") return t.filterSpamDesc;
                  if (rule.triggerType === "links") return t.filterLinksDesc;
                  if (rule.triggerType === "bad_words") return t.filterBadWordsDesc;
                  return t.filterInvitesDesc;
                };

                return (
                  <div
                    key={rule.id}
                    className="bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/80 dark:border-stone-850 rounded-2xl p-6 shadow-sm space-y-6"
                    id={`automod-editor-${rule.id}`}
                  >
                    <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#E0533C] tracking-widest">
                          Active Rule Configulator
                        </span>
                        <h2 className="text-xl font-serif text-stone-900 dark:text-stone-100 mt-0.5">
                          {titleText}
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal max-w-lg">
                          {getRuleDesc()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-600 hidden sm:inline">
                          {t.ruleEnabled}
                        </span>
                        <button
                          onClick={() => handleRuleToggle(rule.id, !rule.enabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            rule.enabled ? "bg-[#E0533C]" : "bg-stone-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              rule.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {rule.enabled ? (
                      <div className="space-y-6">
                        {rule.triggerType === "bad_words" && (
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-widest">
                              {t.listBadWords}
                            </label>
                            <textarea
                              value={rule.blockedWords?.join(", ") || ""}
                              onChange={(e) => handleWordsChange(rule.id, e.target.value)}
                              rows={3}
                              placeholder="e.g. spam123, freelink, badword"
                              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0533C]/20 focus:border-[#E0533C] transition-all font-mono"
                              id="automod-blocked-words-input"
                            />
                            <p className="text-[10px] text-stone-400 dark:text-stone-550">
                              Write phrases separated by comma. Nyanchi scans all incoming chats for fuzzy regex matches of these entries.
                            </p>
                          </div>
                        )}

                        {rule.triggerType === "spam" && (
                          <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-widest">
                                    Rapid Fire Threshold
                                  </label>
                                  <span className="text-xs font-mono font-bold text-[#E0533C] bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded border border-amber-900/10 dark:border-amber-900/30">
                                    {rule.thresholdMaxMessages} messages
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={3}
                                  max={12}
                                  step={1}
                                  value={rule.thresholdMaxMessages || 5}
                                  onChange={(e) =>
                                    handleSpamMessagesChange(rule.id, parseInt(e.target.value))
                                  }
                                  className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#E0533C]"
                                />
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal">
                                Triggered when user logs consecutive message signals containing identical context, or emits over <span className="font-bold">{rule.thresholdMaxMessages} messages</span> in 3 interval seconds.
                              </p>
                            </div>
                        )}

                        {rule.triggerType === "links" && (
                          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3">
                            <BadgeInfo className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-amber-950">Preconfigured Regex scanner</h4>
                              <p className="text-[11px] text-amber-900/80 leading-normal">
                                Hyperlink logic automatically blocks absolute links and web addresses (e.g. standard URLs starting with <code className="font-mono bg-amber-100/50 px-1">http://</code> or <code className="font-mono bg-amber-100/50 px-1">https://</code>). Safe domains can be added to bypass filters in production.
                              </p>
                            </div>
                          </div>
                        )}

                        {rule.triggerType === "invites" && (
                          <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex gap-3">
                            <BadgeInfo className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-red-950">Discord API Matcher</h4>
                              <p className="text-[11px] text-red-900/80 leading-normal">
                                Catches all internal invite-links containing keywords like <code className="font-mono bg-red-100/50 px-1">discord.gg/</code> or <code className="font-mono bg-red-105 px-1">discord.com/invite/</code>. This blocks advertisers from poaching your guild audience.
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="pt-4 border-t border-stone-200/50 dark:border-stone-800 space-y-3">
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-widest">
                            {t.ruleAction}
                          </label>
 
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                              { value: "delete", label: t.actionDelete, icon: "🗑️" },
                              { value: "timeout", label: t.actionTimeout, icon: "⏱️" },
                              { value: "warn", label: t.actionWarn, icon: "⚠️" },
                            ].map((option) => {
                              const isChecked = rule.action === option.value;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    handleRuleActionChange(
                                      rule.id,
                                      option.value as "delete" | "timeout" | "warn"
                                    )
                                  }
                                  type="button"
                                  className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                                    isChecked
                                      ? "bg-[#E0533C]/5 dark:bg-[#E0533C]/10 border-[#E0533C] text-stone-900 dark:text-stone-100"
                                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 hover:border-stone-300 dark:hover:border-stone-700 text-stone-600 dark:text-stone-400"
                                  }`}
                                  id={`automod-action-opt-${option.value}`}
                                >
                                  <span className="text-lg shrink-0">{option.icon}</span>
                                  <div className="space-y-0.5">
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider">
                                      {option.value}
                                    </h5>
                                    <p className="text-[11px] leading-tight text-stone-500 dark:text-stone-400">
                                      {option.label}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-stone-200/50 dark:border-stone-800">
                          <button
                            onClick={onSave}
                            className="w-full md:w-auto md:px-8 py-3 bg-[#E0533C] hover:bg-[#E0533C]/90 text-white rounded-xl text-sm font-semibold transition-all shadow shadow-[#E0533C]/20 flex items-center justify-center gap-2 cursor-pointer"
                            id="automod-save-btn"
                          >
                            <span>🛡️</span> {t.saveSettings}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-stone-50/50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                        <span className="text-3xl">💤</span>
                        <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mt-2">Active Rule is Disabled</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-3">
                          Toggle the rule enable switch in the top panel to configure threat triggers and administrative penalties for this rule.
                        </p>
                        <button
                          onClick={() => handleRuleToggle(rule.id, true)}
                          className="px-4 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer"
                        >
                          Enable rule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 dark:bg-stone-900/10 border border-dashed border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors p-12 text-center rounded-2xl flex flex-col items-center justify-center">
          <span className="text-4xl text-stone-400 mb-3 filter grayscale">🛡️💤</span>
          <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">AutoMod deactive</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mt-1 mb-4">
            Toggle the master switch in the top-right corner of the pane to activate the system, allowing you to configure spam blocks, bad words lists, and actions.
          </p>
          <button
            onClick={() => handleToggleAutoMod(true)}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold cursor-pointer py-1.5 transition-all hover:bg-stone-800 dark:hover:bg-stone-200"
          >
            Activate AutoMod System
          </button>
        </div>
      )}
    </div>
  );
}
