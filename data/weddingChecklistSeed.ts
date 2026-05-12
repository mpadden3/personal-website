export type PhaseKey =
  | "y1"
  | "m9"
  | "m6"
  | "m4"
  | "m3"
  | "m2"
  | "m1"
  | "w2"
  | "week-of";

export type ChecklistItem = {
  id: string;
  phase: PhaseKey;
  label: string;
};

export type PhaseMeta = {
  key: PhaseKey;
  label: string;
  goal: string;
};

export const phases: PhaseMeta[] = [
  { key: "y1", label: "1 year out", goal: "Lock in the big vendors and the design direction" },
  { key: "m9", label: "9 months out", goal: "Lock in the rest of the vendors + logistics" },
  { key: "m6", label: "6 months out", goal: "Logistics + details" },
  { key: "m4", label: "4 months out", goal: "Communication + final bookings" },
  { key: "m3", label: "3 months out", goal: "Track responses + finalize plans" },
  { key: "m2", label: "2 months out", goal: "Final fittings + drafts" },
  { key: "m1", label: "1 month out", goal: "Final details + confirmations" },
  { key: "w2", label: "2 weeks out", goal: "Smooth execution" },
  { key: "week-of", label: "Wedding week", goal: "Show up. Enjoy. Get married." },
];

export const weddingChecklistSeed: ChecklistItem[] = [
  // 1 YEAR OUT
  { id: "book-photographer", phase: "y1", label: "Book photographer" },
  { id: "book-dj", phase: "y1", label: "Book wedding DJ" },
  { id: "book-florist", phase: "y1", label: "Book florist" },
  { id: "draft-invite-list", phase: "y1", label: "Draft initial invite list" },
  { id: "finalize-vision", phase: "y1", label: "Finalize wedding vision (colors, design direction, rentals)" },
  { id: "plan-honeymoon", phase: "y1", label: "Plan honeymoon (or at least decide on a location)" },
  { id: "confirm-wedding-party", phase: "y1", label: "Confirm wedding party" },
  { id: "rehearsal-dinner-group", phase: "y1", label: "Finalize rehearsal dinner group" },

  // 9 MONTHS OUT
  { id: "book-hmua", phase: "m9", label: "Book hair & makeup artist" },
  { id: "start-website", phase: "m9", label: "Start wedding website (basic info + travel details)" },
  { id: "start-dress-shopping", phase: "m9", label: "Start wedding dress shopping (takes longer than you think)" },
  { id: "order-dress", phase: "m9", label: "Order wedding dress" },
  { id: "look-bands", phase: "m9", label: "Start looking at wedding bands" },
  { id: "book-rentals", phase: "m9", label: "Book rentals (if needed beyond venue offerings)" },
  { id: "finalize-invite-list", phase: "m9", label: "Finalize invite list" },
  { id: "decide-officiant", phase: "m9", label: "Decide on officiant" },
  { id: "draft-ceremony", phase: "m9", label: "Start drafting ceremony structure + vows" },
  { id: "begin-registry", phase: "m9", label: "Begin registry" },
  { id: "send-save-the-dates", phase: "m9", label: "Send Save the Dates" },
  { id: "website-good-to-go", phase: "m9", label: "Make sure wedding website is good to go (registry, ceremony time, lodging)" },

  // 6 MONTHS OUT
  { id: "order-suits", phase: "m6", label: "Order suits / tuxes for groom + groomsmen" },
  { id: "finalize-menu", phase: "m6", label: "Finalize menu with venue / caterer" },
  { id: "hmua-trial", phase: "m6", label: "Schedule hair & makeup trial" },
  { id: "plan-welcome-party", phase: "m6", label: "Plan welcome party" },
  { id: "order-invites", phase: "m6", label: "Order invitations" },
  { id: "draft-timeline-planner", phase: "m6", label: "Finalize timeline draft with planner" },

  // 4 MONTHS OUT
  { id: "send-invites", phase: "m4", label: "Send invitations" },
  { id: "finalize-ceremony", phase: "m4", label: "Finalize ceremony details (readings, music, etc.)" },
  { id: "order-rings", phase: "m4", label: "Order rings" },
  { id: "finalize-decor", phase: "m4", label: "Finalize décor details with planner / florist" },
  { id: "vendors-aligned", phase: "m4", label: "Confirm all vendors are aligned" },

  // 3 MONTHS OUT
  { id: "track-rsvps", phase: "m3", label: "Track RSVPs + follow up" },
  { id: "vendor-timeline", phase: "m3", label: "Confirm timeline with ALL vendors" },
  { id: "photo-shot-list", phase: "m3", label: "Create shot list for photographer" },
  { id: "music-plan", phase: "m3", label: "Plan music (must-play / do-not-play)" },

  // 2 MONTHS OUT
  { id: "final-dress-fitting", phase: "m2", label: "Final dress fitting" },
  { id: "seating-chart-draft", phase: "m2", label: "Finalize seating chart draft" },

  // 1 MONTH OUT
  { id: "final-headcount", phase: "m1", label: "Final headcount to venue" },
  { id: "final-seating", phase: "m1", label: "Final seating chart" },
  { id: "break-in-shoes", phase: "m1", label: "Break in shoes" },
  { id: "vendor-tips", phase: "m1", label: "Prepare tips / payments for vendors" },
  { id: "transport-logistics", phase: "m1", label: "Confirm transportation + lodging logistics" },
  { id: "marriage-license", phase: "m1", label: "Get marriage license" },

  // 2 WEEKS OUT
  { id: "final-walkthrough", phase: "w2", label: "Final walkthrough (if possible)" },
  { id: "share-timeline", phase: "w2", label: "Share final timeline with wedding party" },
  { id: "pack-wedding-weekend", phase: "w2", label: "Pack for wedding weekend" },
  { id: "weather-backup", phase: "w2", label: "Confirm weather backup plan" },

  // WEDDING WEEK
  { id: "welcome-rehearsal", phase: "week-of", label: "Welcome party / rehearsal dinner" },
  { id: "relax", phase: "week-of", label: "Relax — seriously, don't over-schedule" },
  { id: "hand-off-planner", phase: "week-of", label: "Hand off everything to the planner" },
  { id: "get-married", phase: "week-of", label: "Get married" },
];
