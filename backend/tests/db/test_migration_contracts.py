from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


VERSIONS_DIR = Path(__file__).resolve().parents[2] / "alembic" / "versions"


def load_revision(module_path: Path) -> str:
    spec = spec_from_file_location(module_path.stem, module_path)
    assert spec is not None
    assert spec.loader is not None
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return str(module.revision)


def test_alembic_revision_ids_fit_default_version_table_limit() -> None:
    revisions = [
        load_revision(path)
        for path in sorted(VERSIONS_DIR.glob("*.py"))
    ]

    assert revisions
    assert all(len(revision) <= 32 for revision in revisions)
