const FontFamilyPresets = (() => {
  const fonts = [
    { id: "noto_sans_tc", label: "Noto Sans TC", value: "'Noto Sans TC', 'Microsoft JhengHei', sans-serif" },
    { id: "inter", label: "Inter", value: "'Inter', 'Noto Sans TC', sans-serif" },
    { id: "microsoft_jhenghei", label: "Microsoft JhengHei", value: "'Microsoft JhengHei', 'Noto Sans TC', sans-serif" },
    { id: "noto_serif_tc", label: "Noto Serif TC", value: "'Noto Serif TC', 'PMingLiU', serif" },
    { id: "arial", label: "Arial", value: "Arial, 'Noto Sans TC', sans-serif" }
  ];

  function getAllFonts() {
    return fonts;
  }

  function getFontById(fontId) {
    return fonts.find(font => font.id === fontId) || fonts[0];
  }

  return { getAllFonts, getFontById };
})();
