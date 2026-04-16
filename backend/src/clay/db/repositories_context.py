from sqlalchemy import select
from sqlalchemy.orm import Session

from clay.db.models_context import NewsItem, SentimentSnapshot


class ContextRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def store_news_items(self, items: list[dict[str, object]]) -> int:
        written = 0
        for item in items:
            existing = self.session.scalar(
                select(NewsItem).where(
                    NewsItem.source_name == item["source_name"],
                    NewsItem.headline == item["headline"],
                    NewsItem.published_at == item["published_at"],
                ),
            )
            if existing is not None:
                continue
            self.session.add(NewsItem(**item))
            written += 1

        self.session.flush()
        return written

    def store_sentiment_snapshots(self, items: list[dict[str, object]]) -> int:
        written = 0
        for item in items:
            existing = self.session.scalar(
                select(SentimentSnapshot).where(
                    SentimentSnapshot.source_name == item["source_name"],
                    SentimentSnapshot.symbol == item["symbol"],
                    SentimentSnapshot.captured_at == item["captured_at"],
                ),
            )
            if existing is not None:
                continue
            self.session.add(SentimentSnapshot(**item))
            written += 1

        self.session.flush()
        return written

    def latest_news(self, *, limit: int = 5) -> list[NewsItem]:
        query = select(NewsItem).order_by(NewsItem.published_at.desc()).limit(limit)
        return list(self.session.scalars(query).all())

    def latest_sentiment(self, *, limit: int = 5) -> list[SentimentSnapshot]:
        query = select(SentimentSnapshot).order_by(
            SentimentSnapshot.captured_at.desc(),
        ).limit(limit)
        return list(self.session.scalars(query).all())
