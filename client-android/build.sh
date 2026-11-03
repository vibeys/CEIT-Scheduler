#!/bin/sh
# Builds the Android app (apk) WITHOUT Gradle or Android Studio.
# Needs (Ubuntu/Debian):  sudo apt install default-jdk-headless aapt apksigner zipalign dalvik-exchange android-sdk-platform-23
# Result: ../apk/CEIT-Scheduler.apk
set -e
cd "$(dirname "$0")"
OUT=build
ANDROID_JAR="${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}"
DX="${DX:-dalvik-exchange}"
rm -rf "$OUT"; mkdir -p "$OUT/classes" "$OUT/dex" ../apk

echo "1/6 compile";        javac --release 8 -encoding UTF-8 -Xlint:-options -classpath "$ANDROID_JAR" -d "$OUT/classes" src/com/ceit/scheduler/*.java
echo "2/6 dex";            "$DX" --dex --min-sdk-version=23 --output="$OUT/dex/classes.dex" "$OUT/classes"
echo "3/6 resources";      aapt package -f -M AndroidManifest.xml -S res -A assets -I "$ANDROID_JAR" \
                             --min-sdk-version 23 --target-sdk-version 34 --version-code 1 --version-name 1.0.0 -F "$OUT/unsigned.apk"
echo "4/6 add code";       (cd "$OUT/dex" && aapt add -f ../unsigned.apk classes.dex >/dev/null)
echo "5/6 align";          zipalign -f -p 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"
echo "6/6 sign";
if [ ! -f ceit-release.keystore ]; then
  keytool -genkeypair -keystore ceit-release.keystore -alias ceit -keyalg RSA -keysize 2048 -validity 36500 \
    -storepass ceit-scheduler -keypass ceit-scheduler -dname "CN=CEIT Scheduler, O=CEIT, C=PH" >/dev/null 2>&1
fi
apksigner sign --ks ceit-release.keystore --ks-key-alias ceit --ks-pass pass:ceit-scheduler --key-pass pass:ceit-scheduler \
  --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out ../apk/CEIT-Scheduler.apk "$OUT/aligned.apk"
apksigner verify --verbose ../apk/CEIT-Scheduler.apk | head -8
rm -rf "$OUT"
echo "Done: ../apk/CEIT-Scheduler.apk"
