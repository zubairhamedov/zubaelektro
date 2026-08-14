import { ELEMENT_DEFS, getActiveLinks } from "./elements";
import { ElementType, PlacedElement, Wire, WireColor } from "./types";

function bfsReachable(

  elements: PlacedElement[],
  wires: Wire[],
  startElementId: string,
  startPort: string,
  color: WireColor
): Set<string> {
  const adj: Record<
    string,
    { node: string; requireColor: boolean; color?: WireColor }[]
  > = {};

  function addEdge(
    a: string,
    b: string,
    requireColor: boolean,
    c?: WireColor
  ) {
    (adj[a] = adj[a] || []).push({ node: b, requireColor, color: c });
    (adj[b] = adj[b] || []).push({ node: a, requireColor, color: c });
  }

  wires.forEach((w) =>
    addEdge(
      `${w.fromElementId}:${w.fromPort}`,
      `${w.toElementId}:${w.toPort}`,
      true,
      w.color
    )
  );

    elements.forEach((el) => {
    getActiveLinks(el).forEach(([a, b]) =>
      addEdge(`${el.id}:${a}`, `${el.id}:${b}`, false)
    );
  });


  const start = `${startElementId}:${startPort}`;
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const edge of adj[cur] || []) {
      if (visited.has(edge.node)) continue;
      if (edge.requireColor && edge.color !== color) continue;
      visited.add(edge.node);
      queue.push(edge.node);
    }
  }
  return visited;
}

function findManba(elements: PlacedElement[]) {
  return elements.find((e) => e.type === "manba") || null;
}

function reach(
  elements: PlacedElement[],
  wires: Wire[],
  manbaId: string,
  netPort: string,
  color: WireColor
) {
  return bfsReachable(elements, wires, manbaId, netPort, color);
}

export function computeLitLamps(
  elements: PlacedElement[],
  wires: Wire[]
): Set<string> {
  const manba = findManba(elements);
  if (!manba) return new Set();
  const fazaSet = reach(elements, wires, manba.id, "L", "faza");
  const nolSet = reach(elements, wires, manba.id, "N", "nol");
  const lit = new Set<string>();
  elements
    .filter((e) => e.type === "lampa")
    .forEach((l) => {
      const ok =
        (fazaSet.has(`${l.id}:P1`) && nolSet.has(`${l.id}:P2`)) ||
        (fazaSet.has(`${l.id}:P2`) && nolSet.has(`${l.id}:P1`));
      if (ok) lit.add(l.id);
    });
  return lit;
}

type CheckResult = { success: boolean; message: string };

type Task = {
  title: string;
  instructions: string;
  allowedElements: ElementType[];
  check: (elements: PlacedElement[], wires: Wire[]) => CheckResult;
};

function checkLoadPorts(
  elements: PlacedElement[],
  wires: Wire[],
  loadType: ElementType,
  portA: string,
  portB: string
): CheckResult {
  const manba = findManba(elements);
  if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };

  const load = elements.find((e) => e.type === loadType);
  if (!load)
    return {
      success: false,
      message: `${ELEMENT_DEFS[loadType].label} qo'shilmagan.`,
    };

  const fazaSet = reach(elements, wires, manba.id, "L", "faza");
  const nolSet = reach(elements, wires, manba.id, "N", "nol");

  const aFaza = fazaSet.has(`${load.id}:${portA}`);
  const bFaza = fazaSet.has(`${load.id}:${portB}`);
  const aNol = nolSet.has(`${load.id}:${portA}`);
  const bNol = nolSet.has(`${load.id}:${portB}`);

  const ok = (aFaza && bNol) || (bFaza && aNol);
  if (!ok) {
    return {
      success: false,
      message:
        "Zanjir yopilmagan. Faza (qizil) va Nol (ko'k) simlarni to'g'ri ulaganingizni tekshiring.",
    };
  }
  return { success: true, message: "To'g'ri! Zanjir yopildi." };
}

