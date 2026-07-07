export const SITE = {
  name: "Vaishnav Infrastructure",
  shortName: "Vaishnav Infra",
  tagline: "We don't just pour concrete. We set standards.",
  location: "Erode · Tamil Nadu · India",
  founder: "Arun Keerthi, M.Tech (CEM)",
  phone: "+91 9944 663 333",
  phoneHref: "tel:+919944663333",
  whatsapp: "https://wa.me/919944663333",
  email: "arun.keerthi@gmail.com",
  hours: "Mon — Sat · 9:00 to 19:00 IST",
  sectors: [
    "Residential",
    "Commercial",
    "Healthcare",
    "Institutional",
    "Government",
    "Hospitality",
  ],
  registrations: ["RERA", "DTCP", "GST", "TN MSME"],
};

export const STATS = [
  { value: 12, suffix: "", label: "Years in practice" },
  { value: 30, suffix: "+", label: "Projects delivered" },
  { value: 1, suffix: "L+", label: "Sq. ft. built" },
  { value: 5, suffix: "", label: "Ongoing builds" },
  { value: 100, suffix: "%", label: "RERA & DTCP compliant" },
  { value: 24, suffix: "mo", label: "Post-handover support" },
];

export const FOUNDER_NOTE = {
  quote:
    "I started Vaishnav Infrastructure because I wanted to build the kind of homes I'd want to grow old in — solid, honest, the kind that don't need explaining. Every brief we take on is a promise to a family who trusted us with the most expensive decision they'll ever make. We don't take that lightly — we never have. Fifty years from now, the buildings will still be standing while we won't. The least we can do is make sure they were worth standing for.",
  name: "Arun Keerthi",
  title: "M.Tech (CEM) · Founder",
  image: "/images/p02_00.jpg",
};

export const PRINCIPLES = [
  {
    numeral: "I",
    title: "The site speaks first.",
    body: "We design for the soil, the sun, and the street before we design for the brief. A coconut-grove farmhouse in Erode is not the same problem as a four-storey hospital on a main road — and pretending otherwise is how buildings go wrong.",
  },
  {
    numeral: "II",
    title: "Material is memory.",
    body: "Every choice should still feel right twenty years from now. Stone weathers. Wood ages. Cheap shortcuts announce themselves the day the photographer leaves. We choose materials that get better with time, not worse.",
  },
  {
    numeral: "III",
    title: "Drawings are promises.",
    body: "What's on the sheet is what gets built. No silent substitutions, no surprises at handover, no “we'll figure it out on site.” Every deviation is documented, reviewed, and approved — in writing.",
  },
  {
    numeral: "IV",
    title: "Quiet quality.",
    body: "The best work is the work you stop noticing because it just works — the doors that close cleanly five years in, the bathroom that still drains right, the roof that holds through three monsoons. That's the only review that matters.",
  },
];

