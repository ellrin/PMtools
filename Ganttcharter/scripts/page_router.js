/**
 * page_router.js
 * 頁面切換邏輯：表單 ↔ 預覽。
 * 切換時從 DOM 讀回 phases + tasks（含 segments）到 AppState。
 */
const PageRouter = (() => {

  function goToInput() {
    show('page-input');
    hide('page-preview');
    setNavActive('nav-btn-input');
    syncMetaFieldsFromState();
    renderTaskList();
    renderPhaseList();
  }

  function goToPreview() {
    readFormIntoState();
    show('page-preview');
    hide('page-input');
    setNavActive('nav-btn-preview');
    renderPreviewPage();
  }

  /* ── 從 DOM 讀回 State ── */
  function readFormIntoState() {
    // Meta
    AppState.updateMeta({
      title:          val('chart-title'),
      startYM:        val('date-range-start') || '2026-05',
      endYM:          val('date-range-end')   || '2026-12',
      showGrid:       chk('show-grid-lines'),
      gridStyle:      val('grid-style-select') || 'cross-dashed',
      showDateLabels: chk('show-date-labels'),
      showLegend:     chk('show-legend') !== false,
    });

    // Phases
    const phases = [];
    document.querySelectorAll('.phase-row').forEach(row => {
      phases.push({
        id:     row.dataset.id,
        name:   rowVal(row, '.phase-name'),
        fill:   rowVal(row, '.phase-fill'),
        stroke: rowVal(row, '.phase-stroke'),
      });
    });
    AppState.setPhases(phases);

    // Tasks（含 segments）
    const tasks = [];
    document.querySelectorAll('.task-row').forEach(row => {
      const segments = [];
      row.querySelectorAll('.segment-row').forEach(segRow => {
        segments.push({
          phaseId:   rowVal(segRow, '.segment-phase-select'),
          startDate: rowVal(segRow, '.segment-start'),
          endDate:   rowVal(segRow, '.segment-end'),
        });
      });
      tasks.push({
        id:       parseInt(row.dataset.id),
        name:     rowVal(row, '.task-name'),
        segments,
      });
    });
    AppState.setTasks(tasks);
  }

  /* ── 把 state 的 meta 值回填 form ── */
  function syncMetaFieldsFromState() {
    const m = AppState.getMeta();
    setVal('chart-title',       m.title);
    setVal('date-range-start',  m.startYM);
    setVal('date-range-end',    m.endYM);
    setChk('show-grid-lines',   m.showGrid);
    setVal('grid-style-select', m.gridStyle || 'cross-dashed');
    setChk('show-date-labels',  m.showDateLabels);
    setChk('show-legend',       m.showLegend !== false);
  }

  /* ── DOM 工具 ── */
  function show(id) { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); }
  function hide(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }
  function setNavActive(activeId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.id === activeId));
  }
  function val(id)        { return (document.getElementById(id) || {}).value || ''; }
  function chk(id)        { return !!(document.getElementById(id) || {}).checked; }
  function setVal(id, v)  { const el = document.getElementById(id); if (el) el.value   = v ?? ''; }
  function setChk(id, v)  { const el = document.getElementById(id); if (el) el.checked = !!v; }
  function rowVal(row, sel) { const el = row.querySelector(sel); return el ? el.value : ''; }

  return { goToInput, goToPreview, readFormIntoState };

})();
