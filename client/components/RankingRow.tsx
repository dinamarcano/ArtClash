import { RankedMascot } from "@/types/mascot";

const rowStyles: Record<number, string> = {
  1: "border-neon-pink",
  2: "border-neon-cyan",
};

const rankLabels: Record<number, string> = {
  1: "GOLD CHAMPION",
  2: "CONTENDER",
};

export default function RankingRow({ entry }: { entry: RankedMascot }) {
  const border = rowStyles[entry.rank] ?? "border-arena-border";

  return (
    <li className={`rounded-xl border-2 bg-arena-surface p-3 ${border}`}>
      <div className="flex items-center gap-3">
        <span className="w-8 text-lg font-bold text-arena-muted">
          #{entry.rank}
        </span>
        <img
          src={entry.mascot.imageUrl}
          alt={entry.mascot.name}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div className="flex-1">
          <p className="font-bold">{entry.mascot.name}</p>
          <p className="text-xs text-arena-muted">{entry.mascot.artistHandle}</p>
        </div>
        <div className="text-right">
          {rankLabels[entry.rank] && (
            <p className="text-[10px] tracking-widest text-neon-pink">
              {rankLabels[entry.rank]}
            </p>
          )}
          <p className="font-bold">{entry.votes.toLocaleString("en-US")} VOTES</p>
          <p className="text-xs text-arena-muted">{entry.share}%</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-arena-border">
        <div className="h-full bg-neon-cyan" style={{ width: `${entry.share}%` }} />
      </div>
    </li>
  );
}