"use client";

import { useSearchParams } from "next/navigation";
import { AskPanel } from "@/components/AskPanel";

export function AskQuery() {
  const params = useSearchParams();
  const q = params.get("q") || undefined;
  return <AskPanel initialQuestion={q} />;
}
