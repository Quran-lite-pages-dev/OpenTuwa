package com.opentuwa.stream;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

public class MainActivity extends Activity {

    private WebView myWebView;
    private GoogleSignInClient mGoogleSignInClient;
    private static final int RC_SIGN_IN = 9001;
    // Your Cloudflare URL
    private static final String TARGET_URL = "https://Quran-lite.pages.dev";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 1. Setup WebView
        myWebView = findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setUserAgentString("AndroidTV/TuwaApp");

        // --- CRITICAL FIX: ENABLE COOKIES ---
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        // This forces the "Premium" cookie to stick even if Cloudflare sends it as Third-Party
        cookieManager.setAcceptThirdPartyCookies(myWebView, true);
        // ------------------------------------

        // 2. Add Javascript Interface (Bridge)
        myWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        // 3. Prevent opening in Chrome
        myWebView.setWebViewClient(new WebViewClient());
        myWebView.loadUrl(TARGET_URL);

        // 4. Configure Google Sign-In
        // NOTE: Use the SAME Client ID that is in your login-google.js file
        String serverClientId = "355325321586-gp3o4kiepb7elfrtb0ljq98h06vqvktp.apps.googleusercontent.com";
        
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(serverClientId)
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
    }

    // --- Bridge Class to receive commands from HTML ---
    public class WebAppInterface {
        Activity mContext;

        WebAppInterface(Activity c) {
            mContext = c;
        }

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
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                // Login Success: Send Token to Web
                sendTokenToWeb(account.getIdToken());
            } catch (ApiException e) {
                Log.w("TuwaLogin", "signInResult:failed code=" + e.getStatusCode());
            }
        }
    }

    private void sendTokenToWeb(String token) {
        // Send the token to the function inside login-client.js
        final String jsCommand = "javascript:onNativeLoginSuccess('" + token + "')";
        
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                myWebView.evaluateJavascript(jsCommand, null);
            }
        });
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