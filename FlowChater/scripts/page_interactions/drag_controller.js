const DragController = (() => {
  let active = null;

  function init() {
    const container = document.getElementById("diagram_svg_container");
    container.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  // Convert client coords → SVG viewBox coords (1280×720 canvas space)
  function svgCanvasPt(clientX, clientY) {
    const svg = document.getElementById("flowchart_svg");
    if (!svg) return null;
    const r  = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    if (!vb || r.width === 0 || r.height === 0) return null;
    return {
      x: (clientX - r.left) * vb.width  / r.width,
      y: (clientY - r.top)  * vb.height / r.height
    };
  }

  // Convert SVG canvas coords → diagram coords (compensates for the <g transform>)
  function toDiagramCoords(svgX, svgY) {
    const rd = FlowchartStateStore.getState().renderedDiagram;
    if (!rd) return { x: svgX, y: svgY };
    const { scale, ox, oy } = SvgFlowchartRenderer.getCanvasTransform(rd);
    return { x: (svgX - ox) / scale, y: (svgY - oy) / scale };
  }

  function onDown(e) {
    const el = e.target.closest("[data-node-id]");
    if (!el) return;
    e.preventDefault();

    const canvasPt = svgCanvasPt(e.clientX, e.clientY);
    if (!canvasPt) return;

    const diagPt = toDiagramCoords(canvasPt.x, canvasPt.y);
    const nodeId = el.dataset.nodeId;
    const state  = FlowchartStateStore.getState();
    const node   = state.renderedDiagram?.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Store start in diagram coordinate space
    active = { nodeId, startDX: diagPt.x, startDY: diagPt.y, origX: node.x, origY: node.y, el };
  }

  function onMove(e) {
    if (!active) return;
    const canvasPt = svgCanvasPt(e.clientX, e.clientY);
    if (!canvasPt) return;
    const diagPt = toDiagramCoords(canvasPt.x, canvasPt.y);
    const dx = diagPt.x - active.startDX;
    const dy = diagPt.y - active.startDY;
    // translate is in the element's parent coord system = diagram space ✓
    active.el.setAttribute("transform", `translate(${dx},${dy})`);
  }

  function onUp(e) {
    if (!active) return;
    const canvasPt = svgCanvasPt(e.clientX, e.clientY);
    const diagPt   = canvasPt ? toDiagramCoords(canvasPt.x, canvasPt.y) : null;
    const dx = diagPt ? diagPt.x - active.startDX : 0;
    const dy = diagPt ? diagPt.y - active.startDY : 0;
    active.el.removeAttribute("transform");

    const { nodeId, origX, origY } = active;
    active = null;

    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return; // treat as click

    FlowchartStateStore.setManualPosition(nodeId, origX + dx, origY + dy);
    StyleControlController.rerenderExistingDiagram(false);
  }

  return { init };
})();
