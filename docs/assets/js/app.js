// Separated JS from original BenchNano mobile HTML
// ---- generate specimen cells ----
const specimen = document.getElementById('specimen');
if(specimen){
  for(let i=0;i<14;i++){
    const c = document.createElement('div');
    c.className='cell';
    const size = 18 + Math.random()*46;
    c.style.width = size+'px'; c.style.height = size+'px';
    c.style.left = (Math.random()*90)+'%';
    c.style.top = (Math.random()*90)+'%';
    c.style.animationDuration = (10+Math.random()*10)+'s';
    c.style.animationDelay = (Math.random()*5)+'s';
    specimen.appendChild(c);
  }
}

// ---- digital zoom preview only ----
const previewContent = document.getElementById('previewContent');
const zoomChips = document.querySelectorAll('.zoom-chip');
function applyDigitalZoom(value){
  const numeric = Number(value) || 100;
  if(previewContent){ previewContent.style.transform = `scale(${numeric / 100})`; }
  const zoomValue = document.getElementById('digitalZoomValue');
  if(zoomValue) zoomValue.textContent = `${numeric}%`;
}
document.querySelector('.zoom-pill')?.addEventListener('click', e=>{
  const chip = e.target.closest('.zoom-chip');
  if(!chip) return;
  document.querySelectorAll('.zoom-chip').forEach(c=>c.classList.remove('active'));
  chip.classList.add('active');
  applyDigitalZoom(chip.dataset.v || 100);
});

// ---- LED toggle ----
function toggleLED(btn){ btn.classList.toggle('active'); }

// ---- quick settings square/pill ----
function toggleQuickPill(){
  const pill = document.getElementById('quickPill');
  const square = document.getElementById('quickSquareBtn');
  const open = pill.classList.toggle('open');
  square.classList.toggle('hidden', open);
}
function toggleQuickItem(btn){ btn.classList.toggle('active'); }
const isoValues = [100,200,320,400,500,640,800];
let isoIdx = 3;
function cycleISO(){
  isoIdx = (isoIdx+1) % isoValues.length;
  const v = isoValues[isoIdx];
  document.getElementById('isoQuick').textContent = 'ISO '+v;
  document.querySelectorAll('#isoRow .chip').forEach(c=>{
    c.classList.toggle('active', c.dataset.v == v);
  });
}

// ---- generic numeric stepper (Fraction size, Delay) ----
function stepValue(id, delta, decimals){
  const el = document.getElementById(id);
  if(!el) return;
  let v = parseFloat(el.textContent) + delta;
  if(v < 0) v = 0;
  el.textContent = v.toFixed(decimals);
}

// ---- segmented (No/Yes) toggles ----
document.querySelectorAll('.segmented').forEach(seg=>{
  seg.addEventListener('click', e=>{
    const opt = e.target.closest('.opt');
    if(!opt) return;
    seg.querySelectorAll('.opt').forEach(o=>o.classList.remove('active'));
    opt.classList.add('active');
  });
});

let activeSheet = null;
function openSheet(id){
  document.querySelectorAll('.sheet').forEach(s=>s.classList.remove('open'));
  const el = document.getElementById(id);
  if(el) el.classList.add('open');
  document.getElementById('scrim')?.classList.add('open');
  activeSheet = id;
}
function closeSheet(){
  document.querySelectorAll('.sheet').forEach(s=>s.classList.remove('open'));
  document.getElementById('scrim')?.classList.remove('open');
  activeSheet = null;
}

// ---- focus is manual on the lens; no software focus control ----

// ---- camera settings ----
document.getElementById('isoRow')?.addEventListener('click', e=>{
  const chip = e.target.closest('.chip');
  if(!chip) return;
  document.querySelectorAll('#isoRow .chip').forEach(c=>c.classList.remove('active'));
  chip.classList.add('active');
  const isoQuick = document.getElementById('isoQuick');
  if(isoQuick) isoQuick.textContent = 'ISO '+chip.dataset.v;
  isoIdx = isoValues.indexOf(parseInt(chip.dataset.v));
});
const shutterSteps = ['1/30 s','1/60 s','1/90 s','1/125 s','1/180 s','1/250 s','1/350 s','1/500 s','1/1000 s'];
function updateShutter(v){ const el = document.getElementById('shutterVal'); if(el) el.textContent = shutterSteps[v]; }
function toggleSwitch(id){ document.getElementById(id)?.classList.toggle('on'); }
function updateColorVal(id, value){ const el = document.getElementById(id); if(el) el.textContent = (value>0? '+' : '') + value; }
let advOpen = true;
function toggleAdvanced(){ advOpen = !advOpen; document.getElementById('advPanel')?.classList.toggle('open', advOpen); document.getElementById('advChev') && (document.getElementById('advChev').textContent = advOpen ? 'expand_less':'expand_more'); }

