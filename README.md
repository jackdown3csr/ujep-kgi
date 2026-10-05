# Poznámky ze studia na FŽP UJEP

Zápisky z přednášek a cvičení, obor Aplikovaná geoinformatika na **Fakultě životního prostředí UJEP**. Chceš něco opravit nebo doplnit? Viz [Pro spolužáky](docs/spoluzaci.md).

Poznámky jsou obyčejné Markdown soubory ve složce `docs/`, takže se dají číst a psát přímo tady na GitHubu, v Obsidianu nebo ve VS Code. Web nad nimi je postavený v [Astru](https://astro.build) a běží na Vercelu.

## Psaní poznámek

Na webu: dole v patičce **Přihlásit k úpravám** (jednou, s přístupovým klíčem z GitHubu), pak u předmětu **Nová přednáška / Nové cvičení** nebo u poznámky **Upravit**. Editor ukládá rovnou sem do repozitáře a web se sám aktualizuje.

## Struktura

```
docs/semestry/01-semestr/          semestr
  geoinformatika-1/index.md        předmět (zkratka v hlavičce)
  geoinformatika-1/01-prednaska.md poznámka (datum v hlavičce)
  geoinformatika-1/obrazky/        obrázky k poznámkám
sablony/                           šablony nové přednášky, cvičení a předmětu
nastroje/nova.py                   založí poznámku ze šablony z příkazové řádky
src/                               web (Astro), editor je v src/pages/editor.astro
src/nastaveni.ts                   název webu, aktuální semestr
```

## Rychlé příkazy

```bash
python nastroje/nova.py prednaska 1 geoinformatika-1 3 "Souřadnicové systémy"
python nastroje/nova.py predmet 2 "KGI/4GIF2" "Geoinformatika 2"

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
