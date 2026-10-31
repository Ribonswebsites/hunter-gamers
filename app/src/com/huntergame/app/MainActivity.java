package com.huntergame.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import java.io.InputStream;

/** Native WebView wrapper: serves the bundled site from assets/www at https://appassets.local/ */
public class MainActivity extends Activity {
  static final String HOST = "appassets.local";
  WebView web;
  ValueCallback<Uri[]> fileCb;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    web = new WebView(this);
    setContentView(web);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setUserAgentString(s.getUserAgentString() + " HunterGameApp/1.0");
    web.setBackgroundColor(0xFF0B0809);
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
        if (HOST.equals(u.getHost())) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
        return true; // tel:, mailto:, upi:, maps and external sites open outside the app
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
    if (b != null) web.restoreState(b); else web.loadUrl("https://" + HOST + "/index.html");
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
