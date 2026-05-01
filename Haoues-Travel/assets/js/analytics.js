/**
 * HAOUES TRAVEL — Analytics Dashboard Module
 * Renders stats cards, top package, recent bookings, and calendar
 * Pure vanilla JavaScript — no external libraries
 */
'use strict';

/* ═══════════════════════════════════════════════════════
   STATS CARDS
   ═══════════════════════════════════════════════════════ */
function animateCountUp(el, target, duration, suffix) {
  if (!el) return;
  var start = 0;
  var startTime = null;
  suffix = suffix || '';

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(eased * target);
    el.textContent = current.toLocaleString('ar-DZ') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderStatsCards(data) {
  var container = document.getElementById('stats-cards-container');
  if (!container) return;

  var cards = [
    { icon: '\uD83D\uDC41', label: '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A', value: data.totalVisitors || 0, bg: 'rgba(37,99,235,0.12)', accent: '#2563eb', suffix: '' },
    { icon: '\uD83D\uDCDD', label: '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u0633\u062C\u064A\u0644\u0627\u062A', value: data.totalRegistrations || 0, bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b', suffix: '' },
    { icon: '\u2705', label: '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0624\u0643\u062F\u0627\u062A', value: data.totalConfirmed || 0, bg: 'rgba(16,185,129,0.12)', accent: '#10b981', suffix: '' },
    { icon: '\uD83D\uDCE6', label: '\u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629', value: data.totalPackages || 0, bg: 'rgba(139,92,246,0.12)', accent: '#8b5cf6', suffix: '' },
    { icon: '\uD83D\uDCC5', label: '\u062D\u062C\u0648\u0632\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631', value: data.thisMonthBookings || 0, bg: 'rgba(236,72,153,0.12)', accent: '#ec4899', suffix: '' },
    { icon: '\uD83D\uDCB0', label: '\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0645\u062A\u0648\u0642\u0639\u0629', value: data.thisMonthRevenue || 0, bg: 'rgba(6,182,212,0.12)', accent: '#06b6d4', suffix: ' DZD' }
  ];

  container.innerHTML = '';
  cards.forEach(function(card) {
    var div = document.createElement('div');
    div.className = 'stat-card-analytics';
    div.style.cssText = 'background:' + card.bg + ';border:1px solid ' + card.accent + '33;border-radius:16px;padding:24px 20px;text-align:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:transform 0.2s,box-shadow 0.2s;cursor:default;';
    div.innerHTML =
      '<div style="font-size:36px;margin-bottom:8px;">' + card.icon + '</div>' +
      '<div class="stat-card-number" style="font-size:32px;font-weight:800;color:' + card.accent + ';margin-bottom:6px;font-family:var(--font-display,Tajawal,sans-serif);">0</div>' +
      '<div style="font-size:14px;color:var(--text-secondary,rgba(240,242,248,0.6));">' + card.label + '</div>';
    div.addEventListener('mouseenter', function() { div.style.transform = 'translateY(-4px)'; div.style.boxShadow = '0 8px 25px ' + card.accent + '22'; });
    div.addEventListener('mouseleave', function() { div.style.transform = ''; div.style.boxShadow = ''; });
    container.appendChild(div);

    var numEl = div.querySelector('.stat-card-number');
    animateCountUp(numEl, card.value, 1000, card.suffix);
  });
}

/* ═══════════════════════════════════════════════════════
   TOP PACKAGE BANNER
   ═══════════════════════════════════════════════════════ */
function renderTopPackage(packageName) {
  var container = document.getElementById('top-package-container');
  if (!container) return;
  if (!packageName) { container.innerHTML = ''; return; }
  container.innerHTML =
    '<div style="background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(174,144,115,0.1));border:1px solid rgba(245,158,11,0.3);border-radius:14px;padding:18px 28px;text-align:center;margin:20px 0;">' +
    '<span style="font-size:24px;">🏆</span> ' +
    '<span style="font-size:18px;font-weight:700;color:#f59e0b;font-family:var(--font-display,Tajawal,sans-serif);">' +
    '\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0623\u0643\u062B\u0631 \u0637\u0644\u0628\u0627\u064B: ' +
    '<span style="color:#ae9073;">' + escapeHtml(packageName) + '</span></span></div>';
}

/* ═══════════════════════════════════════════════════════
   RECENT BOOKINGS TABLE
   ═══════════════════════════════════════════════════════ */
function renderRecentBookings(bookings) {
  var container = document.getElementById('recent-bookings-container');
  if (!container) return;
  if (!bookings || !bookings.length) {
    container.innerHTML = '<p style="color:var(--text-secondary,rgba(240,242,248,0.5));text-align:center;padding:24px;">\u0644\u0627 \u062A\u0648\u062C\u062F \u062D\u062C\u0648\u0632\u0627\u062A \u062D\u062F\u064A\u062B\u0629</p>';
    return;
  }

  function statusBadge(status) {
    var s = String(status || '').trim().toUpperCase();
    if (s === 'CONFIRMED' || s === '\u062A\u0645 \u0627\u0644\u062A\u0623\u0643\u064A\u062F') return '<span style="background:rgba(16,185,129,0.15);color:#10b981;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">\u0645\u0624\u0643\u062F</span>';
    if (s === 'PAID' || s === '\u062A\u0645 \u0627\u0644\u062F\u0641\u0639') return '<span style="background:rgba(139,92,246,0.15);color:#8b5cf6;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">\u0645\u062F\u0641\u0648\u0639</span>';
    return '<span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">\u0645\u0639\u0644\u0642</span>';
  }

  var html = '<div style="overflow-x:auto;"><table dir="rtl" style="width:100%;border-collapse:collapse;font-size:14px;">';
  html += '<thead><tr style="border-bottom:1px solid rgba(255,255,255,0.08);">';
  html += '<th style="padding:12px 8px;text-align:right;color:var(--gold-300,#ae9073);font-weight:600;">\u0627\u0644\u0627\u0633\u0645</th>';
  html += '<th style="padding:12px 8px;text-align:right;color:var(--gold-300,#ae9073);font-weight:600;">\u0627\u0644\u0628\u0627\u0642\u0629</th>';
  html += '<th style="padding:12px 8px;text-align:center;color:var(--gold-300,#ae9073);font-weight:600;">\u0627\u0644\u062D\u0627\u0644\u0629</th>';
  html += '<th style="padding:12px 8px;text-align:right;color:var(--gold-300,#ae9073);font-weight:600;">\u0627\u0644\u062A\u0627\u0631\u064A\u062E</th>';
  html += '</tr></thead><tbody>';

  bookings.forEach(function(b) {
    html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.2s;" onmouseenter="this.style.background=\'rgba(255,255,255,0.03)\'" onmouseleave="this.style.background=\'\'">';
    html += '<td style="padding:10px 8px;color:var(--text-primary,#f0f2f8);">' + escapeHtml(b.name) + '</td>';
    html += '<td style="padding:10px 8px;color:var(--text-secondary,rgba(240,242,248,0.7));">' + escapeHtml(b.package) + '</td>';
    html += '<td style="padding:10px 8px;text-align:center;">' + statusBadge(b.status) + '</td>';
    html += '<td style="padding:10px 8px;color:var(--text-secondary,rgba(240,242,248,0.7));">' + escapeHtml(b.date) + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

/* ═══════════════════════════════════════════════════════
   TRAVEL CALENDAR — Vanilla JS
   ═══════════════════════════════════════════════════════ */
var ARABIC_MONTHS = [
  '\u064A\u0646\u0627\u064A\u0631', '\u0641\u0628\u0631\u0627\u064A\u0631', '\u0645\u0627\u0631\u0633', '\u0623\u0628\u0631\u064A\u0644',
  '\u0645\u0627\u064A\u0648', '\u064A\u0648\u0646\u064A\u0648', '\u064A\u0648\u0644\u064A\u0648', '\u0623\u063A\u0633\u0637\u0633',
  '\u0633\u0628\u062A\u0645\u0628\u0631', '\u0623\u0643\u062A\u0648\u0628\u0631', '\u0646\u0648\u0641\u0645\u0628\u0631', '\u062F\u064A\u0633\u0645\u0628\u0631'
];
var ARABIC_DAYS = ['\u0627\u0644\u0633\u0628\u062A', '\u0627\u0644\u0623\u062D\u062F', '\u0627\u0644\u0627\u062B\u0646\u064A\u0646', '\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621', '\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621', '\u0627\u0644\u062E\u0645\u064A\u0633', '\u0627\u0644\u062C\u0645\u0639\u0629'];

function TravelCalendar(containerId, events) {
  this.container = document.getElementById(containerId);
  this.events = events || [];
  this.currentDate = new Date();
  this.currentView = window.innerWidth < 768 ? 'week' : 'month';
  if (this.container) this.render();
}

TravelCalendar.prototype.getEventsForDate = function(dateStr) {
  return this.events.filter(function(ev) {
    if (ev.start === dateStr) return true;
    if (ev.end && ev.start <= dateStr && ev.end >= dateStr) return true;
    return false;
  });
};

TravelCalendar.prototype.render = function() {
  if (!this.container) return;
  var self = this;
  var html = '<div class="tc-wrapper" dir="rtl" style="min-height:600px;background:rgba(6,12,24,0.6);border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">';

  // Controls
  html += '<div class="tc-controls" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:16px 20px;gap:12px;border-bottom:1px solid rgba(255,255,255,0.06);">';
  html += '<div style="display:flex;gap:8px;align-items:center;">';
  html += '<button class="tc-btn" data-action="prev" style="background:rgba(255,255,255,0.06);border:none;color:var(--text-primary,#f0f2f8);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:14px;transition:background 0.2s;">\u0627\u0644\u062A\u0627\u0644\u064A &lt;</button>';
  html += '<button class="tc-btn" data-action="today" style="background:rgba(48,154,175,0.15);border:1px solid rgba(48,154,175,0.3);color:#309aaf;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:14px;transition:background 0.2s;">\u0627\u0644\u064A\u0648\u0645</button>';
  html += '<button class="tc-btn" data-action="next" style="background:rgba(255,255,255,0.06);border:none;color:var(--text-primary,#f0f2f8);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:14px;transition:background 0.2s;">&gt; \u0627\u0644\u0633\u0627\u0628\u0642</button>';
  html += '</div>';

  var monthTitle = ARABIC_MONTHS[this.currentDate.getMonth()] + ' ' + this.currentDate.getFullYear();
  html += '<div style="font-size:20px;font-weight:700;color:var(--gold-300,#ae9073);font-family:var(--font-display,Tajawal,sans-serif);">' + monthTitle + '</div>';

  html += '<div style="display:flex;gap:4px;background:rgba(255,255,255,0.04);border-radius:8px;padding:3px;">';
  html += '<button class="tc-view-btn" data-view="month" style="padding:6px 14px;border:none;border-radius:6px;cursor:pointer;font-size:13px;transition:all 0.2s;' + (this.currentView === 'month' ? 'background:#309aaf;color:#fff;' : 'background:transparent;color:var(--text-secondary,rgba(240,242,248,0.6));') + '">\u0634\u0647\u0631\u064A</button>';
  html += '<button class="tc-view-btn" data-view="week" style="padding:6px 14px;border:none;border-radius:6px;cursor:pointer;font-size:13px;transition:all 0.2s;' + (this.currentView === 'week' ? 'background:#309aaf;color:#fff;' : 'background:transparent;color:var(--text-secondary,rgba(240,242,248,0.6));') + '">\u0623\u0633\u0628\u0648\u0639\u064A</button>';
  html += '</div>';
  html += '</div>';

  // Legend
  html += '<div style="display:flex;flex-wrap:wrap;gap:16px;padding:10px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;">';
  html += '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#2563eb;display:inline-block;"></span> \u0628\u0627\u0642\u0629 \u0633\u0641\u0631</span>';
  html += '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;display:inline-block;"></span> \u062D\u062C\u0632 \u0645\u0639\u0644\u0642</span>';
  html += '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#10b981;display:inline-block;"></span> \u062D\u062C\u0632 \u0645\u0624\u0643\u062F</span>';
  html += '<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#8b5cf6;display:inline-block;"></span> \u062A\u0645 \u0627\u0644\u062F\u0641\u0639</span>';
  html += '</div>';

  // Calendar grid
  if (this.currentView === 'month') {
    html += this.renderMonthView();
  } else {
    html += this.renderWeekView();
  }

  html += '</div>';
  this.container.innerHTML = html;

  // Bind events
  this.container.querySelectorAll('.tc-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var action = btn.getAttribute('data-action');
      if (action === 'prev') self.prevMonth();
      else if (action === 'next') self.nextMonth();
      else if (action === 'today') self.goToToday();
    });
    btn.addEventListener('mouseenter', function() { btn.style.background = 'rgba(255,255,255,0.12)'; });
    btn.addEventListener('mouseleave', function() {
      if (btn.getAttribute('data-action') === 'today') btn.style.background = 'rgba(48,154,175,0.15)';
      else btn.style.background = 'rgba(255,255,255,0.06)';
    });
  });
  this.container.querySelectorAll('.tc-view-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { self.switchView(btn.getAttribute('data-view')); });
  });
  this.container.querySelectorAll('.tc-day-cell').forEach(function(cell) {
    cell.addEventListener('click', function(e) {
      if (e.target.closest('.tc-event-pill')) return;
      var dateStr = cell.getAttribute('data-date');
      if (dateStr) self.renderDayPanel(dateStr, self.getEventsForDate(dateStr));
    });
  });
  this.container.querySelectorAll('.tc-event-pill').forEach(function(pill) {
    pill.addEventListener('click', function(e) {
      e.stopPropagation();
      var idx = parseInt(pill.getAttribute('data-event-idx'));
      if (!isNaN(idx) && self.events[idx]) self.renderEventModal(self.events[idx]);
    });
  });
  this.container.querySelectorAll('.tc-more-pill').forEach(function(pill) {
    pill.addEventListener('click', function(e) {
      e.stopPropagation();
      var dateStr = pill.getAttribute('data-date');
      if (dateStr) self.renderDayPanel(dateStr, self.getEventsForDate(dateStr));
    });
  });
};

TravelCalendar.prototype.renderMonthView = function() {
  var year = this.currentDate.getFullYear();
  var month = this.currentDate.getMonth();
  var firstDay = new Date(year, month, 1);
  var lastDay = new Date(year, month + 1, 0);
  var startDow = (firstDay.getDay() + 1) % 7; // Sat=0
  var daysInMonth = lastDay.getDate();
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

  var html = '<div style="padding:8px;">';
  // Day headers
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px;">';
  for (var d = 0; d < 7; d++) {
    html += '<div style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--text-secondary,rgba(240,242,248,0.5));">' + ARABIC_DAYS[d] + '</div>';
  }
  html += '</div>';

  // Day cells
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">';
  var totalCells = startDow + daysInMonth;
  var rows = Math.ceil(totalCells / 7);
  for (var i = 0; i < rows * 7; i++) {
    var dayNum = i - startDow + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      html += '<div style="min-height:80px;background:rgba(255,255,255,0.01);border-radius:8px;"></div>';
      continue;
    }
    var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
    var dayEvents = this.getEventsForDate(dateStr);
    var isToday = dateStr === todayStr;

    html += '<div class="tc-day-cell" data-date="' + dateStr + '" style="min-height:80px;background:rgba(255,255,255,0.02);border-radius:8px;padding:6px;cursor:pointer;transition:background 0.2s;position:relative;' + (isToday ? 'box-shadow:inset 0 0 0 2px #309aaf;' : '') + '" onmouseenter="this.style.background=\'rgba(255,255,255,0.06)\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.02)\'">';
    html += '<div style="font-size:13px;font-weight:600;color:' + (isToday ? '#309aaf' : 'var(--text-primary,#f0f2f8)') + ';margin-bottom:4px;">' + dayNum;
    if (dayEvents.length > 0) {
      html += '<span style="width:6px;height:6px;border-radius:50%;background:' + dayEvents[0].color + ';display:inline-block;margin-right:4px;vertical-align:middle;"></span>';
    }
    html += '</div>';

    var maxPills = 2;
    for (var e = 0; e < Math.min(dayEvents.length, maxPills); e++) {
      var ev = dayEvents[e];
      var evIdx = this.events.indexOf(ev);
      html += '<div class="tc-event-pill" data-event-idx="' + evIdx + '" style="background:' + ev.color + '22;color:' + ev.color + ';font-size:11px;padding:2px 6px;border-radius:4px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;border-right:2px solid ' + ev.color + ';transition:background 0.2s;" onmouseenter="this.style.background=\'' + ev.color + '44\'" onmouseleave="this.style.background=\'' + ev.color + '22\'">' + escapeHtml(ev.title) + '</div>';
    }
    if (dayEvents.length > maxPills) {
      html += '<div class="tc-more-pill" data-date="' + dateStr + '" style="font-size:10px;color:var(--text-secondary,rgba(240,242,248,0.5));text-align:center;cursor:pointer;padding:2px;">+' + (dayEvents.length - maxPills) + ' \u0623\u0643\u062B\u0631</div>';
    }
    html += '</div>';
  }
  html += '</div></div>';
  return html;
};

