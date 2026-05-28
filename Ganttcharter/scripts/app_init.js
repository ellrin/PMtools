/**
 * app_init.js
 * 全域 UI 函式：初始化、phase 管理、task/segment 管理、樣式面板。
 * 所有 HTML inline onclick 呼叫的函式都定義在此（全域 scope）。
 */

/* ══════════════════════════════════════════
   工具
   ══════════════════════════════════════════ */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════
   頁面 1：階段（Phase）管理
   ══════════════════════════════════════════ */

/** 新增一個 Phase */
function addPhase() {
  AppState.addPhase('新階段', '#93c5fd', '#2563eb');
  renderPhaseList();
  renderTaskList(); // dropdown 要更新
}

/** 刪除 Phase */
function removePhase(id) {
  if (AppState.getPhases().length <= 1) {
    alert('至少需要保留一個階段。');
    return;
  }
  AppState.removePhase(id);
  renderPhaseList();
  renderTaskList();
}

/** 渲染 Phase 列表（動態） */
function renderPhaseList() {
  const container = document.getElementById('phase-list');
  if (!container) return;
  const phases = AppState.getPhases();
  container.innerHTML = '';

  phases.forEach(phase => {
    const row = document.createElement('div');
    row.className   = 'phase-row';
    row.dataset.id  = phase.id;
    row.innerHTML = `
      <div class="phase-row-inner">
        <div class="color-swatch-preview" style="background:${phase.fill};border:2px solid ${phase.stroke}"></div>
        <input class="phase-name" type="text" value="${escapeHtml(phase.name)}" placeholder="階段名稱"
               oninput="syncPhaseNameToDropdowns()">
        <div class="phase-colors">
          <label class="field-label">填充</label>
          <input class="phase-fill" type="color" value="${phase.fill}"
                 oninput="onPhaseColorChange(this)">
          <label class="field-label">邊框</label>
          <input class="phase-stroke" type="color" value="${phase.stroke}"
                 oninput="onPhaseColorChange(this)">
        </div>
        <button class="btn-remove-task" onclick="removePhase('${phase.id}')" title="刪除此階段">&#x2715;</button>
      </div>
    `;
    container.appendChild(row);
  });
}

/** Phase 顏色即時更新色塊預覽 */
function onPhaseColorChange(input) {
  const row    = input.closest('.phase-row');
  const fill   = row.querySelector('.phase-fill').value;
  const stroke = row.querySelector('.phase-stroke').value;
  row.querySelector('.color-swatch-preview').style.background   = fill;
  row.querySelector('.color-swatch-preview').style.borderColor  = stroke;
}

/** 同步 Phase 名稱到 segment dropdown 選項 */
function syncPhaseNameToDropdowns() {
  document.querySelectorAll('.segment-phase-select').forEach(sel => {
    const phId = sel.value;
    rebuildPhaseOptions(sel, phId);
  });
}

/** 重建 phase <option> 列表（讀當前 DOM phase-list） */
function rebuildPhaseOptions(select, selectedId) {
  const phases = getPhaseListFromDom();
  select.innerHTML = '';
  phases.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (p.id === selectedId) opt.selected = true;
    select.appendChild(opt);
  });
}

/** 從表單 DOM 讀出當前 phase 定義（不依賴 AppState，即時反映未儲存的輸入） */
function getPhaseListFromDom() {
  const phases = [];
  document.querySelectorAll('.phase-row').forEach(row => {
    phases.push({
      id:   row.dataset.id,
      name: (row.querySelector('.phase-name') || {}).value || '?',
      fill: (row.querySelector('.phase-fill') || {}).value || '#ccc',
    });
  });
  return phases;
}

/* ══════════════════════════════════════════
   頁面 1：任務 + 區段（Segment）管理
   ══════════════════════════════════════════ */

/** 新增任務列 */
function addTask() {
  PageRouter.readFormIntoState(); // 先把目前表單存入 state
  AppState.addTask();
  renderTaskList();
}

/** 刪除任務 */
function removeTask(id) {
  AppState.removeTask(id);
  renderTaskList();
}

/** 新增 segment 至某任務（點擊 "+ 新增區段"） */
function addSegmentToTask(taskId) {
  PageRouter.readFormIntoState();
  AppState.addSegmentToTask(taskId);
  renderTaskList();
}

/** 刪除 segment */
function removeSegmentFromTask(taskId, segIdx) {
  const task = AppState.getTasks().find(t => t.id === taskId);
  if (!task || task.segments.length <= 1) {
    alert('至少需要保留一個區段。');
    return;
  }
  PageRouter.readFormIntoState();
  AppState.removeSegmentFromTask(taskId, segIdx);
  renderTaskList();
}

