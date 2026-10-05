// Interaktivní nástroje vložené do poznámek přes <div data-nastroj="…"></div>.

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
    });
    prepocti();
  }

  el.querySelectorAll<HTMLButtonElement>('[data-rezim]').forEach((b) => b.addEventListener('click', () => nastavRezim(b.dataset.rezim!)));
  el.addEventListener('input', prepocti);
  el.addEventListener('change', prepocti);
  nastavRezim('skutecnost');
}

const NASTROJE: Record<string, (el: HTMLElement) => void> = { meritko };

document.querySelectorAll<HTMLElement>('[data-nastroj]').forEach((el) => NASTROJE[el.dataset.nastroj!]?.(el));
