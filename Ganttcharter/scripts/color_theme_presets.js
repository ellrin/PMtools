/**
 * color_theme_presets.js
 * 10 個主題（正式 / 自然 / 活潑）。
 * 每個主題包含：背景色、格線色、文字色、header 色、以及 phases 預設色。
 */
const ColorThemePresets = (() => {

  const THEMES = [

    /* ═══════ 正式 Formal ═══════ */

    {
      id: 'business-blue', nameZH: '商務藍', tag: 'formal',
      bgColor: '#ffffff', gridColor: '#dce3ed',
      textColor: '#1e2a3a', subtextColor: '#5f7085', titleColor: '#0d1926',
      headerFill: '#1e40af', headerTextColor: '#ffffff',
      defaultPhaseColors: [
        { fill: '#bfdbfe', stroke: '#2563eb' },
        { fill: '#d1fae5', stroke: '#059669' },
        { fill: '#fef9c3', stroke: '#ca8a04' },
        { fill: '#fce7f3', stroke: '#be185d' },
        { fill: '#ede9fe', stroke: '#7c3aed' },
        { fill: '#cffafe', stroke: '#0891b2' },
      ],
    },
    {
      id: 'slate-professional', nameZH: '石板灰', tag: 'formal',
      bgColor: '#f8fafc', gridColor: '#cbd5e1',
      textColor: '#1e293b', subtextColor: '#64748b', titleColor: '#0f172a',
      headerFill: '#334155', headerTextColor: '#f1f5f9',
      defaultPhaseColors: [
        { fill: '#e2e8f0', stroke: '#475569' },
        { fill: '#dbeafe', stroke: '#3b82f6' },
        { fill: '#d1fae5', stroke: '#10b981' },
        { fill: '#fef3c7', stroke: '#d97706' },
        { fill: '#fce7f3', stroke: '#db2777' },
        { fill: '#ede9fe', stroke: '#7c3aed' },
      ],
    },
    {
      id: 'ink-monochrome', nameZH: '墨水黑白', tag: 'formal',
      bgColor: '#ffffff', gridColor: '#e5e7eb',
      textColor: '#111827', subtextColor: '#6b7280', titleColor: '#000000',
      headerFill: '#1f2937', headerTextColor: '#f9fafb',
      defaultPhaseColors: [
        { fill: '#9ca3af', stroke: '#374151' },
        { fill: '#d1d5db', stroke: '#9ca3af' },
        { fill: '#f3f4f6', stroke: '#d1d5db' },
        { fill: '#374151', stroke: '#111827' },
        { fill: '#6b7280', stroke: '#374151' },
        { fill: '#e5e7eb', stroke: '#6b7280' },
      ],
    },
    {
      id: 'dark-elite', nameZH: '深色精英', tag: 'formal',
      bgColor: '#0f172a', gridColor: '#1e293b',
      textColor: '#e2e8f0', subtextColor: '#94a3b8', titleColor: '#f1f5f9',
      headerFill: '#1e293b', headerTextColor: '#94a3b8',
      defaultPhaseColors: [
        { fill: '#1e40af', stroke: '#60a5fa' },
        { fill: '#065f46', stroke: '#34d399' },
        { fill: '#7c2d12', stroke: '#fb923c' },
        { fill: '#4c1d95', stroke: '#c4b5fd' },
        { fill: '#831843', stroke: '#f9a8d4' },
        { fill: '#164e63', stroke: '#67e8f9' },
      ],
    },

    /* ═══════ 自然 Neutral ═══════ */

    {
      id: 'warm-document', nameZH: '暖色文件', tag: 'neutral',
      bgColor: '#faf9f7', gridColor: '#e5e0d8',
      textColor: '#3d2f20', subtextColor: '#8c7a6a', titleColor: '#1e1209',
      headerFill: '#92400e', headerTextColor: '#fef3c7',
      defaultPhaseColors: [
        { fill: '#faeeda', stroke: '#b45309' },
        { fill: '#eaf3de', stroke: '#4d7c0f' },
        { fill: '#fef9c3', stroke: '#a16207' },
        { fill: '#faece7', stroke: '#c2410c' },
        { fill: '#f1eefa', stroke: '#7c3aed' },
        { fill: '#e0f2fe', stroke: '#0369a1' },
      ],
    },
    {
      id: 'forest-nature', nameZH: '森林自然', tag: 'neutral',
      bgColor: '#f0fdf4', gridColor: '#bbf7d0',
      textColor: '#14532d', subtextColor: '#15803d', titleColor: '#052e16',
      headerFill: '#15803d', headerTextColor: '#f0fdf4',
      defaultPhaseColors: [
        { fill: '#bbf7d0', stroke: '#16a34a' },
        { fill: '#fef9c3', stroke: '#ca8a04' },
        { fill: '#bae6fd', stroke: '#0284c7' },
        { fill: '#fed7aa', stroke: '#ea580c' },
        { fill: '#ede9fe', stroke: '#7c3aed' },
        { fill: '#fce7f3', stroke: '#db2777' },
      ],
    },

    /* ═══════ 活潑 Lively ═══════ */

    {
      id: 'rainbow-vibrant', nameZH: '繽紛彩虹', tag: 'lively',
      bgColor: '#ffffff', gridColor: '#e9d8fd',
      textColor: '#2d1b69', subtextColor: '#7c3aed', titleColor: '#1a0050',
      headerFill: '#7c3aed', headerTextColor: '#ffffff',
      defaultPhaseColors: [
        { fill: '#fca5a5', stroke: '#dc2626' },
        { fill: '#d9f99d', stroke: '#65a30d' },
        { fill: '#bae6fd', stroke: '#0284c7' },
        { fill: '#fde68a', stroke: '#d97706' },
        { fill: '#c4b5fd', stroke: '#7c3aed' },
        { fill: '#fbcfe8', stroke: '#db2777' },
      ],
    },
    {
      id: 'coral-sunset', nameZH: '珊瑚夕陽', tag: 'lively',
      bgColor: '#fff7f0', gridColor: '#fed7b0',
      textColor: '#431407', subtextColor: '#9a3412', titleColor: '#271205',
      headerFill: '#c2410c', headerTextColor: '#fff7f0',
      defaultPhaseColors: [
        { fill: '#fed7aa', stroke: '#ea580c' },
        { fill: '#fcd34d', stroke: '#d97706' },
        { fill: '#fca5a5', stroke: '#dc2626' },
        { fill: '#fbcfe8', stroke: '#db2777' },
        { fill: '#c4b5fd', stroke: '#7c3aed' },
        { fill: '#bae6fd', stroke: '#0284c7' },
      ],
    },
    {
      id: 'ocean-breeze', nameZH: '海洋微風', tag: 'lively',
      bgColor: '#f0f9ff', gridColor: '#bae6fd',
      textColor: '#0c4a6e', subtextColor: '#0284c7', titleColor: '#082f49',
      headerFill: '#0369a1', headerTextColor: '#e0f2fe',
      defaultPhaseColors: [
        { fill: '#bae6fd', stroke: '#0284c7' },
        { fill: '#6ee7b7', stroke: '#059669' },
        { fill: '#a5f3fc', stroke: '#0891b2' },
        { fill: '#c4b5fd', stroke: '#7c3aed' },
        { fill: '#fde68a', stroke: '#d97706' },
        { fill: '#fca5a5', stroke: '#dc2626' },
      ],
    },
    {
      id: 'pastel-dream', nameZH: '粉彩夢境', tag: 'lively',
      bgColor: '#fdf4ff', gridColor: '#e9d5ff',
      textColor: '#3b0764', subtextColor: '#9333ea', titleColor: '#1a0030',
      headerFill: '#a855f7', headerTextColor: '#fdf4ff',
      defaultPhaseColors: [
        { fill: '#f3e8ff', stroke: '#a855f7' },
        { fill: '#fce7f3', stroke: '#ec4899' },
        { fill: '#cffafe', stroke: '#0891b2' },
        { fill: '#dcfce7', stroke: '#4ade80' },
        { fill: '#fef9c3', stroke: '#facc15' },
        { fill: '#ffedd5', stroke: '#fb923c' },
      ],
    },

  ];

  function getAll()     { return THEMES; }
  function getById(id)  { return THEMES.find(t => t.id === id); }
  function getFormal()  { return THEMES.filter(t => t.tag === 'formal'); }
  function getNeutral() { return THEMES.filter(t => t.tag === 'neutral'); }
  function getLively()  { return THEMES.filter(t => t.tag === 'lively'); }

  return { getAll, getById, getFormal, getNeutral, getLively };

})();
