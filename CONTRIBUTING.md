# Contributing to AXIOM

## Branch Strategy

```
main         ← production
  └─ dev     ← staging / integration
      └─ feature/phase-X-short-description
      └─ fix/short-description
```

Always branch from `dev`. PRs go into `dev`. `dev` → `main` on release.

## Workflow

```bash
git checkout dev
git pull origin dev
git checkout -b feature/phase-3-auth
# ... make changes ...
git push origin feature/phase-3-auth
# Open PR → dev
```

## Commit Style

```
type: short description

Types: feat | fix | chore | docs | refactor | test | style
```

Examples:
- `feat: add JWT refresh token endpoint`
- `fix: correct ATS score calculation`
- `chore: update prisma client`

## Running Before PR

```bash
pnpm lint        # no errors
pnpm typecheck   # no errors
pnpm test        # all pass
pnpm build       # succeeds
```

## PR Rules

- Target branch: `dev`
- Requires 1+ reviewer approval
- CI must pass
- No `.env` files committed
