@echo off
title UPI Shield — Development Server
cd /d "%~dp0"
echo ========================================================
echo   Starting UPI Shield Platform on http://localhost:5173
echo ========================================================
echo.
call npm.cmd run dev
pause
