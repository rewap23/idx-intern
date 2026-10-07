import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePropertyQuery } from "./parser.ts";

const NONE = {
  city: null, maxPrice: null, beds: null, baths: null, sqft: null,
  type: null, pool: null, hasView: null, maxHoa: null,
};

const cases: [string, Record<string, unknown>][] = [
  ["Show me 3-bedroom condos in Irvine under $1.5M with a pool.",
    { city: "Irvine", maxPrice: 1500000, beds: 3, type: "Condominium", pool: "True" }],
  ["4 bed 3 bath single family home in Newport Beach under 3M",
    { city: "Newport Beach", maxPrice: 3000000, beds: 4, baths: 3, type: "SingleFamilyResidence" }],
  ["townhouse in San Diego with a view and no HOA",
    { city: "San Diego", type: "Townhouse", hasView: "True", maxHoa: 0 }],
  ["2.5 bath 1800 sqft house in Anaheim",
    { city: "Anaheim", baths: 2.5, sqft: 1800, type: "SingleFamilyResidence" }],
  ["Homes in Santa Ana under 800k with at least 1,500 sq ft",
    { city: "Santa Ana", maxPrice: 800000, sqft: 1500 }],
  ["vacant land in Temecula under $500,000",
    { city: "Temecula", maxPrice: 500000, type: "UnimprovedLand" }],
  ["3br 2ba condo with ocean view",
    { beds: 3, baths: 2, type: "Condominium", hasView: "True" }],
  ["three bedroom house in Irvine, CA",
    { city: "Irvine", beds: 3, type: "SingleFamilyResidence" }],
  ["place with a pool and no HOA fees in Carlsbad under $2 million",
    { city: "Carlsbad", maxPrice: 2000000, pool: "True", maxHoa: 0 }],
  ["condo in Irvine HOA under $500",
    { city: "Irvine", type: "Condominium", maxHoa: 500 }],
  ["under 2000 sqft condo in Irvine",
    { city: "Irvine", type: "Condominium" }],
  ["homes without a pool in Fullerton",
    { city: "Fullerton", pool: "False" }],
  ["4+ bedrooms 3+ baths in Irvine",
    { city: "Irvine", beds: 4, baths: 3 }],
  ["Show me homes in Palm Springs with a view under $900k",
    { city: "Palm Springs", maxPrice: 900000, hasView: "True" }],
  ["what's the weather", {}],
];

for (const [query, expected] of cases) {
  test(query, () => {
    assert.deepEqual(parsePropertyQuery(query), { ...NONE, ...expected });
  });
}
