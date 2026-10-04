#!/usr/bin/env python3
"""Založí novou poznámku ze šablony.

Příklady:
  python nastroje/nova.py predmet 1 "Geografické informační systémy"
  python nastroje/nova.py prednaska 1 "Geografické informační systémy" 3 "Souřadnicové systémy"
  python nastroje/nova.py cviceni 1 "Geografické informační systémy" 3 "Georeferencování"
  python nastroje/nova.py zkouska 1 "Geografické informační systémy"
  python nastroje/nova.py navod "QGIS" "Připojení WMS"
"""
import datetime
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SABLONY = DOCS / "sablony"


def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def vypln(sablona: str, hodnoty: dict) -> str:
    text = (SABLONY / f"{sablona}.md").read_text(encoding="utf-8")
    for klic, hodnota in hodnoty.items():
        text = re.sub(r"\{\{ " + re.escape(klic) + r" \}\}", hodnota, text)
    return text


def zapis(cesta: Path, text: str) -> None:
    if cesta.exists():
        sys.exit(f"Soubor už existuje: {cesta.relative_to(ROOT)}")
    cesta.parent.mkdir(parents=True, exist_ok=True)
    cesta.write_text(text, encoding="utf-8")
    print(f"Vytvořeno: {cesta.relative_to(ROOT)}")


def main(argv: list[str]) -> None:
    if len(argv) < 2:
        sys.exit(__doc__)
    druh, args = argv[0], argv[1:]
    dnes = datetime.date.today().strftime("%-d. %-m. %Y")

    if druh == "navod":
        program, tema = args[0], args[1]
        text = vypln("navod", {"Program": program, "co návod řeší": tema})
        zapis(DOCS / "navody" / slug(program) / f"{slug(tema)}.md", text)
        return

    semestr, predmet = int(args[0]), args[1]
    slozka = DOCS / "semestry" / f"{semestr:02d}-semestr" / slug(predmet)

    if druh == "predmet":
        text = vypln("predmet", {"název předmětu": predmet, "1": str(semestr)})
        zapis(slozka / "index.md", text)
    elif druh in ("prednaska", "cviceni"):
        cislo, tema = args[2], args[3]
        text = vypln(druh, {"č.": cislo, "téma": tema, "předmět": predmet, "datum": dnes})
        zapis(slozka / f"{int(cislo):02d}-{druh}.md", text)
    elif druh == "zkouska":
        zapis(slozka / "zkouska.md", vypln("zkouska", {"předmět": predmet}))
    else:
        sys.exit(f"Neznámý druh '{druh}'.\n{__doc__}")


if __name__ == "__main__":
    main(sys.argv[1:])
