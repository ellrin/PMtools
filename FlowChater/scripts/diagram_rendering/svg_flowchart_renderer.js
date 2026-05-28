const SvgFlowchartRenderer = (() => {
  const CANVAS_W = 1280;
  const CANVAS_H = 720;
  const FILL = 0.90; // use 90% of canvas dimensions

  // Returns {scale, ox, oy} mapping diagram coords → SVG canvas coords
  function getCanvasTransform(renderedDiagram) {
    const scale = Math.min(CANVAS_W * FILL / renderedDiagram.width, CANVAS_H * FILL / renderedDiagram.height);
    return {
      scale,
      ox: (CANVAS_W - renderedDiagram.width * scale) / 2,
      oy: (CANVAS_H - renderedDiagram.height * scale) / 2
    };
  }

  function renderDiagram(renderedDiagram, style) {
    const theme = ColorThemePresets.getThemeById(style.themeId);
    const font  = FontFamilyPresets.getFontById(style.fontId);
    const nodeById = new Map(renderedDiagram.nodes.map(n => [n.id, n]));
    const { scale, ox, oy } = getCanvasTransform(renderedDiagram);

    const edgeMarkup = renderedDiagram.edges.map(e => renderEdge(e, nodeById, theme)).join("");
    const nodeMarkup = renderedDiagram.nodes.map((n, i) => renderNode(n, i, theme, font, style)).join("");

    return `<svg id="flowchart_svg" class="flowchart_svg" xmlns="http://www.w3.org/2000/svg"
        width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
        <defs>
          <marker id="arrow_marker" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M1,1 L9,5 L1,9 Z" fill="${theme.connector}"/>
          </marker>
        </defs>
        <g transform="translate(${ox.toFixed(2)},${oy.toFixed(2)}) scale(${scale.toFixed(6)})">
          <text x="48" y="54" fill="${theme.text}" font-family="${font.value}" font-size="20" font-weight="800">${escapeXml(renderedDiagram.title)}</text>
          ${edgeMarkup}
          ${nodeMarkup}
        </g>
      </svg>`;
  }

  function renderNode(node, index, theme, font, style) {
    const pal   = theme.nodePalette[index % theme.nodePalette.length];
    const fill  = node.fill  || pal.fill;
    const stroke = node.stroke || pal.stroke;
    const shape = node.type || "rounded_rect";
    const lines = String(node.text).split("\n");
    const textStartY = node.y + node.height / 2 - ((lines.length - 1) * style.fontSize * 0.6);
    const textLines = lines.map((line, i) =>
      `<tspan x="${node.x + node.width / 2}" dy="${i === 0 ? 0 : style.fontSize * 1.25}">${escapeXml(line)}</tspan>`
    ).join("");

    return `<g data-node-id="${escapeXml(node.id)}" style="cursor:grab">
        ${renderShape(shape, node, fill, stroke, style)}
        <text x="${node.x + node.width / 2}" y="${textStartY}" text-anchor="middle"
          dominant-baseline="middle" fill="${theme.text}" font-family="${font.value}"
          font-size="${style.fontSize}" font-weight="700" pointer-events="none">${textLines}</text>
      </g>`;
  }

  function renderShape(shape, node, fill, stroke, style) {
    if (shape === "diamond") {
      const cx = node.x + node.width / 2;
      const cy = node.y + node.height / 2;
      const pts = `${cx},${node.y} ${node.x + node.width},${cy} ${cx},${node.y + node.height} ${node.x},${cy}`;
      return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    }
    if (shape === "circle") {
      return `<ellipse cx="${node.x + node.width / 2}" cy="${node.y + node.height / 2}" rx="${node.width / 2}" ry="${node.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    }
    const radius = shape === "rectangle" ? 0 : style.cornerRadius;
    return `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }

  function renderEdge(edge, nodeById, theme) {
    const fromNode = nodeById.get(edge.from);
    const toNode   = nodeById.get(edge.to);
    if (!fromNode || !toNode) return "";

    const { from, to, fromSide } = AnchorPointCalculator.getBestAnchorPair(fromNode, toNode);

    let d;
    if (fromSide === "right" || fromSide === "left") {
      const midX = (from.x + to.x) / 2;
      d = `M ${from.x},${from.y} H ${midX} V ${to.y} H ${to.x}`;
    } else {
      const midY = (from.y + to.y) / 2;
      d = `M ${from.x},${from.y} V ${midY} H ${to.x} V ${to.y}`;
    }

    return `<g data-edge="${escapeXml(edge.from)}-${escapeXml(edge.to)}">
        <path d="${d}" stroke="${theme.connector}" stroke-width="2.2" fill="none"
          stroke-linejoin="round" marker-end="url(#arrow_marker)"/>
      </g>`;
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return { renderDiagram, getCanvasTransform };
})();
