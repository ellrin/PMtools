const AnchorPointCalculator = (() => {
  function getBestAnchorPair(fromNode, toNode) {
    const fromAnchors = getAnchorPoints(fromNode);
    const toAnchors = getAnchorPoints(toNode);

    const fromCx = fromNode.x + fromNode.width / 2;
    const fromCy = fromNode.y + fromNode.height / 2;
    const toCx = toNode.x + toNode.width / 2;
    const toCy = toNode.y + toNode.height / 2;

    const dx = toCx - fromCx;
    const dy = toCy - fromCy;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx >= 0) return { from: fromAnchors.right, to: toAnchors.left, fromSide: "right", toSide: "left" };
      return { from: fromAnchors.left, to: toAnchors.right, fromSide: "left", toSide: "right" };
    }
    if (dy >= 0) return { from: fromAnchors.bottom, to: toAnchors.top, fromSide: "bottom", toSide: "top" };
    return { from: fromAnchors.top, to: toAnchors.bottom, fromSide: "top", toSide: "bottom" };
  }

  function getAnchorPoints(node) {
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    return {
      top:    { x: cx,               y: node.y },
      bottom: { x: cx,               y: node.y + node.height },
      left:   { x: node.x,           y: cy },
      right:  { x: node.x + node.width, y: cy }
    };
  }

  // PPTX connection site index: 0=top, 1=right, 2=bottom, 3=left
  function getSideIndex(side) {
    return ({ top: 0, right: 1, bottom: 2, left: 3 })[side] ?? 1;
  }

  return { getBestAnchorPair, getAnchorPoints, getSideIndex };
})();
