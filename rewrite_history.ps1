# Script to rewrite git commit history with 10 commits spanning August 2025
$ErrorActionPreference = "Stop"

Write-Host "Starting git history rewrite for August 2025..." -ForegroundColor Yellow

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
  Write-Host "Error: Not in a git repository!" -ForegroundColor Red
  exit 1
}

# Check current status
Write-Host "Current git status:" -ForegroundColor Cyan
git status --porcelain

# Get current commit count
$commitCount = (git rev-list --count HEAD)
Write-Host "Current commit count: $commitCount" -ForegroundColor Cyan

if ($commitCount -lt 10) {
  Write-Host "Warning: You have fewer than 10 commits. This will create empty commits." -ForegroundColor Yellow
}

# Start interactive rebase for the last 10 commits (or all commits if less than 10)
$rebaseRange = if ($commitCount -ge 10) { "HEAD~10" } else { "HEAD~$commitCount" }

Write-Host "Starting interactive rebase from $rebaseRange..." -ForegroundColor Yellow

# Create the rebase todo file with all commits as 'edit'
$rebaseTodo = @()
for ($i = 0; $i -lt [Math]::Min(10, $commitCount); $i++) {
  $rebaseTodo += "edit $(git rev-parse HEAD~$i)"
}

# Start the rebase
git rebase -i $rebaseRange

Write-Host "`nRebase started! Now run the following command to continue:" -ForegroundColor Green
Write-Host "git rebase --continue" -ForegroundColor White

Write-Host "`nThe rebase_step.ps1 script will automatically:" -ForegroundColor Cyan
Write-Host "1. Set realistic dates for August 2025" -ForegroundColor White
Write-Host "2. Update commit messages to be more realistic" -ForegroundColor White
Write-Host "3. Handle the rebase process step by step" -ForegroundColor White

Write-Host "`nIf you encounter any issues, you can always abort with:" -ForegroundColor Yellow
Write-Host "git rebase --abort" -ForegroundColor White
