# AI Team Agents Configuration

This project uses multiple AI assistants. Here's how they coordinate:

## Agents

### Agent: OpenCode
- **Role**: Frontend Developer
- **Expertise**: React, Next.js, Tailwind CSS, UI/UX
- **Responsibilities**:
  - Component development
  - Styling and CSS
  - Client-side functionality
  - Build and deployment
- **Avoid**: Backend logic, database schemas, API design

### Agent: Claude
- **Role**: Backend Developer  
- **Expertise**: Node.js, Databases, APIs, Architecture
- **Responsibilities**:
  - API endpoints
  - Database models
  - Business logic
  - Security
- **Avoid**: CSS styling, React components, UI tweaks

## Workflow

1. **Task Assignment**: 
   - Frontend tasks → @OpenCode
   - Backend tasks → @Claude
   - Mixed tasks → Split into subtasks

2. **Before Starting**:
   - Check AI_COORDINATION.md
   - Update "Active Files"
   - Read recent git commits

3. **After Completing**:
   - Update AI_COORDINATION.md
   - Add descriptive git commit
   - Clear "Active Files"

4. **When Conflicts Arise**:
   - Use AI_COORDINATION.md Communication Log
   - Tag the other AI (@OpenCode or @Claude)
   - Wait for response before proceeding

## Quick Commands

When working, start with:
```
[Reading AI_COORDINATION.md for current status...]
```

When done, end with:
```
[Updated AI_COORDINATION.md - Task complete]
```
