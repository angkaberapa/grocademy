#!/bin/bash

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ Database is ready!"

# Run migrations if needed (optional)
# npm run migration:run

# Check if we should seed the database
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed
  echo "✅ Database seeding completed!"
fi

# Start the application
echo "🚀 Starting Grocademy application..."
npm run start:prod
