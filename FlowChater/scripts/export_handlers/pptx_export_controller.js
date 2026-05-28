const PptxExportController = (() => {
  const SLIDE_W = 12192000; // EMU, 16:9 widescreen
  const SLIDE_H = 6858000;

  async function downloadPptx() {
    const { renderedDiagram, style } = FlowchartStateStore.getState();
    if (!renderedDiagram) { alert("Please render a diagram first."); return; }
    const files = buildPptxFiles(renderedDiagram, style);
    const blob = buildStoredZip(files);
    triggerDownload(URL.createObjectURL(blob), "flowchater_diagram.pptx");
  }

  function computeTransform(w, h) {
    const fill = 0.88;
    const scale = Math.min((SLIDE_W * fill) / w, (SLIDE_H * fill) / h);
    return {
      scale,
      ox: Math.round((SLIDE_W - w * scale) / 2),
      oy: Math.round((SLIDE_H - h * scale) / 2)
    };
  }

  function emuX(px, t) { return Math.round(px * t.scale + t.ox); }
  function emuY(px, t) { return Math.round(px * t.scale + t.oy); }
  function emuS(px, t) { return Math.round(px * t.scale); }

  // ── Slide XML: title → node shapes (with embedded text) → connectors ──
  function slideXml(rd, style) {
    const theme = ColorThemePresets.getThemeById(style.themeId);
    const font  = FontFamilyPresets.getFontById(style.fontId);
    const t     = computeTransform(rd.width, rd.height);
    const nodeById = new Map(rd.nodes.map(n => [n.id, n]));

    // Pre-assign all IDs upfront (group=1 is reserved)
    let id = 2;
    const titleId = id++;                                        // 2
    const nodeSpId = new Map();
    rd.nodes.forEach(n => { nodeSpId.set(n.id, id++); });       // 3 … (2+N)

    // Title textbox
    const titleXml = titleTbXml({
      id: titleId, text: rd.title,
      x: emuX(48, t), y: emuY(28, t),
      cx: emuS(rd.width - 96, t), cy: 540000,
      face: pptFace(font), pt: Math.max(14, Math.round(style.fontSize * 0.9)),
      color: theme.text
    });

    // Node shapes with embedded text — MUST come before connectors
    const nodesXml = rd.nodes.map((n, i) => {
      const pal = theme.nodePalette[i % theme.nodePalette.length];
      return nodeSpXml(n, nodeSpId.get(n.id), t, theme, pal, font, style.fontSize);
    }).join("");

    // Connectors reference nodeSpId values already defined above
    const edgesXml = rd.edges.map(edge => {
      const fn = nodeById.get(edge.from);
      const tn = nodeById.get(edge.to);
      if (!fn || !tn) return "";
      const anch = AnchorPointCalculator.getBestAnchorPair(fn, tn);
      return cxnXml({
        id: id++,
        name: `${edge.from}_to_${edge.to}`,
        fromSpId: nodeSpId.get(edge.from),
        toSpId:   nodeSpId.get(edge.to),
        fromIdx:  AnchorPointCalculator.getSideIndex(anch.fromSide),
        toIdx:    AnchorPointCalculator.getSideIndex(anch.toSide),
        x1: emuX(anch.from.x, t), y1: emuY(anch.from.y, t),
        x2: emuX(anch.to.x, t),   y2: emuY(anch.to.y, t),
        color: theme.connector
      });
    }).join("");

    return xmlDecl() + `<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${hex(theme.background)}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${titleXml}
      ${nodesXml}
      ${edgesXml}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
  }

  // ── Node shape with text embedded inside p:txBody ──
  function nodeSpXml(n, spId, t, theme, pal, font, fontSize) {
    const fill  = n.fill   || pal.fill;
    const stroke = n.stroke || pal.stroke;
    const shape = pptShape(n.type);
    const pt    = Math.max(8, Math.round(fontSize * 0.72));
    const face  = pptFace(font);
    const tc    = hex(theme.text);
    const fw    = hex(fill);
    const sw    = hex(stroke);

    // Each \n-separated line becomes its own paragraph
    const parasXml = String(n.text).split("\n").map(line =>
      `<a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="zh-TW" sz="${pt * 100}" b="1" dirty="0"><a:solidFill><a:srgbClr val="${tc}"/></a:solidFill><a:latin typeface="${esc(face)}"/><a:ea typeface="${esc(face)}"/></a:rPr><a:t>${esc(line)}</a:t></a:r></a:p>`
    ).join("");

    return `<p:sp><p:nvSpPr><p:cNvPr id="${spId}" name="${esc(n.id)}"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${emuX(n.x, t)}" y="${emuY(n.y, t)}"/><a:ext cx="${emuS(n.width, t)}" cy="${emuS(n.height, t)}"/></a:xfrm><a:prstGeom prst="${shape}"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${fw}"/></a:solidFill><a:ln w="19050"><a:solidFill><a:srgbClr val="${sw}"/></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" anchor="ctr"/><a:lstStyle/>${parasXml}</p:txBody></p:sp>`;
  }

  // ── Title text box ──
  function titleTbXml({ id, text, x, y, cx, cy, face, pt, color }) {
    const line = esc(text);
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" anchor="b"/><a:lstStyle/><a:p><a:pPr algn="l"/><a:r><a:rPr lang="zh-TW" sz="${pt * 100}" b="1" dirty="0"><a:solidFill><a:srgbClr val="${hex(color)}"/></a:solidFill><a:latin typeface="${esc(face)}"/><a:ea typeface="${esc(face)}"/></a:rPr><a:t>${line}</a:t></a:r></a:p></p:txBody></p:sp>`;
  }

  // ── Elbow connector (肘型單箭頭) ──
  function cxnXml({ id, name, fromSpId, toSpId, fromIdx, toIdx, x1, y1, x2, y2, color }) {
    const bx  = Math.min(x1, x2);
    const by  = Math.min(y1, y2);
    const bcx = Math.max(Math.abs(x2 - x1), 914);  // min 1 pt = 12700 EMU, use ~914 as safety
    const bcy = Math.max(Math.abs(y2 - y1), 914);
    return `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${id}" name="${esc(name)}"/><p:cNvCxnSpPr><a:stCxn id="${fromSpId}" idx="${fromIdx}"/><a:endCxn id="${toSpId}" idx="${toIdx}"/></p:cNvCxnSpPr><p:nvPr/></p:nvCxnSpPr><p:spPr><a:xfrm><a:off x="${bx}" y="${by}"/><a:ext cx="${bcx}" cy="${bcy}"/></a:xfrm><a:prstGeom prst="bentConnector3"><a:avLst/></a:prstGeom><a:noFill/><a:ln w="25400"><a:solidFill><a:srgbClr val="${hex(color)}"/></a:solidFill><a:tailEnd type="triangle" w="med" len="med"/></a:ln></p:spPr></p:cxnSp>`;
  }

  // ── PPTX XML parts ──
  function buildPptxFiles(rd, style) {
    return {
      "[Content_Types].xml":                           contentTypesXml(),
      "_rels/.rels":                                   pkgRelsXml(),
      "docProps/app.xml":                              appXml(),
      "docProps/core.xml":                             coreXml(rd.title),
      "ppt/presentation.xml":                          presentationXml(),
      "ppt/_rels/presentation.xml.rels":               pptRelsXml(),
      "ppt/theme/theme1.xml":                          themeXml(),
      "ppt/slideMasters/slideMaster1.xml":             masterXml(),
      "ppt/slideMasters/_rels/slideMaster1.xml.rels":  masterRelsXml(),
      "ppt/slideLayouts/slideLayout1.xml":             layoutXml(),
      "ppt/slideLayouts/_rels/slideLayout1.xml.rels":  layoutRelsXml(),
      "ppt/slides/slide1.xml":                         slideXml(rd, style),
      "ppt/slides/_rels/slide1.xml.rels":              slideRelsXml()
    };
  }

  function contentTypesXml() {
    return xmlDecl() + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>`;
  }

  function pkgRelsXml() {
    return xmlDecl() + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
  }

  function presentationXml() {
    return xmlDecl() + `<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst><p:sldSz cx="${SLIDE_W}" cy="${SLIDE_H}" type="custom"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="zh-TW"/></a:defPPr></p:defaultTextStyle></p:presentation>`;
  }

  function pptRelsXml() {
    return xmlDecl() + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`;
  }

  function masterXml() {
    return xmlDecl() + `<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle><a:lvl1pPr algn="l"><a:defRPr sz="4400"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mj-lt"/><a:ea typeface="+mj-ea"/></a:defRPr></a:lvl1pPr></p:titleStyle><p:bodyStyle><a:lvl1pPr><a:defRPr sz="3200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/></a:defRPr></a:lvl1pPr></p:bodyStyle><p:otherStyle><a:lvl1pPr><a:defRPr sz="1800"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/></a:defRPr></a:lvl1pPr></p:otherStyle></p:txStyles></p:sldMaster>`;
  }

  function masterRelsXml() {
    return xmlDecl() + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
  }

  function layoutXml() {
    return xmlDecl() + `<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
  }

  function layoutRelsXml() {
    return xmlDecl() + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;
  }

  function slideRelsXml() {
    return xmlDecl() + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`;
  }

  function themeXml() {
    return xmlDecl() + `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="FlowChater"><a:themeElements><a:clrScheme name="FlowChater"><a:dk1><a:srgbClr val="111827"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F2937"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="2563EB"/></a:accent1><a:accent2><a:srgbClr val="16A34A"/></a:accent2><a:accent3><a:srgbClr val="D97706"/></a:accent3><a:accent4><a:srgbClr val="DB2777"/></a:accent4><a:accent5><a:srgbClr val="7C3AED"/></a:accent5><a:accent6><a:srgbClr val="0891B2"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme><a:fontScheme name="FlowChater"><a:majorFont><a:latin typeface="Microsoft JhengHei"/><a:ea typeface="Microsoft JhengHei"/><a:cs typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Microsoft JhengHei"/><a:ea typeface="Microsoft JhengHei"/><a:cs typeface="Arial"/></a:minorFont></a:fontScheme><a:fmtScheme name="FlowChater"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"/></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="90000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"/></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/></a:schemeClr></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="85000"/></a:schemeClr></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
  }

  function appXml() {
    return xmlDecl() + `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>FlowChater</Application><PresentationFormat>Widescreen</PresentationFormat><Slides>1</Slides></Properties>`;
  }

  function coreXml(title) {
    const now = new Date().toISOString();
    return xmlDecl() + `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(title)}</dc:title><dc:creator>FlowChater</dc:creator><cp:lastModifiedBy>FlowChater</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
  }

  // ── Helpers ──
  function pptShape(nodeType) {
    if (nodeType === "diamond")   return "diamond";
    if (nodeType === "circle")    return "ellipse";
    if (nodeType === "rectangle") return "rect";
    return "roundRect";
  }

  function pptFace(font) {
    if (font.id === "noto_serif_tc") return "Noto Serif TC";
    if (font.id === "inter")         return "Inter";
    if (font.id === "arial")         return "Arial";
    return "Microsoft JhengHei";
  }

  function hex(color) {
    return String(color || "#000000").replace(/^#/, "").toUpperCase().slice(0, 6);
  }

  function xmlDecl() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  }

  function esc(v) {
    return String(v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }

  // ── ZIP builder (stored, no compression) ──
  function buildStoredZip(files) {
    const enc = new TextEncoder();
    const entries = Object.entries(files).map(([name, content]) => ({
      name, bytes: enc.encode(content), crc: 0, offset: 0
    }));
    entries.forEach(e => { e.crc = crc32(e.bytes); });

    const chunks = [];
    let pos = 0;
    entries.forEach(e => {
      e.offset = pos;
      const h = localHeader(e);
      chunks.push(h, e.bytes);
      pos += h.length + e.bytes.length;
    });

    const cdStart = pos;
    entries.forEach(e => {
      const c = centralHeader(e);
      chunks.push(c);
      pos += c.length;
    });
    chunks.push(eocd(entries.length, pos - cdStart, cdStart));
    return new Blob(chunks, { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
  }

  function localHeader(e) {
    const nb = new TextEncoder().encode(e.name);
    const d = new Uint8Array(30 + nb.length);
    const v = new DataView(d.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x0800, true);
    v.setUint16(8, 0, true);
    v.setUint16(10, 0, true);
    v.setUint16(12, 0, true);
    v.setUint32(14, e.crc, true);
    v.setUint32(18, e.bytes.length, true);
    v.setUint32(22, e.bytes.length, true);
    v.setUint16(26, nb.length, true);
    v.setUint16(28, 0, true);
    d.set(nb, 30);
    return d;
  }

  function centralHeader(e) {
    const nb = new TextEncoder().encode(e.name);
    const d = new Uint8Array(46 + nb.length);
    const v = new DataView(d.buffer);
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 20, true);
    v.setUint16(8, 0x0800, true);
    v.setUint16(10, 0, true);
    v.setUint16(12, 0, true);
    v.setUint16(14, 0, true);
    v.setUint32(16, e.crc, true);
    v.setUint32(20, e.bytes.length, true);
    v.setUint32(24, e.bytes.length, true);
    v.setUint16(28, nb.length, true);
    v.setUint16(30, 0, true);
    v.setUint16(32, 0, true);
    v.setUint16(34, 0, true);
    v.setUint16(36, 0, true);
    v.setUint32(38, 0, true);
    v.setUint32(42, e.offset, true);
    d.set(nb, 46);
    return d;
  }

  function eocd(count, cdSize, cdOffset) {
    const d = new Uint8Array(22);
    const v = new DataView(d.buffer);
    v.setUint32(0, 0x06054b50, true);
    v.setUint16(4, 0, true);
    v.setUint16(6, 0, true);
    v.setUint16(8, count, true);
    v.setUint16(10, count, true);
    v.setUint32(12, cdSize, true);
    v.setUint32(16, cdOffset, true);
    v.setUint16(20, 0, true);
    return d;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let b = 0; b < 8; b++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 200);
  }

  return { downloadPptx };
})();
