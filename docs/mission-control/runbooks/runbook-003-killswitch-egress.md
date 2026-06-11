# Runbook-003 — Kill-switch и egress (DEPLOY-5 AI-слой)

Дата: 2026-06-10 (обновлён 2026-06-11 — DEPLOY-3.5d: udev-arm + boot-clean)
Статус: active
Связанный эпик: `E5` · `DEPLOY-5`
Связано: ADR-009, runbook-004 (LiteLLM gateway)

## Назначение

Гарантировать, что весь LLM-egress (включая контейнер шлюза LiteLLM) идёт через TUN и never-US, и при падении туннеля система **fail-closed** (0 утечек). Описывает проверку, аварийное поведение и восстановление.

## Когда применять

- Перед «boundary live» (первый реальный внешний вызов модели).
- При падении/переподнятии TUN.
- При плановой проверке egress (периодически).
- При инциденте «подозрение на утечку».

## Роли

- **Оператор (Emma):** единственный, кто трогает туннель (v2rayN GUI TUN + reboot). Поднимает TUN до прогона агентов.
- **Clay/агент:** НЕ перезапускает v2rayN/sing-box (FOOTGUN C); только наблюдает и переходит в degraded.

## Факты (PROVEN 3.5b/3.5c)

- Anchor kill-switch: `meta skuid 1000` (uid emma).
- `table inet clay_killswitch`; allow4 `{192.168.0.0/24,10.88.0.0/16,10.89.0.0/24,172.18.0.0/30,224.0.0.0/4,255.255.255.255}`, allow6 `{fe80::/10,ff00::/8}`.
- Модель арма (DEPLOY-3.5d): **udev-триггер на интерфейсе sing-box + fail-closed latch + ручной disarm**. Файлы в `/etc` (НЕ в git):
	- `/etc/systemd/system/clay-killswitch.service` — `Type=oneshot`, `RemainAfterExit=yes`, **без `[Install]`** (→ `static`, на бут НЕ армится), `After=nftables.service`, `DefaultDependencies=no`. `ExecStart=nft -f /etc/clay-killswitch.nft`, `ExecStop=nft -f /etc/clay-killswitch-clean.nft`.
	- `/etc/udev/rules.d/99-clay-killswitch.rules` — `ACTION=="add", SUBSYSTEM=="net", KERNEL=="singbox_tun"` → `SYSTEMD_WANTS=clay-killswitch.service` (арм при поднятии TUN). **Нет правила на `remove`** → kill-switch держится при падении TUN (latch).
	- `/etc/clay-killswitch.nft` — боевой ruleset; `/etc/clay-killswitch-clean.nft` — атомарный сброс (`add`+`delete table`).
- Egress-путь: app → `singbox_tun` (172.18.0.1/30) → socks5 127.0.0.1:10808 → xray(uid1000) → TUN → sing-box(uid0) → enp3s0 → VPS. Uplink `cf.090227.xyz:443` (Cloudflare CDN).
- Leak confirmed: TUN down → ipify `176.195.172.124` (домашний ISP РФ).

## Процедура проверки egress

1. Поднять TUN (оператор) через v2rayN → интерфейс `singbox_tun` поднимается → **udev армит kill-switch автоматически** (`systemctl is-active clay-killswitch` = `active`). Дождаться готовности.
2. Проверить исходящий IP/страну (never-US, не домашний РФ-IP).
3. Запустить шлюз (runbook-004), проверить, что его процесс/контейнер ходит только через TUN.
4. Smoke-вызов модели; зафиксировать исходящий IP в egress-аудите.

### Arm / Disarm (DEPLOY-3.5d)

- **Arm:** автоматически по udev при появлении `singbox_tun`. Ручной арм (при необходимости): `sudo systemctl start clay-killswitch`.
- **Latch:** при падении TUN kill-switch **остаётся активным** (нет udev-правила на `remove`) → fail-closed, утечки нет.
- **Disarm:** только вручную оператором — `sudo systemctl stop clay-killswitch` (ExecStop грузит `clay-killswitch-clean.nft` → таблица удаляется → интернет чистый).
- **Boot:** unit `static` → после ребута kill-switch НЕ армится сам; армится только при поднятии TUN.
- **Verified (T1–T10, 2026-06-11):** CP1 udev-арм + egress через TUN · CP2 crash-latch + reject 352→403 pkts (zero-leak) · CP3 disarm → интернет чистый · CP4 reboot-safe.

## Аварийное поведение (TUN down)

- Kill-switch режет egress uid 1000 (host-native шлюз LiteLLM работает как emma → попадает напрямую; podman-fallback — проверить маскарад uid на enp3s0) → внешние вызовы **не уходят** мимо TUN.
- Clay ловит ошибку adapter → роль degraded, последний вывод помечен stale.
- Offline-watcher пишет в локальный файл (работает как emma).
- Оператор поднимает TUN → агент повторяет цикл.

## Восстановление

1. Оператор поднимает TUN.
2. Проверить egress (шаги выше).
3. Дождаться следующего `ai-agent-cycle` или триггернуть вручную.
4. Снять degraded после успешного прогона.

## Верификация data-exfil (mitmproxy)

- Перед «boundary live» прогнать исходящий трафик шлюза через **mitmproxy** (локально) и убедиться, что в провайдеров уходит **только минимизированный/обезличенный контекст** (нет ключей, балансов, PII, сырых ордеров) — ADR-009.
- **Wireshark/nmap** — проверить, что egress идёт строго через TUN-путь (enp3s0 → sing-box → VPS), мимо TUN ничего нет.
- Зафиксировать исходящий IP/страну (never-US) в egress-аудите.

> ⚠️ **Вторая VPN = escape-hatch (DEPLOY-3.5d).** Kill-switch фильтрует только `oifname "enp3s0" meta skuid 1000`. Если параллельно поднят другой туннель (AmneziaVPN `amn0`, Mullvad, Clash Verge Rev), трафик uid 1000 может уйти через него **мимо `enp3s0`** — kill-switch это НЕ режет. **Политика: во время торговли Clay только sing-box, Amnezia OFF.** Amnezia допустима лишь как временный костыль для connectivity самого оператора (geo-блок РФ), вне прогонов агентов.
>
> Альтернативные туннели на хосте (Mullvad, AmneziaVPN, Clash Verge Rev) — **вне scope DEPLOY-5** как egress-путь. Egress остаётся на проверенном пути v2rayN/sing-box, управляемом только оператором (FOOTGUN C). Опциональный hardening-слайс: резать egress uid 1000 через любой несанкционированный tun (defense-in-depth).

## Остаточный риск

- systemd-resolved DNS-метаданные на enp3s0 в момент падения TUN — отслеживать, при необходимости закрыть отдельным правилом.
