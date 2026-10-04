# Jak přidávat poznámky

## Tři způsoby

### Přímo na GitHubu (odkudkoli)

1. Otevři repozitář na github.com a přejdi do složky, kam poznámka patří, třeba `docs/semestry/01-semestr/`.
2. **Add file → Create new file**. Do názvu můžeš napsat i cestu: `nazev-predmetu/01-prednaska.md` (lomítko vytvoří složku).
3. Vlož obsah šablony, vyplň a dej **Commit changes**.
4. Na každé stránce webu je pod nadpisem odkaz **Upravit na GitHubu**, který otevře přesně tenhle soubor.

Na mobilu funguje stejně, případně v aplikaci GitHub.

### V počítači (VS Code nebo Obsidian)

```bash
git clone https://github.com/jackdown3csr/ujep-kgi.git
cd ujep-kgi
python nastroje/nova.py prednaska 1 "Geografické informační systémy" 3 "Souřadnicové systémy"
# … píšeš …
git add . && git commit -m "GIS: 3. přednáška" && git push
```

Složku `docs/` jde otevřít i jako **trezor v Obsidianu**: odkazy a obrázky fungují, jen piš odkazy jako běžné Markdown odkazy `[text](cesta.md)`, ne `[[wikilinky]]`.

### Náhled webu u sebe

Potřebuješ [Node.js](https://nodejs.org) 22 nebo novější.

```bash
npm install
npm run dev
```

Pak otevři http://localhost:4321. Stránka se obnovuje při každém uložení. Hledání funguje až v sestavené verzi (`npm run build && npm run preview`).

## Pravidla, aby se to dalo najít i za tři roky

- **Názvy souborů** malými písmeny bez diakritiky a mezer: `souradnicove-systemy.md`. Nadpis uvnitř už s diakritikou.
- **Číslování** přednášek a cvičení dvěma číslicemi: `01-prednaska.md`, `02-prednaska.md`.
- **Obrázky** do složky `obrazky/` vedle poznámky: `![Výsledná mapa](obrazky/mapa-okresy.png)`.
- **PDF a velké soubory** (prezentace, data) do repozitáře nedávej; stačí odkaz na Moodle nebo OneDrive. GitHub má limit 100 MB na soubor a repozitář by zbytečně rostl.
- **Odkazuj** mezi poznámkami. Návod, který se hodí ve více předmětech, patří do [Návodů](navody/index.md), z předmětu na něj jen odkaž.
- **Štítky**: na začátek souboru můžeš dát
  ```yaml
  ---
  tags:
    - GIS
  ---
  ```
- **Menu se skládá samo** podle složek. Nový předmět (složka s `index.md` v semestru) se sám objeví v menu i na úvodní stránce. Pořadí stránek ve složce určují čísla v názvu souboru, případně `poradi: 3` v hlavičce.
- **Aktuální semestr** na úvodní stránce nastavíš v `src/nastaveni.ts`.

## Psaní: tahák

Rámečky i rozbalovací odpovědi vypadají správně i přímo na GitHubu a v Obsidianu.

| Chci | Napíšu |
|---|---|
| úkol k odškrtnutí | `- [ ] úkol` |
| zvýraznění | `**tučně**`, `*kurzíva*` |
| vzorec | `$E = mc^2$` nebo blok `$$ … $$` |
| rámeček s tipem | `> [!TIP] Nadpis` a na dalších řádcích `> text` (dále `NOTE`, `WARNING`, `IMPORTANT`, `CAUTION`) |
| rozbalovací odpověď | `<details><summary>Otázka</summary>` odpověď `</details>` |
| klávesa | `<kbd>Ctrl</kbd>+<kbd>C</kbd>` |
| tabulka | viz kterákoli tabulka v šablonách |
