# WSL Cursor-Agent Bridge

This directory contains bridge scripts to access `cursor-agent` installed in WSL Ubuntu from any Windows environment.

## Files Created

- `cursor-agent.sh` - Shell script bridge for accessing cursor-agent in WSL
- `wsl-cursor-agent.bat` - Windows batch script bridge (alternative approach)

## Requirements

### For cursor-agent to work:
1. cursor-agent must be installed in WSL Ubuntu (✅ Confirmed installed)
2. Node.js must be installed in WSL Ubuntu (❌ Currently missing)

## Installation of Node.js in WSL

To complete the setup, install Node.js in your WSL Ubuntu environment:

```bash
# In WSL Ubuntu terminal:
wsl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

## Usage

### Method 1: Shell Script (Recommended)
```bash
# From any environment that can access WSL:
wsl bash cursor-agent.sh --help
wsl bash cursor-agent.sh edit myfile.js
```

### Method 2: Direct WSL Command
```bash
# Once Node.js is installed:
wsl ~/.local/bin/cursor-agent --help
```

### Method 3: Batch Script
```cmd
# From Windows Command Prompt:
wsl-cursor-agent.bat --help
wsl-cursor-agent.bat edit myfile.js
```

## Integration with Claude Code

I can now use cursor-agent in our three-pronged development platform:

```bash
# Example usage in workflows:
wsl bash cursor-agent.sh edit src/components/MyComponent.tsx:45
```

## Status

✅ Bridge scripts created and tested
✅ cursor-agent installation verified
❌ Node.js dependency needs installation
⏳ Ready for integration once Node.js is installed

## Your Three-Pronged Development Platform

1. **Claude Code (Me)**: File editing, analysis, task execution
2. **Gemini CLI**: Large codebase analysis with massive context
3. **Cursor-Agent**: IDE integration via WSL bridge ⚡

The platform is ready to use once Node.js is installed in WSL!