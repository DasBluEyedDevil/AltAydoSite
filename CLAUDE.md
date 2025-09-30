# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AydoCorp website built with Next.js 15.3.3, featuring authentication, fleet operations management, mission planning, and Discord integration. The application uses a hybrid storage system with Azure Cosmos DB as primary storage and local JSON fallback.

## Commands

### Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Remove .next build directory

### Database Operations
- `npm run migrate-users` - Migrate users from local storage to Azure Cosmos DB
- `npm run migrate-timezone` - Migrate timezone data
- `npm run test-cosmos` - Test Azure Cosmos DB connection
- `npm run test-mongo` - Test MongoDB connection
- `npm run verify-cosmos` - Verify Cosmos DB setup

### Utilities
- `npm run kill-port` - Kill process on specified port (use `npm run kill-port port#`)
- `npm run gen-password` - Generate secure password
- `npm run verify-email` - Verify email configuration
- `npm run start-discord-monitor` - Start Discord role monitoring
- `npm run assign-synced-role` - Assign Discord synced roles

## Architecture

### Storage System
The application uses a hybrid storage approach:
- **Primary**: Azure Cosmos DB / MongoDB for cloud storage
- **Fallback**: Local JSON files in `/data` directory
- The system automatically falls back to local storage if cloud database is unavailable
- Check storage status via `/api/storage-status` endpoint

### Authentication
- NextAuth.js with Microsoft Entra ID (Azure AD) integration
- Traditional username/password authentication via Azure Cosmos DB
- User roles and clearance levels for access control
- Discord OAuth integration for role synchronization

### Key Components
- **Fleet Operations**: Mission planning, operations management, resource allocation
- **Mission Builder**: Complex state management for mission composition using React state
- **Discord Integration**: Role monitoring, user synchronization, event management
- **User Management**: Profile management, timezone handling, clearance-based access

### Database Collections/Storage
- Users (with clearance levels, roles, Discord integration)
- Missions and Operations
- Fleet resources and allocations
- Escort requests
- Financial transactions
- Discord events and role mappings

### File Structure
- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components organized by feature area
- `/src/lib` - Core libraries (auth, storage, Discord, etc.)
- `/src/types` - TypeScript type definitions
- `/src/hooks` - Custom React hooks
- `/src/scripts` - Administrative and migration scripts
- `/data` - Local fallback storage (JSON files)

### Configuration
- TypeScript with path aliases (`@/*` maps to `./src/*`)
- Tailwind CSS for styling
- Images unoptimized for static export
- Standalone output for deployment
- Custom webpack config for Discord.js dependencies

### Discord Integration
The application includes comprehensive Discord integration:
- Role monitoring and synchronization
- Event fetching and display
- User role mapping to clearance levels
- OAuth authentication flow
- Automatic role assignment based on website permissions

### Security
- Clearance-based access control (levels 1-5)
- Role-based permissions
- Rate limiting on sensitive endpoints
- CORS and security headers configured
- NextAuth session management

## Important Notes

- Environment variables are crucial - copy from `.env.example` to `.env.local`
- The build process ignores TypeScript and ESLint errors (configured in next.config.js)
- Discord.js dependencies require special webpack configuration
- Some API routes have rate limiting enabled
- Mission builder uses complex React state management - understand the state flow before modifying
- Always test both cloud and fallback storage modes when making storage-related changes
- Utilize MobiGlas UI components when creating new pages/components

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results

# Three-Pronged AI Development Triumvirate

This project leverages a powerful three-AI system for optimal development efficiency. Each AI has distinct strengths that, when combined strategically, create an unparalleled development environment.

## AI Capabilities Matrix

### Claude Code (Primary Orchestrator)
**Strengths:**
- Precise file operations (read/write/edit)
- Multi-step task coordination and planning
- Code refactoring and incremental changes
- Real-time debugging and error resolution
- Project-specific context retention
- Tool integration and workflow automation

**Best For:**
- Direct code implementation and modifications
- Bug fixes and feature implementation
- File system operations and organization
- Task planning and execution coordination
- Integration testing and validation

### Gemini CLI (Architectural Analyst)
**Strengths:**
- Massive context window (2M+ tokens)
- Whole-codebase analysis and comprehension
- Pattern recognition across large file sets
- Architecture assessment and recommendations
- Cross-file dependency analysis
- Comprehensive code auditing

**Best For:**
- Project-wide analysis and planning
- Architecture reviews and refactoring strategies
- Large-scale pattern detection
- Security audits across entire codebase
- Impact analysis for major changes
- Documentation generation from codebase

### Cursor Agent (Interactive Development)
**Strengths:**
- Interactive development sessions
- Visual code editing and exploration
- Real-time collaboration and pair programming
- IDE-integrated workflows
- Advanced code completion and suggestions
- Multi-modal development assistance

