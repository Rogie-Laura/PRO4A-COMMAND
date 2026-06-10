function AcronymLetter({ letter }: { letter: string }) {
  return (
    <span className="inline-block text-base font-bold tracking-tight text-sky-400 sm:text-lg">
      {letter}
    </span>
  )
}

function WordRest({ children }: { children: string }) {
  return <span className="text-sm font-medium text-slate-300 sm:text-base">{children}</span>
}

export function CommandTagline() {
  return (
    <p className="mx-auto mt-3 max-w-xl text-center leading-relaxed">
      <AcronymLetter letter="C" />
      <WordRest>entralized </WordRest>
      <AcronymLetter letter="O" />
      <WordRest>perations </WordRest>
      <AcronymLetter letter="M" />
      <WordRest>onitoring </WordRest>
      <WordRest>and </WordRest>
      <AcronymLetter letter="M" />
      <AcronymLetter letter="A" />
      <AcronymLetter letter="N" />
      <WordRest>agement </WordRest>
      <AcronymLetter letter="D" />
      <WordRest>ashboard</WordRest>
    </p>
  )
}
