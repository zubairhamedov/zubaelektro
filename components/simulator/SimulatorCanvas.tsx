"use client";

import { useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  RotateCcw,
  X,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { ELEMENT_DEFS, WIRE_COLOR_HEX } from "@/lib/simulator/elements";
import { ElementType, PlacedElement, Wire, WireColor } from "@/lib/simulator/types";
import { getTask } from "@/lib/simulator/checker";

type Props = {
  taskSlug: string;
  onSuccess: () => void;
};

type Snapshot = { elements: PlacedElement[]; wires: Wire[] };

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

const ALL_TYPES = Object.keys(ELEMENT_DEFS) as ElementType[];

function portLabel(portType: string) {
  if (portType === "L") return "L";
  if (portType === "N") return "N";
  if (portType === "PE") return "PE";
  return "";
}

function ElementIcon({ type, w, h }: { type: ElementType; w: number; h: number }) {
  switch (type) {
    case "manba":
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={10} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />
          <path
            d={`M ${w * 0.52} ${h * 0.15} L ${w * 0.32} ${h * 0.55} L ${w * 0.48} ${h * 0.55} L ${w * 0.4} ${h * 0.88} L ${w * 0.68} ${h * 0.42} L ${w * 0.5} ${h * 0.42} Z`}
            fill="#FFC93C"
          />
          <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={8} fill="#8A93A6">220V</text>
        </>
      );
    case "lampa":
      return (
        <>
          <circle cx={w / 2} cy={h * 0.42} r={h * 0.34} fill="#FFC93C" fillOpacity={0.15} stroke="#FFC93C" strokeWidth={1.5} />
          <path
            d={`M ${w * 0.38} ${h * 0.42} q ${w * 0.12} ${h * 0.18} ${w * 0.24} 0`}
            stroke="#FFC93C"
            strokeWidth={1.5}
            fill="none"
          />
          <rect x={w * 0.38} y={h * 0.72} width={w * 0.24} height={h * 0.18} rx={2} fill="#8A93A6" />
        </>
      );
    case "kalit":
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={8} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />
          <circle cx={w * 0.28} cy={h * 0.5} r={3} fill="#F5F7FA" />
          <circle cx={w * 0.72} cy={h * 0.5} r={3} fill="#F5F7FA" />
          <line x1={w * 0.28} y1={h * 0.5} x2={w * 0.65} y2={h * 0.25} stroke="#F5F7FA" strokeWidth={2} />
        </>
      );
    case "otish_kalit":
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={8} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />
          <circle cx={w * 0.22} cy={h * 0.5} r={3} fill="#F5F7FA" />
          <circle cx={w * 0.85} cy={h * 0.2} r={3} fill="#F5F7FA" />
          <circle cx={w * 0.85} cy={h * 0.8} r={3} fill="#F5F7FA" />
          <line x1={w * 0.22} y1={h * 0.5} x2={w * 0.8} y2={h * 0.22} stroke="#F5F7FA" strokeWidth={2} />
        </>
      );
    case "rozetka":
      return (
        <>
          <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.46} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />
          <circle cx={w * 0.38} cy={h * 0.42} r={3} fill="#8A93A6" />
          <circle cx={w * 0.62} cy={h * 0.42} r={3} fill="#8A93A6" />
          <rect x={w * 0.44} y={h * 0.6} width={w * 0.12} height={3} fill="#34D399" />
        </>
      );
    case "korobka":
      return (
        <>
          <rect
            x={2} y={2} width={w - 4} height={h - 4} rx={6}
            fill="#1A2133" stroke="#8A93A6" strokeWidth={1.5} strokeDasharray="4 3"
          />
          <circle cx={w / 2} cy={h / 2} r={4} fill="#FFC93C" />
        </>
      );
    case "avtomat":
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={6} fill="#1A2133" stroke="#F87171" strokeWidth={1.5} />
          <rect x={w * 0.4} y={h * 0.2} width={w * 0.2} height={h * 0.6} rx={2} fill="#F87171" />
        </>
      );
    case "uzo":
      return (
        <>
          <rect x={0} y={0} width={w} height={h} rx={6} fill="#1A2133" stroke="#3B82F6" strokeWidth={1.5} />
          <circle cx={w / 2} cy={h / 2} r={h * 0.22} fill="none" stroke="#3B82F6" strokeWidth={1.5} />
          <text x={w / 2} y={h / 2 + 3} textAnchor="middle" fontSize={7} fill="#3B82F6">T</text>
        </>
      );
    default:
      return <rect x={0} y={0} width={w} height={h} rx={8} fill="#1A2133" stroke="#FFC93C" strokeWidth={1.5} />;
  }
}

