# CEIT Scheduler

One **server laptop**, plus a **PC app**, a **phone app** and a **website**.
Everything works **offline** on the same Wi-Fi or LAN. No internet is needed.

```
   SERVER LAPTOP                                   OTHER DEVICES (same Wi-Fi / LAN)
   VS Code  ->  npm start        <---------->      PC app (exe)   Phone app (apk)   Website (any browser)
   keeps the ONE database                          they find the server by themselves
```

* Only the **server laptop** runs the server and keeps the **one** database.
* Every other laptop or phone just installs the app and joins the same Wi-Fi / LAN.
  The app **finds the server by itself** and remembers it.
* A bar at the top of every screen tells you the connection state, the **server IP** and **this device's IP**:

  `● CONNECTED   Server 192.168.1.20:8484 · SCHOOL-SERVER   This device 192.168.1.35 · Wi-Fi   Live sync on`
* When an admin saves something, it shows up on **every device within a second**.
* **Teachers can only look** at their own schedule. The server enforces this, not only the screens.

---

## What is in this folder

| Folder / file | What it is |
|---|---|
| `dist/CEIT-Scheduler-PC-Setup-1.0.0.exe` | **PC app** installer (for the other laptops) |
| `apk/CEIT-Scheduler.apk` | **Phone app** for Android 6.0 or newer |
| `server/`, `public/`, `shared/` | The server and the website. **Open this folder in VS Code.** |
| `client-pc/`, `client-android/`, `shell/` | Source code of the PC app and the phone app |
| `node_modules/` | Everything is already installed. No `npm install` needed. |
| `start-server.bat`, `allow-firewall.bat` | Double-click helpers for Windows |

---

## 1. Server laptop (only this laptop)

Do this once. After that it is just `npm start`.

1. Install **Node.js 20 or newer** from <https://nodejs.org> (if it is not installed yet).
2. Open **this folder** in VS Code: *File → Open Folder*.
3. Open the terminal: *Terminal → New Terminal*, then type:

   ```
   npm start
   ```

   The terminal shows the server name, the address for **Wi-Fi** and **Ethernet**, and a **QR code**.
   Leave it running. `Ctrl+C` stops the server. (Pressing `F5` and choosing *START THE SERVER* also works.)
4. **Windows only, one time:** type `npm run firewall` and click **Yes**.
   Without this, Windows blocks the other devices. (Or right-click `allow-firewall.bat` → *Run as administrator*.)
5. On the server laptop open <http://localhost:8484> and sign in: **admin / admin123**.
   Then go to **Admin** and change the password (the **Password** button next to your account).
6. Keep the laptop **on**, **connected** to the Wi-Fi or LAN, and **not asleep**.

**Moving your old data:** in the old browser version go to *Admin → Export JSON*.
In the new one go to *Admin → Import JSON*. Your schedules and accounts come over.

---

## 2. Other laptops: the PC app

**Install**

1. Copy `dist/CEIT-Scheduler-PC-Setup-1.0.0.exe` to the laptop and double-click it.
2. *Next → Install → Finish*. **No administrator permission is needed** (it installs for the current user).
3. If Windows shows a blue **"Windows protected your PC"** screen, click **More info → Run anyway**.
   Windows shows this for every app that has no paid publisher certificate. You see it once.

**Use**

1. Connect the laptop to the **same Wi-Fi / LAN** as the server laptop.
2. Open **CEIT Scheduler** (desktop icon). It finds the server by itself and opens it. Next time it connects straight away.
3. To use another server: the **Change server** button in the top bar (or menu *App → Change server*).
   You can also type the server's IP address by hand.

**Uninstall (clean):** *Windows Settings → Apps → CEIT Scheduler → Uninstall*.
It removes the program, the shortcuts and the saved server address. Nothing is left behind.
(The PC app never stores schedules. They live on the server laptop.)

---

## 3. Phones: the Android app

**Install**

