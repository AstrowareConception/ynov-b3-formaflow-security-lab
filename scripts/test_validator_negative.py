#!/usr/bin/env python3
"""Exerce les garde-fous du validateur dans des copies temporaires."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from collections.abc import Callable
from pathlib import Path

Mutation = Callable[[Path], None]
EXCLUDED = {".git", ".idea", "_inputs", "node_modules", "dist", "build", "coverage", "artifacts", "generated", "__pycache__"}


def replace(relative: str, old: str, new: str) -> Mutation:
    def mutate(root: Path) -> None:
        path = root / relative
        content = path.read_text(encoding="utf-8")
        if old not in content:
            raise RuntimeError(f"précondition absente pour {relative}: {old}")
        path.write_text(content.replace(old, new, 1), encoding="utf-8", newline="\n")
    return mutate


def remove(relative: str) -> Mutation:
    return lambda root: (root / relative).unlink()


def add(relative: str, content: str) -> Mutation:
    def mutate(root: Path) -> None:
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8", newline="\n")
    return mutate


def mutate_event(root: Path) -> None:
    path = root / "packages/contracts/events/account-deletion-requested.v1.schema.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["properties"]["data"]["additionalProperties"] = True
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


CASES: dict[str, Mutation] = {
    "duration": replace("docs/02-parcours-et-seances.md", "(4 h)", "(5 h)"),
    "assessed": replace("manifest.yml", "assessed: false", "assessed: true"),
    "qcm-graded": replace("docs/02-parcours-et-seances.md", "formatif non noté", "formatif noté"),
    "qcm-content": add("docs/qcm-answers.md", "Contenu d’épreuve interdit\n"),
    "backend-integrity": replace("inputs/backend-reference/README.md", "#", "# altéré\n",),
    "weak-default": replace("package.json", "compose.mjs remediated", "compose.mjs vulnerable"),
    "public-listen": replace("compose.yml", "127.0.0.1:15672", "0.0.0.0:15672"),
    "missing-warning": replace("apps/web-client/index.html", "PROFIL VOLONTAIREMENT VULNÉRABLE", "PROFIL DE LABORATOIRE"),
    "unbounded-scenario": replace("scenarios/xss/README.md", "Nombre maximal de requêtes", "Requêtes"),
    "external-target": add("scenarios/xss/external.md", "URL autorisée : https://outside.invalid/\n"),
    "tracked-secret": add("secrets/private.key", "synthetic-but-forbidden-key-file\n"),
    "negative-test": replace("tests/security/remediated-profile.spec.ts", "toBe(403)", "toBe(401)"),
    "rgpd-requirement": remove("docs/rgpd/requirements.md"),
    "authorization": replace("apps/api-gateway/src/app.controller.ts", "order.owner_id !== actor.sub && actor.role !== 'support'", "false"),
    "handoff-code": add("handoff/audit-method-reference/application.ts", "export const copied = true;\n"),
    "npm-version": replace("package.json", '"packageManager": "npm@11.6.2"', '"packageManager": "npm@10.0.0"'),
    "diagram": remove("docs/rgpd/data-map.svg"),
    "placeholder": add("docs/unresolved.md", "TO" + "DO: contenu non livré\n"),
    "idea-indexed": add(".idea/workspace.xml", "<project/>\n"),
    "csrf": replace("apps/api-gateway/src/app.controller.ts", "x-csrf-token", "x-intent-removed"),
    "bcrypt": replace("apps/api-gateway/src/auth.service.ts", "bcrypt.compare", "removedCompare"),
    "aes-key": add("infra/tls/generated-aes.key", "synthetic-but-forbidden-key-file\n"),
    "event-minimization": mutate_event,
    "privacy-test": remove("tests/privacy/privacy-by-design.spec.ts"),
    "handoff-manifest": replace("handoff/audit-method-reference/MANIFEST.sha256", "0", "1"),
}


def ignore(_directory: str, names: list[str]) -> set[str]:
    return {name for name in names if name in EXCLUDED}


def main() -> int:
    source = Path(__file__).resolve().parents[1]
    failures: list[str] = []
    with tempfile.TemporaryDirectory(prefix="formaflow-validator-negative-") as temporary:
        baseline = Path(temporary) / "baseline"
        shutil.copytree(source, baseline, ignore=ignore)
        for name, mutation in sorted(CASES.items()):
            candidate = Path(temporary) / name
            shutil.copytree(baseline, candidate)
            mutation(candidate)
            result = subprocess.run(
                [sys.executable, str(candidate / "scripts/validate_repository.py"), "--root", str(candidate)],
                capture_output=True, text=True, timeout=60,
            )
            controlled_failure = "ÉCHEC repository:" in (result.stdout + result.stderr)
            if result.returncode == 0 or not controlled_failure:
                failures.append(name)
    if failures:
        print(f"ÉCHEC mutations non détectées: {', '.join(failures)}")
        return 1
    print(f"OK negative-validator mutations={len(CASES)} isolated-temporary-copies=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
