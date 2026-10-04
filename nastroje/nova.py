#!/usr/bin/env python3
"""Založí novou poznámku ze šablony (stejně jako tlačítko Nová přednáška na webu).

Příklady:
  python nastroje/nova.py predmet 2 "KGI/4GIF2" "Geoinformatika 2"
  python nastroje/nova.py prednaska 1 geoinformatika-1 3 "Souřadnicové systémy"
  python nastroje/nova.py cviceni 1 geoinformatika-1 3 "Georeferencování"
"""
import datetime
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SABLONY = ROOT / "sablony"


def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def vypln(sablona: str, hodnoty: dict) -> str:
    text = (SABLONY / f"{sablona}.md").read_text(encoding="utf-8")
    for klic, hodnota in hodnoty.items():
        text = text.replace("{{ " + klic + " }}", hodnota)
    return text


def zapis(cesta: Path, text: str) -> None:
    if cesta.exists():
        sys.exit(f"Soubor už existuje: {cesta.relative_to(ROOT)}")
    cesta.parent.mkdir(parents=True, exist_ok=True)
    cesta.write_text(text, encoding="utf-8")
    print(f"Vytvořeno: {cesta.relative_to(ROOT)}")


def main(argv: list[str]) -> None:
    if len(argv) < 3:
        sys.exit(__doc__)
    druh, semestr = argv[0], int(argv[1])
    slozka = ROOT / "docs" / "semestry" / f"{semestr:02d}-semestr"

    if druh == "predmet":
        zkratka, nazev = argv[2], argv[3]
        zapis(slozka / slug(nazev) / "index.md", vypln("predmet", {"zkratka": zkratka, "název předmětu": nazev}))
    elif druh in ("prednaska", "cviceni"):
        predmet, cislo, tema = argv[2], int(argv[3]), argv[4]
        hodnoty = {"č.": str(cislo), "téma": tema, "datum": datetime.date.today().isoformat()}
        zapis(slozka / predmet / f"{cislo:02d}-{druh}.md", vypln(druh, hodnoty))
    else:
        sys.exit(f"Neznámý druh '{druh}'.\n{__doc__}")


if __name__ == "__main__":
    main(sys.argv[1:])
