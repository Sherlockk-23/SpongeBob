@echo off
:loop
git push
IF %ERRORLEVEL% EQU 0 (
    echo Push successful.
    GOTO :eof
) ELSE (
    echo Push failed. Retrying in 2 seconds...
    timeout /t 2 /nobreak > NUL
    GOTO loop
)
