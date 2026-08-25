(() => {
  const $ = selector => document.querySelector(selector);
  const card = $("#resourceAdminCard");
  const fileInput = $("#resourcePdfFiles");
  const queue = $("#resourcePdfQueue");
  const buildBtn = $("#resourceBuildPatchBtn");
  const clearBtn = $("#resourceClearBtn");
  const qualitySelect = $("#resourceRenderQuality");
  const status = $("#resourceUploadStatus");
  const progress = $("#resourceUploadProgress");
  const progressText = $("#resourceUploadProgressText");

  const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const JSZIP_URL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

  let selectedFiles = [];
  let existingResources = [];
  let manifestVersion = "11.26";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("error", !!isError);
    status.classList.toggle("success", !!message && !isError);
  }

  function inferTag(title) {
    const t = String(title || "").toUpperCase();
    if (/METAR|TAF|기상|착빙|뇌우|윈드시어/.test(t)) return "기상";
    if (/SNOWTAM|NOTAM/.test(t)) return "운항정보";
    if (/IFR|홀딩|HOLD/.test(t)) return "IFR";
    if (/V속도|V-SPEED|VSPEED|성능/.test(t)) return "성능·속도";
    if (/관제|ATC|비상/.test(t)) return "관제·비상";
    if (/공기역학|AERODYNAMIC/.test(t)) return "공기역학";
    if (/연료|FUEL/.test(t)) return "운항절차";
    return "자료";
  }

  function displayTitle(filename) {
    return String(filename || "")
      .replace(/\.pdf$/i, "")
      .replace(/\s*[·\-]\s*TOGA\s*자료실\s*$/i, "")
      .trim() || "새 자료";
  }

  function baseSlug(title) {
    const latin = String(title || "")
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36);
    return latin || "resource";
  }

  function uniqueId(title, used) {
    const base = baseSlug(title);
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    let candidate = `${base}-${stamp}`;
    let n = 2;
    while (used.has(candidate)) candidate = `${base}-${stamp}-${n++}`;
    used.add(candidate);
    return candidate;
  }

  function renderQueue() {
    if (!queue) return;
    if (!selectedFiles.length) {
      queue.innerHTML = '<p class="muted">선택된 PDF가 없습니다.</p>';
      if (buildBtn) buildBtn.disabled = true;
      return;
    }
    queue.innerHTML = selectedFiles.map((row, index) => `
      <div class="resource-upload-row" data-index="${index}">
        <div class="resource-upload-file"><strong>${escapeHtml(row.file.name)}</strong><span>${(row.file.size / 1024 / 1024).toFixed(2)} MB</span></div>
        <label>표시 제목<input class="resource-title-input" type="text" value="${escapeHtml(row.title)}"></label>
        <label>분류<input class="resource-tag-input" type="text" value="${escapeHtml(row.tag)}" placeholder="예: IFR"></label>
      </div>`).join("");
    if (buildBtn) buildBtn.disabled = false;
  }

  function syncQueueEdits() {
    queue?.querySelectorAll(".resource-upload-row").forEach(row => {
      const index = Number(row.dataset.index);
      if (!selectedFiles[index]) return;
      selectedFiles[index].title = row.querySelector(".resource-title-input")?.value.trim() || selectedFiles[index].title;
      selectedFiles[index].tag = row.querySelector(".resource-tag-input")?.value.trim() || "자료";
    });
  }

  async function loadExistingManifest() {
    try {
      const response = await fetch("./data/resources.json", {cache:"no-store", credentials:"same-origin"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const resources = Array.isArray(payload) ? payload : payload?.resources;
      existingResources = Array.isArray(resources) ? resources : [];
      manifestVersion = String(payload?.version || "11.26");
      return true;
    } catch (err) {
      console.error(err);
      setStatus("기존 data/resources.json을 읽지 못했습니다. GitHub Pages 또는 로컬 HTTP 서버에서 admin.html을 실행하세요.", true);
      return false;
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-resource-lib="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "true") return resolve();
        existing.addEventListener("load", resolve, {once:true});
        existing.addEventListener("error", reject, {once:true});
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.resourceLib = src;
      script.addEventListener("load", () => { script.dataset.loaded = "true"; resolve(); }, {once:true});
      script.addEventListener("error", () => reject(new Error(`${src} 로드 실패`)), {once:true});
      document.head.appendChild(script);
    });
  }

  async function ensureLibraries() {
    if (!window.pdfjsLib) await loadScript(PDFJS_URL);
    if (!window.JSZip) await loadScript(JSZIP_URL);
    if (!window.pdfjsLib || !window.JSZip) throw new Error("PDF 변환 라이브러리를 불러오지 못했습니다.");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("이미지 변환 실패")), type, quality);
    });
  }

  function getRenderOptions() {
    const key = qualitySelect?.value || "standard";
    if (key === "high") return {scale:2.15, quality:0.94};
    if (key === "compact") return {scale:1.35, quality:0.86};
    return {scale:1.75, quality:0.92};
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function buildPatch() {
    if (!selectedFiles.length) return;
    syncQueueEdits();
    buildBtn.disabled = true;
    clearBtn.disabled = true;
    fileInput.disabled = true;
    setStatus("PDF 변환 준비 중…");
    if (progress) { progress.hidden = false; progress.value = 0; progress.max = 100; }
    if (progressText) progressText.textContent = "0%";

    try {
      const manifestOk = await loadExistingManifest();
      if (!manifestOk) throw new Error("기존 자료실 목록을 읽지 못했습니다.");
      await ensureLibraries();

      const zip = new window.JSZip();
      const addedResources = [];
      const usedIds = new Set(existingResources.map(item => String(item.id)));
      const render = getRenderOptions();
      const estimatedPages = Math.max(1, selectedFiles.length * 2);
      let completedPages = 0;
      let totalPages = estimatedPages;

      for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex += 1) {
        const row = selectedFiles[fileIndex];
        setStatus(`${row.file.name} 읽는 중…`);
        const data = new Uint8Array(await row.file.arrayBuffer());
        const pdf = await window.pdfjsLib.getDocument({data}).promise;
        if (fileIndex === 0) totalPages = pdf.numPages + Math.max(0, selectedFiles.length - 1) * 2;
        else totalPages += Math.max(0, pdf.numPages - 2);

        const id = uniqueId(row.title, usedIds);
        const pages = [];
        for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
          setStatus(`${row.file.name} · ${pageNo}/${pdf.numPages} 페이지 변환 중…`);
          const page = await pdf.getPage(pageNo);
          const viewport = page.getViewport({scale:render.scale});
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d", {alpha:false});
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({canvasContext:ctx, viewport}).promise;
          const blob = await canvasToBlob(canvas, "image/jpeg", render.quality);
          const path = `assets/resources/${id}/page-${pageNo}.jpg`;
          zip.file(path, blob);
          pages.push(`./${path}`);
          canvas.width = canvas.height = 1;
          page.cleanup?.();
          completedPages += 1;
          const percent = Math.max(1, Math.min(90, Math.round((completedPages / Math.max(totalPages, completedPages)) * 90)));
          if (progress) progress.value = percent;
          if (progressText) progressText.textContent = `${percent}%`;
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        pdf.cleanup?.();
        pdf.destroy?.();
        addedResources.push({id, title:row.title, tag:row.tag || "자료", pages});
      }

      const merged = [...existingResources, ...addedResources];
      const now = new Date().toISOString();
      zip.file("data/resources.json", JSON.stringify({
        version:"11.26",
        updated_at:now,
        resources:merged,
      }, null, 2));
      zip.file("resource-update-report.json", JSON.stringify({
        generated_at:now,
        base_manifest_version:manifestVersion,
        original_pdf_included:false,
        added:addedResources.map(item => ({id:item.id,title:item.title,tag:item.tag,pages:item.pages.length})),
        total_resources:merged.length,
      }, null, 2));
      zip.file("RESOURCE_UPLOAD_README.txt", [
        "TOGA 자료실 PDF 등록 패치",
        "",
        "1) 이 ZIP을 GitHub 저장소 루트에 압축 해제해 덮어씁니다.",
        "2) data/resources.json과 assets/resources/... 이미지가 추가되었는지 확인합니다.",
        "3) Commit / Push 후 GitHub Pages 배포가 끝나면 자료실에 새 항목이 표시됩니다.",
        "4) 원본 PDF는 이 ZIP에 포함되어 있지 않습니다.",
        "",
        "주의: GitHub Pages는 정적 호스팅이므로 admin.html에서 선택한 PDF가 서버에 직접 저장되는 구조는 아닙니다.",
        "이 도구는 PDF를 브라우저에서 페이지 이미지로 변환하고 배포용 패치를 만듭니다.",
      ].join("\n"));

      setStatus("패치 ZIP 압축 중…");
      const blob = await zip.generateAsync(
        {type:"blob", compression:"DEFLATE", compressionOptions:{level:6}},
        meta => {
          const percent = 90 + Math.round(meta.percent * 0.1);
          if (progress) progress.value = Math.min(100, percent);
          if (progressText) progressText.textContent = `${Math.min(100, percent)}%`;
        }
      );
      const stamp = now.replace(/[-:TZ.]/g, "").slice(0, 14);
      downloadBlob(blob, `resource-library-upload-patch-${stamp}.zip`);
      if (progress) progress.value = 100;
      if (progressText) progressText.textContent = "100%";
      setStatus(`완료: ${addedResources.length}개 PDF를 ${addedResources.reduce((sum, item) => sum + item.pages.length, 0)}페이지 이미지로 변환했습니다. 원본 PDF는 패치에 포함되지 않았습니다.`);
    } catch (err) {
      console.error(err);
      setStatus(`자료실 패치 생성 실패: ${err.message || err}`, true);
    } finally {
      buildBtn.disabled = !selectedFiles.length;
      clearBtn.disabled = false;
      fileInput.disabled = false;
    }
  }

  function clearSelection() {
    selectedFiles = [];
    if (fileInput) fileInput.value = "";
    if (progress) { progress.hidden = true; progress.value = 0; }
    if (progressText) progressText.textContent = "";
    setStatus("");
    renderQueue();
  }

  async function init() {
    if (!card) return;
    const user = window.PilotBankAuth?.requireLogin ? await window.PilotBankAuth.requireLogin() : null;
    const allowed = !!window.PilotBankAuth?.canAccessResourceLibrary?.(user);
    card.classList.toggle("hidden", !allowed);
    if (!allowed) return;
    await loadExistingManifest();
    renderQueue();
  }

  fileInput?.addEventListener("change", event => {
    const files = [...(event.target.files || [])].filter(file => file.type === "application/pdf" || /\.pdf$/i.test(file.name));
    selectedFiles = files.map(file => ({file, title:displayTitle(file.name), tag:inferTag(file.name)}));
    setStatus(files.length ? `${files.length}개 PDF를 선택했습니다.` : "");
    renderQueue();
  });
  queue?.addEventListener("input", syncQueueEdits);
  buildBtn?.addEventListener("click", buildPatch);
  clearBtn?.addEventListener("click", clearSelection);

  init();
})();