TravelCalendar.prototype.renderWeekView = function() {
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  var current = new Date(this.currentDate);
  var dow = (current.getDay() + 1) % 7; // Sat=0
  var weekStart = new Date(current);
  weekStart.setDate(current.getDate() - dow);

  var html = '<div style="padding:8px;">';
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">';

  for (var d = 0; d < 7; d++) {
    var dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + d);
    var dateStr = dayDate.getFullYear() + '-' + String(dayDate.getMonth() + 1).padStart(2, '0') + '-' + String(dayDate.getDate()).padStart(2, '0');
    var dayEvents = this.getEventsForDate(dateStr);
    var isToday = dateStr === todayStr;

    html += '<div class="tc-day-cell" data-date="' + dateStr + '" style="min-height:200px;background:rgba(255,255,255,0.02);border-radius:8px;padding:10px 8px;cursor:pointer;transition:background 0.2s;' + (isToday ? 'box-shadow:inset 0 0 0 2px #309aaf;' : '') + '" onmouseenter="this.style.background=\'rgba(255,255,255,0.06)\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.02)\'">';
    html += '<div style="text-align:center;margin-bottom:8px;">';
    html += '<div style="font-size:11px;color:var(--text-secondary,rgba(240,242,248,0.5));">' + ARABIC_DAYS[d] + '</div>';
    html += '<div style="font-size:18px;font-weight:700;color:' + (isToday ? '#309aaf' : 'var(--text-primary,#f0f2f8)') + ';">' + dayDate.getDate() + '</div>';
    html += '</div>';

    dayEvents.forEach(function(ev) {
      var evIdx = this.events.indexOf(ev);
      html += '<div class="tc-event-pill" data-event-idx="' + evIdx + '" style="background:' + ev.color + '22;color:' + ev.color + ';font-size:11px;padding:4px 6px;border-radius:4px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;border-right:2px solid ' + ev.color + ';" onmouseenter="this.style.background=\'' + ev.color + '44\'" onmouseleave="this.style.background=\'' + ev.color + '22\'">' + escapeHtml(ev.title) + '</div>';
    }.bind(this));

    html += '</div>';
  }
  html += '</div></div>';
  return html;
};

