// Watches the DOM and creates one instance per element matching a registered
// component's selector — on load and as elements are added — disposing them when
// the element leaves the DOM.

import type { ComponentFactory, SpInstance } from "./define";

const instances = new WeakMap<HTMLElement, Map<ComponentFactory, SpInstance>>();
let components: ComponentFactory[] = [];

export const stats = { created: 0, disposed: 0 };

// Create the factory's instance on el and record it, unless one already exists.
function ensure(el: HTMLElement, factory: ComponentFactory): SpInstance {
  const map = instances.get(el) ?? new Map();
  let instance = map.get(factory);
  if (!instance) {
    instance = factory(el);
    stats.created++;
    map.set(factory, instance);
    instances.set(el, map);
  }
  return instance;
}

function initEl(el: HTMLElement): void {
  for (const create of components) {
    if (el.matches?.(create.selector)) ensure(el, create);
  }
}

function disposeEl(el: HTMLElement): void {
  const map = instances.get(el);
  if (!map) return;
  for (const instance of map.values()) {
    instance.dispose();
    stats.disposed++;
  }
  instances.delete(el);
}

// Frameworks often keep an element and swap its class, like a skeleton that
// becomes a chart, so matching is rechecked when a selector's attribute changes.
function rematch(el: HTMLElement): void {
  const map = instances.get(el);
  for (const create of components) {
    const instance = map?.get(create);
    if (el.matches(create.selector)) {
      if (!instance) ensure(el, create);
    } else if (instance) {
      instance.dispose();
      stats.disposed++;
      map!.delete(create);
    }
  }
}

function eachMatch(node: Node, fn: (el: HTMLElement) => void): void {
  if (node.nodeType !== 1) return;
  const el = node as HTMLElement;
  fn(el);
  for (const create of components) {
    el.querySelectorAll?.<HTMLElement>(create.selector).forEach(fn);
  }
}

export function start(componentList: ComponentFactory[], root: HTMLElement = document.body): void {
  components = componentList;
  eachMatch(root, initEl);
  const attributeFilter = [...new Set(["class", ...components.flatMap((c) => [...c.selector.matchAll(/\[([\w-]+)/g)].map((m) => m[1]))])];

  // A moved node (framework reorder/portal) shows up as removal + addition of the
  // same node in one batch. Re-init is a no-op (WeakMap guard) so the instance
  // survives; only dispose nodes that actually left the DOM (!isConnected).
  new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.type === "attributes") {
        if ((rec.target as HTMLElement).isConnected) rematch(rec.target as HTMLElement);
        continue;
      }
      rec.addedNodes.forEach((node) => eachMatch(node, initEl));
      rec.removedNodes.forEach((node) =>
        eachMatch(node, (el) => {
          if (!el.isConnected) disposeEl(el);
        }),
      );
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter });
}

export function reinit(el: HTMLElement, factory: ComponentFactory): void {
  const map = instances.get(el);
  const instance = map?.get(factory);
  if (!instance) return;
  instance.dispose();
  stats.disposed++;
  map!.delete(factory);
  if (el.isConnected && el.matches(factory.selector)) ensure(el, factory);
}

// Init-on-demand: if the element matches but the observer hasn't reached it yet
// (e.g. an inline script before start()), create the instance now. The observer's
// later scan is a no-op for it (WeakMap guard), so there's no double-init.
export function getInstance(el: HTMLElement, factory: ComponentFactory): SpInstance | null {
  const existing = instances.get(el)?.get(factory);
  if (existing) return existing;
  return el.matches?.(factory.selector) ? ensure(el, factory) : null;
}
