function AcronymLetter({ letter }: { letter: string }) {
  return (
    <span className="font-bold text-sky-400">
      {letter}
    </span>
  )
}

function WordRest({ children }: { children: string }) {
  return <span className="font-medium text-slate-300">{children}</span>
}

function AcronymWord({ letter, rest }: { letter: string; rest: string }) {
  return (
    <span className="whitespace-nowrap">
      <AcronymLetter letter={letter} />
      <WordRest>{rest}</WordRest>
    </span>
  )
}

export function CommandTagline() {
  return (
    <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed sm:text-base">
      <AcronymWord letter="C" rest="entralized " />
      <AcronymWord letter="O" rest="perations " />
      <AcronymWord letter="M" rest="onitoring " />
      <WordRest>and </WordRest>
      <span className="whitespace-nowrap">
        <AcronymLetter letter="M" />
        <AcronymLetter letter="A" />
        <AcronymLetter letter="N" />
        <WordRest>agement </WordRest>
      </span>
      <AcronymWord letter="D" rest="ashboard" />
    </p>
  )
}