// ---- pump controls (home screen) ----
let pumpRunning = false;
let pumpCaptureInterval = null;
function togglePump(){
  const btn = document.getElementById('pumpToggle');
  const icon = btn?.querySelector('.material-symbols-rounded');
  pumpRunning = !pumpRunning;
  if(pumpRunning){
    btn?.classList.remove('stopped'); btn?.classList.add('running');
    if(icon) icon.textContent = 'stop';
    showToast('Pump started','water_drop');
    pumpCaptureInterval = setInterval(capture, 2500);
  } else {
    btn?.classList.remove('running'); btn?.classList.add('stopped');
    if(icon) icon.textContent = 'play_arrow';
    showToast('Pump stopped','stop_circle');
    clearInterval(pumpCaptureInterval);
  }
}
function reversePump(){ showToast('Pump direction reversed','sync_alt'); }

// ---- capture / gallery ----
let captures = 0;
let captureZoom = 1;

function createCaptureImage(){
  const preview = document.getElementById('preview');
  const canvas = document.createElement('canvas');
  const scale = 2;
  const width = Math.max(preview?.clientWidth || 390, 1);
  const height = Math.max(preview?.clientHeight || 600, 1);
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  context.scale(scale, scale);

  const background = context.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, height * 0.8);
  background.addColorStop(0, '#0d1f1f');
  background.addColorStop(0.55, '#050807');
  background.addColorStop(1, '#000000');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  document.querySelectorAll('.cell').forEach(cell => {
    const style = getComputedStyle(cell);
    const cellWidth = parseFloat(style.width) || 0;
    const cellHeight = parseFloat(style.height) || cellWidth;
    const left = (parseFloat(style.left) / 100) * width;
    const top = (parseFloat(style.top) / 100) * height;
    const centerX = left + cellWidth / 2;
    const centerY = top + cellHeight / 2;
    const radius = Math.max(cellWidth, cellHeight) / 2;
    const cellGradient = context.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
    cellGradient.addColorStop(0, 'rgba(23,166,172,0.55)');
    cellGradient.addColorStop(0.7, 'rgba(23,166,172,0.16)');
    cellGradient.addColorStop(1, 'rgba(23,166,172,0.04)');
    context.fillStyle = cellGradient;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
  });

  return canvas.toDataURL('image/png');
}

function capture(){
  const flash = document.getElementById('flash');
  if(flash){ flash.style.transition='none'; flash.style.opacity='0.9'; requestAnimationFrame(()=>{ flash.style.transition='opacity 0.35s ease'; flash.style.opacity='0'; }); }
  captures++;
  const galBadge = document.getElementById('galBadge'); if(galBadge) galBadge.textContent = captures;
  const gallerySub = document.getElementById('gallerySub'); if(gallerySub) gallerySub.textContent = captures+(captures===1?' SHOT':' SHOTS');
  const empty = document.getElementById('galleryEmpty');
  const grid = document.getElementById('galleryGrid');
  if(captures===1 && empty && grid){ empty.style.display='none'; grid.style.display='grid'; }
  const imageSrc = createCaptureImage();
  if(grid){
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'gallery-thumb';
    thumb.title = `Open capture ${captures}`;
    thumb.setAttribute('aria-label', `Open capture ${captures}`);
    thumb.innerHTML = `<img src="${imageSrc}" alt="Capture ${captures}">`;
    thumb.addEventListener('click', () => openCaptureViewer(imageSrc));
    grid.prepend(thumb);
  }
  showToast('Image captured','check_circle');
}

function updateCaptureZoom(){
  const image = document.getElementById('captureViewerImage');
  const reset = document.querySelector('.capture-zoom-reset');
  if(image) image.style.transform = `scale(${captureZoom})`;
  if(reset) reset.textContent = `${Math.round(captureZoom * 100)}%`;
}

function openCaptureViewer(imageSrc){
  const viewer = document.getElementById('captureViewer');
  const image = document.getElementById('captureViewerImage');
  if(!viewer || !image) return;
  image.src = imageSrc;
  captureZoom = 1;
  updateCaptureZoom();
  viewer.classList.add('open');
  viewer.setAttribute('aria-hidden', 'false');
}

function closeCaptureViewer(){
  const viewer = document.getElementById('captureViewer');
  if(!viewer) return;
  viewer.classList.remove('open');
  viewer.setAttribute('aria-hidden', 'true');
}

