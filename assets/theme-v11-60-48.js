/* Map legacy neutral colors into a shared palette, including dynamically added styles. */
(() => {
  const palettes={light:{bg:'#f4f7fb',surface:'#ffffff',raised:'#f8fafc',text:'#172338',muted:'#52647a',border:'#cdd8e6',accent:'#2563eb'},dark:{bg:'#0b1220',surface:'#131e30',raised:'#1b2940',text:'#edf4ff',muted:'#b2c1d5',border:'#354963',accent:'#80aaff'}};
  const root=document.documentElement;let generated,queued=false;
  function replacement(token,property){
    const named={white:'#ffffff',black:'#000000',gainsboro:'#dcdcdc',whitesmoke:'#f5f5f5',gray:'#808080',grey:'#808080',silver:'#c0c0c0'};token=named[token.toLowerCase()]||token;let rgb;if(token[0]==='#'){let h=token.slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');if(h.length!==6&&h.length!==8)return token;rgb=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
    else {const m=token.match(/[\d.]+/g);if(!m||m.length<3)return token;rgb=m.slice(0,3).map(Number);}
    const max=Math.max(...rgb),min=Math.min(...rgb),brightness=rgb.reduce((a,b)=>a+b)/3;
    if(max-min>85 || (max-min>65&&brightness>90))return token;
    if(property==='color'||property==='fill'||property==='stroke')return `var(--theme-${brightness>75&&brightness<205?'muted':'text'})`;
    if(property.includes('border')||property==='outline-color')return 'var(--theme-border)';
    return `var(--theme-${brightness<100?'surface':brightness<225?'raised':'surface'})`;
  }
  const colors=/#(?:[a-f\d]{8}|[a-f\d]{6}|[a-f\d]{3})\b|rgba?\([^)]*\)|\b(?:white|black|gainsboro|whitesmoke|gray|grey|silver)\b/gi;
  function map(value,p){return value.replace(colors,t=>replacement(t,p));}
  const protectedSelector=/annotation-(?:layer|canvas|stroke)|(?:annotation|highlight).*(?:swatch|color|mark)|\bmark\b|canvas|svg|progress-fill|aria-current|is-correct|is-wrong|pb-good|pb-bad|dailyQuizGate/i;
  function regenerate(){
    if(!generated){generated=document.createElement('style');generated.id='pilotbankLegacyThemeMap';const target=document.querySelector('link[href*="theme-v11-60-48"]');target?.before(generated);if(!generated.parentNode)document.head.append(generated);}
    const walk=rules=>[...rules].map(r=>{
      if(r.selectorText&&r.style){if(protectedSelector.test(r.selectorText))return '';const declarations=[];for(const prop of ['color','background','background-color','border','border-color','border-top-color','border-bottom-color','outline-color']){const value=r.style.getPropertyValue(prop);if(!value)continue;const bg=r.style.getPropertyValue('background')||r.style.getPropertyValue('background-color');const colorful=(bg.match(colors)||[]).some(t=>replacement(t,'background')===t)||/var\(--(?:primary|accent)/.test(bg);const mapped=prop==='color'&&/^(?:#fff|#ffffff|white)$/i.test(value.trim())&&colorful?value:map(value,prop);if(mapped!==value)declarations.push(`${prop}:${mapped}!important`);}return declarations.length?`html[data-pb-theme] :is(${r.selectorText}){${declarations.join(';')}}`:'';}
      if(r.cssRules&&r.conditionText){const type=r.constructor.name==='CSSMediaRule'?'media':r.constructor.name==='CSSSupportsRule'?'supports':null;return type?`@${type} ${r.conditionText}{${walk(r.cssRules)}}`:'';}return '';
    }).join('\n');
    const css=[];for(const sheet of document.styleSheets){if(sheet.ownerNode===generated||sheet.ownerNode?.id==='pilotbankLegacyThemeMap'||sheet.href?.includes('theme-v11-60-48'))continue;try{css.push(walk(sheet.cssRules));}catch{}}
    const next=css.join('\n');if(generated.textContent!==next)generated.textContent=next;
    normalizeInline(document.body);
  }
  function normalizeInline(node){if(node.nodeType!==1)return;const nodes=[node,...node.querySelectorAll('[style]')];for(const el of nodes){if(el.closest('svg,canvas,mark,[data-highlight-id],.reference-annotation-layer,.aviwiki-annotation-layer'))continue;const bg=el.style.getPropertyValue('background')||el.style.getPropertyValue('background-color');const colorful=(bg.match(colors)||[]).some(t=>replacement(t,'background')===t)||/var\(--(?:primary|accent)/.test(bg);for(const prop of ['color','background','background-color','border-color']){const value=el.style.getPropertyValue(prop);if(value){const next=prop==='color'&&/^(?:#fff|#ffffff|white)$/i.test(value.trim())&&colorful?value:map(value,prop);if(next!==value)el.style.setProperty(prop,next,'important');}}}}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;regenerate();});}
  function apply(mode){mode=mode==='dark'?'dark':'light';root.dataset.pbTheme=mode;const p=palettes[mode];for(const [k,v] of Object.entries(p))root.style.setProperty(`--theme-${k}`,v);
    const aliases={bg:'bg',surface:'surface','surface-2':'raised','surface-3':'surface',text:'text',muted:'muted',border:'border',primary:'accent','pb-shell-bg':'bg','pb-panel':'surface','pb-line':'border','pb-text':'text','pb-text-strong':'text','pb-muted':'muted','pb-soft':'muted','pb-shell-tint':'raised','pb-blue-soft':'raised','pb-blue-soft-2':'raised','pb-line-strong':'border','pb-blue-line':'border','pb-blue':'accent','pb-blue-strong':'accent','primary-hover':'accent'};
    for(const [k,v] of Object.entries(aliases))root.style.setProperty(`--${k}`,p[v]);
    root.style.setProperty('--good',mode==='dark'?'#86efac':'#166534');root.style.setProperty('--pb-green',mode==='dark'?'#86efac':'#166534');root.style.setProperty('--bad',mode==='dark'?'#fca5a5':'#b91c1c');
    try{localStorage.setItem('pilotbank-theme',mode);}catch{}
    const btn=document.querySelector('#themeToggleBtn');if(btn){btn.textContent=mode==='dark'?'☀ 화이트':'☾ 다크';btn.setAttribute('aria-label',mode==='dark'?'화이트 모드로 변경':'다크 모드로 변경');btn.setAttribute('aria-pressed',String(mode==='dark'));}
  }
  function boot(){apply(root.dataset.pbTheme);const slot=document.querySelector('#pilotbankHeaderActions');if(slot&&!document.querySelector('#themeToggleBtn')){const btn=document.createElement('button');btn.id='themeToggleBtn';btn.type='button';btn.className='pb-theme-toggle';btn.onclick=()=>apply(root.dataset.pbTheme==='dark'?'light':'dark');slot.prepend(btn);apply(root.dataset.pbTheme);}regenerate();
    new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&['color','background','background-color','border-color'].some(p=>r.target.style.getPropertyValue(p).match(colors)))normalizeInline(r.target);}if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.id!=='pilotbankLegacyThemeMap'&&!n.closest?.('#pilotbankLegacyThemeMap'))))queue();}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});}
  window.PilotBankTheme={apply,refresh:queue};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
