-- Agents scanner (auth provisoire app embarquement)
CREATE TABLE IF NOT EXISTS scanner_user (
  id VARCHAR(40) NOT NULL,
  username VARCHAR(80) NOT NULL,
  password_hash VARCHAR(120) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role ENUM('admin', 'agence') NOT NULL,
  agence_id VARCHAR(20) NULL,
  agence_code VARCHAR(100) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_scanner_user_username (username),
  KEY idx_scanner_user_agence (agence_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
