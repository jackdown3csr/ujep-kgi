# Poznámky ze studia na FŽP UJEP

Neoficiální studijní poznámky a návody z **Fakulty životního prostředí UJEP**. Chceš něco opravit nebo doplnit? Viz [Pro spolužáky](docs/spoluzaci.md).

Poznámky jsou obyčejné Markdown soubory ve složce `docs/`, takže se dají číst a psát přímo tady na GitHubu, v Obsidianu nebo ve VS Code. Web nad nimi je postavený v [Astru](https://astro.build) a běží na Vercelu.

## Struktura

```
docs/                    ← všechny poznámky (Markdown)
  studium/               přehled studia, harmonogram, zkoušky, odkazy, slovníček
  semestry/01-semestr/   poznámky po semestrech → složka pro každý předmět
  navody/                opakovatelné postupy (ArcGIS Pro, …)
  zaverecna-prace/       bakalářská / diplomová práce
  sablony/               šablony nových poznámek
nastroje/nova.py         založí poznámku ze šablony
src/                     web (vzhled, úvodní stránka, menu)
src/nastaveni.ts         název webu, aktuální semestr
```

## Rychlé příkazy

```bash
python nastroje/nova.py predmet 1 "Geografické informační systémy"
python nastroje/nova.py prednaska 1 "Geografické informační systémy" 1 "Úvod do GIS"

npm install
npm run dev        # náhled na http://localhost:4321
npm run build      # sestavení webu včetně hledání do dist/
```

## Nasazení

- **Vercel:** na vercel.com → *Add New → Project* → import `ujep-kgi`. Vercel sám pozná Astro, nic dalšího nastavovat není potřeba. Po každém pushi do `main` se web aktualizuje.
- **GitHub Pages:** kopie webu na jackdown3csr.github.io/ujep-kgi se sestavuje přes `.github/workflows/web.yml`.

## Licence

Obsah je pod licencí [CC BY-SA 4.0](LICENSE): můžeš ho sdílet a upravovat, když uvedeš autora a stejnou licenci.

Repozitář je veřejný: nepiš sem osobní údaje (osobní číslo, hesla, kontakty na spolužáky) ani materiály, které vyučující nechtějí šířit.