function adjustCaptureZoom(delta){
  captureZoom = Math.min(3, Math.max(0.5, +(captureZoom + delta).toFixed(2)));
  updateCaptureZoom();
}

function resetCaptureZoom(){
  captureZoom = 1;
  updateCaptureZoom();
}

// ---- system monitoring helpers ----
function detectUSB(){ showToast('Drive detected','usb'); }
function backupUSB(){ showToast('Backup started','cloud_upload'); }
function eraseLocal(){ if(confirm('Delete local data? This action cannot be undone.')){ showToast('Local data deleted','delete'); } }
function forceTimeUpdate(){ const el = document.getElementById('localTime'); const now = new Date(); if(el) el.textContent = now.toLocaleDateString('en-US') + ' ' + now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}); showToast('Clock updated','refresh'); }

function updateSystemGauges(){ document.getElementById('procVal') && (document.getElementById('procVal').textContent='34%'); document.getElementById('cpuTemp') && (document.getElementById('cpuTemp').textContent='42°C'); document.getElementById('memVal') && (document.getElementById('memVal').textContent='58%'); document.getElementById('diskVal') && (document.getElementById('diskVal').textContent='71%'); }

// initialize system visuals
window.addEventListener('load', ()=>{ updateSystemGauges(); forceTimeUpdate(); applyDigitalZoom(100); });

// render semicircle arcs by percent (0-100)
function setArc(arcId, percent){
  const arc = document.getElementById(arcId);
  if(!arc) return;
  const radius = 45; // matches SVG path R
  const length = Math.PI * radius; // semicircle length
  const offset = length * (1 - Math.max(0, Math.min(100, percent)) / 100);
  arc.style.strokeDasharray = length.toFixed(2);
  arc.style.strokeDashoffset = offset.toFixed(2);
}

function animateSystemGauges(){
  // example values (replace with real telemetry)
  const proc = 34, mem=58, disk=71;
  setArc('procArc', proc);
  setArc('memArc', mem);
  setArc('diskArc', disk);
  // cpu temperature not a percent; map to percent for arc
  const temp = 42; // map 0-100C -> 0-100%
  setArc('cpuArc', Math.min(100, Math.max(0, (temp/100)*100)));
  // update numeric text
  document.getElementById('procVal') && (document.getElementById('procVal').textContent = proc + '%');
  document.getElementById('memVal') && (document.getElementById('memVal').textContent = mem + '%');
  document.getElementById('diskVal') && (document.getElementById('diskVal').textContent = disk + '%');
  document.getElementById('cpuTemp') && (document.getElementById('cpuTemp').textContent = temp + '°C');
}

// run animation after load and when opening system sheet
window.addEventListener('load', ()=>{ setTimeout(animateSystemGauges, 200); });
function openSheet(id){
  document.querySelectorAll('.sheet').forEach(s=>s.classList.remove('open'));
  const el = document.getElementById(id);
  if(el) el.classList.add('open');
  document.getElementById('scrim')?.classList.add('open');
  activeSheet = id;
  if(id === 'system') setTimeout(animateSystemGauges, 120);
}

let toastTimer;
function showToast(text, icon){
  const toast = document.getElementById('toast');
  if(!toast) return;
  document.getElementById('toastText') && (document.getElementById('toastText').textContent = text);
  toast.querySelector('.material-symbols-rounded') && (toast.querySelector('.material-symbols-rounded').textContent = icon || 'check_circle');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('show'), 1600);
}

