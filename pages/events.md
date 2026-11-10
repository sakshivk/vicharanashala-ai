---
layout: page
title: Events
permalink: /events/
---

<div class="audience-hero">
  <p class="audience-hero-label"><i class="ph ph-calendar-blank"></i> &nbsp;VLED Lab Events</p>
  <h1 class="audience-hero-h">Come learn with us.</h1>
  <p class="audience-hero-p">Every event we run is designed to move education forward — workshops, Faculty Development Programs, product launches, and community gatherings. See what is coming up below, and browse the calendar.</p>
</div>

## Upcoming

<!-- Edit events in _data/events.yml — no code needed. They show here and on the calendar.
     The browser auto-hides past events here, so the next event promotes itself with no rebuild.
     (The block below is a no-JavaScript fallback; JS replaces it with the upcoming-only list.) -->
<div class="ev-list" id="ev-upcoming">
{% assign upcoming = site.data.events | sort: "date" %}
{% for e in upcoming %}
  <div class="ev-card">
    {% if e.image %}<a class="ev-card-img" href="{{ e.image | relative_url }}" target="_blank" rel="noopener"><img src="{{ e.image | relative_url }}" alt="{{ e.title }} poster" loading="lazy"></a>{% endif %}
    <div class="ev-card-main">
      {% if e.kind %}<span class="ev-kind">{{ e.kind }}</span>{% endif %}
      <div class="ev-title">{{ e.title }}</div>
      {% if e.speaker %}<div class="ev-speaker">{{ e.speaker }}</div>{% endif %}
      <div class="ev-meta">
        {% if e.date %}<span><i class="ph ph-calendar-dots"></i> {{ e.date | date: "%a, %-d %b %Y" }}{% if e.end and e.end != e.date %} – {{ e.end | date: "%-d %b %Y" }}{% endif %}{% if e.time %} · {{ e.time }}{% endif %}</span>{% endif %}
        {% if e.where %}<span><i class="ph ph-map-pin"></i> {{ e.where }}</span>{% endif %}
      </div>
      {% if e.blurb %}<p class="ev-blurb">{{ e.blurb }}</p>{% endif %}
    </div>
    {% if e.register_url and e.register_url != "" %}
    <div class="ev-card-cta" style="display:flex; flex-wrap:wrap; gap:0.4rem;"><a href="{{ e.register_url }}" target="_blank" rel="noopener" class="idt-btn"><i class="ph ph-arrow-up-right"></i> {{ e.register_label | default: "Register / Join" }}</a>{% if e.questions_url and e.questions_url != "" %}<a href="{{ e.questions_url }}" target="_blank" rel="noopener" class="idt-btn"><i class="ph ph-chats-circle"></i> Join the Conversation</a>{% endif %}</div>
    {% endif %}
  </div>
{% endfor %}
{% unless upcoming and upcoming.size > 0 %}<p class="ev-empty">No sessions scheduled right now — check the calendar below.</p>{% endunless %}
</div>

## Calendar

<div class="cal" id="vled-cal">
  <div class="cal-head">
    <button class="cal-nav" id="cal-prev" type="button" aria-label="Previous month">&lsaquo;</button>
    <div class="cal-month" id="cal-month"></div>
    <button class="cal-nav" id="cal-next" type="button" aria-label="Next month">&rsaquo;</button>
  </div>
  <div class="cal-grid" id="cal-grid"></div>
  <p class="cal-legend">Each event has its own colour · <span class="cal-legend-span"></span> shaded days are multi-day events — hover or tap a highlighted day for details.</p>
</div>

