import * as L from 'lucide-static';

const sada = {
  kniha: L.BookOpen, kalendar: L.CalendarDays, zkouska: L.ClipboardCheck, odkaz: L.Link,
  kompas: L.Compass, cepice: L.GraduationCap, soubor: L.FileText, hledat: L.Search,
  mesic: L.Moon, slunce: L.Sun, menu: L.Menu, tuzka: L.Pencil, stitek: L.Tag, lide: L.Users,
  mapa: L.Map, sipka: L.ChevronRight, list: L.Leaf, zavrit: L.X, plus: L.Plus, dal: L.ArrowRight,
  knihovna: L.Library, vrstvy: L.Layers,
};

export type Ikona = keyof typeof sada;
export const ikona = (n: Ikona, velikost = 20) =>
  sada[n].replace(/width="24"/, `width="${velikost}"`).replace(/height="24"/, `height="${velikost}"`).replace('<svg', '<svg aria-hidden="true"');
