import { QualifyModalGlobal } from "@/components/shared/QualifyModalGlobal";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <QualifyModalGlobal />
    </>
  );
}
