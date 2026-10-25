"""Shared fixtures: import scripts/build_data.py and run one in-memory build per session."""

import importlib.util
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]


def _load_builder():
    spec = importlib.util.spec_from_file_location("build_data", ROOT / "scripts" / "build_data.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["build_data"] = mod
    spec.loader.exec_module(mod)
    return mod


@pytest.fixture(scope="session")
def bd():
    return _load_builder()


@pytest.fixture(scope="session")
def build(bd):
    return bd.build(write=False)


@pytest.fixture(scope="session")
def data(build):
    return build["data"]