<script>window.VLED_EVENTS = {{ site.data.events | jsonify }}; window.VLED_BASEURL = {{ site.baseurl | jsonify }};</script>
<script>
(function () {
  var events = (window.VLED_EVENTS || []).filter(function (e) { return e && e.date; });

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var gridEl = document.getElementById('cal-grid');
  var monthEl = document.getElementById('cal-month');
  if (!gridEl) return;

  function parseYMD(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function keyOf(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }
  function keyOfDate(d) { return keyOf(d.getFullYear(), d.getMonth(), d.getDate()); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function timeMin(t) { if (!t) return 1e9; var m = String(t).match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])?/); if (!m) return 1e9; var h = +m[1], mn = +m[2], ap = m[3] ? m[3].toLowerCase() : ''; if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0; return h * 60 + mn; }

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var todayKey = keyOfDate(today);

  // Each event gets its own colour (stable, by its order in events.yml).
  var COLORS = ['#e48f38', '#42a6ac', '#8a5ab7', '#4c8c4a', '#3b7dd8', '#c65b7c'];

  // Expand each event across its day(s); multi-day events occupy every day start..end.
  var byDate = {}, spanDays = {};
  events.forEach(function (e, i) {
    e._color = COLORS[i % COLORS.length];
    var s = parseYMD(e.date), en = e.end ? parseYMD(e.end) : s; if (en < s) en = s;
    e._start = s; e._end = en; e._multi = en > s;
    var d = new Date(s);
    while (d <= en) { var k = keyOfDate(d); (byDate[k] = byDate[k] || []).push(e); if (e._multi) spanDays[k] = true; d.setDate(d.getDate() + 1); }
  });
  Object.keys(byDate).forEach(function (k) { byDate[k].sort(function (a, b) { return timeMin(a.time) - timeMin(b.time); }); });

  var futureKeys = Object.keys(byDate).filter(function (k) { return parseYMD(k) >= today; }).sort();
  var startD = futureKeys.length ? parseYMD(futureKeys[0]) : today;
  var viewY = startD.getFullYear(), viewM = startD.getMonth();

  function fmtDate(k) { var d = parseYMD(k); return WD[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
  function rangeStr(e) {
    var s = e._start, en = e._end, sM = MONTHS[s.getMonth()].slice(0, 3), eM = MONTHS[en.getMonth()].slice(0, 3);
    if (s.getFullYear() === en.getFullYear() && s.getMonth() === en.getMonth()) return s.getDate() + '–' + en.getDate() + ' ' + eM + ' ' + en.getFullYear();
    if (s.getFullYear() === en.getFullYear()) return s.getDate() + ' ' + sM + ' – ' + en.getDate() + ' ' + eM + ' ' + en.getFullYear();
    return s.getDate() + ' ' + sM + ' ' + s.getFullYear() + ' – ' + en.getDate() + ' ' + eM + ' ' + en.getFullYear();
  }
  function whenStr(e) { return e._multi ? rangeStr(e) : fmtDate(e.date); }
  function metaHTML(e, showDate) {
    var m = '';
    if (showDate || e._multi) m += '<span><i class="ph ph-calendar-dots"></i> ' + esc(whenStr(e)) + '</span>';
    if (e.time) m += '<span><i class="ph ph-clock"></i> ' + esc(e.time) + '</span>';
    if (e.where) m += '<span><i class="ph ph-map-pin"></i> ' + esc(e.where) + '</span>';
    return m;
  }
  function btn(e) {
    if (!e.register_url) return '';
    var reg = '<a class="idt-btn" href="' + esc(e.register_url) + '" target="_blank" rel="noopener"><i class="ph ph-arrow-up-right"></i> ' + esc(e.register_label || 'Register / Join') + '</a>';
    if (!e.questions_url) return reg;
    return '<div style="display:flex; flex-wrap:wrap; gap:0.4rem;">' + reg
      + '<a class="idt-btn" href="' + esc(e.questions_url) + '" target="_blank" rel="noopener"><i class="ph ph-chats-circle"></i> Join the Conversation</a></div>';
  }

  function calEv(e) {
    return '<div class="cal-ev" style="border-left-color:' + e._color + '">'
      + (e.image ? '<img class="cal-ev-img" src="' + esc((window.VLED_BASEURL || '') + e.image) + '" alt="" loading="lazy">' : '')
      + (e.kind ? '<span class="ev-kind">' + esc(e.kind) + '</span>' : '')
      + '<div class="cal-ev-title">' + esc(e.title) + '</div>'
      + (e.speaker ? '<div class="cal-ev-sp">' + esc(e.speaker) + '</div>' : '')
      + '<div class="cal-ev-meta">' + metaHTML(e, false) + '</div>'
      + btn(e) + '</div>';
  }
  function upCard(e) {
    var img = e.image ? esc((window.VLED_BASEURL || '') + e.image) : '';
    return '<div class="ev-card" style="border-left-color:' + e._color + '">'
      + (img ? '<a class="ev-card-img" href="' + img + '" target="_blank" rel="noopener"><img src="' + img + '" alt="' + esc(e.title) + ' poster" loading="lazy"></a>' : '')
      + '<div class="ev-card-main">'
      + (e.kind ? '<span class="ev-kind">' + esc(e.kind) + '</span>' : '')
      + '<div class="ev-title">' + esc(e.title) + '</div>'
      + (e.speaker ? '<div class="ev-speaker">' + esc(e.speaker) + '</div>' : '')
      + '<div class="ev-meta">' + metaHTML(e, true) + '</div>'
      + (e.blurb ? '<p class="ev-blurb">' + esc(e.blurb) + '</p>' : '')
      + '</div>'
      + (e.register_url ? '<div class="ev-card-cta">' + btn(e) + '</div>' : '')
      + '</div>';
  }
  function dayHeading(k) { var d = parseYMD(k); return '<div class="cal-detail-h">' + WD[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + '</div>'; }

  function renderUpcoming() {
    var el = document.getElementById('ev-upcoming'); if (!el) return;
    var up = events.filter(function (e) { return e._start >= today; }).sort(function (a, b) {
      var ak = keyOfDate(a._start), bk = keyOfDate(b._start);
      if (ak !== bk) return ak < bk ? -1 : 1;
      return timeMin(a.time) - timeMin(b.time);
    });
    el.innerHTML = up.length ? up.map(upCard).join('') : '<p class="ev-empty">No sessions scheduled right now — check the calendar below.</p>';
  }

  function closeAll() { Array.prototype.forEach.call(document.querySelectorAll('.cal-cell.cal-open'), function (c) { c.classList.remove('cal-open'); }); }

  function render() {
    monthEl.textContent = MONTHS[viewM] + ' ' + viewY;
    gridEl.innerHTML = '';
    WD.forEach(function (w) { var c = document.createElement('div'); c.className = 'cal-wd'; c.textContent = w; gridEl.appendChild(c); });
    var startDow = new Date(viewY, viewM, 1).getDay();
    var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    for (var i = 0; i < startDow; i++) { var b = document.createElement('div'); b.className = 'cal-cell cal-empty'; gridEl.appendChild(b); }
    for (var d = 1; d <= daysInMonth; d++) {
      var k = keyOf(viewY, viewM, d);
      var col = (startDow + d - 1) % 7;
      var cell = document.createElement('div');
      var evs = byDate[k] || [];
      cell.className = 'cal-cell' + (evs.length ? ' cal-has' : '') + (spanDays[k] ? ' cal-span' : '') + (k === todayKey ? ' cal-today' : '');
      var dots = '';
      if (evs.length) {
        var shown = evs.slice(0, 4);
        dots = '<span class="cal-dots">' + shown.map(function (e) { return '<span class="cal-dot" style="background:' + e._color + '"></span>'; }).join('')
             + (evs.length > 4 ? '<span class="cal-more">+' + (evs.length - 4) + '</span>' : '') + '</span>';
      }
      cell.innerHTML = '<span class="cal-d">' + d + '</span>' + dots;
      if (evs.length) {
        var pop = document.createElement('div');
        pop.className = 'cal-pop ' + (col <= 3 ? 'cal-pop-r' : 'cal-pop-l');
        pop.innerHTML = dayHeading(k) + evs.map(calEv).join('');
        pop.addEventListener('click', function (ev) { ev.stopPropagation(); });
        cell.appendChild(pop);
        (function (cc) { cell.addEventListener('click', function (ev) { ev.stopPropagation(); var open = cc.classList.contains('cal-open'); closeAll(); if (!open) cc.classList.add('cal-open'); }); })(cell);
      }
      gridEl.appendChild(cell);
    }
  }

  document.getElementById('cal-prev').addEventListener('click', function () { if (--viewM < 0) { viewM = 11; viewY--; } closeAll(); render(); });
  document.getElementById('cal-next').addEventListener('click', function () { if (++viewM > 11) { viewM = 0; viewY++; } closeAll(); render(); });
  document.addEventListener('click', closeAll);
  renderUpcoming();
  render();
})();
</script>

## The events we run

<div class="idt-cards">
  <div class="idt-card">
    <div class="idt-card-icon"><i class="ph ph-chalkboard-teacher"></i></div>
    <div class="idt-card-name">Faculty Development</div>
    <p class="idt-card-desc">Structured programmes for educators — <a href="{{ site.baseurl }}/initiatives/vriddhi/">Vriddhi</a>, <a href="{{ site.baseurl }}/initiatives/gurusetu/">GuruSetu</a>, and <a href="{{ site.baseurl }}/initiatives/cbpai/">CBPAI</a> — self-paced content with live support sessions.</p>
  </div>
  <div class="idt-card">
    <div class="idt-card-icon"><i class="ph ph-microphone"></i></div>
    <div class="idt-card-name">V-Talks</div>
    <p class="idt-card-desc"><a href="{{ site.baseurl }}/initiatives/v-talks/">Vicharanashala Talks</a> bring professionals, creators, and thinkers into dialogue on themes that matter well beyond the classroom — open to all.</p>
  </div>
  <div class="idt-card">
    <div class="idt-card-icon"><i class="ph ph-globe"></i></div>
    <div class="idt-card-name">Global Speaker Series</div>
    <p class="idt-card-desc"><a href="{{ site.baseurl }}/initiatives/global-speaker-series/">Conversations</a> with teaching faculty from universities around the world — what works in their classrooms, and what we can carry into ours.</p>
  </div>
  <div class="idt-card">
    <div class="idt-card-icon"><i class="ph ph-student"></i></div>
    <div class="idt-card-name">Student Programmes</div>
    <p class="idt-card-desc">Cohort programmes for students — the <a href="{{ site.baseurl }}/initiatives/summership/">Summership</a> research internship, plus intensive bootcamps in Full Stack Development, AI literacy, and more.</p>
  </div>
  <div class="idt-card">
    <div class="idt-card-icon"><i class="ph ph-toolbox"></i></div>
    <div class="idt-card-name">Workshops</div>
    <p class="idt-card-desc">Half- and full-day hands-on sessions on pedagogy, EdTech tools, and instructional design — open to educators and students.</p>
  </div>
  <div class="idt-card">
    <div class="idt-card-icon"><i class="ph ph-confetti"></i></div>
    <div class="idt-card-name">Lab Events</div>
    <p class="idt-card-desc">Product launches, research presentations, Guru Purnima celebrations, and community gatherings for the VLED Lab community.</p>
  </div>
</div>

<div class="idt-cta">
  <div class="idt-cta-t">Want to co-host or propose an event?</div>
  <p>We are always open to collaborations that move education forward — workshops, talks, and joint programmes with institutions and practitioners.</p>
  <div class="idt-actions">
    <a href="{{ site.baseurl }}/contact/" class="idt-btn"><i class="ph ph-paper-plane-tilt"></i> Get in touch</a>
  </div>
</div>
