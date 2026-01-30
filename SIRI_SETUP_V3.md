# Siri Time Tracking Setup (v3) - Telegram App Integration

## Best Solution: Use Telegram's Native iOS Integration

Instead of Bot API or Gateway API, use Telegram's built-in Shortcuts actions. Messages send as YOU, so Boss receives them normally.

---

## Requirements

1. **Telegram app** installed on iOS
2. **Shortcuts** app
3. **Time Tracking group** opened at least once in Telegram

---

## Setup

### Shortcut 1: Start Timer

1. Open **Shortcuts** app
2. Tap **+** (new shortcut)
3. Add action: **Ask for Input**
   - Prompt: `What are you working on?`

4. Add action: **Send Message**
   - Search for "Send Message" (should show Telegram icon)
   - If it asks, select **Telegram**
   - Tap **Recipient** → Select **"Aaron & Boss.bot"** group
   - ⚠️ **Important:** You need to select the specific TOPIC (Time Tracking / 96)
     - This might show as "Reply to Thread" or similar
   - Message field: Type `start: ` then add **Provided Input** variable

5. Name: **"Start Timer"**
6. Test: "Hey Siri, start timer"

---

### Shortcut 2: Stop Timer

1. Create new shortcut
2. Add action: **Send Message** (Telegram)
   - Recipient: **"Aaron & Boss.bot"** group → **Time Tracking topic**
   - Message: `stop`

3. Name: **"Stop Timer"**

---

### Shortcut 3: Add Arbitrary Time

For logging time you already spent (without start/stop):

1. Create new shortcut
2. Add action: **Ask for Input**
   - Prompt: `What task and how long?`
   - Default: `meeting 2 hrs` (example)

3. Add action: **Send Message** (Telegram)
   - Recipient: **@ac_boss_69_bot**
   - Message: `time: [Provided Input]`

4. Name: **"Log Time"**

**Usage examples:**
- "Hey Siri, log time" → "client call 2 hrs"
- "Hey Siri, log time" → "standup 2-3:30pm"

### Shortcut 4: Time Report

Same as Stop Timer, message is: `report today`

---

## Why This Works

✅ Messages send as YOU (not bot)  
✅ Boss receives them normally  
✅ No API tokens to expose  
✅ No internet setup needed  
✅ Works from anywhere (if you have Telegram data/wifi)  

---

## Limitations

⚠️ **Topic Selection:** iOS Shortcuts might not support Telegram topics directly. If you can't select the specific topic:

**Workaround:**
- Create a dedicated **Time Tracking** chat (just you + Boss bot, no group)
- Use that chat for all time tracking
- Easier for Shortcuts to target

---

## Supported Commands

Once you have the DM set up, Boss recognizes these patterns:

**Timer-based:**
- `start: task name` - Start a timer
- `stop` - Stop active timer
- `done` - Also stops timer

**Arbitrary time:**
- `time: task name 2h` - Log 2 hours (today)
- `time: task name 2 hrs` - Same (hrs/hours/h all work)
- `time: meeting 2-3:30pm` - Log specific time range
- `time: call 9am-10:30am` - Morning meeting
- `time: lunch 12-1pm` - Noon to 1pm

**With dates (log past time):**
- `yesterday: time: meeting 2h` - Log to yesterday
- `mon: time: client call 3h` - Log to last Monday
- `tue: time: standup 9-10am` - Log to last Tuesday
- `2026-01-27: time: debugging 4h` - Log to specific date
- `1/27: time: coding 3h` - Log to Jan 27 (current year)

**Reporting:**
- `report today` - Show today's breakdown
- `report yesterday` - Show yesterday's breakdown
- `report mon` - Show last Monday
- `report 2026-01-27` - Show specific date
- `report 1/27` - Show Jan 27

## Testing

1. Open DM with @ac_boss_69_bot
2. Manually type: `start: testing`
3. Wait a few seconds, type: `stop`
4. Boss should respond with confirmation and duration
5. Try: `time: meeting 2-3pm`
6. Try: `report today`

Once manual commands work, Siri shortcuts will work the same way!

---

## Alternative: Dedicated DM

If group topics don't work well:

1. Start a DM with @ac_boss_69_bot
2. Use that for ALL time tracking
3. Simpler for Shortcuts (just select "ac_boss_69_bot" as recipient)
4. Boss should still process commands the same way

---

**This is the cleanest solution - no security issues, uses native Telegram!** 💼
