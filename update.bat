@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" -Update
set "RESULT=%ERRORLEVEL%"
if not "%RESULT%"=="0" echo AmbientGlass update failed. See the message above.
pause
exit /b %RESULT%
