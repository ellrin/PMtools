/**
 * data_state_store.js
 * Central state store for metadata, phases, tasks, style, and localStorage.
 */
const AppState = (() => {

  const STORAGE_KEY = 'gantt_maker_v2';

  const DEFAULT_STATE = {
    meta: {
      title:          '2026 Project Roadmap',
      startYM:        '2026-01',
      endYM:          '2026-12',
      showGrid:       true,
      gridStyle:      'cross-dashed',   // none | vertical | cross-dashed | full-grid
      showDateLabels: true,
      showLegend:     true,
    },
    phases: [
      { id: 'ph1', name: 'Planning', fill: '#bfdbfe', stroke: '#2563eb' },
      { id: 'ph2', name: 'Execution', fill: '#bbf7d0', stroke: '#16a34a' },
      { id: 'ph3', name: 'Review', fill: '#fde68a', stroke: '#d97706' },
    ],
    tasks: [
      { id: 1, name: 'Project kickoff', segments: [
        { phaseId: 'ph1', startDate: '2026-01-12', endDate: '2026-01-23' },
      ]},
      { id: 2, name: 'Requirements alignment', segments: [
        { phaseId: 'ph1', startDate: '2026-01-26', endDate: '2026-02-20' },
        { phaseId: 'ph3', startDate: '2026-02-23', endDate: '2026-02-27' },
      ]},
      { id: 3, name: 'Solution design', segments: [
        { phaseId: 'ph1', startDate: '2026-03-02', endDate: '2026-03-27' },
        { phaseId: 'ph3', startDate: '2026-03-30', endDate: '2026-04-03' },
      ]},
      { id: 4, name: 'Prototype build', segments: [
        { phaseId: 'ph2', startDate: '2026-04-06', endDate: '2026-05-15' },
        { phaseId: 'ph3', startDate: '2026-05-18', endDate: '2026-05-22' },
      ]},
      { id: 5, name: 'Implementation sprint', segments: [
        { phaseId: 'ph2', startDate: '2026-06-01', endDate: '2026-08-14' },
        { phaseId: 'ph3', startDate: '2026-08-17', endDate: '2026-08-28' },
      ]},
      { id: 6, name: 'Validation and testing', segments: [
        { phaseId: 'ph2', startDate: '2026-09-07', endDate: '2026-10-09' },
        { phaseId: 'ph3', startDate: '2026-10-12', endDate: '2026-10-23' },
      ]},
      { id: 7, name: 'Launch preparation', segments: [
        { phaseId: 'ph2', startDate: '2026-10-26', endDate: '2026-11-20' },
        { phaseId: 'ph3', startDate: '2026-11-23', endDate: '2026-12-04' },
      ]},
      { id: 8, name: 'Documentation update', segments: [
        { phaseId: 'ph2', startDate: '2026-03-16', endDate: '2026-12-04' },
      ]},
    ],
    style: {
      themeId:         'business-blue',
      font:            "'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
      fontSize:        12,
      bgColor:         '#ffffff',
      gridColor:       '#D3D1C7',
      textColor:       '#1e2a3a',
      subtextColor:    '#5f7085',
      titleColor:      '#0d1926',
      headerFill:      '#1e40af',
      headerTextColor: '#ffffff',
      lang:            'en',
    },
  };

  let state = null;
  let nextTaskId  = 100;
  let nextPhaseId = 100;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);

        if (!state.phases) state.phases = clone(DEFAULT_STATE.phases);
        if (!state.tasks) state.tasks = clone(DEFAULT_STATE.tasks);

        state.tasks.forEach(t => {
          if (!t.segments) {
            t.segments = [{ phaseId: state.phases[0]?.id || 'ph1', startDate: t.startDate || '', endDate: t.endDate || '' }];
          }
        });

        if (!state.meta) state.meta = clone(DEFAULT_STATE.meta);
        if (!state.style) state.style = clone(DEFAULT_STATE.style);
        if (!state.meta.gridStyle) state.meta.gridStyle = 'cross-dashed';
        if (!state.style.lang) state.style.lang = 'en';
        if (!state.style.headerFill) {
          state.style.headerFill      = '#1e40af';
          state.style.headerTextColor = '#ffffff';
        }

        nextTaskId  = Math.max(...state.tasks.map(t => t.id), 99) + 1;
        nextPhaseId = Math.max(...state.phases.map(p => parseInt(p.id.replace('ph','')) || 0), 99) + 1;
      } else {
        state = clone(DEFAULT_STATE);
      }
    } catch (_) {
      state = clone(DEFAULT_STATE);
    }
    return state;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function get()       { return state; }
  function getMeta()   { return state.meta; }
  function getPhases() { return state.phases; }
  function getTasks()  { return state.tasks; }
  function getStyle()  { return state.style; }

  function updateMeta(patch) { Object.assign(state.meta, patch); save(); }

  function updateStyle(patch) { Object.assign(state.style, patch); save(); }

  function addPhase(name, fill, stroke) {
    const id = 'ph' + nextPhaseId++;
    state.phases.push({ id, name: name || 'New phase', fill: fill || '#93c5fd', stroke: stroke || '#2563eb' });
    save();
    return id;
  }

  function removePhase(id) {
    state.phases = state.phases.filter(p => p.id !== id);
    state.tasks.forEach(t => {
      t.segments = t.segments.filter(s => s.phaseId !== id);
    });
    save();
  }

  function updatePhase(id, patch) {
    const p = state.phases.find(p => p.id === id);
    if (p) { Object.assign(p, patch); save(); }
  }

  function setPhases(phases) { state.phases = phases; save(); }

  function addTask() {
    const id = nextTaskId++;
    const defaultPhaseId = state.phases[0]?.id || 'ph1';
    const [ey, em] = state.meta.endYM.split('-').map(Number);
    const lastDay = new Date(ey, em, 0).getDate();
    state.tasks.push({
      id,
      name: 'New task',
      note: '',
      segments: [
        { phaseId: defaultPhaseId,
          startDate: state.meta.startYM + '-01',
          endDate:   `${state.meta.endYM}-${String(lastDay).padStart(2,'0')}` },
      ],
    });
    save();
    return id;
  }

  function removeTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
  }

  function updateTask(id, patch) {
    const t = state.tasks.find(t => t.id === id);
    if (t) { Object.assign(t, patch); save(); }
  }

  function setTasks(tasks) { state.tasks = tasks; save(); }

  function addSegmentToTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const defaultPhaseId = state.phases[0]?.id || 'ph1';
    task.segments.push({ phaseId: defaultPhaseId, startDate: '', endDate: '' });
    save();
  }

  function removeSegmentFromTask(taskId, segIndex) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.segments.splice(segIndex, 1);
    save();
  }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  return {
    load, save, get,
    getMeta, getPhases, getTasks, getStyle,
    updateMeta, updateStyle,
    addPhase, removePhase, updatePhase, setPhases,
    addTask, removeTask, updateTask, setTasks,
    addSegmentToTask, removeSegmentFromTask,
  };

})();
