---
tags:
  - GIS
  - ArcGIS Pro
  - návod
---

# ArcGIS Pro: návod ke krokům 4 až 7

Názvy nástrojů a menu jsou anglicky (tak je má ArcGIS Pro). Přesné názvy polí v datech neznám, proto je píšu jako `POLE_…`. Najdeš je takto: pravým na vrstvu → **Attribute Table**, nebo pravým → **Data Design → Fields**. Význam polí a kódů je v souboru **Popis dat.pdf**.

> Užitečné: ve **Fields view** jde u pole zapnout zobrazení aliasů. Ve SQL dotazech a výrazech se ale vždycky používá skutečný **název** pole, ne alias.

---

## Krok 4: samostatná mapa pro každou vrstvu

### 4.1 Vytvoření map
1. Pás karet **Insert → New Map** (jednou pro každou vrstvu).
2. V panelu **Catalog** (View → Catalog Pane) rozbal svou geodatabázi a přetáhni do nové mapy vždy jen jednu vrstvu.
3. **Přejmenování mapy:** v panelu Catalog → složka **Maps** → pravým na mapu → **Rename**. Případně v Contents pravým na název mapy → **Properties → General → Name**.
   Příklady: „Silnice ČR“, „Železnice ČR“, „Okresy ČR podle krajů“, „Obce ČR“, „Vodní toky“…
4. **Přejmenování vrstvy:** v **Contents** klikni na název vrstvy a stiskni **F2**, nebo pravým → **Properties → General → Name**. Použij český popisný název, třeba „Silnice (dálnice, rychlostní, I. třída)“, ne „silnice_CV3“.

### 4.2 Barvy podle významu (Symbology)
Pravým na vrstvu → **Symbology**. Protože máš subtypy, ArcGIS Pro obvykle sám nabídne **Unique Values** podle pole se subtypem. Když ne, nastav **Primary symbology: Unique Values** a jako Field zvol pole se subtypem.

Doporučené barvy:

| Vrstva | Doporučení |
|---|---|
| Silnice | dálnice: červená, nejsilnější čára (cca 2,5 pt); rychlostní: tmavě oranžová (2 pt); I. třída: žlutá nebo oranžová (1,5 pt) |
| Železnice | v galerii symbolů hledej „Railroad“ (černobílá čárkovaná). Elektrifikované tratě dej výraznější nebo barevně odliš od neelektrifikovaných |
| Vodní toky a plochy | modrá |
| Lesy | zelená |
| Okresy | Unique Values podle kraje (viz 4.4), světlé pastelové výplně, tenká šedá hranice |
| Obce | bodový nebo polygonový symbol v neutrální barvě |

Barvu jedné kategorie změníš kliknutím na její symbol v seznamu → **Properties** (Color, Width).

### 4.3 Silnice: jen dálnice, rychlostní silnice a I. třídy (Definition Query)
1. Pravým na vrstvu silnic → **Properties → Definition Query → New definition query**.
2. **Where** `POLE_TRIDA` **is in** a zaškrtni hodnoty pro dálnici, rychlostní silnici a silnici I. třídy. Nebo přepni na **SQL** a napiš například:
   ```sql
   POLE_TRIDA IN (1, 2, 3)
   ```
   Kódy (čísla nebo text) zjistíš v Popis dat.pdf nebo v Data Design → Subtypes. U textových kódů patří hodnoty do apostrofů: `IN ('D', 'R', '1')`.
3. **Apply → OK.** V mapě i v atributové tabulce zůstanou jen tyto tři třídy.
4. Pak v Symbology klikni na **More → Add all values**, případně odstraň kategorie, které už nejsou vidět (nebo zruš zaškrtnutí „all other values“).

### 4.4 Popisky silnic národním označením
1. Vyber vrstvu v Contents → pás karet **Labeling**.
2. **Field:** pole s národním označením (např. `POLE_OZNACENI` / `CISLO`, typicky hodnoty jako „D1“, „R35“, „I/9“).
3. Zapni popisky tlačítkem **Label** (nebo pravým na vrstvu → Label).
4. Vzhled: **Labeling → Label Class** (ikona vpravo dole ve skupině Text Symbol). Pro silnice nastav **Position → Placement: Parallel** (nebo Curved). Jako symbol se hodí třeba „Highway Shield“ z galerie. Proti hromadění popisků použij **Position → Conflict resolution → Remove duplicate labels** (Remove all / Remove within fixed distance).

