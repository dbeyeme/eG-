-- Suivi des contrôles embarquement (provisoire, côté scanner)
CREATE TABLE IF NOT EXISTS ticket_scan (
  id VARCHAR(40) NOT NULL,
  ticket_id VARCHAR(20) NOT NULL,
  ticket_numero VARCHAR(80) NOT NULL,
  agent_id VARCHAR(80) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  scanned_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_ticket_scan_ticket (ticket_id),
  KEY idx_ticket_scan_numero (ticket_numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
