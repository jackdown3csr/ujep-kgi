// Geodézie: interaktivní pravoúhlý trojúhelník a procvičování goniometrie a podobnosti.

type Jednotka = 'gon' | 'deg';

const hezky = (n: number, mist = 6) =>
  Number.isFinite(n) ? n.toLocaleString('cs-CZ', { maximumFractionDigits: mist }) : '';
const pevne = (n: number, mist: number) =>
  n.toLocaleString('cs-CZ', { minimumFractionDigits: mist, maximumFractionDigits: mist });
const nacti = (s: string) => {
  const t = s.replace(/[\s ]/g, '').replace(',', '.').replace('−', '-');
  return t === '' ? NaN : Number(t);
};

// Převody úhlů. „rad“ je jen pro odhalení kalkulačky v režimu RAD.
const NA_RAD: Record<Jednotka | 'rad', number> = { gon: Math.PI / 200, deg: Math.PI / 180, rad: 1 };
const znacka = (j: Jednotka) => (j === 'gon' ? ' gon' : '°');
const uhel = (v: number, j: Jednotka, mist = 4) => pevne(v, j === 'gon' ? mist : Math.min(mist, 2)) + znacka(j);
const PRAVY: Record<Jednotka, number> = { gon: 100, deg: 90 };

const pamet = {
  cti<T>(klic: string, vychozi: T): T {
    try { const v = localStorage.getItem(klic); return v ? (JSON.parse(v) as T) : vychozi; } catch { return vychozi; }
  },
  pis(klic: string, v: unknown) {
    try { localStorage.setItem(klic, JSON.stringify(v)); } catch { /* bez paměti to jde taky */ }
  },
};

// Pravoúhlý trojúhelník: A vlevo dole, C vpravo dole (pravý úhel), B nahoře.
// zvyrazni = úhel, ke kterému se barví protilehlá / přilehlá.
function kresliTrojuhelnik(alfa: number, c: number, opt: { zvyrazni?: 'A' | 'B'; popisky?: Record<'a' | 'b' | 'c', string>; maxC?: number; sirka?: number }) {
  const W = opt.sirka ?? 320, H = Math.round(W * 0.78), okraj = 34;
  const meritko = Math.min((W - 2 * okraj) / ((opt.maxC ?? c) * Math.cos(alfa) || 1), (H - 2 * okraj) / ((opt.maxC ?? c) * Math.sin(alfa) || 1), (W - 2 * okraj) / (opt.maxC ?? c));
  const b = c * Math.cos(alfa) * meritko, a = c * Math.sin(alfa) * meritko;
  const A = [okraj, H - okraj], C = [okraj + b, H - okraj], B = [okraj + b, H - okraj - a];
  const z = opt.zvyrazni;
  const druh = (strana: 'a' | 'b' | 'c') =>
    !z ? 'gt-neutral' : strana === 'c' ? 'gt-prepona' : (strana === 'a') === (z === 'A') ? 'gt-protilehla' : 'gt-prilehla';
  const ctverec = 12;
  const p = opt.popisky ?? { a: 'a', b: 'b', c: 'c' };
  // oblouček úhlu u zvýrazněného vrcholu
  const r = 30;
  const oblouk = z === 'B'
    ? `M ${B[0]} ${B[1] + r} A ${r} ${r} 0 0 1 ${B[0] - r * Math.cos(alfa)} ${B[1] + r * Math.sin(alfa)}`
    : `M ${A[0] + r} ${A[1]} A ${r} ${r} 0 0 0 ${A[0] + r * Math.cos(alfa)} ${A[1] - r * Math.sin(alfa)}`;
  const recky = z === 'B'
    ? `<text class="gt-recky" x="${B[0] - 12}" y="${B[1] + r + 14}">β</text>`
    : `<text class="gt-recky" x="${A[0] + r + 6}" y="${A[1] - 6}">α</text>`;
  // výška obrázku jen podle trojúhelníku, ať nad ním nezůstává prázdno; měřítko zůstává stejné
  const horni = Math.max(0, B[1] - okraj);
  return `<svg class="gt-svg" viewBox="0 ${horni} ${W} ${H - horni}" style="max-width:${W}px" role="img" aria-label="Pravoúhlý trojúhelník ABC">
    <path class="gt-uhel" d="${oblouk}" />${z ? recky : ''}
    <path class="gt-pravy" d="M ${C[0] - ctverec} ${C[1]} V ${C[1] - ctverec} H ${C[0]}" />
    <line class="${druh('b')}" x1="${A[0]}" y1="${A[1]}" x2="${C[0]}" y2="${C[1]}" />
    <line class="${druh('a')}" x1="${C[0]}" y1="${C[1]}" x2="${B[0]}" y2="${B[1]}" />
    <line class="${druh('c')}" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" />
    <text class="gt-vrchol" x="${A[0] - 14}" y="${A[1] + 16}">A</text>
    <text class="gt-vrchol" x="${C[0] + 6}" y="${C[1] + 16}">C</text>
    <text class="gt-vrchol" x="${B[0] + 6}" y="${B[1] - 4}">B</text>
    <text class="gt-strana ${druh('b')}" x="${(A[0] + C[0]) / 2}" y="${A[1] + 20}" text-anchor="middle">${p.b}</text>
    <text class="gt-strana ${druh('a')}" x="${C[0] + 8}" y="${(C[1] + B[1]) / 2 + 5}">${p.a}</text>
    <text class="gt-strana ${druh('c')}" x="${(A[0] + B[0]) / 2 - 10}" y="${(A[1] + B[1]) / 2 - 8}" text-anchor="end">${p.c}</text>
  </svg>`;
}

