export type WireColor = "faza" | "nol" | "yer";

export type PortType = "L" | "N" | "PE" | "generic";

export type PortDef = {
  id: string;
  label: string;
  type: PortType;
  x: number;
  y: number;
};

export type ElementType =
  | "manba"
  | "lampa"
  | "kalit"
  | "otish_kalit"
  | "rozetka"
  | "korobka"
  | "avtomat"
  | "uzo";

export type ElementDef = {
  type: ElementType;
  label: string;
  width: number;
  height: number;
  ports: PortDef[];
  internalLinks: [string, string][];
};

export type PlacedElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  state?: boolean | "OUT1" | "OUT2";
};


export type Wire = {
  id: string;
  fromElementId: string;
  fromPort: string;
  toElementId: string;
  toPort: string;
  color: WireColor;
};

export type CanvasState = {
  elements: PlacedElement[];
  wires: Wire[];
};
