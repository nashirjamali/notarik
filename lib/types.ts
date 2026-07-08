export const CATEGORIES = [
  "Groceries",
  "Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Item {
  name: string;
  qty?: number;
  price?: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  date: string; // ISO YYYY-MM-DD
  total: number;
  currency: "IDR";
  category: Category;
  items: Item[];
  createdAt: string; // ISO timestamp
  imageThumb?: string;
  tags?: string[];
  recurring?: boolean;
  wasEdited?: boolean;
}

/**
 * The shape the extraction API returns: the model's best read of a receipt,
 * before the user reviews and confirms it. Fields the model couldn't read
 * come back null so the UI can flag them rather than show a guess.
 */
export interface ExtractionResult {
  merchant: string | null;
  date: string | null;
  total: number | null;
  currency: "IDR";
  category: Category;
  items: Item[];
}
