"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

type Variant = "header" | "empty";

interface CreateListModalProps {
  currentListCount: number;
  variant: Variant;
}

export default function CreateListModal({
  currentListCount,
  variant,
}: CreateListModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const openModal = () => {
    if (currentListCount >= 10) {
      setMessage({
        type: "error",
        text: "Máximo 10 listas permitidas (Límite alcanzado)",
      });
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    setMessage(null);
    setName("");
    setOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setOpen(false);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "El nombre es obligatorio" });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.error || "No se pudo crear la lista",
        });
        return;
      }

      setMessage({ type: "success", text: "Lista creada" });
      router.refresh();
      setTimeout(() => setOpen(false), 600);
    } catch {
      setMessage({ type: "error", text: "Error de red" });
    } finally {
      setSubmitting(false);
    }
  };

  const buttonClassName =
    variant === "header"
      ? "flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded text-sm font-bold hover:bg-neutral-300 transition-colors shrink-0"
      : "flex items-center gap-2 bg-primary text-white mx-auto px-6 py-2.5 rounded text-sm font-bold hover:bg-red-700 transition-colors";

  const buttonText =
    variant === "header" ? "Crear Nueva Lista" : "Crear mi primera lista";

  return (
    <>
      <button className={buttonClassName} onClick={openModal} type="button">
        <Plus className="w-4 h-4" /> {buttonText}
      </button>

      {message && !open && (
        <div
          className={`mt-3 text-xs font-bold text-center px-3 py-2 rounded ${
            message.type === "success"
              ? "bg-green-500/20 text-green-300 border border-green-500/20"
              : "bg-red-500/20 text-red-300 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onMouseDown={(e) => {
            if (
              panelRef.current &&
              !panelRef.current.contains(e.target as Node)
            )
              closeModal();
          }}
        >
          <div
            ref={panelRef}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">Nueva lista</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Ingresa un nombre para tu nueva lista.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-zinc-900 text-gray-300 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-xs font-bold text-gray-300">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
                maxLength={50}
                disabled={submitting}
                className="mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary disabled:opacity-70"
                placeholder="Ej: Favoritos 2026"
                autoFocus
              />
            </div>

            {message && (
              <div
                className={`mt-4 text-xs font-bold text-center px-3 py-2 rounded ${
                  message.type === "success"
                    ? "bg-green-500/20 text-green-300 border border-green-500/20"
                    : "bg-red-500/20 text-red-300 border border-red-500/20"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-gray-200 text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={submitting || !name.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-black hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear lista
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
