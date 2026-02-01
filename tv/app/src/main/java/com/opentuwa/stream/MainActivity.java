package com.opentuwa.stream;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

public class MainActivity extends Activity {

    private WebView myWebView;
    private GoogleSignInClient mGoogleSignInClient;
    private static final int RC_SIGN_IN = 9001;
    private static final String TARGET_URL = "https://Quran-lite.pages.dev?tv";
    private static final String TAG = "Tuwa";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = findViewById(R.id.webview);
        myWebView.setVisibility(View.VISIBLE);

        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);

        // Required for the Cookie Bridge
        myWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        setupGoogleSignIn();
        myWebView.loadUrl(TARGET_URL);
    }

    private void setupGoogleSignIn() {
        String serverClientId = "907572851493-9qf7j099sqv8u6r6u428667u2a00q0be.apps.googleusercontent.com";
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(serverClientId)
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
    }

    /**
     * JavaScript Bridge Interface
     */
    public class WebAppInterface {
        Activity mContext;
        WebAppInterface(Activity c) { mContext = c; }

        @android.webkit.JavascriptInterface
        public void startGoogleLogin() {
            // 1. Detect if Google Play Services is usable
            GoogleApiAvailability gApi = GoogleApiAvailability.getInstance();
            int resultCode = gApi.isGooglePlayServicesAvailable(mContext);

            if (resultCode == ConnectionResult.SUCCESS) {
                // Device is a standard Google TV / Android Phone
                try {
                    Intent signInIntent = mGoogleSignInClient.getSignInIntent();
                    
                    // 2. Resolve Check: Make sure the device actually has an activity to handle this intent
                    if (signInIntent.resolveActivity(getPackageManager()) != null) {
                        startActivityForResult(signInIntent, RC_SIGN_IN);
                    } else {
                        Log.w(TAG, "Intent resolvable check failed. Bypassing.");
                        forceBypassLogin();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Failed to launch Google Intent", e);
                    forceBypassLogin();
                }
            } else {
                // Device is a FireStick, Huawei, or uncertified Android 9 box
                Log.d(TAG, "Google Services not found (Status: " + resultCode + "). Bypassing.");
                forceBypassLogin();
            }
        }
    }

    /**
     * The "Force Entry" Logic: Skips authentication and reloads with cookie
     */
    private void forceBypassLogin() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                CookieManager cm = CookieManager.getInstance();
                
                // Get domain dynamically to ensure cookie works across subdomains
                Uri uri = Uri.parse(TARGET_URL);
                String domain = uri.getHost();

                String cookieString = "TUWA_PREMIUM=true; path=/; domain=Quran-lite.pages.dev; secure; samesite=lax";
                
                cm.setCookie(TARGET_URL, cookieString);
                cm.flush(); 

                Log.d(TAG, "Bypass Cookie Injected for: " + domain);
                myWebView.reload();
            }
        });
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_SIGN_IN) {
            // On Google devices, we still trigger the bypass because we don't need real validation
            forceBypassLogin();
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