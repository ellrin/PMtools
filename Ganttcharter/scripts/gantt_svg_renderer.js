/**
 * gantt_svg_renderer.js
 * 核心 SVG 渲染器。
 * 功能：多段顏色 bar、彩色 header、年份行、自動時間刻度、格線樣式、底部圖例。
 * （備註功能已移除）
 */
const GanttRenderer = (() => {

  /* ── 版面常數 ── */
  const COL_W = { week: 82, month: 74, quarter: 98, halfyear: 118 };

  const L = {
    LEFT:         145,   // 任務名稱欄寬
    RIGHT:        20,    // 右側留白（縮小，避免視覺延伸）
    BAR_H:        24,    // bar 高度
    BAR_AREA_H:   40,    // 每列高度（bar 上下有 padding）
    YEAR_ROW_H:   22,    // 年份行高（標題與 header 之間）
    HEADER_H:     34,    // column header 高
    LEGEND_LINE_H:26,    // 圖例每行高
    TITLE_EXTRA:  44,    // 標題存在時的額外高度
  };

  const MONTH_ZH = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const MONTH_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* ══════════════════════════════════════════
     時間刻度偵測 & Timeline 建立
     ══════════════════════════════════════════ */

  function detectTimeScale(startYM, endYM) {
    const [sy, sm] = startYM.split('-').map(Number);
    const [ey, em] = endYM.split('-').map(Number);
    const m = (ey * 12 + em) - (sy * 12 + sm) + 1;
    if (m <= 2)  return 'week';
    if (m <= 18) return 'month';
    if (m <= 48) return 'quarter';
    return 'halfyear';
  }

  function buildWeekTimeline(startYM, endYM) {
    const [sy, sm] = startYM.split('-').map(Number);
    const [ey, em] = endYM.split('-').map(Number);
    const rangeStart = new Date(sy, sm - 1, 1);
    const rangeEnd   = new Date(ey, em, 0, 23, 59, 59);
    let cur = new Date(rangeStart);
    const dow = cur.getDay();
    if (dow !== 1) cur.setDate(cur.getDate() - (dow === 0 ? 6 : dow - 1));
    const weeks = [];
    while (cur <= rangeEnd) {
      weeks.push({ startMs: cur.getTime(), year: cur.getFullYear(), month: cur.getMonth() + 1, day: cur.getDate() });
      cur = new Date(cur.getTime() + 7 * 86400000);
    }
    return weeks;
  }

  function buildMonthTimeline(startYM, endYM) {
    const [sy, sm] = startYM.split('-').map(Number);
    const [ey, em] = endYM.split('-').map(Number);
    const out = [];
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
      out.push({ year: y, month: m });
      if (++m > 12) { m = 1; y++; }
    }
    return out;
  }

  function buildQuarterTimeline(startYM, endYM) {
    const [sy, sm] = startYM.split('-').map(Number);
    const [ey, em] = endYM.split('-').map(Number);
    const out = [];
    let y = sy, q = Math.ceil(sm / 3);
    const endQ = Math.ceil(em / 3);
    while (y < ey || (y === ey && q <= endQ)) {
      out.push({ year: y, q });
      if (++q > 4) { q = 1; y++; }
    }
    return out;
  }

  function buildHalfyearTimeline(startYM, endYM) {
    const [sy, sm] = startYM.split('-').map(Number);
    const [ey, em] = endYM.split('-').map(Number);
    const out = [];
    let y = sy, h = sm <= 6 ? 1 : 2;
    const endH = em <= 6 ? 1 : 2;
    while (y < ey || (y === ey && h <= endH)) {
      out.push({ year: y, h });
      if (++h > 2) { h = 1; y++; }
    }
    return out;
  }

  function buildTimeline(startYM, endYM, scale) {
    if (scale === 'week')     return buildWeekTimeline(startYM, endYM);
    if (scale === 'month')    return buildMonthTimeline(startYM, endYM);
    if (scale === 'quarter')  return buildQuarterTimeline(startYM, endYM);
    if (scale === 'halfyear') return buildHalfyearTimeline(startYM, endYM);
    return buildMonthTimeline(startYM, endYM);
  }

  /* ── 計算 timeline 中各年的跨度 ── */
  function computeYearSpans(timeline) {
    const spans = [];
    let curYear = null, startIdx = 0;
    timeline.forEach((col, i) => {
      if (col.year !== curYear) {
        if (curYear !== null) spans.push({ year: curYear, startIdx, endIdx: i - 1 });
        curYear = col.year;
        startIdx = i;
      }
    });
    if (curYear !== null) spans.push({ year: curYear, startIdx, endIdx: timeline.length - 1 });
    return spans;
  }

  /* ══════════════════════════════════════════
     日期 → X 座標
     ══════════════════════════════════════════ */

  function dateToX(dateStr, timeline, scale, colW) {
    if (!dateStr) return L.LEFT;
    const d   = new Date(dateStr + 'T12:00:00');
    const dMs = d.getTime();

    switch (scale) {
      case 'week': {
        const firstMs = timeline[0].startMs;
        const lastEnd = timeline[timeline.length - 1].startMs + 7 * 86400000;
        if (dMs <= firstMs) return L.LEFT;
        if (dMs >= lastEnd) return L.LEFT + timeline.length * colW;
        for (let i = 0; i < timeline.length; i++) {
          const ws = timeline[i].startMs, we = ws + 7 * 86400000;
          if (dMs >= ws && dMs < we) return L.LEFT + (i + (dMs - ws) / (7 * 86400000)) * colW;
        }
        return L.LEFT + timeline.length * colW;
      }
      case 'month': {
        const year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();
        const first = timeline[0], last = timeline[timeline.length - 1];
        if (year < first.year || (year === first.year && month < first.month)) return L.LEFT;
        if (year > last.year  || (year === last.year  && month > last.month))  return L.LEFT + timeline.length * colW;
        const idx = timeline.findIndex(m => m.year === year && m.month === month);
        if (idx < 0) return L.LEFT;
        const dim = new Date(year, month, 0).getDate();
        return L.LEFT + (idx + (day - 1) / dim) * colW;
      }
      case 'quarter': {
        const year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();
        const q = Math.ceil(month / 3);
        const first = timeline[0], last = timeline[timeline.length - 1];
        if (year < first.year || (year === first.year && q < first.q)) return L.LEFT;
        if (year > last.year  || (year === last.year  && q > last.q))  return L.LEFT + timeline.length * colW;
        const idx = timeline.findIndex(qi => qi.year === year && qi.q === q);
        if (idx < 0) return L.LEFT;
        const mInQ = (month - 1) % 3;
        const dim  = new Date(year, month, 0).getDate();
        return L.LEFT + (idx + (mInQ + (day - 1) / dim) / 3) * colW;
      }
      case 'halfyear': {
        const year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();
        const h = month <= 6 ? 1 : 2;
        const first = timeline[0], last = timeline[timeline.length - 1];
        if (year < first.year || (year === first.year && h < first.h)) return L.LEFT;
        if (year > last.year  || (year === last.year  && h > last.h))  return L.LEFT + timeline.length * colW;
        const idx = timeline.findIndex(hi => hi.year === year && hi.h === h);
        if (idx < 0) return L.LEFT;
        const sm  = h === 1 ? 1 : 7;
        const dim = new Date(year, month, 0).getDate();
        return L.LEFT + (idx + ((month - sm) + (day - 1) / dim) / 6) * colW;
      }
    }
    return L.LEFT;
  }

  /* ── 工具 ── */
  function esc(v) {
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function fmtDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  /* ══════════════════════════════════════════
     主渲染函式
     ══════════════════════════════════════════ */

  function render(state) {
    const { meta, phases, tasks, style } = state;
    const lang     = style.lang || 'zh';
    const fs       = Number(style.fontSize) || 12;
    const scale    = detectTimeScale(meta.startYM, meta.endYM);
    const timeline = buildTimeline(meta.startYM, meta.endYM, scale);
    const colW     = COL_W[scale];
    const nCols    = timeline.length;
    const chartW   = nCols * colW;

    const bgColor  = esc(style.bgColor      || '#ffffff');
    const gridClr  = esc(style.gridColor    || '#D3D1C7');
    const txtClr   = esc(style.textColor    || '#1e2a3a');
    const subClr   = esc(style.subtextColor || '#5f7085');
    const titleClr = esc(style.titleColor   || '#0d1926');
    const hdrFill  = esc(style.headerFill   || '#1e40af');
    const hdrTxt   = esc(style.headerTextColor || '#ffffff');

    /* ── Y 座標 ── */
    const titleH   = meta.title ? L.TITLE_EXTRA : 14;
    const yearRowY = titleH;                        // 年份行頂部
    const headerY  = titleH + L.YEAR_ROW_H;        // column header 頂部
    const chartTop = headerY + L.HEADER_H;         // 圖表資料區頂部

    /* ── 每列高度（bar 區，固定） ── */
    const rowH = L.BAR_AREA_H;

    /* ── 計算 barX 位置 ── */
    const taskLayouts = tasks.map(task => {
      const segs = (task.segments || []).filter(s => s.startDate && s.endDate);
      if (segs.length === 0) {
        return { segs: [], xs1: [], xs2: [], barX1: L.LEFT, barX2: L.LEFT, barW: 0 };
      }
      const xs1 = segs.map(s => dateToX(s.startDate, timeline, scale, colW));
      const xs2 = segs.map(s => dateToX(s.endDate,   timeline, scale, colW));
      return { segs, xs1, xs2, barX1: Math.min(...xs1), barX2: Math.max(...xs2), barW: Math.max(Math.max(...xs2) - Math.min(...xs1), 6) };
    });

    /* ── 列 Y 位置 ── */
    const rowYs = tasks.map((_, i) => chartTop + i * rowH);
    const chartBottom = chartTop + tasks.length * rowH;

    /* ── 圖例高度 ── */
    const legendH = meta.showLegend && phases.length > 0
      ? Math.ceil(phases.length / 4) * L.LEGEND_LINE_H + 18 : 0;

    /* ── SVG 尺寸 ── */
    const chartRight = L.LEFT + chartW;
    const W = chartRight + L.RIGHT;
    const H = chartBottom + legendH + 14;

    /* ── 年份跨度 ── */
    const yearSpans = computeYearSpans(timeline);

    const out = [];

    /* SVG 開頭 */
    out.push(
      `<svg id="gantt-svg" xmlns="http://www.w3.org/2000/svg"` +
      ` width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"` +
      ` font-family="${esc(style.font || 'sans-serif')}" font-size="${fs}px">`
    );

    /* 背景 */
    out.push(`<rect width="${W}" height="${H}" fill="${bgColor}"/>`);

    /* 標題 */
    if (meta.title) {
      out.push(
        `<text x="${W / 2}" y="${titleH - 12}" text-anchor="middle"` +
        ` font-size="${fs + 5}px" font-weight="700" fill="${titleClr}">${esc(meta.title)}</text>`
      );
    }

    /* ── 年份行（標題與 header 之間） ── */
    yearSpans.forEach((span, si) => {
      const x1 = L.LEFT + span.startIdx * colW;
      const x2 = L.LEFT + (span.endIdx + 1) * colW;
      const cx  = (x1 + x2) / 2;
      const yY  = yearRowY + L.YEAR_ROW_H / 2;
      out.push(
        `<text x="${cx}" y="${yY}" text-anchor="middle" dominant-baseline="central"` +
        ` fill="${subClr}" font-size="${fs}px" font-weight="600">${span.year}</text>`
      );
      // 多年時，在年份邊界畫分隔線
      if (si > 0) {
        const lx = L.LEFT + span.startIdx * colW;
        out.push(
          `<line x1="${lx}" y1="${yearRowY + 2}" x2="${lx}" y2="${yearRowY + L.YEAR_ROW_H - 2}"` +
          ` stroke="${gridClr}" stroke-width="0.8"/>`
        );
      }
    });

    /* ── 隔列底色（偶數列，限制在 chartRight 內） ── */
    tasks.forEach((_, i) => {
      if (i % 2 === 1) {
        const isDark = (style.bgColor === '#0f172a');
        const fill   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';
        out.push(`<rect x="0" y="${rowYs[i]}" width="${chartRight}" height="${rowH}" fill="${fill}"/>`);
      }
    });

    /* ── 格線 ── */
    const gs = meta.gridStyle || 'cross-dashed';
    if (gs !== 'none') {
      // 垂直線（column 邊界，限制在 chartTop→chartBottom）
      for (let i = 0; i <= nCols; i++) {
        const x = L.LEFT + i * colW;
        out.push(`<line x1="${x}" y1="${chartTop}" x2="${x}" y2="${chartBottom}" stroke="${gridClr}" stroke-width="0.6"/>`);
      }
      // 水平線（限制在 0→chartRight，不進入右側留白）
      if (gs === 'full-grid') {
        tasks.forEach((_, i) => {
          const y = rowYs[i];
          out.push(`<line x1="${L.LEFT}" y1="${y}" x2="${chartRight}" y2="${y}" stroke="${gridClr}" stroke-width="0.6"/>`);
        });
        out.push(`<line x1="${L.LEFT}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}" stroke="${gridClr}" stroke-width="0.6"/>`);
      } else if (gs === 'cross-dashed') {
        tasks.forEach((_, i) => {
          if (i > 0) {
            out.push(`<line x1="0" y1="${rowYs[i]}" x2="${chartRight}" y2="${rowYs[i]}" stroke="${gridClr}" stroke-width="0.5" stroke-dasharray="5,5"/>`);
          }
        });
        out.push(`<line x1="0" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}" stroke="${gridClr}" stroke-width="0.5" stroke-dasharray="5,5"/>`);
      }
    }

    /* ── Column Header 彩色方塊 ── */
    out.push(`<rect x="0" y="${headerY}" width="${L.LEFT}" height="${L.HEADER_H}" fill="${bgColor}"/>`);
    renderTimelineHeaders(out, timeline, scale, lang, L, colW, headerY, hdrFill, hdrTxt, fs);
    out.push(`<rect x="${chartRight}" y="${headerY}" width="${L.RIGHT}" height="${L.HEADER_H}" fill="${bgColor}"/>`);

    /* ── 任務列 ── */
    tasks.forEach((task, i) => {
      const tl = taskLayouts[i];
      const rY  = rowYs[i];
      const barY    = rY + (L.BAR_AREA_H - L.BAR_H) / 2;
      const centerY = rY + L.BAR_AREA_H / 2;

      /* 任務名稱 */
      out.push(
        `<text x="${L.LEFT - 8}" y="${centerY}"` +
        ` text-anchor="end" dominant-baseline="central"` +
        ` font-weight="600" font-size="${fs}px" fill="${txtClr}">${esc(task.name)}</text>`
      );

      if (tl.segs.length === 0) return;

      const { barX1, barX2, barW, segs, xs1, xs2 } = tl;

      /* ClipPath（確保分段顏色不超出圓角 bar 邊界） */
      const clipId = `bc-${task.id}`;
      out.push(
        `<defs><clipPath id="${clipId}">` +
        `<rect x="${barX1}" y="${barY}" width="${barW}" height="${L.BAR_H}" rx="5"/>` +
        `</clipPath></defs>`
      );

      /* 各階段區段 */
      segs.forEach((seg, si) => {
        const phase = phases.find(p => p.id === seg.phaseId);
        const fill  = esc(phase?.fill || '#e5e7eb');
        const x1    = xs1[si], x2 = xs2[si];
        out.push(
          `<rect x="${x1}" y="${barY}" width="${Math.max(x2 - x1, 1)}" height="${L.BAR_H}"` +
          ` fill="${fill}" clip-path="url(#${clipId})"/>`
        );
      });

      /* Bar 外框 */
      out.push(
        `<rect x="${barX1}" y="${barY}" width="${barW}" height="${L.BAR_H}"` +
        ` rx="5" fill="none" stroke="${gridClr}" stroke-width="0.9"/>`
      );

      /* 日期標籤 */
      if (meta.showDateLabels) {
        if (segs[0].startDate) {
          out.push(
            `<text x="${barX1 - 4}" y="${centerY}" text-anchor="end" dominant-baseline="central"` +
            ` font-size="${fs - 1}px" fill="${subClr}">${fmtDate(segs[0].startDate)}</text>`
          );
        }
        const lastSeg = segs[segs.length - 1];
        if (lastSeg.endDate) {
          out.push(
            `<text x="${barX2 + 4}" y="${centerY}" dominant-baseline="central"` +
            ` font-size="${fs - 1}px" fill="${txtClr}">${fmtDate(lastSeg.endDate)}</text>`
          );
        }
      }
    });

    /* ── 圖例 ── */
    if (meta.showLegend && phases.length > 0) {
      const legendY = chartBottom + 16;
      const swatchW = 14, swatchH = 12;
      const itemsPerRow = 4;
      phases.forEach((phase, pi) => {
        const col = pi % itemsPerRow;
        const row = Math.floor(pi / itemsPerRow);
        const approxW = Math.max(phase.name.length * fs * 0.75 + swatchW + 8, 90);
        const lx = L.LEFT + col * (approxW + 28);
        const ly = legendY + row * L.LEGEND_LINE_H;
        out.push(`<rect x="${lx}" y="${ly}" width="${swatchW}" height="${swatchH}" rx="2" fill="${esc(phase.fill)}"/>`);
        out.push(
          `<text x="${lx + swatchW + 6}" y="${ly + swatchH / 2}"` +
          ` dominant-baseline="central" font-size="${fs - 1}px" fill="${txtClr}">${esc(phase.name)}</text>`
        );
      });
    }

    out.push('</svg>');
    return out.join('\n');
  }

  /* ══════════════════════════════════════════
     Column Header 渲染（年份改為外部年份行，此處不重複寫年）
     ══════════════════════════════════════════ */

  function renderTimelineHeaders(out, timeline, scale, lang, L, colW, headerY, hdrFill, hdrTxt, fs) {
    switch (scale) {

      case 'week': {
        let prevMonth = null;
        timeline.forEach((w, i) => {
          const x = L.LEFT + i * colW, cx = x + colW / 2;
          out.push(`<rect x="${x}" y="${headerY}" width="${colW}" height="${L.HEADER_H}" fill="${hdrFill}"/>`);
          out.push(`<line x1="${x}" y1="${headerY}" x2="${x}" y2="${headerY + L.HEADER_H}" stroke="${hdrTxt}" stroke-width="0.4" opacity="0.3"/>`);
          // 月份名稱（只在月份切換時顯示，在 header 上半）
          const monthKey = `${w.year}-${w.month}`;
          if (monthKey !== prevMonth) {
            const mLabel = lang === 'zh' ? MONTH_ZH[w.month - 1] : MONTH_EN[w.month - 1];
            out.push(
              `<text x="${x + 4}" y="${headerY + 12}" dominant-baseline="central"` +
              ` fill="${hdrTxt}" font-size="${fs - 1}px" font-weight="700" opacity="0.9">${mLabel}</text>`
            );
            prevMonth = monthKey;
          }
          // 週起始日（header 下半）
          out.push(
            `<text x="${cx}" y="${headerY + L.HEADER_H - 8}" text-anchor="middle" dominant-baseline="central"` +
            ` fill="${hdrTxt}" font-size="${fs - 2}px" opacity="0.8">${w.month}/${w.day}</text>`
          );
        });
        break;
      }

      case 'month': {
        timeline.forEach((mon, i) => {
          const x = L.LEFT + i * colW, cx = x + colW / 2;
          out.push(`<rect x="${x}" y="${headerY}" width="${colW}" height="${L.HEADER_H}" fill="${hdrFill}"/>`);
          out.push(`<line x1="${x}" y1="${headerY}" x2="${x}" y2="${headerY + L.HEADER_H}" stroke="${hdrTxt}" stroke-width="0.4" opacity="0.3"/>`);
          const mLabel = lang === 'zh' ? MONTH_ZH[mon.month - 1] : MONTH_EN[mon.month - 1];
          out.push(
            `<text x="${cx}" y="${headerY + L.HEADER_H / 2}" text-anchor="middle"` +
            ` dominant-baseline="central" fill="${hdrTxt}" font-weight="700" font-size="${fs}px">${mLabel}</text>`
          );
        });
        break;
      }

      case 'quarter': {
        timeline.forEach((qi, i) => {
          const x = L.LEFT + i * colW, cx = x + colW / 2;
          out.push(`<rect x="${x}" y="${headerY}" width="${colW}" height="${L.HEADER_H}" fill="${hdrFill}"/>`);
          out.push(`<line x1="${x}" y1="${headerY}" x2="${x}" y2="${headerY + L.HEADER_H}" stroke="${hdrTxt}" stroke-width="0.4" opacity="0.3"/>`);
          const qLabel = lang === 'zh' ? `第${qi.q}季` : `Q${qi.q}`;
          out.push(
            `<text x="${cx}" y="${headerY + L.HEADER_H / 2}" text-anchor="middle"` +
            ` dominant-baseline="central" fill="${hdrTxt}" font-weight="700" font-size="${fs}px">${qLabel}</text>`
          );
        });
        break;
      }

      case 'halfyear': {
        timeline.forEach((hi, i) => {
          const x = L.LEFT + i * colW, cx = x + colW / 2;
          out.push(`<rect x="${x}" y="${headerY}" width="${colW}" height="${L.HEADER_H}" fill="${hdrFill}"/>`);
          out.push(`<line x1="${x}" y1="${headerY}" x2="${x}" y2="${headerY + L.HEADER_H}" stroke="${hdrTxt}" stroke-width="0.4" opacity="0.3"/>`);
          const hLabel = lang === 'zh'
            ? (hi.h === 1 ? '上半年' : '下半年')
            : (hi.h === 1 ? 'H1' : 'H2');
          out.push(
            `<text x="${cx}" y="${headerY + L.HEADER_H / 2}" text-anchor="middle"` +
            ` dominant-baseline="central" fill="${hdrTxt}" font-weight="700" font-size="${fs}px">${hLabel}</text>`
          );
        });
        break;
      }
    }
  }

  return { render, detectTimeScale };

})();
