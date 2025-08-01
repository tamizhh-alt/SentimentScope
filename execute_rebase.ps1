# Comprehensive script to execute the git history rewrite
$ErrorActionPreference = "Stop"

Write-Host "=== Git History Rewrite for August 2025 ===" -ForegroundColor Magenta
Write-Host "This script will rewrite your commit history with 10 commits spanning August 2025" -ForegroundColor Yellow

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
  Write-Host "Error: Not in a git repository!" -ForegroundColor Red
  Write-Host "Please run this script from your project root directory." -ForegroundColor Red
  exit 1
}

# Check current git status
Write-Host "`nChecking git status..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
  Write-Host "Warning: You have uncommitted changes:" -ForegroundColor Yellow
  Write-Host $status -ForegroundColor White
  Write-Host "`nPlease commit or stash your changes before proceeding." -ForegroundColor Red
  exit 1
}

# Get current commit count
$commitCount = (git rev-list --count HEAD)
Write-Host "Current commit count: $commitCount" -ForegroundColor Cyan

if ($commitCount -lt 10) {
  Write-Host "`nWarning: You have fewer than 10 commits ($commitCount)." -ForegroundColor Yellow
  Write-Host "This will create empty commits to reach 10 total." -ForegroundColor Yellow
  
  $response = Read-Host "Do you want to continue? (y/N)"
  if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "Aborted by user." -ForegroundColor Yellow
    exit 0
  }
}

# Check if we have a remote origin
$hasRemote = git remote get-url origin 2>$null
if ($hasRemote) {
  Write-Host "`nWarning: This repository has a remote origin." -ForegroundColor Red
  Write-Host "Rewriting history will require a force push to update the remote." -ForegroundColor Red
  Write-Host "Make sure you have permission and coordinate with your team." -ForegroundColor Yellow
  
  $response = Read-Host "Do you want to continue? (y/N)"
  if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "Aborted by user." -ForegroundColor Yellow
    exit 0
  }
}

# Create backup branch
Write-Host "`nCreating backup branch..." -ForegroundColor Cyan
$backupBranch = "backup-before-rebase-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranch
Write-Host "Backup branch created: $backupBranch" -ForegroundColor Green

# Determine rebase range
$rebaseRange = if ($commitCount -ge 10) { "HEAD~10" } else { "HEAD~$commitCount" }

Write-Host "`nStarting interactive rebase from $rebaseRange..." -ForegroundColor Yellow
Write-Host "This will open an editor. Change all 'pick' to 'edit' and save." -ForegroundColor Cyan

# Start the rebase
git rebase -i $rebaseRange

Write-Host "`n=== Rebase Process Started ===" -ForegroundColor Green
Write-Host "The rebase_step.ps1 script will automatically:" -ForegroundColor Cyan
Write-Host "1. Set realistic dates for August 2025" -ForegroundColor White
Write-Host "2. Update commit messages to be more realistic" -ForegroundColor White
Write-Host "3. Handle the rebase process step by step" -ForegroundColor White

Write-Host "`nTo continue the rebase after each commit:" -ForegroundColor Yellow
Write-Host "git rebase --continue" -ForegroundColor White

Write-Host "`nIf you encounter any issues:" -ForegroundColor Yellow
Write-Host "git rebase --abort" -ForegroundColor White
Write-Host "git checkout $backupBranch" -ForegroundColor White

Write-Host "`nAfter successful completion, you can delete the backup branch:" -ForegroundColor Cyan
Write-Host "git branch -D $backupBranch" -ForegroundColor White