TravelCalendar.prototype.renderEventModal = function(event) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:7000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  var modal = document.createElement('div');
  modal.style.cssText = 'background:#0a1628;border:1px solid rgba(255,255,255,0.1);border-radius:20px;max-width:440px;width:100%;padding:32px;position:relative;color:var(--text-primary,#f0f2f8);direction:rtl;';

  var closeBtn = '<button onclick="this.closest(\'div[style*=\\\"fixed\\\"]\').remove()" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,0.06);border:none;color:var(--text-primary,#f0f2f8);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;">&times;</button>';

  var content = closeBtn;
  content += '<div style="width:40px;height:4px;background:' + (event.color || '#309aaf') + ';border-radius:2px;margin-bottom:20px;"></div>';

  if (event.type === 'package') {
    content += '<h3 style="margin:0 0 20px;font-size:20px;color:var(--gold-300,#ae9073);">📦 ' + escapeHtml(event.title) + '</h3>';
    content += this.modalRow('\uD83C\uDFE8 \u0627\u0644\u0641\u0646\u062F\u0642', event.hotel || '\u2014');
    content += this.modalRow('\u2708\uFE0F \u0627\u0644\u0630\u0647\u0627\u0628', event.start);
    content += this.modalRow('\u2708\uFE0F \u0627\u0644\u0639\u0648\u062F\u0629', event.end || '\u2014');
    content += this.modalRow('\uD83D\uDCBA \u0627\u0644\u0645\u0642\u0627\u0639\u062F \u0627\u0644\u0643\u0644\u064A\u0629', event.seatsTotal);
    content += this.modalRow('\uD83D\uDCBA \u0627\u0644\u0645\u062D\u062C\u0648\u0632\u0629', event.seatsTaken);
    var remaining = (event.seatsTotal || 0) - (event.seatsTaken || 0);
    content += this.modalRow('\u2705 \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629', remaining);
  } else {
    var statusText = event.status === 'confirmed' ? '\u0645\u0624\u0643\u062F' : (event.status === 'paid' ? '\u0645\u062F\u0641\u0648\u0639' : '\u0645\u0639\u0644\u0642');
    content += '<h3 style="margin:0 0 20px;font-size:20px;color:var(--gold-300,#ae9073);">📝 \u062D\u062C\u0632</h3>';
    content += this.modalRow('\uD83D\uDC64 \u0627\u0644\u0639\u0645\u064A\u0644', event.title);
    content += this.modalRow('\uD83D\uDCDE \u0627\u0644\u0647\u0627\u062A\u0641', event.phone || '\u2014');
    content += this.modalRow('\uD83D\uDC65 \u0627\u0644\u0623\u0634\u062E\u0627\u0635', event.persons || 1);
    content += this.modalRow('\uD83D\uDCC5 \u0627\u0644\u062A\u0627\u0631\u064A\u062E', event.start);
    content += this.modalRow('\uD83D\uDCCB \u0627\u0644\u062D\u0627\u0644\u0629', '<span style="color:' + event.color + ';">' + statusText + '</span>');
  }

  modal.innerHTML = content;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};

