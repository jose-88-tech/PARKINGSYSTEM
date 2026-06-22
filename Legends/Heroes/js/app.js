// Heroes app.js — Parking logic with PriorityQueue and HashMap
class PriorityQueue {
  constructor(items = []){
    this.data = items.slice();
    this._build();
  }
  _build(){
    this.data.sort((a,b)=>a-b);
  }
  push(val){
    this.data.push(val);
    this._siftUp(this.data.length-1);
  }
  pop(){
    if(this.isEmpty()) return null;
    const val = this.data.shift();
    return val;
  }
  peek(){return this.isEmpty()?null:this.data[0];}
  isEmpty(){return this.data.length===0}
  _siftUp(i){ this._build(); }
}

class HashMap {
  constructor(){ this.map = new Map(); }
  set(k,v){ this.map.set(k,v); }
  get(k){ return this.map.get(k); }
  has(k){ return this.map.has(k); }
  delete(k){ return this.map.delete(k); }
  entries(){ return Array.from(this.map.entries()); }
}

const GRID_SIZE = 20; // default slots
const gridEl = document.getElementById('grid');
const form = document.getElementById('vehicle-form');
const releaseBtn = document.getElementById('release-btn');
const statTotal = document.getElementById('stat-total');
const statAvailable = document.getElementById('stat-available');
const statOccupied = document.getElementById('stat-occupied');
const logEl = document.getElementById('activity-log');

// Backend structures
const availablePQ = new PriorityQueue();
const occupiedMap = new HashMap(); // vehicleId -> {slot, size}

function init(){
  for(let i=1;i<=GRID_SIZE;i++) availablePQ.push(i);
  renderGrid();
  updateStats();
}

function renderGrid(){
  gridEl.innerHTML='';
  const occupiedBySlot = new Map();
  for(const [vid, info] of occupiedMap.entries()){
    occupiedBySlot.set(info.slot, {vid, size:info.size});
  }
  for(let i=1;i<=GRID_SIZE;i++){
    const el = document.createElement('div');
    el.className='slot';
    const occ = occupiedBySlot.get(i);
    if(occ){ el.classList.add('occupied'); el.innerHTML=`<div class="id">#${i}</div><div class="meta">${occ.vid} (${occ.size})</div>`; }
    else { el.classList.add('available'); el.innerHTML=`<div class="id">#${i}</div><div class="meta">Available</div>`; }
    gridEl.appendChild(el);
  }
}

function updateStats(){
  const total = GRID_SIZE;
  const occupied = occupiedMap.entries().length ? occupiedMap.entries().length : 0;
  const available = Math.max(0, total - occupied);
  statTotal.textContent = total;
  statAvailable.textContent = available;
  statOccupied.textContent = occupied;
}

function appendLog(msg){
  const li = document.createElement('li');
  const ts = new Date().toLocaleTimeString();
  li.textContent = `[${ts}] ${msg}`;
  logEl.insertBefore(li, logEl.firstChild);
}

function processEntry(vehicleId, size){
  if(occupiedMap.has(vehicleId)){
    appendLog(`Entry failed: ${vehicleId} already parked`);
    alert('Vehicle ID already parked');
    return;
  }
  const slot = availablePQ.pop();
  if(!slot){ appendLog(`Entry failed: No available slots for ${vehicleId}`); alert('No available slots'); return; }
  occupiedMap.set(vehicleId, {slot,size});
  appendLog(`Processed Entry: ${vehicleId} → slot ${slot} (${size})`);
  renderGrid(); updateStats();
}

function processExit(vehicleId){
  if(!occupiedMap.has(vehicleId)){ appendLog(`Exit failed: ${vehicleId} not found`); alert('Vehicle not found'); return; }
  const info = occupiedMap.get(vehicleId);
  occupiedMap.delete(vehicleId);
  availablePQ.push(info.slot);
  appendLog(`Processed Exit: ${vehicleId} freed slot ${info.slot}`);
  renderGrid(); updateStats();
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = document.getElementById('vehicle-id').value.trim();
  const size = document.getElementById('vehicle-size').value;
  if(!id){ alert('Enter vehicle ID'); return; }
  processEntry(id,size);
  form.reset();
});

releaseBtn.addEventListener('click', ()=>{
  const id = document.getElementById('vehicle-id').value.trim();
  if(!id){ alert('Enter vehicle ID to release'); return; }
  processExit(id);
  form.reset();
});

// Initialize
init();

// Expose for debugging
window.HeroesApp = {processEntry, processExit, availablePQ, occupiedMap};
