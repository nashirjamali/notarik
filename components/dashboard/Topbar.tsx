import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  userName: string;
  onMenuClick?: () => void;
};

export function Topbar({ title, userName, onMenuClick }: Props) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="icon-circle"
          aria-label="Open menu"
          onClick={onMenuClick}
          icon={<MenuIcon size={18} />}
          className="lg:hidden"
        />
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="icon-circle"
          aria-label="Search"
          icon={<SearchIcon size={18} />}
          className="hidden sm:inline-flex"
        />
        <div className="relative">
          <Button
            type="button"
            variant="icon-circle"
            aria-label="Notifications"
            icon={<BellIcon size={18} />}
          />
          <span className="pointer-events-none absolute right-2.5 top-2.5 size-2 rounded-full bg-danger" />
        </div>
        <Button
          type="button"
          variant="profile"
          icon={<ChevronDownIcon size={16} className="text-faint" />}
          iconPosition="right"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-ink">
            {initials}
          </span>
          <span className="hidden text-sm font-bold text-ink sm:inline">{userName}</span>
        </Button>
      </div>
    </header>
  );
}
