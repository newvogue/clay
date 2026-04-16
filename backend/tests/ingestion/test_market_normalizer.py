from clay.ingestion.market.normalizer import normalize_kline_payload


def test_normalize_kline_payload_maps_binance_kline_to_market_bar() -> None:
    payload = {
        "symbol": "BTCUSDT",
        "interval": "15m",
        "kline": {
            "t": 1711954800000,
            "T": 1711955699999,
            "o": "70250.10",
            "h": "70420.00",
            "l": "70180.40",
            "c": "70390.20",
            "v": "123.45",
            "q": "8670000.10",
        },
    }

    bar = normalize_kline_payload(payload)

    assert bar.symbol == "BTCUSDT"
    assert bar.timeframe == "15m"
    assert bar.close == 70390.20
    assert bar.quote_volume == 8670000.10
