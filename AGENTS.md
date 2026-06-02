# Правила для AI-агента

Этот проект использует `.context/` для долгосрочной памяти.

Перед началом работы прочитай:
1. `.context/README.md` — как устроена память
2. `.context/state.md` — текущее состояние
3. `.context/handoffs/current.md` — последнее задание

После работы обнови:
1. `.context/reports/last.md` — что сделал
2. `.context/state.md` — что изменилось
3. Опционально: `.context/observations/YYYY-MM/obs-NNN.md` — заметки

Конвенции:
- Не пиши бинарные файлы в `.context/`
- Коммить `.context/` в git
- Используй формат записей: Контекст → Решение → Why / How to apply
- Ссылайся на ID: `#obs-2026-06-01-001`, `#decision-0001`
- Privacy: тег `<private>` в начале body исключает из индекса

Стиль общения с пользователем (русский, кратко, эмодзи, пошаговое подтверждение) — см. `~/.opencode/AGENTS.md` и `~/.opencode/memory/communication-rules.md`.
