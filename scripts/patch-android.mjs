import { readFile, writeFile } from 'node:fs/promises';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
let manifest = await readFile(manifestPath, 'utf8');
manifest = manifest.replace(/android:screenOrientation="[^"]*"/g, '');
manifest = manifest.replace(
  '<activity',
  '<activity android:screenOrientation="sensorLandscape"',
);
await writeFile(manifestPath, manifest, 'utf8');

const mainActivityPath = 'android/app/src/main/java/com/ashenhollow/android/MainActivity.java';
const mainActivity = `package com.ashenhollow.android;

import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.View;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            View.SYSTEM_UI_FLAG_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }
}
`;
await writeFile(mainActivityPath, mainActivity, 'utf8');
