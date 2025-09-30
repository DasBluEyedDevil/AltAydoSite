@echo off
REM Simple WSL Bridge for cursor-agent
REM Runs cursor-agent through WSL Ubuntu as devil user

setlocal enabledelayedexpansion

REM Build command arguments
set "args="
:loop
if "%~1"=="" goto :execute
if defined args (
    set "args=!args! %~1"
) else (
    set "args=%~1"
)
shift
goto :loop

:execute
REM Run cursor-agent in WSL Ubuntu as devil user
wsl.exe -- bash -c "~/.local/bin/cursor-agent !args!"