1. Copy `apk/CEIT-Scheduler.apk` to the phone (USB, Bluetooth, Google Drive, or open it from the phone's browser).
2. Tap the file. Android says *"not allowed to install unknown apps from this source"*:
   tap **Settings → Allow from this source →** go back **→ Install**.
   This is normal for any app that is not from Google Play.
   The app asks for only **two permissions**: internet (to reach your server) and network state (to know if Wi-Fi is on).
   No camera, no contacts, no location.
3. Open **CEIT Scheduler**.

**Use**

1. Join the **same Wi-Fi / LAN** as the server laptop. (**Mobile data cannot reach the school server.**)
2. Open the app. It looks for the server and connects. On a phone, **tap the top bar** to see all the details.
3. If it finds nothing, type the server's IP address (shown in the server terminal) and tap **Connect**.

**Uninstall (clean):** press and hold the icon → *App info → Uninstall*. Everything is removed.
The app keeps no schedule data on the phone.

---

## 4. Website (no app needed)

On any device on the same Wi-Fi / LAN, type the address the server shows, for example `http://192.168.1.20:8484`.
*Admin → Network access* shows the address and a **QR code** to scan with the phone camera.

---

## 5. What the top bar means

| Bar | Meaning |
|---|---|
| 🟢 **Connected** | Connected to the server. *Server* = its IP and port. *This device* = this device's own IP and network (Wi-Fi or Ethernet). *Live sync on* = changes made anywhere appear here by themselves. |
| 🟠 **Syncing…** | Sending or receiving changes. |
| 🔴 **Not connected** | The server cannot be reached (server laptop off, Wi-Fi lost…). The app keeps trying. **Admin edits made meanwhile wait** and are sent when the server is back. The PC and phone apps also look for the server again if its IP changed. |
| 🔴 **No network** | This device is not on any Wi-Fi / LAN. |

---

## 6. Using the scheduler

### Sign in
* **Admin**: the first screen. **Teacher**: tap *Teacher? Sign in here*. Username is the **surname** and the password is `teacher123` until the teacher or admin changes it.
* On the Teacher screen, *Open to see user and pass of teacher* lists the teachers. A password is shown **only while it is still the default one**.

### Admin pages
| Page | What you do there |
|---|---|
| **Dashboard** | Totals and every class in a table. |
| **Scheduler** | Build the schedule (see below). |
| **Faculty** | See one professor's schedule, hours per week and login. Add a faculty (a teacher login is created at once). Remove a faculty (their classes become unassigned and the login is deleted). **Print** the schedule. |
| **Admin** | *Network access* (server address, QR code, devices connected now). *Accounts* (add teacher or admin, change password, alias, link a login to a professor, delete). *Rooms* (add, delete). *Data*: **Export JSON** (backup file), **Import JSON**, **Reset all**. |

### The Scheduler
1. Choose the **room** at the top. Pick the course, curriculum, year and term in **Load subjects**.
2. **Drag a subject** from the left onto the grid, or **tap a subject, then tap the grid**.
   The number box on each subject is its **length in hours**.
3. **Assign a professor:** drag a professor onto a class, or use the dropdown inside the class.
   The app refuses a **room clash** and a **professor clash** (the same professor in two rooms at the same time).
4. **Move** a class by dragging it. **Resize** it with the handle at the bottom. **Remove** it with the **×**.
5. *Clear room* and *Clear all* ask you first.

Everything is **saved automatically** and sent to all devices.

### Teachers
* **Dashboard** and **My Schedule** only. The schedule is **view only**. Teachers can **print** it (Print button).
* If the admin changes the schedule, it updates on the teacher's screen by itself.
* If the admin changes a teacher's password, that teacher is signed out right away.

---

## 7. Data and backups

* The **one** database file is on the server laptop: `data/ceit-db.json` (inside this folder).
* Backups are kept in `data/backups` (the newest 40). If the database file is ever damaged, the server **repairs itself** from the newest backup.
* To move to another server laptop: *Admin → Export JSON*, then *Import JSON* on the new server.

---

## 8. Security (what is protected and what is not)

* Teachers **cannot change anything**. The server refuses every change from a teacher account (HTTP 403).
* A teacher only receives **their own** classes.
* Passwords are stored **scrambled (hashed)**, never as plain text.
* Logging out ends the sign-in **on the server** too. Changing a password signs that person out of every device.
* 8 wrong passwords in a row = a one-minute pause.
* The apps only open **your server**. The PC app and the phone app cannot be sent to another website.
* Data travels on your local network **without encryption** (normal for a school LAN).
  Use the school's private Wi-Fi / LAN, **not a public Wi-Fi**.

---

## 9. If something does not work

| Problem | What to do |
|---|---|
| App says **No server found** | Is the server laptop on and `npm start` running? Did you run `npm run firewall` once (Windows)? Same Wi-Fi? Type the server's IP address by hand. |
| Very big school network (the server is far away in the address range) | The automatic search covers the addresses near the device (about 250 to 750). On a very large network, type the server's IP address by hand once. The app remembers it. |
| Works on the laptop but not on phones | **Guest Wi-Fi** often blocks device-to-device traffic ("client isolation"). Use the school Wi-Fi or the LAN. |
| Server's IP changed after a restart | The PC and phone apps find it again by themselves. For the website, use the new address shown in the server terminal. |
| Port 8484 is busy | The server uses the next free port (8485…) and prints it. |
| You started the server twice | The second one tells you it is already running. There is only ever **one** database. |
| Phone shows **Mobile data** | Turn on Wi-Fi. Mobile data cannot reach the school server. |
| Forgot the admin password | Stop the server (`Ctrl+C`), run `npm run reset-admin`, then `npm start`. The admin password becomes `admin123` again. Change it after you sign in. |

---

## 10. What was tested

| Part | How it was tested |
|---|---|
| Server | 41 automatic checks (`npm test`): logins, permissions, saving, conflicts, live events, backups, repair of a damaged file, restart, port busy, sign-out. |
| Website screens | A real Chromium window (the same engine as the PC app) clicked through every screen: login, scheduler drag and drop / resize / move / delete, faculty, admin, teacher view, print, phone-size screens, two admins at once, live sync between devices, server stopped and started again. No errors, no requests to the internet. |
| PC app | Run in a real window: found the server by itself on the LAN, connected, remembered it, **Change server**, wrong and right typed address, server stopped and started again, the page cannot be redirected to other websites. |
| Phone app | Built and **signed** (v1+v2+v3). Its server finder was run against the real server (finds it in about 2.5 seconds). Its screens were run with a simulated Android bridge (17 checks). |
| **Not tested here** | **Running the Windows installer** and **running the apk on a real Android phone** could not be done in the build environment (no Windows PC, no phone). Please install both once and check the points above. If the PC app or phone app ever fails, the **website** works on every device. |

---

## 11. For developers

| Command | What it does |
|---|---|
| `npm start` | Start the server |
| `npm test` | 41 server checks |
| `npm run firewall` | Open the Windows firewall for the server (once) |
| `npm run reset-admin` | Set the admin password back to `admin123` (server must be stopped) |
| `npm run client` | Open the PC app from source |
| `npm run dist` | Build the PC installer into `dist/` |
| `npm run apk` | Build the phone app into `apk/` (needs Linux or macOS and the Android build tools, see `client-android/build.sh`) |
| `npm run sync` | Copy the shared screens into `client-pc` and `client-android` |

The PC app and the phone app contain **no server and no database**. They only find the server, then show the server's own pages,
so a change in `public/` shows up in every app without rebuilding anything.
The Android signing key is `client-android/ceit-release.keystore` (password `ceit-scheduler`). Keep it: new versions of the app must be signed with the same key to update an installed one.
