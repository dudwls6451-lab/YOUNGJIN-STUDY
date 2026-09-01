/* PilotBank v11.60.42 · shared reference annotations (FSR + ICAO 8168) */
(()=>{
  const VERSION="11.60.42";
  const TABLE="pilotbank_study_annotations";
  const PREFIX="pilotbank-reference-annotation-v116042";
  const controllers=new Map();
  const qs=(s,r=document)=>r?.querySelector?.(s)||null;

  function uidFallback(){
    try { if (typeof getSupabaseLearningUserId === "function") return getSupabaseLearningUserId() || null; } catch {}
    try { const v=window.PilotBankAuth?.getCurrentUser?.(); return typeof v==="string"?v:(v?.id||null); } catch {}
    return null;
  }
  async function userId(){
    const direct=uidFallback(); if(direct) return direct;
    try { const {data,error}=await window.supabaseClient?.auth?.getSession?.(); if(error) throw error; return data?.session?.user?.id||null; } catch { return null; }
  }
  const safe=v=>String(v??"").replace(/[^a-zA-Z0-9_.:@/-]/g,"_");
  function localKey(surface,content,user){return `${PREFIX}:${safe(user||"guest")}:${safe(surface)}:${safe(content)}`;}
  function blank(){return {version:1,highlights:[],drawings:[],updated_at:null};}
  function normalizeState(raw){
    return {
      version:1,
      highlights:Array.isArray(raw?.highlights)?raw.highlights.filter(h=>Number.isFinite(+h.start)&&Number.isFinite(+h.end)&&+h.end>+h.start).map(h=>({id:String(h.id||`hl-${Date.now()}`),start:+h.start,end:+h.end,color:["yellow","green","pink","blue"].includes(h.color)?h.color:"yellow",quote:String(h.quote||"")})):[],
      drawings:Array.isArray(raw?.drawings)?raw.drawings.filter(s=>Array.isArray(s?.points)&&s.points.length).map(s=>({tool:["pen","marker","eraser"].includes(s.tool)?s.tool:"pen",color:String(s.color||"#1d4ed8"),width:Math.max(1,+s.width||4),points:s.points.map(p=>({x:Math.max(0,Math.min(1,+p.x||0)),y:Math.max(0,Math.min(1,+p.y||0))}))})):[],
      updated_at:raw?.updated_at||null
    };
  }

  class Controller{
    constructor(config){
      this.c=config; this.mountKey=config.mountKey||config.surfaceKey;
      this.state=blank(); this.user=null; this.lastSelection=null; this.drawingActive=false; this.tool="hand"; this.pointerId=null; this.stroke=null; this.saveTimer=null; this.destroyed=false; this.resizeObserver=null;
      this.onSelection=this.captureSelection.bind(this); this.onPointerDown=this.pointerDown.bind(this); this.onPointerMove=this.pointerMove.bind(this); this.onPointerUp=this.pointerUp.bind(this); this.onVisibility=this.visibility.bind(this); this.onResize=this.resizeCanvas.bind(this);
    }
    async init(){
      this.buildToolbar();
      this.bind();
      this.user=await userId();
      this.loadLocal();
      this.applyHighlights(); this.resizeCanvas();
      await this.loadCloud();
      if(this.destroyed)return;
      this.applyHighlights(); this.resizeCanvas();
      return this;
    }
    buildToolbar(){
      const h=this.c.toolbarHost;if(!h)return;
      h.innerHTML=`<div class="pb-annotation-toolbar" aria-label="필기 및 형광펜 도구">
        <div class="pb-annotation-group"><button class="pb-ann-btn" data-ann="highlight" type="button">🖍 형광펜</button><select class="pb-ann-select" data-ann="highlight-color" aria-label="형광펜 색상"><option value="yellow">노랑</option><option value="green">초록</option><option value="pink">분홍</option><option value="blue">파랑</option></select><button class="pb-ann-btn secondary" data-ann="erase-highlight" type="button">선택 지우기</button></div>
        <div class="pb-annotation-group"><button class="pb-ann-btn" data-ann="draw-toggle" type="button">✎ 필기</button><div class="pb-ann-draw-tools hidden" data-ann="draw-tools"><button class="pb-ann-tool active" data-ann-tool="hand" type="button">✋ 이동</button><button class="pb-ann-tool" data-ann-tool="pen" type="button">펜</button><button class="pb-ann-tool" data-ann-tool="marker" type="button">마커</button><button class="pb-ann-tool" data-ann-tool="eraser" type="button">지우개</button><label>색 <input data-ann="draw-color" type="color" value="#1d4ed8"></label><label>굵기 <input data-ann="draw-width" type="range" min="1" max="24" value="4"></label><button class="pb-ann-btn secondary" data-ann="undo" type="button">되돌리기</button><button class="pb-ann-btn secondary" data-ann="clear" type="button">전체 지우기</button></div></div>
        <span class="pb-ann-sync" data-ann="sync-status">${this.user?"계정 동기화":"로컬 저장"}</span>
      </div>`;
      h.addEventListener("click",e=>{
        const action=e.target?.closest?.("[data-ann]")?.dataset?.ann;
        const tool=e.target?.closest?.("[data-ann-tool]")?.dataset?.annTool;
        if(tool){this.setTool(tool);return;}
        if(action==="highlight")this.addHighlight();
        if(action==="erase-highlight")this.eraseHighlight();
        if(action==="draw-toggle")this.setDrawing(!this.drawingActive);
        if(action==="undo")this.undo();
        if(action==="clear")this.clearDrawing();
      });
    }
    bind(){
      this.c.body?.addEventListener("mouseup",this.onSelection,{passive:true});
      this.c.body?.addEventListener("touchend",this.onSelection,{passive:true});
      document.addEventListener("selectionchange",this.onSelection,{passive:true});
      this.c.canvas?.addEventListener("pointerdown",this.onPointerDown);
      this.c.canvas?.addEventListener("pointermove",this.onPointerMove);
      this.c.canvas?.addEventListener("pointerup",this.onPointerUp);
      this.c.canvas?.addEventListener("pointercancel",this.onPointerUp);
      window.addEventListener("resize",this.onResize,{passive:true});
      document.addEventListener("visibilitychange",this.onVisibility,{passive:true});
      if(window.ResizeObserver&&this.c.surface){this.resizeObserver=new ResizeObserver(()=>this.resizeCanvas());this.resizeObserver.observe(this.c.surface);}
    }
    destroy(){this.destroyed=true;clearTimeout(this.saveTimer);document.removeEventListener("selectionchange",this.onSelection);document.removeEventListener("visibilitychange",this.onVisibility);window.removeEventListener("resize",this.onResize);this.resizeObserver?.disconnect?.();}
    status(t){const el=qs('[data-ann="sync-status"]',this.c.toolbarHost);if(el)el.textContent=t;}
    loadLocal(){try{this.state=normalizeState(JSON.parse(localStorage.getItem(localKey(this.c.surfaceKey,this.c.contentKey,this.user))||"{}"));}catch{this.state=blank();}}
    saveLocal(){this.state.updated_at=new Date().toISOString();try{localStorage.setItem(localKey(this.c.surfaceKey,this.c.contentKey,this.user),JSON.stringify(this.state));}catch{}}
    async loadCloud(){
      if(!this.user||!window.supabaseClient){this.status("로컬 저장");return;}
      try{
        this.status("동기화 중…");
        const {data,error}=await window.supabaseClient.from(TABLE).select("payload,updated_at").eq("user_id",this.user).eq("surface_key",this.c.surfaceKey).eq("content_key",this.c.contentKey).maybeSingle();
        if(error)throw error;
        if(data?.payload){const cloud=normalizeState({...data.payload,updated_at:data.updated_at});const lt=Date.parse(this.state.updated_at||0)||0,ct=Date.parse(cloud.updated_at||0)||0;if(lt>ct&&(this.state.highlights.length||this.state.drawings.length)){await this.saveCloudNow();}else{this.state=cloud;this.saveLocal();this.status("동기화됨");}}
        else if(this.state.highlights.length||this.state.drawings.length){await this.saveCloudNow();}
        else this.status("동기화됨");
      }catch(err){console.warn("[Annotations] cloud load failed",err);this.status("로컬 저장 · 서버 설정 필요");}
    }
    queueSave(){this.saveLocal();this.status(this.user?"저장 중…":"로컬 저장");clearTimeout(this.saveTimer);this.saveTimer=setTimeout(()=>this.saveCloudNow(),350);}
    async saveCloudNow(){
      if(!this.user||!window.supabaseClient){this.status("로컬 저장");return;}
      try{
        const row={user_id:this.user,surface_key:this.c.surfaceKey,content_key:this.c.contentKey,payload:{version:1,highlights:this.state.highlights,drawings:this.state.drawings},updated_at:new Date().toISOString()};
        const {error}=await window.supabaseClient.from(TABLE).upsert(row,{onConflict:"user_id,surface_key,content_key"});if(error)throw error;this.status("동기화됨");
      }catch(err){console.warn("[Annotations] cloud save failed",err);this.status("로컬 저장 · 서버 설정 필요");}
    }
    async visibility(){if(document.visibilityState==="visible"&&this.user&&!this.drawingActive){await this.loadCloud();if(!this.destroyed){this.applyHighlights();this.resizeCanvas();}}}
    offset(node,offset){try{const r=document.createRange();r.selectNodeContents(this.c.body);r.setEnd(node,offset);return(r.cloneContents().textContent||"").length;}catch{return null;}}
    captureSelection(){
      if(this.drawingActive||this.destroyed)return;const sel=window.getSelection?.();if(!sel||sel.rangeCount<1||sel.isCollapsed)return;const range=sel.getRangeAt(0);const common=range.commonAncestorContainer?.nodeType===Node.TEXT_NODE?range.commonAncestorContainer.parentNode:range.commonAncestorContainer;if(!common||!this.c.body.contains(common))return;const start=this.offset(range.startContainer,range.startOffset),end=this.offset(range.endContainer,range.endOffset);if(start==null||end==null||end<=start)return;this.lastSelection={start,end,quote:sel.toString()};
    }
    color(){return qs('[data-ann="highlight-color"]',this.c.toolbarHost)?.value||"yellow";}
    addHighlight(){const s=this.lastSelection;if(!s){this.status("본문을 먼저 드래그하세요");return;}const next=this.state.highlights.filter(h=>h.end<=s.start||h.start>=s.end);next.push({id:`hl-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,start:s.start,end:s.end,color:this.color(),quote:s.quote});this.state.highlights=next;this.queueSave();this.applyHighlights();window.getSelection?.().removeAllRanges?.();this.lastSelection=null;}
    eraseHighlight(){const s=this.lastSelection;if(!s){this.status("지울 범위를 드래그하세요");return;}this.state.highlights=this.state.highlights.filter(h=>h.end<=s.start||h.start>=s.end);this.queueSave();this.applyHighlights();window.getSelection?.().removeAllRanges?.();this.lastSelection=null;}
    cleanMarks(){this.c.body?.querySelectorAll?.("mark.pb-study-highlight").forEach(mark=>{const p=mark.parentNode;while(mark.firstChild)p.insertBefore(mark.firstChild,mark);p.removeChild(mark);p.normalize?.();});}
    resolve(h,text){let start=h.start,end=h.end;const quote=String(h.quote||"");if(quote&&text.slice(start,end)!==quote){const i=text.indexOf(quote);if(i>=0){start=i;end=i+quote.length;}}return{start,end};}
    applyHighlights(){
      const root=this.c.body;if(!root)return;this.cleanMarks();const text=root.textContent||"";const rows=this.state.highlights.map(h=>({...h,...this.resolve(h,text)})).filter(h=>h.end>h.start&&h.start>=0&&h.end<=text.length).sort((a,b)=>b.start-a.start);
      rows.forEach((h,idx)=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const parts=[];let pos=0,node;while((node=walker.nextNode())){const len=node.nodeValue?.length||0;if(pos<h.end&&pos+len>h.start)parts.push({node,start:pos});pos+=len;}parts.reverse().forEach(part=>{const ls=Math.max(0,h.start-part.start),le=Math.min(part.node.nodeValue.length,h.end-part.start);if(le<=ls)return;let target=part.node;if(le<target.nodeValue.length)target.splitText(le);if(ls>0)target=target.splitText(ls);const mark=document.createElement("mark");mark.className=`pb-study-highlight pb-study-highlight-${["yellow","green","pink","blue"].includes(h.color)?h.color:"yellow"}`;mark.dataset.highlightId=h.id||`h${idx}`;target.parentNode.insertBefore(mark,target);mark.appendChild(target);});});
    }
    setDrawing(v){this.drawingActive=!!v;qs('[data-ann="draw-toggle"]',this.c.toolbarHost)?.classList.toggle("active",this.drawingActive);qs('[data-ann="draw-tools"]',this.c.toolbarHost)?.classList.toggle("hidden",!this.drawingActive);if(this.drawingActive)this.setTool("hand");else{this.stroke=null;this.pointerId=null;this.updateCanvasMode();}}
    setTool(t){this.tool=["hand","pen","marker","eraser"].includes(t)?t:"hand";this.c.toolbarHost?.querySelectorAll?.("[data-ann-tool]").forEach(b=>b.classList.toggle("active",b.dataset.annTool===this.tool));this.updateCanvasMode();}
    updateCanvasMode(){const on=this.drawingActive&&this.tool!=="hand";this.c.canvas?.classList.toggle("active",on);this.c.viewport?.classList.toggle("drawing-active",on);}
    dims(){const s=this.c.surface;return{w:Math.max(1,s?.scrollWidth||s?.clientWidth||1),h:Math.max(1,s?.scrollHeight||s?.clientHeight||1)};}
    point(e){const r=this.c.surface?.getBoundingClientRect();const d=this.dims();if(!r)return null;return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/d.w)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/d.h))};}
    pointerDown(e){if(!this.drawingActive||this.tool==="hand"||e.button>0)return;const p=this.point(e);if(!p)return;e.preventDefault();this.pointerId=e.pointerId;this.c.canvas?.setPointerCapture?.(e.pointerId);this.stroke={tool:this.tool,color:qs('[data-ann="draw-color"]',this.c.toolbarHost)?.value||"#1d4ed8",width:Number(qs('[data-ann="draw-width"]',this.c.toolbarHost)?.value||4),points:[p]};this.state.drawings.push(this.stroke);this.renderDrawing();}
    pointerMove(e){if(!this.stroke||this.pointerId!==e.pointerId)return;const p=this.point(e);if(!p)return;e.preventDefault();this.stroke.points.push(p);this.renderDrawing();}
    pointerUp(e){if(!this.stroke||(e.pointerId!=null&&this.pointerId!==e.pointerId))return;this.stroke=null;this.pointerId=null;this.queueSave();}
    undo(){if(!this.state.drawings.length)return;this.state.drawings.pop();this.queueSave();this.renderDrawing();}
    clearDrawing(){if(!this.state.drawings.length)return;if(!confirm("현재 페이지/조항의 필기를 모두 지울까요?"))return;this.state.drawings=[];this.queueSave();this.renderDrawing();}
    resizeCanvas(){const c=this.c.canvas,s=this.c.surface;if(!c||!s)return;const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)),d=this.dims();c.dataset.cssWidth=String(d.w);c.dataset.cssHeight=String(d.h);c.style.width=`${d.w}px`;c.style.height=`${d.h}px`;const nw=Math.round(d.w*dpr),nh=Math.round(d.h*dpr);if(c.width!==nw)c.width=nw;if(c.height!==nh)c.height=nh;this.renderDrawing();}
    renderDrawing(){const c=this.c.canvas;if(!c?.width)return;const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)),d=this.dims(),ctx=c.getContext("2d");ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.setTransform(dpr,0,0,dpr,0,0);this.state.drawings.forEach(st=>{const pts=st.points||[];if(!pts.length)return;ctx.save();ctx.lineCap="round";ctx.lineJoin="round";if(st.tool==="eraser"){ctx.globalCompositeOperation="destination-out";ctx.globalAlpha=1;ctx.lineWidth=Math.max(8,+st.width||12);}else{ctx.globalCompositeOperation="source-over";ctx.strokeStyle=st.color||"#1d4ed8";ctx.globalAlpha=st.tool==="marker"?.28:1;ctx.lineWidth=Math.max(1,+st.width||4)*(st.tool==="marker"?2.5:1);}ctx.beginPath();ctx.moveTo(pts[0].x*d.w,pts[0].y*d.h);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x*d.w,pts[i].y*d.h);if(pts.length===1)ctx.lineTo(pts[0].x*d.w+.1,pts[0].y*d.h+.1);ctx.stroke();ctx.restore();});}
  }

  async function mount(config){
    if(!config?.surfaceKey||!config?.contentKey||!config?.toolbarHost||!config?.surface||!config?.body||!config?.canvas)return null;
    const key=config.mountKey||config.surfaceKey;controllers.get(key)?.destroy?.();const c=new Controller(config);controllers.set(key,c);await c.init();return c;
  }
  function destroy(key){controllers.get(key)?.destroy?.();controllers.delete(key);}
  window.PilotBankReferenceAnnotations={VERSION,TABLE,mount,destroy};
})();
