// Interaktivní nástroje vložené do poznámek přes <div data-nastroj="…"></div>.

import { trojuhelnik, procvicovani, prevodUhlu } from './goniometrie';

const JEDNOTKY: Record<string, number> = { mm: 0.1, cm: 1, m: 100, km: 100_000 }; // v centimetrech

const cislo = (s: string) => {
  const n = Number(s.replace(/\s| /g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : NaN;
};
const hezky = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString('cs-CZ', { maximumSignificantDigits: 10, maximumFractionDigits: 6 }) : '';

function moznosti(vybrana: string, jednotky: string[]) {
  return jednotky.map((j) => `<option${j === vybrana ? ' selected' : ''}>${j}</option>`).join('');
}

interface Trojclenka {
  nahore: [number, number]; // [na mapě, ve skutečnosti] v cm
  dole: [number | null, number | null]; // null = x
  x: number;
  prevod: string;
}

const prevody = (cm: number, jednotky: string[]) =>
  jednotky.map((j) => `= ${hezky(cm / JEDNOTKY[j])} ${j}`).join(' ');

// Dvě řádky trojčlenky, šipka křížem ukazuje, co se násobí; oranžová hodnota je dělitel.
function kresli({ nahore, dole, x, prevod }: Trojclenka) {
  const xVlevo = dole[0] === null;
  const nasobenec = xVlevo ? dole[1]! : dole[0]!; // známé číslo v dolním řádku
  const nasobitel = xVlevo ? nahore[0] : nahore[1]; // hodnota šikmo nahoře
  const delitel = xVlevo ? nahore[1] : nahore[0]; // hodnota rovně nad nasobencem
  const bunka = (v: number | null, druh: string) =>
    v === null ? '<span class="tc-x">x</span>' : `<span class="tc-${druh}">${hezky(v)} cm</span>`;
  const [l1, p1] = xVlevo ? ['nasob', 'del'] : ['del', 'nasob'];
  return `
    <div class="tc-mrizka ${xVlevo ? 'x-vlevo' : 'x-vpravo'}">
      <span class="tc-hlava">na mapě</span><span></span><span class="tc-hlava">ve skutečnosti</span>
      ${bunka(nahore[0], l1)}<span class="tc-tecky">…</span>${bunka(nahore[1], p1)}
      ${bunka(dole[0], 'nasob')}<span class="tc-tecky">…</span>${bunka(dole[1], 'nasob')}
      <svg class="tc-sipka" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="20" y1="76" x2="80" y2="26" /></svg>
    </div>
    <p class="tc-vzorec">x = <span class="tc-nasob">${hezky(nasobenec)}</span> · <span class="tc-nasob">${hezky(nasobitel)}</span> / <span class="tc-del">${hezky(delitel)}</span> = <strong>${hezky(x)} cm</strong> <span class="tc-prevod">${prevod}</span></p>`;
}

function meritko(el: HTMLElement) {
  el.className = 'nastroj';
  el.innerHTML = `
    <div class="nastroj-rezim" role="radiogroup" aria-label="Co počítám">
      <span class="nastroj-rezim-popis">Počítám</span>
      <button type="button" data-rezim="skutecnost" class="aktivni">Skutečnost</button>
      <button type="button" data-rezim="mapa">Na mapě</button>
      <button type="button" data-rezim="meritko">Měřítko</button>
    </div>
    <div class="nastroj-pole">
      <label data-pole="meritko"><span>Měřítko</span>
        <span class="vstup"><b>1 :</b><input inputmode="decimal" value="125 000" /></span></label>
      <label data-pole="mapa"><span>Na mapě</span>
        <span class="vstup"><input inputmode="decimal" value="5" /><select>${moznosti('cm', ['mm', 'cm', 'm'])}</select></span></label>
      <label data-pole="skutecnost"><span>Ve skutečnosti</span>
        <span class="vstup"><input inputmode="decimal" /><select>${moznosti('km', ['mm', 'cm', 'm', 'km'])}</select></span></label>
    </div>
    <div class="trojclenka" aria-live="polite"></div>`;

  let rezim = 'skutecnost';
  const pole = (n: string) => el.querySelector(`[data-pole="${n}"]`) as HTMLElement;
  const vstup = (n: string) => pole(n).querySelector('input') as HTMLInputElement;
  const jednotka = (n: string) => (pole(n).querySelector('select') as HTMLSelectElement | null)?.value ?? 'cm';
  const trojclenka = el.querySelector('.trojclenka') as HTMLElement;

  function prepocti() {
    const M = cislo(vstup('meritko').value);
    const mapa = cislo(vstup('mapa').value);
    const skut = cislo(vstup('skutecnost').value);
    const mapaCm = mapa * JEDNOTKY[jednotka('mapa')];
    const skutCm = skut * JEDNOTKY[jednotka('skutecnost')];

    // Trojčlenka vždy v centimetrech: horní řádek známý, dolní s neznámou x.
    let t: Trojclenka | null = null;
    if (rezim === 'skutecnost') {
      const x = mapaCm * M;
      vstup('skutecnost').value = hezky(x / JEDNOTKY[jednotka('skutecnost')]);
      t = { nahore: [1, M], dole: [mapaCm, null], x, prevod: prevody(x, ['m', 'km']) };
    } else if (rezim === 'mapa') {
      const x = skutCm / M;
      vstup('mapa').value = hezky(x / JEDNOTKY[jednotka('mapa')]);
      t = { nahore: [1, M], dole: [null, skutCm], x, prevod: prevody(x, ['mm']) };
    } else {
      const x = skutCm / mapaCm;
      vstup('meritko').value = hezky(Math.round(x * 1000) / 1000);
      t = { nahore: [mapaCm, skutCm], dole: [1, null], x, prevod: `→ měřítko 1 : ${hezky(Math.round(x))}` };
    }
    trojclenka.innerHTML = Number.isFinite(t.x) ? kresli(t) : '<p class="trojclenka-chyba">Zadej kladná čísla.</p>';
  }

  function nastavRezim(r: string) {
    rezim = r;
    el.querySelectorAll<HTMLButtonElement>('[data-rezim]').forEach((b) => b.classList.toggle('aktivni', b.dataset.rezim === r));
    ['meritko', 'mapa', 'skutecnost'].forEach((n) => {
      pole(n).classList.toggle('vysledek', n === r);
      vstup(n).readOnly = n === r;
      vstup(n).tabIndex = n === r ? -1 : 0;
    });
    prepocti();
  }

  el.querySelectorAll<HTMLButtonElement>('[data-rezim]').forEach((b) => b.addEventListener('click', () => nastavRezim(b.dataset.rezim!)));
  el.addEventListener('input', prepocti);
  el.addEventListener('change', prepocti);
  nastavRezim('skutecnost');
}

// Grafické měřítko: první polovina rozdělená na dílky, druhá polovina jeden úsek, nula na začátku.
// Návrhy dílku: kulatá čísla, která na mapě vyjdou zhruba 0,8 až 2,5 cm.
const KULATA = [1, 1.5, 2, 2.5, 3, 4, 5];
function navrhyDilku(naCm: number) {
  const rad = 10 ** Math.floor(Math.log10(naCm));
  const navrhy: { m: number; cm: number; skore: number }[] = [];
  for (const r of [rad / 10, rad, rad * 10]) for (const k of KULATA) {
    const m = Math.round(k * r * 1e6) / 1e6, cm = m / naCm;
    if (cm < 0.8 || cm > 2.5) continue;
    // nejradši kolem 1,4 cm, a když vyjde celý centimetr, tím líp
    navrhy.push({ m, cm, skore: Math.abs(Math.log(cm / 1.4)) - (Math.abs(cm - Math.round(cm)) < 1e-9 ? 0.3 : 0) });
  }
  return navrhy;
}
const sJednotkou = (m: number, km: boolean) => (km ? `${hezky(m / 1000)} km` : `${hezky(m)} m`);

const kolem = (n: number, mist = 3) => hezky(Math.round(n * 10 ** mist) / 10 ** mist);

function graficke(el: HTMLElement) {
  el.className = 'nastroj';
  el.innerHTML = `
    <div class="nastroj-pole">
      <label data-pole="meritko"><span>Měřítko</span>
        <span class="vstup"><b>1 :</b><input inputmode="decimal" value="10 000" /></span></label>
      <label data-pole="dilek"><span>Dílek ve skutečnosti</span>
        <span class="vstup"><input inputmode="decimal" placeholder="automaticky" /><select>${moznosti('m', ['m', 'km'])}</select></span></label>
      <label data-pole="dilky"><span>Dílků v 1. polovině</span>
        <span class="vstup"><input inputmode="numeric" value="5" /></span></label>
    </div>
    <div class="gm-navrhy"></div>
    <div class="gm-vystup" aria-live="polite"></div>`;

  const navrhyEl = el.querySelector('.gm-navrhy') as HTMLElement;
  const pole = (n: string) => el.querySelector(`[data-pole="${n}"]`) as HTMLElement;
  const vstup = (n: string) => pole(n).querySelector('input') as HTMLInputElement;
  const vystup = el.querySelector('.gm-vystup') as HTMLElement;

  function prepocti() {
    const M = cislo(vstup('meritko').value);
    const d = Math.round(cislo(vstup('dilky').value));
    const zadany = vstup('dilek').value.trim() === '' ? null : cislo(vstup('dilek').value) * JEDNOTKY[(pole('dilek').querySelector('select') as HTMLSelectElement).value] / 100;
    if (!(M && d >= 1 && d <= 20) || Number.isNaN(zadany)) { vystup.innerHTML = '<p class="trojclenka-chyba">Zadej kladná čísla (dílků 1 až 20).</p>'; return; }

    const naCm = M / 100; // kolik metrů je 1 cm na mapě
    const navrhy = navrhyDilku(naCm);
    const doporuceny = navrhy.reduce((a, b) => (b.skore < a.skore ? b : a), navrhy[0]).m;
    const dilek = zadany ?? doporuceny;
    const dilekCm = dilek / naCm;
    const pul = dilek * d, pulCm = dilekCm * d;
    const celkem = 2 * pul, delka = 2 * pulCm;
    const km = dilek >= 1000 || (celkem >= 1000 && dilek % 1000 === 0);
    const j = (m: number) => sJednotkou(m, km);

    // SVG v milimetrech, na šířku stránky
    const W = delka * 10, H = 3, okraj = 8;
    const x = (cm: number) => okraj + cm * 10;
    let pruh = '', popisky = '';
    for (let i = 0; i < d; i++) {
      pruh += `<rect x="${x(i * dilekCm)}" y="6" width="${dilekCm * 10}" height="${H}" class="${i % 2 ? 'gm-bila' : 'gm-cerna'}" />`;
    }
    pruh += `<rect x="${x(pulCm)}" y="6" width="${pulCm * 10}" height="${H}" class="${(d - 1) % 2 ? 'gm-cerna' : 'gm-bila'}" />`; // opačná barva než poslední dílek
    for (let i = 0; i <= d; i++) popisky += `<text x="${x(i * dilekCm)}" y="4.4">${hezky(km ? (i * dilek) / 1000 : i * dilek)}</text>`;
    popisky += `<text x="${x(delka)}" y="4.4">${hezky(km ? celkem / 1000 : celkem)}</text><text class="gm-jedn" x="${x(delka) + 1.5}" y="8.9">${km ? 'km' : 'm'}</text>`;
    const svg = `<svg class="gm-svg" viewBox="0 0 ${W + 2 * okraj + 6} 11" style="width:min(calc(${delka}cm + ${(2 * okraj + 6) / 10}cm), 100%)" role="img" aria-label="Grafické měřítko 0 až ${j(celkem)}">${pruh}<rect x="${x(0)}" y="6" width="${W}" height="${H}" class="gm-obrys" />${popisky}</svg>`;

    // přepisuj jen při změně, jinak by „change“ při kliknutí vyměnil tlačítko pod myší a klik by se ztratil
    const navrhyHtml = `<span>Návrhy dílku</span>` + navrhy.map((n) => {
      const vKm = n.m >= 1000;
      return `<button type="button" data-m="${n.m}" class="${Math.abs(n.m - dilek) < 1e-9 ? 'aktivni' : ''}">${hezky(vKm ? n.m / 1000 : n.m)} ${vKm ? 'km' : 'm'} <small>${kolem(n.cm, 2)} cm</small></button>`;
    }).join('');
    if (navrhyEl.innerHTML !== navrhyHtml) navrhyEl.innerHTML = navrhyHtml;
    const dilku = d === 1 ? 'dílek' : d < 5 ? 'dílky' : 'dílků';
    const volba = zadany !== null
      ? `dílek volím <b>${j(dilek)}</b>`
      : `dílek volím rozumné kulaté číslo blízko 1 cm (${j(naCm)}): <b>${j(dilek)}</b>`;
    const mm = Math.round(dilekCm * 100) / 10;
    const varovani = delka > 25 ? '<p class="gm-varovani">Měřítko je moc dlouhé, zvol menší dílek nebo méně dílků.</p>'
      : delka < 3 ? '<p class="gm-varovani">Měřítko je moc krátké, zvol větší dílek.</p>' : '';
    vystup.innerHTML = `
      ${delka > 25 ? '' : `<div class="gm-kresba">${svg}</div>`}${varovani}
      <ol class="gm-postup">
        <li>1 cm na mapě = ${hezky(M)} cm = <b>${j(naCm)}</b> ve skutečnosti</li>
        <li>${volba}</li>
        <li>dílek na mapě: ${hezky(dilek)} m / ${hezky(naCm)} m = <b>${kolem(dilekCm)} cm</b>${Math.abs(dilekCm * 10 - mm) > 1e-9 ? ` ≈ ${hezky(mm)} mm` : ''}</li>
        <li>1. polovina: ${d} ${dilku} × ${kolem(dilekCm)} cm = ${kolem(pulCm)} cm = ${j(pul)}</li>
        <li>2. polovina: jeden úsek ${kolem(pulCm)} cm = ${j(pul)}</li>
        <li>celkem <b>${kolem(delka)} cm = ${j(celkem)}</b></li>
      </ol>`;
  }
  navrhyEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const m = Number(b.dataset.m), vKm = m >= 1000;
    vstup('dilek').value = hezky(vKm ? m / 1000 : m);
    (pole('dilek').querySelector('select') as HTMLSelectElement).value = vKm ? 'km' : 'm';
    prepocti();
  });
  // nové měřítko = nové návrhy, ručně zvolený dílek k němu už nepatří
  vstup('meritko').addEventListener('input', () => { vstup('dilek').value = ''; });
  el.addEventListener('input', prepocti);
  el.addEventListener('change', prepocti);
  prepocti();
}

const NASTROJE: Record<string, (el: HTMLElement) => void> = { meritko, graficke, trojuhelnik, procvicovani, uhly: prevodUhlu };

document.querySelectorAll<HTMLElement>('[data-nastroj]').forEach((el) => NASTROJE[el.dataset.nastroj!]?.(el));
