import { getCollection, type CollectionEntry } from 'astro:content';
import { nastaveni } from '../nastaveni';

export type Poznamka = CollectionEntry<'poznamky'>;

export interface Uzel {
  id: string; // cesta ve wiki, např. semestry/01-semestr
  nazev: string;
  stranka?: Poznamka; // složka bez index.md stránku nemá
  deti: Uzel[];
  poradi: number;
}

const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';

export const url = (id: string) => (id === 'index' || id === '' ? BASE : `${BASE}${id}/`);

export const odkazNaUpravu = (p: Poznamka) =>
  `${nastaveni.repozitar}/edit/${nastaveni.vetev}/${p.filePath?.replace(/^\.\//, '')}`;

// Nadpis stránky = první řádek „# …“ v Markdownu.
export function nazev(p: Poznamka): string {
  if (p.data.nazev) return p.data.nazev;
  const m = p.body?.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : hezkyNazev(p.id.split('/').pop() ?? p.id);
}

export function hezkyNazev(slug: string): string {
  const s = slug.replace(/^0?(\d+)-semestr$/, '$1. semestr').replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Krátký úryvek z textu pro kartičky.
export function uryvek(p: Poznamka, delka = 140): string {
  const radky = (p.body ?? '')
    .replace(/^---[\s\S]*?---/, '')
    .split('\n')
    .map((r) => r.trim())
    .filter((r) => r && !/^(#|\||>|```|<|-{3,}|!\[)/.test(r));
  const text = (radky[0] ?? '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '');
  return text.length > delka ? text.slice(0, delka).replace(/\s+\S*$/, '') + '…' : text;
}

const PORADI_SEKCI = ['semestry', 'spoluzaci', 'jak-pridavat'];

let cache: Promise<{ koren: Uzel; vse: Poznamka[]; podle: Map<string, Uzel> }> | undefined;

export function strom() {
  cache ??= postav();
  return cache;
}

async function postav() {
  const vse = await getCollection('poznamky');
  const podle = new Map<string, Uzel>();
  const koren: Uzel = { id: '', nazev: 'Úvod', deti: [], poradi: 0 };
  podle.set('', koren);

  const uzel = (id: string): Uzel => {
    let u = podle.get(id);
    if (u) return u;
    u = { id, nazev: hezkyNazev(id.split('/').pop()!), deti: [], poradi: 999 };
    podle.set(id, u);
    const rodic = uzel(id.includes('/') ? id.slice(0, id.lastIndexOf('/')) : '');
    rodic.deti.push(u);
    return u;
  };

  for (const p of vse) {
    if (p.id === 'index') {
      koren.stranka = p;
      continue;
    }
    const u = uzel(p.id);
    u.stranka = p;
    u.nazev = nazev(p);
    u.poradi = p.data.poradi ?? 999;
  }

  const serad = (u: Uzel) => {
    u.deti.sort((a, b) => a.poradi - b.poradi || a.id.localeCompare(b.id, 'cs'));
    u.deti.forEach(serad);
  };
  serad(koren);
  koren.deti.sort((a, b) => idx(a.id) - idx(b.id));
  return { koren, vse, podle };
}

const idx = (id: string) => {
  const i = PORADI_SEKCI.indexOf(id);
  return i === -1 ? 50 : i;
};

export const pocetPoznamek = (u: Uzel): number =>
  u.deti.reduce((s, d) => s + (d.stranka ? 1 : 0) + pocetPoznamek(d), 0);

export const predci = (id: string) => {
  const casti = id.split('/');
  return casti.slice(0, -1).map((_, i) => casti.slice(0, i + 1).join('/'));
};

export const soubor = (p: Poznamka) => p.filePath?.replace(/^\.\//, '') ?? '';

// Datum z hlavičky poznámky (datum: 2026-10-05) jako text RRRR-MM-DD.
export const datum = (p: Poznamka) => {
  const d = p.data.datum;
  if (!d) return '';
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).includes('{{') ? '' : String(d);
};
export const hezkeDatum = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${+m[3]}. ${+m[2]}. ${m[1]}` : iso;
};

export const jeVyplneno = (v: unknown) => v !== undefined && v !== '' && !String(v).includes('{{');