// Simulated actions: Atualizar Lista de Pastas (segmentation) e Validar (sample)
window.addEventListener('load', ()=>{
  const updateBtn = document.getElementById('updateFoldersBtn');
  if(updateBtn){
    updateBtn.addEventListener('click', async ()=>{
      const orig = updateBtn.textContent;
      updateBtn.disabled = true;
      updateBtn.textContent = 'Updating…';
      updateBtn.style.opacity = '0.7';
      await new Promise(r=>setTimeout(r,900));
      updateBtn.disabled = false;
      updateBtn.textContent = orig;
      updateBtn.style.opacity = '';
      showToast('Folder list updated','cached');
      const segBody = document.querySelector('#segmentation .sheet-body');
      if(segBody){
        let list = segBody.querySelector('.folders-list');
        if(!list){ list = document.createElement('div'); list.className='folders-list'; list.style.marginTop='8px'; list.style.color='var(--text-dim)'; segBody.insertBefore(list, segBody.querySelector('.section-label')) }
        list.textContent = 'Folders found: 12';
      }
    });
  }

  const valBtn = document.getElementById('validateSample');
  if(valBtn){
    valBtn.addEventListener('click', async ()=>{
      const orig = valBtn.textContent;
      valBtn.disabled = true; valBtn.textContent = 'Validating…'; valBtn.style.opacity='0.7';
      await new Promise(r=>setTimeout(r,700));
      valBtn.disabled = false; valBtn.textContent = orig; valBtn.style.opacity='';
      showToast('Sample validated','check_circle');
    });
  }
});


  // fluidic acquisition controls
  const startBtn = document.getElementById('startAcq');
  const stopBtn = document.getElementById('stopAcq');
  const updateFluid = document.getElementById('updateFluidConfig');
  const delayEl = document.getElementById('fluidDelay');
  const totalVolumeInput = document.getElementById('fluidTotalVolume');
  const stepVolumeInput = document.getElementById('fluidStepVolume');
  const pumpVolEl = document.getElementById('fluidPumpVolume');
  const totalPumpedEl = document.getElementById('fluidTotalPumped');
  const flowcell = document.getElementById('flowcellSelect');
  const dirSwitch = document.getElementById('fluidDirection');

  let aquRunning = false;
  let aquInterval = null;
  let pumped = 0.0; // mL

  function clampNumberInput(input, min = 0){
    if(!input) return;
    const value = Number(input.value);
    if(!Number.isFinite(value) || value < min){
      input.value = min.toFixed(2);
      return;
    }
    input.value = Number(value).toFixed(2);
  }

  function changeFluidDelay(delta){
    if(!delayEl) return;
    let v = parseFloat(delayEl.textContent || '0');
    v = Math.max(0, +(v + delta).toFixed(1));
    delayEl.textContent = v.toFixed(1);
  }
  window.changeFluidDelay = changeFluidDelay;

  function updateFluidUI(){
    if(totalVolumeInput) clampNumberInput(totalVolumeInput, 0);
    if(stepVolumeInput) clampNumberInput(stepVolumeInput, 0);
    if(pumpVolEl) pumpVolEl.textContent = pumped.toFixed(2) + ' mL';
    if(totalPumpedEl) totalPumpedEl.textContent = pumped.toFixed(2) + ' mL';
  }

  function startAcquisition(){
    if(aquRunning) return;
    aquRunning = true;
    showToast('Acquisition started','play_arrow');
    aquInterval = setInterval(()=>{
      const totalVolume = Number(totalVolumeInput?.value || 1.0);
      const stepSize = Number(stepVolumeInput?.value || 0.01);
      const maxAllowed = Math.max(totalVolume, 0);
      const nextPumped = Math.min(pumped + Math.max(stepSize, 0), maxAllowed);
      pumped = Number.isFinite(nextPumped) ? nextPumped : 0;
      if(pumped >= maxAllowed){
        pumped = maxAllowed;
        stopAcquisition();
      }
      updateFluidUI();
    }, 500);
  }

  function stopAcquisition(){ if(!aquRunning) return; aquRunning = false; clearInterval(aquInterval); aquInterval = null; showToast('Acquisition stopped','stop_circle'); }

  function updateFluidConfig(){
    const totalValue = Number(totalVolumeInput?.value || 1.0);
    const stepValue = Number(stepVolumeInput?.value || 0.01);
    if(!Number.isFinite(totalValue) || totalValue < 0 || !Number.isFinite(stepValue) || stepValue < 0){
      showToast('Invalid values','error');
      return;
    }
    const d = delayEl?.textContent;
    const f = flowcell?.value;
    showToast('Configuration updated','save');
    console.log('Fluid config', { delay: d, flowcell: f, totalVolume: totalValue, stepVolume: stepValue });
  }

  document.querySelectorAll('[data-target]').forEach(button => {
    button.addEventListener('click', () => {
      const targetName = button.dataset.target;
      const step = Number(button.dataset.step || '0');
      const input = document.getElementById(targetName);
      if(!input) return;
      const next = Number(input.value || 0) + step;
      if(next < 0) return;
      input.value = Number(next).toFixed(2);
      updateFluidUI();
    });
  });

  if(totalVolumeInput){ totalVolumeInput.addEventListener('change', () => clampNumberInput(totalVolumeInput, 0)); }
  if(stepVolumeInput){ stepVolumeInput.addEventListener('change', () => clampNumberInput(stepVolumeInput, 0)); }
  if(startBtn) startBtn.addEventListener('click', startAcquisition);
  if(stopBtn) stopBtn.addEventListener('click', stopAcquisition);
  if(updateFluid) updateFluid.addEventListener('click', updateFluidConfig);
  if(dirSwitch) dirSwitch.addEventListener('click', ()=>dirSwitch.classList.toggle('on'));
  // initialize display values
  pumped = 0.0; updateFluidUI();
