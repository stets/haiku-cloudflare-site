-- D1 Database schema for haiku storage
DROP TABLE IF EXISTS haikus;

CREATE TABLE haikus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    haiku TEXT NOT NULL,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timestamp ON haikus(timestamp DESC);