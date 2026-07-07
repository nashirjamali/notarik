import { WalletIcon } from "@/components/icons";

type Props = {
  className?: string;
};

export function LogoMark({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="grid size-9 place-items-center rounded-lg bg-primary">
        <WalletIcon size={20} className="text-lime" />
      </span>
      <span className="text-lg font-bold tracking-tight text-primary">Notarik</span>
    </div>
  );
}