/** 渲染整個任務列表（水平佈局：名稱左、區段右） */
function renderTaskList() {
  const tasks     = AppState.getTasks();
  const container = document.getElementById('task-list');
  if (!container) return;

  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = `<div class="empty-hint">尚無任務，點擊「新增任務」開始。</div>`;
    return;
  }

  tasks.forEach((task, idx) => {
    const row = document.createElement('div');
    row.className  = 'task-row';
    row.dataset.id = task.id;

    const segmentsHtml = (task.segments || []).map((seg, si) => buildSegmentRowHtml(task.id, seg, si)).join('');

    row.innerHTML = `
      <span class="task-index-badge">${idx + 1}</span>
      <input type="text" class="task-name" value="${escapeHtml(task.name)}" placeholder="任務名稱">
      <div class="segment-list">
        ${segmentsHtml}
        <button class="btn-add-segment" onclick="addSegmentToTask(${task.id})">+ 新增區段</button>
      </div>
      <button class="btn-remove-task" onclick="removeTask(${task.id})" title="刪除">&#x2715;</button>
    `;
    container.appendChild(row);
  });
}

function buildSegmentRowHtml(taskId, seg, si) {
  const phaseOptions = getPhaseListFromDom().map(p =>
    `<option value="${p.id}" ${p.id === seg.phaseId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
  ).join('');

  return `
    <div class="segment-row">
      <select class="segment-phase-select">${phaseOptions}</select>
      <input type="date" class="segment-start" value="${seg.startDate || ''}">
      <span class="date-arrow">→</span>
      <input type="date" class="segment-end" value="${seg.endDate || ''}">
      <button class="btn-remove-segment" onclick="removeSegmentFromTask(${taskId}, ${si})">&#x2715;</button>
    </div>
  `;
}

/* ══════════════════════════════════════════
   頁面 2：預覽 & 樣式面板
   ══════════════════════════════════════════ */

function rerenderChart() {
  const container = document.getElementById('gantt-preview-container');
  if (!container) return;
  container.innerHTML = GanttRenderer.render(AppState.get());
  updateTimeScaleIndicator();
}

function renderPreviewPage() {
  renderThemeCards();
  renderFontSelect();
  renderPhaseColorControls();
  syncStyleControlsFromState();
  rerenderChart();
}

/* ── 時間刻度指示器 ── */
function updateTimeScaleIndicator() {
  const meta  = AppState.getMeta();
  const scale = GanttRenderer.detectTimeScale(meta.startYM, meta.endYM);
  const labels = { week: '週', month: '月', quarter: '季', halfyear: '半年' };
  const el = document.getElementById('time-scale-indicator');
  if (el) el.textContent = `時間單位：${labels[scale] || '月'}`;
}

/* ── 主題卡片 ── */
function renderThemeCards() {
  const container = document.getElementById('theme-cards');
  if (!container) return;

  const current = AppState.getStyle().themeId;
  const groups = [
    { label: '正式 Formal',  items: ColorThemePresets.getFormal()  },
    { label: '自然 Neutral', items: ColorThemePresets.getNeutral() },
    { label: '活潑 Lively',  items: ColorThemePresets.getLively()  },
  ];
  container.innerHTML = '';

  groups.forEach(group => {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'grid-column:1/-1;font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;text-transform:uppercase;margin-top:6px;margin-bottom:2px;';
    lbl.textContent = group.label;
    container.appendChild(lbl);

    group.items.forEach(theme => {
      const [c0, c1] = theme.defaultPhaseColors;
      const card = document.createElement('button');
      card.className       = 'theme-card' + (current === theme.id ? ' active' : '');
      card.dataset.themeId = theme.id;
      card.innerHTML = `
        <div class="theme-mini-preview" style="background:${theme.bgColor};border-color:${theme.gridColor}">
          <div class="theme-mini-bar w-full" style="background:${c0.fill};border-color:${c0.stroke}"></div>
          <div class="theme-mini-bar w-half" style="background:${(c1||c0).fill};border-color:${(c1||c0).stroke}"></div>
        </div>
        <span class="theme-card-name">${theme.nameZH}</span>
      `;
      card.onclick = () => applyTheme(theme.id);
      container.appendChild(card);
    });
  });
}

function applyTheme(themeId) {
  const theme = ColorThemePresets.getById(themeId);
  if (!theme) return;

  AppState.updateStyle({
    themeId,
    bgColor:         theme.bgColor,
    gridColor:       theme.gridColor,
    textColor:       theme.textColor,
    subtextColor:    theme.subtextColor,
    titleColor:      theme.titleColor,
    headerFill:      theme.headerFill,
    headerTextColor: theme.headerTextColor,
  });

  // 把主題預設顏色套給目前的 phases
  const phases = AppState.getPhases();
  phases.forEach((phase, i) => {
    const def = theme.defaultPhaseColors[i % theme.defaultPhaseColors.length];
    AppState.updatePhase(phase.id, { fill: def.fill, stroke: def.stroke });
  });

  document.querySelectorAll('.theme-card').forEach(c =>
    c.classList.toggle('active', c.dataset.themeId === themeId)
  );

  syncStyleControlsFromState();
  renderPhaseColorControls();
  renderPhaseList(); // 更新表單上的 phase 色塊
  rerenderChart();
}

/* ── 字體 ── */
function renderFontSelect() {
  const select  = document.getElementById('font-select');
  if (!select) return;
  const fonts   = FontOptions.getAll();
  const current = AppState.getStyle().font;
  select.innerHTML = '';
  fonts.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.css;
    opt.textContent = f.name;
    if (f.css === current) opt.selected = true;
    select.appendChild(opt);
  });
  updateFontPreview();
}

function updateFontPreview() {
  const preview = document.getElementById('font-preview-text');
  const select  = document.getElementById('font-select');
  if (preview && select) preview.style.fontFamily = select.value;
}

function applyStyleFromControls() {
  const font   = document.getElementById('font-select')?.value || '';
  const slider = document.getElementById('font-size-slider');
  const fs     = slider ? parseInt(slider.value) : 12;
  const fsLabel = document.getElementById('font-size-display');
  if (fsLabel) fsLabel.textContent = fs + 'px';
  updateFontPreview();
  AppState.updateStyle({ font, fontSize: fs });
  rerenderChart();
}

/* ── 語言切換 ── */
function toggleLang() {
  const cur = AppState.getStyle().lang || 'zh';
  const nxt = cur === 'zh' ? 'en' : 'zh';
  AppState.updateStyle({ lang: nxt });
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.textContent = nxt === 'zh' ? 'EN' : '中';
  rerenderChart();
}

/* ── 背景 & 格線顏色 ── */
function onBgColorChange(val) {
  document.getElementById('bg-color-hex').textContent = val;
  AppState.updateStyle({ bgColor: val });
  rerenderChart();
}

function onGridColorChange(val) {
  document.getElementById('grid-color-hex').textContent = val;
  AppState.updateStyle({ gridColor: val });
  rerenderChart();
}

function onHeaderFillChange(val) {
  document.getElementById('header-fill-hex').textContent = val;
  AppState.updateStyle({ headerFill: val });
  rerenderChart();
}

/* ── 格線樣式 ── */
function onGridStyleChange(val) {
  AppState.updateMeta({ gridStyle: val });
  rerenderChart();
}

/* ── Phase 顏色控制（預覽頁 style panel） ── */
function renderPhaseColorControls() {
  const container = document.getElementById('phase-color-controls');
  if (!container) return;
  const phases = AppState.getPhases();
  container.innerHTML = '';

  if (phases.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text-muted)">尚無階段</p>';
    return;
  }

  phases.forEach(phase => {
    const row = document.createElement('div');
    row.className = 'task-color-row';
    row.innerHTML = `
      <span class="task-color-name">${escapeHtml(phase.name)}</span>
      <div class="task-color-inputs">
        <div>
          <input type="color" value="${phase.fill}" title="填充色"
            onchange="updatePhaseColorFromPanel('${phase.id}','fill',this.value)">
          <div class="color-type-hint">填充</div>
        </div>
        <div>
          <input type="color" value="${phase.stroke}" title="邊框色"
            onchange="updatePhaseColorFromPanel('${phase.id}','stroke',this.value)">
          <div class="color-type-hint">邊框</div>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

function updatePhaseColorFromPanel(id, prop, value) {
  AppState.updatePhase(id, { [prop]: value });
  rerenderChart();
}

/* ── 同步 state → UI 控制項 ── */
function syncStyleControlsFromState() {
  const s = AppState.getStyle();

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };

  set('bg-color-input',   s.bgColor);
  setText('bg-color-hex', s.bgColor);
  set('grid-color-input',   s.gridColor);
  setText('grid-color-hex', s.gridColor);
  set('header-fill-input',   s.headerFill);
  setText('header-fill-hex', s.headerFill);

  const slider = document.getElementById('font-size-slider');
  if (slider) slider.value = s.fontSize || 12;
  setText('font-size-display', (s.fontSize || 12) + 'px');

  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.textContent = (s.lang || 'zh') === 'zh' ? 'EN' : '中';

  // grid style select in preview
  const gsEl = document.getElementById('preview-grid-style');
  if (gsEl) gsEl.value = AppState.getMeta().gridStyle || 'cross-dashed';
}

/* ══════════════════════════════════════════
   初始化
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  AppState.load();

  const meta = AppState.getMeta();
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };

  setVal('chart-title',      meta.title);
  setVal('date-range-start', meta.startYM);
  setVal('date-range-end',   meta.endYM);
  setChk('show-grid-lines',  meta.showGrid);
  setVal('grid-style-select', meta.gridStyle || 'cross-dashed');
  setChk('show-date-labels', meta.showDateLabels);
  setChk('show-legend',      meta.showLegend !== false);

  renderPhaseList();
  renderTaskList();

  document.getElementById('nav-btn-input')?.classList.add('active');
});
