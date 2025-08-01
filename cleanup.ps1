# Cleanup script after successful rebase
Write-Host "=== Cleanup After Rebase ===" -ForegroundColor Magenta

# Check if rebase is complete
$rebaseStatus = git status --porcelain
if ($rebaseStatus -match "rebase") {
  Write-Host "Warning: Rebase is still in progress!" -ForegroundColor Red
  Write-Host "Please complete the rebase first." -ForegroundColor Yellow
  exit 1
}

# Show current status
Write-Host "Current git status:" -ForegroundColor Cyan
git status

# Check if we have a remote origin
$hasRemote = git remote get-url origin 2>$null
if ($hasRemote) {
  Write-Host "`nThis repository has a remote origin." -ForegroundColor Yellow
  Write-Host "To update the remote with the new history, you'll need to force push:" -ForegroundColor Cyan
  
  $response = Read-Host "Do you want to force push to remote? (y/N)"
  if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "Force pushing to remote..." -ForegroundColor Yellow
    git push --force-with-lease origin main
    Write-Host "Force push completed!" -ForegroundColor Green
  } else {
    Write-Host "Skipping remote push. You can do it manually later with:" -ForegroundColor Cyan
    Write-Host "git push --force-with-lease origin main" -ForegroundColor White
  }
}

# List backup branches
Write-Host "`nBackup branches:" -ForegroundColor Cyan
git branch | Where-Object { $_ -match "backup-before-rebase" }

$response = Read-Host "`nDo you want to delete backup branches? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
  git branch | Where-Object { $_ -match "backup-before-rebase" } | ForEach-Object {
    $branch = $_.Trim()
    Write-Host "Deleting backup branch: $branch" -ForegroundColor Yellow
    git branch -D $branch
  }
  Write-Host "Backup branches deleted!" -ForegroundColor Green
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green
Write-Host "Your git history has been successfully rewritten!" -ForegroundColor Cyan
