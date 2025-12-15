@echo off
echo =====================================
echo DeskLab - Quick Backup Script
echo =====================================
echo.

set BACKUP_DIR=%USERPROFILE%\Documents\Code\desklab_backup_%DATE:~-4%-%DATE:~4,2%-%DATE:~7,2%

echo Creating backup folder...
mkdir "%BACKUP_DIR%" 2>nul

echo Copying files...
xcopy /E /I /Y /Q "C:\Users\Kieth\Documents\Code\desklab" "%BACKUP_DIR%"

echo.
echo =====================================
echo Backup Complete!
echo =====================================
echo Location: %BACKUP_DIR%
echo.
echo Next steps:
echo 1. Export database from phpMyAdmin
echo 2. Save as: desklab_backup.sql
echo 3. Move to: %BACKUP_DIR%\database\
echo.
pause