export type Project = {
  slug: string;
  name: string;
  type: string;
  location: string;
  timeline: string;
  status: "DELIVERED" | "IN BUILD" | "IN DESIGN";
  area?: string;
  cover: string;
  images?: string[];
  summary?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "house-of-arches",
    name: "House of Arches",
    type: "Farmhouse",
    location: "Erode",
    timeline: "2022 — 2024",
    status: "DELIVERED",
    area: "10,000 sqft",
    cover: "/images/p06_00.jpg",
    images: ["/images/p07_00.jpg", "/images/p07_01.jpg", "/images/p07_02.jpg", "/images/p08_00.jpg", "/images/p08_01.jpg", "/images/p08_02.jpg"],
    summary:
      "A ten-thousand square foot weekend home set inside a working coconut grove. Malabar-style sloped tile roofs for the monsoon, arched verandahs as climatic devices, encaustic tiles chosen for character that gets richer with wear.",
  },
  {
    slug: "the-croft",
    name: "The Croft",
    type: "Residence",
    location: "Erode",
    timeline: "2021 — 2023",
    status: "DELIVERED",
    area: "8,000 sqft",
    cover: "/images/p10_01.jpg",
    images: ["/images/p09_00.jpg", "/images/p10_00.jpg", "/images/p10_02.jpg"],
    summary:
      "Contemporary geometry without the glass-box chill. A rough-laid black stone wall runs the entry colonnade, set against polished IPS floors and a circular Moon-window framing the pool. Brick, stone, and concrete carry the palette — no paint, no veneer.",
  },
  {
    slug: "manian-medical-centre",
    name: "Manian Medical Centre",
    type: "Hospital",
    location: "Erode",
    timeline: "2021 — 2024",
    status: "DELIVERED",
    area: "22,000 sqft",
    cover: "/images/p11_00.jpg",
    images: ["/images/p12_00.jpg"],
    summary:
      "A four-storey medical centre on a constrained urban site — perforated HPL facade, vertical balcony landscape, complex MEP routing, and hospital-grade tolerances. General contractor from foundation to handover, across a three-year programme on a working street.",
  },
  {
    slug: "kozhinadu",
    name: "Kozhinadu",
    type: "Vernacular Eatery",
    location: "Erode",
    timeline: "2023 — 2024",
    status: "DELIVERED",
    cover: "/images/p03_00.jpg",
    summary:
      "A vernacular eatery built with regional materials and detailing — delivered on a tight commercial programme.",
  },
  {
    slug: "commercial-complex",
    name: "Commercial Complex",
    type: "Retail",
    location: "Erode",
    timeline: "2023 — 2024",
    status: "DELIVERED",
    cover: "/images/p12_00.jpg",
    summary: "A retail complex delivered on schedule with itemised BOQ discipline from day one.",
  },
  {
    slug: "villa-villarasampatti",
    name: "3 BHK Villa",
    type: "Residence",
    location: "Villarasampatti",
    timeline: "2023 — 2024",
    status: "DELIVERED",
    cover: "/images/p07_01.jpg",
    summary: "A family villa executed with the same protocols as our flagship builds.",
  },
  {
    slug: "the-long-house",
    name: "The Long House",
    type: "Contemporary Residence",
    location: "Erode",
    timeline: "2025 — 2026",
    status: "IN BUILD",
    area: "5,000 sqft",
    cover: "/images/p14_00.jpg",
    images: ["/images/p14_01.jpg", "/images/p14_02.jpg"],
    summary:
      "A contemporary two-storey residence in execution — deep cantilevered roofs, perforated metal sun-screens, vertical timber louvres, and a stone-and-render base. Handover 2026.",
  },
  {
    slug: "the-curve-house",
    name: "The Curve House",
    type: "Residence",
    location: "Erode",
    timeline: "2025 — 2026",
    status: "IN BUILD",
    cover: "/images/p16_03.jpg",
    images: ["/images/p15_00.jpg", "/images/p16_00.jpg", "/images/p16_01.jpg", "/images/p16_02.jpg", "/images/p16_04.jpg"],
    summary:
      "Sculptural. Contemporary. Rooted. Bold curvilinear volumes, deep cantilevered slabs, geometric lattice screens, and a restrained palette of white render and glass — every cantilever a sun-break, every screen a filter of light and breeze.",
  },
  {
    slug: "house-of-long-window",
    name: "House of Long Window",
    type: "Contemporary Residence",
    location: "Erode",
    timeline: "2025 — 2026",
    status: "IN BUILD",
    cover: "/images/p14_02.jpg",
    summary: "A contemporary residence currently in execution — handover 2026.",
  },
  {
    slug: "the-arch-house",
    name: "The Arch House",
    type: "Residence",
    location: "Erode",
    timeline: "2025 — 2026",
    status: "IN BUILD",
    cover: "/images/p08_01.jpg",
    summary: "A residence in build, carrying the arch language of our flagship farmhouse forward.",
  },
  {
    slug: "dhanam-hospital",
    name: "Dhanam Hospital",
    type: "Multi-Specialty Hospital",
    location: "Erode",
    timeline: "2026 — 2028",
    status: "IN DESIGN",
    area: "18,000 sqft",
    cover: "/images/p12_01.jpg",
    summary:
      "A sculptural five-storey hospital with a dramatically faceted facade — folded metal panels, deep recessed glazing, and a vertical glass entrance tower. Exterior proposal approved February 2026; general contractor from foundation through handover.",
  },
];

export const FEATURED_SLUGS = ["house-of-arches", "the-croft", "manian-medical-centre", "the-curve-house"];

export const TRUST = [
  {
    numeral: "I",
    title: "The District Collector's residence.",
    body: "Selected to build the official residence of the District Collector — the senior-most administrative officer in the region. The kind of brief that comes with security clearance, hard deadlines, and zero margin for error.",
  },
  {
    numeral: "II",
    title: "Election Commission infrastructure.",
    body: "Engaged by the Election Commission to set up temporary counting booth infrastructure during state and general elections. High-security, high-stakes, deadline-bound — the work has to be ready when the votes start coming in.",
  },
  {
    numeral: "III",
    title: "Statewide private commissions.",
    body: "Based in Erode, taking on projects across Tamil Nadu — residential, commercial, and healthcare. The same team and protocols travel with every build, regardless of district or scale.",
  },
];

export const PROMISES = [
  {
    title: "We finish on time.",
    body: "Programmes are agreed in writing at the outset. Median variance across our delivered projects: under 7 days.",
  },
  {
    title: "We don't disappear after handover.",
    body: "24-month post-handover support comes standard. Every snag, every leak, every settling crack is our problem first.",
  },
  {
    title: "We price honestly.",
    body: "Itemised BOQs from day one. No surprise revisions, no “site condition” line items added quietly mid-project.",
  },
  {
    title: "We execute what's drawn.",
    body: "We work seamlessly with your architect, or coordinate one in. Drawings are honoured — not edited on site by the foreman.",
  },
  {
    title: "We document everything.",
    body: "Daily progress photos. Weekly written updates. Material delivery records, test reports, photographs of every concealed line before it's covered.",
  },
];

export const PROCESS = [
  { step: "01", title: "Discovery", body: "Brief, budget, family, timelines. We listen before we propose." },
  { step: "02", title: "Site Study", body: "Soil, sun path, drainage, access, neighbours. The plot's quiet rules." },
  { step: "03", title: "Design Lock", body: "Drawings finalised with your architect, or ours. Signed off before we start." },
  { step: "04", title: "Estimation", body: "Itemised BOQ. Material specs. Contingency baked in, not surprise-added." },
  { step: "05", title: "Build", body: "Documented daily. Weekly client review. Photographs of every concealed run." },
  { step: "06", title: "Quality Audit", body: "A formal snag round before we hand keys over. Nothing leaves unfinished." },
  { step: "07", title: "Handover", body: "Drawings, warranties, photos, vendor list. You get the building and the file." },
];

export const TESTIMONIAL = {
  quote: "They built what we drew. Which sounds simple until you've worked with a builder who didn't.",
  source: "Client · House of Arches",
};
