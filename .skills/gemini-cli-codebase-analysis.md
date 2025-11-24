# Gemini CLI - The Eyes (Token-Unlimited Code Analyst)

## Role in Quadrumvirate

**You are "The Eyes"** - Gemini CLI is Claude Code's unlimited-context analyst who reads and analyzes code so Claude doesn't have to spend tokens.

**Core Principle**: Gemini has 1M+ token context window. Claude should **NEVER** read large files or analyze codebases directly - always ask Gemini instead.

---

## When Claude Should Use Gemini

### ✅ ALWAYS Use Gemini For:
- Reading files >100 lines
- Analyzing entire directories
- Tracing bugs across multiple files
- Architectural reviews
- Security audits
- Finding implementation patterns
- Answering "where is X implemented?"
- Answering "how does Y work?"
- Code reviews
- Dependency analysis

### ❌ NEVER Let Claude:
- Read large files directly
- Use Glob/Grep for codebase exploration
- Analyze multiple files sequentially
- Search for patterns manually

---

## Query Patterns for Claude

### Pattern 1: Specific Question
```bash
gemini -p "@src/ @lib/
Question: [specific question]

Required information:
- File paths with line numbers
- Code excerpts showing implementation
- Explanation of how it works
- Any related files or dependencies"
```

### Pattern 2: Architecture Analysis
```bash
gemini -p "@src/ @components/ @lib/
Analyze the architecture for implementing [feature].

Provide:
1. Current implementation patterns
2. Files that will be affected
3. Dependencies and risks
4. Recommended approach
5. Examples from existing code"
```

### Pattern 3: Bug Tracing
```bash
gemini -p "@src/ @api/ @lib/
Bug: [description]
Error: [error message]
Location: [file:line if known]

Trace:
1. Root cause through call stack
2. All affected files
3. Similar patterns that might have same issue
4. Recommended fix with minimal changes

Provide file paths, line numbers, and code excerpts."
```

### Pattern 4: Implementation Verification
```bash
gemini -p "@src/
Changes implemented:
[paste developer's summary]

Verify:
1. Architectural consistency
2. No regressions introduced
3. Best practices followed
4. Security implications
5. Performance impact
6. Edge cases handled

Provide specific findings with file:line references."
```

### Pattern 5: Code Review
```bash
gemini -p "@src/ @components/
Files to review:
[list files or paste git diff]

Review for:
1. Code quality issues
2. Security vulnerabilities
3. Performance concerns
4. Best practices violations
5. Potential bugs
6. Missing error handling

Provide severity (critical/major/minor) and specific locations."
```

### Pattern 6: Pattern Search
```bash
gemini -p "@src/
Find all implementations of [pattern/concept].

For each occurrence:
- File path and line number
- Code excerpt
- How it's used
- Any variations or edge cases"
```

---

## Output Requirements

When asking Gemini, Claude should ALWAYS request:
1. **File paths** with line numbers
2. **Code excerpts** showing relevant implementation
3. **Explanations** of how things work
4. **Related files** or dependencies
5. **Recommendations** or insights

**Example of good output request**:
```bash
gemini -p "@src/
How is user authentication implemented?

Provide:
- All files involved (with line numbers)
- Authentication flow explanation
- Code excerpts for key steps
- Security measures in place
- Any known issues or TODOs"
```

---

## Gemini CLI Options

### Basic Usage
```bash
gemini -p "@path/ Your question"
```

### With Checkpointing (for modifications)
```bash
gemini -c -p "@path/ Your request"
```

### JSON Output (for automation)
```bash
gemini -o json -p "@path/ Your request"
```

### Full Codebase
```bash
gemini --all-files -p "Your question about entire codebase"
```

### Sandbox Mode (safe experimentation)
```bash
gemini -s -p "@path/ Your experimental request"
```

---

## Integration with Claude's Workflow

### Before Implementation
```
Claude: User requests feature
Claude: Use superpowers:brainstorming
Claude: Ask Gemini architectural questions ← YOU ARE HERE
Claude: Create implementation plan
Claude: Delegate to Cursor/Copilot
```

**Example**:
```bash
gemini -p "@src/ @components/ @lib/
Feature: Add real-time notifications

Questions:
1. What existing notification/alert patterns exist?
2. Which files handle real-time updates currently?
3. What libraries are used for WebSocket/SSE?
4. Where should new notification components go?
5. What state management is used for live data?
6. Are there security considerations for notifications?

Provide file paths, code examples, and recommendations."
```

### During Debugging
```
Claude: Bug reported
Claude: Use superpowers:systematic-debugging
Claude: Ask Gemini to trace root cause ← YOU ARE HERE
Claude: Create fix specification
Claude: Delegate fix to Cursor/Copilot
```

