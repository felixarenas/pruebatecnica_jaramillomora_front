---
name: commiter
description: Commits changes to the repository in a structured way using Conventional Commits format
---

# Committer Skill

You are responsible for making well-structured and descriptive git commits using the **Conventional Commits** specification.

## Commit Message Format

Every commit message must be structured exactly as follows:

```text
<type>[optional scope]: <description>

[body]

[optional footer(s)]
```

### 1. Header (Type, Scope, and Description)

The first line (the header) **MUST NOT exceed 50 characters** in length.

#### `<type>`
Must be one of the following:
- ✨ **feat**: A new feature for the user or app.
- 🐛 **fix**: A bug fix.
- 📚 **docs**: Documentation only changes.
- 💎 **style**: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc).
- ♻️ **refactor**: A code change that neither fixes a bug nor adds a feature.
- ⚡️ **perf**: A code change that improves performance.
- 🧪 **test**: Adding missing tests or correcting existing tests.
- 📦 **build**: Changes that affect the build system or external dependencies.
- 👷 **ci**: Changes to our CI configuration files and scripts.
- 🧹 **chore**: Other changes that don't modify src or test files.
- ⏪️ **revert**: Reverts a previous commit.

#### `[optional scope]`
Optional. Indicates the specific area of the codebase the commit affects. Enclose in parentheses, e.g., `feat(auth):`.

#### `<description>`
A succinct description of the change:
- **Maximum length of the entire header (type + scope + description) is 50 characters.**
- Use the imperative, present tense: "add feature" not "added feature".
- Don't capitalize the first letter.
- Do not include a period (.) at the end.

### 2. Body (Extensive Description)

The body **MUST** be included to provide an extensive explanation of the changes.

- It must be separated from the header by a single blank line.
- Use it to explain **WHAT** was changed, **WHY** it was changed, and **HOW** it works.
- Detail the motivation for the change and contrast this with previous behavior.
- There is no strict length limit for the body, but lines should ideally be wrapped at 72 characters.

### 3. Footer (Optional)

The footer should contain any information about Breaking Changes or references to issue trackers.
- Breaking changes must start with the words `BREAKING CHANGE:` followed by a space or two newlines.

---

## Instructions for the Agent

When asked to commit changes, follow these strict rules:
1. **Analyze:** Carefully review the staged changes (`git diff --staged` or `git status`) to understand exactly what was modified.
2. **Determine Type:** Select the single most appropriate `<type>`.
3. **Update Changelog:** Before committing, use the `changelog-manager` skill to add a new entry to `CHANGELOG.md` describing the changes. Ensure the `CHANGELOG.md` file is staged (`git add CHANGELOG.md`).
4. **Draft Header (Max 50 chars):** Write a concise, imperative description. Count the characters! The combined length of `<type>(<scope>): <description>` MUST be 50 characters or less.
5. **Draft Body (Extensive):** Write a detailed, multi-line explanation of the changes. Detail the logic, reasoning, and context behind the modifications. Do not just repeat the header.
6. **Commit:** Execute the commit using the drafted message. Use a method that allows multi-line commits, such as piping the full message into `git commit -F -`.

### Example Commit

```text
feat(auth): add jwt login

Implemented JSON Web Token (JWT) based authentication
to replace the legacy session-based system. This change
improves scalability since the backend no longer needs
to store session state in the database.

It also introduces new endpoints for token generation
and validation. Middleware was updated to extract and
verify the Bearer token from the Authorization header.
```
