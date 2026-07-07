import { Button } from "@/components/ui/Button";
import { CogIcon, QuestionIcon, XIcon } from "@/components/icons";
import { LogoMark } from "@/components/LogoMark";
import { NavRow } from "@/components/dashboard/NavRow";
import { primaryNav } from "@/components/dashboard/nav-items";

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ open = false, onClose }: Props) {
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[280px] shrink-0 flex-col border-r border-border bg-sidebar px-4 py-8 transition-transform duration-300 ease-out-quint lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <LogoMark />
          <Button
            type="button"
            variant="icon-circle"
            aria-label="Close menu"
            onClick={onClose}
            icon={<XIcon size={16} />}
            className="lg:hidden"
          />
        </div>

        <nav className="mt-10 flex flex-col gap-1.5">
          {primaryNav.map((item) => (
            <NavRow key={item.label} {...item} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5">
          <NavRow label="Get Help" icon={QuestionIcon} />
          <NavRow label="Settings" icon={CogIcon} />
        </div>
      </aside>
    </>
  );
}
