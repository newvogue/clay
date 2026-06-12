# Инцидент-лог (FOOTGUN A)

## INC-001: pytest → live 5432 (2026-06-12)

**Контекст:** `IngestionSettings` в pydantic-settings не имеет `env_file`.
При отсутствии явного `CLAY_DATABASE_URL` bootstrap дефолтит на `localhost:5432`
(live TimescaleDB). В тестах module-level singleton `_services` загружается
при импорте bootstrap, и если ambient env не задаёт DSN — тесты ходят в live.

**Проявление:** 440→439 pytest (flaky, зависит от local .env окружения),
`@pytest.fixture(scope="session", autouse=True)` в conftest.py с
`os.environ.setdefault("CLAY_DATABASE_URL", ...)` — неявно жил от окружения.

**Фикс (5c.1, commit `00adb03`):**
- `tests/conftest.py`: `os.environ.setdefault("CLAY_DATABASE_URL")` с
  file-based SQLite (создание таблиц до загрузки bootstrap).
- Герметизация singleton под pytest: `_services` пересоздаётся в каждой
  тестовой сессии с корректным DSN.
- Обязательный явный `CLAY_DATABASE_URL` для attended smoke.

**Статус:** закрыт (5c.1). FOOTGUN A (env_file) — отдельный fix-слайс.
