export default function Header({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3"
            style={{ borderColor: 'var(--color-border)' }}>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
