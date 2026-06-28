Use CodeGraph first when locating code or understanding behavior.

- Prefer `codegraph explore` for architecture or flow questions.
- Prefer `codegraph search` or `codegraph node` for symbol lookup before `grep`, `glob`, `Read`, or file-wide scanning.
- Use the built-in file tools only when CodeGraph does not cover the answer or when you already know the exact file that needs inspection.
- After edits, trust the CodeGraph index once it has synced; do not re-scan the repo unnecessarily.
