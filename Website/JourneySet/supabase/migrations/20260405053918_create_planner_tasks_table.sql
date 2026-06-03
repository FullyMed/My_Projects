/*
  # Create planner_tasks table

  1. New Tables
    - `planner_tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `day_key` (text, format: YYYY-MM-DD)
      - `week_key` (text, format: YYYY-Www)
      - `time` (text, optional HH:MM)
      - `completed` (boolean)
      - `recurring` (text: 'none' | 'weekly')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `planner_tasks` table
    - Add policy for users to read/write/delete their own tasks
*/

CREATE TABLE IF NOT EXISTS planner_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  day_key text NOT NULL,
  week_key text NOT NULL,
  time text,
  completed boolean DEFAULT false,
  recurring text DEFAULT 'none',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks"
  ON planner_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON planner_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON planner_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON planner_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_planner_tasks_user_id ON planner_tasks(user_id);
CREATE INDEX idx_planner_tasks_week_key ON planner_tasks(week_key);
