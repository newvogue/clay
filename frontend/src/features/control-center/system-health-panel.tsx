import { StatusBadge } from '../../components/status-badge'
import type { IngestionHealthSnapshot } from '../../types/control-center'

type SystemHealthPanelProps = {
  ingestion: IngestionHealthSnapshot | null
  isLoading: boolean
  isActing: boolean
  onRunIngestion: () => void
}

export function SystemHealthPanel({
  ingestion,
  isLoading,
  isActing,
  onRunIngestion,
}: SystemHealthPanelProps) {
  return (
    <section>
      <h2>System Health</h2>
      {isLoading || !ingestion ? (
        <p>Loading ingestion health...</p>
      ) : (
        <>
          <p>Market status: <StatusBadge label={ingestion.market_status} /></p>
          <p>Context status: <StatusBadge label={ingestion.context_status} /></p>
          <p>Blocks active trading: {ingestion.blocks_active_trading ? 'yes' : 'no'}</p>
          <button disabled={isActing} onClick={onRunIngestion} type="button">
            Run ingestion cycle
          </button>
          <h3>Market Freshness</h3>
          <ul>
            {ingestion.market_items.map((item) => (
              <li key={`${item.symbol}-${item.timeframe}`}>
                {item.symbol} {item.timeframe}: <StatusBadge label={item.status} /> ({item.reason})
              </li>
            ))}
          </ul>
          <h3>Connectors</h3>
          <ul>
            {ingestion.connectors.map((connector) => (
              <li key={connector.connector_id}>
                {connector.connector_id}: <StatusBadge label={connector.status} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