TravelCalendar.prototype.modalRow = function(label, value) {
  return '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:14px;">' +
    '<span style="color:var(--text-secondary,rgba(240,242,248,0.6));">' + label + '</span>' +
    '<span style="font-weight:600;">' + (value !== undefined && value !== null ? value : '\u2014') + '</span></div>';
};

TravelCalendar.prototype.renderDayPanel = function(dateStr, events) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:7000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  var panel = document.createElement('div');
  panel.style.cssText = 'background:#0a1628;border:1px solid rgba(255,255,255,0.1);border-radius:20px;max-width:480px;width:100%;max-height:80vh;overflow-y:auto;padding:28px;color:var(--text-primary,#f0f2f8);direction:rtl;';

  var html = '<button onclick="this.closest(\'div[style*=\\\"fixed\\\"]\').remove()" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,0.06);border:none;color:var(--text-primary,#f0f2f8);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;">&times;</button>';
  html += '<h3 style="margin:0 0 20px;font-size:18px;color:var(--gold-300,#ae9073);">\uD83D\uDCC5 \u0623\u062D\u062F\u0627\u062B ' + dateStr + '</h3>';

  if (!events || events.length === 0) {
    html += '<p style="color:var(--text-secondary,rgba(240,242,248,0.5));text-align:center;padding:20px;">\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u062D\u062F\u0627\u062B \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645</p>';
  } else {
    var self = this;
    events.forEach(function(ev) {
      html += '<div style="background:' + ev.color + '11;border:1px solid ' + ev.color + '33;border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;" class="tc-day-event-card" data-ev-id="' + ev.id + '">';
      html += '<div style="font-size:14px;font-weight:600;color:' + ev.color + ';margin-bottom:4px;">' + escapeHtml(ev.title) + '</div>';
      html += '<div style="font-size:12px;color:var(--text-secondary,rgba(240,242,248,0.5));">' + (ev.type === 'package' ? '\u0628\u0627\u0642\u0629 \u0633\u0641\u0631' : '\u062D\u062C\u0632') + '</div>';
      html += '</div>';
    });
  }

  panel.innerHTML = html;
  panel.style.position = 'relative';
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Bind event card clicks
  var self = this;
  panel.querySelectorAll('.tc-day-event-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var evId = card.getAttribute('data-ev-id');
      var ev = self.events.find(function(e) { return String(e.id) === evId; });
      if (ev) {
        overlay.remove();
        self.renderEventModal(ev);
      }
    });
  });
};

