package io.github.muslim1446.quran;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView myWebView;
    private static final String TARGET_URL = "https://Quran-lite.pages.dev";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Setup the Layout programmatically (Cleaner than XML for single view)
        myWebView = new WebView(this);
        
        // 2. The "Micro Dust" Fix: Deep Black background to prevent white flash
        myWebView.setBackgroundColor(Color.parseColor("#080808"));
        setContentView(myWebView);

        // 3. Performance & TV Settings
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        
        // Force Hardware Acceleration for 60fps scrolling on TV
        myWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // 4. OTT Identification
        String userAgent = webSettings.getUserAgentString();
        webSettings.setUserAgentString(userAgent + " AndroidTV_OTT");

        // 5. Remote Control Navigation Support (Crucial)
        myWebView.setFocusable(true);
        myWebView.setFocusableInTouchMode(false); // Forces D-Pad usage

        // 6. Client Logic
        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Determine focus when page loads
                view.requestFocus();
            }
        });

        // 7. Load the Source
        myWebView.loadUrl(TARGET_URL);
    }

    // 8. Handle TV Remote "Back" Button
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && myWebView.canGoBack()) {
            myWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}