# TurboCoaster

Endless runner arcade in stile *Madcoaster* (2015): guidi un carrello delle montagne russe
che accelera all'infinito, salti tra binari a quote diverse, raccogli monete, travolgi
creaturine per punti bonus ed eviti barriere e voragini.

Un unico codice TypeScript ([Phaser 3](https://phaser.io)) gira su **iOS**, **Android**
(tramite [Capacitor](https://capacitorjs.com)) e nel browser.

> **Nota legale** — Questo progetto riprende solo le *meccaniche* di gioco, che non sono
> protette da copyright. Tutta la grafica è generata proceduralmente da codice, gli effetti
> sonori sono sintetizzati via WebAudio e il nome è provvisorio: prima di pubblicare
> sostituisci `appId`, `appName` (in `capacitor.config.json`) e il titolo con il tuo brand.
> Non usare nome, loghi o asset del gioco originale.

## Gameplay

- **Tocca** per saltare, **tocca di nuovo in aria** per il doppio salto
  (su desktop anche barra spaziatrice / freccia su).
- La velocità cresce con la distanza percorsa.
- **Monete** = +10 punti l'una; le **creaturine** travolte valgono +50.
- **Barriere**: ti schianti, a meno che tu non abbia lo **scudo**.
- **Calamita**: attira le monete per 8 secondi.
- Cadere in una voragine o schiantarsi contro la parete di un binario più alto = game over.
- Record e monete totali vengono salvati sul dispositivo.

## Sviluppo

```bash
npm install
npm run dev        # server di sviluppo su http://localhost:5173
npm run build      # type-check + build di produzione in dist/
```

## Build Android

Requisiti: [Android Studio](https://developer.android.com/studio) (con SDK e JDK inclusi).

```bash
npm run cap:sync       # build web + sync nel progetto nativo
npx cap open android   # apre Android Studio: da lì Run ▶ su device/emulatore
```

In alternativa, da riga di comando: `cd android && ./gradlew assembleDebug`
(APK in `android/app/build/outputs/apk/debug/`).

## Build iOS

Requisiti: un Mac con Xcode e CocoaPods/SwiftPM (Capacitor 8 usa Swift Package Manager).

```bash
npm run cap:sync   # build web + sync nel progetto nativo
npx cap open ios   # apre Xcode: seleziona il team di firma e Run ▶
```

Per pubblicare su App Store / Play Store segui la normale procedura di firma e upload
delle rispettive piattaforme.

## Struttura del progetto

| Percorso | Contenuto |
| --- | --- |
| `src/constants.ts` | Parametri di gioco (fisica, velocità, punteggi) |
| `src/track.ts` | Generazione procedurale dei binari (tratti, pendenze, voragini) |
| `src/textures.ts` | Grafica generata a runtime (nessun file immagine) |
| `src/audio.ts` | Effetti sonori sintetizzati con WebAudio |
| `src/scenes/` | Scene: Boot, Menu, Game, GameOver |
| `android/`, `ios/` | Progetti nativi Capacitor |
| `scripts/` | Test automatici headless (richiedono Chrome) |

## Test automatici

```bash
npm run build
npx vite preview --port 4173 &
node scripts/smoke-test.mjs   # gioca una partita e verifica l'assenza di errori JS
node scripts/retry-test.mjs   # verifica il flusso game over -> rigioca
```

## Tuning del gameplay

Quasi tutto il bilanciamento è in `src/constants.ts`: gravità, forza dei salti,
velocità di base/massima e curva di accelerazione. Le probabilità di spawn di monete,
ostacoli e power-up sono in `GameScene.populateChunk`, la forma del percorso in
`src/track.ts`.
