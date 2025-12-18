// Starting Point UI - JavaScript

import * as dialog from "./dialog";
import * as tabs from "./tabs";

export { dialog, tabs };

if (typeof window !== "undefined") {
  (window as any).sp = { dialog, tabs };
}
