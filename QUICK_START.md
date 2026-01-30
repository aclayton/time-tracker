# Quick Start: Siri Time Tracking

## 🎯 What You'll Get
Say **"Hey Siri, start timer"** → Boss starts tracking your time  
Say **"Hey Siri, stop timer"** → Boss logs it automatically

---

## 📱 Setup (5 minutes)

### Shortcut 1: Start Timer

1. Open **Shortcuts** app
2. Tap **+** (top right)
3. Tap **Add Action**
4. Search for **"Ask for Input"**, tap it
5. In the action, change prompt to: `What are you working on?`
6. Tap **+** below that action
7. Search for **"Get Contents of URL"**, tap it
8. Tap **URL** field, paste:
```
https://api.telegram.org/bot8076235715:AAEMdKzheOFnSG9PWWD0njooL6cjIPpc4uw/sendMessage
```
9. Tap **Show More**
10. Change **Method** to **POST**
11. Change **Request Body** to **JSON**
12. Tap **Add new field**, select **Text**
13. In the JSON editor, paste:
```json
{
  "chat_id": "-1003812121465",
  "message_thread_id": 96,
  "text": "start: "
}
```
14. Put cursor after `"start: "` (before the closing quote)
15. Tap **Variables** (bottom), select **Provided Input**
16. Tap **Done** (top right)
17. Tap the shortcut name (top), rename to **"Start Timer"**
18. Tap **Done**

✅ Test it: Say **"Hey Siri, start timer"**

---

### Shortcut 2: Stop Timer

1. Tap **+** to create new shortcut
2. Add action: **"Get Contents of URL"**
3. Paste URL:
```
https://api.telegram.org/bot8076235715:AAEMdKzheOFnSG9PWWD0njooL6cjIPpc4uw/sendMessage
```
4. Tap **Show More**
5. Method: **POST**
6. Request Body: **JSON**
7. Add text field, paste:
```json
{
  "chat_id": "-1003812121465",
  "message_thread_id": 96,
  "text": "stop"
}
```
8. Name: **"Stop Timer"**
9. Tap **Done**

✅ Test it: Say **"Hey Siri, stop timer"**

---

### Shortcut 3: Time Report (Optional)

Same steps as Stop Timer, but:
- Name: **"Time Report"**
- Text in JSON: `"report today"`

✅ Test: **"Hey Siri, time report"**

---

## 🗣️ Usage Examples

**"Hey Siri, start timer"**  
Siri: *What are you working on?*  
You: **"client meeting"**  
→ Boss starts timer

**"Hey Siri, stop timer"**  
→ Boss stops timer, tells you duration

**"Hey Siri, time report"**  
→ Boss sends today's time breakdown

---

## 🔧 Troubleshooting

**Siri says "There was a problem":**
- Check you're online
- Make sure you pasted the full URL
- Verify JSON has no typos

**Boss doesn't respond:**
- Open Telegram, check Time Tracking topic (96)
- You should see your message
- Boss should reply within a few seconds

**Can't find variables button:**
- Type something first, then delete it
- Variables button appears above keyboard

---

## 💡 Pro Tips

**Lock Screen Access:**
- Go to Settings → Shortcuts
- Enable **Allow Running Scripts**
- Now shortcuts work from lock screen

**Custom Phrases:**
- After creating shortcut, go to Settings → Siri & Search
- Find your shortcut, tap **Add to Siri**
- Record custom phrase (e.g., "Clock in")

**Home Screen Widgets:**
- Long-press home screen → **Widgets**
- Find **Shortcuts**, add widget
- Tap to configure → select your timer shortcuts
- One-tap time tracking!

---

Need help? Ask Boss in the Development topic! 💼
