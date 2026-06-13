# EndoDeck

Lokalny panel makr dla telefonu z Androidem, komunikujący się z Windows wyłącznie przez USB i `adb reverse`.

## Start

```powershell
.\scripts\start-endodeck.ps1
```

Serwer automatycznie wykrywa telefon, tworzy tunel `tcp:8765` i uruchamia aplikację kioskową. Układ oraz akcje edytuje się w `config.json`; zmiany są odczytywane bez restartu serwera po następnym żądaniu.

Jednorazowa instalacja aplikacji na podłączonym telefonie:

```powershell
.\scripts\build-android.ps1
.\scripts\install-phone.ps1
```

Automatyczny start razem z Windows:

```powershell
.\scripts\install-autostart.ps1
```

## Obsługiwane akcje

- `hotkey`: kombinacja klawiszy Windows, np. `["CTRL", "SHIFT", "M"]`
- `media`: `playPause`, `next`, `previous`, `volumeUp`, `volumeDown`, `volumeMute`
- `launch`: uruchomienie programu
- `command`: uruchomienie programu z argumentami i oczekiwanie na wynik
- `sequence`: wykonanie kilku akcji po kolei, np. otwarcie edytora, terminala i Discorda
- `page`: przejście do innej strony przycisków

Komendy są lokalne i pochodzą wyłącznie z pliku `config.json` na komputerze.

Mała zębatka w prawym górnym rogu otwiera edytor. Pozwala zmieniać nazwę, opis, ikonę, kolor i akcję każdego przycisku bez ręcznego edytowania JSON-a.

## Mikser audio

Przycisk `MIKSER` otwiera sterowanie Windows Core Audio. Górny suwak zmienia głośność całego systemu, a niżej pojawiają się osobne suwaki dla aplikacji mających aktywną sesję dźwiękową, np. Discorda, Spotify, przeglądarki lub gry. Lista odświeża się automatycznie co kilka sekund.

Aplikacja pojawi się w mikserze po uruchomieniu odtwarzania albo wygenerowaniu przez nią dźwięku. Zmiana poziomu jest wykonywana lokalnie na komputerze i nie wymaga dodatkowego sterownika audio.

## Obudowa 3D

Gotowe modele są w katalogu `dist`:

- `EndoDeck-P8Lite-Front-Bezel.stl` – przednia maskownica pokazująca tylko ekran
- `EndoDeck-P8Lite-Rear-Stand.stl` – tylna pokrywa, wentylacja i nogi biurkowe

Telefon jest zamknięty i dociskany pomiędzy częściami skręconymi czterema śrubami M3 × 10 mm. Parametry modelu, piankę dociskową i ustawienia druku opisuje `enclosure/README.md`.
