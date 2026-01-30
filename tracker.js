#!/usr/bin/env node
/**
 * Time Tracker - Core Module
 * Natural language time entry parser and storage
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = __dirname;
const ACTIVE_FILE = path.join(DATA_DIR, 'active.json');

// Timezone: America/Toronto
const TZ = 'America/Toronto';

function getToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
}

function getTimestamp() {
  return new Date().toLocaleString('en-US', { 
    timeZone: TZ,
    hour12: false 
  });
}

function getNow() {
  return new Date();
}

async function loadActive() {
  try {
    const data = await fs.readFile(ACTIVE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

async function saveActive(data) {
  await fs.writeFile(ACTIVE_FILE, JSON.stringify(data, null, 2));
}

async function clearActive() {
  try {
    await fs.unlink(ACTIVE_FILE);
  } catch (err) {
    // Already gone
  }
}

async function loadDay(date) {
  const file = path.join(DATA_DIR, `${date}.json`);
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { date, entries: [] };
  }
}

async function saveDay(date, data) {
  const file = path.join(DATA_DIR, `${date}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  dateStr = dateStr.toLowerCase().trim();
  
  // Handle relative dates
  if (dateStr === 'today') return getToday();
  if (dateStr === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA', { timeZone: TZ });
  }
  
  // Handle day names (mon, tue, wed, thu, fri, sat, sun / monday, tuesday, etc.)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  
  let targetDay = -1;
  for (let i = 0; i < dayNames.length; i++) {
    if (dateStr === dayNames[i] || dateStr === dayShort[i]) {
      targetDay = i;
      break;
    }
  }
  
  if (targetDay >= 0) {
    const today = new Date();
    const currentDay = today.getDay();
    let daysBack = currentDay - targetDay;
    if (daysBack <= 0) daysBack += 7; // Last week's day
    today.setDate(today.getDate() - daysBack);
    return today.toLocaleDateString('en-CA', { timeZone: TZ });
  }
  
  // Handle YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  // Handle MM/DD or MM-DD (current year)
  const mdMatch = dateStr.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (mdMatch) {
    const [, month, day] = mdMatch;
    const year = new Date().getFullYear();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return null;
}

function parseInput(text) {
  const originalText = text;
  text = text.trim().toLowerCase();
  
  // Extract date prefix if present: "yesterday: task" or "mon: task" or "2024-01-15: task"
  let datePrefix = null;
  const datePrefixMatch = text.match(/^(yesterday|today|mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}):?\s+(.+)$/i);
  if (datePrefixMatch) {
    datePrefix = parseDate(datePrefixMatch[1]);
    text = datePrefixMatch[2].trim();
  }
  
  // Command: start [task]
  if (text.match(/^start:?\s*/i)) {
    const task = text.replace(/^start:?\s*/i, '').trim();
    return { command: 'start', task, date: datePrefix };
  }
  
  // Command: stop
  if (text.match(/^stop$/i)) {
    return { command: 'stop' };
  }
  
  // Command: report [today|yesterday|date]
  if (text.match(/^report/i)) {
    const reportMatch = text.match(/^report\s+(yesterday|today|mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2})/i);
    let target = 'today';
    if (reportMatch) {
      target = parseDate(reportMatch[1]) || 'today';
    } else if (text.includes('yesterday')) {
      target = 'yesterday';
    }
    return { command: 'report', target };
  }
  
  // Retroactive: "spent 2h on coding"
  const retroMatch = text.match(/spent\s+(\d+\.?\d*)\s*(h|hr|hour|hours|m|min|minutes?)\s+(?:on\s+)?(.+)/i);
  if (retroMatch) {
    const [, amount, unit, task] = retroMatch;
    let minutes = parseFloat(amount);
    if (unit.startsWith('h')) {
      minutes *= 60;
    }
    return { command: 'retroactive', task, minutes, date: datePrefix };
  }
  
  // "time: task name 2h" or "time: task name 2 hrs"
  const timeWithDurationMatch = text.match(/^time:?\s+(.+?)\s+(\d+\.?\d*)\s*(h|hr|hrs|hour|hours|m|min|minutes?)$/i);
  if (timeWithDurationMatch) {
    const [, task, amount, unit] = timeWithDurationMatch;
    let minutes = parseFloat(amount);
    if (unit.startsWith('h')) {
      minutes *= 60;
    }
    return { command: 'retroactive', task: task.trim(), minutes, date: datePrefix };
  }
  
  // "time: task name 2-3:30pm" or "time: meeting 2-3:30"
  const timeRangeMatch = text.match(/^time:?\s+(.+?)\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i);
  if (timeRangeMatch) {
    const [, task, startH, startM, startMer, endH, endM, endMer] = timeRangeMatch;
    return { command: 'timeRange', task: task.trim(), startH, startM: startM || '00', startMer, endH, endM: endM || '00', endMer, date: datePrefix };
  }
  
  // Legacy time range: "1pm-3pm: coding"
  const rangeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?:?\s*(.+)/i);
  if (rangeMatch) {
    const [, startH, startM, startMer, endH, endM, endMer, task] = rangeMatch;
    return { command: 'timeRange', task: task.trim(), startH, startM: startM || '00', startMer, endH, endM: endM || '00', endMer, date: datePrefix };
  }
  
  return { command: 'unknown', text };
}

