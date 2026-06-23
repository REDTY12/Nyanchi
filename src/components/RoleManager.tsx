import React, { useState } from "react";
import { DiscordRole } from "../types";
import { TranslationKeys } from "../translations";
import { Plus, Trash2, Heart, Shield, Check } from "lucide-react";

interface RoleManagerProps {
  roles: DiscordRole[];
  onCreateRole: (name: string, color: string, isSelfAssignable: boolean, emoji?: string) => void;
  onDeleteRole: (roleId: string) => void;
  t: TranslationKeys;
}

const colorPresets = [
  "#E0533C", // Coral orange
  "#E67E22", // Orange
  "#2D7345", // Green
  "#1ABC9C", // Turquoise
  "#2980B9", // Blue
  "#9B59B6", // Amethyst
  "#E91E63", // Pink
  "#F1C40F", // Yellow
];

const emojiPresets = [
  "🎮", "🎨", "🌸", "⭐", "🐾", "🍕", "💻", "📚", "🎧", "🍿"
];

export default function RoleManager({
  roles,
  onCreateRole,
  onDeleteRole,
  t,
}: RoleManagerProps) {
  const [roleName, setRoleName] = useState<string>("");
  const [roleColor, setRoleColor] = useState<string>("#E0533C");
  const [isSelfAssignable, setIsSelfAssignable] = useState<boolean>(true);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🐾");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    
    onCreateRole(
      roleName.trim(),
      roleColor,
      isSelfAssignable,
      isSelfAssignable ? selectedEmoji : undefined
    );
    
    setRoleName("");
    setIsSelfAssignable(true);
  };

  return (
    <div className="space-y-6" id="role-manager">
      <div className="border-b border-amber-900/10 pb-5">
        <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-150 flex items-center gap-2">
          <span>👑</span> {t.roleTitle}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed max-w-xl">
          {t.roleDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/80 dark:border-stone-850 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-widest pb-2 border-b border-stone-100 dark:border-stone-800">
            Create New Rank
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                Name of Role
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder={t.roleNamePlaceholder}
                maxLength={20}
                required
                className="w-full px-4 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#E0533C]/20 focus:border-[#E0533C] transition-all"
                id="role-name-input"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1.5">
                {t.roleColorLabel}
              </label>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setRoleColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-7 rounded-lg relative transition-transform hover:scale-110 cursor-pointer ${
                      roleColor === color ? "ring-2 ring-stone-900 ring-offset-2 scale-105" : ""
                    }`}
                  >
                    {roleColor === color && (
                      <Check className="w-3.5 h-3.5 text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={roleColor}
                  onChange={(e) => setRoleColor(e.target.value)}
                  className="w-8 h-8 p-0 rounded border border-stone-200 dark:border-stone-800 overflow-hidden cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={roleColor}
                  onChange={(e) => setRoleColor(e.target.value)}
                  maxLength={7}
                  className="flex-1 px-2.5 py-1 text-xs border border-stone-200 dark:border-stone-800 rounded bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 font-mono"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">{t.assignableToggle}</h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Pickable in Chat Station</p>
              </div>

              <button
                type="button"
                onClick={() => setIsSelfAssignable(!isSelfAssignable)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSelfAssignable ? "bg-[#E0533C]" : "bg-stone-200"
                }`}
                id="role-selfassignable-toggle"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSelfAssignable ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {isSelfAssignable && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase">
                  Reaction Station Emoji
                </label>
                <div className="grid grid-cols-5 gap-1 bg-stone-55 dark:bg-stone-955/40 p-2 rounded-xl border border-stone-200/60 dark:border-stone-800">
                  {emojiPresets.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`p-1.5 rounded text-sm hover:bg-white dark:hover:bg-stone-800 select-none transition-all cursor-pointer ${
                        selectedEmoji === emoji ? "bg-white dark:bg-stone-800 scale-110 shadow" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-50 text-white dark:text-stone-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="role-submit-btn"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addRoleBtn}</span>
            </button>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/80 dark:border-stone-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-widest">
                  {t.rolesListHeader}
                </h3>
                <p className="text-[10px] text-[#2D7345] dark:text-[#52c174] font-semibold mt-0.5">
                  {t.rolesListSub}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 bg-stone-100/80 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                {roles.length} roles total
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="p-3 bg-stone-50/50 dark:bg-stone-950/20 rounded-xl border border-stone-200/60 dark:border-stone-800 flex items-center justify-between"
                  id={`role-item-${role.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full filter shadow-sm outline outline-2 outline-white dark:outline-stone-900"
                      style={{ backgroundColor: role.color }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200" style={{ color: role.color }}>
                          {role.name}
                        </span>
                        {role.emoji && (
                          <span className="text-xs">{role.emoji}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                          ID: {role.id}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-450 font-medium">
                          {role.memberCount} members
                        </span>
                      </div>
                    </div>
                  </div>
 
                  <div className="flex items-center gap-2">
                    {role.isSelfAssignable ? (
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-900/10 dark:border-amber-900/30 px-2 py-0.5 rounded-full font-bold">
                        Self-Assignable
                      </span>
                    ) : (
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full font-medium">
                        System Admin
                      </span>
                    )}
                    {role.id !== "role_mod" ? (
                      <button
                        onClick={() => onDeleteRole(role.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title={t.deleteRoleBtn}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="p-1 text-stone-300 dark:text-stone-700">
                        <Shield className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3 bg-amber-50/20 dark:bg-amber-950/10 p-4 rounded-xl mt-4">
            <span className="text-2xl">⚡</span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal">
              Any role configured as <strong>"Self-Assignable"</strong> acts as a reaction role station in the sandbox chat interface! Live participants can click on roles to immediately claim them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
