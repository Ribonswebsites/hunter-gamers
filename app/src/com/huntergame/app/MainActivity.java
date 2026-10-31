package com.huntergame.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.webkit.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Native WebView wrapper. Loads the LIVE site so every web deploy shows instantly;
 * falls back to the bundled copy (assets/www at https://appassets.local/) when offline.
 * Also checks /version.json for a newer APK and installs it in-app.
 */
public class MainActivity extends Activity {
  static final String HOST = "appassets.local";
  static final String LIVE_HOST = "hunter-gamers.pages.dev";
  static final String LIVE = "https://" + LIVE_HOST + "/";
  static final String VERSION_URL = LIVE + "version.json";
  static final long RESUME_GAP = 3L * 60 * 60 * 1000; // resume checks at most every 3 hours
  WebView web;
  ValueCallback<Uri[]> fileCb;
  boolean pageReady, offline, pendingInstall, downloading;
  UpdateInfo pending;
  final Handler ui = new Handler(Looper.getMainLooper());
  SharedPreferences prefs;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    prefs = getSharedPreferences("hg", MODE_PRIVATE);
    web = new WebView(this);
    setContentView(web);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setCacheMode(WebSettings.LOAD_DEFAULT); // honours Cache-Control: index/js/css are no-cache on the site
    s.setUserAgentString(s.getUserAgentString() + " HunterGameApp/" + versionName() + " (" + versionCode() + ")");
    web.setBackgroundColor(0xFF0B0809);
    web.addJavascriptInterface(new Bridge(), "HGApp");
    web.setWebViewClient(new WebViewClient() {
      @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
        Uri u = r.getUrl();
        if (!HOST.equals(u.getHost())) return null;
        String p = u.getPath();
        if (p == null || p.equals("/") || p.isEmpty()) p = "/index.html";
        try {
          InputStream in = getAssets().open("www" + p);
          return new WebResourceResponse(mime(p), "utf-8", in);
        } catch (Exception e) { return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null); }
      }
      @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
        Uri u = r.getUrl();
        if (HOST.equals(u.getHost()) || LIVE_HOST.equals(u.getHost())) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
        return true; // tel:, mailto:, upi:, maps and external sites open outside the app
      }
      @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
        if (r.isForMainFrame() && LIVE_HOST.equals(r.getUrl().getHost())) loadBundled();
      }
      @Override public void onReceivedHttpError(WebView v, WebResourceRequest r, WebResourceResponse res) {
        if (r.isForMainFrame() && LIVE_HOST.equals(r.getUrl().getHost()) && res.getStatusCode() >= 500) loadBundled();
      }
      @Override public void onPageFinished(WebView v, String url) {
        pageReady = true;
        if (pending != null && !downloading) offerUpdate(pending);
      }
    });
    web.setWebChromeClient(new WebChromeClient() {
      @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
        if (fileCb != null) fileCb.onReceiveValue(null);
        fileCb = cb;
        try { startActivityForResult(p.createIntent(), 7); } catch (Exception e) { fileCb = null; return false; }
        return true;
      }
    });
    if (b != null) web.restoreState(b);
    else if (online()) web.loadUrl(LIVE);
    else loadBundled();
    checkForUpdate(true);
  }

  void loadBundled() { if (offline) return; offline = true; pageReady = false; web.loadUrl("https://" + HOST + "/index.html"); }

  boolean online() {
    try { NetworkInfo n = ((ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE)).getActiveNetworkInfo(); return n != null && n.isConnected(); }
    catch (Exception e) { return true; }
  }

  int versionCode() { try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionCode; } catch (Exception e) { return 0; } }
  String versionName() { try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return "?"; } }

  /* ---------- Update check ---------- */
  void checkForUpdate(final boolean launch) {
    final long now = System.currentTimeMillis();
    if (downloading || !UpdateInfo.shouldCheck(launch, prefs.getLong("lastCheck", 0), now, RESUME_GAP)) return;
    prefs.edit().putLong("lastCheck", now).apply();
    new Thread(new Runnable() { public void run() {
      try {
        HttpURLConnection c = (HttpURLConnection) new URL(VERSION_URL + "?t=" + now).openConnection();
        c.setUseCaches(false); c.setConnectTimeout(8000); c.setReadTimeout(8000);
        c.setRequestProperty("Cache-Control", "no-cache");
        if (c.getResponseCode() != 200) return;
        BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), "UTF-8"));
        StringBuilder sb = new StringBuilder(); String l; while ((l = r.readLine()) != null) sb.append(l).append('\n'); r.close();
        final UpdateInfo i = UpdateInfo.parse(sb.toString());
        if (!UpdateInfo.isNewer(i, versionCode())) return;
        if (i.versionCode == prefs.getInt("snoozed", 0) && !launch) return; // "Later" hides it until next launch
        ui.post(new Runnable() { public void run() { pending = i; if (pageReady) offerUpdate(i); } });
      } catch (Exception ignored) {}
    } }).start();
  }

  void offerUpdate(UpdateInfo i) {
    js("(function(v,n,k){var f=function(){if(window.HGUpdate&&!document.querySelector('.hg-upd')){window.HGUpdate(v,n)}else if(!window.HGUpdate&&k++<20)setTimeout(f,500)};f()})(" + jsonStr(i.versionName) + "," + jsonStr(i.notes) + ",0)");
  }

  void js(final String code) { ui.post(new Runnable() { public void run() { if (web != null) web.evaluateJavascript(code, null); } }); }
  static String jsonStr(String s) {
    StringBuilder b = new StringBuilder("\"");
    for (char ch : (s == null ? "" : s).toCharArray()) {
      if (ch == '"' || ch == '\\') b.append('\\').append(ch);
      else if (ch < 0x20 || ch == 0x2028 || ch == 0x2029 || ch == '<') b.append(String.format("\\u%04x", (int) ch));
      else b.append(ch);
    }
    return b.append('"').toString();
  }

  class Bridge {
    @JavascriptInterface public int versionCode() { return MainActivity.this.versionCode(); }
    @JavascriptInterface public String versionName() { return MainActivity.this.versionName(); }
    @JavascriptInterface public void later() { if (pending != null) prefs.edit().putInt("snoozed", pending.versionCode).apply(); }
    @JavascriptInterface public void startUpdate() { ui.post(new Runnable() { public void run() { download(); } }); }
  }

  void download() {
    final UpdateInfo i = pending;
    if (i == null || downloading) return;
    downloading = true;
    new Thread(new Runnable() { public void run() {
      File f = ApkProvider.file(MainActivity.this);
      try {
        f.getParentFile().mkdirs();
        File tmp = new File(f.getParentFile(), "part.apk");
        HttpURLConnection c = (HttpURLConnection) new URL(i.apkUrl + (i.apkUrl.contains("?") ? "&" : "?") + "v=" + i.versionCode).openConnection();
        c.setUseCaches(false); c.setInstanceFollowRedirects(true); c.setConnectTimeout(15000); c.setReadTimeout(30000);
        if (c.getResponseCode() != 200) throw new IOException("HTTP " + c.getResponseCode());
        long total = c.getContentLength(), got = 0; int last = -1;
        InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(tmp);
        byte[] buf = new byte[64 * 1024]; int n;
        while ((n = in.read(buf)) > 0) {
          out.write(buf, 0, n); got += n;
          int pct = total > 0 ? (int) (got * 100 / total) : -1;
          if (pct != last) { last = pct; js("window.HGUpdateProgress&&HGUpdateProgress(" + pct + ",'downloading')"); }
        }
        out.close(); in.close();
        if (total > 0 && got != total) throw new IOException("incomplete");
        if (f.exists()) f.delete();
        if (!tmp.renameTo(f)) throw new IOException("rename");
        js("window.HGUpdateProgress&&HGUpdateProgress(100,'installing')");
        ui.post(new Runnable() { public void run() { downloading = false; install(); } });
      } catch (Exception e) {
        js("window.HGUpdateProgress&&HGUpdateProgress(-1,'error')");
        ui.post(new Runnable() { public void run() { downloading = false; } });
      }
    } }).start();
  }

  void install() {
    if (Build.VERSION.SDK_INT >= 26 && !getPackageManager().canRequestPackageInstalls()) {
      pendingInstall = true; // continue in onResume once "Install unknown apps" is allowed
      js("window.HGUpdateProgress&&HGUpdateProgress(100,'permission')");
      try { startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()))); } catch (Exception ignored) {}
      return;
    }
    pendingInstall = false;
    Intent it = new Intent(Intent.ACTION_VIEW);
    it.setDataAndType(ApkProvider.uri(), "application/vnd.android.package-archive");
    it.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
    try { startActivity(it); } catch (Exception e) { js("window.HGUpdateProgress&&HGUpdateProgress(-1,'error')"); }
  }

  @Override protected void onResume() {
    super.onResume();
    if (pendingInstall) {
      if (Build.VERSION.SDK_INT < 26 || getPackageManager().canRequestPackageInstalls()) install();
      else { pendingInstall = false; js("window.HGUpdateProgress&&HGUpdateProgress(-1,'denied')"); }
    } else if (prefs != null) checkForUpdate(false);
  }

  static String mime(String p) {
    if (p.endsWith(".html")) return "text/html";
    if (p.endsWith(".css")) return "text/css";
    if (p.endsWith(".js")) return "application/javascript";
    if (p.endsWith(".webp")) return "image/webp";
    if (p.endsWith(".png")) return "image/png";
    if (p.endsWith(".jpg")) return "image/jpeg";
    if (p.endsWith(".ico")) return "image/x-icon";
    if (p.endsWith(".webmanifest") || p.endsWith(".json")) return "application/json";
    return "application/octet-stream";
  }

  @Override protected void onActivityResult(int req, int res, Intent data) {
    if (req == 7 && fileCb != null) { fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data)); fileCb = null; }
    else super.onActivityResult(req, res, data);
  }
  @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }
  @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