### 4.5 Okresy podle krajů s názvem okresu
1. **Symbology → Unique Values → Field:** pole se subtypem kraje (případně pole s kódem nebo názvem kraje, které jsi doplnil v kroku 3).
2. Zvol barevné schéma s výraznými, ale světlými barvami (14 krajů).
3. **Labeling → Field:** název okresu (`POLE_NAZEV`), potom **Label**.

### 4.6 Kontrola na konci kroku 4
Každá mapa má smysluplný název a obsahuje jednu vrstvu s českým názvem a symbologií podle významu. Silnice jsou filtrované a popsané, okresy obarvené podle krajů a popsané názvy.

---

## Krok 5: obyvatelé v obcích Středočeského kraje (zaokrouhleno na desítky)

### 5.1 Výběr obcí Středočeského kraje
- **Varianta A (obce mají pole s krajem):** **Map → Select By Attributes**, Input: obce, `POLE_KRAJ` **is equal to** Středočeský kraj (kód např. `CZ020` nebo `3026`, podle dat).
- **Varianta B (pole s krajem chybí):** nejdřív v okresech vyber okresy Středočeského kraje (Select By Attributes podle subtypu kraje). Pak **Map → Select By Location**: Input Features = obce, Relationship = **Have their center in**, Selecting Features = okresy (stačí výběr).

### 5.2 Uložení jako nová vrstva
Pravým na obce → **Data → Export Features**. Ověř, že se exportuje jen výběr (počet vybraných prvků je vidět dole v atributové tabulce). Output: `Obce_Stredocesky_kraj` do tvé geodatabáze.

### 5.3 Zaokrouhlení na desítky
1. Otevři atributovou tabulku nové vrstvy → **Add Field** (nebo nástroj **Add Field**): `OBYV_ZAOKR`, typ **Long**. Ulož (Fields view → **Save**).
2. Pravým na hlavičku `OBYV_ZAOKR` → **Calculate Field**, Expression type **Python 3**:
   ```python
   int((!POLE_OBYVATELE! + 5) // 10 * 10)
   ```
   Z 1 234 bude 1 230, z 1 235 bude 1 240.

   > Pozor: Pythonový `round(!POLE!, -1)` zaokrouhluje „bankovně“, takže `round(25, -1)` vrátí 20. Proto je bezpečnější výraz výše.
3. Přejmenuj vrstvu, třeba „Počet obyvatel obcí Středočeského kraje (zaokr. na desítky)“, a mapu, třeba „Obyvatelé – Středočeský kraj“.
4. **Symbology → Graduated Colors** (u polygonů) nebo **Graduated Symbols** (u bodů), Field: `OBYV_ZAOKR`, Method: Natural Breaks, 5 tříd.

---

## Krok 6: průměrný věk v okresech vybraného kraje (2021)

### 6.1 Import Excelu
1. Zavři soubor v Excelu, jinak ho ArcGIS nenačte.
2. Nástroj **Excel To Table** (Conversion Tools), přes **Analysis → Tools** a vyhledání:
   - Input Excel File: `počet_obyvatel_2021.xlsx`
   - Sheet: list s daty za okresy
   - Output Table: `vek_okresy_2021` v geodatabázi
   - Pokud tabulka nezačíná hlavičkou na 1. řádku, nastav **Field Names Row** a **Cell Range**, nebo si v kopii xlsx smaž nadpisové řádky nad hlavičkou.
3. Otevři novou tabulku a zjisti:
   - pole s **kódem nebo názvem okresu** (klíč pro spojení),
   - pole s **průměrným věkem**.

   > Pokud tabulka nemá hotový průměrný věk, ale jen počty obyvatel v věkových skupinách, napiš mi, jak vypadají sloupce. Průměr se pak musí spočítat váženě.

### 6.2 Okresy jen pro tvůj kraj
Buď **Definition Query** na vrstvě okresů (`POLE_KRAJ = <tvůj kraj>`), nebo Select By Attributes a **Export Features** do `Okresy_<kraj>`. Export je čistší, protože vznikne vlastní vrstva pro mapu.

