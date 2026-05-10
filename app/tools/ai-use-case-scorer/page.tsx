import type { Metadata } from "next";
import { tools } from "@/data/tools";
import { ComingSoon } from "@/components/ComingSoon";

const tool = tools.find((t) => t.slug === "ai-use-case-scorer")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.shortDescription,
};

export default function AIUseCaseScorerPage() {
  return (
    <ComingSoon
      tool={tool}
      whatToExpect={[
        "Inputs: workflow description, pain points, users involved, available data, desired outcome.",
        "Outputs: AI fit score, value potential, complexity, and data readiness.",
        "Adoption risks and an MVP recommendation tuned to the team.",
        "Success metrics and a short list of follow-up questions.",
      ]}
    />
  );
}
