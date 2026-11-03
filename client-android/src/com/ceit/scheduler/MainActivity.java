package com.ceit.scheduler;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * CEIT Scheduler - ANDROID APP (client).
 * No server and no database in this app. It finds the CEIT server on the Wi-Fi / LAN, remembers it,
 * and shows it full-screen. The top bar ("Connected to ... / This device ...") comes from the server's own pages.
 */
public class MainActivity extends Activity {
    private static final String CONNECT = "file:///android_asset/ui/connect.html";
    private static final int PORT = 8484;
    private static final int FILE_REQ = 41;
    private static final Pattern URL_OK = Pattern.compile("^http://[A-Za-z0-9.\\-]+(:[0-9]{1,5})?/?$");
    private static final Pattern CB_OK = Pattern.compile("^[a-z0-9]{1,12}$");

    private WebView web;
    private SharedPreferences prefs;
    private String serverOrigin = "";
    private boolean clearHistory = false;
    private ValueCallback<Uri[]> filePicker;
    private List<ConnectivityManager.NetworkCallback> watchers = new ArrayList<ConnectivityManager.NetworkCallback>();

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        prefs = getSharedPreferences("ceit", MODE_PRIVATE);
        web = new WebView(this);
        setContentView(web);
        setup();
        NetUtil.bindToLan(this);
        watchers = NetUtil.watch(this);
        web.loadUrl(CONNECT);
    }

    private void setup() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);          // only used for the app's own screens (file:///android_asset)
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setUserAgentString(s.getUserAgentString() + " CEITApp/1.0.0 Android");
        WebView.setWebContentsDebuggingEnabled(false);
        web.addJavascriptInterface(new Bridge(), "__ceitAndroid");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                if (url.startsWith("file:///android_asset/ui/")) return false;
                if (serverOrigin.length() > 0 && (url.equals(serverOrigin) || url.startsWith(serverOrigin + "/"))) return false;
                return true; // the app only ever shows its own screens and YOUR server
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame() && serverOrigin.length() > 0 && r.getUrl().toString().startsWith(serverOrigin)) {
                    v.loadUrl(CONNECT + "?reason=lost"); // server went away: back to the connect screen, it searches again
                }
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                if (clearHistory && url != null && url.startsWith("http")) { v.clearHistory(); clearHistory = false; }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (filePicker != null) filePicker.onReceiveValue(null);
                filePicker = cb;
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                    startActivityForResult(Intent.createChooser(i, "Choose a file"), FILE_REQ);
                } catch (ActivityNotFoundException e) {
                    filePicker = null;
                    cb.onReceiveValue(null);
                    return false;
                }
                return true;
            }
        });

        // "Export JSON" etc.: the server hands out a normal download link
        web.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String ua, String disposition, String mime, long length) {
                try {
                    String name = URLUtil.guessFileName(url, disposition, mime);
                    DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                    r.setMimeType(mime);
                    r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    if (Build.VERSION.SDK_INT >= 29) r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
                    else r.setDestinationInExternalFilesDir(MainActivity.this, Environment.DIRECTORY_DOWNLOADS, name);
                    ((DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE)).enqueue(r);
                    Toast.makeText(MainActivity.this, "Saving " + name + " to Downloads", Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Could not save the file", Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ) {
            if (filePicker != null) {
                filePicker.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
                filePicker = null;
            }
        } else {
            super.onActivityResult(req, res, data);
        }
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    @Override protected void onResume() { super.onResume(); web.onResume(); NetUtil.bindToLan(this); }
    @Override protected void onPause() { web.onPause(); super.onPause(); }

    @Override
    protected void onDestroy() {
        NetUtil.unwatch(this, watchers);
        if (web != null) { web.removeJavascriptInterface("__ceitAndroid"); web.destroy(); }
        super.onDestroy();
    }

    // ------------------------------------------------------------------------------------------
    /** What the screens may ask the app to do. Used by the connect screen and by the connection bar. */
    private class Bridge {
        private void reply(final String cb, final String json) {
            if (cb == null || !CB_OK.matcher(cb).matches()) return;
            runOnUiThread(new Runnable() {
                public void run() { web.evaluateJavascript("window.__ceitCb('" + cb + "'," + json + ")", null); }
            });
        }

        private String serverJson(Lan.Server s) throws Exception {
            JSONObject o = new JSONObject();
            o.put("ip", s.ip); o.put("port", s.port); o.put("serverId", s.serverId); o.put("name", s.name); o.put("version", s.version);
            return o.toString();
        }

        @JavascriptInterface
        public String getNetworkInfo() { return NetUtil.infoJson(MainActivity.this); }

        @JavascriptInterface
        public String getSaved() {
            String u = prefs.getString("url", "");
            if (u.length() == 0) return "null";
            try {
                JSONObject o = new JSONObject();
                o.put("url", u); o.put("serverId", prefs.getString("serverId", "")); o.put("name", prefs.getString("name", ""));
                return o.toString();
            } catch (Exception e) { return "null"; }
        }

        @JavascriptInterface
        public void discover(final String cb) {
            new Thread(new Runnable() {
                public void run() {
                    String json = "[]";
                    try {
                        List<String> first = new ArrayList<String>();
                        String saved = prefs.getString("url", "");
                        if (saved.length() > 0) first.add(Uri.parse(saved).getHost());
                        List<Lan.Server> found = Lan.scan(PORT, first, NetUtil.lanNets(MainActivity.this), 700);
                        JSONArray a = new JSONArray();
                        for (Lan.Server s : found) a.put(new JSONObject(serverJson(s)));
                        json = a.toString();
                    } catch (Exception e) { /* empty list */ }
                    reply(cb, json);
                }
            }).start();
        }

        @JavascriptInterface
        public void probe(final String host, final String port, final String cb) {
            new Thread(new Runnable() {
                public void run() {
                    String json;
                    try {
                        JSONObject o = new JSONObject();
                        if (!host.matches("^[A-Za-z0-9.\\-]+$")) {
                            o.put("ok", false); o.put("error", "That is not a valid address");
                        } else {
                            int p = 8484;
                            try { p = Integer.parseInt(port); } catch (Exception e) { /* default */ }
                            Lan.Probe r = Lan.probe(host, p, 2500);
                            if (r.server != null) {
                                o = new JSONObject(serverJson(r.server)); o.put("ok", true);
                            } else { o.put("ok", false); o.put("error", r.error); }
                        }
                        json = o.toString();
                    } catch (Exception e) { json = "{\"ok\":false,\"error\":\"No answer\"}"; }
                    reply(cb, json);
                }
            }).start();
        }

        /** The server moved to another IP address? Find it again by its id. */
        @JavascriptInterface
        public void recoverServer(final String serverId, final String cb) {
            new Thread(new Runnable() {
                public void run() {
                    String json = "null";
                    try {
                        List<Lan.Server> found = Lan.scan(PORT, null, NetUtil.lanNets(MainActivity.this), 700);
                        for (Lan.Server s : found) {
                            if (s.serverId.equals(serverId)) { JSONObject o = new JSONObject(); o.put("url", "http://" + s.ip + ":" + s.port + "/"); json = o.toString(); break; }
                        }
                    } catch (Exception e) { /* null */ }
                    reply(cb, json);
                }
            }).start();
        }

        @JavascriptInterface
        public void connect(final String url, final String serverId, final String name) {
            if (url == null || !URL_OK.matcher(url).matches()) return;
            new Thread(new Runnable() {
                public void run() {
                    String id = serverId == null ? "" : serverId, nm = name == null ? "" : name;
                    final Uri u = Uri.parse(url);
                    if (id.length() == 0 || nm.length() == 0) {
                        Lan.Probe r = Lan.probe(u.getHost(), u.getPort() > 0 ? u.getPort() : 80, 2500);
                        if (r.server != null) { if (id.length() == 0) id = r.server.serverId; if (nm.length() == 0) nm = r.server.name; }
                    }
                    final String base = "http://" + u.getAuthority();
                    prefs.edit().putString("url", base + "/").putString("serverId", id).putString("name", nm).commit();
                    runOnUiThread(new Runnable() {
                        public void run() { serverOrigin = base; clearHistory = true; web.loadUrl(base + "/"); }
                    });
                }
            }).start();
        }

        @JavascriptInterface
        public void changeServer() {
            runOnUiThread(new Runnable() { public void run() { web.loadUrl(CONNECT + "?change=1"); } });
        }

        @JavascriptInterface
        public void forget() { prefs.edit().clear().commit(); }

        @JavascriptInterface
        public void print() {
            runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                        PrintDocumentAdapter a = web.createPrintDocumentAdapter("CEIT Schedule");
                        pm.print("CEIT Schedule", a, new PrintAttributes.Builder().build());
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Printing is not available on this phone", Toast.LENGTH_LONG).show();
                    }
                }
            });
        }
    }
}
