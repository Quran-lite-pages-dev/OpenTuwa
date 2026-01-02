package io.github.muslim1446.quran;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Message;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {

    private WebView mainWebView;
    private FrameLayout rootLayout;
    private WebView popupWebView; 
    private static final String TARGET_URL = "https://Quran-lite.pages.dev";
    private static final String DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.BLACK); 
        setContentView(rootLayout);

        // 1. Initialize WebView FIRST
        mainWebView = new WebView(this);
        
        // 2. Setup Cookies AFTER WebView exists
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(mainWebView, true);
        }

        // 3. Configure Settings
        setupWebViewSettings(mainWebView, false);
        
        mainWebView.setWebViewClient(new WebViewClient());
        mainWebView.setWebChromeClient(new MyWebChromeClient());

        rootLayout.addView(mainWebView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        mainWebView.loadUrl(TARGET_URL);
    }

    private void setupWebViewSettings(WebView webView, boolean isPopup) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        
        // Settings required for Puter.js and AI popups
        settings.setDomStorageEnabled(true); 
        settings.setDatabaseEnabled(true);
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);

        if (isPopup) {
            settings.setUserAgentString(DESKTOP_USER_AGENT);
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
        } else {
            // Standard TV identification
            String defaultUA = settings.getUserAgentString();
            settings.setUserAgentString(defaultUA.replace("; wv", "") + " AndroidTV_OTT");
        }
        
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(false); 
    }

    private class MyWebChromeClient extends WebChromeClient {
        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            dismissPopup();

            popupWebView = new WebView(MainActivity.this);
            setupWebViewSettings(popupWebView, true);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                CookieManager.getInstance().setAcceptThirdPartyCookies(popupWebView, true);
            }

            popupWebView.setWebViewClient(new WebViewClient());
            popupWebView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onCloseWindow(WebView window) {
                    dismissPopup();
                }
            });

            rootLayout.addView(popupWebView, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
            transport.setWebView(popupWebView);
            resultMsg.sendToTarget();
            return true;
        }
    }

    private void dismissPopup() {
        if (popupWebView != null) {
            rootLayout.removeView(popupWebView);
            popupWebView.destroy();
            popupWebView = null;
            mainWebView.requestFocus();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (popupWebView != null && keyCode == KeyEvent.KEYCODE_BACK) {
            dismissPopup();
            return true;
        }

        if (keyCode == KeyEvent.KEYCODE_BACK && mainWebView.canGoBack()) {
            mainWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}