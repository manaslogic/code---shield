@echo off
title Push UPI Shield to GitHub
cd /d "%~dp0"
echo ========================================================
echo   Pushing code to https://github.com/manaslogic/code---shield
echo ========================================================
echo.
git push -u origin main
echo.
echo ========================================================
echo   Done! Check your GitHub repository.
echo ========================================================
pause
