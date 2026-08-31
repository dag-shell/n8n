# Changelog Structure

Each custom change gets its own file following this naming convention:

```
log-[id]-[title].md
```

**Examples:**
- `log-001-sidebar-role-based-visibility.md`
- `log-002-execution-hooks.md`
- `log-003-variable-management.md`

---

## File Template

```md
# log-[id]-[title]

* **Date:** YYYY-MM-DD
* **Type:** Feature | Backend | Frontend / UX | Fix
* **Status:** Active | Deprecated
* **Changes:** Description of what was changed.
* **Files:** `packages/...`
* **Notes:** Compatibility notes or caveats.

## Upgrade Notes

* [ ] Check this change after upstream update
* [ ] Run tests
* [ ] Review conflicts
```
