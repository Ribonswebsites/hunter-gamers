#!/bin/bash
# Builds Hunter Game WebView APK without Gradle: aapt2 + javac + d8 + apksigner.
set -euo pipefail
cd "$(dirname "$0")"
SDK=${ANDROID_SDK:-/workspace/android-sdk}; BT=$SDK/build-tools/35.0.0; PLAT=$SDK/platforms/android-35/android.jar
export JAVA_HOME=${JAVA_HOME:-/workspace/jdk17}; export PATH=$JAVA_HOME/bin:$PATH
rm -rf build && mkdir -p build/res build/classes build/assets/www
# bundle the site
cp ../index.html ../hg.css ../hg.js ../favicon.ico ../favicon-32.png ../apple-touch-icon.png ../site.webmanifest build/assets/www/
cp -r ../img build/assets/www/
$BT/aapt2 compile --dir res -o build/res.zip
$BT/aapt2 link -o build/unsigned.apk -I $PLAT --manifest AndroidManifest.xml -A build/assets build/res.zip --java build/gen --min-sdk-version 24 --target-sdk-version 35
javac -source 8 -target 8 -nowarn -cp $PLAT -d build/classes $(find src build/gen -name '*.java') 2>&1 | grep -v 'bootstrap\|warning' || true
$BT/d8 --lib $PLAT --min-api 24 --output build $(find build/classes -name '*.class')
python3 -c "import zipfile;zipfile.ZipFile('build/unsigned.apk','a').write('build/classes.dex','classes.dex')"
$BT/zipalign -f 4 build/unsigned.apk build/aligned.apk
[ -f hunter-game.keystore ] || keytool -genkeypair -keystore hunter-game.keystore -alias huntergame -keyalg RSA -keysize 2048 -validity 10000 -storepass huntergame -keypass huntergame -dname "CN=Hunter Game, L=Nagpur, C=IN"
$BT/apksigner sign --ks hunter-game.keystore --ks-pass pass:huntergame --out build/hunter-game.apk build/aligned.apk
mkdir -p ../downloads && cp build/hunter-game.apk ../downloads/hunter-game.apk
echo "APK: $(ls -la ../downloads/hunter-game.apk)"
