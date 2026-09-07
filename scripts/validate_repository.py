#!/usr/bin/env python3
"""Valide la référence Security Lab sans accès réseau."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

EXCLUDED = {".git", "_inputs", "node_modules", "dist", "build", "coverage", "artifacts", "generated", "__pycache__"}
REQUIRED = {
    "apps/api-gateway/src/app.controller.ts", "apps/enrollment-service/src/main.ts", "apps/web-client/index.html",
    "packages/contracts/openapi/security-lab.openapi.json", "packages/security/src/crypto.ts",
    "infra/postgres/init/001-schema.sql", "infra/rabbitmq/README.md", "infra/tls/nginx.conf",
    "scenarios/sql-injection/README.md", "scenarios/xss/README.md", "scenarios/csrf/README.md",
    "scenarios/idor/README.md", "scenarios/broken-auth/README.md",
    "tests/security/vulnerable-profile.spec.ts", "tests/security/remediated-profile.spec.ts",
    "tests/security/cookie-profile.spec.ts", "tests/privacy/privacy-by-design.spec.ts",
    "docs/rgpd/data-map.md", "docs/rgpd/data-map.mmd", "docs/rgpd/data-map.svg",
    "docs/rgpd/register.md", "docs/rgpd/privacy-backlog.md", "docs/rgpd/requirements.md",
    "docs/rgpd/minimization-matrix.md", "docs/rgpd/retention-matrix.md", "docs/rgpd/rights-procedures.md",
    "evidence/recognition/provided-sqli.md", "evidence/remediation/provided-remediations.md",
    "evidence/audit/provided-mini-audit.md", "reports/remediation.md",
    "handoff/audit-method-reference/MANIFEST.sha256", "handoff/audit-method-reference/scripts/validate_handoff.py",
    "inputs/backend-reference/MANIFEST.sha256", "scripts/test_validator_negative.py",
}


class Report:
    def __init__(self) -> None:
        self.checks = 0
        self.errors: list[str] = []

    def check(self, condition: bool, message: str) -> None:
        self.checks += 1
        if not condition:
            self.errors.append(message)


def rel_posix(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def release_files(root: Path) -> list[Path]:
    return sorted(
        (
            path for path in root.rglob("*")
            if path.is_file() and not any(part in EXCLUDED for part in path.relative_to(root).parts)
        ),
        key=lambda path: rel_posix(root, path),
    )


def tracked_files(root: Path) -> list[str]:
    if (root / ".git").exists():
        result = subprocess.run(
            ["git", "-C", str(root), "ls-files", "-z"], capture_output=True, check=True,
        ).stdout.decode("utf-8").split("\0")
        return sorted((item.replace("\\", "/") for item in result if item), key=str.casefold)
    excluded_without_git = {".git", "node_modules", "dist", "build", "coverage", "artifacts", "generated", "__pycache__"}
    return sorted(
        (
            rel_posix(root, path) for path in root.rglob("*")
            if path.is_file() and not any(part in excluded_without_git for part in path.relative_to(root).parts)
        ),
        key=str.casefold,
    )


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def text(root: Path, name: str) -> str:
    path = root / name
    return path.read_text(encoding="utf-8") if path.exists() else ""


def validate_manifest(root: Path, manifest_name: str, report: Report) -> None:
    manifest = root / manifest_name
    if not manifest.exists():
        report.check(False, f"manifeste absent: {manifest_name}")
        return
    base = manifest.parent
    entries: list[tuple[str, str]] = []
    for line in manifest.read_text(encoding="utf-8").splitlines():
        match = re.fullmatch(r"([0-9a-f]{64})  (.+)", line)
        report.check(match is not None, f"ligne de manifeste invalide: {manifest_name}")
        if match:
            entries.append((match.group(1), match.group(2).replace("\\", "/")))
    for expected, relative in sorted(entries, key=lambda item: item[1]):
        candidate = base / Path(relative)
        report.check(candidate.is_file(), f"fichier manifesté absent: {manifest_name}:{relative}")
        if candidate.is_file():
            report.check(sha256(candidate) == expected, f"empreinte incohérente: {manifest_name}:{relative}")


def validate(root: Path) -> Report:
    report = Report()
    inventory = {rel_posix(root, path) for path in release_files(root)}
    tracked = tracked_files(root)
    for required in sorted(REQUIRED):
        report.check(required in inventory, f"fichier obligatoire absent: {required}")

    package = json.loads(text(root, "package.json") or "{}")
    report.check(package.get("name") == "ynov-b3-formaflow-security-lab", "identité du repository incorrecte")
    report.check(package.get("version") == "1.0.0", "version package incorrecte")
    report.check(package.get("packageManager") == "npm@11.6.2", "mauvaise version npm packageManager")
    report.check(package.get("engines") == {"node": ">=24.13.0 <25", "npm": ">=11.6.2 <12"}, "engines incohérents")
    report.check(text(root, ".nvmrc").strip() == "24.13.0", ".nvmrc incohérent")
    direct = {**package.get("dependencies", {}), **package.get("devDependencies", {})}
    for name, version in {"@nestjs/common": "11.2.3", "typescript": "6.0.3", "jest": "30.5.1"}.items():
        report.check(direct.get(name) == version, f"dépendance directe incorrecte: {name}")
    report.check(all(re.fullmatch(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?", value) for value in direct.values()), "dépendance directe non épinglée")

    manifest = text(root, "manifest.yml")
    for marker in ["version: 1.0.0", "status: ready-for-release", "duration_hours: 14", "ffp_hours: 7", "tdp_hours: 7", "assessed: false", "graded: false"]:
        report.check(marker in manifest, f"vérité pédagogique absente: {marker}")
    sessions = text(root, "docs/02-parcours-et-seances.md")
    session_hours = re.findall(r"(?m)^##\s+\d+.+\((\d+) h\)$", sessions)
    report.check(session_hours == ["4", "3", "4", "3"], "durées de séances différentes de 4/3/4/3")
    report.check("QCM individuel formatif non noté de 30 minutes" in sessions, "QCM formatif de 30 minutes absent")
    qcm = text(root, "docs/09-validation-et-branches.md")
    report.check("validé dans son principe par Ynov" in qcm, "validation de principe du QCM absente")
    prohibited_qcm = re.compile(r"(?i)\b(?:\d+\s+questions?|\d+\s+points?|score\s+sur|barème|réponses?\s+du\s+QCM|corrigé\s+du\s+QCM|variantes?\s+du\s+QCM)\b")
    report.check(prohibited_qcm.search(qcm) is None, "contenu réel ou barème de QCM détecté")
    report.check(not any("qcm" in name.casefold() for name in tracked), "fichier dédié au contenu du QCM détecté")

    scripts = package.get("scripts", {})
    report.check(scripts.get("start") == "node scripts/compose.mjs remediated", "profil vulnérable lancé implicitement")
    compose = text(root, "compose.yml")
    ports = re.findall(r'- "([^"\n]+:[^"\n]+)"', compose)
    report.check(bool(ports) and all(port.startswith("127.0.0.1:") for port in ports), "écoute publique détectée")
    report.check("name: formaflow-security-lab" in compose, "nom de projet Docker absent")
    profile_source = text(root, "apps/api-gateway/src/profile.ts")
    report.check("LAB_PROFILE doit être explicitement" in profile_source, "profil inconnu non fermé")
    report.check("PROFIL VOLONTAIREMENT VULNÉRABLE" in text(root, "apps/web-client/index.html"), "avertissement visuel vulnérable absent")
    report.check("VOLONTAIREMENT VULNÉRABLE" in text(root, "scripts/compose.mjs"), "avertissement de démarrage absent")
    report.check("down', '--volumes', '--remove-orphans'" in text(root, "scripts/compose.mjs"), "arrêt/reset Docker non ciblé ou incomplet")

    database = text(root, "apps/api-gateway/src/database.ts")
    report.check(database.count("const sql = `SELECT") == 1 and "vulnerableCatalogSearch" in database, "adaptateur SQL faible absent ou dupliqué")
    report.check("ILIKE '%' || $1 || '%'" in database, "requête SQL paramétrée absente")
    controller = text(root, "apps/api-gateway/src/app.controller.ts")
    report.check("order.owner_id !== actor.sub && actor.role !== 'support'" in controller, "contrôle d’autorisation corrigé absent")
    report.check("x-csrf-token" in controller.casefold() and "origin !==" in controller and "reauthenticate" in controller, "protection CSRF corrigée absente")
    auth = text(root, "apps/api-gateway/src/auth.service.ts")
    report.check("bcrypt.compare" in auth and "BCRYPT_COST = 12" in auth and "expiresIn: '15m'" in auth, "authentification corrigée incomplète")
    report.check("textContent=data.bio" in text(root, "apps/web-client/app.remediated.js"), "rendu XSS corrigé absent")

    for scenario in ["sql-injection", "xss", "csrf", "idor", "broken-auth"]:
        content = text(root, f"scenarios/{scenario}/README.md")
        for marker in ["Objectif pédagogique", "Profil requis", "URL autorisée", "Nombre maximal de requêtes", "Résultat attendu", "Preuve autorisée", "Preuves interdites", "Commande de reset", "Limites et risque résiduel"]:
            report.check(marker in content, f"scénario {scenario} incomplet: {marker}")
        urls = re.findall(r"https?://[^\s`)]+", content)
        report.check(all(re.match(r"https?://(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:/|$)", url) for url in urls), f"cible extérieure dans {scenario}")
    scenario_files = sorted((root / "scenarios").rglob("*"), key=lambda path: rel_posix(root, path))
    for path in (item for item in scenario_files if item.is_file()):
        content = path.read_text(encoding="utf-8", errors="replace")
        urls = re.findall(r"https?://[^\s`)]+", content)
        report.check(all(re.match(r"https?://(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:/|$)", url) for url in urls), f"cible extérieure: {rel_posix(root, path)}")

    remediated_tests = text(root, "tests/security/remediated-profile.spec.ts")
    report.check("toBe(403)" in remediated_tests and "toBe(200)" in remediated_tests and "apostrophe" in remediated_tests, "tests positifs/négatifs/non-régression absents")
    report.check("LAB_PROFILE_TEST" in text(root, "scripts/security-tests.mjs") and "Profil ambigu" in text(root, "scripts/security-tests.mjs"), "profil de tests de sécurité ambigu")
    report.check("AbortSignal.timeout" in remediated_tests, "délais de sécurité non bornés")

    crypto = text(root, "docs/crypto/decisions.md") + text(root, "packages/security/src/crypto.ts")
    for marker in ["bcrypt", "AES-256-GCM", "nonce", "rotation", "altération", "anonymisation"]:
        report.check(marker.casefold() in crypto.casefold(), f"décision crypto absente: {marker}")
    report.check("127.0.0.1:3443" in compose and "infra/tls/generated" in text(root, ".gitignore"), "TLS local ou exclusion de clé absent")

    requirements = text(root, "docs/rgpd/requirements.md")
    report.check(len(set(re.findall(r"PBD-\d{2}", requirements))) >= 5, "moins de cinq exigences Privacy by Design")
    report.check("test automatisé" in requirements, "exigences RGPD non automatisées")
    privacy_tests = text(root, "tests/privacy/privacy-by-design.spec.ts")
    for marker in ["export", "retrait", "effacement", "événements", "journaux", "rectification"]:
        report.check(marker in privacy_tests, f"test RGPD absent: {marker}")
    event_schema = json.loads(text(root, "packages/contracts/events/account-deletion-requested.v1.schema.json") or "{}")
    report.check(event_schema.get("properties", {}).get("data", {}).get("additionalProperties") is False, "minimisation événement supprimée")
    report.check("optional-newsletter" in controller and "policyVersion" in controller, "retrait de consentement absent")
    enrollment = text(root, "apps/enrollment-service/src/main.ts")
    report.check(all(marker in enrollment for marker in ["erasure-requested", "DELETE FROM notifications", "UPDATE consents", "COMMIT"]), "propagation d’effacement incomplète")

    sources = sorted((root / "docs").rglob("*.mmd"), key=lambda path: rel_posix(root, path))
    report.check(len(sources) >= 8, "diagrammes Mermaid insuffisants")
    for source in sources:
        rendered = source.with_suffix(".svg")
        report.check(rendered.is_file() and "<svg" in rendered.read_text(encoding="utf-8", errors="replace"), f"SVG absent: {rel_posix(root, rendered)}")

    report.check(len(list((root / "evidence/recognition").glob("*.md"))) >= 5, "preuves de reconnaissance insuffisantes")
    report.check((root / "evidence/remediation/provided-remediations.md").exists(), "preuve de remédiation absente")
    report.check((root / "evidence/audit/provided-mini-audit.md").exists(), "preuve d’audit absente")
    transfer = json.loads(text(root, "docs/cdan/transfer.json") or "{}")
    report.check(transfer.get("module") == "security-rgpd" and transfer.get("status") == "verified", "fiche CDAN incompatible")

    validate_manifest(root, "inputs/backend-reference/MANIFEST.sha256", report)
    validate_manifest(root, "handoff/audit-method-reference/MANIFEST.sha256", report)
    handoff_validator = root / "handoff/audit-method-reference/scripts/validate_handoff.py"
    if handoff_validator.exists():
        result = subprocess.run([sys.executable, str(handoff_validator), "--root", str(handoff_validator.parents[1])], capture_output=True, text=True, timeout=30)
        report.check(result.returncode == 0, "validateur handoff en échec")

    makefile = text(root, "Makefile")
    for target in ["setup", "start-vulnerable", "start-remediated", "stop", "reset-data", "smoke", "test", "security-tests", "tls", "quality"]:
        report.check(re.search(rf"(?m)^{re.escape(target)}:", makefile) is not None, f"cible Make absente: {target}")
    for command in ["validate", "test:negative", "contracts", "diagrams", "handoff", "test:postgres", "test:rabbitmq", "test:e2e", "package", "quality"]:
        report.check(command in scripts, f"script npm absent: {command}")

    banned_parts = {".idea", "_inputs", "node_modules", "dist", "build", "coverage", "artifacts"}
    report.check(not any(any(part in banned_parts for part in Path(name).parts) for name in tracked), "artefact ou répertoire interdit indexé")
    for name in tracked:
        path = root / Path(name)
        if path.suffix.lower() in {".key", ".pem", ".p12", ".pfx"} or (path.name == ".env"):
            report.check(False, f"secret ou clé indexé: {name}")
        if path.is_file() and path.suffix.lower() in {".md", ".json", ".yml", ".yaml", ".ts", ".js", ".mjs", ".py", ".txt", ""} and name != "package-lock.json" and not name.startswith("inputs/backend-reference/"):
            content = path.read_text(encoding="utf-8", errors="replace")
            report.check("-----BEGIN PRIVATE KEY-----" not in content, f"clé privée manifeste: {name}")
            if not name.startswith(("evidence/templates/", "handoff/audit-method-reference/templates/")):
                placeholder_terms = "TO" + "DO|FIX" + "ME|T" + "BD|à compléter|sera ajouté|restent à produire"
                report.check(re.search(rf"(?i)\b(?:{placeholder_terms})\b", content) is None, f"placeholder non autorisé: {name}")
            for email in re.findall(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", content, re.IGNORECASE):
                report.check(email.lower().endswith(("@example.test", "@example.com", "@example.org", ".invalid")), f"adresse non synthétique: {name}")
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    report = validate(root)
    if report.errors:
        print(f"ÉCHEC repository: {len(report.errors)} anomalie(s) sur {report.checks} contrôles")
        for error in report.errors:
            print(f"- {error}")
        return 1
    print(f"OK repository checks={report.checks} inventory=POSIX security=local privacy=verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
