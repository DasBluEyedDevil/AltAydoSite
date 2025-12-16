@echo off
REM WSL Bridge Script for cursor-agent - Proper User Context
REM This script runs cursor-agent as the devil user in WSL Ubuntu

setlocal enabledelayedexpansion

REM Check if any arguments were passed
if "%~1"=="" (
    echo Usage: wsl-cursor-agent-proper.bat [cursor-agent arguments]
    echo Example: wsl-cursor-agent-proper.bat --help
    echo Example: wsl-cursor-agent-proper.bat agent "Edit this file"
    goto :eof
)

REM Build the command with all arguments, properly escaped
set "cmd_args="
:loop
if "%~1"=="" goto :execute
if defined cmd_args (
    set "cmd_args=!cmd_args! '%~1'"
) else (
    set "cmd_args='%~1'"
)
shift
goto :loop

:execute
REM Execute cursor-agent in WSL as the devil user with proper environment
wsl.exe bash -c "cd '/mnt/host/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil bash -c 'source ~/.bashrc && cursor-agent !cmd_args!'"