TravelCalendar.prototype.prevMonth = function() {
  if (this.currentView === 'week') {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
  } else {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
  }
  this.render();
};

TravelCalendar.prototype.nextMonth = function() {
  if (this.currentView === 'week') {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
  } else {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
  }
  this.render();
};

TravelCalendar.prototype.goToToday = function() {
  this.currentDate = new Date();
  this.render();
};

TravelCalendar.prototype.switchView = function(view) {
  this.currentView = view;
  this.render();
};

/* ═══════════════════════════════════════════════════════
   LOADING SKELETONS
   ═══════════════════════════════════════════════════════ */
function showAnalyticsSkeletons() {
  var statsContainer = document.getElementById('stats-cards-container');
  if (statsContainer) {
    var skeletonHtml = '';
    for (var i = 0; i < 6; i++) {
      skeletonHtml += '<div style="background:rgba(255,255,255,0.03);border-radius:16px;padding:24px 20px;text-align:center;animation:skeleton-pulse 1.5s ease-in-out infinite;">' +
        '<div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.06);margin:0 auto 12px;"></div>' +
        '<div style="width:60%;height:28px;background:rgba(255,255,255,0.06);margin:0 auto 8px;border-radius:6px;"></div>' +
        '<div style="width:80%;height:14px;background:rgba(255,255,255,0.04);margin:0 auto;border-radius:4px;"></div>' +
        '</div>';
    }
    statsContainer.innerHTML = skeletonHtml;
  }

  var topPkg = document.getElementById('top-package-container');
  if (topPkg) topPkg.innerHTML = '<div style="height:56px;background:rgba(255,255,255,0.03);border-radius:14px;margin:20px 0;animation:skeleton-pulse 1.5s ease-in-out infinite;"></div>';

  var recent = document.getElementById('recent-bookings-container');
  if (recent) recent.innerHTML = '<div style="height:200px;background:rgba(255,255,255,0.03);border-radius:12px;animation:skeleton-pulse 1.5s ease-in-out infinite;"></div>';

  var cal = document.getElementById('calendar-container');
  if (cal) cal.innerHTML = '<div style="height:600px;background:rgba(255,255,255,0.03);border-radius:16px;animation:skeleton-pulse 1.5s ease-in-out infinite;"></div>';

  // Inject skeleton animation if not present
  if (!document.getElementById('analytics-skeleton-style')) {
    var style = document.createElement('style');
    style.id = 'analytics-skeleton-style';
    style.textContent = '@keyframes skeleton-pulse{0%,100%{opacity:0.4}50%{opacity:1}}';
    document.head.appendChild(style);
  }
}

