# Jak přidávat poznámky

## Tři způsoby

=== "Přímo na GitHubu (odkudkoli)"

    1. Otevři repozitář na github.com a přejdi do složky, kam poznámka patří, třeba `docs/semestry/01-semestr/`.
    2. **Add file → Create new file**. Do názvu můžeš napsat i cestu: `nazev-predmetu/01-prednaska.md` (lomítko vytvoří složku).
    3. Vlož obsah šablony, vyplň a dej **Commit changes**.
    4. Na každé stránce webu je vpravo nahoře tužka, která otevře její úpravu na GitHubu.

    Na mobilu funguje stejně, případně v aplikaci GitHub.

=== "V počítači (VS Code nebo Obsidian)"

    ```bash
    git clone https://github.com/<účet>/<repozitář>.git
    cd <repozitář>
    python nastroje/nova.py prednaska 1 "Geografické informační systémy" 3 "Souřadnicové systémy"
    # … píšeš …
    git add . && git commit -m "GIS: 3. přednáška" && git push
    ```

    Složku `docs/` jde otevřít i jako **trezor v Obsidianu**: odkazy a obrázky fungují, jen piš odkazy jako běžné Markdown odkazy `[text](cesta.md)`, ne `[[wikilinky]]`.

=== "Náhled webu u sebe"

    ```bash
    pip install -r requirements.txt
    mkdocs serve
    ```
    Pak otevři http://127.0.0.1:8000. Stránka se obnovuje při každém uložení.

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
- Nová stránka se objeví v hledání automaticky. Do horního menu ji dostaneš zápisem do `mkdocs.yml` (sekce `nav`); poznámky předmětů stačí prolinkovat z karty předmětu.

## Psaní: tahák

| Chci | Napíšu |
|---|---|
| úkol k odškrtnutí | `- [ ] úkol` |
| zvýraznění | `**tučně**`, `==zvýrazněno==` |
| vzorec | `$E = mc^2$` nebo blok `$$ … $$` |
| rámeček s tipem | `!!! tip "Nadpis"` + odsazený text |
| rozbalovací odpověď | `??? question "Otázka"` + odsazený text |
| klávesa | `++ctrl+c++` |
| tabulka | viz kterákoli tabulka v šablonách |
