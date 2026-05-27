"use client";

import { useCallback } from "react";
import { QualifyModal } from "@/components/shared/QualifyModal";
import { useRouter } from "@/i18n/navigation";

export default function QualifyPage() {
  const router = useRouter();
  const handleClose = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen" style={{ background: "#10141a" }}>
      <QualifyModal isOpen onClose={handleClose} />
    </div>
  );
}
