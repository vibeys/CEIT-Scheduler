@echo off
:: SERVER LAPTOP ONLY. Opens the Windows Firewall once, so phones and other computers can reach the server.
:: Right-click this file -> "Run as administrator".
net session >nul 2>nul
if errorlevel 1 (
  echo Please right-click this file and choose "Run as administrator".
  pause
  exit /b 1
)
netsh advfirewall firewall delete rule name="CEIT Scheduler Server" >nul 2>nul
netsh advfirewall firewall add rule name="CEIT Scheduler Server" dir=in action=allow protocol=TCP localport=8484-8508 profile=any
echo.
echo Done. Other devices on your network can now reach the server (port 8484).
pause
