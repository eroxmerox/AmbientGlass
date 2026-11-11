@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" -Uninstall
set "RESULT=%ERRORLEVEL%"
if not "%RESULT%"=="0" echo AmbientGlass uninstall failed. See the message above.
pause
exit /b %RESULT%
