import type { CSSProperties } from "react";

export const framePresets: Record<string, CSSProperties> = {
  default: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    width: "100%",
    padding: "2.5rem",
  },
  popover: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    width: "100%",
    padding: "2.5rem",
    minHeight: "20rem",
  },
  sidebar: {
    height: "500px",
    overflow: "hidden",
  },
};