/* ═══════════════════════════════════════════════════════
   INIT — Called from script.js loadAnalytics()
   ═══════════════════════════════════════════════════════ */
async function initAnalytics(cachedData) {
  // If cached data passed from script.js, render immediately
  if (cachedData) {
    renderStatsCards(cachedData.analytics);
    renderTopPackage(cachedData.analytics.topPackage);
    renderRecentBookings(cachedData.analytics.recentBookings);
    new TravelCalendar('calendar-container', cachedData.calendarEvents);
    return;
  }

  showAnalyticsSkeletons();

  try {
    var results = await Promise.all([
      gasFetch('POST', { action: 'getAnalytics' }),
      gasFetch('POST', { action: 'getCalendarEvents' })
    ]);

    var analyticsData = results[0];
    var calendarEvents = results[1];
    if (Array.isArray(calendarEvents) && calendarEvents.length === 0) calendarEvents = [];
    if (!Array.isArray(calendarEvents)) calendarEvents = [];

    // Cache in the global variable from script.js
    if (typeof analyticsDataCache !== 'undefined') {
      window.analyticsDataCache = { analytics: analyticsData, calendarEvents: calendarEvents };
      // Update the script.js reference too
      analyticsDataCache = window.analyticsDataCache;
    }

    renderStatsCards(analyticsData);
    renderTopPackage(analyticsData.topPackage);
    renderRecentBookings(analyticsData.recentBookings);
    new TravelCalendar('calendar-container', calendarEvents);
  } catch (err) {
    console.error('Analytics load error:', err);
    // Render error states per section
    var statsEl = document.getElementById('stats-cards-container');
    if (statsEl) statsEl.innerHTML = '<p style="color:#ff4757;text-align:center;padding:24px;">\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A</p>';

    var topEl = document.getElementById('top-package-container');
    if (topEl) topEl.innerHTML = '';

    var recentEl = document.getElementById('recent-bookings-container');
    if (recentEl) recentEl.innerHTML = '<p style="color:#ff4757;text-align:center;padding:24px;">\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A</p>';

    var calEl = document.getElementById('calendar-container');
    if (calEl) calEl.innerHTML = '<p style="color:#ff4757;text-align:center;padding:24px;">\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062A\u0642\u0648\u064A\u0645</p>';
  }
}
