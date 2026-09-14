/**
 * Mock CMI data source.
 * Swap the two exported getters for API calls when the backend is ready —
 * the shape returned here is what the views expect.
 */

import { reactive } from "vue";

/* file: { name, date (ISO), type: pdf | excel | word | ppt } */
const f = (name, date, type) => ({ name, date, type });

export const BUSINESSES = reactive([
  {
    slug: "toiletries-home-solution-salt",
    name: "Toiletries, Home Solution & Salt",
    short: "Toiletries & Home Solution",
    icon: "skin",
    accent: "blue",
    brands: ["Savlon", "Neem", "Aromatic", "Vim", "ACI Pure Salt"],
  },
  {
    slug: "food-beverage",
    name: "Food & Beverage",
    short: "Food & Beverage",
    icon: "coffee",
    accent: "amber",
    brands: ["ACI Pure", "Foodie", "Shefa"],
  },
  {
    slug: "hygiene",
    name: "Hygiene Business",
    short: "Hygiene",
    icon: "medicine",
    accent: "teal",
    brands: ["Savlon", "Freedom", "Pure Care"],
  },
  {
    slug: "paints",
    name: "Paints Business",
    short: "Paints",
    icon: "paint",
    accent: "violet",
    brands: ["ACI Paints", "Premium Emulsion"],
  },
]);

/* Placeholders for business units that are not on-boarded yet. */
export const UPCOMING_BUSINESSES = [
  { slug: "upcoming-1", name: "Coming soon" },
  { slug: "upcoming-2", name: "Coming soon" },
];

