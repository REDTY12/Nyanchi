import React, { useState, useRef, useEffect } from "react";
import { GuildConfig, ChatMessage, DiscordRole, SimulatedUser } from "../types";
import { TranslationKeys } from "../translations";
import { Send, Hash, Users, Sparkles, MessageCircle, Info, Zap, AlertTriangle, ShieldCheck } from "lucide-react";

interface DiscordMockProps {
  guildConfig: GuildConfig;
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onSimulateJoin: () => void;
  onSimulateLeave: () => void;
  onToggleUserRole: (roleId: string) => void;
  activeRoles: string[]; // Role IDs active on the current simulating user
  t: TranslationKeys;
  botTyping: boolean;
  systemActivityLog: string[];
}

export default function DiscordMock({
  guildConfig,
  messages,
  onSendMessage,
  onSimulateJoin,
  onSimulateLeave,
  onToggleUserRole,
  activeRoles,
  t,
  botTyping,
  systemActivityLog,
}: DiscordMockProps) {
  const [inputText, setInputText] = useState("");
  const [activeChannelId, setActiveChannelId] = useState("ch_general");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates (Directly setting scrollTop prevents iframe page-bouncing)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, botTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  // Filter messages based on active channel
  const filteredMessages = messages.filter((msg) => {
    // If welcomeConfig lists a target welcome channel, welcome events go there.
    // General chat messages go to ch_general.
    // System warnings or logs can stream anywhere or based on context.
    const isWelcomeEvent = msg.systemType === "welcome" || msg.systemType === "leave";
    
    if (activeChannelId === guildConfig.welcomeConfig.channelId) {
      return isWelcomeEvent || msg.systemType === "moderation";
    } else if (activeChannelId === "ch_general") {
      return !isWelcomeEvent;
    }
    // general fallback
    return true;
  });

  return (
    <div className="bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col h-[650px] font-sans" id="discord-playground">
      {/* 1. Client Top Banner Header */}
      <div className="px-5 py-4 bg-stone-950 border-b border-stone-900 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-800 border border-stone-700/60 text-base">
            😸
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-white font-bold text-sm leading-tight">
                {guildConfig.name}
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D7345]" />
            </div>
            <p className="text-[10px] text-[#2D7345] font-mono leading-none mt-0.5 font-bold">
              ● {t.botStatusText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel Title Tab Indicator */}
          <span className="text-[10px] bg-stone-800 px-2.5 py-1 rounded-md text-stone-300 font-mono font-bold tracking-wider uppercase select-none">
            #{guildConfig.channels.find((c) => c.id === activeChannelId)?.name || "channel"}
          </span>
        </div>
      </div>

      {/* 2. Primary Layout Grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left column: Channel Tree Directory */}
        <div className="w-40 bg-[#181614] border-r border-stone-900 flex flex-col justify-between p-3 shrink-0 hidden sm:flex overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider px-2">
                Text Channels
              </span>
              <div className="space-y-0.5 mt-1">
                {guildConfig.channels
                  .filter((c) => c.type === "text")
                  .map((ch) => {
                    const isSelected = activeChannelId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannelId(ch.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-stone-800 text-stone-100"
                            : "text-stone-400 hover:bg-stone-900 hover:text-stone-200"
                        }`}
                      >
                        <Hash className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{ch.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider px-2">
                Voice Channelses
              </span>
              <div className="space-y-0.5 mt-1">
                {guildConfig.channels
                  .filter((c) => c.type === "voice")
                  .map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-stone-500 font-medium select-none"
                    >
                      <span>🔊</span>
                      <span className="truncate">{ch.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Quick Active user identity card log */}
          <div className="bg-stone-900/60 p-2.5 border border-stone-800 rounded-xl space-y-1">
            <span className="text-[9px] text-[#E0533C] uppercase tracking-widest font-bold">Simulator User</span>
            <div className="flex items-center gap-2">
              <span className="text-[#a5b4fc] text-xs font-bold truncate">Muffin_Cat</span>
            </div>
            {/* Roles chips in bottom */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {activeRoles.length === 0 ? (
                <span className="text-[8px] text-stone-500 font-mono">No roles</span>
              ) : (
                activeRoles.map((rid) => {
                  const role = guildConfig.roles.find((r) => r.id === rid);
                  if (!role) return null;
                  return (
                    <span
                      key={rid}
                      className="text-[8px] bg-stone-800 px-1.5 py-0.2 rounded border border-stone-700/60 font-mono"
                      style={{ color: role.color }}
                    >
                      {role.emoji || ""} {role.name.split(" ")[0]}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Middle column: Active Chat messages Stream */}
        <div className="flex-1 flex flex-col bg-stone-900 min-w-0">
          {/* Chat scrolling container */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            
            {/* Direct Channel Greeting Banner */}
            <div className="p-4 bg-stone-950/40 rounded-xl border border-stone-800/40 space-y-1.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-800/80 flex items-center justify-center text-stone-300 font-bold">
                #
              </div>
              <h4 className="text-stone-200 text-sm font-bold">
                Welcome to #{guildConfig.channels.find((c) => c.id === activeChannelId)?.name || "channel"}!
              </h4>
              <p className="text-stone-500 text-[11px]">
                This is the absolute beginning of your configured channel's history log. Sim rules and triggers stream here!
              </p>
            </div>

            {/* Render messages */}
            {filteredMessages.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-60">
                <span className="text-2xl mb-1">🐾💤</span>
                <p className="text-xs text-stone-500">
                  No notifications inside this channel. Use simulated buttons or triggers!
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isBot = msg.isBot;
                
                // If it's a join/leave event or standard welcome/embed alert
                if (msg.systemEvent) {
                  return (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl border border-stone-800/80 bg-stone-950/30 flex items-start gap-3 text-xs leading-normal font-sans"
                    >
                      <span className="text-base shrink-0">
                        {msg.systemType === "welcome" ? "📥" : msg.systemType === "leave" ? "📤" : "🛡️"}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-400 font-mono text-[10px]">{msg.timestamp}</span>
                          <span className={`font-semibold  ${msg.systemType === "moderation" ? "text-amber-500" : "text-stone-300"}`}>
                            {msg.systemType === "welcome"
                              ? "Member Joined Server"
                              : msg.systemType === "leave"
                              ? "Member Departed Server"
                              : "AutoMod Penalty Flagged"}
                          </span>
                        </div>

                        {/* Embed Box */}
                        {msg.embed ? (
                          <div
                            className="border-l-4 rounded-r-lg bg-stone-950/80 p-3 mt-1.5 space-y-2 max-w-sm"
                            style={{ borderColor: msg.embed.color || "#E0533C" }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-0.5">
                                {msg.embed.title && (
                                  <h5 className="text-stone-100 font-bold text-xs">{msg.embed.title}</h5>
                                )}
                                <p className="text-stone-300 text-[11px] whitespace-pre-wrap">{msg.embed.description}</p>
                              </div>
                              {msg.embed.thumbnailUrl && (
                                <span className="text-2xl filter drop-shadow">👶🐾</span>
                              )}
                            </div>
                            {msg.embed.imageUrl && (
                              <div className="relative rounded overflow-hidden h-16 border border-stone-900">
                                <img
                                  src={msg.embed.imageUrl}
                                  alt="embed"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-stone-200">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  );
                }

                {/* Normal messages */}
                return (
                  <div key={msg.id} className="flex items-start gap-3 group">
                    <span className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700/60 overflow-hidden flex items-center justify-center text-base">
                      {msg.avatar || "👤"}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-100 hover:underline cursor-pointer text-xs font-bold">
                          {msg.username}
                        </span>

                        {isBot && (
                          <span className="bg-indigo-600/80 text-white font-mono font-bold uppercase py-0.2 px-1 rounded text-[8px] scale-90">
                            Bot
                          </span>
                        )}

                        <span className="text-[10px] text-stone-500 font-mono select-none">
                          {msg.timestamp}
                        </span>
                      </div>

                      <p className="text-stone-100 text-xs mt-1 leading-relaxed break-words font-sans">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {/* Live Typing feedback simulation indicator */}
            {botTyping && (
              <div className="flex items-start gap-3 animate-pulse">
                <span className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700/60 flex items-center justify-center text-sm">
                  🐱
                </span>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 text-xs font-semibold">Nyanchi</span>
                    <span className="text-[8px] bg-stone-800 text-stone-400 font-mono uppercase px-1 rounded">Typing</span>
                  </div>
                  <div className="flex gap-1 items-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-150" />
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Send Action bar */}
          <div className="p-3 bg-stone-950/70 border-t border-stone-900 shrink-0">
            {/* If general channel, user can send messages */}
            {activeChannelId === "ch_general" ? (
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.inputMessagePlaceholder}
                  className="w-full text-xs text-stone-100 bg-stone-900/60 border border-stone-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  id="playground-chat-input"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 p-2 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* If alert log channel, show locked mode feedback */
              <div className="p-3 bg-amber-950/20 text-center rounded-xl border border-amber-900/10 flex items-center justify-center gap-2 text-[10px] text-amber-100 font-mono">
                <Info className="w-4 h-4 text-amber-500 shrinks-0" />
                <span>CHANNEL READ-ONLY • Log of welcome / leave telemetry metrics stream here</span>
              </div>
            )}
            <p className="text-[9px] text-stone-500 text-right mt-1.5 mr-1 select-none">
              Press Enter to push message safely. AutoMod active in real-time.
            </p>
          </div>
        </div>

        {/* Right column: Server Members & Config Desk */}
        <div className="w-48 bg-[#1D1B18] border-l border-stone-900 flex flex-col justify-between shrink-0 hidden lg:flex select-none">
          {/* Top segment: Sim trigger controller */}
          <div className="p-4 space-y-4 border-b border-stone-900">
            <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">
              Trigger Simulations
            </span>

            <div className="space-y-2">
              <button
                onClick={onSimulateJoin}
                className="w-full py-2 px-3 bg-stone-850 hover:bg-stone-800 border border-stone-700/60 hover:border-stone-600 rounded-xl text-[11px] font-semibold text-stone-200 transition-all text-left flex items-center justify-between group cursor-pointer"
                id="simulator-join-btn"
              >
                <span>📥 {t.simJoinBtn}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#E0533C] opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={onSimulateLeave}
                className="w-full py-2 px-3 bg-stone-850 hover:bg-stone-800 border border-stone-700/60 hover:border-stone-600 rounded-xl text-[11px] font-semibold text-stone-200 transition-all text-left flex items-center justify-between group cursor-pointer"
                id="simulator-leave-btn"
              >
                <span>📤 {t.simLeaveBtn}</span>
                <Sparkles className="w-3.5 h-3.5 text-stone-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Middle segment: Self Assign Reaction station */}
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">
                Reaction Role Station
              </span>
              <p className="text-[10px] text-stone-400 mt-1 mb-2.5 leading-tight">
                Click roles to assign them to your active sandbox user on this panel:
              </p>

              {/* Roles checklist */}
              <div className="space-y-2">
                {guildConfig.roles
                  .filter((role) => role.isSelfAssignable)
                  .map((role) => {
                    const isChecked = activeRoles.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => onToggleUserRole(role.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                          isChecked
                            ? "bg-white/5 border-stone-700 text-white shadow-sm font-bold"
                            : "bg-transparent border-stone-800/80 text-stone-400 hover:text-stone-300 hover:border-stone-800"
                        }`}
                        id={`simulator-reactionrole-${role.id}`}
                      >
                        <div className="flex items-center gap-2 text-xs truncate">
                          <span className="text-sm shrink-0">{role.emoji || "🏷️"}</span>
                          <span style={{ color: role.color }} className="truncate">
                            {role.name.split(" ")[0]}
                          </span>
                        </div>

                        {/* Status Check circular */}
                        <div
                          className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "bg-[#2D7345] border-[#2D7345] text-white"
                              : "border-stone-800 bg-stone-900"
                          }`}
                        >
                          {isChecked && <span className="text-[9px] font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Bottom active telemetry warnings logs log */}
            {systemActivityLog.length > 0 && (
              <div className="pt-4 border-t border-stone-900 space-y-2">
                <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">
                  ⚠️ Live Admin Warn Log
                </span>
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto custom-scrollbar pr-0.5">
                  {systemActivityLog.map((log, index) => (
                    <p
                      key={index}
                      className="text-[9px] text-stone-400 font-mono leading-tight bg-stone-950/40 p-1.5 rounded border border-stone-800"
                    >
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
