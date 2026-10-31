CREATE DATABASE IF NOT EXISTS defaultdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE defaultdb;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires BIGINT UNSIGNED NOT NULL,
  data MEDIUMTEXT NOT NULL,
  INDEX sessions_expires_idx (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS saved_trips (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  trip_key VARCHAR(190) NOT NULL,
  name VARCHAR(160) NOT NULL,
  type ENUM('destination', 'attraction') NOT NULL,
  place VARCHAR(160) NOT NULL DEFAULT '',
  path VARCHAR(255) NOT NULL,
  day TINYINT UNSIGNED NOT NULL DEFAULT 1,
  position INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY saved_trips_user_trip_unique (user_id, trip_key),
  KEY saved_trips_user_position_idx (user_id, position),
  CONSTRAINT saved_trips_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT saved_trips_day_check CHECK (day BETWEEN 1 AND 7)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
