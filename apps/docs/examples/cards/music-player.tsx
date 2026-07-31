import { Pause, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";

export default function MusicPlayer() {
  return (
    <div className="card">
      <img
        src="https://images.unsplash.com/photo-1605084198811-7a358b91dc15?rect=0,0,4000,4000&w=640&h=640&fit=crop&auto=format&q=100"
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
          <Shuffle />
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Previous track">
          <SkipBack fill="currentColor" />
        </button>
        <button className="btn btn-icon rounded-full" aria-label="Pause">
          <Pause fill="currentColor" />
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Next track">
          <SkipForward fill="currentColor" />
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Repeat">
          <Repeat />
        </button>
      </div>
    </div>
  );
}