const STUDIES = reactive({
  "toiletries-home-solution-salt": [
    {
      id: 7,
      topic: "Market Feedback on Neem New Variant Launch",
      studyType: "Qualitative",
      brand: "Neem",
      category: "Bar Soap",
      completionTime: "2026-08-31",
      studyBrief: [f("Neem Variant Study Brief.pdf", "2026-06-02", "pdf")],
      studyProposal: [f("Neem Variant Proposal.docx", "2026-06-14", "word")],
      finalReport: [
        f("Market Survey Result.pdf", "2026-08-01", "pdf"),
        f("Analysis Neem.xlsx", "2026-08-01", "excel"),
        f("Neem Presentation Report.pptx", "2026-08-08", "ppt"),
      ],
    },
    {
      id: 6,
      topic: "Consumer Feedback on Savlon New Handwash",
      studyType: "Quantitative",
      brand: "Savlon",
      category: "Handwash",
      completionTime: "2026-07-22",
      studyBrief: [f("Savlon Handwash Brief.pdf", "2026-05-10", "pdf")],
      studyProposal: [f("Savlon Handwash Proposal.pdf", "2026-05-25", "pdf")],
      finalReport: [
        f("Handwash Usage & Attitude.pdf", "2026-07-20", "pdf"),
        f("Savlon Quant Data.xlsx", "2026-07-22", "excel"),
      ],
    },
    {
      id: 5,
      topic: "Price Perception Study on ACI Pure Salt",
      studyType: "Quantitative",
      brand: "ACI Pure Salt",
      category: "Salt",
      completionTime: "2026-06-18",
      studyBrief: [f("Pure Salt Pricing Brief.docx", "2026-04-02", "word")],
      studyProposal: [f("Pure Salt Pricing Proposal.pdf", "2026-04-19", "pdf")],
      finalReport: [
        f("Price Sensitivity Meter.pdf", "2026-06-18", "pdf"),
        f("Pricing Model.xlsx", "2026-06-18", "excel"),
      ],
    },
    {
      id: 4,
      topic: "Packaging Concept Test — Aromatic Beauty Soap",
      studyType: "Qualitative",
      brand: "Aromatic",
      category: "Bar Soap",
      completionTime: "2026-05-09",
      studyBrief: [f("Aromatic Pack Brief.pdf", "2026-03-11", "pdf")],
      studyProposal: [f("Aromatic Pack Proposal.pptx", "2026-03-28", "ppt")],
      finalReport: [f("Pack Concept Findings.pptx", "2026-05-09", "ppt")],
    },
    {
      id: 3,
      topic: "Category Growth Drivers — Home Cleaning",
      studyType: "Quantitative",
      brand: "Vim",
      category: "Dishwash",
      completionTime: "2026-03-27",
      studyBrief: [f("Home Cleaning Brief.pdf", "2026-01-15", "pdf")],
      studyProposal: [f("Home Cleaning Proposal.docx", "2026-02-01", "word")],
      finalReport: [
        f("Category Growth Report.pdf", "2026-03-27", "pdf"),
        f("Tracking Dashboard.xlsx", "2026-03-27", "excel"),
      ],
    },
    {
      id: 2,
      topic: "Brand Health Tracker — Savlon (Wave 4)",
      studyType: "Quantitative",
      brand: "Savlon",
      category: "Antiseptic",
      completionTime: "2026-02-14",
      studyBrief: [f("BHT Wave 4 Brief.pdf", "2025-12-01", "pdf")],
      studyProposal: [f("BHT Wave 4 Proposal.pdf", "2025-12-20", "pdf")],
      finalReport: [f("Brand Health Wave 4.pptx", "2026-02-14", "ppt")],
    },
    {
      id: 1,
      topic: "Rural Consumer Habit Study — Laundry",
      studyType: "Qualitative",
      brand: "Vim",
      category: "Laundry",
      completionTime: "2026-01-08",
      studyBrief: [f("Rural Laundry Brief.docx", "2025-10-22", "word")],
      studyProposal: [f("Rural Laundry Proposal.pdf", "2025-11-05", "pdf")],
      finalReport: [f("Rural Habit Findings.pdf", "2026-01-08", "pdf")],
    },
  ],

  "food-beverage": [
    {
      id: 3,
      topic: "Taste Preference Test — New Juice Range",
      studyType: "Qualitative",
      brand: "ACI Pure",
      category: "Beverage",
      completionTime: "2026-08-12",
      studyBrief: [f("Juice Range Brief.pdf", "2026-06-01", "pdf")],
      studyProposal: [f("Juice Range Proposal.docx", "2026-06-18", "word")],
      finalReport: [
        f("Taste Test Report.pdf", "2026-08-12", "pdf"),
        f("Sensory Scores.xlsx", "2026-08-12", "excel"),
      ],
    },
    {
      id: 2,
      topic: "Shopper Behaviour in Modern Trade — Snacks",
      studyType: "Quantitative",
      brand: "Foodie",
      category: "Snacks",
      completionTime: "2026-05-30",
      studyBrief: [f("Shopper Study Brief.pdf", "2026-03-09", "pdf")],
      studyProposal: [f("Shopper Study Proposal.pdf", "2026-03-24", "pdf")],
      finalReport: [f("Modern Trade Shopper.pptx", "2026-05-30", "ppt")],
    },
    {
      id: 1,
      topic: "Usage & Attitude — Packaged Flour",
      studyType: "Quantitative",
      brand: "Shefa",
      category: "Staples",
      completionTime: "2026-02-26",
      studyBrief: [f("Flour U&A Brief.docx", "2025-12-08", "word")],
      studyProposal: [f("Flour U&A Proposal.pdf", "2025-12-27", "pdf")],
      finalReport: [f("Flour U&A Report.pdf", "2026-02-26", "pdf")],
    },
  ],

  hygiene: [
    {
      id: 2,
      topic: "Post-Pandemic Hygiene Habit Tracker",
      studyType: "Quantitative",
      brand: "Savlon",
      category: "Sanitizer",
      completionTime: "2026-07-05",
      studyBrief: [f("Hygiene Tracker Brief.pdf", "2026-04-14", "pdf")],
      studyProposal: [f("Hygiene Tracker Proposal.pdf", "2026-04-30", "pdf")],
      finalReport: [
        f("Hygiene Habit Tracker.pdf", "2026-07-05", "pdf"),
        f("Tracker Data Tables.xlsx", "2026-07-05", "excel"),
      ],
    },
    {
      id: 1,
      topic: "Feminine Care Category Landscape",
      studyType: "Qualitative",
      brand: "Freedom",
      category: "Feminine Care",
      completionTime: "2026-04-17",
      studyBrief: [f("Feminine Care Brief.pdf", "2026-02-02", "pdf")],
      studyProposal: [f("Feminine Care Proposal.docx", "2026-02-20", "word")],
      finalReport: [f("Category Landscape.pptx", "2026-04-17", "ppt")],
    },
  ],

  paints: [
    {
      id: 2,
      topic: "Painter Influence on Brand Choice",
      studyType: "Qualitative",
      brand: "ACI Paints",
      category: "Decorative",
      completionTime: "2026-06-29",
      studyBrief: [f("Painter Influence Brief.pdf", "2026-04-08", "pdf")],
      studyProposal: [f("Painter Influence Proposal.pdf", "2026-04-25", "pdf")],
      finalReport: [f("Painter Influence Report.pdf", "2026-06-29", "pdf")],
    },
    {
      id: 1,
      topic: "Colour Trend Study — Urban Households",
      studyType: "Quantitative",
      brand: "Premium Emulsion",
      category: "Emulsion",
      completionTime: "2026-03-11",
      studyBrief: [f("Colour Trend Brief.docx", "2026-01-06", "word")],
      studyProposal: [f("Colour Trend Proposal.pdf", "2026-01-22", "pdf")],
      finalReport: [
        f("Colour Trend Report.pdf", "2026-03-11", "pdf"),
        f("Colour Palette Data.xlsx", "2026-03-11", "excel"),
      ],
    },
  ],
});

