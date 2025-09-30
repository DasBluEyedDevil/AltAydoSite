@echo off
REM WSL Bridge Script for cursor-agent
REM This script allows accessing cursor-agent in WSL from Windows environments

setlocal enabledelayedexpansion

REM Check if any arguments were passed
if "%~1"=="" (
    echo Usage: wsl-cursor-agent.bat [cursor-agent arguments]
    echo Example: wsl-cursor-agent.bat --help
    echo Example: wsl-cursor-agent.bat edit file.js
    goto :eof
)

REM Build the command with all arguments
set "cmd_args="
:loop
if "%~1"=="" goto :execute
set "cmd_args=!cmd_args! %~1"
shift
goto :loop

:execute
REM Execute cursor-agent in WSL with the provided arguments
REM First try to change to the Windows path in WSL format
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff\ AydoSite/dasblueeyeddevil.github.io' 2>/dev/null || cd ~ ; /home/devil/.local/bin/cursor-agent!cmd_args!"