import { Badge } from "@/types/users";

const rarityStyles: Record<Badge["rarity"], string> = {
  common: "border-arena-border text-arena-muted",
  rare: "border-neon-cyan text-neon-cyan",
  epic: "border-neon-pink text-neon-pink",
  legendary: "border-yellow-400 text-yellow-400",
};

export default function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={`flex min-w-32 flex-col gap-1 rounded-xl border bg-arena-surface p-3 ${rarityStyles[badge.rarity]}`}
    >
      <p className="text-sm font-bold text-arena-text">{badge.name}</p>
      <p className="text-[10px] tracking-widest">{badge.rarity.toUpperCase()}</p>
      <p className="text-xs text-arena-muted">+{badge.xp} XP</p>
      <p className="text-xs text-arena-muted">{badge.unlockedLabel}</p>
    </div>
  );
}