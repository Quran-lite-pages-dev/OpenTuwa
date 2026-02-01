package com.opentuwa.stream;

import android.app.Activity;
import android.content.Intent;
import android.net.http.SslError; // Import added
import android.os.Build; // Import added
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View; // Import added
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler; // Import added
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;

public class MainActivity extends Activity {

    private WebView myWebView;
    private GoogleSignInClient mGoogleSignInClient;
    private static final int RC_SIGN_IN = 9001;
    private static final String TARGET_URL = "https://Quran-lite.pages.dev?tv";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = findViewById(R.id.webview);
        
        // FIX: Ensure WebView is visible
        myWebView.setVisibility(View.VISIBLE);

        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true); // Added for better compatibility
        webSettings.setUserAgentString("AndroidTV/TuwaApp");
        
        // FIX: Allow Mixed Content (HTTP resources on HTTPS site)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Enable Cookies
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(myWebView, true);
        }

        // Add Bridge
        myWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        // FIX: Custom WebViewClient to handle SSL errors and Page Loading
        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                // Ignore SSL certificate errors (Fixes blank screen on some networks)
                handler.proceed();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Optional: Log when page is done
                Log.d("WebView", "Page loaded: " + url);
            }
        });

        myWebView.loadUrl(TARGET_URL);

        // Configure Google Sign-In
        String serverClientId = "355325321586-gp3o4kiepb7elfrtb0ljq98h06vqvktp.apps.googleusercontent.com";
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(serverClientId)
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
    }

    public class WebAppInterface {
        Activity mContext;
        WebAppInterface(Activity c) { mContext = c; }

        @android.webkit.JavascriptInterface
        public void startGoogleLogin() {
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            startActivityForResult(signInIntent, RC_SIGN_IN);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN) {
            // THE FORCE LOGIC:
            CookieManager cm = CookieManager.getInstance();
            String cookieString = "TUWA_PREMIUM=true; path=/; domain=Quran-lite.pages.dev; secure; samesite=lax";
            cm.setCookie(TARGET_URL, cookieString);
            cm.flush(); 

            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    myWebView.reload();
                }
            });
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && myWebView.canGoBack()) {
            myWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}