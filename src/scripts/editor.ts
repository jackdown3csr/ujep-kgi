import { marked } from 'marked';
import DOMPurify from 'dompurify';
import renderMathInElement from 'katex/contrib/auto-render';

interface Konfigurace {
  vlastnik: string;
  repozitar: string;
  vetev: string;
  base: string;
  sablony: Record<'prednaska' | 'cviceni', string>;
}

const K: Konfigurace = JSON.parse(document.getElementById('konfigurace')!.textContent!);
const API = `https://api.github.com/repos/${K.vlastnik}/${K.repozitar}`;
const RAW = `https://raw.githubusercontent.com/${K.vlastnik}/${K.repozitar}/${K.vetev}`;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const textarea = $<HTMLTextAreaElement>('text');
const nahled = $('nahled');
const stav = $('stav');
const ulozit = $<HTMLButtonElement>('ulozit');
const smazat = $<HTMLButtonElement>('smazat');

let klic = nacti('gh-token');
let cesta = ''; // docs/semestry/01-semestr/geoinformatika-1/01-prednaska.md
let sha: string | undefined; // verze souboru na GitHubu, undefined = nový soubor
let ulozeno = '';
let hlavicka = ''; // --- datum: … --- se v editoru neukazuje, při uložení se vrátí zpět

const HLAVICKA = /^---\n[\s\S]*?\n---\n+/;
function rozdel(text: string) {
  hlavicka = text.match(HLAVICKA)?.[0].replace(/\n+$/, '\n\n') ?? '';
  return text.replace(HLAVICKA, '');
}

// ---------- pomocné ----------

function nacti(k: string) {
  try { return localStorage.getItem(k) ?? ''; } catch { return ''; }
}
function uloz(k: string, v: string | null) {
  try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {}
}

