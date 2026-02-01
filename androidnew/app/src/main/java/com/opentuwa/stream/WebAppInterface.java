package com.opentuwa.stream;

import android.content.Context;
import android.webkit.JavascriptInterface;

public class WebAppInterface {
    Context mContext;
    MainActivity mActivity;

    WebAppInterface(Context c, MainActivity activity) {
        mContext = c;
        mActivity = activity;
    }

    // This method can be called from your Website using Android.startGoogleLogin()
    @JavascriptInterface
public void startGoogleLogin() {
    mActivity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
            mActivity.launchNativeLogin();
        }
    });
}