export const TASKS: Record<string, Task> = {
  "lampa-ulanishi": {
    title: "Manba va Lampani ulang",
    instructions:
      "220V Manba va Lampani joylashtiring. Faza (qizil) va Nol (ko'k) simlar bilan ulang.",
    allowedElements: ["manba", "lampa"],
    check: (elements, wires) => checkLoadPorts(elements, wires, "lampa", "P1", "P2"),
  },

  "kalit-ulanishi": {
    title: "Manba, Kalit va Lampani ulang",
    instructions:
      "Kalitni FAZA simiga ulang (Nolga emas!), so'ng Lampani ulang.",
    allowedElements: ["manba", "kalit", "lampa"],
    check: (elements, wires) => {
      const manba = findManba(elements);
      if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };
      const kalit = elements.find((e) => e.type === "kalit");
      if (!kalit) return { success: false, message: "Kalit qo'shilmagan." };
      const lampa = elements.find((e) => e.type === "lampa");
      if (!lampa) return { success: false, message: "Lampa qo'shilmagan." };

      const fazaSet = reach(elements, wires, manba.id, "L", "faza");
      const nolSet = reach(elements, wires, manba.id, "N", "nol");

      const kalitOnFaza =
        fazaSet.has(`${kalit.id}:IN`) || fazaSet.has(`${kalit.id}:OUT`);
      if (!kalitOnFaza) {
        return {
          success: false,
          message:
            "Kalit Faza (qizil) chizig'ida bo'lishi kerak. Kalitni Fazaga ulang.",
        };
      }

      const lampOk =
        (fazaSet.has(`${lampa.id}:P1`) && nolSet.has(`${lampa.id}:P2`)) ||
        (fazaSet.has(`${lampa.id}:P2`) && nolSet.has(`${lampa.id}:P1`));

      if (!lampOk) {
        return {
          success: false,
          message: "Lampa to'liq zanjirga ulanmagan.",
        };
      }
      return { success: true, message: "To'g'ri! Kalit Fazada, lampa ishlaydi." };
    },
  },

  "rozetka-ulanishi": {
    title: "Manba va Rozetkani ulang",
    instructions: "Faza, Nol va Yer simlarni Rozetkaning mos kontaktlariga ulang.",
    allowedElements: ["manba", "rozetka"],
    check: (elements, wires) => {
      const manba = findManba(elements);
      if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };
      const rozetka = elements.find((e) => e.type === "rozetka");
      if (!rozetka) return { success: false, message: "Rozetka qo'shilmagan." };

      const fazaSet = reach(elements, wires, manba.id, "L", "faza");
      const nolSet = reach(elements, wires, manba.id, "N", "nol");
      const yerSet = reach(elements, wires, manba.id, "PE", "yer");

      const ok =
        fazaSet.has(`${rozetka.id}:L`) &&
        nolSet.has(`${rozetka.id}:N`) &&
        yerSet.has(`${rozetka.id}:PE`);

      if (!ok) {
        return {
          success: false,
          message:
            "Faza, Nol va Yer — barchasi to'g'ri kontaktga ulanishi kerak.",
        };
      }
      return { success: true, message: "To'g'ri! Rozetka to'liq ulandi." };
    },
  },

  "ikki-joydan-boshqarish": {
    title: "Ikki joydan boshqarish",
    instructions:
      "2 ta O'tish kalitini va Lampani ulang: Manba → 1-kalit → 2-kalit → Lampa.",
    allowedElements: ["manba", "otish_kalit", "lampa"],
    check: (elements, wires) => {
      const manba = findManba(elements);
      if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };
      const kalitlar = elements.filter((e) => e.type === "otish_kalit");
      if (kalitlar.length < 2)
        return { success: false, message: "2 ta o'tish kaliti kerak." };
      const lampa = elements.find((e) => e.type === "lampa");
      if (!lampa) return { success: false, message: "Lampa qo'shilmagan." };

      const fazaSet = reach(elements, wires, manba.id, "L", "faza");
      const nolSet = reach(elements, wires, manba.id, "N", "nol");

      const lampOk =
        (fazaSet.has(`${lampa.id}:P1`) && nolSet.has(`${lampa.id}:P2`)) ||
        (fazaSet.has(`${lampa.id}:P2`) && nolSet.has(`${lampa.id}:P1`));

      const bothKalitOnFaza = kalitlar.every(
        (k) => fazaSet.has(`${k.id}:COM`) || fazaSet.has(`${k.id}:OUT1`) || fazaSet.has(`${k.id}:OUT2`)
      );

      if (!bothKalitOnFaza) {
        return {
          success: false,
          message: "Ikkala o'tish kaliti ham Faza zanjirida bo'lishi kerak.",
        };
      }
      if (!lampOk) {
        return { success: false, message: "Lampa to'liq zanjirga ulanmagan." };
      }
      return { success: true, message: "To'g'ri! Ikki joydan boshqarish tayyor." };
    },
  },

  "korobka-ulash": {
    title: "Korobka orqali 2 ta rozetka",
    instructions:
      "Korobkani Manbaga ulang, so'ng ikkita Rozetkani Korobka orqali ulang.",
    allowedElements: ["manba", "korobka", "rozetka"],
    check: (elements, wires) => {
      const manba = findManba(elements);
      if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };
      const korobka = elements.find((e) => e.type === "korobka");
      if (!korobka) return { success: false, message: "Korobka qo'shilmagan." };
      const rozetkalar = elements.filter((e) => e.type === "rozetka");
      if (rozetkalar.length < 2)
        return { success: false, message: "Kamida 2 ta rozetka kerak." };

      const fazaSet = reach(elements, wires, manba.id, "L", "faza");
      const nolSet = reach(elements, wires, manba.id, "N", "nol");

      const allOk = rozetkalar.every(
        (r) => fazaSet.has(`${r.id}:L`) && nolSet.has(`${r.id}:N`)
      );

      if (!allOk) {
        return {
          success: false,
          message: "Rozetkalarning barchasi Korobka orqali to'liq ulanishi kerak.",
        };
      }
      return { success: true, message: "To'g'ri! Korobka orqali tarqatildi." };
    },
  },

  "avtomat-va-uzo": {
    title: "Avtomat va UZO orqali himoya",
    instructions: "Manba → Avtomat → UZO → Lampa ketma-ketligida ulang.",
    allowedElements: ["manba", "avtomat", "uzo", "lampa"],
    check: (elements, wires) => {
      const manba = findManba(elements);
      if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };
      const avtomat = elements.find((e) => e.type === "avtomat");
      if (!avtomat) return { success: false, message: "Avtomat qo'shilmagan." };
      const uzo = elements.find((e) => e.type === "uzo");
      if (!uzo) return { success: false, message: "UZO qo'shilmagan." };
      const lampa = elements.find((e) => e.type === "lampa");
      if (!lampa) return { success: false, message: "Lampa qo'shilmagan." };

      const fazaSet = reach(elements, wires, manba.id, "L", "faza");
      const nolSet = reach(elements, wires, manba.id, "N", "nol");

      const avtomatOk =
        fazaSet.has(`${avtomat.id}:IN`) || fazaSet.has(`${avtomat.id}:OUT`);
      const uzoOk = fazaSet.has(`${uzo.id}:IN`) || fazaSet.has(`${uzo.id}:OUT`);

      if (!avtomatOk || !uzoOk) {
        return {
          success: false,
          message: "Avtomat va UZO Faza chizig'ida ketma-ket bo'lishi kerak.",
        };
      }

      const lampOk =
        (fazaSet.has(`${lampa.id}:P1`) && nolSet.has(`${lampa.id}:P2`)) ||
        (fazaSet.has(`${lampa.id}:P2`) && nolSet.has(`${lampa.id}:P1`));

      if (!lampOk) {
        return { success: false, message: "Lampa to'liq zanjirga ulanmagan." };
      }
      return { success: true, message: "To'g'ri! Himoya zanjiri tayyor." };
    },
  },

  "shitni-yigish": {
    title: "To'liq shit yig'ish",
    instructions:
      "Manba → Avtomat → UZO → kamida 2 ta Rozetka (Korobka orqali) ulang.",
    allowedElements: ["manba", "avtomat", "uzo", "korobka", "rozetka"],
    check: (elements, wires) => {
      const manba = findManba(elements);
      if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };
      const avtomat = elements.find((e) => e.type === "avtomat");
      const uzo = elements.find((e) => e.type === "uzo");
      const rozetkalar = elements.filter((e) => e.type === "rozetka");
      if (!avtomat) return { success: false, message: "Avtomat qo'shilmagan." };
      if (!uzo) return { success: false, message: "UZO qo'shilmagan." };
      if (rozetkalar.length < 2)
        return { success: false, message: "Kamida 2 ta rozetka kerak." };

      const fazaSet = reach(elements, wires, manba.id, "L", "faza");
      const nolSet = reach(elements, wires, manba.id, "N", "nol");

      const avtomatOk =
        fazaSet.has(`${avtomat.id}:IN`) || fazaSet.has(`${avtomat.id}:OUT`);
      const uzoOk = fazaSet.has(`${uzo.id}:IN`) || fazaSet.has(`${uzo.id}:OUT`);
      const rozOk = rozetkalar.every(
        (r) => fazaSet.has(`${r.id}:L`) && nolSet.has(`${r.id}:N`)
      );

      if (!avtomatOk || !uzoOk || !rozOk) {
        return {
          success: false,
          message: "Shit to'liq va to'g'ri ketma-ketlikda yig'ilmagan.",
        };
      }
      return { success: true, message: "To'g'ri! Shit to'liq yig'ildi." };
    },
  },

  "xona-sxemasi": {
    title: "To'liq xona sxemasi",
    instructions:
      "Manba → Avtomat → UZO → Korobka → Kalit+Lampa va kamida 1 ta Rozetka.",
    allowedElements: [
      "manba",
      "avtomat",
      "uzo",
      "korobka",
      "kalit",
      "lampa",
      "rozetka",
    ],
    check: (elements, wires) => {
      const manba = findManba(elements);
      if (!manba) return { success: false, message: "220V Manba qo'shilmagan." };
      const avtomat = elements.find((e) => e.type === "avtomat");
      const uzo = elements.find((e) => e.type === "uzo");
      const kalit = elements.find((e) => e.type === "kalit");
      const lampa = elements.find((e) => e.type === "lampa");
      const rozetka = elements.find((e) => e.type === "rozetka");

      if (!avtomat || !uzo || !kalit || !lampa || !rozetka) {
        return {
          success: false,
          message:
            "Barcha elementlar kerak: Avtomat, UZO, Kalit, Lampa, Rozetka.",
        };
      }

      const fazaSet = reach(elements, wires, manba.id, "L", "faza");
      const nolSet = reach(elements, wires, manba.id, "N", "nol");

      const chainOk =
        (fazaSet.has(`${avtomat.id}:IN`) || fazaSet.has(`${avtomat.id}:OUT`)) &&
        (fazaSet.has(`${uzo.id}:IN`) || fazaSet.has(`${uzo.id}:OUT`)) &&
        (fazaSet.has(`${kalit.id}:IN`) || fazaSet.has(`${kalit.id}:OUT`));

      const lampOk =
        (fazaSet.has(`${lampa.id}:P1`) && nolSet.has(`${lampa.id}:P2`)) ||
        (fazaSet.has(`${lampa.id}:P2`) && nolSet.has(`${lampa.id}:P1`));

      const rozOk = fazaSet.has(`${rozetka.id}:L`) && nolSet.has(`${rozetka.id}:N`);

      if (!chainOk || !lampOk || !rozOk) {
        return {
          success: false,
          message: "To'liq xona sxemasi hali to'g'ri yig'ilmagan.",
        };
      }
      return { success: true, message: "Ajoyib! To'liq xona sxemasi tayyor." };
    },
  },
};

