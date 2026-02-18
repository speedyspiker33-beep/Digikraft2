# Multi-Agent Coordination Workflow

## Overview
This system allows multiple AI agents (OpenCode + Claude) to work together seamlessly by defining clear interfaces and coordination protocols.

## The Workflow

### Phase 1: Define the Contract (5 minutes)
**Before any coding happens, both agents agree on:**

```
You: "We need a login system"

Claude + OpenCode together:
- What API endpoint? → POST /api/auth/login
- What data format? → { email, password }
- What response? → { token, user, error? }
- What errors? → 401 (invalid), 422 (validation), 500 (server)
```

**Output**: Updated `CONTRACTS.md`

---

### Phase 2: Parallel Development

**Claude works on:**
```
Backend: Create POST /api/auth/login
Requirements:
- Accept email/password
- Validate input
- Check database
- Return token + user data
- Handle errors properly

Check CONTRACTS.md for exact response format!
```

**OpenCode works on:**
```
Frontend: Create /login page
Requirements:
- Form with email/password
- Call POST /api/auth/login
- Handle success → redirect to dashboard
- Handle errors → show messages

Check CONTRACTS.md for API details!
```

**Key rule**: Both follow the CONTRACT, work independently

---

### Phase 3: Integration

```
You: "Both pieces are done, test them"

1. Start backend server (Claude's code)
2. Start frontend (OpenCode's code)
3. Try logging in
4. If it works → Update sprint.json status
5. If not → Debug together
```

---

## Real Example

### Scenario: Adding a Shopping Cart

**Step 1 - Define Contract (Both AIs)**
```markdown
## Shopping Cart API

### Add Item
POST /api/cart/add
Request: { productId, quantity }
Response: { cartId, items, total }

### Get Cart
GET /api/cart/:cartId
Response: { items, total, itemCount }

### Frontend Component
<CartButton cartId={string} itemCount={number} />
```

**Step 2 - Claude Codes Backend**
```javascript
// apps/api/src/cart/cart.controller.ts
@Post('add')
async addToCart(@Body() dto: AddToCartDto) {
  // Matches contract exactly
  return this.cartService.add(dto.productId, dto.quantity);
}
```

**Step 3 - OpenCode Codes Frontend**
```typescript
// components/CartButton.tsx
interface CartButtonProps {
  cartId: string;
  itemCount: number;
}

export function CartButton({ cartId, itemCount }: CartButtonProps) {
  // Calls API as defined in contract
  const addItem = async (productId: string) => {
    await fetch('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    });
  };
  // ...
}
```

**Step 4 - Integration**
Both pieces work together because they followed the same contract!

---

## Coordination Commands

### When Starting Work:
```
OpenCode: "Starting task: Build login UI"
→ Read CONTRACTS.md
→ Update .planning/sprint.json
→ Check if backend API is ready
→ If not ready, create mock data
```

### When Completing Work:
```
Claude: "Login API complete"
→ Test locally
→ Update CONTRACTS.md status
→ Update .planning/sprint.json
→ Message: "API ready at POST /api/auth/login"
```

### When Blocked:
```
OpenCode: "Blocked: Need cart API from @Claude"
→ Update sprint.json: "blocked_by": "Claude"
→ Create mock data to continue work
→ Or switch to different task
```

---

## Handling Conflicts

### Conflict 1: API Changes
**Problem**: Claude needs to change API response

**Solution**:
1. Claude updates CONTRACTS.md first
2. Claude messages: "API contract updated, see CONTRACTS.md"
3. OpenCode updates frontend to match
4. Both retest

### Conflict 2: Both Working on Same File
**Problem**: Both agents edit `page.tsx`

**Solution**:
1. Always check `.planning/sprint.json` before starting
2. "Active Files" section shows what's locked
3. If conflict, last one to start must wait

### Conflict 3: Integration Fails
**Problem**: Frontend calls API, gets error

**Solution**:
1. Check CONTRACTS.md - did someone deviate?
2. Claude checks: Is backend running? Correct endpoint?
3. OpenCode checks: Is URL correct? Payload correct?
4. Fix whichever side is wrong

---

## Best Practices

### 1. Interface-First Development
**Good**:
```
1. Define API contract
2. Claude builds backend
3. OpenCode builds frontend
4. They integrate perfectly
```

**Bad**:
```
1. Claude builds backend (any way he wants)
2. OpenCode builds frontend (expects different API)
3. Integration fails
4. Both have to rewrite
```

### 2. Mock Data for Parallel Work
If backend isn't ready, frontend creates mock:
```typescript
// Temporary mock
const mockLogin = async (email: string, password: string) => {
  return {
    token: "mock-token-123",
    user: { id: "1", email, name: "Test User" }
  };
};

// Use mock while API is being built
const response = process.env.MOCK ? await mockLogin(email, password) 
                                   : await fetch('/api/auth/login', ...);
```

### 3. Feature Flags
Use feature flags to deploy incomplete work:
```typescript
// app/page.tsx
const showNewFeature = process.env.NEXT_PUBLIC_ENABLE_CART === 'true';

{showNewFeature && <CartButton />}
```

Claude deploys API → safe (no one uses it yet)
OpenCode deploys UI → safe (hidden behind flag)
You enable flag when both ready

---

## Quick Start Checklist

Before starting any feature:

- [ ] Read `CONTRACTS.md` for existing interfaces
- [ ] Define new contract if needed (both agents agree)
- [ ] Update `.planning/sprint.json` with tasks
- [ ] Assign tasks to agents
- [ ] Set dependencies (what needs to be done first)
- [ ] Start coding!

After completing work:

- [ ] Test your piece independently
- [ ] Update status in `CONTRACTS.md`
- [ ] Update `.planning/sprint.json`
- [ ] If integration piece, test together
- [ ] Commit with descriptive message

---

## Emergency Protocol

If everything breaks:
1. Check `CONTRACTS.md` - did someone change interface?
2. Check git history - what files were changed?
3. Revert to last known working state
4. Redefine contract clearly
5. Try again
