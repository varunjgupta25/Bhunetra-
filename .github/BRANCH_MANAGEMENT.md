# 🌿 Bhunetra Branch Management & Governance Ruleset

This document outlines the branch lifecycle, permissions, and GitHub Ruleset configuration for the **BHUNETRA** repository (**SIH 2026 · Team Code.IT**).

---

## 1. Branch Structure & Roles

| Branch Name | Role | Who Can Push Directly | Allowed Operations |
|---|---|---|---|
| **`main`** *(Default)* | **Production & Live Demo Source of Truth** | **Repository Admin (`@varunjgupta25`) only** | PR Merges, Admin Pushes, Quality Gate Validations |
| **`feat/*`** | Feature development branches | Assigned Developers / Team Members | Create, Update, PR to `main`, Delete after merge |
| **`fix/*`** | Bug fix branches | Assigned Developers / Team Members | Create, Update, PR to `main`, Delete after merge |

---

## 2. Stale / Obsolete Branches Cleanup

The following branches on GitHub are obsolete and should be deleted to keep the repository clean:

1. **`master`** — Outdated branch from repository setup (61 commits behind `main`).
2. **`feat/ui-redesign`** — Archived early prototype branch (59 commits behind `main`).
3. **`copilot/maintain-repo-files`** — Maintenance task branch already merged into `main`.

> **How to delete on GitHub:**
> 1. Go to **[GitHub Repository Branches](https://github.com/varunjgupta25/Bhunetra-/branches)**.
> 2. Click the **Trash Can 🗑️** icon next to `master`, `feat/ui-redesign`, and `copilot/maintain-repo-files`.
> *(If deletion is blocked by a global ruleset, update the ruleset target to `Include default branch (main)` only as explained below).*

---

## 3. Recommended GitHub Ruleset Configuration

To enforce who can update which branch in GitHub:

1. Go to **Settings** → **Rules** → **Rulesets** → Click **New ruleset** (or edit existing ruleset).
2. Set **Ruleset Name**: `Main Branch Protection`.
3. Set **Enforcement status**: `Active`.
4. Under **Target branches**, select:
   - `Include default branch` (`main` only — do not select all branches `**` so feature branches can be deleted).
5. Under **Bypass list**:
   - Add **Repository Admin / Team Leader (`@varunjgupta25`)** with `Always allow` bypass.
6. Under **Rules**:
   - ✅ **Restrict deletions** (Prevents `main` from being deleted).
   - ✅ **Restrict force pushes** (Prevents rewriting `main` git history).
   - ✅ **Require a pull request before merging**:
     - Required approvals: `1`
     - Require review from Code Owners (uses `.github/CODEOWNERS`).
   - ✅ **Require status checks to pass before merging**:
     - `Frontend lint and build`
     - `Backend tests`

---

## 4. CODEOWNERS Review Policy

The [`.github/CODEOWNERS`](./CODEOWNERS) file is configured to automatically request reviews from the Team Leader for:
- `/frontend/` changes
- `/backend/` changes
- `/.github/` CI/CD changes
