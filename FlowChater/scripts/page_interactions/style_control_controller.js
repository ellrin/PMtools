const StyleControlController = (() => {
  function initializeControls() {
    renderThemeCards();
    renderFontOptions();
    bindStyleInputs();
    syncControlValues();
  }

  function renderThemeCards() {
    const grid = document.getElementById("theme_card_grid");
    if (!grid) return;

    const selected = FlowchartStateStore.getState().style.themeId;
    grid.innerHTML = ColorThemePresets.getAllThemes().map(theme => `
      <button class="theme_card ${theme.id === selected ? "is_selected" : ""}" type="button" data-theme-id="${theme.id}">
        <span class="theme_swatch_row">
          ${theme.nodePalette.slice(0, 4).map(c => `<span class="theme_swatch" style="background:${c.fill};border-color:${c.stroke}"></span>`).join("")}
        </span>
        <span>
          <span class="theme_name">${theme.name}</span>
          <span class="theme_mood">${theme.mood}</span>
        </span>
      </button>`).join("");

    grid.querySelectorAll(".theme_card").forEach(btn => {
      btn.addEventListener("click", () => {
        FlowchartStateStore.updateStyle({ themeId: btn.dataset.themeId });
        renderThemeCards();
        rerenderExistingDiagram(false);
      });
    });
  }

  function renderFontOptions() {
    const sel = document.getElementById("font_family_select");
    sel.innerHTML = FontFamilyPresets.getAllFonts().map(f =>
      `<option value="${f.id}">${f.label}</option>`
    ).join("");
  }

  function bindStyleInputs() {
    document.getElementById("font_family_select").addEventListener("change", e => {
      FlowchartStateStore.updateStyle({ fontId: e.target.value });
      rerenderExistingDiagram(false);
    });
    document.getElementById("font_size_slider").addEventListener("input", e => {
      FlowchartStateStore.updateStyle({ fontSize: Number(e.target.value) });
      syncControlValues();
      rerenderExistingDiagram(false);
    });
    document.getElementById("corner_radius_slider").addEventListener("input", e => {
      FlowchartStateStore.updateStyle({ cornerRadius: Number(e.target.value) });
      syncControlValues();
      rerenderExistingDiagram(false);
    });
    document.getElementById("node_gap_slider").addEventListener("input", e => {
      FlowchartStateStore.updateStyle({ nodeGap: Number(e.target.value) });
      syncControlValues();
      rerenderExistingDiagram(true);
    });

    // Direction toggle buttons
    document.getElementById("direction_lr_btn").addEventListener("click", () => {
      FlowchartStateStore.updateStyle({ direction: "left_to_right" });
      syncControlValues();
      rerenderExistingDiagram(true);
    });
    document.getElementById("direction_tb_btn").addEventListener("click", () => {
      FlowchartStateStore.updateStyle({ direction: "top_to_bottom" });
      syncControlValues();
      rerenderExistingDiagram(true);
    });
  }

  function syncControlValues() {
    const { style } = FlowchartStateStore.getState();
    document.getElementById("font_family_select").value = style.fontId;
    document.getElementById("font_size_slider").value = style.fontSize;
    document.getElementById("font_size_value").textContent = `${style.fontSize} px`;
    document.getElementById("corner_radius_slider").value = style.cornerRadius;
    document.getElementById("corner_radius_value").textContent = `${style.cornerRadius} px`;
    document.getElementById("node_gap_slider").value = style.nodeGap;
    document.getElementById("node_gap_value").textContent = `${style.nodeGap} px`;

    const dir = style.direction;
    document.getElementById("direction_lr_btn").classList.toggle("is_active_dir", dir === "left_to_right");
    document.getElementById("direction_tb_btn").classList.toggle("is_active_dir", dir === "top_to_bottom");
  }

  function applyManualPositions(renderedDiagram) {
    const manual = FlowchartStateStore.getState().manualPositions;
    if (!manual || Object.keys(manual).length === 0) return renderedDiagram;
    return {
      ...renderedDiagram,
      nodes: renderedDiagram.nodes.map(n => {
        const m = manual[n.id];
        return m ? { ...n, x: m.x, y: m.y } : n;
      })
    };
  }

  function rerenderExistingDiagram(needsRelayout = false) {
    const state = FlowchartStateStore.getState();
    if (!state.diagramData) return;

    let rd = needsRelayout
      ? SimpleRankLayoutEngine.layoutDiagram(state.diagramData, state.style)
      : state.renderedDiagram;

    if (!rd) return;
    rd = applyManualPositions(rd);
    FlowchartStateStore.setRenderedDiagram(rd);
    document.getElementById("diagram_svg_container").innerHTML =
      SvgFlowchartRenderer.renderDiagram(rd, state.style);
  }

  return { initializeControls, syncControlValues, rerenderExistingDiagram };
})();
