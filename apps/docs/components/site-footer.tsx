export function SiteFooter() {
  return (
    <footer className="group-has-[[data-slot=docs]]/layout:hidden">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--navbar-height) items-center justify-between">
          <div className="w-full px-1 text-center text-xs leading-loose text-muted-foreground sm:text-sm">
            Built by{" "}
            <a
              href="https://github.com/gufodotdev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Gufo
            </a>
            . The source code is available on{" "}
            <a
              href="https://github.com/gufodotdev/starting-point-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  );
}
