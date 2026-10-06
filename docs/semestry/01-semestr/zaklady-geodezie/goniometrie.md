---
tags:
  - matematika
---

# Goniometrické funkce a podobnost

<div data-nastroj="trojuhelnik"></div>

## Definice

Pravoúhlý trojúhelník ABC, pravý úhel u C. Strana $a$ leží naproti vrcholu A, $b$ naproti B, přepona $c$ naproti pravému úhlu.

| | poměr | pro úhel α |
|---|---|---|
| $\sin\alpha$ | protilehlá / přepona | $a/c$ |
| $\cos\alpha$ | přilehlá / přepona | $b/c$ |
| $\operatorname{tg}\alpha$ | protilehlá / přilehlá | $a/b$ |
| $\operatorname{cotg}\alpha$ | přilehlá / protilehlá | $b/a$ |

> [!TIP] Jak si to zapamatovat
> Přepona je jen u sinu a kosinu. Sinus bere stranu **naproti** úhlu, kosinus stranu, která úhel **svírá**. Tangens a kotangens jsou jen ty dvě odvěsny, jednou tak, podruhé obráceně.

Protilehlá a přilehlá se určují vždy k úhlu, o který jde. Pro druhý ostrý úhel β se prohodí: $\sin\beta = b/c = \cos\alpha$.

**Vztahy:**
$\operatorname{tg}\alpha = \dfrac{\sin\alpha}{\cos\alpha}$,
$\operatorname{cotg}\alpha = \dfrac{1}{\operatorname{tg}\alpha}$,
$\sin^2\alpha + \cos^2\alpha = 1$ (Pythagorova věta vydělená $c^2$),
$\sin\alpha = \cos(100\,\text{gon} - \alpha) = \cos(90° - \alpha)$.

**Opačně** (znám poměr, hledám úhel): $\alpha = \arcsin(a/c)$, $\arccos(b/c)$, $\operatorname{arctg}(a/b)$. Na kalkulačce `SHIFT` + `sin` / `cos` / `tan`. Kotangens kalkulačka nemá: $\operatorname{cotg}\alpha = 1/\tan\alpha$.

## Úhlové jednotky

<div data-nastroj="uhly"></div>

Plný úhel: $360° = 400\,\text{gon} = 2\pi\,\text{rad}$. Pravý úhel: $90° = 100\,\text{gon} = \tfrac{\pi}{2}\,\text{rad}$.

| z \ na | stupně | gony | radiány |
|---|---|---|---|
| **stupně** | | $\cdot\, \tfrac{400}{360} = \,/\,0{,}9$ | $\cdot\, \tfrac{\pi}{180}$ |
| **gony** | $\cdot\, 0{,}9$ | | $\cdot\, \tfrac{\pi}{200}$ |
| **radiány** | $\cdot\, \tfrac{180}{\pi}$ | $\cdot\, \tfrac{200}{\pi}$ | |

$1° = 60′ = 3600″$, $\quad 1\,\text{gon} = 100\,\text{c} = 10\,000\,\text{cc}$. Radián je úhel, u kterého je oblouk stejně dlouhý jako poloměr. V geodézii se úhly měří v gonech.

> [!WARNING] Režim kalkulačky
> Kalkulačka musí být v režimu **GRAD** (na displeji G), jinak vyjde nesmysl. Kontrola: $\sin 50\,\text{gon} = 0{,}7071$ a $\sin 100\,\text{gon} = 1$. Ve stupních (D) by $\sin 100 = 0{,}9848$.

## V geodézii

**Šikmá délka → vodorovná délka a převýšení.** Totální stanice měří šikmou délku $s$ a zenitový úhel $z$ (od svislice nahoře). Výškový úhel $\alpha = 100\,\text{gon} - z$ (od vodorovné roviny).

$d = s\cdot\sin z = s\cdot\cos\alpha$ $\qquad$ $\Delta h = s\cdot\cos z = s\cdot\sin\alpha$

