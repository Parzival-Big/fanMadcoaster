# TurboCoaster — Documentazione completa

Guida di riferimento del progetto: design del gioco, architettura del codice,
parametri di bilanciamento, workflow di sviluppo e build, checklist di
pubblicazione su App Store e Play Store.

> Per il quick start vedi il [README](README.md).

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Game design](#2-game-design)
3. [Architettura del codice](#3-architettura-del-codice)
4. [Fisica e bilanciamento](#4-fisica-e-bilanciamento)
5. [Generazione procedurale del percorso](#5-generazione-procedurale-del-percorso)
6. [Grafica e audio](#6-grafica-e-audio)
7. [Workflow di sviluppo](#7-workflow-di-sviluppo)
8. [Build e distribuzione Android](#8-build-e-distribuzione-android)
9. [Build e distribuzione iOS](#9-build-e-distribuzione-ios)
10. [Checklist prima della pubblicazione](#10-checklist-prima-della-pubblicazione)
11. [Test automatici](#11-test-automatici)
12. [Risoluzione problemi](#12-risoluzione-problemi)
13. [Roadmap / idee di sviluppo](#13-roadmap--idee-di-sviluppo)
14. [Note legali](#14-note-legali)

---

## 1. Panoramica

**TurboCoaster** è un endless runner arcade ispirato alle *meccaniche* di
Madcoaster (2015): un carrello di montagne russe corre da solo e accelera
all'infinito; il giocatore controlla solo il salto. L'obiettivo è sopravvivere
il più a lungo possibile totalizzando il punteggio più alto.

| Aspetto | Scelta |
| --- | --- |
| Motore di gioco | [Phaser 3](https://phaser.io) (rendering WebGL/Canvas) |
| Linguaggio | TypeScript (strict) |
| Bundler | Vite |
| Wrapper nativo | [Capacitor 8](https://capacitorjs.com) → progetti `android/` e `ios/` |
| Risoluzione logica | 960×540 px, landscape, scala `FIT` su qualsiasi schermo |
| Asset | Zero file: grafica disegnata a runtime, suoni sintetizzati WebAudio |
| Salvataggi | `localStorage` (funziona nella WebView di Capacitor) |

Un unico codice gira su iOS, Android e browser: il browser serve per lo
sviluppo rapido, i progetti nativi per la distribuzione.

## 2. Game design

### Controlli

- **Tocco sullo schermo** (o Spazio / Freccia su su desktop): salto.
- **Secondo tocco in aria**: doppio salto. Dopo il doppio salto non si può
  saltare di nuovo finché non si atterra.
- Se il carrello corre oltre il bordo di un binario senza saltare, inizia a
  cadere ma conserva **un** doppio salto come salvataggio in extremis.

### Elementi di gioco

| Elemento | Effetto |
| --- | --- |
| **Moneta** | +10 punti, +1 al contatore monete (salvate come valuta totale) |
| **Creaturina** | Travolgendola: +50 punti, particelle, shake della camera |
| **Barriera** | Schianto e game over, a meno di avere lo scudo attivo |
| **Calamita** (power-up) | Per 8 secondi le monete entro 240 px vengono attirate |
| **Scudo** (power-up) | Assorbe un urto contro una barriera, poi si consuma |
| **Voragine** | Cadendo sotto il fondo dello schermo: game over |
| **Parete** | Colpire il fianco di un binario più alto: game over |

### Punteggio

`punteggio = distanza / 10 + bonus`, dove il bonus somma monete (+10) e
creaturine (+50). Il record e il totale monete sono persistiti sul dispositivo
(chiavi `turbocoaster-best` e `turbocoaster-coins` in `localStorage`).

### Flusso delle scene

```
Boot (genera le texture) → Menu → Game ⇄ GameOver (overlay sulla partita in pausa)
                             ↑______________|
```

## 3. Architettura del codice

```
src/
├── main.ts               Config Phaser: risoluzione, scaling, elenco scene
├── constants.ts          TUTTI i numeri di bilanciamento + speedAt() e jumpRange()
├── track.ts              Classe Track: generazione, interrogazione e disegno dei binari
├── textures.ts           Genera le texture a runtime con l'API Graphics
├── audio.ts              Sintetizzatore di effetti sonori WebAudio (singleton sfx)
├── ui.ts                 Stile testi condiviso + sfondo (cielo, nuvole, colline parallasse)
└── scenes/
    ├── BootScene.ts      Genera le texture e passa al menu
    ├── MenuScene.ts      Titolo, record, "tocca per giocare"
    ├── GameScene.ts      Loop di gioco: fisica, collisioni, spawn, HUD, morte
    └── GameOverScene.ts  Overlay con punteggio/record e pulsanti Rigioca/Menu
```

### Concetti chiave in `GameScene`

- **Coordinate mondo**: il carrello avanza in coordinate assolute (`cartX`
  cresce all'infinito); la camera lo segue con offset fisso `CART_SCREEN_X`.
  Niente viene "mosso indietro": si muove solo la camera.
- **Fisica manuale**: non si usa Arcade Physics. Quando è a terra il carrello
  segue la quota del binario (`track.heightAt(x)`); in aria si applica gravità
  con velocità di caduta massima.
- **Atterraggio vs schianto**: atterrando, se il carrello supera la superficie
  di poco (entro una tolleranza proporzionale alla velocità di caduta) si
  aggancia al binario; se è molto sotto la superficie significa che ha colpito
  la parete → schianto.
- **Collisioni**: AABB manuali contro le liste `coinsGroup` e `obstacles`
  (poche decine di entità attive, nessun bisogno di spatial hashing).
- **Ciclo di vita delle entità**: monete/ostacoli vengono distrutti quando
  escono a sinistra dello schermo; i segmenti di binario vengono potati con
  `track.prune()`.

## 4. Fisica e bilanciamento

Tutti i parametri sono in [`src/constants.ts`](src/constants.ts) (unità: pixel
e secondi):

| Costante | Valore | Significato |
| --- | --- | --- |
| `GRAVITY` | 2600 | Accelerazione verso il basso in aria |
| `JUMP_VELOCITY` | 950 | Velocità verticale del salto singolo |
| `DOUBLE_JUMP_VELOCITY` | 850 | Velocità del doppio salto |
| `MAX_FALL_SPEED` | 1700 | Velocità di caduta terminale |
| `BASE_SPEED` | 330 | Velocità orizzontale iniziale |
| `MAX_SPEED` | 720 | Velocità orizzontale massima |
| `SPEED_PER_PX` | 0.013 | Incremento di velocità per pixel percorso |
| `TRACK_MIN_Y` / `TRACK_MAX_Y` | 210 / 470 | Fascia verticale dei binari |
| `DEATH_Y` | 700 | Sotto questa quota si è caduti nel vuoto |

Relazioni utili per il tuning:

- **Tempo di volo** del salto singolo ≈ `2·JUMP_VELOCITY / GRAVITY` ≈ 0,73 s.
- **Gittata** del salto ≈ `velocità · tempo di volo` (funzione `jumpRange()`).
  Il generatore la usa per dimensionare le voragini, quindi restano sempre
  superabili anche cambiando gravità o forza del salto.
- **Altezza massima** del salto ≈ `JUMP_VELOCITY² / (2·GRAVITY)` ≈ 173 px:
  per questo il dislivello massimo in salita dopo una voragine è 130 px.
- La velocità massima si raggiunge dopo `(MAX_SPEED − BASE_SPEED) / SPEED_PER_PX`
  = 30 000 px, circa 60–70 secondi di gioco.

Per rendere il gioco **più facile**: abbassa `SPEED_PER_PX` e `MAX_SPEED`,
oppure riduci il fattore di lunghezza delle voragini in `Track.generateGap`.
Per renderlo **più difficile**: aumenta la probabilità di barriere in
`GameScene.spawnObstacle`.

### Probabilità di spawn (in `GameScene.populateChunk`)

| Cosa | Quando | Probabilità |
| --- | --- | --- |
| Fila di monete (5–8) | Su ogni tratto pieno dopo x > 900 | 70 % |
| Arco di monete | Sopra ogni voragine | 80 % |
| Ostacolo/power-up | Tratti pieni dopo x > 1600 | 60 % |
| — di cui creaturina | | 55 % |
| — di cui barriera | | 27 % |
| — di cui power-up (calamita/scudo 50-50) | | 18 % |

## 5. Generazione procedurale del percorso

Implementata in [`src/track.ts`](src/track.ts). Il percorso è una lista di
**segmenti rettilinei** `{x0, x1, y0, y1}` (anche in pendenza); dove non c'è
nessun segmento c'è una **voragine**.

Algoritmo (chiamato ogni frame con `ensure(cameraX + larghezza + 1000)`):

1. **Tratto pieno** (55 %, e sempre nei primi 1500 px): 2–4 sotto-segmenti di
   180–340 px con dislivello casuale ±70 px, quota limitata alla fascia
   `TRACK_MIN_Y`–`TRACK_MAX_Y`. Crea l'ondulazione da montagne russe.
2. **Voragine** (45 %): larghezza = `jumpRange(velocità corrente) × fattore`,
   con fattore 0,38–0,60 se il binario di arrivo è pari o più basso, 0,30–0,42
   se è più alto (serve il doppio salto). Il dislivello di arrivo è scelto tra
   {−130, −70, 0, +60, +130}. Segue sempre un tratto piano di atterraggio di
   320–520 px.

Ogni chunk generato emette un evento (`run` o `gap`) che `GameScene` usa per
piazzare monete, ostacoli e power-up **dopo** che i segmenti esistono, così le
posizioni possono essere calcolate con `heightAt(x)`.

Il disegno dei binari (rotaie doppie, traversine, piloni fino a fondo schermo)
avviene ridisegnando una `Graphics` ogni frame, limitatamente all'intervallo
visibile: è economico e non richiede texture.

## 6. Grafica e audio

### Texture procedurali (`src/textures.ts`)

Alla partenza `BootScene` genera in memoria tutte le texture con
`Graphics.generateTexture()`: carrello con passeggero, moneta, barriera,
creaturina, calamita, scudo, particella, nuvola e due strati di colline
*tileabili* (le sinusoidi hanno periodo che divide la larghezza della texture).

Per **sostituire la grafica con asset veri**: carica le immagini in una
`preload()` di `BootScene` (`this.load.image('cart', 'assets/cart.png')` ecc.)
e rimuovi la generazione corrispondente; le chiavi delle texture restano le
stesse, il resto del codice non cambia.

### Sfondo e parallasse (`src/ui.ts`)

Cielo a due fasce + nuvole vaganti + due `TileSprite` di colline con
`tilePositionX` proporzionale allo scroll (0,12× e 0,28×) per l'effetto
profondità.

### Audio (`src/audio.ts`)

Ogni effetto è uno o più oscillatori WebAudio con inviluppo esponenziale
(salto, doppio salto, moneta, schianto, power-up, click). Su mobile l'audio
parte solo dopo un gesto dell'utente: `sfx.unlock()` è chiamato al primo tocco.
Per aggiungere **musica di sottofondo** conviene invece un file audio caricato
con il loader di Phaser (`this.load.audio`) e riprodotto in loop.

## 7. Workflow di sviluppo

```bash
npm install            # una tantum
npm run dev            # dev server con hot-reload su http://localhost:5173
npm run build          # type-check (tsc --noEmit) + build produzione in dist/
npm run preview        # serve la build di produzione
npm run cap:sync       # build + copia dist/ nei progetti nativi (fa 'cap sync')
```

Regola d'oro: **dopo ogni modifica al codice web, esegui `npm run cap:sync`**
prima di rilanciare l'app nativa, altrimenti la WebView continua a usare la
copia vecchia di `dist/`.

File di configurazione principali:

| File | Cosa contiene |
| --- | --- |
| `capacitor.config.json` | `appId`, `appName`, `webDir`, colore di sfondo |
| `vite.config.ts` | `base: './'` (obbligatorio: Capacitor carica da `file://`) |
| `android/app/src/main/AndroidManifest.xml` | Orientamento `sensorLandscape` |
| `ios/App/App/Info.plist` | Orientamenti solo landscape |

## 8. Build e distribuzione Android

Requisiti: Android Studio (include SDK e JDK).

```bash
npm run cap:sync
npx cap open android      # apre Android Studio → Run ▶
# oppure da CLI:
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Per il **rilascio su Play Store**:

1. Cambia `appId` in `capacitor.config.json` (es. `com.tuodominio.tuogioco`) —
   fallo *prima* possibile: cambiare l'application id dopo richiede di
   aggiornare anche il package in `android/app/build.gradle` e la cartella
   `android/app/src/main/java/...`.
2. Genera una keystore di firma:
   `keytool -genkey -v -keystore release.keystore -alias tuogioco -keyalg RSA -keysize 2048 -validity 10000`
   e **conservala**: senza non potrai più aggiornare l'app.
3. Configura la firma in `android/app/build.gradle` (blocco `signingConfigs`).
4. Genera l'App Bundle: `cd android && ./gradlew bundleRelease`
   (output in `android/app/build/outputs/bundle/release/app-release.aab`).
5. Carica l'AAB nella Play Console (account sviluppatore: 25 $ una tantum).

## 9. Build e distribuzione iOS

Requisiti: **Mac** con Xcode (Capacitor 8 usa Swift Package Manager, non serve
CocoaPods).

```bash
npm run cap:sync
npx cap open ios          # apre Xcode
```

In Xcode:

1. Seleziona il target **App** → *Signing & Capabilities* → scegli il tuo team
   (serve un account [Apple Developer](https://developer.apple.com), 99 $/anno
   per pubblicare; per provare su un tuo device basta l'account gratuito).
2. Cambia il *Bundle Identifier* in modo che combaci con l'`appId`.
3. Run ▶ su simulatore o device.
4. Per l'App Store: *Product → Archive* → *Distribute App* → App Store Connect,
   poi completa la scheda su [App Store Connect](https://appstoreconnect.apple.com).

## 10. Checklist prima della pubblicazione

- [ ] Nome definitivo del gioco (non "Madcoaster", vedi [note legali](#14-note-legali))
- [ ] `appId` e `appName` in `capacitor.config.json` + bundle id iOS + application id Android
- [ ] Icona app: sostituisci le risorse in `android/app/src/main/res/mipmap-*` e
      in `ios/App/App/Assets.xcassets/AppIcon.appiconset` (comodo:
      `npx @capacitor/assets generate` partendo da un `icon.png` 1024×1024)
- [ ] Splash screen (stesso tool, da `splash.png` 2732×2732)
- [ ] Versioning: `versionCode`/`versionName` in `android/app/build.gradle`,
      `MARKETING_VERSION` in Xcode
- [ ] Privacy policy (obbligatoria su entrambi gli store anche senza raccolta dati)
- [ ] Screenshot e testi per le schede store
- [ ] Test su device reali (prestazioni, notch/safe area, audio dopo il primo tocco)
- [ ] Eventuale integrazione ads/IAP/analytics (plugin Capacitor dedicati)

## 11. Test automatici

Gli script in `scripts/` guidano Chrome headless con `puppeteer-core`
(richiedono Chrome installato):

```bash
npm run build
npx vite preview --port 4173 &      # server per i test
node scripts/smoke-test.mjs         # partita ~35 s: menu → salti → game over; fallisce se ci sono errori JS
node scripts/retry-test.mjs         # game over → RIGIOCA → nuova partita pulita
```

Entrambi salvano screenshot in `$SHOTS_DIR` (default `/tmp/shots`) e terminano
con exit code ≠ 0 se la pagina genera errori JavaScript.

## 12. Risoluzione problemi

| Problema | Causa/Soluzione |
| --- | --- |
| Schermo bianco nell'app nativa | `dist/` non sincronizzato: esegui `npm run cap:sync`. Verifica anche `base: './'` in `vite.config.ts` |
| Niente audio su iOS/Android | Normale prima del primo tocco (politiche autoplay). `sfx.unlock()` è già chiamato a ogni pointerdown |
| Il gioco non ruota in landscape | Controlla `sensorLandscape` nell'AndroidManifest e gli orientamenti nell'Info.plist |
| `cap add`/`cap sync` fallisce leggendo il config | Usare `capacitor.config.json` (non `.ts`): è già così in questo progetto |
| Record/monete non salvati | Su WebView il `localStorage` persiste; viene azzerato solo disinstallando l'app o pulendo i dati |
| Prestazioni basse su device vecchi | Riduci le particelle (`burst.explode`), le nuvole, o passa a `type: Phaser.CANVAS` in `main.ts` |

## 13. Roadmap / idee di sviluppo

- **Missioni/obiettivi** (come l'originale): "travolgi 10 creaturine in una
  partita", "percorri 5000 m", con ricompense in monete.
- **Negozio**: spendere le monete totali (già persistite) per skin del
  carrello o potenziamenti permanenti.
- **Più power-up**: razzo (volo temporaneo), moltiplicatore ×2, testa d'ariete
  (distrugge le barriere per qualche secondo).
- **Temi/biomi** che cambiano con la distanza (notte, neve, deserto): basta
  parametrizzare i colori in `textures.ts` e `ui.ts`.
- **Musica di sottofondo** in loop + toggle audio nel menu.
- **Game Center / Play Games** per le classifiche (plugin Capacitor).
- **Juice**: scie dietro il carrello, slow-motion alla morte, combo per
  creaturine consecutive.
- **Localizzazione** (i testi sono pochi e centralizzati nelle scene).

## 14. Note legali

- Le **meccaniche di gioco non sono protette** da copyright: un endless runner
  su montagne russe con salto e monete è liberamente realizzabile.
- Sono invece protetti **nome, logo, grafica, musiche e testi** di Madcoaster:
  non vanno copiati né imitati al punto da creare confusione.
- Questo progetto è pulito: tutti gli asset sono generati da codice originale.
- Prima di pubblicare scegli un **nome originale** ("TurboCoaster" è un
  segnaposto: verifica che non sia già registrato/usato sugli store) e non
  citare Madcoaster nelle schede store.
