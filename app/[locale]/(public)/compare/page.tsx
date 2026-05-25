import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareTool } from "@/components/compare/CompareTool";

export const metadata: Metadata = {
  title: "Compare Programmes",
  description: "Compare citizenship and residency programmes side by side.",
};

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareTool />
    </Suspense>
  );
}
