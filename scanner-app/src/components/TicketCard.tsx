import type { TicketInfo, TicketStatus } from '../types/ticket';
import {
  IconAlert,
  IconCalendar,
  IconCheck,
  IconClock,
  IconMoney,
  IconRoute,
  IconTicket,
  IconUser,
} from './Icons';

const STATUS_LABEL: Record<TicketStatus, string> = {
  valid: 'Ticket vérifié',
  already_scanned: 'Déjà scanné',
  invalid: 'Embarquement refusé',
  pending: 'En attente',
  not_found: 'Ticket introuvable',
};

function statusLabel(ticket: TicketInfo): string {
  if (ticket.status === 'valid') return 'Ticket vérifié en base';
  if (ticket.status === 'already_scanned' || ticket.reason === 'already_scanned') {
    return 'Déjà contrôlé — embarquement refusé';
  }
  if (ticket.reason === 'unknown_qr') return 'QR hors Voyageur241';
  if (ticket.reason === 'wrong_agence') return 'Hors agence';
  if (ticket.reason === 'deleted') return 'Ticket annulé';
  if (ticket.reason === 'not_found') return 'Ticket introuvable';
  if (ticket.reason === 'not_on_manifeste') return 'Hors manifeste';
  return STATUS_LABEL[ticket.status];
}

function StatusIcon({ status }: { status: TicketStatus }) {
  if (status === 'valid') return <IconCheck size={22} />;
  return <IconAlert size={22} />;
}

function showTripDetails(ticket: TicketInfo): boolean {
  if (ticket.status === 'not_found') return false;
  if (ticket.reason === 'unknown_qr' || ticket.reason === 'not_found') return false;
  return (
    ticket.passengerName !== '—' ||
    ticket.route !== '—' ||
    ticket.travelDate !== '—'
  );
}

export function TicketCard({ ticket }: { ticket: TicketInfo }) {
  const details = showTripDetails(ticket);
  const origin = ticket.origin?.trim();
  const destination = ticket.destination?.trim();
  const showOd = Boolean(origin && destination && origin !== '—' && destination !== '—');

  return (
    <article className={`ticket-card ticket-card--${ticket.status}`}>
      <div className="ticket-card__status">
        <StatusIcon status={ticket.status} />
        {statusLabel(ticket)}
      </div>

      {ticket.message ? <p className="ticket-card__message">{ticket.message}</p> : null}

      {!details ? (
        <p className="ticket-card__hint">
          Aucune fiche voyage à afficher. Vérifiez le numéro du billet Voyageur241 en base.
        </p>
      ) : (
        <dl className="ticket-fields">
          <div>
            <dt>
              <IconTicket size={14} /> Numéro du ticket
            </dt>
            <dd>{ticket.number}</dd>
          </div>
          <div>
            <dt>
              <IconUser size={14} /> Nom du passager
            </dt>
            <dd>{ticket.passengerName}</dd>
          </div>
          <div>
            <dt>
              <IconRoute size={14} /> Trajet
            </dt>
            <dd>{ticket.route}</dd>
          </div>
          {showOd ? (
            <>
              <div>
                <dt>
                  <IconRoute size={14} /> Départ
                </dt>
                <dd>{origin}</dd>
              </div>
              <div>
                <dt>
                  <IconRoute size={14} /> Destination
                </dt>
                <dd>{destination}</dd>
              </div>
            </>
          ) : null}
          <div>
            <dt>
              <IconCalendar size={14} /> Date du voyage
            </dt>
            <dd>{ticket.travelDate}</dd>
          </div>
          <div>
            <dt>
              <IconClock size={14} /> Convocation
            </dt>
            <dd>{ticket.boardingTime}</dd>
          </div>
          <div>
            <dt>
              <IconMoney size={14} /> Tarif
            </dt>
            <dd>{ticket.fare}</dd>
          </div>
        </dl>
      )}
    </article>
  );
}
