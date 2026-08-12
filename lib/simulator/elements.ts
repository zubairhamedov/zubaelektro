import { ElementDef, ElementType } from "./types";

export const ELEMENT_DEFS: Record<ElementType, ElementDef> = {
  manba: {
    type: "manba",
    label: "220V Manba",
    width: 90,
    height: 60,
    ports: [
      { id: "L", label: "L", type: "L", x: 0, y: 0.25 },
      { id: "N", label: "N", type: "N", x: 0, y: 0.75 },
      { id: "PE", label: "PE", type: "PE", x: 1, y: 0.5 },
    ],
    internalLinks: [],
  },
  lampa: {
    type: "lampa",
    label: "Lampa",
    width: 64,
    height: 64,
    ports: [
      { id: "P1", label: "1", type: "generic", x: 0, y: 0.5 },
      { id: "P2", label: "2", type: "generic", x: 1, y: 0.5 },
    ],
    internalLinks: [],
  },
  kalit: {
    type: "kalit",
    label: "Kalit",
    width: 70,
    height: 44,
    ports: [
      { id: "IN", label: "in", type: "generic", x: 0, y: 0.5 },
      { id: "OUT", label: "out", type: "generic", x: 1, y: 0.5 },
    ],
    internalLinks: [["IN", "OUT"]],
  },
  otish_kalit: {
    type: "otish_kalit",
    label: "O'tish kaliti",
    width: 80,
    height: 60,
    ports: [
      { id: "COM", label: "umumiy", type: "generic", x: 0, y: 0.5 },
      { id: "OUT1", label: "1", type: "generic", x: 1, y: 0.2 },
      { id: "OUT2", label: "2", type: "generic", x: 1, y: 0.8 },
    ],
    internalLinks: [
      ["COM", "OUT1"],
      ["COM", "OUT2"],
    ],
  },
  rozetka: {
    type: "rozetka",
    label: "Rozetka",
    width: 70,
    height: 70,
    ports: [
      { id: "L", label: "L", type: "L", x: 0, y: 0.2 },
      { id: "N", label: "N", type: "N", x: 0, y: 0.5 },
      { id: "PE", label: "PE", type: "PE", x: 0, y: 0.8 },
    ],
    internalLinks: [],
  },
  korobka: {
    type: "korobka",
    label: "Korobka",
    width: 84,
    height: 84,
    ports: [
      { id: "L1", label: "L", type: "L", x: 0, y: 0.15 },
      { id: "L2", label: "L", type: "L", x: 0, y: 0.35 },
      { id: "L3", label: "L", type: "L", x: 1, y: 0.15 },
      { id: "N1", label: "N", type: "N", x: 0, y: 0.55 },
      { id: "N2", label: "N", type: "N", x: 1, y: 0.35 },
      { id: "N3", label: "N", type: "N", x: 1, y: 0.55 },
      { id: "PE1", label: "PE", type: "PE", x: 0, y: 0.85 },
      { id: "PE2", label: "PE", type: "PE", x: 1, y: 0.85 },
    ],
    internalLinks: [
      ["L1", "L2"], ["L2", "L3"],
      ["N1", "N2"], ["N2", "N3"],
      ["PE1", "PE2"],
    ],
  },
  avtomat: {
    type: "avtomat",
    label: "Avtomat",
    width: 60,
    height: 44,
    ports: [
      { id: "IN", label: "in", type: "generic", x: 0, y: 0.5 },
      { id: "OUT", label: "out", type: "generic", x: 1, y: 0.5 },
    ],
    internalLinks: [["IN", "OUT"]],
  },
  uzo: {
    type: "uzo",
    label: "UZO",
    width: 60,
    height: 44,
    ports: [
      { id: "IN", label: "in", type: "generic", x: 0, y: 0.5 },
      { id: "OUT", label: "out", type: "generic", x: 1, y: 0.5 },
    ],
    internalLinks: [["IN", "OUT"]],
  },
};

export const WIRE_COLOR_HEX: Record<string, string> = {
  faza: "#EF4444",
  nol: "#3B82F6",
  yer: "#22C55E",
};