export function getTask(slug: string) {
  if (slug === "free") {
    return {
      title: "Erkin rejim",
      instructions:
        "Xohlagan elementlarni qo'shib, o'zingiz sxema yig'ing va mashq qiling.",
      allowedElements: Object.keys(ELEMENT_DEFS) as ElementType[],
      check: (elements: PlacedElement[], wires: Wire[]) => {
        const manba = findManba(elements);
        if (!manba)
          return { success: false, message: "220V Manba qo'shilmagan." };
        const lampalar = elements.filter((e) => e.type === "lampa");
        if (lampalar.length === 0) {
          return {
            success: true,
            message: "Sxema saqlandi. (Tekshirish uchun kamida 1 ta lampa qo'shing)",
          };
        }
        const fazaSet = reach(elements, wires, manba.id, "L", "faza");
        const nolSet = reach(elements, wires, manba.id, "N", "nol");
        const anyLit = lampalar.some(
          (l) =>
            (fazaSet.has(`${l.id}:P1`) && nolSet.has(`${l.id}:P2`)) ||
            (fazaSet.has(`${l.id}:P2`) && nolSet.has(`${l.id}:P1`))
        );
        return anyLit
          ? { success: true, message: "Chiroq yondi! Zanjir to'g'ri ishlayapti." }
          : { success: false, message: "Hali hech qanday lampa yonmayapti." };
      },
    };
  }
  return TASKS[slug] || null;
}