**Best For:**
- Interactive debugging sessions
- Complex refactoring with visual feedback
- Exploratory coding and experimentation
- Real-time code review and suggestions
- Collaborative development workflows
- Learning and explanation of complex systems

## Optimal Workflow Strategies

### 1. Architecture-First Development
```bash
# Step 1: Gemini analyzes entire codebase for architecture planning
gemini -p "@src/ @lib/ @types/ Analyze the current architecture and suggest optimal approach for [feature/change]"

# Step 2: Claude implements based on Gemini's analysis
# (Claude uses analysis to implement changes)

# Step 3: Cursor Agent for interactive refinement
./cursor-agent-simple.bat agent "Help refine the implementation based on [specific concerns]"
```

### 2. Bug Investigation & Resolution
```bash
# Step 1: Gemini performs comprehensive error analysis
gemini -p "@src/ @logs/ Find all instances related to [bug description] and trace the root cause"

# Step 2: Claude implements targeted fixes
# (Claude applies specific fixes based on Gemini's findings)

# Step 3: Cursor Agent for testing and validation
./cursor-agent-simple.bat agent "Help test and validate the bug fix for [specific scenario]"
```

### 3. Feature Development Pipeline
```bash
# Step 1: Gemini assesses impact and dependencies
gemini -p "@src/ @components/ @lib/ Assess the impact of adding [feature] and identify all affected files"

# Step 2: Claude implements core functionality
# (Claude builds the feature systematically)

# Step 3: Cursor Agent for integration and polish
./cursor-agent-simple.bat agent "Help integrate [feature] with the existing UI and add polish"
```

### 4. Code Quality & Refactoring
```bash
# Step 1: Gemini identifies refactoring opportunities
gemini -p "@src/ Identify code smells, performance issues, and refactoring opportunities"

# Step 2: Claude implements systematic refactoring
# (Claude applies refactoring changes incrementally)

# Step 3: Cursor Agent for validation and optimization
./cursor-agent-simple.bat agent "Review the refactored code and suggest optimizations"
```

## Triumvirate Command Patterns

### Quick Analysis Commands
```bash
# Gemini: Project-wide pattern analysis
gemini -p "@src/ @lib/ How is [pattern/concept] implemented across the codebase?"

# Claude: Targeted implementation
# (Use Claude's tools for specific file operations)

# Cursor: Interactive exploration
./cursor-agent-simple.bat agent "Explore the implementation of [specific component]"
```

### Security & Compliance Audit
```bash
# Gemini: Comprehensive security analysis
gemini -p "@src/ @api/ @lib/ Perform a security audit focusing on [specific concerns]"

# Claude: Fix implementation
# (Apply security fixes identified by Gemini)

# Cursor: Interactive testing
./cursor-agent-simple.bat agent "Help test security measures for [specific scenarios]"
```

### Performance Optimization
```bash
# Gemini: Performance bottleneck identification
gemini -p "@src/ @components/ @lib/ Identify performance bottlenecks and optimization opportunities"

# Claude: Performance improvements implementation
# (Implement specific optimizations)

# Cursor: Performance testing and validation
./cursor-agent-simple.bat agent "Help profile and test performance improvements"
```

## Coordination Strategies

### Task Distribution Rules
1. **Gemini First**: Always use Gemini for initial analysis of large-scale changes or when you need to understand project-wide impact
2. **Claude Implementation**: Use Claude for all direct code changes, file operations, and systematic implementations
3. **Cursor Refinement**: Use Cursor Agent for interactive testing, refinement, and collaborative problem-solving

### Context Passing
1. **Gemini → Claude**: Pass architectural insights and implementation strategies
2. **Claude → Cursor**: Share specific implementation details and testing requirements
3. **Cursor → Claude**: Provide feedback for iterative improvements

### Efficiency Maximization
- Use Gemini's massive context for problems that would exceed Claude's limits
- Leverage Claude's tool access for all file system operations
- Utilize Cursor's interactivity for complex problem-solving sessions
- Always validate implementations across all three perspectives

## Integration Commands

Access the triumvirate through these standardized commands:

```bash
# Gemini CLI (Large-scale analysis)
gemini -p "@relevant/paths Specific analysis request"

# Claude Code (Implementation & coordination)
# Use directly through conversation

# Cursor Agent (Interactive development) - VERIFIED WORKING COMMANDS:
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent agent 'Your request here'"

# Alternative batch file method (once paths are fixed):
./cursor-agent-simple.bat agent "Interactive development request"
./cursor-agent-simple.bat --help  # For all available options
```

## Best Practices for Triumvirate Usage

1. **Start with Architecture**: Always begin complex tasks with Gemini analysis
2. **Implement Systematically**: Use Claude for methodical, step-by-step implementation
3. **Refine Interactively**: Use Cursor Agent for testing, validation, and refinement
4. **Cross-validate**: Have each AI review the others' work when possible
5. **Document Decisions**: Keep track of insights from each AI for future reference

