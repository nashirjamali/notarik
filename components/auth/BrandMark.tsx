type Props = {
  withWordmark?: boolean;
  className?: string;
};

export function BrandMark({ withWordmark = true, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-10 place-items-center rounded-xl bg-primary-500 font-serif text-xl leading-none text-white">
        N
      </span>
      {withWordmark ? (
        <span className="text-title-2 font-semibold tracking-tight text-neutral-900 dark:text-white">
          Notarik
        </span>
      ) : null}
    </span>
  );
}
