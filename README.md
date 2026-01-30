# Time Tracker

Personal time tracking system with natural language input, date support, and Siri integration.

## Features

- ✅ Natural language time entry
- ✅ Timer-based tracking (start/stop)
- ✅ Retroactive entries ("spent 2h on task")
- ✅ Time range entries ("time: meeting 2-3:30pm")
- ✅ Date support (log to past days)
- ✅ Daily reporting
- ✅ Siri shortcuts integration
- ✅ Daily alerts (6pm if < 8h logged)

## Quick Start

```bash
# Start a timer
./track "start: client meeting"

# Stop timer
./track "stop"

# Log time retroactively
./track "time: meeting 2h"
./track "time: standup 9-10am"

# Log to past days
./track "yesterday: time: forgot to log 3h"
./track "mon: time: planning 2h"

# Get report
./track "report today"
./track "report yesterday"
```

## Commands

### Timer-based
- `start: <task>` - Start a timer
- `stop` - Stop active timer

### Arbitrary time
- `time: <task> <duration>` - Log duration (e.g., "2h", "30min")
- `time: <task> <time-range>` - Log time range (e.g., "2-3:30pm")

### With dates
- `yesterday: time: <task> <duration>`
- `mon: time: <task> <duration>` (last Monday)
- `2026-01-27: time: <task> <duration>`

### Reporting
- `report today`
- `report yesterday`
- `report mon` / `tue` / etc.
- `report 2026-01-27`

## Installation

1. Clone this repo
2. Make scripts executable: `chmod +x track tracker.js`
3. Run: `./track "start: your first task"`

## Siri Integration

See [SIRI_SETUP_V3.md](SIRI_SETUP_V3.md) for complete iOS Shortcuts setup guide.

**Quick setup:**
- Use Telegram's native "Send Message" action
- Send to dedicated DM with Boss bot
- Commands work exactly as CLI

## Daily Alert

Configured via heartbeat to check at 6pm daily. If total time < 8 hours, sends alert to Alerts topic.

## File Structure

```
time-tracking/
├── tracker.js          # Core engine
├── track              # CLI wrapper
├── config.json        # Configuration
├── telegram-handler.js # Telegram integration
├── daily-check.sh     # Alert script
├── SIRI_SETUP_V3.md   # Siri setup guide
└── *.json             # Daily data (gitignored)
```

## Storage

Time entries are stored in daily JSON files: `YYYY-MM-DD.json`

**Example entry:**
```json
{
  "id": 1769699511111,
  "task": "client meeting",
  "start": "2026-01-29T14:00:00.000Z",
  "end": "2026-01-29T16:00:00.000Z",
  "durationMin": 120,
  "method": "time-range"
}
```

## Data Files (Private)

Your actual time logs should be stored in a separate private repo (e.g., `time-logs`). This public repo contains only the tools.

## License

MIT