Příklad: $s = 125{,}40$ m, $z = 96{,}5000$ gon → $d = 125{,}40\cdot\sin 96{,}5 = 125{,}21$ m, $\Delta h = 125{,}40\cdot\cos 96{,}5 = 6{,}89$ m.

**Výška objektu** (trigonometrické určení výšky). Známá vodorovná vzdálenost $d$ k objektu, výškový úhel $\alpha$ na vrchol, výška přístroje $v$:

$h = d\cdot\operatorname{tg}\alpha + v = d\cdot\operatorname{cotg} z + v$

Příklad: $d = 40$ m, $\alpha = 25$ gon, $v = 1{,}60$ m → $h = 40\cdot\operatorname{tg} 25 + 1{,}60 = 16{,}57 + 1{,}60 = 18{,}17$ m.

**Souřadnicové rozdíly** (polární metoda). Směrník $\sigma$ je úhel od kladné osy $+X$ po směru hodinových ručiček, $s$ je vodorovná délka:

$\Delta y = s\cdot\sin\sigma \qquad \Delta x = s\cdot\cos\sigma$

Znaménka vyjdou z kalkulačky sama. Opačně: $s = \sqrt{\Delta x^2 + \Delta y^2}$ a pomocný úhel $\omega = \operatorname{arctg}\left|\dfrac{\Delta y}{\Delta x}\right|$, směrník podle kvadrantu:

| Δy | Δx | kvadrant | σ |
|:-:|:-:|:-:|---|
| + | + | I | $\omega$ |
| + | − | II | $200\,\text{gon} - \omega$ |
| − | − | III | $200\,\text{gon} + \omega$ |
| − | + | IV | $400\,\text{gon} - \omega$ |

**Sklon terénu** v procentech: $\operatorname{tg}\alpha \cdot 100$. Svah 12 % má $\alpha = \operatorname{arctg} 0{,}12 = 7{,}60$ gon.

## Podobnost trojúhelníků

Dva trojúhelníky jsou podobné, když mají stejné úhly. Pak jsou všechny jejich strany ve stejném poměru $k$ (koeficient podobnosti): $a' = k\cdot a$, $b' = k\cdot b$, $c' = k\cdot c$.

Podobnost poznáš podle vět:
- **uu**: shodují se ve dvou úhlech (třetí je pak taky stejný),
- **sss**: všechny tři strany ve stejném poměru,
- **sus**: dvě strany ve stejném poměru a shodný úhel mezi nimi.

> [!IMPORTANT] Proč to patří k sinu
> Všechny pravoúhlé trojúhelníky s úhlem α jsou podobné (věta uu). Proto je poměr protilehlá / přepona pro daný úhel vždy stejný, ať je trojúhelník velký nebo malý. Ten poměr se jmenuje $\sin\alpha$. V nástroji nahoře změň přeponu: poměry zůstanou.

**Výška podle stínu.** Tyč 2 m vrhá stín 1,6 m, věž stín 28 m. Slunce svítí na obě pod stejným úhlem, trojúhelníky jsou podobné:
$\dfrac{h}{28} = \dfrac{2}{1{,}6}$ → $h = 35$ m.

**Nitkový dálkoměr.** V dalekohledu jsou dvě rysky, mezi nimi se na lati přečte úsek $l$. Trojúhelník v dalekohledu a trojúhelník k lati jsou podobné, konstanta je 100: $d = 100\cdot l$. Úsek 0,437 m → $d = 43{,}7$ m.

**Mapa.** Obraz na mapě je podobný skutečnosti, $k = 1/M$. Proto se úhly na mapě nemění a délky se násobí měřítkovým číslem.

**Rovnoměrný svah.** Na 10 m vodorovně stoupne o 1,2 m. Na 35 m: $\Delta h = 1{,}2\cdot\dfrac{35}{10} = 4{,}2$ m.

## Procvičování

<div data-nastroj="procvicovani"></div>
