# Hunter Gamers

## 📲 Download APK

**[⬇ Download hunter-game.apk (latest build)](https://github.com/Ribonswebsites/hunter-gamers/releases/download/latest/hunter-game.apk)** · [v1.0 release](https://github.com/Ribonswebsites/hunter-gamers/releases/tag/v1.0) · [All releases](https://github.com/Ribonswebsites/hunter-gamers/releases)

Also on the website: https://hunter-gamers.pages.dev/downloads/hunter-game.apk — on Android, allow "Install unknown apps" when asked.

---

PS5 / PS4 pay-by-the-hour gaming shop site for Hunter Gamers, Indora, Nagpur.

- Live site: https://hunter-gamers.pages.dev (Cloudflare Pages)
- `index.html`, `hg.css`, `hg.js`, `img/` – the website
- `app/` – native Android WebView app (`com.huntergame.app`) that bundles the site; `app/build.sh` builds it without Gradle
- `.github/workflows/android.yml` – builds + signs the APK on every push to `main`, uploads an artifact and updates the `latest` release
- Image credits: `img/SOURCES.md`
