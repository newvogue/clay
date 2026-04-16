import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class XdgPaths:
    config_dir: Path
    data_dir: Path
    state_dir: Path
    cache_dir: Path


def build_xdg_paths(app_name: str = "clay") -> XdgPaths:
    home = Path.home()
    return XdgPaths(
        config_dir=Path(os.getenv("XDG_CONFIG_HOME", home / ".config")) / app_name,
        data_dir=Path(os.getenv("XDG_DATA_HOME", home / ".local/share")) / app_name,
        state_dir=Path(os.getenv("XDG_STATE_HOME", home / ".local/state")) / app_name,
        cache_dir=Path(os.getenv("XDG_CACHE_HOME", home / ".cache")) / app_name,
    )