async function gh(cesta: string, init: RequestInit = {}) {
  const r = await fetch(`${API}${cesta}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${klic}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!r.ok) {
    const zprava = await r.json().catch(() => ({}));
    throw Object.assign(new Error(zprava.message || r.statusText), { status: r.status });
  }
  return r.status === 204 ? null : r.json();
}

const naBase64 = (bajty: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bajty.length; i += 0x8000) s += String.fromCharCode(...bajty.subarray(i, i + 0x8000));
  return btoa(s);
};
const zBase64 = (b64: string) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

const adresaStranky = (soubor: string) => {
  const id = soubor.replace(/^docs\//, '').replace(/\.md$/, '').replace(/(^|\/)index$/, '');
  return K.base + (id ? id + '/' : '');
};
const slozkaSouboru = () => cesta.slice(0, cesta.lastIndexOf('/'));

function hlaseni(text: string, druh: 'ok' | 'chyba' | '' = '') {
  stav.textContent = text;
  stav.dataset.druh = druh;
}

// ---------- přihlášení ----------

async function overKlic(k: string) {
  const r = await fetch(API, { headers: { Authorization: `Bearer ${k}`, Accept: 'application/vnd.github+json' } });
  if (!r.ok) return 'Klíč nefunguje, nebo nemá přístup k repozitáři.';
  const repo = await r.json();
  if (!repo.permissions?.push) return 'Klíč má jen čtení. U Contents nastav Read and write.';
  return '';
}

$('prihlaseni-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const k = $<HTMLInputElement>('klic').value.trim();
  const chyba = $('prihlaseni-chyba');
  chyba.hidden = true;
  const problem = await overKlic(k).catch(() => 'Nepodařilo se spojit s GitHubem.');
  if (problem) {
    chyba.textContent = problem;
    chyba.hidden = false;
    return;
  }
  klic = k;
  uloz('gh-token', k);
  document.documentElement.dataset.upravy = '';
  const p = new URLSearchParams(location.search);
  if (p.has('soubor') || p.has('novy')) start();
  else location.href = K.base;
});

// ---------- načtení / nová poznámka ----------

async function start() {
  const p = new URLSearchParams(location.search);
  if (!klic || p.has('prihlasit') && !p.has('soubor') && !p.has('novy')) {
    $('prihlaseni').hidden = false;
    $('pracovni').hidden = true;
    return;
  }
  $('prihlaseni').hidden = true;
  $('pracovni').hidden = false;

  try {
    if (p.get('soubor')) {
      cesta = p.get('soubor')!;
      hlaseni('Načítám…');
      const f = await gh(`/contents/${encodeURI(cesta)}?ref=${K.vetev}`);
      sha = f.sha;
      ulozeno = rozdel(zBase64(f.content));
      textarea.value = ulozeno;
      smazat.hidden = false;
      hlaseni('');
    } else {
      await novaPoznamka(p.get('novy') as 'prednaska' | 'cviceni', p.get('slozka')!);
    }
  } catch (e: any) {
    if (e.status === 401) return odhlasitSChybou();
    hlaseni(`Nepodařilo se načíst: ${e.message}`, 'chyba');
    return;
  }

  $('cesta').textContent = cesta.replace(/^docs\//, '');
  $<HTMLAnchorElement>('zpet').href = sha ? adresaStranky(cesta) : adresaStranky(slozkaSouboru() + '/index.md');

  // rozepsaný koncept z minula
  const koncept = nacti(`koncept:${cesta}`);
  if (koncept && koncept !== textarea.value && confirm('Máš tu neuložený koncept z minula. Obnovit ho?')) {
    textarea.value = koncept;
  }
  prekresli();
  textarea.focus();
  if (!sha) {
    const konecNadpisu = textarea.value.indexOf('\n', textarea.value.indexOf('# '));
    textarea.setSelectionRange(konecNadpisu, konecNadpisu);
  }
}

async function novaPoznamka(druh: 'prednaska' | 'cviceni', slozka: string) {
  const soubory: { name: string }[] = await gh(`/contents/${encodeURI(slozka)}?ref=${K.vetev}`);
  const cisla = soubory.map((f) => f.name.match(new RegExp(`^(\\d+)-${druh}\\.md$`))?.[1]).filter(Boolean).map(Number);
  const cislo = Math.max(0, ...cisla) + 1;
  cesta = `${slozka}/${String(cislo).padStart(2, '0')}-${druh}.md`;
  sha = undefined;
  ulozeno = '';
  textarea.value = rozdel(
    K.sablony[druh]
      .replace('{{ datum }}', new Date().toLocaleDateString('sv'))
      .replace('{{ č. }}', String(cislo))
      .replace(': {{ téma }}', ': '),
  );
}

function odhlasitSChybou() {
  uloz('gh-token', null);
  klic = '';
  delete document.documentElement.dataset.upravy;
  $('prihlaseni').hidden = false;
  $('pracovni').hidden = true;
  const chyba = $('prihlaseni-chyba');
  chyba.textContent = 'Přihlášení vypršelo nebo klíč přestal platit. Vlož nový.';
  chyba.hidden = false;
}

// ---------- náhled ----------

marked.use({ gfm: true, breaks: false });

function prekresli() {
  const text = textarea.value;
  nahled.innerHTML = DOMPurify.sanitize(marked.parse(text) as string);

  // rámečky > [!TIP] Nadpis
  nahled.querySelectorAll('blockquote').forEach((bq) => {
    const p = bq.querySelector('p');
    const m = p?.innerHTML.match(/^\[!(\w+)\][ \t]*([^\n<]*)(?:\n|<br>)?/);
    if (!p || !m) return;
    const druh = m[1].toUpperCase() === 'INFO' ? 'NOTE' : m[1].toUpperCase();
    const aside = document.createElement('aside');
    aside.className = `ramecek ramecek-${druh.toLowerCase()}`;
    const nadpis = document.createElement('p');
    nadpis.className = 'ramecek-nadpis';
    nadpis.textContent = m[2] || { NOTE: 'Poznámka', TIP: 'Tip', IMPORTANT: 'Důležité', WARNING: 'Pozor', CAUTION: 'Varování' }[druh] || druh;
    p.innerHTML = p.innerHTML.slice(m[0].length).trim();
    if (!p.innerHTML) p.remove();
    aside.append(nadpis, ...bq.childNodes);
    bq.replaceWith(aside);
  });

  // relativní obrázky (obrazky/x.png) ukazujeme z GitHubu
  nahled.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? '';
    if (!/^([a-z]+:|\/|data:)/i.test(src)) img.src = `${RAW}/${slozkaSouboru()}/${src}`;
  });
  nahled.querySelectorAll('a').forEach((a) => a.setAttribute('target', '_blank'));

  renderMathInElement(nahled, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
  });
}

let casovac: number | undefined;
textarea.addEventListener('input', () => {
  clearTimeout(casovac);
  casovac = window.setTimeout(() => {
    prekresli();
    if (cesta) uloz(`koncept:${cesta}`, textarea.value === ulozeno ? null : textarea.value);
  }, 150);
  if (stav.dataset.druh === 'ok') hlaseni('');
});

// ---------- formátování ----------

function obal(pred: string, po = pred, vychozi = 'text') {
  const { selectionStart: a, selectionEnd: b, value } = textarea;
  const vybrane = value.slice(a, b) || vychozi;
  textarea.setRangeText(pred + vybrane + po, a, b, 'end');
  textarea.setSelectionRange(a + pred.length, a + pred.length + vybrane.length);
  textarea.focus();
  textarea.dispatchEvent(new Event('input'));
}

function radek(prefix: string, vychozi = '') {
  const { selectionStart: a, selectionEnd: b, value } = textarea;
  const zacatek = value.lastIndexOf('\n', a - 1) + 1;
  const konec = value.indexOf('\n', b) === -1 ? value.length : value.indexOf('\n', b);
  const radky = value.slice(zacatek, konec).split('\n').map((r) => prefix + (r || vychozi));
  textarea.setRangeText(radky.join('\n'), zacatek, konec, 'end');
  textarea.focus();
  textarea.dispatchEvent(new Event('input'));
}

function blok(text: string) {
  const { selectionStart: a, value } = textarea;
  const predtim = value.slice(0, a);
  const pred = !predtim || predtim.endsWith('\n\n') ? '' : predtim.endsWith('\n') ? '\n' : '\n\n';
  textarea.setRangeText(pred + text, a, textarea.selectionEnd, 'end');
  textarea.focus();
  textarea.dispatchEvent(new Event('input'));
}

const akce: Record<string, () => void> = {
  nadpis: () => radek('## ', 'Nadpis'),
  tucne: () => obal('**'),
  kurziva: () => obal('*'),
  odrazky: () => radek('- '),
  ukol: () => radek('- [ ] '),
  odkaz: () => obal('[', '](https://)', 'text odkazu'),
  ramecek: () => blok('> [!TIP] Nadpis\n> Text rámečku\n'),
  vzorec: () => obal('$', '$', 'E = mc^2'),
  tabulka: () => blok('| Sloupec | Sloupec |\n|---|---|\n| | |\n'),
};
document.querySelectorAll<HTMLButtonElement>('[data-vlozit]').forEach((b) =>
  b.addEventListener('click', () => akce[b.dataset.vlozit!]()),
);

textarea.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.key === 'b') { e.preventDefault(); akce.tucne(); }
  if (e.key === 'i') { e.preventDefault(); akce.kurziva(); }
});

// přepínání psaní / náhledu na mobilu
document.querySelectorAll<HTMLButtonElement>('[data-pohled]').forEach((b) =>
  b.addEventListener('click', () => {
    (document.querySelector('.editor-plocha') as HTMLElement).dataset.pohled = b.dataset.pohled!;
    document.querySelectorAll('[data-pohled]').forEach((x) => x.classList.toggle('aktivni', x === b));
  }),
);

// ---------- obrázky ----------

async function nahrajObrazek(soubor: File) {
  if (!cesta) return;
  const pripona = (soubor.name.split('.').pop() || soubor.type.split('/')[1] || 'png').toLowerCase();
  const zaklad = soubor.name && soubor.name !== 'image.png'
    ? soubor.name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^\w-]+/g, '-').toLowerCase().slice(0, 40)
    : 'obrazek';
  const jmeno = `${zaklad}-${Date.now().toString(36)}.${pripona}`;
  const cil = `${slozkaSouboru()}/obrazky/${jmeno}`;
  hlaseni('Nahrávám obrázek…');
  try {
    const data = naBase64(new Uint8Array(await soubor.arrayBuffer()));
    await gh(`/contents/${encodeURI(cil)}`, {
      method: 'PUT',
      body: JSON.stringify({ message: `Obrázek k ${cesta.split('/').pop()}`, content: data, branch: K.vetev }),
    });
    blok(`![](obrazky/${jmeno})\n`);
    hlaseni('Obrázek nahraný', 'ok');
  } catch (e: any) {
    hlaseni(`Obrázek se nepodařilo nahrát: ${e.message}`, 'chyba');
  }
}

$<HTMLInputElement>('obrazek').addEventListener('change', (e) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) nahrajObrazek(f);
  (e.target as HTMLInputElement).value = '';
});
textarea.addEventListener('paste', (e) => {
  const f = [...(e.clipboardData?.files ?? [])].find((x) => x.type.startsWith('image/'));
  if (f) { e.preventDefault(); nahrajObrazek(f); }
});
textarea.addEventListener('drop', (e) => {
  const f = [...(e.dataTransfer?.files ?? [])].find((x) => x.type.startsWith('image/'));
  if (f) { e.preventDefault(); nahrajObrazek(f); }
});

// ---------- uložení a smazání ----------

async function uloz_() {
  if (!cesta || ulozit.disabled) return;
  const telo = textarea.value.endsWith('\n') ? textarea.value : textarea.value + '\n';
  const text = hlavicka + telo;
  const nadpis = text.match(/^#\s+(.+)$/m)?.[1] ?? cesta.split('/').pop();
  ulozit.disabled = true;
  hlaseni('Ukládám…');
  try {
    const r = await gh(`/contents/${encodeURI(cesta)}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `${sha ? 'Úprava' : 'Nová poznámka'}: ${nadpis}`,
        content: naBase64(new TextEncoder().encode(text)),
        branch: K.vetev,
        ...(sha ? { sha } : {}),
      }),
    });
    const novy = !sha;
    sha = r.content.sha;
    ulozeno = textarea.value;
    uloz(`koncept:${cesta}`, null);
    smazat.hidden = false;
    $<HTMLAnchorElement>('zpet').href = adresaStranky(cesta);
    hlaseni('Uloženo. Na webu se objeví zhruba do minuty.', 'ok');
    if (novy) history.replaceState(null, '', `?soubor=${encodeURIComponent(cesta)}`);
  } catch (e: any) {
    if (e.status === 401) return odhlasitSChybou();
    hlaseni(
      e.status === 409 || e.status === 422
        ? 'Soubor mezitím změnil někdo jiný. Zkopíruj si text a načti stránku znovu.'
        : `Uložení selhalo: ${e.message}`,
      'chyba',
    );
  } finally {
    ulozit.disabled = false;
  }
}

ulozit.addEventListener('click', uloz_);
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); uloz_(); }
});

smazat.addEventListener('click', async () => {
  if (!sha || !confirm('Opravdu smazat tuhle poznámku? (V historii na GitHubu zůstane.)')) return;
  hlaseni('Mažu…');
  try {
    await gh(`/contents/${encodeURI(cesta)}`, {
      method: 'DELETE',
      body: JSON.stringify({ message: `Smazání: ${cesta.split('/').pop()}`, sha, branch: K.vetev }),
    });
    ulozeno = textarea.value;
    location.href = adresaStranky(slozkaSouboru() + '/index.md');
  } catch (e: any) {
    hlaseni(`Smazání selhalo: ${e.message}`, 'chyba');
  }
});

window.addEventListener('beforeunload', (e) => {
  if (cesta && textarea.value !== ulozeno && !$('pracovni').hidden) e.preventDefault();
});

start();
