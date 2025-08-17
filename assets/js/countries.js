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

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.classList.add("active");
}

async function loadTools(country) {
  try {
    const response = await fetch(`${country}.json`);
    const data = await response.json();

    const categories = {
      government: "tab1",
      financial: "tab2",
      society: "tab3",
      research: "tab4",
      judicial: "tab5",
      business: "tab6",
    };

    for (let cat in categories) {
      const tabId = categories[cat];
      const container = document.querySelector(`#${tabId} .tools-list`);
      const sortContainer = document.querySelector(`#${tabId} .tools-sort`);

      if (data.tools[cat] && data.tools[cat].length > 0) {
        let tools = data.tools[cat];

        sortContainer.innerHTML = `
          <label><input type="checkbox" class="filter-checkbox" value="free" checked> Free</label>
          <label><input type="checkbox" class="filter-checkbox" value="paid" checked> Paid</label>
          <label><input type="checkbox" class="filter-checkbox" value="signup" checked> Signup Required</label>
          <label><input type="checkbox" class="filter-checkbox" value="no-signup" checked> No Signup</label>
        `;

        const renderTools = () => {
          const checkedFilters = Array.from(
            sortContainer.querySelectorAll(".filter-checkbox:checked")
          ).map((cb) => cb.value);

          const filteredTools = tools.filter((tool) => {
            const pricingMatch =
              (tool.pricing === "free" && checkedFilters.includes("free")) ||
              (tool.pricing !== "free" && checkedFilters.includes("paid"));
            const signupMatch =
              (tool.signup_required && checkedFilters.includes("signup")) ||
              (!tool.signup_required && checkedFilters.includes("no-signup"));
            return pricingMatch && signupMatch;
          });

          let html = "";
          filteredTools.forEach((tool) => {
            const pricingClass = tool.pricing === "free" ? "free" : "paid";
            const signupClass = tool.signup_required
              ? "signup-required"
              : "no-signup";

            const pricingText = tool.pricing
              ? tool.pricing.charAt(0).toUpperCase() + tool.pricing.slice(1)
              : "Unknown";
            const signupText = tool.signup_required
              ? "Signup Required"
              : "No Signup";

            html += `
              <div class="tool-item">
                <div class="tool-info">
                  <span class="tool-name">${tool.name}</span> | 
                  <span class="tool-desc">${tool.description}</span>
                </div>
                <div class="tool-buttons">
                  <span class="tool-btn ${pricingClass}">${pricingText}</span>
                  <span class="tool-btn ${signupClass}">${signupText}</span>
                  <a href="${tool.link}" target="_blank" class="tool-btn link-btn"><i class="fa-solid fa-link"></i></a>
                </div>
              </div>
            `;
          });

          container.innerHTML = html || "<p>No tools available.</p>";
        };

        renderTools();

        sortContainer.querySelectorAll(".filter-checkbox").forEach((cb) => {
          cb.addEventListener("change", renderTools);
        });
      } else {
        container.innerHTML = "<p>No tools available.</p>";
        sortContainer.innerHTML = "";
      }
    }

    document.querySelector(
      "#popupContent b"
    ).innerText = `Last update of this country: ${data.last_update}`;
  } catch (error) {
    console.error("Error loading tools:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const country = path.split("/").slice(-2, -1)[0];
  loadTools(country);

  document.getElementById("defaultOpen").click();
});
