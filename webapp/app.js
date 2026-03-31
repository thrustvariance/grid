const DEFAULT_VIEW = { lat: 22.2, lng: 78.9, z: 5, panel: 'open' };

const assets = [
  { id:'plant_sasan', type:'plants', name:'Sasan UMPP', lat:23.94, lng:82.75, status:'commissioned', capacity:'3960 MW', fuel:'coal', owner:'Reliance Power' },
  { id:'plant_bhadla', type:'plants', name:'Bhadla Solar Park', lat:27.54, lng:71.91, status:'commissioned', capacity:'2245 MW', fuel:'solar', owner:'SECI / JV developers' },
  { id:'sub_bina', type:'subs', name:'Bina 765kV Substation', lat:24.17, lng:78.2, status:'commissioned', voltage:'765kV', owner:'PGCIL' },
  { id:'dc_mumbai', type:'datacenters', name:'Mumbai Data Center Cluster', lat:19.08, lng:72.88, status:'operational', demand:'~500+ MW planned' },
  { id:'mine_gevra', type:'coal_mines', name:'Gevra Coal Mine', lat:22.35, lng:82.67, status:'operational', output:'~largest in India' },
  { id:'lng_dahej', type:'lng_terminals', name:'Dahej LNG Terminal', lat:21.72, lng:72.62, status:'operational', regas:'~17.5 MMTPA class' },
  { id:'port_mundra', type:'ports', name:'Mundra Port', lat:22.74, lng:69.71, status:'operational', role:'energy imports & logistics' },
  { id:'ind_delhi', type:'industrial_corridors', name:'DMIC Node (NCR)', lat:28.6, lng:77.2, status:'active', role:'demand center' },
];

const links = [
  { id:'edge1', type:'tx', from:'mine_gevra', to:'plant_sasan', note:'Coal logistics rail corridor' },
  { id:'edge2', type:'tx', from:'plant_sasan', to:'sub_bina', note:'Power evacuation corridor' },
  { id:'edge3', type:'gas_pipelines', from:'lng_dahej', to:'ind_delhi', note:'Gas supply chain route (illustrative)' },
  { id:'edge4', type:'tx', from:'sub_bina', to:'dc_mumbai', note:'Grid dependence corridor (illustrative)' },
  { id:'edge5', type:'tx', from:'port_mundra', to:'plant_sasan', note:'Imported fuel contingency route (illustrative)' },
];

const layerOrder = ['plants','tx','subs','datacenters','coal_mines','lng_terminals','ports','industrial_corridors','gas_pipelines'];
const layerGroups = {};
let selectedAssetId = null;

const params = new URLSearchParams(location.search);
const start = {
  lat: parseFloat(params.get('lat')) || DEFAULT_VIEW.lat,
  lng: parseFloat(params.get('lng')) || DEFAULT_VIEW.lng,
  z: parseFloat(params.get('z')) || DEFAULT_VIEW.z,
  panel: params.get('panel') || DEFAULT_VIEW.panel,
  layers: (params.get('layers') || 'plants,tx,subs,datacenters').split(',').filter(Boolean),
  selected: params.get('selected') || null,
  time: params.get('time') || null,
};

const map = L.map('map', { zoomControl: true }).setView([start.lat, start.lng], start.z);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

layerOrder.forEach(layer => layerGroups[layer] = L.layerGroup());

const colorForType = (type) => ({
  plants:'#ff7b72', subs:'#58a6ff', datacenters:'#7aa2ff', coal_mines:'#3fb950', lng_terminals:'#e3b341', ports:'#3fb950', industrial_corridors:'#a371f7'
}[type] || '#3fb950');

const iconForType = (type) => ({
  plants:'⚡', subs:'🔌', datacenters:'🖥️', coal_mines:'⛏️', lng_terminals:'🛢️', ports:'⚓', industrial_corridors:'🏭'
}[type] || '•');

function assetById(id){ return assets.find(a => a.id === id); }
function findCoords(id){ const a = assetById(id); return a ? [a.lat,a.lng] : null; }

assets.forEach(a => {
  const marker = L.circleMarker([a.lat,a.lng], {
    radius: 7,
    color: colorForType(a.type),
    fillOpacity: .9,
    weight: 2
  }).bindTooltip(`${a.name} (${a.type})`);
  marker.on('click', () => selectAsset(a.id));
  layerGroups[a.type]?.addLayer(marker);
});

