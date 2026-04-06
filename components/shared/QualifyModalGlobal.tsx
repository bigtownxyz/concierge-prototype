"use client";

import { useEffect, useState } from "react";
import { QualifyModal } from "./QualifyModal";

export function QualifyModalGlobal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-qualify-modal", handler);
    return () => window.removeEventListener("open-qualify-modal", handler);
  }, []);

  return <QualifyModal isOpen={open} onClose={() => setOpen(false)} />;
}
