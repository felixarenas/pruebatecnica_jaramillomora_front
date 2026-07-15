---
name: changelog-manager
description: Manages the project's CHANGELOG.md file, ensuring all changes are documented following the Keep a Changelog standard. Use this skill whenever a commit is being prepared or when explicitly asked to update the changelog.
---

# Changelog Manager Skill

You are responsible for maintaining a clear and structured `CHANGELOG.md` file at the project root. This file documents all notable changes to the project.

## Standard Format

We follow the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) standard.

### Sections

All changes should be grouped into the following sections:
- **Added**: For new features.
- **Changed**: For changes in existing functionality.
- **Deprecated**: For soon-to-be removed features.
- **Removed**: For now removed features.
- **Fixed**: For any bug fixes.
- **Security**: In case of vulnerabilities.

### Versioning

Entries should be added under the `## [Unreleased]` header. When a new version is released, the `[Unreleased]` section is moved to a new version header with the current date.

## Instructions for the Agent

When asked to update the changelog (usually as part of a commit):

1. **Get Current Time:** This MUST be your first step. Obtain the current system date and time in the format `[day/month/year hour:minutes:seconds]`.
2. **Analyze Changes:** Identify what has changed (use `git diff --staged` if called during a commit process).
3. **Determine Section:** Categorize each change into one of the standard sections (Added, Changed, etc.).
4. **Format Entry:** Write a concise, bulleted description of the change, prefixed with the timestamp.
    - Example: `- [07/05/2026 23:30:00] Add JWT authentication for login endpoints`
5. **Update File:**
    - If `CHANGELOG.md` doesn't exist, create it with the standard boilerplate.
    - Find the `## [Unreleased]` section.
    - Insert the new entry under the appropriate subsection. If the subsection (e.g., `### Added`) doesn't exist under `[Unreleased]`, create it.
    - Ensure there is exactly one blank line between sections.

### CHANGELOG.md Boilerplate (if creating new)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure.
```

## Integration with Commiter

When used alongside the `commiter` skill, ensure the changelog entry accurately reflects the commit message and body. The changelog update should ideally be staged together with the other changes so they are committed as a single unit.
