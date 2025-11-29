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
  .attr("fill", "#142933");

const defs = svg.append("defs");

const gradient = defs
  .append("radialGradient")
  .attr("id", "terminator")
  .attr("cx", "50%")
  .attr("cy", "50%")
  .attr("r", "50%");

gradient
  .append("stop")
  .attr("offset", "60%")
  .attr("stop-color", "rgba(0,0,0,0)");
gradient
  .append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "rgba(0,0,0,0.55)");

svg
  .append("circle")
  .attr("class", "terminator-shadow")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", width / 2)
  .attr("fill", "url(#terminator)")
  .style("pointer-events", "none");

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

    svg.on("mouseup", () => stopDragging());
    svg.on("mouseleave", () => stopDragging());

    function stopDragging() {
      dragging = false;
      window.onmousemove = null;
      svg.classed("dragging", false);
      document.body.style.userSelect = "";
    }

    svg.on("touchstart", function (event) {
      if (event.touches.length === 1) {
        dragging = true;
        rotate = projection.rotate();
        startPos = [event.touches[0].clientX, event.touches[0].clientY];
      } else if (event.touches.length === 2 && window.innerWidth < 1080) {
        const t1 = event.touches[0];
        const t2 = event.touches[1];

        pinchStartDistance = getDistance(t1, t2);
        pinchStartScale = currentScale;
      }
    });

    svg.on("touchmove", function (event) {
      if (event.touches.length === 1 && dragging) {
        const dx = event.touches[0].clientX - startPos[0];
        const dy = startPos[1] - event.touches[0].clientY;

        projection.rotate([rotate[0] + dx * 0.1, rotate[1] + dy * 0.1]);
        render();
      } else if (event.touches.length === 2 && pinchStartDistance) {
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        const currentDist = getDistance(t1, t2);

        const scaleFactor = currentDist / pinchStartDistance;
        currentScale = Math.max(
          (width / 2.7) * 0.5,
          Math.min((width / 2.7) * 4, pinchStartScale * scaleFactor)
        );

        projection.scale(currentScale);
        svg.select(".background-circle").attr("r", currentScale);

        render();
      }
      event.preventDefault();
    });

    svg.on("touchend", () => (dragging = false));
    svg.on("touchcancel", () => (dragging = false));

    svg.on("wheel", function (event) {
      event.preventDefault();

      const delta = -event.deltaY;

      if (delta > 0) currentScale *= 1.05;
      else currentScale *= 0.95;

      currentScale = Math.max(
        (width / 2.7) * 0.5,
        Math.min((width / 2.7) * 4, currentScale)
      );

      projection.scale(currentScale);
      svg.select(".background-circle").attr("r", currentScale);

      render();
    });

    function render() {
      svg
        .selectAll("path")
        .attr("d", path)
        .attr("opacity", (d) => {
          const centroid = d3.geoCentroid(d);
          const rot = projection.rotate();
          const angle = d3.geoDistance(centroid, [-rot[0], -rot[1]]);
          return angle > Math.PI / 2 ? 0 : 1;
        });

      svg
        .select(".terminator-shadow")
        .attr(
          "transform",
          `rotate(${projection.rotate()[0]}, ${width / 2}, ${height / 2})`
        );
    }

    render();
  }
);

function getDistance(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function navigateToCountry(event, d) {
  if (dragged) return;

  const countryLinks = {
    Iran: "./countries/iran/",
    "United States of America": "./countries/usa/",
  };

  const name = d.properties.name;
  const link = countryLinks[name];

  if (link) window.open(link, "_blank");
}

function resizeMap() {
  width = container.clientWidth;
  height = width;

  projection.translate([width / 2, height / 2]);

  svg.attr("viewBox", `0 0 ${width} ${height}`);

  svg
    .select(".background-circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", currentScale);

  svg
    .select(".terminator-shadow")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", currentScale);

  svg.selectAll("path").attr("d", path);
}

window.addEventListener("resize", resizeMap);
window.addEventListener("orientationchange", resizeMap);
