import seedCatalog from "../../../../attached_assets/seed-catalog_1789809370317.json";

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
  sessionFormats: string[];
  venueType: "comes_to_your_society" | "at_studio" | "online";
  serviceAreas: string[];
  ageMin: number;
  ageMax: number;
  parentAccompanied: boolean;
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
  seats: number;
  coach: Coach;
  slot: TrialSlot;
  trialFee: number;
  serviceFee: number;
  coachFee: number;
  dabbleFee: number;
  total: number;
  createdAt: string;
};

export function calculateBookingPricing(price: number, seats: number) {
  const coachFee = price * seats;
  const dabbleFee = Math.round(coachFee * 0.1);
  return { coachFee, dabbleFee, total: coachFee + dabbleFee };
}

export type CatalogExperience = {
  id: string;
  title: string;
  category: string;
  coachName: string;
  studio: string;
  area: string;
  nearSociety: string;
  price: number;
  priceUnit: string;
  durationMins: number;
  days: string[];
  slots: string[];
  groupType: string;
  beginnerFriendly: boolean;
  trialAvailable: boolean;
  vetted: boolean;
  rating: number;
  spotsLeft: number;
  vibeTags: string[];
  imageQuery: string;
  description: string;
  sessionFormats: string[];
  venueType: "comes_to_your_society" | "at_studio" | "online";
  serviceAreas: string[];
  ageMin: number;
  ageMax: number;
  parentAccompanied: boolean;
};

const serviceAreaMap: Record<string, string[]> = {
  Whitefield: ["Whitefield", "Marathahalli", "Brookefield"],
  "Sarjapur Road": ["Sarjapur Road", "Bellandur", "HSR Layout"],
  Bellandur: ["Bellandur", "Sarjapur Road", "HSR Layout"],
  "HSR Layout": ["HSR Layout", "Bellandur", "Koramangala"],
  Koramangala: ["Koramangala", "Indiranagar", "HSR Layout"],
  Indiranagar: ["Indiranagar", "Koramangala", "Domlur"],
  Jayanagar: ["Jayanagar", "JP Nagar", "Basavanagudi"],
};

function enrichExperience(
  experience: Omit<CatalogExperience, keyof {
    sessionFormats: string[];
    venueType: string;
    serviceAreas: string[];
    ageMin: number;
    ageMax: number;
    parentAccompanied: boolean;
  }>,
): CatalogExperience {
  const title = experience.title.toLowerCase();
  const ageMatch = experience.title.match(/age\s+(\d+)\s*-\s*(\d+)/i);
  const adult = /adult|women|marathon|personal training|strength|hiit|boxing|mma|vinyasa|baking|cooking|pottery|calligraphy|spanish|photography|meditation/i.test(title);
  const unsafe = /mma|boxing|gym|strength|squash|hiit/i.test(title);
  const ageMin = ageMatch ? Number(ageMatch[1]) : unsafe ? 10 : adult ? 18 : 6;
  const ageMax = ageMatch ? Number(ageMatch[2]) : adult ? 99 : 16;
  const child = /kids|children|junior|little|age \d/i.test(title);
  return {
    ...experience,
    sessionFormats: experience.groupType === "solo" ? ["private", "group"] : ["group", "private"],
    venueType: child && ["Swimming", "Dance", "Music"].includes(experience.category)
      ? "comes_to_your_society"
      : "at_studio",
    serviceAreas: serviceAreaMap[experience.area] ?? [experience.area],
    ageMin,
    ageMax,
    parentAccompanied: false,
  };
}

const rawCatalog = seedCatalog.experiences as unknown as Array<
  Omit<CatalogExperience, "sessionFormats" | "venueType" | "serviceAreas" | "ageMin" | "ageMax" | "parentAccompanied">
>;