async function handleStart(task) {
  const active = await loadActive();
  if (active) {
    return `⚠️ Timer already running: "${active.task}" (started ${formatTime(active.start)})`;
  }
  
  const now = getNow();
  await saveActive({
    task,
    start: now.toISOString(),
    startDisplay: formatTime(now)
  });
  
  return `✅ Timer started: ${task} (${formatTime(now)})`;
}

async function handleStop() {
  const active = await loadActive();
  if (!active) {
    return `⚠️ No active timer`;
  }
  
  const now = getNow();
  const start = new Date(active.start);
  const durationMin = Math.round((now - start) / 1000 / 60);
  
  // Save to daily log
  const today = getToday();
  const dayData = await loadDay(today);
  dayData.entries.push({
    id: Date.now(),
    task: active.task,
    start: active.start,
    end: now.toISOString(),
    durationMin,
    method: 'timer'
  });
  await saveDay(today, dayData);
  
  await clearActive();
  
  return `⏹️ Stopped: ${active.task} (${formatDuration(durationMin)})`;
}

async function handleRetroactive(task, minutes, date) {
  const targetDate = date || getToday();
  const dayData = await loadDay(targetDate);
  
  const now = getNow();
  const start = new Date(now.getTime() - minutes * 60 * 1000);
  
  dayData.entries.push({
    id: Date.now(),
    task,
    start: start.toISOString(),
    end: now.toISOString(),
    durationMin: minutes,
    method: 'retroactive'
  });
  
  await saveDay(targetDate, dayData);
  
  const dateNote = date ? ` (${targetDate})` : '';
  return `✅ Added: ${task} (${formatDuration(minutes)}, retroactive)${dateNote}`;
}

