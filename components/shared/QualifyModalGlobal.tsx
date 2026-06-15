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

  // Allow a shareable direct link to open the form: ?qualify or ?qualify=1.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("qualify") && params.get("qualify") !== "0") {
      setOpen(true);
    }
  }, []);

  return <QualifyModal isOpen={open} onClose={() => setOpen(false)} />;
}
