"use client";

import { Mascot } from "@/types/mascots";

const cornerStyles = {
  red: { label: "RED CORNER", text: "text-corner-red", ring: "border-corner-red" },
  blue: { label: "BLUE CORNER", text: "text-corner-blue", ring: "border-corner-blue" },
};

interface MascotPickerProps {
  corner: "red" | "blue";
  mascots: Mascot[];
  selectedId: number | null;
  // El arte elegido en la otra esquina: no se puede repetir
  blockedId: number | null;
  onSelect: (id: number) => void;
  disabled: boolean;
  error?: string;
}

// Lista horizontal de artes para elegir el contrincante de una esquina
export default function MascotPicker({
  corner,
  mascots,
  selectedId,
  blockedId,
  onSelect,
  disabled,
  error,
}: MascotPickerProps) {
  const style = cornerStyles[corner];
  const selected = mascots.find((mascot) => mascot.id === selectedId);

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="flex w-full justify-between text-xs tracking-widest">
        <span className={style.text}>{style.label}</span>
        <span className="text-arena-muted">
          {selected ? `${selected.name} · ${selected.artistHandle}` : "Elige un arte"}
        </span>
      </legend>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {mascots.map((mascot) => {
          const isSelected = mascot.id === selectedId;
          const isBlocked = mascot.id === blockedId;
          return (
            <button
              key={mascot.id}
              type="button"
              onClick={() => onSelect(mascot.id)}
              disabled={isBlocked}
              aria-pressed={isSelected}
              aria-label={`${mascot.name} de ${mascot.artistHandle}`}
              title={isBlocked ? "Ya está en la otra esquina" : mascot.name}
              className={`w-20 shrink-0 rounded-xl border-2 bg-arena-surface p-1 transition disabled:opacity-30 ${
                isSelected ? style.ring : "border-arena-border"
              }`}
            >
              <img
                src={mascot.imageUrl}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
              <p className="mt-1 truncate text-[10px]">{mascot.name}</p>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-corner-red">{error}</p>}
    </fieldset>
  );
}
