#!/usr/bin/env python3
"""Construit et vérifie les artefacts déterministes depuis les objets Git."""

from __future__ import annotations

import argparse
import hashlib
import io
import os
import subprocess
import tarfile
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath

VERSION = "1.0.0"
ROOT_NAME = f"ynov-b3-formaflow-security-lab-v{VERSION}"
ZIP_NAME = f"{ROOT_NAME}.zip"
BUNDLE_NAME = f"{ROOT_NAME}-review.bundle"
REFS = [
    "main", "course-start-vulnerable", "checkpoint-recognition",
    "checkpoint-remediated", "checkpoint-privacy", "reference-final",
    "security-lab-v1.0.0",
]
BANNED_PARTS = {".git", "_inputs", ".idea", "node_modules", "dist", "build", "coverage", "artifacts", "generated", "__pycache__"}
BANNED_SUFFIXES = {".key", ".pem", ".p12", ".pfx"}


@dataclass(frozen=True)
class Entry:
    path: str
    mode: int
    data: bytes


def run(root: Path, arguments: list[str], *, binary: bool = False) -> bytes | str:
    result = subprocess.run(
        ["git", "-C", str(root), *arguments], check=True, capture_output=True,
    )
    return result.stdout if binary else result.stdout.decode("utf-8").strip()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def reference_exists(root: Path, reference: str) -> bool:
    result = subprocess.run(["git", "-C", str(root), "rev-parse", "--verify", "--quiet", f"{reference}^{{commit}}"], capture_output=True)
    return result.returncode == 0


def entries_from_git(root: Path, reference: str) -> list[Entry]:
    raw = run(root, ["ls-tree", "-r", "-z", reference], binary=True)
    entries: list[Entry] = []
    for record in raw.split(b"\0"):
        if not record:
            continue
        metadata, raw_name = record.split(b"\t", 1)
        mode_text, object_type, _object_id = metadata.decode("ascii").split()
        name = raw_name.decode("utf-8").replace("\\", "/")
        parts = PurePosixPath(name).parts
        if any(part in BANNED_PARTS for part in parts) or PurePosixPath(name).suffix.lower() in BANNED_SUFFIXES:
            raise RuntimeError(f"entrée interdite suivie par Git: {name}")
        if object_type != "blob":
            raise RuntimeError(f"type Git non distribuable: {name} ({object_type})")
        data = run(root, ["show", f"{reference}:{name}"], binary=True)
        private_key_marker = b"-----BEGIN PRIVATE " + b"KEY-----"
        if private_key_marker in data:
            raise RuntimeError(f"clé privée détectée: {name}")
        entries.append(Entry(name, int(mode_text, 8), data))
    return sorted(entries, key=lambda entry: entry.path)


