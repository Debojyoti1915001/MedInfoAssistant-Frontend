const brandText = 'medinfo.ai'

export default function Preloader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
      <h1 className="preloader-word text-4xl sm:text-6xl font-bold tracking-wide text-white">
        {brandText.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="preloader-char inline-block"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  )
}
