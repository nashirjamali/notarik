import { ChartPieIcon, HomeIcon, ListIcon, ReceiptIcon } from "@/components/icons";
import type { NavRowProps } from "@/components/dashboard/NavRow";

export const primaryNav: NavRowProps[] = [
  { label: "Dashboard", icon: HomeIcon, active: true },
  { label: "Receipts", icon: ReceiptIcon },
  { label: "Transactions", icon: ListIcon },
  { label: "Budget", icon: ChartPieIcon },
];