/** Business units the signed-in user may open. Wire to the real ACL later. */
export const getAccessibleBusinesses = () => BUSINESSES;

export const getBusinessBySlug = (slug) =>
  BUSINESSES.find((b) => b.slug === slug) || null;

const ACCENTS = ["blue", "amber", "teal", "violet"];

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Adds a business unit to the in-memory list.
 * Swap for a POST once the backend is ready; returns null on a duplicate name.
 */
export const addBusiness = ({ name, brands = [] }) => {
  const label = name.trim();
  const slug = slugify(label);
  if (!slug || BUSINESSES.some((b) => b.slug === slug)) return null;

  const business = {
    slug,
    name: label,
    short: label,
    icon: "skin",
    accent: ACCENTS[BUSINESSES.length % ACCENTS.length],
    brands,
  };

  BUSINESSES.push(business);
  STUDIES[slug] = [];
  return business;
};

/** Studies for one business, most recently completed first. */
export const getStudies = (slug) =>
  [...(STUDIES[slug] || [])].sort(
    (a, b) => new Date(b.completionTime) - new Date(a.completionTime)
  );

/** One study of a business, or null when the id is unknown. */
export const getStudy = (slug, id) =>
  (STUDIES[slug] || []).find((s) => String(s.id) === String(id)) || null;

/** Study types offered by the editor. */
export const STUDY_TYPES = ["Qualitative", "Quantitative", "Mixed Method"];

/**
 * Applies edited fields to a study in place.
 * Swap for a PUT once the backend is ready; returns null when not found.
 */
export const updateStudy = (slug, id, patch) => {
  const study = getStudy(slug, id);
  if (!study) return null;

  Object.assign(study, patch);
  return study;
};

/**
 * Adds a study to a business.
 * Swap for a POST once the backend is ready; returns null on an unknown slug.
 */
export const addStudy = (slug, study) => {
  const list = STUDIES[slug];
  if (!list) return null;

  const nextId = list.reduce((max, s) => Math.max(max, s.id), 0) + 1;
  const created = { id: nextId, ...study };

  list.push(created);
  return created;
};
