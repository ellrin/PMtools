const SimpleRankLayoutEngine = (() => {
  const defaultLayout = {
    direction: "left_to_right",
    nodeWidth: 190,
    nodeHeight: 78,
    nodeGap: 56,
    rankGap: 96,
    canvasPadding: 70
  };

  function layoutDiagram(diagramData, style) {
    const layoutSettings = {
      ...defaultLayout,
      ...(diagramData.layout || {}),
      nodeGap: Number(style.nodeGap || diagramData.layout?.nodeGap || defaultLayout.nodeGap)
    };

    // Scale all dimensions when font size exceeds default (18px)
    const fontSize = Number(style.fontSize) || 18;
    if (fontSize > 18) {
      const fs = fontSize / 18;
      layoutSettings.nodeWidth     = Math.round(layoutSettings.nodeWidth     * fs);
      layoutSettings.nodeHeight    = Math.round(layoutSettings.nodeHeight    * fs);
      layoutSettings.nodeGap       = Math.round(layoutSettings.nodeGap       * fs);
      layoutSettings.rankGap       = Math.round(layoutSettings.rankGap       * fs);
      layoutSettings.canvasPadding = Math.round(layoutSettings.canvasPadding * fs);
    }

    const nodesWithRanks = assignRanks(diagramData.nodes, diagramData.edges || []);
    const nodesByRank = groupNodesByRank(nodesWithRanks);
    const direction = style.direction || layoutSettings.direction || "left_to_right";
    const isHorizontal = direction === "left_to_right";
    const canvasPadding = layoutSettings.canvasPadding;

    const maxRankSize = Math.max(...Array.from(nodesByRank.values()).map(nodes => nodes.length));
    const rankCount = nodesByRank.size;
    const canvasWidth = isHorizontal
      ? canvasPadding * 2 + rankCount * layoutSettings.nodeWidth + (rankCount - 1) * layoutSettings.rankGap
      : canvasPadding * 2 + maxRankSize * layoutSettings.nodeWidth + (maxRankSize - 1) * layoutSettings.nodeGap;
    const canvasHeight = isHorizontal
      ? canvasPadding * 2 + maxRankSize * layoutSettings.nodeHeight + (maxRankSize - 1) * layoutSettings.nodeGap
      : canvasPadding * 2 + rankCount * layoutSettings.nodeHeight + (rankCount - 1) * layoutSettings.rankGap;

    const positionedNodes = [];
    const fontScale = fontSize > 18 ? fontSize / 18 : 1;
    const sortedRankNumbers = Array.from(nodesByRank.keys()).sort((a, b) => a - b);

    sortedRankNumbers.forEach((rankNumber, rankIndex) => {
      const rankNodes = nodesByRank.get(rankNumber);
      const rankSpan = isHorizontal
        ? rankNodes.length * layoutSettings.nodeHeight + (rankNodes.length - 1) * layoutSettings.nodeGap
        : rankNodes.length * layoutSettings.nodeWidth + (rankNodes.length - 1) * layoutSettings.nodeGap;
      const crossAxisStart = (isHorizontal ? canvasHeight : canvasWidth) / 2 - rankSpan / 2;

      rankNodes.forEach((node, nodeIndex) => {
        const x = isHorizontal
          ? canvasPadding + rankIndex * (layoutSettings.nodeWidth + layoutSettings.rankGap)
          : crossAxisStart + nodeIndex * (layoutSettings.nodeWidth + layoutSettings.nodeGap);
        const y = isHorizontal
          ? crossAxisStart + nodeIndex * (layoutSettings.nodeHeight + layoutSettings.nodeGap)
          : canvasPadding + rankIndex * (layoutSettings.nodeHeight + layoutSettings.rankGap);

        positionedNodes.push({
          ...node,
          x,
          y,
          width:  node.width  ? Math.round(Number(node.width)  * fontScale) : layoutSettings.nodeWidth,
          height: node.height ? Math.round(Number(node.height) * fontScale) : layoutSettings.nodeHeight,
          rank: rankNumber
        });
      });
    });

    return {
      title: diagramData.title || "Flowchart",
      direction,
      width: Math.ceil(canvasWidth),
      height: Math.ceil(canvasHeight),
      nodes: positionedNodes,
      edges: diagramData.edges || []
    };
  }

  function assignRanks(nodes, edges) {
    const incomingCount = new Map(nodes.map(node => [node.id, 0]));
    const outgoingMap = new Map(nodes.map(node => [node.id, []]));

    edges.forEach(edge => {
      incomingCount.set(edge.to, (incomingCount.get(edge.to) || 0) + 1);
      outgoingMap.get(edge.from)?.push(edge.to);
    });

    const rankById = new Map();
    const explicitRankIds = new Set();
    nodes.forEach(node => {
      if (Number.isFinite(node.rank)) {
        rankById.set(node.id, Number(node.rank));
        explicitRankIds.add(node.id);
      }
    });

    const queue = nodes.filter(node => (incomingCount.get(node.id) || 0) === 0).map(node => node.id);
    queue.forEach(id => {
      if (!rankById.has(id)) rankById.set(id, 0);
    });

    while (queue.length) {
      const currentId = queue.shift();
      const currentRank = rankById.get(currentId) || 0;
      (outgoingMap.get(currentId) || []).forEach(nextId => {
        if (!rankById.has(nextId)) {
          rankById.set(nextId, currentRank + 1);
        } else if (!explicitRankIds.has(nextId)) {
          rankById.set(nextId, Math.max(rankById.get(nextId), currentRank + 1));
        }
        incomingCount.set(nextId, incomingCount.get(nextId) - 1);
        if (incomingCount.get(nextId) === 0) queue.push(nextId);
      });
    }

    return nodes.map((node, index) => ({
      ...node,
      rank: Number.isFinite(node.rank) ? Number(node.rank) : (rankById.get(node.id) ?? index),
      order: Number.isFinite(node.order) ? Number(node.order) : index
    }));
  }

  function groupNodesByRank(nodes) {
    const groups = new Map();
    nodes.forEach(node => {
      if (!groups.has(node.rank)) groups.set(node.rank, []);
      groups.get(node.rank).push(node);
    });
    groups.forEach(nodesInRank => {
      nodesInRank.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    });
    return groups;
  }

  return { layoutDiagram };
})();
