import path from 'node:path';
import { visit } from 'unist-util-visit';

// Odkazy mezi poznámkami píšeme jako soubory (../studium/prehled.md), aby fungovaly
// i na GitHubu a v Obsidianu. Na webu z nich uděláme adresy stránek.
export default function rehypeOdkazy({ base = '/' } = {}) {
  const koren = path.resolve('docs');
  const pref = base.endsWith('/') ? base : base + '/';
  return (tree, file) => {
    if (!file.path) return;
    const adresar = path.dirname(file.path);
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string' || /^[a-z]+:|^#|^\//i.test(href)) {
        if (typeof href === 'string' && /^https?:/.test(href)) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener';
        }
        return;
      }
      const [cesta, kotva] = href.split('#');
      if (!cesta.endsWith('.md')) return;
      const cil = path.relative(koren, path.resolve(adresar, decodeURI(cesta)));
      const id = cil.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
      node.properties.href = pref + (id ? id + '/' : '') + (kotva ? '#' + kotva : '');
    });
  };
}
