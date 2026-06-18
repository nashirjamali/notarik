import type { Category } from "./types";

/** Visual + textual metadata for the fixed category set. */
export const CATEGORY_META: Record<
  Category,
  { color: string; hint: string }
> = {
  Groceries: { color: "var(--color-cat-groceries)", hint: "Supermarkets, markets, food to cook at home" },
  Dining: { color: "var(--color-cat-dining)", hint: "Restaurants, cafés, takeaway, eating out" },
  Transport: { color: "var(--color-cat-transport)", hint: "Fuel, ride-hailing, parking, tolls, fares" },
  Shopping: { color: "var(--color-cat-shopping)", hint: "Clothing, electronics, household goods" },
  Bills: { color: "var(--color-cat-bills)", hint: "Utilities, subscriptions, phone, internet" },
  Other: { color: "var(--color-cat-other)", hint: "Anything that doesn't fit the rest" },
};
