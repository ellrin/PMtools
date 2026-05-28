const JsonInputController = (() => {
  function loadExampleJson() {
    const formattedJson = JSON.stringify(DefaultFlowchartJson, null, 2);
    getTextarea().value = formattedJson;
    FlowchartStateStore.setRawJsonText(formattedJson);
    setStatus("Example loaded.");
  }

  function handleFileUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = String(event.target.result || "");
      getTextarea().value = text;
      FlowchartStateStore.setRawJsonText(text);
      setStatus(`Loaded ${file.name}.`);
    };
    reader.onerror = () => setStatus("Could not read the selected file.", true);
    reader.readAsText(file, "UTF-8");
  }

  function parseTextareaJson() {
    const rawJsonText = getTextarea().value.trim();
    FlowchartStateStore.setRawJsonText(rawJsonText);

    if (!rawJsonText) {
      setStatus("Please paste or upload JSON first.", true);
      return null;
    }

    try {
      const parsedData = JSON.parse(rawJsonText);
      validateDiagramData(parsedData);
      FlowchartStateStore.setDiagramData(parsedData);
      setStatus("JSON is valid.");
      return parsedData;
    } catch (error) {
      setStatus(error.message, true);
      return null;
    }
  }

  function validateDiagramData(diagramData) {
    if (!diagramData || typeof diagramData !== "object") {
      throw new Error("JSON root must be an object.");
    }

    if (!Array.isArray(diagramData.nodes) || diagramData.nodes.length === 0) {
      throw new Error("JSON must include a non-empty nodes array.");
    }

    const nodeIds = new Set();
    diagramData.nodes.forEach((node, index) => {
      if (!node.id) throw new Error(`nodes[${index}] is missing id.`);
      if (!node.text) throw new Error(`nodes[${index}] is missing text.`);
      if (nodeIds.has(node.id)) throw new Error(`Duplicate node id: ${node.id}`);
      nodeIds.add(node.id);
    });

    (diagramData.edges || []).forEach((edge, index) => {
      if (!nodeIds.has(edge.from)) throw new Error(`edges[${index}] has unknown from id: ${edge.from}`);
      if (!nodeIds.has(edge.to)) throw new Error(`edges[${index}] has unknown to id: ${edge.to}`);
    });
  }

  function setStatus(message, isError = false) {
    const statusElement = document.getElementById("json_status_message");
    statusElement.textContent = message;
    statusElement.classList.toggle("has_error", isError);
  }

  function getTextarea() {
    return document.getElementById("json_textarea");
  }

  return { loadExampleJson, handleFileUpload, parseTextareaJson, setStatus };
})();
