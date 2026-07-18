export default function MusicPlayer() {
  return (
    <div className="card">
      <img
        src="https://cdn.gufo.dev/stockphotos/f5ddf336.webp"
        alt="Album cover"
        className="aspect-square w-full object-cover"
      />
      <div className="card-header text-center">
        <h3 className="card-title">Midnight Dreams</h3>
        <p className="card-description">Luna Eclipse</p>
      </div>
      <div className="card-content grid gap-2">
        <progress
          className="progress"
          value={83}
          max={225}
          aria-label="Playback position"
        ></progress>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1:23</span>
          <span>3:45</span>
        </div>
      </div>
      <div className="card-footer justify-center gap-4">
        <button className="btn btn-ghost btn-icon" aria-label="Shuffle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/></svg>
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Previous track">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z"/><path d="M3 20V4"/></svg>
        </button>
        <button className="btn btn-icon rounded-full" aria-label="Pause">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Next track">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16"/><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"/></svg>
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Repeat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
        </button>
      </div>
    </div>
  );
}
