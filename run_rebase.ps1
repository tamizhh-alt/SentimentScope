# Simple script to run the rebase process
Write-Host "Starting git history rewrite..." -ForegroundColor Yellow

# Check git status
git status

# Start the rebase process
git rebase -i HEAD~10

Write-Host "`nRebase started! Follow the prompts to complete the process." -ForegroundColor Green
Write-Host "Each commit will be automatically updated with August 2025 dates." -ForegroundColor Cyan
