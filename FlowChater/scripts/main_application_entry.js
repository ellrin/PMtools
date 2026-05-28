document.addEventListener("DOMContentLoaded", () => {
  JsonInputController.loadExampleJson();
  StyleControlController.initializeControls();
  DragController.init();
  bindApplicationEvents();
});

function bindApplicationEvents() {
  document.getElementById("go_to_input_button").addEventListener("click", PageNavigationController.showInputPage);
  document.getElementById("back_to_input_button").addEventListener("click", PageNavigationController.showInputPage);
  document.getElementById("go_to_preview_button").addEventListener("click", renderFlowchartAndShowPreview);
  document.getElementById("render_preview_button").addEventListener("click", renderFlowchartAndShowPreview);
  document.getElementById("load_example_button").addEventListener("click", JsonInputController.loadExampleJson);
  document.getElementById("json_file_input").addEventListener("change", e => {
    JsonInputController.handleFileUpload(e.target.files[0]);
  });
  document.getElementById("json_textarea").addEventListener("input", e => {
    FlowchartStateStore.setRawJsonText(e.target.value);
  });
  document.getElementById("download_svg_button").addEventListener("click", ImageExportController.downloadSvg);
  document.getElementById("download_png_button").addEventListener("click", ImageExportController.downloadPng);
  document.getElementById("download_pptx_button").addEventListener("click", PptxExportController.downloadPptx);
  document.getElementById("reset_layout_button").addEventListener("click", () => {
    FlowchartStateStore.clearManualPositions();
    StyleControlController.rerenderExistingDiagram(true);
  });
}

function renderFlowchartAndShowPreview() {
  const diagramData = JsonInputController.parseTextareaJson();
  if (!diagramData) return;

  FlowchartStateStore.clearManualPositions();

  const { style } = FlowchartStateStore.getState();
  const renderedDiagram = SimpleRankLayoutEngine.layoutDiagram(diagramData, style);
  FlowchartStateStore.setRenderedDiagram(renderedDiagram);

  document.getElementById("diagram_svg_container").innerHTML =
    SvgFlowchartRenderer.renderDiagram(renderedDiagram, style);
  document.getElementById("preview_title").textContent = renderedDiagram.title;
  document.getElementById("preview_summary").textContent =
    `${renderedDiagram.nodes.length} nodes · ${renderedDiagram.edges.length} connectors · drag nodes to reposition`;
  PageNavigationController.showPreviewPage();
}
