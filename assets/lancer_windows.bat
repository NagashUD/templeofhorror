@echo off
cd /d "%~dp0"
py watermark.py
if errorlevel 1 python watermark.py
pause
