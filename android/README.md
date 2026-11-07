# Android-оболочка (Google Play)

Приложение для Google Play — Trusted Web Activity (TWA): тот же сайт POLSKI GO в полноэкранной оболочке Android, без адресной строки.
Здесь только конфигурация Bubblewrap (`twa-manifest.json`); проект Android генерируется при сборке и в репозиторий не попадает.
Подробно — `docs/ANDROID_RU.md`. Сборка подписанного пакета — `.github/workflows/android.yml` (вручную) или локально:

```bash
npm i -g @bubblewrap/cli@1.27.0
cd android
bubblewrap update --skipVersionUpgrade
bubblewrap build --skipPwaValidation      # app-release-bundle.aab и app-release-signed.apk
```

Ключ подписи (`polski-go-upload.keystore`) не хранится в репозитории и не создаётся здесь: его создаёт владелец (`docs/ANDROID_RU.md`, шаг 4).
