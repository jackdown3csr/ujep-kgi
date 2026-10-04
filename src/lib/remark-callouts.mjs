import { visit } from 'unist-util-visit';

// GitHub / Obsidian rámečky: > [!TIP] Nadpis
const NAZVY = { NOTE: 'Poznámka', TIP: 'Tip', IMPORTANT: 'Důležité', WARNING: 'Pozor', CAUTION: 'Varování', INFO: 'Info' };

export default function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const prvni = node.children[0];
      const text = prvni?.type === 'paragraph' ? prvni.children[0] : null;
      if (!text || text.type !== 'text') return;
      const m = text.value.match(/^\[!(\w+)\][ \t]*([^\n]*)\n?/);
      if (!m) return;
      const druh = m[1].toUpperCase() === 'INFO' ? 'NOTE' : m[1].toUpperCase();
      const nadpis = m[2] || NAZVY[druh] || m[1];
      text.value = text.value.slice(m[0].length);
      if (!text.value && prvni.children.length === 1) node.children.shift();
      else if (!text.value) prvni.children.shift();
      // zbylý začátek odstavce za nadpisem může začínat zalomením
      if (prvni.children[0]?.type === 'break') prvni.children.shift();
      node.data = { hName: 'aside', hProperties: { className: ['ramecek', `ramecek-${druh.toLowerCase()}`] } };
      node.children.unshift({
        type: 'paragraph',
        data: { hProperties: { className: ['ramecek-nadpis'] } },
        children: [{ type: 'text', value: nadpis }],
      });
    });
  };
}
