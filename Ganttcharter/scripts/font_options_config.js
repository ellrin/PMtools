/**
 * font_options_config.js
 * 12 種字體（中英文皆支援）。
 * Google Fonts 字體需要網路；系統字體離線可用。
 */
const FontOptions = (() => {

  const FONTS = [
    /* ─── 中英文通用 ─── */
    {
      id: 'noto-sans-tc',
      name: 'Noto Sans TC（思源黑體）',
      css:  "'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
      preview: '繁體中文現代無襯線 Modern Sans 2026',
    },
    {
      id: 'noto-serif-tc',
      name: 'Noto Serif TC（思源明體）',
      css:  "'Noto Serif TC', 'PMingLiU', serif",
      preview: '繁體中文傳統明體 Classic Serif 2026',
    },
    {
      id: 'kaiu',
      name: '標楷體（DFKai-SB）',
      css:  "'DFKai-SB', 'BiauKai', 'Noto Serif TC', cursive",
      preview: '繁體中文標楷體 Formal Kai 2026',
    },
    {
      id: 'jhenghei',
      name: '微軟正黑體',
      css:  "'Microsoft JhengHei', 'Noto Sans TC', sans-serif",
      preview: '繁體中文 Windows 正黑體 2026',
    },

    /* ─── 英文為主（附中文 fallback） ─── */
    {
      id: 'inter',
      name: 'Inter',
      css:  "'Inter', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
      preview: 'Clean Modern Interface 2026',
    },
    {
      id: 'roboto',
      name: 'Roboto',
      css:  "'Roboto', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
      preview: 'Material Design Humanist 2026',
    },
    {
      id: 'open-sans',
      name: 'Open Sans',
      css:  "'Open Sans', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
      preview: 'Friendly Open Source 2026',
    },
    {
      id: 'eb-garamond',
      name: 'EB Garamond（正式襯線）',
      css:  "'EB Garamond', 'Noto Serif TC', 'PMingLiU', serif",
      preview: 'Elegant Classical Garamond 2026',
    },
    {
      id: 'playfair',
      name: 'Playfair Display（優雅襯線）',
      css:  "'Playfair Display', 'Noto Serif TC', 'PMingLiU', serif",
      preview: 'Elegant Editorial Serif 2026',
    },
    {
      id: 'georgia',
      name: 'Georgia（系統襯線）',
      css:  "'Georgia', 'Noto Serif TC', 'PMingLiU', serif",
      preview: 'Classic System Serif 2026',
    },
    {
      id: 'times',
      name: 'Times New Roman',
      css:  "'Times New Roman', 'Noto Serif TC', 'PMingLiU', serif",
      preview: 'Traditional Newspaper Serif 2026',
    },
    {
      id: 'oswald',
      name: 'Oswald（粗體壓縮）',
      css:  "'Oswald', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
      preview: 'Bold Condensed Display 2026',
    },
  ];

  function getAll()      { return FONTS; }
  function getById(id)   { return FONTS.find(f => f.id === id); }
  function getByCss(css) { return FONTS.find(f => f.css === css); }

  return { getAll, getById, getByCss };

})();
