#!/usr/bin/env python3
"""Validate this copied handoff using only the Python standard library."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "MANIFEST.sha256"
REQUIRED = {
    "README.md",
    "manifest.json",
    "PROVENANCE.md",
    "VERSIONS.md",
    "architecture.md",
    "ownership.yml",
    "jwt-and-authorization.md",
    "flows.md",
    "identity-data-logs-messages.md",
    "failure-scenarios.md",
    "surfaces-and-trust.md",
    "decisions-dependencies-risks.md",
    "OPERATIONS.md",
    "fixtures/synthetic-personal-data.json",
    "fixtures/reference-flow.json",
    "contracts/openapi/order-api.openapi.json",
    "contracts/proto/catalog-availability.v1.proto",
    "contracts/events/order-confirmed.v1.schema.json",
    "contracts/events/enrollment-created.v1.schema.json",
    "collections/formaflow-security-reference.postman_collection.json",
    "scripts/validate_handoff.py",
}


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(65536), b""):
            value.update(block)
    return value.hexdigest()


def inventory() -> dict[str, str]:
    result: dict[str, str] = {}
    for path in sorted(ROOT.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"symlink forbidden: {path.relative_to(ROOT)}")
        if path.is_file() and path != MANIFEST:
            rel = path.relative_to(ROOT).as_posix()
            pure = PurePosixPath(rel)
            if pure.is_absolute() or ".." in pure.parts or "\\" in rel:
                raise ValueError(f"non-portable path: {rel}")
            result[rel] = digest(path)
    return result


def read_manifest() -> dict[str, str]:
    result: dict[str, str] = {}
    for line in MANIFEST.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        match = re.fullmatch(r"([0-9a-f]{64})  (.+)", line)
        if not match or match.group(2) in result:
            raise ValueError(f"invalid manifest line: {line}")
        result[match.group(2)] = match.group(1)
    return result


def main() -> int:
    errors: list[str] = []
    try:
        actual = inventory()
        expected = read_manifest()
        if actual != expected:
            errors.append("MANIFEST.sha256 does not match the exact file inventory")
    except (OSError, ValueError) as error:
        errors.append(str(error))
        actual = {}

    for rel in sorted(REQUIRED):
        if rel not in actual:
            errors.append(f"missing required file: {rel}")

    for path in ROOT.rglob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            errors.append(f"invalid JSON {path.relative_to(ROOT)}: {error}")

    manifest_data = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    if not manifest_data.get("selfContained") or manifest_data.get("studentCodeIncluded"):
        errors.append("handoff autonomy or student-code policy is invalid")

    for path in ROOT.rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        for target in re.findall(r"\[[^]]*\]\(([^)]+)\)", text):
            if re.match(r"^[a-z]+://", target) or target.startswith("#"):
                continue
            resolved = (path.parent / target.split("#", 1)[0]).resolve()
            if ROOT not in resolved.parents and resolved != ROOT:
                errors.append(f"outgoing handoff path: {path.relative_to(ROOT)} -> {target}")

    text_files = [path for path in ROOT.rglob("*") if path.is_file() and path != MANIFEST]
    combined = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in text_files)
    if re.search(r"(?i)(gmail\.com|outlook\.com|yahoo\.com)", combined):
        errors.append("plausible personal email provider found")
    if re.search(r"(?i)(api[_-]?key|client[_-]?secret)\s*[:=]\s*[A-Za-z0-9+/]{20,}", combined):
        errors.append("plausible secret found")
    if any(path.suffix in {".ts", ".js"} for path in ROOT.rglob("*")):
        errors.append("student or runtime implementation code is forbidden in the handoff")

    sources = {path.stem for path in (ROOT / "diagrams").glob("*.mmd")}
    renders = {path.stem for path in (ROOT / "diagrams").glob("*.svg")}
    if len(sources) < 8 or sources != renders:
        errors.append("diagram source/render pairs are incomplete")

    if errors:
        print(f"FAIL security handoff validation: {len(errors)} error(s)")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"OK security handoff: files={len(actual)} diagrams={len(sources)} self-contained=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
