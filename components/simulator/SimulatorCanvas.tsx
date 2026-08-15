"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Trash2, X, Plus } from "lucide-react";
import { ELEMENT_DEFS, WIRE_COLOR_HEX, TOGGLEABLE_TYPES } from "@/lib/simulator/elements";
import { ElementType, PlacedElement, Wire, WireColor } from "@/lib/simulator/types";
import { getTask, computeLitLamps, getReachSets } from "@/lib/simulator/checker";

type Props = {
  taskSlug: string;
  onSuccess: () => void;
};

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

const ALL_TYPES = Object.keys(ELEMENT_DEFS) as ElementType[];

function isOn(el: PlacedElement) {
  if (el.type === "otish_kalit") return el.state !== "OUT2" ? "OUT1" : "OUT2";
  return el.state !== false;
}

function ElementIcon({
  type,
  w,
  h,
  el,
  lit,
}: {
  type: ElementType;
  w: number;
  h: number;
  el?: PlacedElement;
  lit?: boolean;
}) {
  switch (type) {
    case "manba":
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={10} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />
          <path
            d={`M ${w * 0.52} ${h * 0.14} L ${w * 0.32} ${h * 0.52} L ${w * 0.47} ${h * 0.52} L ${w * 0.4} ${h * 0.86} L ${w * 0.68} ${h * 0.4} L ${w * 0.5} ${h * 0.4} Z`}
            fill="#FFC93C"
          />
          <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={8} fill="#8A93A6">220V</text>
        </>
      );
    case "lampa": {
      const glow = lit ?? false;
      return (
        <>
          {glow && (
            <circle cx={w / 2} cy={h * 0.4} r={h * 0.46} fill="#FFC93C" opacity={0.25} />
          )}
          <circle
            cx={w / 2}
            cy={h * 0.4}
            r={h * 0.32}
            fill={glow ? "#FFC93C" : "#1A2133"}
            stroke="#FFC93C"
            strokeWidth={1.5}
          />
          <path
            d={`M ${w * 0.4} ${h * 0.4} q ${w * 0.1} ${h * 0.15} ${w * 0.2} 0`}
            stroke={glow ? "#0F1420" : "#FFC93C"}
            strokeWidth={1.5}
            fill="none"
          />
          <rect x={w * 0.4} y={h * 0.68} width={w * 0.2} height={h * 0.16} rx={2} fill="#8A93A6" />
        </>
      );
    }
    case "kalit": {
      const on = el ? isOn(el) : true;
      const leverEnd = on
        ? { x: w * 0.72, y: h * 0.5 }
        : { x: w * 0.62, y: h * 0.18 };
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={8} fill="#1A2133" stroke={on ? "#34D399" : "#8A93A6"} strokeWidth={1.5} />
          <circle cx={w * 0.28} cy={h * 0.5} r={3.5} fill="#F5F7FA" />
          <circle cx={w * 0.72} cy={h * 0.5} r={3.5} fill="#F5F7FA" />
          <line x1={w * 0.28} y1={h * 0.5} x2={leverEnd.x} y2={leverEnd.y} stroke={on ? "#34D399" : "#F5F7FA"} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={w * 0.5} cy={h * 0.14} r={3} fill={on ? "#34D399" : "#4B5563"} />
        </>
      );
    }
    case "otish_kalit": {
      const pos = el ? isOn(el) : "OUT1";
      const active = pos === "OUT1" ? { x: w * 0.85, y: h * 0.2 } : { x: w * 0.85, y: h * 0.8 };
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={8} fill="#1A2133" stroke="#34D399" strokeWidth={1.5} />
          <circle cx={w * 0.2} cy={h * 0.5} r={3.5} fill="#F5F7FA" />
          <circle cx={w * 0.85} cy={h * 0.2} r={3.5} fill="#F5F7FA" opacity={pos === "OUT1" ? 1 : 0.35} />
          <circle cx={w * 0.85} cy={h * 0.8} r={3.5} fill="#F5F7FA" opacity={pos === "OUT2" ? 1 : 0.35} />
          <line x1={w * 0.2} y1={h * 0.5} x2={active.x} y2={active.y} stroke="#34D399" strokeWidth={2.5} strokeLinecap="round" />
        </>
      );
    }
    case "rozetka": {
      const powered = lit ?? false;
      return (
        <>
          <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.46} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />
          <circle cx={w * 0.38} cy={h * 0.42} r={3} fill="#8A93A6" />
          <circle cx={w * 0.62} cy={h * 0.42} r={3} fill="#8A93A6" />
          <rect x={w * 0.44} y={h * 0.6} width={w * 0.12} height={3} fill="#34D399" />
          <circle cx={w * 0.5} cy={h * 0.16} r={2.5} fill={powered ? "#34D399" : "#4B5563"} />
        </>
      );
    }
    case "korobka":
      return (
        <>
          <rect x={2} y={2} width={w - 4} height={h - 4} rx={6} fill="#1A2133" stroke="#8A93A6" strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={w / 2} cy={h / 2} r={4} fill="#FFC93C" />
        </>
      );
    case "avtomat": {
      const on = el ? isOn(el) : true;
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={6} fill="#1A2133" stroke={on ? "#34D399" : "#F87171"} strokeWidth={1.5} />
          <rect
            x={w * 0.4}
            y={on ? h * 0.18 : h * 0.4}
            width={w * 0.2}
            height={h * 0.42}
            rx={2}
            fill={on ? "#34D399" : "#F87171"}
          />
        </>
      );
    }
    case "uzo": {
      const on = el ? isOn(el) : true;
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={6} fill="#1A2133" stroke={on ? "#3B82F6" : "#F87171"} strokeWidth={1.5} />
          <circle cx={w / 2} cy={h / 2} r={h * 0.22} fill="none" stroke={on ? "#3B82F6" : "#F87171"} strokeWidth={1.5} />
          <text x={w / 2} y={h / 2 + 3} textAnchor="middle" fontSize={7} fill={on ? "#3B82F6" : "#F87171"}>T</text>
        </>
      );
    }
    default:
      return <rect x={0} y={0} width={w} height={h} rx={8} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />;
  }
}