const prepinac = (popis: string, nazev: string, volby: [string, string][], vybrana: string) => `
  <div class="nastroj-rezim" role="radiogroup" aria-label="${popis}" data-prepinac="${nazev}">
    <span class="nastroj-rezim-popis">${popis}</span>
    ${volby.map(([h, t]) => `<button type="button" data-hodnota="${h}" class="${h === vybrana ? 'aktivni' : ''}">${t}</button>`).join('')}
  </div>`;

function napojPrepinac(el: HTMLElement, nazev: string, zmena: (h: string) => void) {
  const box = el.querySelector(`[data-prepinac="${nazev}"]`) as HTMLElement;
  box.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    box.querySelectorAll('button').forEach((x) => x.classList.toggle('aktivni', x === b));
    zmena(b.dataset.hodnota!);
  });
}

export function trojuhelnik(el: HTMLElement) {
  let jedn: Jednotka = pamet.cti('gon-jednotka', 'gon');
  let vrchol: 'A' | 'B' = 'A';
  el.className = 'nastroj';
  el.innerHTML = `
    <div class="gt-prepinace">
      ${prepinac('Úhel', 'vrchol', [['A', 'α u A'], ['B', 'β u B']], 'A')}
      ${prepinac('Jednotky', 'jedn', [['gon', 'gon'], ['deg', '°']], jedn)}
    </div>
    <div class="gt-posuvniky">
      <label><span>Úhel <b data-hodnota="uhel"></b></span><input type="range" data-posuvnik="uhel" /></label>
      <label><span>Přepona c <b data-hodnota="c"></b></span><input type="range" data-posuvnik="c" min="2" max="10" step="0.5" value="5" /></label>
    </div>
    <div class="gt-telo">
      <div class="gt-kresba"></div>
      <div class="gt-pomery" aria-live="polite"></div>
    </div>`;
  const posuvnik = (n: string) => el.querySelector(`[data-posuvnik="${n}"]`) as HTMLInputElement;
  const nastavRozsah = (stupne: number) => {
    const u = posuvnik('uhel');
    u.min = '1'; u.max = String(PRAVY[jedn] - 1); u.step = '1';
    u.value = String(Math.round(jedn === 'gon' ? stupne / 0.9 : stupne));
  };
  nastavRozsah(36.87); // trojúhelník 3 : 4 : 5

  function prepocti() {
    const v = Number(posuvnik('uhel').value), c = Number(posuvnik('c').value);
    const alfa = v * NA_RAD[jedn];
    // u vrcholu B je zvolený úhel β, trojúhelník kreslíme pořád s α u A
    const alfaA = vrchol === 'A' ? alfa : Math.PI / 2 - alfa;
    const a = c * Math.sin(alfaA), b = c * Math.cos(alfaA);
    (el.querySelector('[data-hodnota="uhel"]') as HTMLElement).textContent = `${vrchol === 'A' ? 'α' : 'β'} = ${hezky(v)}${znacka(jedn)}`;
    (el.querySelector('[data-hodnota="c"]') as HTMLElement).textContent = `= ${hezky(c)}`;
    const delka = (x: number) => pevne(x, 2);
    (el.querySelector('.gt-kresba') as HTMLElement).innerHTML = kresliTrojuhelnik(alfaA, c, {
      zvyrazni: vrchol, maxC: 10, popisky: { a: `a = ${delka(a)}`, b: `b = ${delka(b)}`, c: `c = ${delka(c)}` },
    });
    const [prot, pril] = vrchol === 'A' ? [['a', a], ['b', b]] as const : [['b', b], ['a', a]] as const;
    const r = vrchol === 'A' ? 'α' : 'β';
    const s = (jm: string, x: number, druh: string) => `<span class="${druh}">${jm} = ${delka(x)}</span>`;
    const radek = (f: string, slovy: string, cit: string, jm: string, x: number, y: number) => `
      <div class="gt-radek"><span class="gt-fce">${f} ${r}</span>
        <span class="gt-zlomek"><span>${cit}</span><span>${jm}</span></span>
        <span class="gt-slovy">${slovy}</span>
        <span class="gt-vysl">= ${pevne(x / y, 4)}</span></div>`;
    const P = s(prot[0], prot[1], 'gt-protilehla'), L = s(pril[0], pril[1], 'gt-prilehla'), C = s('c', c, 'gt-prepona');
    (el.querySelector('.gt-pomery') as HTMLElement).innerHTML =
      radek('sin', 'protilehlá / přepona', P, C, prot[1], c) +
      radek('cos', 'přilehlá / přepona', L, C, pril[1], c) +
      radek('tg', 'protilehlá / přilehlá', P, L, prot[1], pril[1]) +
      radek('cotg', 'přilehlá / protilehlá', L, P, pril[1], prot[1]);
  }

  napojPrepinac(el, 'vrchol', (h) => { vrchol = h as 'A' | 'B'; prepocti(); });
  napojPrepinac(el, 'jedn', (h) => {
    const stupne = Number(posuvnik('uhel').value) * (jedn === 'gon' ? 0.9 : 1);
    jedn = h as Jednotka; pamet.pis('gon-jednotka', jedn);
    nastavRozsah(stupne); prepocti();
  });
  el.addEventListener('input', prepocti);
  prepocti();
}

