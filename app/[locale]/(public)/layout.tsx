import { PreviewShell } from "@/components/landing-v2/PreviewShell";
import { QualifyModalGlobal } from "@/components/shared/QualifyModalGlobal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ zoom: 0.88 }}>
      <PreviewShell>{children}</PreviewShell>
      <QualifyModalGlobal />
    </div>
  );
}
