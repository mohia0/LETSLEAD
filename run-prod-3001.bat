@echo off
echo Building production app and starting on port http://localhost:3001...
npm run build && next start -p 3001
pause
