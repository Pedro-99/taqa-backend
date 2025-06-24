-- Create the user if it doesn't exist
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'taqathon_user'
   ) THEN
      CREATE ROLE taqathon_user LOGIN PASSWORD 'taqathon_password';
   END IF;
END
$$;

-- Create the database if it doesn't exist
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'taqathon_anomalies'
   ) THEN
      CREATE DATABASE taqathon_anomalies;
   END IF;
END
$$;