const veryYoungOffers: CatalogExperience[] = [
  ["exp-042", "Parent & Toddler Swim Water Play", "Swimming", "Coach Kavya N.", "Tiny Tides", "Bellandur", "Central Park", 650, "per session", 40, ["Tue", "Thu", "Sat"], ["09:00", "10:00"], "social", "water play"],
  ["exp-043", "Music & Movement for Toddlers", "Music", "Coach Ritu S.", "Bumblebee Music", "Whitefield", "Palm Meadows", 450, "per session", 45, ["Wed", "Sat"], ["10:00", "11:30"], "social", "music movement"],
  ["exp-044", "Play-Based Art for Little Creators", "Painting", "Coach Nandini P.", "Little Picasso", "HSR Layout", "Adarsh Palm Retreat", 500, "per session", 45, ["Sat", "Sun"], ["10:00", "11:30"], "social", "play art"],
  ["exp-045", "Little Movers Dance & Rhythm", "Dance", "Coach Ananya R.", "Happy Feet Juniors", "Sarjapur Road", "Gopalan Grandeur", 500, "per session", 45, ["Sat", "Sun"], ["10:00", "11:30"], "social", "toddler dance"],
  ["exp-046", "Toddler Nature & Sensory Play", "Workshops", "Coach Aditi K.", "Nest Playhouse", "Koramangala", "Sobha Dahlia", 400, "per session", 45, ["Sat", "Sun"], ["09:30", "11:00"], "social", "sensory play"],
].map((entry) => {
  const [id, title, category, coachName, studio, area, nearSociety, price, priceUnit, durationMins, days, slots, groupType, tag] = entry as [
    string, string, string, string, string, string, string, number, string, number, string[], string[], string, string
  ];
  return enrichExperience({
    id, title, category, coachName, studio, area, nearSociety, price, priceUnit,
    durationMins, days, slots, groupType, beginnerFriendly: true, trialAvailable: true,
    vetted: true, rating: 4.9, spotsLeft: 6, vibeTags: ["kids", "safe", "parent-accompanied", tag],
    imageQuery: title, description: "A gentle, play-led session designed for toddlers with a parent or trusted adult participating.",
  } as never);
})
.map((item) => ({ ...item, ageMin: 3, ageMax: 5, parentAccompanied: true, venueType: "comes_to_your_society" as const }));

export const catalogExperiences: CatalogExperience[] = [
  ...rawCatalog.map(enrichExperience),
  ...veryYoungOffers,
];

const categoryPhotos: Record<string, string> = {
  Swimming:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
  Tennis:
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=80",
  Football:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
  Dance:
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80",
  Music:
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=80",
  Painting:
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
  Workshops:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
};

const fallbackPhoto =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80";

function ageRangeFor(experience: CatalogExperience) {
  const match = experience.title.match(/Age\s+(\d+)\s*-\s*(\d+)/i);
  return match ? `Ages ${match[1]}–${match[2]}` : "All ages";
}

function slotLabel(time: string) {
  const hour = Number(time.split(":")[0]);
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function displayTime(time: string) {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function buildSlots(experience: CatalogExperience): TrialSlot[] {
  const slots: TrialSlot[] = [];
  for (const day of experience.days) {
    for (const time of experience.slots) {
      slots.push({
        id: `${experience.id}-${day.toLowerCase()}-${time.replace(":", "")}`,
        day,
        date: "Next available",
        time: displayTime(time),
        label: `${day} ${slotLabel(time).toLowerCase()}`,
      });
    }
  }
  return slots;
}

export const coaches: Coach[] = catalogExperiences.map(
  (experience, index) => ({
    id: experience.id,
    name: experience.coachName,
    activity: experience.title,
    venue: experience.studio,
    area: experience.area,
    distance: `Near ${experience.nearSociety}`,
    rating: experience.rating,
    reviews: 24 + ((index * 17) % 89),
    price: experience.price,
    priceLabel: `₹${experience.price} ${experience.priceUnit}`,
    ageRange: ageRangeFor(experience),
    experience: `${experience.durationMins} min · ${experience.groupType}`,
    description: experience.description,
    verified: experience.vetted,
    trialAvailable: experience.trialAvailable,
    imageUrl: categoryPhotos[experience.category] ?? fallbackPhoto,
    accent: ["coral", "teal", "amber", "violet", "rose", "blue", "green"][
      index % 7
    ],
    highlights: [
      experience.category,
      ...experience.vibeTags,
      `${experience.spotsLeft} spots left`,
    ],
    slots: buildSlots(experience),
    sessionFormats: experience.sessionFormats,
    venueType: experience.venueType,
    serviceAreas: experience.serviceAreas,
    ageMin: experience.ageMin,
    ageMax: experience.ageMax,
    parentAccompanied: experience.parentAccompanied,
  }),
);

export const bookings = new Map<string, Booking>();