function portLabel(portType: string) {
  if (portType === "L") return "L";
  if (portType === "N") return "N";
  if (portType === "PE") return "PE";
  return "";
}

export default function SimulatorCanvas({ taskSlug, onSuccess }: Props) {
  const task = getTask(taskSlug);

  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [scale, setScale] = useState(1);
  const [showPalette, setShowPalette] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [pendingPort, setPendingPort] = useState<{
    elementId: string;
    portId: string;
    portType: string;
  } | null>(null);
  const [colorPickerFor, setColorPickerFor] = useState<{
    elementId: string;
    portId: string;
  } | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const doneRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const litLamps = task ? computeLitLamps(elements, wires) : new Set<string>();
  const reachSets = task
    ? getReachSets(elements, wires)
    : { faza: new Set<string>(), nol: new Set<string>(), yer: new Set<string>() };

  useEffect(() => {
    if (!task) return;
    const res = task.check(elements, wires);
    if (res.success && !doneRef.current) {
      doneRef.current = true;
      setSuccessBanner(true);
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, wires]);

  if (!task) {
    return (
      <div className="p-6 text-center text-textSecondary">
        Bu dars uchun simulyator topilmadi.
      </div>
    );
  }

  function addElement(type: ElementType) {
    const count = elements.length;
    const el: PlacedElement = {
      id: newId(type),
      type,
      x: 40 + (count % 3) * 110,
      y: 40 + Math.floor(count / 3) * 100,
    };
    setElements((prev) => [...prev, el]);
    setShowPalette(false);
  }

  function deleteElement(id: string) {
    setElements((prev) => prev.filter((e) => e.id !== id));
    setWires((prev) => prev.filter((w) => w.fromElementId !== id && w.toElementId !== id));
    setPendingPort(null);
  }

  function deleteWire(id: string) {
    setWires((prev) => prev.filter((w) => w.id !== id));
  }

  function toggleElementState(id: string) {
    setElements((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (e.type === "otish_kalit") {
          return { ...e, state: e.state === "OUT2" ? "OUT1" : "OUT2" };
        }
        const cur = e.state !== false;
        return { ...e, state: !cur };
      })
    );
  }

  function onPortTap(elementId: string, portId: string, portType: string) {
    if (!pendingPort) {
      setPendingPort({ elementId, portId, portType });
      return;
    }
    if (pendingPort.elementId === elementId && pendingPort.portId === portId) {
      setPendingPort(null);
      return;
    }
    const inferredColor = inferColor(pendingPort.portType, portType);
    if (inferredColor) {
      completeWire(pendingPort, { elementId, portId }, inferredColor);
    } else {
      setColorPickerFor({ elementId, portId });
    }
  }

  function inferColor(typeA: string, typeB: string): WireColor | null {
    if (typeA === "L" || typeB === "L") return "faza";
    if (typeA === "N" || typeB === "N") return "nol";
    if (typeA === "PE" || typeB === "PE") return "yer";
    return null;
  }

  function completeWire(
    from: { elementId: string; portId: string },
    to: { elementId: string; portId: string },
    color: WireColor
  ) {
    const wire: Wire = {
      id: newId("wire"),
      fromElementId: from.elementId,
      fromPort: from.portId,
      toElementId: to.elementId,
      toPort: to.portId,
      color,
    };
    setWires((prev) => [...prev, wire]);
    setPendingPort(null);
    setColorPickerFor(null);
  }

  function pickColorForPending(color: WireColor) {
    if (!pendingPort || !colorPickerFor) return;
    completeWire(pendingPort, colorPickerFor, color);
  }

  function portPos(el: PlacedElement, portId: string) {
    const def = ELEMENT_DEFS[el.type];
    const port = def.ports.find((p) => p.id === portId)!;
    return { x: el.x + port.x * def.width, y: el.y + port.y * def.height };
  }

  function handlePointerDown(e: React.PointerEvent, el: PlacedElement) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      id: el.id,
      offsetX: 0,
      offsetY: 0,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    dragRef.current.offsetX = loc.x - el.x;
    dragRef.current.offsetY = loc.y - el.y;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !svgRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;

    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    const { id, offsetX, offsetY } = dragRef.current;
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? { ...el, x: Math.max(0, loc.x - offsetX), y: Math.max(0, loc.y - offsetY) }
          : el
      )
    );
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;

    if (!drag.moved) {
      if (deleteMode) {
        deleteElement(drag.id);
        setDeleteMode(false);
      } else {
        const el = elements.find((e) => e.id === drag.id);
        if (el && TOGGLEABLE_TYPES.includes(el.type)) {
          toggleElementState(drag.id);
        }
      }
    }
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-textSecondary active:bg-surfaceHover"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-textSecondary active:bg-surfaceHover"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        <button
          onClick={() => setDeleteMode((d) => !d)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg active:bg-surfaceHover ${
            deleteMode ? "bg-danger text-white" : "bg-surface text-textSecondary"
          }`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="relative flex-1 overflow-auto">
        <svg
          ref={svgRef}
          width={800 * scale}
          height={500 * scale}
          viewBox="0 0 800 500"
          style={{ width: 800 * scale, height: 500 * scale }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="touch-none"
        >
          <rect
            x={0}
            y={0}
            width={800}
            height={500}
            fill="transparent"
            onPointerDown={() => {
              if (deleteMode) setDeleteMode(false);
            }}
          />
          {wires.map((w) => {
            const fromEl = elements.find((e) => e.id === w.fromElementId);
            const toEl = elements.find((e) => e.id === w.toElementId);
            if (!fromEl || !toEl) return null;
            const from = portPos(fromEl, w.fromPort);
            const to = portPos(toEl, w.toPort);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const label = w.color === "faza" ? "L" : w.color === "nol" ? "N" : "PE";
            return (
              <g key={w.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="transparent"
                  strokeWidth={22}
                  strokeLinecap="round"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (deleteMode) {
                      deleteWire(w.id);
                      setDeleteMode(false);
                    }
                  }}
                />
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={WIRE_COLOR_HEX[w.color]}
                  strokeWidth={3}
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                <rect x={midX - 8} y={midY - 7} width={16} height={12} rx={2} fill="#0F1420" opacity={0.85} pointerEvents="none" />
                <text x={midX} y={midY + 2} textAnchor="middle" fontSize={7.5} fontWeight="bold" fill={WIRE_COLOR_HEX[w.color]} pointerEvents="none">
                  {label}
                </text>
              </g>
            );
          })}

          {elements.map((el) => {
            const def = ELEMENT_DEFS[el.type];
            const lit =
              el.type === "lampa"
                ? litLamps.has(el.id)
                : el.type === "rozetka"
                ? reachSets.faza.has(`${el.id}:L`) && reachSets.nol.has(`${el.id}:N`)
                : undefined;
            return (
              <g key={el.id}>
                <g
                  transform={`translate(${el.x}, ${el.y})`}
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  style={{ cursor: deleteMode ? "pointer" : "grab" }}
                >
                  <rect x={-8} y={-8} width={def.width + 16} height={def.height + 16} fill="transparent" />
                  <ElementIcon type={el.type} w={def.width} h={def.height} el={el} lit={lit} />
                  <text x={def.width / 2} y={-6} textAnchor="middle" fontSize={9} fill="#8A93A6">
                    {def.label}
                  </text>
                </g>
                {def.ports.map((port) => {
                  const pos = portPos(el, port.id);
                  const isPending = pendingPort?.elementId === el.id && pendingPort?.portId === port.id;
                  const colorHex =
                    port.type === "L" ? WIRE_COLOR_HEX.faza :
                    port.type === "N" ? WIRE_COLOR_HEX.nol :
                    port.type === "PE" ? WIRE_COLOR_HEX.yer : "#8A93A6";
                  const lbl = portLabel(port.type);
                  return (
                    <g key={port.id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isPending ? 8 : 6}
                        fill={colorHex}
                        stroke={isPending ? "#FFC93C" : "#0F1420"}
                        strokeWidth={isPending ? 2 : 1}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (!deleteMode) onPortTap(el.id, port.id, port.type);
                        }}
                      />
                      {lbl && (
                        <text x={pos.x} y={pos.y - 10} textAnchor="middle" fontSize={7} fontWeight="bold" fill={colorHex}>
                          {lbl}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

      </div>

      <button
        onClick={() => setShowPalette(true)}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-card active:opacity-80"
      >
        <Plus size={28} />
      </button>

      {showPalette && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold">Element qo'shish</p>
              <button
                onClick={() => setShowPalette(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-textSecondary"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {ALL_TYPES.map((type) => {
                const def = ELEMENT_DEFS[type];
                return (
                  <button
                    key={type}
                    onClick={() => addElement(type)}
                    className="flex flex-col items-center gap-1.5 rounded-xl2 border border-white/10 bg-bg p-2.5 active:bg-surfaceHover"
                  >
                    <svg width={40} height={32} viewBox={`0 0 ${def.width} ${def.height}`}>
                      <ElementIcon type={type} w={def.width} h={def.height} />
                    </svg>
                    <span className="text-center text-[10px] leading-tight text-textSecondary">
                      {def.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {colorPickerFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-xs rounded-xl2 bg-surface p-5 text-center shadow-card">
            <p className="mb-4 font-display font-semibold">Sim rangini tanlang</p>
            <div className="flex justify-center gap-3">
              {(["faza", "nol", "yer"] as WireColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => pickColorForPending(c)}
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: WIRE_COLOR_HEX[c] }}
                >
                  <span className="text-[10px] font-bold text-bg">
                    {c === "faza" ? "L" : c === "nol" ? "N" : "PE"}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setColorPickerFor(null);
                setPendingPort(null);
              }}
              className="mt-4 flex items-center justify-center gap-1 text-sm text-textSecondary"
            >
              <X size={14} /> Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
