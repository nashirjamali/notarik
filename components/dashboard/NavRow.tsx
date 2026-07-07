import type { IconProps } from "@/components/icons";
import type { ComponentType } from "react";

export type NavRowProps = {
  label: string;
  icon: ComponentType<IconProps>;
  active?: boolean;
};

export function NavRow({ label, icon: Icon, active }: NavRowProps) {
  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors disabled:cursor-default ${
        active
          ? "bg-primary text-primary-ink"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      <Icon size={20} className={active ? "text-lime" : "text-faint"} />
      {label}
    </button>
  );
}
