interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary ${className}`}
    >
      {children}
    </span>
  );
}

export { Badge };
