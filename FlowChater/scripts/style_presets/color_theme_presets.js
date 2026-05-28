const ColorThemePresets = (() => {
  const themes = [
    {
      id: "executive_blue",
      name: "Executive Blue",
      mood: "formal",
      background: "#ffffff",
      canvas: "#f8fafc",
      text: "#172033",
      mutedText: "#64748b",
      connector: "#334155",
      nodePalette: [
        { fill: "#dbeafe", stroke: "#2563eb" },
        { fill: "#dcfce7", stroke: "#16a34a" },
        { fill: "#fef3c7", stroke: "#d97706" },
        { fill: "#fce7f3", stroke: "#db2777" }
      ]
    },
    {
      id: "ink_report",
      name: "Ink Report",
      mood: "minimal",
      background: "#ffffff",
      canvas: "#ffffff",
      text: "#111827",
      mutedText: "#6b7280",
      connector: "#111827",
      nodePalette: [
        { fill: "#f3f4f6", stroke: "#374151" },
        { fill: "#e5e7eb", stroke: "#6b7280" },
        { fill: "#ffffff", stroke: "#111827" },
        { fill: "#d1d5db", stroke: "#4b5563" }
      ]
    },
    {
      id: "clean_health",
      name: "Clean Health",
      mood: "calm",
      background: "#f7fefb",
      canvas: "#ffffff",
      text: "#10312b",
      mutedText: "#387267",
      connector: "#0f766e",
      nodePalette: [
        { fill: "#ccfbf1", stroke: "#0f766e" },
        { fill: "#dcfce7", stroke: "#16a34a" },
        { fill: "#e0f2fe", stroke: "#0284c7" },
        { fill: "#fef9c3", stroke: "#ca8a04" }
      ]
    },
    {
      id: "warm_office",
      name: "Warm Office",
      mood: "soft",
      background: "#fffaf4",
      canvas: "#ffffff",
      text: "#352315",
      mutedText: "#8a6a4c",
      connector: "#92400e",
      nodePalette: [
        { fill: "#ffedd5", stroke: "#ea580c" },
        { fill: "#fef3c7", stroke: "#d97706" },
        { fill: "#e0f2fe", stroke: "#0284c7" },
        { fill: "#ede9fe", stroke: "#7c3aed" }
      ]
    },
    {
      id: "modern_contrast",
      name: "Modern Contrast",
      mood: "sharp",
      background: "#f8fafc",
      canvas: "#ffffff",
      text: "#0f172a",
      mutedText: "#475569",
      connector: "#0f172a",
      nodePalette: [
        { fill: "#cffafe", stroke: "#0891b2" },
        { fill: "#e0e7ff", stroke: "#4f46e5" },
        { fill: "#fee2e2", stroke: "#dc2626" },
        { fill: "#dcfce7", stroke: "#16a34a" }
      ]
    },
    {
      id: "presentation_dark",
      name: "Presentation Dark",
      mood: "dark",
      background: "#0f172a",
      canvas: "#111827",
      text: "#e5e7eb",
      mutedText: "#cbd5e1",
      connector: "#93c5fd",
      nodePalette: [
        { fill: "#1e3a8a", stroke: "#60a5fa" },
        { fill: "#14532d", stroke: "#4ade80" },
        { fill: "#713f12", stroke: "#facc15" },
        { fill: "#581c87", stroke: "#c084fc" }
      ]
    },
    {
      id: "academic_serif",
      name: "Academic Serif",
      mood: "document",
      background: "#fbfbf8",
      canvas: "#ffffff",
      text: "#1c1917",
      mutedText: "#78716c",
      connector: "#44403c",
      nodePalette: [
        { fill: "#f5f5f4", stroke: "#78716c" },
        { fill: "#ecfccb", stroke: "#65a30d" },
        { fill: "#e0f2fe", stroke: "#0369a1" },
        { fill: "#fae8ff", stroke: "#a21caf" }
      ]
    },
    {
      id: "product_team",
      name: "Product Team",
      mood: "friendly",
      background: "#f8fafc",
      canvas: "#ffffff",
      text: "#1e293b",
      mutedText: "#64748b",
      connector: "#475569",
      nodePalette: [
        { fill: "#dbeafe", stroke: "#3b82f6" },
        { fill: "#fce7f3", stroke: "#ec4899" },
        { fill: "#dcfce7", stroke: "#22c55e" },
        { fill: "#ffedd5", stroke: "#f97316" }
      ]
    },
    {
      id: "legal_clear",
      name: "Legal Clear",
      mood: "formal",
      background: "#f8fafc",
      canvas: "#ffffff",
      text: "#18212f",
      mutedText: "#667085",
      connector: "#1f2937",
      nodePalette: [
        { fill: "#eff6ff", stroke: "#1d4ed8" },
        { fill: "#f8fafc", stroke: "#64748b" },
        { fill: "#fefce8", stroke: "#ca8a04" },
        { fill: "#ecfdf5", stroke: "#059669" }
      ]
    },
    {
      id: "bright_workshop",
      name: "Bright Workshop",
      mood: "lively",
      background: "#ffffff",
      canvas: "#fffefe",
      text: "#1f2937",
      mutedText: "#6b7280",
      connector: "#374151",
      nodePalette: [
        { fill: "#bae6fd", stroke: "#0284c7" },
        { fill: "#bbf7d0", stroke: "#16a34a" },
        { fill: "#fde68a", stroke: "#d97706" },
        { fill: "#fbcfe8", stroke: "#db2777" }
      ]
    }
  ];

  function getAllThemes() {
    return themes;
  }

  function getThemeById(themeId) {
    return themes.find(theme => theme.id === themeId) || themes[0];
  }

  return { getAllThemes, getThemeById };
})();
