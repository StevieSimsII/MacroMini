interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`card shadow-subtle ${onClick ? 'cursor-pointer hover:bg-[var(--color-hover)]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
