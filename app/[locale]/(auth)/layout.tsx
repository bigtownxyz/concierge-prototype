import { QualifyModalGlobal } from "@/components/shared/QualifyModalGlobal";
import { ApplyModalGlobal } from "@/components/shared/ApplyModalGlobal";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <QualifyModalGlobal />
      <ApplyModalGlobal />
    </>
  );
}
