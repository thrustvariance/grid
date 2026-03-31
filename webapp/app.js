const DEFAULT_VIEW = { lat: 22.2, lng: 78.9, z: 5, panel: 'open' };

const assets = [
  { id:'plant_sasan', type:'plants', name:'Sasan UMPP', lat:23.94, lng:82.75, status:'commissioned', capacity:'3960 MW', fuel:'coal' },
  { id:'plant_bhadla', type:'plants', name:'Bhadla Solar Park', lat:27.54, lng:71.91, status:'commissioned', capacity:'2245 MW', fuel:'solar' },
  { id:'sub_bina', type:'subs', name:'Bina 765kV Substation', lat:24.17, lng:78.2, status:'commissioned', voltage:'765kV' },
  { id:'dc_mumbai', type:'datacenters', name:'Mumbai Data Center Cluster', lat:19.08, lng:72.88, status:'operational' },
  { id:'mine_gevra', type:'coal_mines', name:'Gevra Coal Mine', lat:22.35, lng:82.67, status:'operational' },
  { id:'lng_dahej', type:'lng_terminals', name:'Dahej LNG Terminal', lat:21.72, lng:72.62, status:'operational' },
  { id:'port_mundra', type:'ports', name:'Mundra Port', lat:22.74, lng:69.71, status:'operational' },
  { id:'ind_delhi', type:'industrial_corridors', name:'DMIC Node (NCR)', lat:28.6, lng:77.2, status:'active' },
];

const links = [
  { id:'edge1', type:'tx', from:'mine_gevra', to:'plant_sasan', note:'coal logistics rail corridor' },
  { id:'edge2', type:'tx', from:'plant_sasan', to:'sub_bina', note:'power evacuation corridor' },
  { id:'edge3', type:'gas_pipelines', from:'lng_dahej', to:'ind_delhi', note:'gas supply chain (illustrative)' },
  { id:'edge4', type:'tx', from:'sub_bina', to:'dc_mumbai', note:'grid dependence (illustrative)' },
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

const map = L.map('map').setView([start.lat, start.lng], start.z);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

layerOrder.forEach(layer => layerGroups[layer] = L.layerGroup());

function assetById(id){ return assets.find(a => a.id === id); }
function findCoords(id){ const a = assetById(id); return a ? [a.lat,a.lng] : null; }

assets.forEach(a => {
  const marker = L.circleMarker([a.lat,a.lng], {
    radius: 7,
    color: a.type === 'plants' ? '#ff7b72' : a.type === 'subs' ? '#58a6ff' : '#3fb950',
    fillOpacity: .85
  }).bindTooltip(`${a.name} (${a.type})`);
  marker.on('click', () => selectAsset(a.id));
  marker.assetId = a.id;
  layerGroups[a.type]?.addLayer(marker);
});

links.forEach(l => {
  const from = findCoords(l.from), to = findCoords(l.to);
  if (!from || !to) return;
  const line = L.polyline([from,to], { color: l.type === 'gas_pipelines' ? '#e3b341' : '#8b949e', weight: 3, dashArray: l.type === 'gas_pipelines' ? '8 8' : null });
  line.bindTooltip(l.note);
  layerGroups[l.type]?.addLayer(line);
});

const overlays = {
  'plants': layerGroups.plants,
  'tx': layerGroups.tx,
  'subs': layerGroups.subs,
  'datacenters': layerGroups.datacenters,
  'coal_mines': layerGroups.coal_mines,
  'lng_terminals': layerGroups.lng_terminals,
  'ports': layerGroups.ports,
  'industrial_corridors': layerGroups.industrial_corridors,
  'gas_pipelines': layerGroups.gas_pipelines,
};
L.control.layers(null, overlays, { collapsed: false }).addTo(map);

start.layers.forEach(l => overlays[l]?.addTo(map));

function currentLayers() {
  return Object.entries(overlays).filter(([_, g]) => map.hasLayer(g)).map(([k]) => k);
}

function updateLayerList(){
  const ul = document.getElementById('activeLayers');
  ul.innerHTML = '';
  currentLayers().forEach(l => {
    const li = document.createElement('li');
    li.textContent = l;
    ul.appendChild(li);
  });
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
  document.getElementById('assetContent').innerHTML = `
    <h3 class="asset-title">${a.name}</h3>
    <div class="kv"><b>Type:</b> ${a.type}</div>
    <div class="kv"><b>Status:</b> ${a.status}</div>
    <div class="kv"><b>Fuel:</b> ${a.fuel || 'n/a'}</div>
    <div class="kv"><b>Capacity:</b> ${a.capacity || 'n/a'}</div>
    <div class="kv"><b>Coordinates:</b> ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</div>
  `;
  updateUrl();
}

map.on('moveend zoomend overlayadd overlayremove', updateUrl);

document.getElementById('togglePanel').addEventListener('click', () => {
  document.getElementById('panel').classList.toggle('closed');
  updateUrl();
});

document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  if (!q) return;
  const m = assets.find(a => a.name.toLowerCase().includes(q) || a.type.includes(q));
  if (m) {
    map.setView([m.lat, m.lng], 7);
    selectAsset(m.id);
  }
});

if (start.selected) selectAsset(start.selected);
if (start.panel === 'closed') document.getElementById('panel').classList.add('closed');
updateLayerList();
updateUrl();
