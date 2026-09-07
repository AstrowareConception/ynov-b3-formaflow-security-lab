#!/usr/bin/env python3
"""Valide le paquet méthodologique sans dépendance ni accès réseau."""

from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path

REQUIRED = {
    "README.md", "PROVENANCE.md", "VERSIONS.md", "ETHICS.md",
    "method/scope.md", "method/vocabulary.md", "method/prioritization.md",
    "templates/evidence.md", "templates/finding.md", "templates/report.md",
    "examples/neutralized.md", "checklists/retest.md",
    "scripts/validate_handoff.py", "MANIFEST.sha256",
}
CODE_SUFFIXES = {".ts", ".tsx", ".js", ".mjs", ".java", ".cs", ".go", ".sql"}
SECRET = re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\bgh[pousr]_[A-Za-z0-9]{20,}\b")
REAL_EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)


def rel_posix(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def files(root: Path) -> list[Path]:
    return sorted(
        (path for path in root.rglob("*") if path.is_file()),
        key=lambda path: rel_posix(root, path),
    )


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def manifest_lines(root: Path) -> list[str]:
    return [
        f"{digest(path)}  {rel_posix(root, path)}"
        for path in files(root)
        if rel_posix(root, path) != "MANIFEST.sha256"
    ]


def validate(root: Path) -> list[str]:
    errors: list[str] = []
    inventory = files(root)
    relative = {rel_posix(root, path) for path in inventory}
    for name in sorted(REQUIRED):
        if name not in relative:
            errors.append(f"fichier requis absent: {name}")
    for path in inventory:
        name = rel_posix(root, path)
        if path.suffix.lower() in CODE_SUFFIXES:
            errors.append(f"code applicatif interdit: {name}")
        if name.startswith(("apps/", "scenarios/", "tests/security/")):
            errors.append(f"contenu producteur interdit: {name}")
        if path.suffix.lower() in {".md", ".py", ".txt", ""}:
            text = path.read_text(encoding="utf-8", errors="replace")
            if SECRET.search(text):
                errors.append(f"secret manifeste: {name}")
            for email in REAL_EMAIL.findall(text):
                if not email.lower().endswith(("@example.test", "@example.com", "@example.org", ".invalid")):
                    errors.append(f"adresse non réservée: {name}")
    manifest = root / "MANIFEST.sha256"
    if manifest.exists():
        observed = manifest.read_text(encoding="utf-8").splitlines()
        expected = manifest_lines(root)
        if observed != expected:
            errors.append("MANIFEST.sha256 absent, non trié ou incohérent")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--write-manifest", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    if args.write_manifest:
        (root / "MANIFEST.sha256").write_text("\n".join(manifest_lines(root)) + "\n", encoding="utf-8", newline="\n")
    errors = validate(root)
    if errors:
        print(f"ÉCHEC handoff: {len(errors)} anomalie(s)")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"OK handoff files={len(files(root))} integrity=sha256 self-contained=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
