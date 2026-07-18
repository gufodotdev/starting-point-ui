type Track = {
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
};

const tracks: Track[] = [
  {
    title: "Becoming a Jackal",
    artist: "Villagers",
    album: "Becoming a Jackal",
    duration: "5:25",
    cover: "7bd8889a",
  },
  {
    title: "Romantic Garbage",
    artist: "Arlo Parks",
    album: "Sophie",
    duration: "3:50",
    cover: "a8a338c1",
  },
  {
    title: "Do the Astral Plane",
    artist: "Flying Lotus",
    album: "Cosmogramma",
    duration: "3:58",
    cover: "f5ddf336",
  },
  {
    title: "Left Hand Free",
    artist: "Alt-J",
    album: "This Is All Yours",
    duration: "2:54",
    cover: "fdab3fb9",
  },
  {
    title: "Other People",
    artist: "Beach House",
    album: "Bloom",
    duration: "4:18",
    cover: "1c7a7245",
  },
];

export default function MusicQueue() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Coming Up</div>
        <div className="card-description">
          {tracks.length} tracks in the queue.
        </div>
        <div className="card-action -mr-2.5">
          <button type="button" className="btn btn-ghost btn-sm">
            Clear
          </button>
        </div>
      </div>
      <div className="card-content flex flex-col gap-1">
        {tracks.map((track) => (
          <div
            key={track.title}
            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
          >
            <img
              src={`https://cdn.gufo.dev/stockphotos/${track.cover}.webp`}
              alt={`Album cover for ${track.title}`}
              className="size-12 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{track.title}</div>
              <div className="truncate text-sm text-muted-foreground">
                {track.artist} – {track.album}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {track.duration}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
