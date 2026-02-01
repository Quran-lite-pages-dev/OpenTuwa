package com.opentuwa.stream;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
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
    // Ensure this URL matches your Cloudflare deployment exactly
    private static final String TARGET_URL = "https://Quran-lite.pages.dev";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // --- 1. SETUP GOOGLE SIGN IN ---
        // I have inserted your specific Client ID below.
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("355325321586-gp3o4kiepb7elfrtb0ljq98h06vqvktp.apps.googleusercontent.com")
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // --- 2. SETUP WEBVIEW ---
        myWebView = new WebView(this);
        myWebView.setBackgroundColor(Color.parseColor("#080808"));
        setContentView(myWebView);

        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // FIX: Allow mixed content to prevent cookie blocking issues
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        
        // Enable Cookies
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(myWebView, true);

        // --- 3. INJECT THE BRIDGE ---
        myWebView.addJavascriptInterface(new WebAppInterface(this, this), "Android");

        myWebView.setWebViewClient(new WebViewClient());
        myWebView.loadUrl(TARGET_URL);
    }

    // --- 4. HANDLE NATIVE LOGIN ---
    public void launchNativeLogin() {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        if (account != null) {
            sendTokenToWeb(account.getIdToken());
        } else {
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
                sendTokenToWeb(account.getIdToken());
            } catch (ApiException e) {
                Log.w("TuwaLogin", "signInResult:failed code=" + e.getStatusCode());
            }
        }
    }

    // --- 5. SEND TOKEN TO JAVASCRIPT ---
    private void sendTokenToWeb(String token) {
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