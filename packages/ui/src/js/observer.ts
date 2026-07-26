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

  // A moved node (framework reorder/portal) shows up as removal + addition of the
  // same node in one batch. Re-init is a no-op (WeakMap guard) so the instance
  // survives; only dispose nodes that actually left the DOM (!isConnected).
  new MutationObserver((records) => {
    for (const rec of records) {
      rec.addedNodes.forEach((node) => eachMatch(node, initEl));
      rec.removedNodes.forEach((node) =>
        eachMatch(node, (el) => {
          if (!el.isConnected) disposeEl(el);
        }),
      );
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}

// Init-on-demand: if the element matches but the observer hasn't reached it yet
// (e.g. an inline script before start()), create the instance now. The observer's
// later scan is a no-op for it (WeakMap guard), so there's no double-init.
export function getInstance(el: HTMLElement, factory: ComponentFactory): SpInstance | null {
  const existing = instances.get(el)?.get(factory);
  if (existing) return existing;
  return el.matches?.(factory.selector) ? ensure(el, factory) : null;
}
