# Poznámky ze studia na FŽP UJEP

**Web: https://jackdown3csr.github.io/ujep-kgi/**

Neoficiální studijní poznámky a návody z **Fakulty životního prostředí UJEP**. Chceš něco opravit nebo doplnit? Viz [Pro spolužáky](docs/spoluzaci.md).

Wiki se studijními poznámkami Psaná v Markdownu, takže se dá číst přímo tady na GitHubu, v Obsidianu, nebo jako web přes GitHub Pages (MkDocs Material, s hledáním a tmavým režimem).

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

## Licence

Obsah je pod licencí [CC BY-SA 4.0](LICENSE): můžeš ho sdílet a upravovat, když uvedeš autora a stejnou licenci.

Repozitář je veřejný: nepiš sem osobní údaje (osobní číslo, hesla, kontakty na spolužáky) ani materiály, které vyučující nechtějí šířit.
