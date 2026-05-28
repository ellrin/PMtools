const FlowchartStateStore = (() => {
  const state = {
    rawJsonText: "",
    diagramData: null,
    renderedDiagram: null,
    manualPositions: {},
    style: {
      themeId: "executive_blue",
      fontId: "noto_sans_tc",
      fontSize: 18,
      cornerRadius: 16,
      nodeGap: 60,
      direction: null  // null = use diagram's own layout.direction
    }
  };

  function getState() { return state; }
  function setRawJsonText(v) { state.rawJsonText = v; }
  function setDiagramData(v) { state.diagramData = v; }
  function setRenderedDiagram(v) { state.renderedDiagram = v; }
  function updateStyle(patch) { state.style = { ...state.style, ...patch }; }

  function setManualPosition(nodeId, x, y) {
    state.manualPositions = { ...state.manualPositions, [nodeId]: { x, y } };
  }

  function clearManualPositions() {
    state.manualPositions = {};
  }

  return {
    getState,
    setRawJsonText,
    setDiagramData,
    setRenderedDiagram,
    updateStyle,
    setManualPosition,
    clearManualPositions
  };
})();
