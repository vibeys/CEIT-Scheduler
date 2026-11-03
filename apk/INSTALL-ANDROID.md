# CEIT Scheduler - Phone app (Android 6.0 or newer)

## Install (about 1 minute)
1. Copy **CEIT-Scheduler.apk** to the phone (USB cable, Bluetooth, Google Drive, or open this file from the phone's browser).
2. Tap the file. Android says *"not allowed to install unknown apps from this source"*.
   Tap **Settings → Allow from this source →** go back **→ Install**.
   This message is normal for any app that is not from Google Play. The app is signed and asks for only two permissions:
   internet (to reach your school server) and network state (to know if Wi-Fi is on). No camera, no contacts, no location.
3. Open **CEIT Scheduler**.

## First use
1. Join the **same Wi-Fi (or LAN) as the server laptop**. Mobile data cannot reach the school server.
2. Open the app. It looks for the server by itself and connects. The top bar shows
   `CONNECTED  Server 192.168.1.20:8484  This device 192.168.1.35 · Wi-Fi  Live sync on`
   (on a phone, tap the bar to see all of it).
3. Nothing found? Type the server's IP address (shown on the server laptop) and tap **Connect**.
4. Sign in. Admin accounts can edit. Teacher accounts can only look at their own schedule.

## Change server
Tap **Change server** in the top bar.

## Uninstall (clean)
Press and hold the icon → **App info → Uninstall**. The app, the saved server address and the sign-in are all removed.
The app keeps **no schedule data** on the phone. The database lives only on the server laptop.

## It does not connect?
* Is the server laptop on, with `npm start` running?
* Same Wi-Fi? Guest Wi-Fi often blocks phone-to-laptop traffic. Use the school Wi-Fi / LAN.
* On Windows, did the server laptop run `npm run firewall` once?
* Type the IP address by hand.
