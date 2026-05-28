const ImageExportController = (() => {
  function downloadSvg() {
    const svgElement = getSvgElement();
    if (!svgElement) {
      alert("Please render a diagram first.");
      return;
    }

    const svgText = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(URL.createObjectURL(blob), "flowchater_diagram.svg");
  }

  function downloadPng() {
    const svgElement = getSvgElement();
    if (!svgElement) {
      alert("Please render a diagram first.");
      return;
    }

    const svgText = new XMLSerializer().serializeToString(svgElement);
    const width = Number(svgElement.getAttribute("width"));
    const height = Number(svgElement.getAttribute("height"));
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const context = canvas.getContext("2d");
      context.scale(scale, scale);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob(blob => {
        triggerDownload(URL.createObjectURL(blob), "flowchater_diagram.png");
      }, "image/png");
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      alert("PNG export failed. Please try SVG export.");
    };

    image.src = svgUrl;
  }

  function getSvgElement() {
    return document.getElementById("flowchart_svg");
  }

  function triggerDownload(url, filename) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 200);
  }

  return { downloadSvg, downloadPng };
})();
