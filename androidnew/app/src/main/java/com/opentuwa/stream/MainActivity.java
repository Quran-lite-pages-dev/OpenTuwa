package com.opentuwa.stream;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
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
        
        // 1. Setup Layout (Ensure your res/layout/activity_main.xml has a WebView with id 'webview')
        setContentView(R.layout.activity_main);

        // 2. Configure Google Sign-In
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("355325321586-gp3o4kiepb7elfrtb0ljq98h06vqvktp.apps.googleusercontent.com")
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // 3. Configure WebView
        myWebView = findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // CRITICAL FIX: Register the Javascript Interface
        // This connects "window.Android.startGoogleLogin()" in HTML to the Java method below
        myWebView.addJavascriptInterface(new WebAppInterface(this, this), "Android");

        myWebView.setWebViewClient(new WebViewClient());
        myWebView.loadUrl(TARGET_URL);
    }

    // CRITICAL FIX: This method was missing. It is called by WebAppInterface.
    public void launchNativeLogin() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        // Result returned from launching the Intent from GoogleSignInClient.getSignInIntent(...);
        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                // Signed in successfully, send token to JavaScript
                sendTokenToWeb(account.getIdToken());
            } catch (ApiException e) {
                Log.w("TuwaLogin", "signInResult:failed code=" + e.getStatusCode());
            }
        }
    }

    // Send the Google Token back to the Website
    private void sendTokenToWeb(String token) {
        // This calls the function defined at the bottom of landing.html
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