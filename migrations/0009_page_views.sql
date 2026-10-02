-- Daily page view counts. No cookies, IP addresses or user ids are stored.
CREATE TABLE IF NOT EXISTS page_views (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  new_devices INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
