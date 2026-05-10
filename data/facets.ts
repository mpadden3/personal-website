export type FacetId = "operator" | "tpm" | "seattle" | "sports";

export type Facet = {
  id: FacetId;
  label: string;
  body: string;
};

export const facets: Facet[] = [
  {
    id: "operator",
    label: "AI Operator",
    body: "I build practical AI tools that automate tasks, surface insights, and make work smoother.",
  },
  {
    id: "tpm",
    label: "Technical Program Manager",
    body: "AI-enabled TPM focused on turning ideas into shipped solutions through clear planning, cross-functional alignment, and delivery.",
  },
  {
    id: "seattle",
    label: "Seattle",
    body: "Proud to call the Emerald City home. Coffee, rain, and curiosity fuel the work.",
  },
  {
    id: "sports",
    label: "Sports Enthusiast",
    body: "Mariners fan, golf addict, and ski-trip planner. Sports keep life fun, competitive, and very Seattle.",
  },
];