This triumvirate approach ensures maximum efficiency by leveraging each AI's unique strengths while maintaining coordination and avoiding redundant work.

## Cursor Agent Setup and Troubleshooting

### Working Commands Verified
The following commands have been tested and confirmed working:

#### Interactive Mode (Default)
```bash
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent agent 'Your request here'"
```

#### Non-Interactive Mode (Recommended for Scripts)
```bash
# Text output (clean, final response only)
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent --print --output-format text agent 'Your request here'"

# JSON output (structured, parseable)
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent --print --output-format json agent 'Your request here'"

# Stream JSON output (default non-interactive)
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent --print agent 'Your request here'"
```

### Available Cursor Agent Commands
- `agent` - Start the Cursor Agent
- `--help` - Display help information
- `status` - Check authentication status
- `login` - Authenticate with Cursor
- `logout` - Sign out and clear stored authentication
- `update` - Update Cursor Agent to the latest version
- `create-chat` - Create a new empty chat and return its ID
- `resume` - Resume the latest chat session

### Common Issues and Solutions

1. **Path with Spaces Issue**: The directory "Diff AydoSite" contains a space which requires proper escaping in WSL commands.
   - ✅ **Solution**: Use single quotes around the full path: `'/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io'`

2. **User Permission Issues**: Cursor-agent is installed for the `devil` user in WSL.
   - ✅ **Solution**: Use `sudo -u devil` to run as the correct user

3. **Batch File Path Issues**: The existing batch files may have incorrect path formats.
   - ⏳ **Future Fix**: Update batch files with proper path escaping

### Cursor Agent Integration Examples

```bash
# Basic cursor agent call for navigation button styling (example from recent work)
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent agent 'Fix the Services/About/Join/Contact button styling in src/components/Navigation.tsx. Change these buttons from mg-nav-item class to mg-button class to match the Login/Employee Portal button styling.'"

# Debug specific issues
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent agent 'Debug the background gradient animation scroll issue in MissionTemplateCreator.tsx.'"
```

### Performance Notes and Timeout Behavior
- **Timeout is Normal**: Cursor Agent commands timeout after 2 minutes, but this is expected behavior
- **Response Still Completes**: Even when the command times out, the agent usually completes its task successfully
- **Non-Interactive Benefits**: Using `--print --output-format text` provides clean, final responses
- **Best Practice**: Use non-interactive mode for Claude Code integration to get cleaner output

### Why Timeouts Occur and Solutions
Cursor Agent timeouts can occur due to several factors:

#### Root Causes:
1. **Interactive Design**: Cursor Agent waits for additional input even in non-interactive mode
2. **Network/HTTP/2 Issues**: Corporate networks or proxies can cause connectivity problems
3. **File Operation Hanging**: Without `--force` flag, file changes are only proposed, causing hanging
4. **Model Processing**: Some models may have slower response times

#### Solutions to Try:

1. **Use --force Flag for File Operations**:
   ```bash
   # Essential for file modifications to prevent hanging
   wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent -p --force --output-format text 'Your request here'"
   ```

2. **Specify Model Explicitly** (Available models: auto, sonnet-4.5, sonnet-4.5-thinking, gpt-5, opus-4.1, grok):
   ```bash
   # Use specific model for consistent performance
   --model sonnet-4.5
   ```

3. **Check Authentication Status**:
   ```bash
   wsl.exe bash -c "sudo -u devil /home/devil/.local/bin/cursor-agent status"
   ```

4. **Network Configuration** (if behind corporate proxy):
   - Set `"cursor.general.disableHttp2": true` in Cursor settings
   - Check firewall/proxy settings

### Recommended Usage Pattern

#### For File Operations (Use --force to prevent hanging):
```bash
# Optimal command for file modifications
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent -p --force --model sonnet-4.5 --output-format text 'Your file modification request'"
```

#### For Analysis/Questions (No file operations):
```bash
# Simpler command for read-only operations
wsl.exe bash -c "cd '/mnt/c/Users/dasbl/Downloads/Diff AydoSite/dasblueeyeddevil.github.io' && sudo -u devil /home/devil/.local/bin/cursor-agent -p --output-format text 'Your analysis request'"
```

#### Complete Flag Reference:
- `-p` or `--print`: Non-interactive mode
- `--force`: Allow file operations (prevents hanging)
- `--output-format text`: Clean text output (alternatives: json, stream-json)
- `--model sonnet-4.5`: Explicit model selection
- Available models: auto, sonnet-4.5, sonnet-4.5-thinking, gpt-5, opus-4.1, grok

### Timeout Acceptance
Even with optimizations, timeouts may still occur due to cursor-agent's interactive design. **This is normal** - the agent usually completes its work before timing out. The timeout indicates the session ended, not task failure.