// ---------- procvičování ----------

interface Uloha {
  zadani: string;
  obrazek?: string;
  otazka: string; // např. „d =“
  jednotka: string; // za políčkem
  vzorec: string;
  // výsledek pro danou jednotku úhlů na kalkulačce; jiná jednotka = typická chyba
  spocti: (kalk: Jednotka | 'rad') => number;
  vysledekUhel?: boolean; // výsledek je úhel v jednotkách zadání
  tol: number;
  postup: (v: number) => string[];
}

const nahodne = (od: number, do_: number, mist: number) => {
  const n = od + Math.random() * (do_ - od);
  return Math.round(n * 10 ** mist) / 10 ** mist;
};
const vyber = <T,>(pole: readonly T[]): T => pole[Math.floor(Math.random() * pole.length)];
const TROJICE = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]] as const;
const m = (n: number, mist = 2) => `${pevne(n, mist)} m`;

const sin = (v: number, k: Jednotka | 'rad') => Math.sin(v * NA_RAD[k]);
const cos = (v: number, k: Jednotka | 'rad') => Math.cos(v * NA_RAD[k]);
const tg = (v: number, k: Jednotka | 'rad') => Math.tan(v * NA_RAD[k]);

const TEMATA = {
  definice(j: Jednotka): Uloha {
    const [p, q, r] = vyber(TROJICE), k = vyber([1, 2, 0.5]);
    const [a, b, c] = Math.random() < 0.5 ? [p * k, q * k, r * k] : [q * k, p * k, r * k];
    const druh = vyber(['pomer', 'pomer', 'strana', 'uhel'] as const);
    if (druh === 'pomer') {
      const naB = Math.random() < 0.35;
      const f = vyber(['sin', 'cos', 'tg', 'cotg'] as const);
      const [prot, pril] = naB ? [['b', b], ['a', a]] as const : [['a', a], ['b', b]] as const;
      const [cit, jm] = { sin: [prot, ['c', c]], cos: [pril, ['c', c]], tg: [prot, pril], cotg: [pril, prot] }[f] as [readonly [string, number], readonly [string, number]];
      const r_ = naB ? 'β' : 'α';
      return {
        zadani: `Pravoúhlý trojúhelník, pravý úhel u C: a = ${hezky(a)}, b = ${hezky(b)}, c = ${hezky(c)}.`,
        obrazek: kresliTrojuhelnik(Math.atan2(a, b), c, { zvyrazni: naB ? 'B' : 'A', sirka: 240 }),
        otazka: `${f} ${r_} =`, jednotka: '', tol: 0.0011,
        vzorec: `${f} = ${{ sin: 'protilehlá / přepona', cos: 'přilehlá / přepona', tg: 'protilehlá / přilehlá', cotg: 'přilehlá / protilehlá' }[f]}`,
        spocti: () => cit[1] / jm[1],
        postup: (v) => [`k úhlu ${r_} je protilehlá ${prot[0]}, přilehlá ${pril[0]}`, `${f} ${r_} = ${cit[0]} / ${jm[0]} = ${hezky(cit[1])} / ${hezky(jm[1])} = <b>${pevne(v, 3)}</b>`],
      };
    }
    const al = j === 'gon' ? nahodne(15, 85, 2) : nahodne(14, 76, 1);
    const cc = nahodne(4, 20, 1);
    if (druh === 'strana') {
      const hledamA = Math.random() < 0.5;
      return {
        zadani: `Pravoúhlý trojúhelník, pravý úhel u C: přepona c = ${hezky(cc)} cm, α = ${uhel(al, j, 2)}.`,
        obrazek: kresliTrojuhelnik(al * NA_RAD[j], cc, { zvyrazni: 'A', sirka: 240 }),
        otazka: `${hledamA ? 'a' : 'b'} =`, jednotka: 'cm', tol: 0.011,
        vzorec: hledamA ? 'a je protilehlá k α: sin α = a / c' : 'b je přilehlá k α: cos α = b / c',
        spocti: (kk) => (hledamA ? cc * sin(al, kk) : cc * cos(al, kk)),
        postup: (v) => hledamA
          ? ['sin α = a / c', `a = c · sin α = ${hezky(cc)} · sin ${uhel(al, j, 2)} = <b>${pevne(v, 2)} cm</b>`]
          : ['cos α = b / c', `b = c · cos α = ${hezky(cc)} · cos ${uhel(al, j, 2)} = <b>${pevne(v, 2)} cm</b>`],
      };
    }
    return {
      zadani: `Pravoúhlý trojúhelník, pravý úhel u C: a = ${hezky(a)} cm, b = ${hezky(b)} cm. Jak velký je úhel α?`,
      obrazek: kresliTrojuhelnik(Math.atan2(a, b), c, { zvyrazni: 'A', sirka: 240, popisky: { a: 'a', b: 'b', c: '' } }),
      otazka: 'α =', jednotka: znacka(j).trim(), tol: 0.011, vysledekUhel: true,
      vzorec: 'Znáš obě odvěsny → tangens. Úhel z poměru: SHIFT tan.',
      spocti: (kk) => Math.atan(a / b) / NA_RAD[kk],
      postup: (v) => [`tg α = a / b = ${hezky(a)} / ${hezky(b)} = ${pevne(a / b, 4)}`, `α = arctg ${pevne(a / b, 4)} = <b>${uhel(v, j, 2)}</b>`],
    };
  },

  delky(j: Jednotka): Uloha {
    const s = nahodne(40, 320, 2);
    const zenit = Math.random() < 0.65;
    const odch = j === 'gon' ? nahodne(1.5, 12, 4) : nahodne(1.5, 11, 2);
    const nahoru = Math.random() < 0.5;
    const z = PRAVY[j] + (nahoru ? -odch : odch), al = PRAVY[j] - z;
    const hledamD = Math.random() < 0.5;
    const zadUhel = zenit ? `zenitový úhel z = ${uhel(z, j)}` : `výškový úhel α = ${uhel(al, j)}`;
    return {
      zadani: `Totální stanice změřila šikmou délku s = ${m(s)} a ${zadUhel}.`,
      otazka: hledamD ? 'vodorovná délka d =' : 'převýšení Δh =', jednotka: 'm', tol: 0.006,
      vzorec: zenit
        ? 'z se měří od svislice: d = s · sin z, Δh = s · cos z'
        : 'α se měří od vodorovné: d = s · cos α, Δh = s · sin α',
      spocti: (kk) => zenit ? (hledamD ? s * sin(z, kk) : s * cos(z, kk)) : (hledamD ? s * cos(al, kk) : s * sin(al, kk)),
      postup: (v) => {
        const f = zenit ? (hledamD ? 'sin z' : 'cos z') : (hledamD ? 'cos α' : 'sin α');
        const u = zenit ? z : al;
        return [
          zenit ? 'zenitový úhel je od svislice, takže s je přepona a d je protilehlá k z' : 'výškový úhel je od vodorovné, takže d je přilehlá a Δh protilehlá k α',
          `${hledamD ? 'd' : 'Δh'} = s · ${f} = ${hezky(s)} · ${f.slice(0, 3)} ${uhel(u, j)} = <b>${m(v, 3)}</b>`,
          ...(!hledamD ? [v < 0 ? 'záporné převýšení: cíl je níž než přístroj' : 'kladné převýšení: cíl je výš než přístroj'] : []),
        ];
      },
    };
  },

  vysky(j: Jednotka): Uloha {
    const d = nahodne(20, 120, 2), v = nahodne(1.45, 1.7, 2);
    const al = j === 'gon' ? nahodne(5, 40, 4) : nahodne(4, 36, 2);
    const zenit = Math.random() < 0.4;
    const z = PRAVY[j] - al;
    return {
      zadani: `Vodorovná vzdálenost od přístroje k budově d = ${m(d)}, výška přístroje v = ${m(v)}. Na vrchol budovy je ${zenit ? `zenitový úhel z = ${uhel(z, j)}` : `výškový úhel α = ${uhel(al, j)}`}.`,
      otazka: 'výška budovy h =', jednotka: 'm', tol: 0.011,
      vzorec: zenit ? 'K zenitovému úhlu je d protilehlá a výška přilehlá → cotg. h = d · cotg z + v' : 'Výška je protilehlá, d přilehlá → tg. h = d · tg α + v',
      spocti: (kk) => (zenit ? d / tg(z, kk) : d * tg(al, kk)) + v,
      postup: (h) => [
        zenit ? `převýšení nad přístrojem = d · cotg z = ${hezky(d)} / tan ${uhel(z, j)} = ${m(h - v, 3)}` : `převýšení nad přístrojem = d · tg α = ${hezky(d)} · tan ${uhel(al, j)} = ${m(h - v, 3)}`,
        `h = ${m(h - v, 3)} + ${m(v)} = <b>${m(h)}</b>`,
      ],
    };
  },

  souradnice(j: Jednotka): Uloha {
    const plny = 4 * PRAVY[j], pul = 2 * PRAVY[j];
    if (Math.random() < 0.55) {
      const s = nahodne(50, 400, 2), sg = j === 'gon' ? nahodne(0, 400, 4) : nahodne(0, 360, 2);
      const hledamY = Math.random() < 0.5;
      return {
        zadani: `Z bodu A na bod B: vodorovná délka s = ${m(s)}, směrník σ = ${uhel(sg, j)}.`,
        otazka: hledamY ? 'Δy =' : 'Δx =', jednotka: 'm', tol: 0.011,
        vzorec: 'Δy = s · sin σ, Δx = s · cos σ (znaménko vyjde samo)',
        spocti: (kk) => (hledamY ? s * sin(sg, kk) : s * cos(sg, kk)),
        postup: (v) => [`${hledamY ? 'Δy = s · sin σ' : 'Δx = s · cos σ'} = ${hezky(s)} · ${hledamY ? 'sin' : 'cos'} ${uhel(sg, j)} = <b>${m(v)}</b>`,
          `kvadrant ${Math.floor(sg / PRAVY[j]) + 1}: Δy ${sin(sg, j) >= 0 ? '+' : '−'}, Δx ${cos(sg, j) >= 0 ? '+' : '−'}`],
      };
    }
    const dy = nahodne(20, 300, 2) * vyber([1, -1]), dx = nahodne(20, 300, 2) * vyber([1, -1]);
    const hledamS = Math.random() < 0.3;
    const zadani = `Souřadnicové rozdíly z bodu A na bod B: Δy = ${m(dy)}, Δx = ${m(dx)}.`;
    if (hledamS) {
      return {
        zadani, otazka: 'délka s =', jednotka: 'm', tol: 0.011, vzorec: 'Pythagorova věta: s = √(Δx² + Δy²)',
        spocti: () => Math.hypot(dx, dy),
        postup: (v) => [`s = √(${hezky(dx)}² + ${hezky(dy)}²) = <b>${m(v)}</b>`],
      };
    }
    const kv = dy >= 0 ? (dx >= 0 ? 1 : 2) : (dx >= 0 ? 4 : 3);
    return {
      zadani, otazka: 'směrník σ =', jednotka: znacka(j).trim(), tol: j === 'gon' ? 0.0011 : 0.011, vysledekUhel: true,
      vzorec: 'ω = arctg |Δy / Δx|, pak podle kvadrantu: I σ = ω, II σ = 200 − ω, III σ = 200 + ω, IV σ = 400 − ω (gon)',
      spocti: (kk) => {
        const w = Math.atan(Math.abs(dy / dx)) / NA_RAD[kk], pl = kk === 'rad' ? 2 * Math.PI : 4 * PRAVY[kk], pu = pl / 2;
        return [w, pu - w, pu + w, pl - w][kv - 1];
      },
      postup: (v) => {
        const w = Math.atan(Math.abs(dy / dx)) / NA_RAD[j];
        const pravidlo = [`σ = ω`, `σ = ${pul} − ω`, `σ = ${pul} + ω`, `σ = ${plny} − ω`][kv - 1];
        return [`ω = arctg |${hezky(dy)} / ${hezky(dx)}| = ${uhel(w, j)}`,
          `Δy ${dy >= 0 ? '+' : '−'}, Δx ${dx >= 0 ? '+' : '−'} → ${['I', 'II', 'III', 'IV'][kv - 1]}. kvadrant: ${pravidlo}`, `σ = <b>${uhel(v, j)}</b>`];
      },
    };
  },

  podobnost(): Uloha {
    const druh = vyber(['stin', 'dalkomer', 'strany', 'svah'] as const);
    if (druh === 'stin') {
      const t = nahodne(1.5, 3, 1), st = nahodne(0.8, 4, 1), S = nahodne(10, 60, 1);
      return {
        zadani: `Tyč vysoká ${m(t, 1)} vrhá stín ${m(st, 1)}. Strom ve stejnou chvíli vrhá stín ${m(S, 1)}.`,
        otazka: 'výška stromu h =', jednotka: 'm', tol: 0.011,
        vzorec: 'Slunce svítí pod stejným úhlem → podobné trojúhelníky: h / stín stromu = tyč / stín tyče',
        spocti: () => (t * S) / st,
        postup: (v) => [`h / ${hezky(S)} = ${hezky(t)} / ${hezky(st)}`, `h = ${hezky(S)} · ${hezky(t)} / ${hezky(st)} = <b>${m(v)}</b>`],
      };
    }
    if (druh === 'dalkomer') {
      const l = nahodne(0.15, 1.6, 3);
      return {
        zadani: `Nitkovým dálkoměrem (konstanta 100) čteš na svislé lati horní rysku a dolní rysku, rozdíl je l = ${m(l, 3)}. Záměra je vodorovná.`,
        otazka: 'vzdálenost d =', jednotka: 'm', tol: 0.011,
        vzorec: 'Trojúhelník mezi ryskami v dalekohledu a trojúhelník k lati jsou podobné: d = 100 · l',
        spocti: () => 100 * l,
        postup: (v) => [`d = 100 · ${hezky(l)} = <b>${m(v, 1)}</b>`],
      };
    }
    if (druh === 'svah') {
      const d1 = vyber([5, 10, 20, 25]), h1 = nahodne(0.3, 3, 2), d2 = nahodne(12, 80, 1);
      return {
        zadani: `Rovnoměrný svah: na vodorovné vzdálenosti ${m(d1, 0)} stoupne terén o ${m(h1)}.`,
        otazka: `převýšení na ${hezky(d2)} m: Δh =`, jednotka: 'm', tol: 0.011,
        vzorec: 'Stejný sklon → podobné trojúhelníky: Δh / d = h₁ / d₁',
        spocti: () => (h1 * d2) / d1,
        postup: (v) => [`Δh / ${hezky(d2)} = ${hezky(h1)} / ${d1}`, `Δh = ${hezky(d2)} · ${hezky(h1)} / ${d1} = <b>${m(v)}</b>`],
      };
    }
    const [a, b, c] = vyber(TROJICE);
    const k = vyber([1.5, 2.5, 0.4, 3, 1.2]);
    const strany = [['a', a], ['b', b], ['c', c]] as const;
    const i = Math.floor(Math.random() * 3);
    let jj = Math.floor(Math.random() * 2); if (jj >= i) jj++;
    return {
      zadani: `Trojúhelník ABC má strany a = ${a}, b = ${b}, c = ${c} cm. Trojúhelník A'B'C' je s ním podobný a ${strany[i][0]}' = ${hezky(strany[i][1] * k)} cm.`,
      otazka: `${strany[jj][0]}' =`, jednotka: 'cm', tol: 0.011,
      vzorec: "Nejdřív koeficient podobnosti k = ${s}' / ${s}, pak každou stranu vynásob k".replace(/\$\{s\}/g, strany[i][0]),
      spocti: () => strany[jj][1] * k,
      postup: (v) => [`k = ${hezky(strany[i][1] * k)} / ${strany[i][1]} = ${hezky(k)}`, `${strany[jj][0]}' = ${hezky(k)} · ${strany[jj][1]} = <b>${hezky(v, 2)} cm</b>`],
    };
  },
};

