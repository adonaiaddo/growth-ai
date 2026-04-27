# Lessons Learned

## Pattern: LLM agents forget required parameters on multi-step API chains

**Problem**: When the agent has context from earlier steps (e.g., pixel_id from getPixels), it often forgets to pass it in later tool calls (e.g., promoted_object in createAdSet). This wastes API calls and retries.

**Fix strategy** (defense in depth):
1. **Client-side validation** — Fail fast BEFORE hitting the external API. Check required param combos in the tool's `execute` function and return a clear error message telling the agent exactly what's missing. (See `createAdSet` promoted_object guard.)
2. **Tool description emphasis** — Put CRITICAL/MUST requirements directly in the tool description string, not just in param descriptions. The model reads tool descriptions more reliably than param-level docs.
3. **Idempotent guards** — If a "create" tool might fail because the resource exists, check first. (See `createPixel` checking `getPixels` before attempting creation.)

## Pattern: Meta API requires `promoted_object` for conversion goals

- `OFFSITE_CONVERSIONS` / `VALUE` → `{ pixel_id, custom_event_type }`
- `LEAD_GENERATION` → `{ page_id }`
- `APP_INSTALLS` → `{ application_id, object_store_url }`

Always enforce this at the code level, not just prompt level.

## Pattern: Meta only allows one pixel per ad account

Calling `createPixel` when one exists returns error 6200. Always call `getPixels` first.
