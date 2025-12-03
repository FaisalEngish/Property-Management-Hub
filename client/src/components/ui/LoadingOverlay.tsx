import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function LoadingOverlay({
  show,
  text = "Loading…",
}: {
  show: boolean;
  text?: string;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg">
        <LoadingSpinner size="lg" className="border-t-emerald-600" />
        <span className="text-sm font-medium text-slate-700">{text}</span>
      </div>
    </div>
  );
}
