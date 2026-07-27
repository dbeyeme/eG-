import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { TicketCard } from '../components/TicketCard';
import { IconHistory, IconScan, IconTrash } from '../components/Icons';
import { getHistory } from '../services/ticketAuth';
import { clearScannedTickets } from '../services/scanHistory';
import type { TicketInfo } from '../types/ticket';

export function HistoryPage() {
  const [tickets, setTickets] = useState<TicketInfo[]>([]);

  async function refresh() {
    setTickets(await getHistory());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onClear() {
    await clearScannedTickets();
    await refresh();
  }

  return (
    <div className="page page-history">
      <AppHeader title="Historique" />

      <div className="page-banner page-banner--compact" aria-hidden>
        <img src="/assets/banner-road.png" alt="" />
        <div className="page-banner__shade" />
        <p className="page-banner__caption">
          <IconHistory size={16} /> Scans de la session
        </p>
      </div>

      <main className="content">
        <div className="action-row">
          <Link className="btn btn-primary" to="/scan">
            <IconScan size={18} />
            Nouveau scan
          </Link>
          <button type="button" className="btn btn-ghost" onClick={() => void onClear()}>
            <IconTrash size={18} />
            Vider
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <IconHistory size={36} />
            <p>Aucun ticket scanné pour cette session.</p>
          </div>
        ) : (
          <ul className="history-list">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <TicketCard ticket={ticket} />
                <time dateTime={ticket.scannedAt}>
                  {new Date(ticket.scannedAt).toLocaleString('fr-FR')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