### 6.3 Spojení (Join)
1. Pravým na okresy → **Joins and Relates → Add Join** (nebo nástroj **Add Join**):
   - Input Join Field: kód okresu ve vrstvě (např. `KOD_OKRES`, `LAU1`, `NUTS4`)
   - Join Table: `vek_okresy_2021`
   - Join Table Field: odpovídající kód v tabulce
   - Zaškrtni **Keep All Target Features** a klikni na **Validate Join**.
2. **Nejčastější problém:** typy klíčů nesedí. Excel importuje čísla jako *Double* (40711.0), ve vrstvě jsou jako *Text* ("40711"). Řešení: do tabulky přidej textové pole `KOD_TXT` a Calculate Field `str(int(!KOD!))`, pak spojuj přes něj. Spojení přes název okresu také funguje, ale názvy se musí přesně shodovat (diakritika, mezery, „Praha“, „Hlavní město Praha“).
3. Po připojení zkontroluj v atributové tabulce, že žádný okres nemá u věku `<Null>`.

### 6.4 Trvalé pole a zaokrouhlení na 1 desetinné místo
Join je jen „virtuální“. Spolehlivější je hodnotu zapsat přímo do vrstvy:
1. Do vrstvy okresů přidej pole `PRUM_VEK`, typ **Double**.
2. **Calculate Field** (Python 3) na `PRUM_VEK`:
   ```python
   round(!vek_okresy_2021.POLE_PRUMERNY_VEK!, 1)
   ```
   (Při aktivním joinu mají pole předponu názvu tabulky. Vyber je ze seznamu Fields a zápis se doplní sám.)
3. Pravým na vrstvu → **Joins and Relates → Remove All Joins**.
4. Aby se hodnoty zobrazovaly s jedním desetinným místem i v popiscích: **Fields view → PRUM_VEK → Number Format → Numeric → Rounding: Number of decimal places = 1** → Save.

Alternativa: nástroj **Join Field** (Data Management) připojí pole z tabulky do vrstvy trvale rovnou, takže krok 3 odpadá.

### 6.5 Mapa
- **Insert → New Map**, přejmenuj ji třeba na „Průměrný věk obyvatel v okresech <kraje>, 2021“, přidej vrstvu a přejmenuj ji „Průměrný věk 2021“.
- **Symbology → Graduated Colors**, Field `PRUM_VEK`, sekvenční barevná škála, 4 až 5 tříd. Malý počet okresů dobře snese i Manual Interval.
- **Labeling:** název okresu a věk. Klikni na **Expression** a použij Arcade:
  ```
  $feature.POLE_NAZEV + TextFormatting.NewLine + Text($feature.PRUM_VEK, "#.0")
  ```

---

## Krok 7: sdílení projektu na ArcGIS Online

1. Ověř přihlášení: vpravo nahoře v ArcGIS Pro musíš být přihlášen školním účtem (portál UJEP, `…maps.arcgis.com`). Projekt ulož (**Ctrl+S**).
2. Pás karet **Share → Project** (skupina *Package*). Otevře se panel **Package Project**.
3. Vyplň:
   - **Upload package to ArcGIS Online** (zvoleno)
   - **Name:** např. `CAST1_Prijmeni`
   - **Summary** a **Tags** (povinné, třeba „UJEP, GIS, cvičení“)
   - **Include Toolboxes:** zrušit zaškrtnutí
   - **Include History Items:** zrušit zaškrtnutí
   - **Share with:** zaškrtni skupinu **Fakulta životního prostředí UJEP** (v části Groups)
4. Klikni na **Analyze**. Případné *errors* opravit musíš (typicky chybí summary nebo tags), *warnings* nevadí. Pak klikni na **Package**.
5. Po dokončení se dole v panelu objeví odkaz **Manage the uploaded package**. Případně otevři ArcGIS Online → **Content → My Content** → položku projektu.
6. **Zkopíruj adresu položky** z prohlížeče (tvar `https://…maps.arcgis.com/home/item.html?id=…`) a vlož ji do úkolu.
7. Kontrola: na stránce položky v sekci **Share** musí být zaškrtnutá skupina Fakulta životního prostředí UJEP, jinak ji vyučující neuvidí.

---

### Když se něco zasekne
Pošli mi název vrstvy, seznam jejích polí (snímek atributové tabulky nebo Fields view) a přesnou chybovou hlášku. Upravím ti příslušný výraz nebo dotaz přesně na tvoje data.
