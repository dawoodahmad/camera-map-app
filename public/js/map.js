let map;
let markers = [];
let markerCluster;
let allData = [];
let currentFilteredData = [];
let infoWindow;

function initMap() {
  restoreAdvancedSectionState();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 51.4545, lng: -2.5879 }, // Bristol
    zoom: 12,
  });

  infoWindow = new google.maps.InfoWindow();

  fetch("/data")
    .then((res) => res.json())
    .then((data) => {
      allData = data;
      updateSummaryCounts(allData);
      applyFiltersAndSearch();
    });
}

function getIcon(type) {
  if (type === "Fixed Camera") {
    return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  }
  if (type === "Mobile Enforcement") {
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  }
  if (type === "Red Light Camera") {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
  return null;
}

function renderMarkers(data) {
  // clear existing markers and clusters
  if (markerCluster) {
    markerCluster.clearMarkers();
  }

  markers.forEach((m) => m.setMap(null));
  markers = [];

  data.forEach((item, index) => {
    const marker = new google.maps.Marker({
      position: {
        lat: item.latitude,
        lng: item.longitude,
      },
      title: item.location,
      icon: getIcon(item.type),
    });

    marker.addListener("click", () => {
      openMarkerInfo(item, marker);
    });

    markers.push(marker);
  });

  markerCluster = new markerClusterer.MarkerClusterer({
    map: map,
    markers: markers,
  });
}

function getSelectedTypes() {
  return Array.from(document.querySelectorAll("input[type=checkbox]:checked")).map((cb) => cb.value);
}

function applyFiltersAndSearch() {
  const checkedTypes = getSelectedTypes();
  const searchText = document.getElementById("searchInput").value.trim().toLowerCase();

  const filtered = allData.filter((item) => {
    const matchesType = checkedTypes.includes(item.type);
    const matchesSearch =
      !searchText ||
      item.location.toLowerCase().includes(searchText) ||
      item.site_id.toString().includes(searchText) ||
      (item.speed_limit && item.speed_limit.toLowerCase().includes(searchText));

    return matchesType && matchesSearch;
  });

  currentFilteredData = filtered;
  renderMarkers(filtered);
  updateResultCount(filtered.length);
  renderResultsList(filtered);
  zoomToResults(filtered);
}

function zoomToResults(data) {
  if (data.length === 0) {
    return;
  }

  if (data.length === 1) {
    map.setCenter({
      lat: data[0].latitude,
      lng: data[0].longitude,
    });
    map.setZoom(16);
    return;
  }

  const bounds = new google.maps.LatLngBounds();

  data.forEach((item) => {
    bounds.extend({
      lat: item.latitude,
      lng: item.longitude,
    });
  });

  map.fitBounds(bounds);
}

function updateResultCount(count) {
  document.getElementById("resultCount").innerText = `${count} result(s) found`;
}

function updateSummaryCounts(data) {
  const fixedCount = data.filter((item) => item.type === "Fixed Camera").length;
  const mobileCount = data.filter((item) => item.type === "Mobile Enforcement").length;
  const redLightCount = data.filter((item) => item.type === "Red Light Camera").length;

  document.getElementById("fixedCount").innerText = fixedCount;
  document.getElementById("mobileCount").innerText = mobileCount;
  document.getElementById("redLightCount").innerText = redLightCount;
}

function renderResultsList(data) {
  const resultsList = document.getElementById("resultsList");
  resultsList.innerHTML = "";

  if (data.length === 0) {
    resultsList.innerHTML = "<p>No matching camera locations found.</p>";
    return;
  }

  data.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "result-item";

    div.innerHTML = `
            <strong>${item.location}</strong><br>
            <span class="result-type">${item.type} | Site: ${item.site_id}${item.speed_limit ? ` | ${item.speed_limit}` : ""}</span>
        `;

    div.addEventListener("click", () => {
      const marker = markers[index];

      map.setCenter({
        lat: item.latitude,
        lng: item.longitude,
      });
      map.setZoom(16);

      openMarkerInfo(item, marker);
    });

    resultsList.appendChild(div);
  });
}

function openMarkerInfo(item, marker) {
  const content = `
        <div style="min-width:200px">
            <strong>${item.location}</strong><br>
            <b>Type:</b> ${item.type}<br>
            <b>Site ID:</b> ${item.site_id}<br>
            ${item.speed_limit ? `<b>Speed:</b> ${item.speed_limit}<br>` : ""}
        </div>
    `;

  infoWindow.setContent(content);
  infoWindow.open(map, marker);
}

function resetSearch() {
  document.getElementById("searchInput").value = "";

  document.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.checked = true;
  });

  applyFiltersAndSearch();
}

function handleSearchKey(event) {
  if (event.key === "Enter") {
    applyFiltersAndSearch();
  }
}
function toggleAdvanced() {
  const section = document.getElementById("advancedSection");
  const isCollapsed = section.classList.toggle("collapsed");

  localStorage.setItem("advancedSectionCollapsed", isCollapsed ? "true" : "false");
  updateToggleButtonText(isCollapsed);
}

function restoreAdvancedSectionState() {
  const section = document.getElementById("advancedSection");
  const isCollapsed = localStorage.getItem("advancedSectionCollapsed") === "true";

  section.classList.toggle("collapsed", isCollapsed);
  updateToggleButtonText(isCollapsed);
}

function updateToggleButtonText(isCollapsed) {
  const button = document.getElementById("toggleAdvancedButton");
  button.innerText = isCollapsed ? "Show" : "Hide";
}
