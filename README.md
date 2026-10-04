# Moje studium na UJEP

Osobní wiki se studijními poznámkami z **Fakulty životního prostředí UJEP**. Psaná v Markdownu, takže se dá číst přímo tady na GitHubu, v Obsidianu, nebo jako web přes GitHub Pages (MkDocs Material, s hledáním a tmavým režimem).

**Začni tady:** [docs/index.md](docs/index.md)

## Struktura

```
docs/
  index.md               úvod a rozcestník
  studium/               přehled studia, kredity, harmonogram, zkoušky, odkazy, slovníček
  semestry/01-semestr/   poznámky po semestrech → složka pro každý předmět
  navody/                opakovatelné postupy (ArcGIS Pro, …)
  zaverecna-prace/       bakalářská / diplomová práce
  sablony/               šablony nových poznámek
nastroje/nova.py         založí poznámku ze šablony
mkdocs.yml               nastavení webu a menu
```

## Rychlé příkazy

```bash
python nastroje/nova.py predmet 1 "Geografické informační systémy"
python nastroje/nova.py prednaska 1 "Geografické informační systémy" 1 "Úvod do GIS"
pip install -r requirements.txt && mkdocs serve    # náhled na http://127.0.0.1:8000
```

## Web (GitHub Pages)

Po každém pushi do `main` se web sestaví sám (`.github/workflows/web.yml`). Jednorázově je potřeba zapnout **Settings → Pages → Source: GitHub Actions**.
Repozitář je veřejný: nepiš sem osobní údaje (osobní číslo, hesla, kontakty na spolužáky) ani materiály, které vyučující nechtějí šířit.
