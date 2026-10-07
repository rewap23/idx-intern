export interface PropertyFilters {
  city: string | null;              // L_City
  maxPrice: number | null;          // L_SystemPrice <=
  beds: number | null;              // L_Keyword2 >= (minimum)
  baths: number | null;             // LM_Dec_3 >= (minimum)
  sqft: number | null;              // LM_Int2_3 >= (minimum)
  type: string | null;              // L_Type_
  pool: "True" | "False" | null;    // PoolPrivateYN
  hasView: "True" | null;           // ViewYN
  maxHoa: number | null;            // AssociationFee <=
}

const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
const num = (s: string) => WORDS[s.toLowerCase()] ?? Number(s.replace(/,/g, ""));

function money(n: string, suffix?: string): number {
  let v = Number(n.replace(/,/g, ""));
  const s = (suffix ?? "").toLowerCase();
  if (s === "k" || s === "thousand") v *= 1_000;
  else if (s) v *= 1_000_000; // m, mm, mil, million(s)
  return Math.round(v);
}

const titleCase = (s: string) =>
  s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

const SUFFIX = "(k|thousand|mm|m|mil(?:lion)?s?)?";
const MONTHLY = "(?:\\s*(?:\\/\\s*mo(?:nth)?|a month|per month|monthly))?";

const HOA_NONE = /\b(?:no|zero|without)\s+hoa(?:\s+(?:fees?|dues))?\b/i;
const HOA = new RegExp(
  "\\bhoa(?:\\s+(?:fees?|dues))?\\s*(?:of\\s+)?(?:under|below|less than|up to|max(?:imum)?|at most|<=?)?\\s*\\$?\\s*(\\d[\\d,]*)" + MONTHLY, "i");
const HOA_REV = new RegExp(
  "(?:under|below|less than|up to|max(?:imum)?)\\s*\\$?\\s*(\\d[\\d,]*)" + MONTHLY + "\\s*(?:in\\s+)?hoa\\b", "i");

const SQFT = /(?:(under|below|less than|at least|over|min(?:imum)?|>=?)\s*)?(\d[\d,]*)\s*\+?\s*(?:sq\.?\s?ft\.?|square\s*(?:feet|foot|ft))(?![a-z])/i;

const QUAL = "(?:(?:at least|minimum|min|over|more than)\\s+)?";
const BEDS = new RegExp("\\b" + QUAL + "(\\d+|one|two|three|four|five|six)\\s*\\+?[\\s-]*(?:bed(?:room)?s?|br|bd)\\b", "i");
const BATHS = new RegExp("\\b" + QUAL + "(\\d+(?:\\.\\d)?|one|two|three|four|five)\\s*\\+?[\\s-]*(?:bath(?:room)?s?|ba)\\b", "i");

const PRICE = new RegExp(
  "(?:under|below|less than|up to|max(?:imum)?(?:\\s+price)?|at most|not more than|budget(?:\\s+of)?|<=?)\\s*\\$?\\s*(\\d[\\d,]*(?:\\.\\d+)?)\\s*" + SUFFIX + "\\b", "i");
const PRICE_REV = new RegExp(
  "\\$?\\s*(\\d[\\d,]*(?:\\.\\d+)?)\\s*" + SUFFIX + "\\s*(?:or less|or under|or below|and under|max)\\b", "i");

const CITY = /\bin\s+([A-Za-z][A-Za-z'’\- ]*?)(?=\s+(?:with|and|that|which|for|no|without|having|has|where)\b|\s*[,.$\d]|\s*$)/i;

// order matters: "townhouse" must be checked before "house"
const TYPES: [RegExp, string][] = [
  [/\btown\s?(?:home|house)s?\b/i, "Townhouse"],
  [/\bcondo(?:minium)?s?\b/i, "Condominium"],
  [/\bsingle[\s-]?family\b|\bsfr\b|\bhouses?\b/i, "SingleFamilyResidence"],
  [/\b(?:land|vacant lot)s?\b/i, "UnimprovedLand"],
];

export function parsePropertyQuery(query: string): PropertyFilters {
  let q = ` ${query} `;
  // find a match, cut it out of the working string so later patterns can't re-use it
  const take = (re: RegExp): RegExpExecArray | null => {
    const m = re.exec(q);
    if (m) q = q.slice(0, m.index) + " " + q.slice(m.index + m[0].length);
    return m;
  };

  const out: PropertyFilters = {
    city: null, maxPrice: null, beds: null, baths: null, sqft: null,
    type: null, pool: null, hasView: null, maxHoa: null,
  };

  // HOA first so "HOA under $500" isn't mistaken for a price
  if (take(HOA_NONE)) out.maxHoa = 0;
  else {
    const h = take(HOA) ?? take(HOA_REV);
    if (h) out.maxHoa = num(h[1]);
  }

  // "under 2000 sqft" is a maximum, which the filter set doesn't support: strip it, don't misread it
  const sq = take(SQFT);
  if (sq && !/^(under|below|less than)$/i.test(sq[1] ?? "")) out.sqft = num(sq[2]);

  const bd = take(BEDS);
  if (bd) out.beds = num(bd[1]);
  const ba = take(BATHS);
  if (ba) out.baths = num(ba[1]);

  const p = take(PRICE) ?? take(PRICE_REV);
  if (p) {
    const v = money(p[1], p[2]);
    out.maxPrice = v >= 10_000 ? v : null; // guard against "under 500" style noise
  }

  const c = CITY.exec(q);
  if (c) out.city = titleCase(c[1].replace(/\s+(?:CA|California)$/i, "").trim()) || null;

  out.type = TYPES.find(([re]) => re.test(q))?.[1] ?? null;

  if (/\b(?:no|without)\s+(?:a\s+)?(?:private\s+)?pool\b/i.test(q)) out.pool = "False";
  else if (/\bpool\b/i.test(q)) out.pool = "True";

  if (!/\b(?:no|without)\s+(?:a\s+)?views?\b/i.test(q) && /\bviews?\b/i.test(q)) out.hasView = "True";

  return out;
}
