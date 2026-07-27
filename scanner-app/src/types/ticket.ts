export type TicketStatus =
  | 'valid'
  | 'already_scanned'
  | 'invalid'
  | 'pending'
  | 'not_found';

export type TicketReason =
  | 'not_on_manifeste'
  | 'deleted'
  | 'not_found'
  | 'unknown_qr'
  | 'mismatch'
  | 'already_scanned'
  | 'wrong_agence';

export type TicketInfo = {
  id: string;
  number: string;
  passengerName: string;
  route: string;
  origin?: string;
  destination?: string;
  travelDate: string;
  boardingTime: string;
  fare: string;
  status: TicketStatus;
  /** Message métier renvoyé par l’API / le parseur */
  message?: string;
  reason?: TicketReason;
  rawPayload: string;
  scannedAt: string;
};

export type ScannedTicketRecord = TicketInfo;
