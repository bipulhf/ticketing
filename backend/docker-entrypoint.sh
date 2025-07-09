#!/bin/sh

# Wait for the database to be ready
echo "Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (if not already done)
echo "Generating Prisma client..."
npx prisma generate

echo "Seeding database..."
npm run prisma:seed

# Start the application
echo "Starting the application..."
npm start 