links.forEach(l => {
  const from = findCoords(l.from), to = findCoords(l.to);
  if (!from || !to) return;
  const line = L.polyline([from,to], {
    color: l.type === 'gas_pipelines' ? '#e3b341' : '#8b949e',
    weight: l.type === 'gas_pipelines' ? 4 : 3,
    dashArray: l.type === 'gas_pipelines' ? '8 8' : null,
    opacity: 0.9
  });
  line.bindTooltip(l.note);
  layerGroups[l.type]?.addLayer(line);
});

const overlays = Object.fromEntries(layerOrder.map(l => [l, layerGroups[l]]));
L.control.layers(null, overlays, { collapsed: false }).addTo(map);
start.layers.forEach(l => overlays[l]?.addTo(map));

function currentLayers() {
  return Object.entries(overlays).filter(([_, g]) => map.hasLayer(g)).map(([k]) => k);
}

function renderMetrics(){
  const m = {
    total_assets: assets.length,
    power_plants: assets.filter(a => a.type === 'plants').length,
    supply_nodes: assets.filter(a => ['coal_mines','lng_terminals','ports'].includes(a.type)).length,
    links: links.length,
  };
  document.getElementById('metrics').innerHTML = Object.entries(m).map(([k,v]) =>
    `<div class="metric"><div class="label">${k.replace('_',' ')}</div><div class="value">${v}</div></div>`
  ).join('');
}

function renderLayerPills(){
  const container = document.getElementById('layerPills');
  container.innerHTML = '';
  layerOrder.forEach(layer => {
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.textContent = layer;
    if (map.hasLayer(overlays[layer])) pill.classList.add('active');
    pill.addEventListener('click', () => {
      map.hasLayer(overlays[layer]) ? map.removeLayer(overlays[layer]) : overlays[layer].addTo(map);
      updateUrl();
    });
    container.appendChild(pill);
  });
}

function updateLayerList(){
  const ul = document.getElementById('activeLayers');
  ul.innerHTML = '';
  currentLayers().forEach(l => {
    const li = document.createElement('li');
    li.textContent = l;
    ul.appendChild(li);
  });
  renderLayerPills();
}

function updateUrl(){
  const c = map.getCenter();
  const q = new URLSearchParams();
  q.set('lat', c.lat.toFixed(6));
  q.set('lng', c.lng.toFixed(6));
  q.set('z', map.getZoom().toFixed(3));
  q.set('layers', currentLayers().join(','));
  q.set('panel', document.getElementById('panel').classList.contains('closed') ? 'closed' : 'open');
  if (selectedAssetId) q.set('selected', selectedAssetId);
  if (start.time) q.set('time', start.time);
  history.replaceState({}, '', `${location.pathname}?${q.toString()}`);
  updateLayerList();
}

function selectAsset(id){
  selectedAssetId = id;
  const a = assetById(id);
  if (!a) return;

  const rows = Object.entries(a)
    .filter(([k]) => !['id', 'lat', 'lng'].includes(k))
    .map(([k,v]) => `<div><b>${k.replace('_',' ')}:</b> ${v}</div>`)
    .join('');

  document.getElementById('assetContent').innerHTML = `
    <h3>${iconForType(a.type)} ${a.name}</h3>
    ${rows}
    <div><b>coordinates:</b> ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</div>
  `;
  updateUrl();
}

map.on('moveend zoomend overlayadd overlayremove', updateUrl);

document.getElementById('togglePanel').addEventListener('click', () => {
  const panel = document.getElementById('panel');
  panel.classList.toggle('closed');
  document.getElementById('togglePanel').textContent = panel.classList.contains('closed') ? 'Show Panel' : 'Hide Panel';
  setTimeout(() => map.invalidateSize(), 120);
  updateUrl();
});

document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  if (!q) return;
  const m = assets.find(a => a.name.toLowerCase().includes(q) || a.type.includes(q));
  if (m) {
    map.setView([m.lat, m.lng], 7);
    selectAsset(m.id);
  }
});

if (start.selected) selectAsset(start.selected);
if (start.panel === 'closed') {
  document.getElementById('panel').classList.add('closed');
  document.getElementById('togglePanel').textContent = 'Show Panel';
}

renderMetrics();
updateLayerList();
updateUrl();
