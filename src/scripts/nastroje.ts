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

function meritko(el: HTMLElement) {
  el.className = 'nastroj';
  el.innerHTML = `
    <div class="nastroj-rezim" role="radiogroup" aria-label="Co počítám">
      <button type="button" data-rezim="skutecnost" class="aktivni">Skutečnost</button>
      <button type="button" data-rezim="mapa">Na mapě</button>
      <button type="button" data-rezim="meritko">Měřítko</button>
    </div>
    <div class="nastroj-pole">
      <label data-pole="meritko"><span>Měřítko</span>
        <span class="vstup"><b>1 :</b><input inputmode="decimal" value="150 000" /></span></label>
      <label data-pole="mapa"><span>Na mapě</span>
        <span class="vstup"><input inputmode="decimal" value="1" /><select>${moznosti('cm', ['mm', 'cm', 'm'])}</select></span></label>
      <label data-pole="skutecnost"><span>Ve skutečnosti</span>
        <span class="vstup"><input inputmode="decimal" /><select>${moznosti('km', ['mm', 'cm', 'm', 'km'])}</select></span></label>
    </div>
    <p class="nastroj-vypocet" aria-live="polite"></p>`;

  let rezim = 'skutecnost';
  const pole = (n: string) => el.querySelector(`[data-pole="${n}"]`) as HTMLElement;
  const vstup = (n: string) => pole(n).querySelector('input') as HTMLInputElement;
  const jednotka = (n: string) => (pole(n).querySelector('select') as HTMLSelectElement | null)?.value ?? 'cm';
  const vypocet = el.querySelector('.nastroj-vypocet') as HTMLElement;

  function prepocti() {
    const M = cislo(vstup('meritko').value);
    const mapaCm = cislo(vstup('mapa').value) * JEDNOTKY[jednotka('mapa')];
    const skutCm = cislo(vstup('skutecnost').value) * JEDNOTKY[jednotka('skutecnost')];
    let text = '';

    if (rezim === 'skutecnost') {
      const v = (mapaCm * M) / JEDNOTKY[jednotka('skutecnost')];
      vstup('skutecnost').value = hezky(v);
      if (Number.isFinite(v)) text = `${hezky(mapaCm)} cm × ${hezky(M)} = ${hezky(mapaCm * M)} cm = ${hezky(v)} ${jednotka('skutecnost')}`;
    } else if (rezim === 'mapa') {
      const v = skutCm / M / JEDNOTKY[jednotka('mapa')];
      vstup('mapa').value = hezky(v);
      if (Number.isFinite(v)) text = `${hezky(skutCm)} cm ÷ ${hezky(M)} = ${hezky(skutCm / M)} cm = ${hezky(v)} ${jednotka('mapa')}`;
    } else {
      const v = skutCm / mapaCm;
      vstup('meritko').value = hezky(Math.round(v * 1000) / 1000);
      if (Number.isFinite(v)) text = `${hezky(skutCm)} cm ÷ ${hezky(mapaCm)} cm = ${hezky(v)} → 1 : ${hezky(Math.round(v))}`;
    }
    vypocet.textContent = text || 'Zadej kladná čísla.';
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
