package com.huntergame.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** Minimal FileProvider: exposes only the downloaded update APK to the package installer. */
public class ApkProvider extends ContentProvider {
  public static final String AUTH = "com.huntergame.app.apk";
  static File file(android.content.Context c) { return new File(new File(c.getCacheDir(), "update"), "hunter-game-update.apk"); }
  public static Uri uri() { return Uri.parse("content://" + AUTH + "/hunter-game-update.apk"); }
  @Override public boolean onCreate() { return true; }
  @Override public String getType(Uri u) { return "application/vnd.android.package-archive"; }
  @Override public ParcelFileDescriptor openFile(Uri u, String mode) throws FileNotFoundException {
    if (!"hunter-game-update.apk".equals(u.getLastPathSegment())) throw new FileNotFoundException();
    return ParcelFileDescriptor.open(file(getContext()), ParcelFileDescriptor.MODE_READ_ONLY);
  }
  @Override public Cursor query(Uri u, String[] p, String s, String[] a, String o) {
    File f = file(getContext()); MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
    c.addRow(new Object[]{f.getName(), f.length()}); return c;
  }
  @Override public Uri insert(Uri u, ContentValues v) { return null; }
  @Override public int delete(Uri u, String s, String[] a) { return 0; }
  @Override public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }
}
