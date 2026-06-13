package pl.endozero.endodeck;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.content.Context;
import android.content.SharedPreferences;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.net.HttpURLConnection;
import java.net.URL;

public final class MainActivity extends Activity {
    private static final String DECK_URL = "http://127.0.0.1:8765/";
    private static final String OFFLINE_URL = "file:///android_asset/offline.html";
    private final Handler handler = new Handler();
    private WebView webView;
    private boolean deckVisible;
    private boolean destroyed;
    private SharedPreferences preferences;

    private final class DeckBridge {
        @JavascriptInterface
        public void setBrightness(final double value) {
            runOnUiThread(() -> {
                WindowManager.LayoutParams params = getWindow().getAttributes();
                params.screenBrightness = value < 0 ? WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE
                    : Math.max(0.01f, Math.min(1f, (float) value));
                getWindow().setAttributes(params);
            });
        }

        @JavascriptInterface
        public void cacheWeather(String weatherJson) {
            if (weatherJson == null || weatherJson.length() > 100_000) return;
            preferences.edit()
                .putString("cached_weather", weatherJson)
                .putLong("cached_weather_at", System.currentTimeMillis())
                .apply();
        }

        @JavascriptInterface
        public String getCachedWeather() {
            return preferences.getString("cached_weather", "");
        }

        @JavascriptInterface
        public long getCachedWeatherAt() {
            return preferences.getLong("cached_weather_at", 0L);
        }
    }

    private final Runnable connectionProbe = new Runnable() {
        @Override
        public void run() {
            new Thread(() -> {
                boolean available = false;
                HttpURLConnection connection = null;
                try {
                    connection = (HttpURLConnection) new URL(DECK_URL + "api/state").openConnection();
                    connection.setConnectTimeout(650);
                    connection.setReadTimeout(650);
                    connection.setUseCaches(false);
                    available = connection.getResponseCode() == 200;
                } catch (Exception ignored) {
                } finally {
                    if (connection != null) connection.disconnect();
                }

                final boolean serverAvailable = available;
                handler.post(() -> {
                    if (destroyed || isFinishing()) return;
                    if (serverAvailable && !deckVisible) {
                        webView.loadUrl(DECK_URL);
                    } else if (!serverAvailable && deckVisible) {
                        deckVisible = false;
                        webView.loadUrl(OFFLINE_URL);
                    }
                    handler.postDelayed(connectionProbe, serverAvailable ? 3000 : 1200);
                });
            }).start();
        }
    };

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        preferences = getSharedPreferences("endodeck", Context.MODE_PRIVATE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(7, 9, 7));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        webView.addJavascriptInterface(new DeckBridge(), "NativeDeck");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                deckVisible = url != null && url.startsWith(DECK_URL);
                if (deckVisible) setWindowBrightness(WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }

            @Override
            @SuppressWarnings("deprecation")
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (failingUrl != null && failingUrl.startsWith(DECK_URL)) showOffline();
            }
        });

        setContentView(webView);
        enterImmersiveMode();
        webView.loadUrl(OFFLINE_URL);
        handler.post(connectionProbe);
    }

    private void showOffline() {
        if (!deckVisible && OFFLINE_URL.equals(webView.getUrl())) return;
        deckVisible = false;
        webView.loadUrl(OFFLINE_URL);
    }

    private void setWindowBrightness(float brightness) {
        WindowManager.LayoutParams params = getWindow().getAttributes();
        params.screenBrightness = brightness;
        getWindow().setAttributes(params);
    }

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    @Override
    protected void onDestroy() {
        destroyed = true;
        handler.removeCallbacksAndMessages(null);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