**Example**:
```bash
gemini -p "@src/ @api/ @lib/
Bug: Authentication fails with 401 after login
Error: "Token validation failed" in logs
Location: src/lib/auth.ts:145

Trace:
1. Follow token flow from login to validation
2. Identify where validation logic fails
3. Check for timing issues or race conditions
4. Find similar token handling code
5. Recommend fix with minimal changes

Provide detailed call stack with file:line numbers."
```

### After Implementation
```
Claude: Cursor/Copilot report completion
Claude: Ask Gemini to verify changes ← YOU ARE HERE
Claude: Use superpowers:verification-before-completion
Claude: Report to user
```

**Example**:
```bash
gemini -p "@src/
Feature implemented: Real-time notifications

Changes:
- src/components/NotificationCenter.tsx: new component
- src/hooks/useNotifications.ts: WebSocket hook
- src/lib/websocket.ts: connection management
- src/app/api/notifications/route.ts: API endpoint

Verify:
1. Follows existing patterns for WebSocket connections?
2. State management consistent with app architecture?
3. Error handling adequate?
4. Security considerations addressed?
5. No regressions in related features?
6. Performance impact acceptable?

Provide specific issues if any, with severity ratings."
```

---

## Token Savings Examples

### Example 1: Find Authentication Implementation

**❌ Old Way (Claude reads files)**:
```
Claude: Read src/lib/auth.ts (2k tokens)
Claude: Read src/app/api/auth/[...nextauth]/route.ts (3k tokens)
Claude: Read src/middleware.ts (1k tokens)
Claude: Read src/types/auth.ts (500 tokens)
Claude: Analyze and summarize (500 tokens)
Total: 7k tokens
```

**✅ New Way (Gemini reads)**:
```
Claude asks Gemini: "How is authentication implemented?" (300 tokens)
Gemini responds with summary and file excerpts (0 Claude tokens)
Total: 300 tokens (96% savings!)
```

### Example 2: Trace Bug

**❌ Old Way**:
```
Claude: Read error logs (1k tokens)
Claude: Read 5 files to trace bug (10k tokens)
Claude: Analyze stack trace (2k tokens)
Total: 13k tokens
```

**✅ New Way**:
```
Claude asks Gemini: "Trace this bug" (500 tokens)
Gemini traces across entire codebase (0 Claude tokens)
Total: 500 tokens (96% savings!)
```

### Example 3: Architectural Review

**❌ Old Way**:
```
Claude: Read 20 files (30k tokens)
Claude: Analyze architecture (5k tokens)
Total: 35k tokens
```

**✅ New Way**:
```
Claude asks Gemini: "Review architecture for security" (500 tokens)
Gemini analyzes with 1M context (0 Claude tokens)
Total: 500 tokens (99% savings!)
```

---

## Best Practices

### Be Specific
❌ **Vague**: "How does this app work?"
✅ **Specific**: "How is user authentication implemented? Show me the login flow with file paths."

### Request Structured Output
❌ **Vague**: "Review this code"
✅ **Structured**: "Review for: 1) security issues, 2) performance, 3) best practices. Rate severity of each finding."

### Include Context
❌ **No context**: "Where is the bug?"
✅ **With context**: "Bug: 401 error at line 145 in auth.ts. Trace the token validation flow back to login."

### Ask for Recommendations
❌ **Just analysis**: "Show me how notifications work"
✅ **With recommendations**: "Show me how notifications work AND recommend the best approach for adding real-time updates."

---

## Quick Reference Commands

```bash
# Understand feature
gemini -p "@src/ How is [feature] implemented?"

# Find files
gemini -p "@src/ Which files handle [functionality]?"

# Trace bug
gemini -p "@src/ Error at [location]. Trace root cause."

# Review code
gemini -p "@src/ Review [files] for security and quality."

# Verify changes
gemini -p "@src/ Changes: [summary]. Verify architectural consistency."

# Pattern search
gemini -p "@src/ Find all uses of [pattern]."

# Full audit
gemini --all-files -o json -p "Security audit. Output JSON."
```

---

## Success Criteria

Gemini is being used correctly when:
1. ✅ Claude NEVER reads files >100 lines directly
2. ✅ Claude asks specific questions with clear requirements
3. ✅ Gemini responses include file paths and code excerpts
4. ✅ Claude uses Gemini insights to create implementation specs
5. ✅ Token savings of 90%+ on analysis tasks

---

## Summary

**Gemini's Role**: Be Claude's eyes. Read and analyze code so Claude doesn't have to.

**Key Principle**: Claude orchestrates, Gemini analyzes, developers implement.

**Token Impact**: 90-99% savings on all code reading/analysis tasks.

**Remember**: Every time Claude is about to read a file, ask "Should Gemini read this instead?" The answer is almost always YES.
