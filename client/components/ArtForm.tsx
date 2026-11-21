"use client";

import { FormEvent, useState } from "react";
import {
  MAX_MASCOT_NAME_LENGTH,
  validateImageUrl,
  validateMascotName,
} from "@/lib/validation";
import { CreateMascotData } from "@/types/mascots";

interface ArtFormProps {
  creating: boolean;
  // Devuelve true si se creó (entonces el formulario se limpia)
  onSubmit: (data: CreateMascotData) => Promise<boolean>;
}

type FieldErrors = Partial<Record<keyof CreateMascotData, string>>;

// Formulario para subir arte: nombre + URL de imagen, con vista previa
export default function ArtForm({ creating, onSubmit }: ArtFormProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  // La vista previa avisa si la URL es válida pero la imagen no carga
  const [previewFailed, setPreviewFailed] = useState(false);

  const validate = (nextName: string, nextUrl: string): FieldErrors => {
    const found: FieldErrors = {};
    const nameError = validateMascotName(nextName);
    const urlError = validateImageUrl(nextUrl);
    if (nameError) found.name = nameError;
    if (urlError) found.imageUrl = urlError;
    return found;
  };

  const urlIsValid = !validateImageUrl(imageUrl);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    const found = validate(name, imageUrl);
    if (!found.imageUrl && previewFailed) {
      found.imageUrl = "La imagen no carga: revisa que la URL apunte a una imagen";
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const ok = await onSubmit({ name: name.trim(), imageUrl: imageUrl.trim() });
    if (ok) {
      setName("");
      setImageUrl("");
      setErrors({});
      setAttempted(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-arena-border bg-arena-surface p-4"
    >
      <h2 className="text-xs tracking-widest text-neon-pink">SUBIR NUEVO ARTE</h2>

      {/* Vista previa */}
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-arena-border bg-arena-bg">
        {urlIsValid && !previewFailed ? (
          <img
            // key: si cambia la URL, la imagen se vuelve a intentar desde cero
            key={imageUrl}
            src={imageUrl.trim()}
            alt="Vista previa del arte"
            onError={() => setPreviewFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="px-6 text-center text-xs text-arena-muted">
            {previewFailed
              ? "No pudimos cargar esa imagen"
              : "La vista previa aparece al pegar una URL válida"}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="art-name" className="text-xs tracking-widest text-arena-muted">
          NOMBRE
        </label>
        <input
          id="art-name"
          value={name}
          maxLength={MAX_MASCOT_NAME_LENGTH}
          onChange={(event) => {
            setName(event.target.value);
            if (attempted) setErrors(validate(event.target.value, imageUrl));
          }}
          disabled={creating}
          placeholder="Neko Blaze"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "art-name-error" : undefined}
          className={`rounded-xl border bg-arena-bg px-4 py-3 outline-none transition placeholder:text-arena-muted/50 focus:border-neon-pink disabled:opacity-60 ${
            errors.name ? "border-corner-red" : "border-arena-border"
          }`}
        />
        <div className="flex justify-between text-xs">
          <span id="art-name-error" className="text-corner-red">
            {errors.name}
          </span>
          <span className="text-arena-muted">
            {name.trim().length}/{MAX_MASCOT_NAME_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="art-url" className="text-xs tracking-widest text-arena-muted">
          URL DE LA IMAGEN
        </label>
        <input
          id="art-url"
          type="url"
          inputMode="url"
          value={imageUrl}
          onChange={(event) => {
            setImageUrl(event.target.value);
            setPreviewFailed(false);
            if (attempted) setErrors(validate(name, event.target.value));
          }}
          disabled={creating}
          placeholder="https://..."
          aria-invalid={Boolean(errors.imageUrl)}
          aria-describedby={errors.imageUrl ? "art-url-error" : undefined}
          className={`rounded-xl border bg-arena-bg px-4 py-3 outline-none transition placeholder:text-arena-muted/50 focus:border-neon-pink disabled:opacity-60 ${
            errors.imageUrl ? "border-corner-red" : "border-arena-border"
          }`}
        />
        {errors.imageUrl && (
          <p id="art-url-error" className="text-xs text-corner-red">
            {errors.imageUrl}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={creating}
        className="flex items-center justify-center gap-2 rounded-xl bg-neon-pink py-3 font-bold tracking-widest text-black transition disabled:opacity-60"
      >
        {creating && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
        )}
        {creating ? "SUBIENDO..." : "SUBIR ARTE"}
      </button>
    </form>
  );
}
