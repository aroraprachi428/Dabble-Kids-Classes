export type TrialSlot = {
  id: string;
  day: string;
  date: string;
  time: string;
  label: string;
};

export type Coach = {
  id: string;
  name: string;
  activity: string;
  venue: string;
  area: string;
  distance: string;
  rating: number;
  reviews: number;
  price: number;
  priceLabel: string;
  ageRange: string;
  experience: string;
  description: string;
  verified: boolean;
  trialAvailable: boolean;
  imageUrl: string;
  accent: string;
  highlights: string[];
  slots: TrialSlot[];
};

export type Booking = {
  id: string;
  coachId: string;
  slotId: string;
  childName: string;
  childAge: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  coach: Coach;
  slot: TrialSlot;
  trialFee: number;
  serviceFee: number;
  total: number;
  createdAt: string;
};

const portrait = (initials: string, background: string, foreground: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect width="320" height="320" rx="48" fill="${background}"/><circle cx="160" cy="126" r="62" fill="${foreground}" opacity=".22"/><path d="M66 292c9-66 47-99 94-99s85 33 94 99" fill="${foreground}" opacity=".22"/><text x="160" y="178" text-anchor="middle" font-family="Arial, sans-serif" font-size="70" font-weight="700" fill="${foreground}">${initials}</text></svg>`,
  )}`;

const slots = (prefix: string): TrialSlot[] => [
  {
    id: `${prefix}-sat-9`,
    day: "Sat",
    date: "26 Sep",
    time: "9:00 AM",
    label: "Weekend morning",
  },
  {
    id: `${prefix}-sun-10`,
    day: "Sun",
    date: "27 Sep",
    time: "10:30 AM",
    label: "Weekend morning",
  },
  {
    id: `${prefix}-wed-17`,
    day: "Wed",
    date: "30 Sep",
    time: "5:00 PM",
    label: "Weekday evening",
  },
];

export const coaches: Coach[] = [
  {
    id: "aqua-anjali",
    name: "Anjali Rao",
    activity: "Swimming",
    venue: "Fitso Seals",
    area: "Whitefield",
    distance: "1.8 km away",
    rating: 4.9,
    reviews: 84,
    price: 499,
    priceLabel: "₹499 trial",
    ageRange: "Ages 5–12",
    experience: "9 years coaching",
    description:
      "Patient, safety-first swimming lessons that help beginners feel comfortable in the water before building strong technique.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("AR", "#FFE2D8", "#C7553D"),
    accent: "coral",
    highlights: ["CPR certified", "Beginner specialist", "Small batches"],
    slots: slots("aqua"),
  },
  {
    id: "ace-rohan",
    name: "Rohan Menon",
    activity: "Tennis",
    venue: "Palm Meadows Club",
    area: "Whitefield",
    distance: "2.4 km away",
    rating: 4.8,
    reviews: 61,
    price: 599,
    priceLabel: "₹599 trial",
    ageRange: "Ages 6–14",
    experience: "11 years coaching",
    description:
      "High-energy tennis fundamentals with age-appropriate drills, movement games, and a steady focus on confidence.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("RM", "#D9F2EC", "#26766D"),
    accent: "teal",
    highlights: ["AITA certified", "Equipment provided", "Parent updates"],
    slots: slots("ace"),
  },
  {
    id: "glide-meera",
    name: "Meera Iyer",
    activity: "Skating",
    venue: "Decathlon Arena",
    area: "Sarjapur Road",
    distance: "3.1 km away",
    rating: 4.9,
    reviews: 102,
    price: 399,
    priceLabel: "₹399 trial",
    ageRange: "Ages 4–11",
    experience: "8 years coaching",
    description:
      "Playful skating sessions that build balance, braking, and confidence in a carefully supervised environment.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("MI", "#FFF0C7", "#9B651B"),
    accent: "amber",
    highlights: ["Safety gear included", "Beginner friendly", "Max 8 children"],
    slots: slots("glide"),
  },
  {
    id: "checkmate-vikram",
    name: "Vikram Shah",
    activity: "Chess",
    venue: "Mindspace Academy",
    area: "Indiranagar",
    distance: "1.2 km away",
    rating: 4.8,
    reviews: 47,
    price: 299,
    priceLabel: "₹299 trial",
    ageRange: "Ages 6–15",
    experience: "12 years coaching",
    description:
      "Story-led chess lessons that make strategy approachable while strengthening patience, focus, and independent thinking.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("VS", "#E7E1FA", "#5F4B9A"),
    accent: "violet",
    highlights: ["FIDE rated", "Progress reports", "Puzzle-based learning"],
    slots: slots("checkmate"),
  },
  {
    id: "rhythm-nisha",
    name: "Nisha Kapoor",
    activity: "Dance",
    venue: "The Movement Studio",
    area: "Koramangala",
    distance: "2.0 km away",
    rating: 4.9,
    reviews: 76,
    price: 449,
    priceLabel: "₹449 trial",
    ageRange: "Ages 4–13",
    experience: "10 years coaching",
    description:
      "Joyful contemporary and Bollywood dance classes where children learn rhythm, coordination, and stage confidence.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("NK", "#FFE0EC", "#A83F68"),
    accent: "rose",
    highlights: ["Performance opportunities", "Age-based groups", "Friendly studio"],
    slots: slots("rhythm"),
  },
  {
    id: "sur-taal-arjun",
    name: "Arjun Bhat",
    activity: "Music",
    venue: "Octave Music School",
    area: "Jayanagar",
    distance: "1.6 km away",
    rating: 4.7,
    reviews: 39,
    price: 499,
    priceLabel: "₹499 trial",
    ageRange: "Ages 7–16",
    experience: "14 years teaching",
    description:
      "Warm, structured guitar and keyboard lessons with a balance of fundamentals and songs children are excited to play.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("AB", "#DDEBFF", "#315C91"),
    accent: "blue",
    highlights: ["Trinity trained", "Instruments available", "One-to-one options"],
    slots: slots("sur"),
  },
  {
    id: "goal-pradeep",
    name: "Pradeep Kumar",
    activity: "Football",
    venue: "Play Arena",
    area: "Bellandur",
    distance: "2.7 km away",
    rating: 4.8,
    reviews: 93,
    price: 399,
    priceLabel: "₹399 trial",
    ageRange: "Ages 5–14",
    experience: "9 years coaching",
    description:
      "Inclusive football coaching that develops ball skills, teamwork, fitness, and good sporting habits.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("PK", "#DDF3D7", "#3B7630"),
    accent: "green",
    highlights: ["AIFF licensed", "All skill levels", "Structured assessments"],
    slots: slots("goal"),
  },
  {
    id: "code-kavya",
    name: "Kavya Narayan",
    activity: "Coding",
    venue: "Dabble Learning Hub",
    area: "HSR Layout",
    distance: "1.4 km away",
    rating: 4.9,
    reviews: 58,
    price: 549,
    priceLabel: "₹549 trial",
    ageRange: "Ages 8–16",
    experience: "7 years teaching",
    description:
      "Project-based coding sessions where children create games and stories while learning logic without rote memorisation.",
    verified: true,
    trialAvailable: true,
    imageUrl: portrait("KN", "#D8F2F0", "#236F6A"),
    accent: "teal",
    highlights: ["Project based", "No prior coding needed", "Take-home project"],
    slots: slots("code"),
  },
];

export const bookings = new Map<string, Booking>();
