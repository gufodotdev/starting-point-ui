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
    minHeight: "12rem",
  },
  "default-tall": {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    width: "100%",
    padding: "2.5rem",
    minHeight: "24rem",
  },
  dialog: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    width: "100%",
    padding: "2.5rem",
    minHeight: "36rem",
  },
  sheet: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    width: "100%",
    padding: "2.5rem",
    minHeight: "667px",
  },
  navbar: {
    display: "flex",
    flexDirection: "column",
    minHeight: "667px",
  },
  sidebar: {
    minHeight: "667px",
  },
};
