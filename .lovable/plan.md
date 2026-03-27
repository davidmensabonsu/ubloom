

## Fix: Suggested Prompts Not Appearing After Messages

### Root Cause
The edge function manually constructs a JSON string containing the prompts block, but doesn't escape the inner JSON properly. The generated SSE line looks like:

```text
data: {"choices":[{"delta":{"content":"<!--PROMPTS:["What are...","How do..."]-->"}}]}
```

The unescaped quotes inside the content string make this invalid JSON. The client's `JSON.parse()` fails silently, so the prompt comment is never appended to `assistantSoFar`, and `extractPrompts` finds nothing.

### Fix

**`supabase/functions/ubi-chat/index.ts`** (~line 163): Properly escape the prompts JSON before embedding it in the outer JSON string. Replace the manual string interpolation with `JSON.stringify()` for the entire content value:

```typescript
// Before (broken):
const promptBlock = `\n\ndata: {"choices":[{"delta":{"content":"<!--PROMPTS:${JSON.stringify(prompts)}-->"}}]}\n\n`;

// After (fixed):
const promptContent = `<!--PROMPTS:${JSON.stringify(prompts)}-->`;
const promptBlock = `\n\ndata: ${JSON.stringify({ choices: [{ delta: { content: promptContent } }] })}\n\n`;
```

This ensures all inner quotes are properly escaped in the SSE data line.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/ubi-chat/index.ts` | Fix JSON serialization of the prompts SSE block |

