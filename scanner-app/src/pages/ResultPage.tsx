import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { TicketCard } from '../components/TicketCard';
import { IconHistory, IconScan } from '../components/Icons';
import { getHistory } from '../services/ticketAuth';
import type { TicketInfo } from '../types/ticket';

export function ResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const fromState = (location.state as { ticket?: TicketInfo } | null)?.ticket;
  const [ticket, setTicket] = useState<TicketInfo | null>(fromState ?? null);

  useEffect(() => {
    if (ticket || !id) return;
    void getHistory().then((list) => {
      setTicket(list.find((t) => t.id === id) ?? null);
    });
  }, [id, ticket]);

  return (
    <div className="page page-result">
      <AppHeader title="Résultat" />

      <div className="page-banner page-banner--compact" aria-hidden>
        <img src="/assets/banner-road.png" alt="" />
        <div className="page-banner__shade" />
        <p className="page-banner__caption">Contrôle passager</p>
      </div>

      <main className="content">
        {ticket ? (
          <TicketCard ticket={ticket} />
        ) : (
          <p className="empty-state">Ticket introuvable.</p>
        )}
        <div className="action-row">
          <Link className="btn btn-primary" to="/scan">
            <IconScan size={18} />
            Scanner suivant
          </Link>
          <Link className="btn btn-ghost" to="/history">
            <IconHistory size={18} />
            Historique
          </Link>
        </div>
      </main>
    </div>
  );
}
