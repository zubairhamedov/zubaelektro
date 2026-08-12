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

export default function SimulatorCanvas({ taskSlug, onSuccess }: Props) {
  const task = getTask(taskSlug);

  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [scale, setScale] = useState(1);
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
    const count = elements.filter((e) => e.type === type).length;
    const el: PlacedElement = {
      id: newId(type),
      type,
      x: 40 + (count % 3) * 110,
      y: 40 + Math.floor(elements.length / 3) * 100,
    };
    setElements((prev) => [...prev, el]);
    setResult(null);
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
            return (
              <line
                key={w.id}
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
            );
          })}

          {elements.map((el) => {
            const def = ELEMENT_DEFS[el.type];
            return (
              <g key={el.id}>
                <g
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  style={{ cursor: "grab" }}
                >
                  <rect
                    x={el.x}
                    y={el.y}
                    width={def.width}
                    height={def.height}
                    rx={10}
                    fill="#1A2133"
                    stroke="#FFC93C"
                    strokeWidth={1.5}
                  />
                  <text
                    x={el.x + def.width / 2}
                    y={el.y + def.height / 2 + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#F5F7FA"
                  >
                    {def.label}
                  </text>
                  <circle
                    cx={el.x + def.width - 6}
                    cy={el.y + 6}
                    r={7}
                    fill="#F87171"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                  />
                  <text
                    x={el.x + def.width - 6}
                    y={el.y + 9}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#0F1420"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                  >
                    x
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
                  return (
                    <circle
                      key={port.id}
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
                  );
                })}
              </g>
            );
          })}
        </svg>
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

      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {task.allowedElements.map((type) => (
            <button
              key={type}
              onClick={() => addElement(type)}
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl2 border border-white/10 bg-surface px-3 py-2 active:bg-surfaceHover"
            >
              <span className="text-xs font-medium text-textPrimary">
                + {ELEMENT_DEFS[type].label}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={runCheck}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl2 bg-accent py-3.5 font-display font-semibold text-bg active:opacity-80"
        >
          <CheckCircle2 size={20} />
          Tekshirish
        </button>
      </div>

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
