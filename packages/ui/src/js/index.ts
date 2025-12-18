// Starting Point UI - JavaScript

import * as dialog from "./dialog";

export { dialog };

if (typeof window !== "undefined") {
  (window as any).sp = { dialog };
}
