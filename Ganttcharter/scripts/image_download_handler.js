/**
 * image_download_handler.js
 * 處理甘特圖的 SVG 與 PNG 匯出下載。
 */
const ImageDownloader = (() => {

  function getSvgElement() {
    return document.getElementById('gantt-svg');
  }

  function getSvgString() {
    const el = getSvgElement();
    if (!el) return '';
    return new XMLSerializer().serializeToString(el);
  }

  /** 下載 SVG 向量圖 */
  function downloadSVG(filename) {
    const svgStr = getSvgString();
    if (!svgStr) { alert('找不到圖表，請先前往預覽頁。'); return; }

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    triggerDownload(url, filename || 'gantt_chart.svg');
    URL.revokeObjectURL(url);
  }

  /** 下載 PNG 點陣圖（scale=2 → 2x 解析度） */
  function downloadPNG(filename, scale) {
    const svgEl = getSvgElement();
    if (!svgEl) { alert('找不到圖表，請先前往預覽頁。'); return; }

    const dpr    = scale || 2;
    const svgStr = getSvgString();
    const w      = parseInt(svgEl.getAttribute('width'))  || 800;
    const h      = parseInt(svgEl.getAttribute('height')) || 400;

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(pngBlob => {
        const pngUrl = URL.createObjectURL(pngBlob);
        triggerDownload(pngUrl, filename || 'gantt_chart.png');
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('PNG 匯出失敗，請嘗試使用 SVG 格式下載。');
    };

    img.src = url;
  }

  /* 觸發瀏覽器下載 */
  function triggerDownload(url, name) {
    const a = document.createElement('a');
    a.href     = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return { downloadSVG, downloadPNG };

})();
