package com.huntergame.app;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Parses /version.json and decides whether an update applies. Pure Java so it can be unit-tested on a JVM. */
public final class UpdateInfo {
  public final int versionCode; public final String versionName, apkUrl, notes;
  UpdateInfo(int c, String n, String u, String no) { versionCode = c; versionName = n; apkUrl = u; notes = no; }

  static String str(String json, String key) {
    Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"").matcher(json);
    return m.find() ? m.group(1).replace("\\\"", "\"").replace("\\/", "/").replace("\\n", "\n").replace("\\\\", "\\") : null;
  }
  static int num(String json, String key) {
    Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*(\\d+)").matcher(json);
    return m.find() ? Integer.parseInt(m.group(1)) : -1;
  }
  /** Returns null when the JSON is unusable (missing code, or apkUrl not https). */
  public static UpdateInfo parse(String json) {
    if (json == null) return null;
    int c = num(json, "versionCode"); String u = str(json, "apkUrl");
    if (c < 1 || u == null || !u.startsWith("https://")) return null;
    String n = str(json, "versionName"), no = str(json, "notes");
    return new UpdateInfo(c, n == null ? String.valueOf(c) : n, u, no == null ? "" : no);
  }
  public static boolean isNewer(UpdateInfo i, int installed) { return i != null && i.versionCode > installed; }
  /** Resume checks are throttled; launch checks always run. */
  public static boolean shouldCheck(boolean launch, long lastMs, long nowMs, long minGapMs) { return launch || nowMs - lastMs >= minGapMs || nowMs < lastMs; }
}
