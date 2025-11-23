const container = document.getElementById("map");
let width = container.clientWidth;
let height = container.clientWidth;
const projection = d3
  .geoOrthographic()
  .scale(width / 2)
  .translate([width / 2, height / 2])
  .clipAngle(90)
  .rotate([-55, -25]);
const path = d3.geoPath(projection);
const svg = d3
  .select("#map")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");
svg
  .append("circle")
  .attr("class", "background-circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", width / 2)
  .attr("fill", "#132c33");

let currentScale = width / 2;
let pinchStartDistance = null;
let pinchStartScale = currentScale;
let dragged = false;

d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(
  (world) => {
    const countries = topojson.feature(world, world.objects.countries);
    svg
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", (d) => d.properties.name)
      .on("click", navigateToCountry);

    let rotate = [0, 0];
    let dragging = false;
    let startPos = [0, 0];

    svg.on("mousedown", function (event) {
      dragged = false;
      dragging = true;
      rotate = projection.rotate();
      startPos = [event.clientX, event.clientY];
      svg.classed("dragging", true);
      document.body.style.userSelect = "none";
      window.onmousemove = function (event) {
        if (!dragging) return;
        dragged = true;
        const dx = event.clientX - startPos[0];
        const dy = startPos[1] - event.clientY;
        projection.rotate([rotate[0] + dx * 0.1, rotate[1] + dy * 0.1]);
        render();
      };
    });

    svg.on("mouseup", function () {
      dragging = false;
      window.onmousemove = null;
      svg.classed("dragging", false);
      document.body.style.userSelect = "";
    });

    svg.on("mouseleave", function () {
      dragging = false;
      window.onmousemove = null;
      svg.classed("dragging", false);
      document.body.style.userSelect = "";
    });

    svg.on("touchstart", function (event) {
      if (event.touches.length === 1) {
        dragging = true;
        rotate = projection.rotate();
        startPos = [event.touches[0].clientX, event.touches[0].clientY];
        svg.classed("dragging", true);
      } else if (event.touches.length === 2 && window.innerWidth < 1080) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        if (
          event.target.classList.contains("background-circle") ||
          touchOnBackgroundCircle(touch1) ||
          touchOnBackgroundCircle(touch2)
        ) {
          pinchStartDistance = getDistance(touch1, touch2);
          pinchStartScale = currentScale;
        }
      }
    });

    svg.on("touchmove", function (event) {
      if (event.touches.length === 1 && dragging) {
        const dx = event.touches[0].clientX - startPos[0];
        const dy = startPos[1] - event.touches[0].clientY;
        if (Math.abs(dy) > Math.abs(dx)) event.preventDefault();
        projection.rotate([rotate[0] + dx * 0.1, rotate[1] + dy * 0.1]);
        render();
      } else if (
        event.touches.length === 2 &&
        pinchStartDistance &&
        window.innerWidth < 1080
      ) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = getDistance(touch1, touch2);
        const scaleFactor = currentDistance / pinchStartDistance;
        currentScale = Math.max(
          (width / 2.7) * 0.5,
          Math.min((width / 2.7) * 4, pinchStartScale * scaleFactor)
        );
        projection.scale(currentScale);
        svg.select(".background-circle").attr("r", currentScale);
        render();
        event.preventDefault();
      }
    });

    svg.on("touchend", function () {
      dragging = false;
      pinchStartDistance = null;
      svg.classed("dragging", false);
    });

    svg.on("touchcancel", function () {
      dragging = false;
      pinchStartDistance = null;
      svg.classed("dragging", false);
    });

    svg.on("wheel", function (event) {
      event.preventDefault();
      const delta = -event.deltaY;
      const [mouseX, mouseY] = [event.offsetX, event.offsetY];
      const dx = mouseX - width / 2;
      const dy = mouseY - height / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > currentScale) return;
      if (delta > 0) {
        currentScale *= 1.05;
      } else {
        currentScale *= 0.95;
      }
      currentScale = Math.max(
        (width / 2.7) * 0.5,
        Math.min((width / 2.7) * 4, currentScale)
      );
      projection.scale(currentScale);
      svg.select(".background-circle").attr("r", currentScale);
      render();
    });

    function render() {
      svg.selectAll("path").attr("d", path);
    }

    render();
  }
);

function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function touchOnBackgroundCircle(touch) {
  const rect = svg.node().getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  const dx = x - width / 2;
  const dy = y - height / 2;
  return Math.sqrt(dx * dx + dy * dy) <= currentScale;
}

function navigateToCountry(event, d) {
  if (dragged) return;
  const countryLinks = {
    Iran: "./countries/iran/",
    "United States of America": "./countries/usa/",
  };
  const countryName = d.properties.name;
  const url = countryLinks[countryName];
  if (url) {
    window.open(url, "_blank");
  }
}

function resizeMap() {
  width = container.clientWidth;
  height = container.clientWidth;
  projection.translate([width / 2, height / 2]);
  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
  svg
    .select(".background-circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2);
  svg.selectAll("path").attr("d", path);
}

window.addEventListener("resize", resizeMap);
window.addEventListener("orientationchange", resizeMap);

document.getElementById("openPopup").addEventListener("click", function () {
  document.getElementById("popup").style.display = "flex";
});

document.getElementById("closePopup").addEventListener("click", function () {
  document.getElementById("popup").style.display = "none";
});

document.getElementById("popup").addEventListener("click", function (e) {
  if (e.target === this) {
    this.style.display = "none";
  }
});

document.querySelectorAll(".locked-img").forEach((img) => {
  img.addEventListener("dragstart", (e) => e.preventDefault());
});
