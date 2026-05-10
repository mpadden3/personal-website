import type { Metadata } from "next";
import { tools } from "@/data/tools";
import { ComingSoon } from "@/components/ComingSoon";

const tool = tools.find((t) => t.slug === "mariners-pulse")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.shortDescription,
};

export default function MarinersPulsePage() {
  return (
    <ComingSoon
      tool={tool}
      whatToExpect={[
        "Last five completed Mariners games — opponent, date, score, win/loss.",
        "AI-generated five-game recap, restricted to summarizing real, provided data (no invented stats).",
        "Mike's Player of the Week, picked from recent statlines.",
        "One thing to watch in the next series.",
      ]}
    />
  );
}
