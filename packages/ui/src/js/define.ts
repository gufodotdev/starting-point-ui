// Component composition runtime. A component or mixin is a config object
// ({ name, selector, mixins, props, methods, init, ready, destroy }); define()
// merges them and returns a factory the observer calls per element.

type EventName = keyof DocumentEventMap | (string & {});

// `this` inside every method/hook. The core is typed; methods and state that
// mixins contribute ride the index signature (typed boundary, loose internals).
export interface SpInstance {
  readonly el: HTMLElement;
  readonly name: string;
  config: Record<string, unknown>;

  on(target: EventTarget, type: EventName, handler: (e: Event) => void): void;
  emit(type: string, detail?: unknown): boolean;
  dispose(): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface OpenOptions {
  animate?: boolean;
  trigger?: HTMLElement | null;
}

type PropType = StringConstructor | NumberConstructor | BooleanConstructor;
type PropSpec = PropType | { type: PropType; default?: unknown };
type Props = Record<string, PropSpec>;

type Hook = (this: SpInstance) => void;

export interface Mixin {
  props?: Props;
  methods?: Record<string, (this: SpInstance, ...args: never[]) => unknown>;
  init?: Hook;
  ready?: Hook;
  destroy?: Hook;
}

export interface Definition extends Mixin {
  name: string;
  selector: string;
  mixins?: Mixin[];
}

export interface ComponentFactory {
  (el: HTMLElement): SpInstance;
  selector: string;
  componentName: string;
}

const LIFECYCLE = ["init", "ready", "destroy"] as const;

export function define(def: Definition): ComponentFactory {
  const parts: Mixin[] = [...(def.mixins ?? []), def];

  const methods: Record<string, (...args: never[]) => unknown> = {};
  const props: Props = {};
  const hooks: Record<(typeof LIFECYCLE)[number], Hook[]> = { init: [], ready: [], destroy: [] };
  for (const part of parts) {
    Object.assign(methods, part.methods);
    Object.assign(props, part.props);
    for (const phase of LIFECYCLE) {
      const fn = part[phase];
      if (typeof fn === "function") hooks[phase].push(fn);
    }
  }

  function create(el: HTMLElement): SpInstance {
    const cleanups: Array<() => void> = [];

    const instance: SpInstance = {
      el,
      name: def.name,
      config: {},

      on(target, type, handler) {
        const bound = handler.bind(instance);
        target.addEventListener(type, bound);
        cleanups.push(() => target.removeEventListener(type, bound));
      },

      emit(type, detail) {
        return el.dispatchEvent(
          new CustomEvent(`sp-${type}`, { bubbles: true, cancelable: true, detail }),
        );
      },

      dispose() {
        for (const fn of hooks.destroy) fn.call(instance);
        cleanups.forEach((fn) => fn());
        cleanups.length = 0;
      },
    };

    for (const [key, fn] of Object.entries(methods)) {
      instance[key] = fn.bind(instance);
    }

    instance.config = readConfig(el, props);

    // init across all parts, then ready (ready can rely on every init having run)
    for (const fn of hooks.init) fn.call(instance);
    for (const fn of hooks.ready) fn.call(instance);

    return instance;
  }

  create.selector = def.selector;
  create.componentName = def.name;
  return create;
}

// Each option is read from its own attribute on the element: data-sp-<option>.
//   <div class="popover" data-sp-placement="top" data-sp-offset="12">
// A valueless boolean attribute (data-sp-static) coerces to true. props declares
// each option's type (for coercion) and optional default.
function readConfig(el: HTMLElement, props: Props): Record<string, unknown> {
  const cfg: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(props)) {
    cfg[key] = typeof spec === "object" && "default" in spec ? spec.default : undefined;
    const attr = `data-sp-${hyphenate(key)}`;
    if (el.hasAttribute(attr)) cfg[key] = coerce(props[key], el.getAttribute(attr) ?? "");
  }
  return cfg;
}

function hyphenate(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function coerce(spec: PropSpec, value: string): unknown {
  const type = typeof spec === "object" ? spec.type : spec;
  if (type === Number) return Number(value);
  if (type === Boolean) return value === "" || value === "true";
  return value;
}
