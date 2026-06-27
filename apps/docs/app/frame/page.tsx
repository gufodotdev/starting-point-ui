// Host page for iframed examples: inherits the root layout's CSS and runtime,
// and the parent injects example markup into #frame-root after load.
export default function Frame() {
  // data-no-scrollbar-gutter: don't inset the example; suppressHydrationWarning:
  // the injected children aren't React's to reconcile.
  return (
    <div id="frame-root" data-no-scrollbar-gutter suppressHydrationWarning />
  );
}
