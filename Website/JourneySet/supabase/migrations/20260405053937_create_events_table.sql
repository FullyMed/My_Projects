/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date_iso` (text, format: YYYY-MM-DD)
      - `time` (text, optional HH:MM)
      - `title` (text)
      - `description` (text, optional)
      - `category` (text: work|personal|health|social|other)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `events` table
    - Add policy for users to read/write/delete their own events
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_iso text NOT NULL,
  time text,
  title text NOT NULL,
  description text,
  category text DEFAULT 'other',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
  ON events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date_iso ON events(date_iso);
