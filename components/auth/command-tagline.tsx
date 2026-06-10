function AcronymLetter({ letter }: { letter: string }) {
  return (
    <span className="inline-block text-2xl font-extrabold tracking-tight text-sky-400 sm:text-3xl">
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
