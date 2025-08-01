$ErrorActionPreference = "Stop"

$todo = Get-Content -Raw -Path ".git/rebase-merge/git-rebase-todo" -ErrorAction SilentlyContinue
if (-not $todo) {
  $todo = Get-Content -Raw -Path ".git/rebase-apply/git-rebase-todo"
}

$lines = $todo -split "`n"

$newLines = @()
foreach ($line in $lines) {
  if ($line -match '^(pick|reword|edit|squash|fixup) ') {
    $newLines += $line
    $newLines += "exec powershell -ExecutionPolicy Bypass -File .\\rebase_step.ps1"
  } else {
    $newLines += $line
  }
}

Set-Content -Path ".git/rebase-merge/git-rebase-todo" -Value ($newLines -join "`n") -ErrorAction SilentlyContinue
Set-Content -Path ".git/rebase-apply/git-rebase-todo" -Value ($newLines -join "`n") -ErrorAction SilentlyContinue

Write-Host "Injected exec steps into rebase todo" -ForegroundColor Green




