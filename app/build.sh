#!/bin/bash
# Builds Hunter Game WebView APK without Gradle: aapt2 + javac + d8 + apksigner.
set -euo pipefail
cd "$(dirname "$0")"
SDK=${ANDROID_SDK:-${ANDROID_HOME:-/workspace/android-sdk}}; BT=$SDK/build-tools/35.0.0; PLAT=$SDK/platforms/android-35/android.jar
[ -n "${JAVA_HOME:-}" ] || export JAVA_HOME=/workspace/jdk17; export PATH=$JAVA_HOME/bin:$PATH
rm -rf build && mkdir -p build/res build/classes build/assets/www
# auto-bump version (app/version.properties holds the last released code)
CODE="${CODE:-$(( $(grep -oP "(?<=versionCode=)\d+" version.properties) + 1 ))}"; NAME="${NAME:-2.$(( CODE - 10 ))}"
printf 'versionCode=%s\nversionName=%s\n' "$CODE" "$NAME" > version.properties
sed "s/@@CODE@@/$CODE/; s/@@NAME@@/$NAME/" AndroidManifest.xml > build/AndroidManifest.xml
NOTES=${RELEASE_NOTES:-"New games lineup, faster loading and in-app updates."}
# bundle the site
cp ../index.html ../hg.css ../hg.js ../sw.js ../favicon.ico ../favicon-32.png ../apple-touch-icon.png ../site.webmanifest build/assets/www/
cp -r ../img build/assets/www/
$BT/aapt2 compile --dir res -o build/res.zip
$BT/aapt2 link -o build/unsigned.apk -I $PLAT --manifest build/AndroidManifest.xml -A build/assets build/res.zip --java build/gen --min-sdk-version 24 --target-sdk-version 35
javac -source 8 -target 8 -nowarn -cp $PLAT -d build/classes $(find src build/gen -name '*.java') 2>&1 | grep -v 'bootstrap\|warning' || true
$BT/d8 --lib $PLAT --min-api 24 --output build $(find build/classes -name '*.class')
python3 -c "import zipfile;zipfile.ZipFile('build/unsigned.apk','a').write('build/classes.dex','classes.dex')"
$BT/zipalign -f 4 build/unsigned.apk build/aligned.apk
KS=${KEYSTORE_PATH:-hunter-game.keystore}; KS_PASS=${KEYSTORE_PASSWORD:-huntergame}; KEY_ALIAS=${KEY_ALIAS:-huntergame}; KEY_PASS=${KEY_PASSWORD:-$KS_PASS}
[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 10000 -storepass "$KS_PASS" -keypass "$KEY_PASS" -dname "CN=Hunter Game, L=Nagpur, C=IN"
$BT/apksigner sign --ks "$KS" --ks-key-alias "$KEY_ALIAS" --ks-pass "pass:$KS_PASS" --key-pass "pass:$KEY_PASS" --out build/hunter-game.apk build/aligned.apk
mkdir -p ../downloads && cp build/hunter-game.apk ../downloads/hunter-game.apk
python3 - "$CODE" "$NAME" "$NOTES" <<'PY'
import json,sys
json.dump({"versionCode":int(sys.argv[1]),"versionName":sys.argv[2],"apkUrl":"https://hunter-gamers.pages.dev/downloads/hunter-game.apk","notes":sys.argv[3]},open('../version.json','w'),indent=1)
PY
echo "APK v$NAME ($CODE): $(ls -la ../downloads/hunter-game.apk)"
if [ "${UPLOAD:-0}" = 1 ]; then gh release upload latest ../downloads/hunter-game.apk --clobber -R Ribonswebsites/hunter-gamers && echo "Uploaded to release 'latest'"; fi
