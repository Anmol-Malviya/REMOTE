# Run MongoDB in Docker and start Backend
Write-Host "Starting MongoDB container..."
docker compose up -d

Write-Host "Starting Backend..."
cd backend
npm run dev
