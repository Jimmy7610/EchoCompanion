// ============================================================
// CompanionAvatar.tsx — Visuell companion-avatar med stämningsanimationer
// Ren CSS/React, inga externa beroenden, 0 kr
// ============================================================

import type { CompanionMood } from "../features/companion/companionTypes";

interface CompanionAvatarProps {
  mood: CompanionMood;
  label: string;
  description: string;
  activeProfileName?: string | null;
  activeProjectName?: string | null;
  ttsEnabled?: boolean;
  isSpeaking?: boolean;
}

export default function CompanionAvatar({
  mood,
  label,
  activeProfileName,
  activeProjectName,
  isSpeaking,
}: CompanionAvatarProps) {
  return (
    <div className={`companion-card companion-mood-${mood}`}>
      {/* Orb */}
      <div className="companion-orb-wrapper">
        <div className="companion-orb">
          <span className="companion-orb-icon">⬡</span>
        </div>

        {/* Ringar — visas vid thinking och speaking */}
        {(mood === "thinking" || mood === "speaking") && (
          <>
            <div className="companion-ring companion-ring-1" />
            <div className="companion-ring companion-ring-2" />
          </>
        )}

        {/* Ljudvåg-prickar — visas vid speaking */}
        {(mood === "speaking" || isSpeaking) && (
          <div className="companion-wave">
            <span className="companion-wave-dot" />
            <span className="companion-wave-dot" />
            <span className="companion-wave-dot" />
            <span className="companion-wave-dot" />
            <span className="companion-wave-dot" />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="companion-status">
        <span className="companion-label">{label}</span>
        <div className="companion-chips">
          {activeProfileName && (
            <span className="companion-chip">{activeProfileName}</span>
          )}
          {activeProjectName && (
            <span className="companion-chip">{activeProjectName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
