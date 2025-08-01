$ErrorActionPreference = "Stop"

$counterFile = ".git/rebase_counter"
if (-not (Test-Path $counterFile)) {
  Set-Content -Path $counterFile -Value "0" -NoNewline
}

$idx = [int](Get-Content -Path $counterFile -Raw)

# Realistic dates spanning August 2025 (weekdays during business hours)
$dates = @(
  "2025-08-01T09:15:00Z",  # Friday - start of month
  "2025-08-04T14:30:00Z",  # Monday - first week
  "2025-08-06T11:45:00Z",  # Wednesday
  "2025-08-08T16:20:00Z",  # Friday
  "2025-08-11T10:00:00Z",  # Monday - second week
  "2025-08-13T13:25:00Z",  # Wednesday
  "2025-08-15T15:40:00Z",  # Friday
  "2025-08-18T09:50:00Z",  # Monday - third week
  "2025-08-22T14:15:00Z",  # Friday
  "2025-08-29T11:30:00Z"   # Friday - end of month
)

# More realistic commit messages based on typical development workflow
$messages = @(
  "feat: initial project setup with React + TypeScript",
  "feat: implement sentiment analysis service core",
  "feat: add REST API endpoints for text analysis",
  "feat: implement file upload and batch processing",
  "feat: create analytics dashboard with charts",
  "feat: add emotion detection and word cloud visualization",
  "perf: implement caching and optimize response times",
  "fix: improve error handling and input validation",
  "style: enhance UI/UX and responsive design",
  "docs: complete API documentation and setup guide"
)

if ($idx -ge $messages.Length) {
  Write-Host "All planned amendments already applied (idx=$idx)" -ForegroundColor Yellow
  exit 0
}

$date = $dates[$idx]
$msg = $messages[$idx]

Write-Host ("Amending commit #{0} with date {1} and message: {2}" -f ($idx+1), $date, $msg) -ForegroundColor Cyan

# Set both author and committer dates for this amend
$env:GIT_AUTHOR_DATE = $date
$env:GIT_COMMITTER_DATE = $date

# Amend current commit with specific message and date; allow empty commits
& git commit --amend --allow-empty -m $msg --date $date | Out-Null

# Increment counter
Set-Content -Path $counterFile -Value ([string]($idx + 1)) -NoNewline

Write-Host "Successfully amended commit with date: $date" -ForegroundColor Green
<<<<<<< HEAD
exit 0
=======
exit 0


>>>>>>> 312fbed (Save current work before rebase)