async function handleTimeRange(task, startH, startM, startMer, endH, endM, endMer, date) {
  const targetDate = date || getToday();
  // Parse start time
  let startHour = parseInt(startH);
  
  // If no start meridiem but end has one, infer start meridiem
  if (!startMer && endMer) {
    const endHourNum = parseInt(endH);
    // Special case: 12-1pm means noon to 1pm
    if (startHour === 12) {
      startMer = endMer;
    } else if (startHour > endHourNum) {
      startMer = endMer.toLowerCase() === 'pm' ? 'am' : 'pm';
    } else {
      startMer = endMer;
    }
  }
  
  // Convert to 24-hour format
  if (startMer && startMer.toLowerCase() === 'pm') {
    if (startHour !== 12) startHour += 12;
  } else if (startMer && startMer.toLowerCase() === 'am') {
    if (startHour === 12) startHour = 0;
  }
  
  // Parse end time
  let endHour = parseInt(endH);
  
  // If no end meridiem, infer from start
  if (!endMer && startMer) {
    // If end hour is less than start hour (in 12h format), assume it crossed meridiem
    const startHour12 = parseInt(startH);
    const endHour12 = parseInt(endH);
    if (endHour12 < startHour12 && startMer.toLowerCase() === 'am') {
      endMer = 'pm';
    } else {
      endMer = startMer;
    }
  }
  
  // Convert to 24-hour format
  if (endMer && endMer.toLowerCase() === 'pm') {
    if (endHour !== 12) endHour += 12;
  } else if (endMer && endMer.toLowerCase() === 'am') {
    if (endHour === 12) endHour = 0;
  }
  
  // Build ISO timestamps for target date
  const baseDate = date ? new Date(date + 'T12:00:00') : new Date();
  const startDate = new Date(baseDate);
  startDate.setHours(startHour, parseInt(startM), 0, 0);
  
  const endDate = new Date(baseDate);
  endDate.setHours(endHour, parseInt(endM), 0, 0);
  
  // Calculate duration
  const durationMin = Math.round((endDate - startDate) / 1000 / 60);
  
  if (durationMin <= 0) {
    return `⚠️ Invalid time range (end time must be after start time)`;
  }
  
  // Save to daily log
  const dayData = await loadDay(targetDate);
  
  dayData.entries.push({
    id: Date.now(),
    task,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    durationMin,
    method: 'time-range'
  });
  
  await saveDay(targetDate, dayData);
  
  const dateNote = date ? ` (${targetDate})` : '';
  return `✅ Added: ${task} (${formatTime(startDate)} - ${formatTime(endDate)}, ${formatDuration(durationMin)})${dateNote}`;
}

async function handleReport(target) {
  let date;
  
  if (target === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    date = d.toLocaleDateString('en-CA', { timeZone: TZ });
  } else if (target === 'today') {
    date = getToday();
  } else {
    // Assume it's already a parsed date string
    date = target;
  }
  
  const dayData = await loadDay(date);
  
  if (dayData.entries.length === 0) {
    return `📊 No entries for ${date}`;
  }
  
  // Group by task
  const taskTotals = {};
  let grandTotal = 0;
  
  for (const entry of dayData.entries) {
    const task = entry.task || 'unknown';
    taskTotals[task] = (taskTotals[task] || 0) + entry.durationMin;
    grandTotal += entry.durationMin;
  }
  
  const lines = [
    `📊 ${formatDate(date)}`,
    '─────────────────────'
  ];
  
  for (const [task, minutes] of Object.entries(taskTotals).sort((a, b) => b[1] - a[1])) {
    const hours = (minutes / 60).toFixed(1);
    lines.push(`${task.padEnd(20)} ${hours}h`);
  }
  
  lines.push('─────────────────────');
  lines.push(`Total: ${formatDuration(grandTotal)}`);
  
  return lines.join('\n');
}

function formatTime(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleTimeString('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    timeZone: TZ,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

async function processInput(input) {
  const parsed = parseInput(input);
  
  switch (parsed.command) {
    case 'start':
      return handleStart(parsed.task);
    case 'stop':
      return handleStop();
    case 'retroactive':
      return handleRetroactive(parsed.task, parsed.minutes, parsed.date);
    case 'timeRange':
      return handleTimeRange(parsed.task, parsed.startH, parsed.startM, parsed.startMer, parsed.endH, parsed.endM, parsed.endMer, parsed.date);
    case 'report':
      return handleReport(parsed.target);
    case 'unknown':
      return `❓ Couldn't parse: "${parsed.text}"\n\nTry:\n• "start: task name"\n• "stop"\n• "spent 2h on task"\n• "time: task name 2h"\n• "time: meeting 2-3:30pm"\n• "yesterday: time: meeting 1h"\n• "report today"\n• "report yesterday"\n• "report mon"`;
    default:
      return `⚠️ Command not yet implemented: ${parsed.command}`;
  }
}

// CLI mode
if (require.main === module) {
  const input = (process.argv || []).slice(2).join(' ');
  if (!input) {
    console.log('Usage: tracker.js <command>');
    console.log('\nExamples:');
    console.log('  tracker.js start: client meeting');
    console.log('  tracker.js stop');
    console.log('  tracker.js spent 2h on coding');
    console.log('  tracker.js report today');
    process.exit(1);
  }
  
  processInput(input).then(console.log).catch(console.error);
}

module.exports = { processInput, parseInput, loadActive, loadDay };
