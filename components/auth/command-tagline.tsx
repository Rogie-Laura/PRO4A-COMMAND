const ACRONYM_COLORS = {
  C: "#38bdf8",
  O: "#34d399",
  M: "#fbbf24",
  A: "#c084fc",
  N: "#22d3ee",
  D: "#facc15",
} as const

function AcronymLetter({
  letter,
  color,
}: {
  letter: keyof typeof ACRONYM_COLORS
  color: string
}) {
  return (
    <span
      className="inline-block text-2xl font-extrabold tracking-tight sm:text-3xl"
      style={{ color }}
    >
      {letter}
    </span>
  )
}

function WordRest({ children }: { children: string }) {
  return <span className="text-base font-medium text-slate-300 sm:text-lg">{children}</span>
}

export function CommandTagline() {
  return (
    <p className="mx-auto mt-4 max-w-xl text-center leading-8 sm:leading-9">
      <AcronymLetter letter="C" color={ACRONYM_COLORS.C} />
      <WordRest>entralized </WordRest>
      <AcronymLetter letter="O" color={ACRONYM_COLORS.O} />
      <WordRest>perations </WordRest>
      <AcronymLetter letter="M" color={ACRONYM_COLORS.M} />
      <WordRest>onitoring </WordRest>
      <WordRest>and </WordRest>
      <AcronymLetter letter="M" color={ACRONYM_COLORS.M} />
      <AcronymLetter letter="A" color={ACRONYM_COLORS.A} />
      <AcronymLetter letter="N" color={ACRONYM_COLORS.N} />
      <WordRest>agement </WordRest>
      <AcronymLetter letter="D" color={ACRONYM_COLORS.D} />
      <WordRest>ashboard</WordRest>
    </p>
  )
}