type Tema = keyof typeof TEMATA;
const NAZVY: Record<Tema, string> = { definice: 'Definice', delky: 'Délky', vysky: 'Výšky', souradnice: 'Souřadnice', podobnost: 'Podobnost' };

export function procvicovani(el: HTMLElement) {
  let jedn: Jednotka = pamet.cti('gon-jednotka', 'gon');
  let tema: Tema | 'vse' = 'vse';
  // skóre podle témat; v režimu „vše“ dostávají častěji přednost témata s chybami
  const skore = pamet.cti<Record<string, { ok: number; chyb: number }>>('gon-skore', {});
  let dnes = { ok: 0, celkem: 0 };
  let uloha: Uloha, temaUlohy: Tema, vysledek = 0, vyreseno = false, pokusu = 0;

  el.className = 'nastroj';
  el.innerHTML = `
    <div class="gp-temata" data-prepinac="tema">
      <button type="button" data-hodnota="vse" class="aktivni">Vše</button>
      ${Object.entries(NAZVY).map(([k, n]) => `<button type="button" data-hodnota="${k}">${n}</button>`).join('')}
    </div>
    ${prepinac('Úhly v', 'jedn', [['gon', 'gon'], ['deg', '°']], jedn)}
    <div class="gp-karta">
      <div class="gp-zadani"></div>
      <form class="gp-odpoved" autocomplete="off">
        <label><span class="gp-otazka"></span>
          <span class="vstup"><input inputmode="decimal" /><b class="za gp-jednotka"></b></span></label>
        <button type="submit" class="gp-hlavni">Zkontrolovat</button>
      </form>
      <div class="gp-tlacitka">
        <button type="button" data-akce="vzorec">Nápověda</button>
        <button type="button" data-akce="postup">Postup</button>
        <button type="button" data-akce="dalsi">Další příklad</button>
      </div>
      <div class="gp-zpetna" aria-live="polite"></div>
    </div>
    <p class="gp-skore"></p>`;

  const q = <T extends HTMLElement>(s: string) => el.querySelector(s) as T;
  const vstup = q<HTMLInputElement>('.gp-odpoved input');
  const zpetna = q<HTMLElement>('.gp-zpetna');

  function vyberTema(): Tema {
    if (tema !== 'vse') return tema;
    const vahy = (Object.keys(TEMATA) as Tema[]).map((t) => {
      const s = skore[t] ?? { ok: 0, chyb: 0 };
      return [t, Math.max(1, 3 + 2 * s.chyb - s.ok * 0.5)] as const;
    });
    let r = Math.random() * vahy.reduce((a, [, w]) => a + w, 0);
    for (const [t, w] of vahy) if ((r -= w) <= 0) return t;
    return vahy[0][0];
  }

  function ukazSkore() {
    const celk = Object.values(skore).reduce((a, s) => ({ ok: a.ok + s.ok, chyb: a.chyb + s.chyb }), { ok: 0, chyb: 0 });
    const temata = (Object.keys(NAZVY) as Tema[]).filter((t) => skore[t]).map((t) => `${NAZVY[t]} ${skore[t].ok}/${skore[t].ok + skore[t].chyb}`).join(' · ');
    q<HTMLElement>('.gp-skore').textContent = `Teď ${dnes.ok}/${dnes.celkem} · celkem ${celk.ok}/${celk.ok + celk.chyb}${temata ? ` · ${temata}` : ''}`;
  }

  function nova() {
    temaUlohy = vyberTema();
    uloha = TEMATA[temaUlohy](jedn);
    vysledek = uloha.spocti(jedn);
    vyreseno = false; pokusu = 0;
    q<HTMLElement>('.gp-zadani').innerHTML = `${uloha.obrazek ? `<div class="gp-obrazek">${uloha.obrazek}</div>` : ''}<p><span class="gp-stitek">${NAZVY[temaUlohy]}</span>${uloha.zadani}</p>`;
    q<HTMLElement>('.gp-otazka').textContent = uloha.otazka;
    q<HTMLElement>('.gp-jednotka').textContent = uloha.jednotka;
    q<HTMLElement>('.gp-jednotka').hidden = !uloha.jednotka;
    q<HTMLElement>('.gp-hlavni').textContent = 'Zkontrolovat';
    q<HTMLElement>('[data-akce="dalsi"]').hidden = false;
    vstup.value = '';
    vstup.placeholder = `zaokrouhli na ${uloha.tol < 0.002 ? 3 : 2} des. místa`;
    zpetna.innerHTML = '';
    zpetna.className = 'gp-zpetna';
    vstup.focus({ preventScroll: true });
  }

  function zapis(ok: boolean) {
    const s = (skore[temaUlohy] ??= { ok: 0, chyb: 0 });
    if (ok) s.ok++; else s.chyb++;
    dnes.celkem++; if (ok) dnes.ok++;
    pamet.pis('gon-skore', skore);
    ukazSkore();
  }

  const postupHtml = () => `<ol>${uloha.postup(vysledek).map((r) => `<li>${r}</li>`).join('')}</ol>`;

  function zkontroluj() {
    if (vyreseno) { nova(); return; }
    const x = nacti(vstup.value);
    if (!Number.isFinite(x)) { zpetna.className = 'gp-zpetna'; zpetna.textContent = 'Napiš číslo (desetinná čárka i tečka jdou).'; return; }
    pokusu++;
    const ok = Math.abs(x - vysledek) <= uloha.tol * Math.max(1, Math.abs(vysledek) / 100);
    if (ok) {
      vyreseno = true;
      if (pokusu === 1) zapis(true);
      zpetna.className = 'gp-zpetna gp-dobre';
      zpetna.innerHTML = `<p>Správně.</p>${postupHtml()}`;
      q<HTMLElement>('.gp-hlavni').textContent = 'Další příklad';
      q<HTMLElement>('[data-akce="dalsi"]').hidden = true;
      return;
    }
    if (pokusu === 1) zapis(false);
    // typická chyba: kalkulačka v jiném režimu úhlů
    const jine = (['gon', 'deg', 'rad'] as const).filter((k) => k !== jedn);
    const rezim = jine.find((k) => {
      const alt = uloha.vysledekUhel ? vysledek * (NA_RAD[jedn] / NA_RAD[k]) : uloha.spocti(k);
      return Math.abs(x - alt) <= uloha.tol * Math.max(1, Math.abs(alt) / 100);
    });
    const nazevRezimu = { gon: 'GRAD (gony)', deg: 'DEG (stupně)', rad: 'RAD (radiány)' };
    zpetna.className = 'gp-zpetna gp-spatne';
    zpetna.innerHTML = rezim
      ? `<p>Kalkulačka je v režimu ${nazevRezimu[rezim]}. Přepni ji na ${nazevRezimu[jedn]} a spočítej znovu.</p>`
      : Math.abs(x + vysledek) <= uloha.tol * Math.max(1, Math.abs(vysledek) / 100)
        ? '<p>Číslo sedí, ale znaménko ne.</p>'
        : `<p>Ještě ne. Zkus nápovědu${pokusu > 1 ? ' nebo postup' : ''}.</p>`;
  }

  q<HTMLFormElement>('.gp-odpoved').addEventListener('submit', (e) => { e.preventDefault(); zkontroluj(); });
  q<HTMLElement>('.gp-tlacitka').addEventListener('click', (e) => {
    const akce = (e.target as HTMLElement).closest('button')?.dataset.akce;
    if (akce === 'dalsi') nova();
    else if (akce === 'vzorec') { zpetna.className = 'gp-zpetna'; zpetna.innerHTML = `<p>${uloha.vzorec}</p>`; }
    else if (akce === 'postup') {
      if (!vyreseno && pokusu === 0) zapis(false);
      vyreseno = true;
      zpetna.className = 'gp-zpetna';
      zpetna.innerHTML = postupHtml();
      q<HTMLElement>('.gp-hlavni').textContent = 'Další příklad';
      q<HTMLElement>('[data-akce="dalsi"]').hidden = true;
    }
  });
  const temata = q<HTMLElement>('[data-prepinac="tema"]');
  temata.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    temata.querySelectorAll('button').forEach((x) => x.classList.toggle('aktivni', x === b));
    tema = b.dataset.hodnota as Tema | 'vse';
    nova();
  });
  napojPrepinac(el, 'jedn', (h) => { jedn = h as Jednotka; pamet.pis('gon-jednotka', jedn); nova(); });
  ukazSkore();
  nova();
}