export default function SimulatorCanvas({ taskSlug, onSuccess }: Props) {
  const task = getTask(taskSlug);

  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [scale, setScale] = useState(1);
  const [showPalette, setShowPalette] = useState(false);
  const [pendingPort, setPendingPort] = useState<{
    elementId: string;
    portId: string;
    portType: string;
  } | null>(null);
  const [colorPickerFor, setColorPickerFor] = useState<{
    elementId: string;
    portId: string;
  } | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(
    null
  );

  if (!task) {
    return (
      <div className="p-6 text-center text-textSecondary">
        Bu dars uchun simulyator topilmadi.
      </div>
    );
  }

  function pushHistory() {
    setPast((p) => [...p, { elements, wires }]);
    setFuture([]);
  }

  function undo() {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setFuture((f) => [{ elements, wires }, ...f]);
    setPast((p) => p.slice(0, -1));
    setElements(prev.elements);
    setWires(prev.wires);
    setResult(null);
  }

  function redo() {
    if (future.length === 0) return;
    const next = future[0];
    setPast((p) => [...p, { elements, wires }]);
    setFuture((f) => f.slice(1));
    setElements(next.elements);
    setWires(next.wires);
    setResult(null);
  }

  function resetAll() {
    pushHistory();
    setElements([]);
    setWires([]);
    setPendingPort(null);
    setResult(null);
  }

  function addElement(type: ElementType) {
    pushHistory();
    const count = elements.length;
    const el: PlacedElement = {
      id: newId(type),
      type,
      x: 40 + (count % 3) * 110,
      y: 40 + Math.floor(count / 3) * 100,
    };
    setElements((prev) => [...prev, el]);
    setResult(null);
    setShowPalette(false);
  }

  function deleteElement(id: string) {
    pushHistory();
    setElements((prev) => prev.filter((e) => e.id !== id));
    setWires((prev) =>
      prev.filter((w) => w.fromElementId !== id && w.toElementId !== id)
    );
    setPendingPort(null);
    setResult(null);
  }

  function deleteWire(id: string) {
    pushHistory();
    setWires((prev) => prev.filter((w) => w.id !== id));
    setResult(null);
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
    pushHistory();
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
    setResult(null);
  }

  function pickColorForPending(color: WireColor) {
    if (!pendingPort || !colorPickerFor) return;
    completeWire(pendingPort, colorPickerFor, color);
  }

  function portPos(el: PlacedElement, portId: string) {
    const def = ELEMENT_DEFS[el.type];
    const port = def.ports.find((p) => p.id === portId)!;
    return {
      x: el.x + port.x * def.width,
      y: el.y + port.y * def.height,
    };
  }

  function handlePointerDown(e: React.PointerEvent, el: PlacedElement) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    dragRef.current = { id: el.id, offsetX: loc.x - el.x, offsetY: loc.y - el.y };
  }

  function handlePointerMove(e: React.PointerEvent, svgEl: SVGSVGElement | null) {
    if (!dragRef.current || !svgEl) return;
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgEl.getScreenCTM();
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
    if (dragRef.current) {
      pushHistory();
    }
    dragRef.current = null;
  }

  function runCheck() {
    const res = task!.check(elements, wires);
    setResult(res);
    if (res.success) {
      onSuccess();
    }
  }

  const svgRef = useRef<SVGSVGElement | null>(null);

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
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-textSecondary active:bg-surfaceHover disabled:opacity-30"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-textSecondary active:bg-surfaceHover disabled:opacity-30"
          >
            <Redo2 size={16} />
          </button>
          <button
            onClick={resetAll}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-textSecondary active:bg-surfaceHover"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 bg-surface/50 px-4 py-2.5">
        <p className="text-xs text-textSecondary">{task.instructions}</p>
      </div>

      <div className="relative flex-1 overflow-auto">
        <svg
          ref={svgRef}
          width={800 * scale}
          height={500 * scale}
          viewBox="0 0 800 500"
          style={{ width: 800 * scale, height: 500 * scale }}
          onPointerMove={(e) => handlePointerMove(e, svgRef.current)}
          onPointerUp={handlePointerUp}
          className="touch-none"
        >
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
                  stroke={WIRE_COLOR_HEX[w.color]}
                  strokeWidth={3}
                  strokeLinecap="round"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    deleteWire(w.id);
                  }}
                />
                <rect
                  x={midX - 8}
                  y={midY - 7}
                  width={16}
                  height={12}
                  rx={2}
                  fill="#0F1420"
                  opacity={0.85}
                />
                <text
                  x={midX}
                  y={midY + 2}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontWeight="bold"
                  fill={WIRE_COLOR_HEX[w.color]}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {elements.map((el) => {
            const def = ELEMENT_DEFS[el.type];
            return (
              <g key={el.id}>
                <g
                  transform={`translate(${el.x}, ${el.y})`}
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  style={{ cursor: "grab" }}
                >
                  <ElementIcon type={el.type} w={def.width} h={def.height} />
                  <text
                    x={def.width / 2}
                    y={-6}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#8A93A6"
                  >
                    {def.label}
                  </text>
                  <circle
                    cx={def.width - 2}
                    cy={2}
                    r={7}
                    fill="#F87171"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                  />
                  <text
                    x={def.width - 2}
                    y={5}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#0F1420"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                  >
                    ×
                  </text>
                </g>

                {def.ports.map((port) => {
                  const pos = portPos(el, port.id);
                  const isPending =
                    pendingPort?.elementId === el.id &&
                    pendingPort?.portId === port.id;
                  const colorHex =
                    port.type === "L"
                      ? WIRE_COLOR_HEX.faza
                      : port.type === "N"
                      ? WIRE_COLOR_HEX.nol
                      : port.type === "PE"
                      ? WIRE_COLOR_HEX.yer
                      : "#8A93A6";
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
                          onPortTap(el.id, port.id, port.type);
                        }}
                      />
                      {lbl && (
                        <text
                          x={pos.x}
                          y={pos.y - 10}
                          textAnchor="middle"
                          fontSize={7}
                          fontWeight="bold"
                          fill={colorHex}
                        >
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

        <button
          onClick={() => setShowPalette(true)}
          className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-card active:opacity-80"
        >
          <Plus size={28} />
        </button>
      </div>

      {result && (
        <div
          className={`px-4 py-3 text-sm ${
            result.success
              ? "bg-success/15 text-success"
              : "bg-danger/15 text-danger"
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="border-t border-white/10 px-4 py-3">
        <button
          onClick={runCheck}
          className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-accent py-3.5 font-display font-semibold text-bg active:opacity-80"
        >
          <CheckCircle2 size={20} />
          Tekshirish
        </button>
      </div>

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