def build_zip(entries: list[Entry]) -> bytes:
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9, strict_timestamps=True) as archive:
        root = zipfile.ZipInfo(f"{ROOT_NAME}/", date_time=(2026, 1, 1, 0, 0, 0))
        root.create_system = 3
        root.external_attr = (0o40755 << 16) | 0x10
        archive.writestr(root, b"")
        for entry in entries:
            info = zipfile.ZipInfo(f"{ROOT_NAME}/{entry.path}", date_time=(2026, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (entry.mode & 0o777777) << 16
            archive.writestr(info, entry.data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return output.getvalue()


def compare_git_archive(root: Path, reference: str, entries: list[Entry]) -> None:
    raw = run(root, ["archive", "--format=tar", reference], binary=True)
    observed: dict[str, bytes] = {}
    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:") as archive:
        for member in archive.getmembers():
            if member.isfile():
                handle = archive.extractfile(member)
                observed[member.name.replace("\\", "/")] = handle.read() if handle else b""
    expected = {entry.path: entry.data for entry in entries}
    if observed != expected:
        raise RuntimeError("git archive diffère des blobs sélectionnés")


def verify_zip(value: bytes, entries: list[Entry]) -> None:
    with zipfile.ZipFile(io.BytesIO(value)) as archive:
        names = archive.namelist()
        if not names or names[0] != f"{ROOT_NAME}/" or any(not name.startswith(f"{ROOT_NAME}/") for name in names):
            raise RuntimeError("racine ZIP unique absente")
        if archive.testzip() is not None:
            raise RuntimeError("CRC ZIP invalide")
        expected = {f"{ROOT_NAME}/{entry.path}": entry.data for entry in entries}
        observed = {name: archive.read(name) for name in names if not name.endswith("/")}
        if observed != expected:
            raise RuntimeError("contenu ZIP différent du tag")


def reproducibility_checks(root: Path, reference: str, entries: list[Entry], value: bytes) -> None:
    if build_zip(entries) != value:
        raise RuntimeError("deux constructions ZIP diffèrent")
    compare_git_archive(root, reference, entries)
    with tempfile.TemporaryDirectory(prefix="formaflow-release-check-") as temporary:
        temporary_root = Path(temporary)
        checkout = temporary_root / "checkout"
        subprocess.run(["git", "-C", str(root), "worktree", "add", "--detach", str(checkout), reference], check=True, capture_output=True)
        try:
            checkout_commit = run(checkout, ["rev-parse", "HEAD"])
            reference_commit = run(root, ["rev-parse", f"{reference}^{{commit}}"])
            if checkout_commit != reference_commit or entries_from_git(checkout, "HEAD") != entries:
                raise RuntimeError("checkout temporaire différent de la référence")
        finally:
            subprocess.run(["git", "-C", str(root), "worktree", "remove", "--force", str(checkout)], check=True, capture_output=True)

        crlf = temporary_root / "crlf-simulation"
        for entry in entries:
            target = crlf / Path(entry.path)
            target.parent.mkdir(parents=True, exist_ok=True)
            data = entry.data.replace(b"\n", b"\r\n") if b"\0" not in entry.data and b"\n" in entry.data else entry.data
            target.write_bytes(data)
        if build_zip(entries) != value:
            raise RuntimeError("la simulation CRLF influence la construction depuis Git")

        extracted = temporary_root / "extracted"
        with zipfile.ZipFile(io.BytesIO(value)) as archive:
            archive.extractall(extracted)
        rebuilt_entries = [
            Entry(entry.path, entry.mode, (extracted / ROOT_NAME / Path(entry.path)).read_bytes())
            for entry in entries
        ]
        if build_zip(rebuilt_entries) != value:
            raise RuntimeError("reconstruction depuis le ZIP extraite non reproductible")


def create_bundle(root: Path, output: Path) -> None:
    subprocess.run(["git", "-C", str(root), "bundle", "create", str(output), *REFS], check=True)
    lines = run(root, ["bundle", "list-heads", str(output)]).splitlines()
    names = {line.split(" ", 1)[1] for line in lines if " " in line}
    expected = {"refs/heads/main", *(f"refs/tags/{name}" for name in REFS[1:])}
    if names != expected:
        raise RuntimeError(f"références bundle incorrectes: {sorted(names)}")
    subprocess.run(["git", "-C", str(root), "bundle", "verify", str(output)], check=True, capture_output=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    reference = "reference-final" if reference_exists(root, "reference-final") else "HEAD"
    entries = entries_from_git(root, reference)
    value = build_zip(entries)
    verify_zip(value, entries)
    reproducibility_checks(root, reference, entries, value)
    commit = run(root, ["rev-parse", f"{reference}^{{commit}}"])
    if args.verify_only:
        print(f"OK package ref={reference} commit={commit} files={len(entries)} reproducible=2/archive/checkout/crlf/extraction")
        return 0
    if reference != "reference-final" or any(not reference_exists(root, name) for name in REFS):
        raise RuntimeError("les sept références finales sont requises pour produire les artefacts")
    output = (args.output or root.parent / f"{root.name}-release-v{VERSION}").resolve()
    output.mkdir(parents=True, exist_ok=True)
    zip_path = output / ZIP_NAME
    bundle_path = output / BUNDLE_NAME
    zip_path.write_bytes(value)
    create_bundle(root, bundle_path)
    zip_hash = sha256_file(zip_path)
    bundle_hash = sha256_file(bundle_path)
    (output / "SHA256SUMS").write_text(f"{zip_hash}  {ZIP_NAME}\n{bundle_hash}  {BUNDLE_NAME}\n", encoding="utf-8", newline="\n")
    (output / "RELEASE-REPORT.md").write_text(
        "# Rapport de construction V1.0.0\n\n"
        f"- Référence : `reference-final` -> `{commit}`.\n"
        f"- ZIP : `{ZIP_NAME}` ; {len(entries)} fichiers ; SHA-256 `{zip_hash}`.\n"
        f"- Bundle : `{BUNDLE_NAME}` ; sept références exactes ; SHA-256 `{bundle_hash}`.\n"
        "- Reproductibilité : deux constructions, git archive, checkout temporaire, simulation CRLF et reconstruction après extraction identiques.\n"
        "- Exclusions : Git, entrées, IDE, dépendances, builds, secrets, certificats générés, caches et temporaires.\n"
        "- Publication : aucun push effectué par le générateur.\n",
        encoding="utf-8", newline="\n",
    )
    print(f"OK release output={output} zip_sha256={zip_hash} bundle_sha256={bundle_hash}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
