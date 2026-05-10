import type { Metadata } from "next";
import { tools } from "@/data/tools";
import { ComingSoon } from "@/components/ComingSoon";

const tool = tools.find((t) => t.slug === "wedding-countdown")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.shortDescription,
};

export default function WeddingCountdownPage() {
  return (
    <ComingSoon
      tool={tool}
      whatToExpect={[
        "Live countdown to June 19, 2027.",
        "Wedding info cards — venue, schedule, travel basics.",
        "Guest FAQ placeholders, ready to be filled in.",
        "Weekend schedule placeholders for the days around the ceremony.",
      ]}
    />
  );
}
