import { PreviewShell } from "@/components/landing-v2/PreviewShell";
import { QualifyModalGlobal } from "@/components/shared/QualifyModalGlobal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PreviewShell>{children}</PreviewShell>
      <QualifyModalGlobal />
    </>
  );
}
