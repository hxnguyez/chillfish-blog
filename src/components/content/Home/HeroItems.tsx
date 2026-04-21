export function HeroTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      data-pagefind-meta="title"
      className="mb-4 text-4xl leading-tight font-bold text-white md:text-6xl"
    >
      {children}
    </h1>
  );
}

export function HeroSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="line-clamp-3 overflow-hidden text-2xl text-white/40 md:text-4xl">
      {children}
    </p>
  );
}
