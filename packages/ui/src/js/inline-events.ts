// Inline event handlers: data-sp-on-<event> runs its expression when the
// matching sp-<event> bubbles through the element. Experimental; expressions
// need 'unsafe-eval' under a strict CSP.

// Every event a component emits; delegation needs the names up front, so new
// component events must be added here.
const EVENTS = [
  "beforechange",
  "beforecollapse",
  "beforeexpand",
  "beforehide",
  "beforeshow",
  "change",
  "collapse",
  "collapsed",
  "expand",
  "expanded",
  "hidden",
  "hide",
  "hideprevented",
  "select",
  "show",
  "shown",
];

type Handler = (this: HTMLElement, event: Event, el: HTMLElement) => void;

const compiled = new Map<string, Handler>();

function handlerFor(expr: string): Handler {
  let fn = compiled.get(expr);
  if (!fn) {
    try {
      fn = new Function("event", "el", expr) as Handler;
    } catch (error) {
      console.error("starting-point-ui: invalid inline handler", expr, error);
      fn = () => {};
    }
    compiled.set(expr, fn);
  }
  return fn;
}

// Walks from the target up so every ancestor carrying the attribute runs,
// like real bubbling listeners would.
function delegate(event: Event, attr: string): void {
  let node: HTMLElement | null =
    event.target instanceof HTMLElement ? event.target : null;
  while (node) {
    const expr = node.getAttribute(attr);
    if (expr !== null) {
      try {
        handlerFor(expr).call(node, event, node);
      } catch (error) {
        console.error("starting-point-ui: inline handler failed", expr, error);
      }
      // Deprecated but spec'd; the only way to read the stop-propagation flag.
      if (event.cancelBubble) return;
    }
    node = node.parentElement;
  }
}

export function inlineEvents(): void {
  for (const name of EVENTS) {
    const attr = `data-sp-on-${name}`;
    document.addEventListener(`sp-${name}`, (event) => delegate(event, attr));
  }
}
