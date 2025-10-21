const API_KEY = "wLSTkl6IsaH8fbnfnB9chGoRmjlMAqQlYx1lD18X";
const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod";

const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const searchBtn = document.getElementById("searchBtn");
const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const factBox = document.getElementById("factBox");

const spaceFacts = [
  "There are more stars in the universe than grains of sand on Earth.",
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars are so dense that a teaspoon weighs billions of tons.",
  "Jupiter’s Great Red Spot is a storm that’s been raging for centuries.",
  "The footprints on the Moon will likely last millions of years."
];

function showRandomFact() {
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factBox.textContent = `🚀 Did you know? ${fact}`;
}
showRandomFact();

async function fetchAPOD(startDate, endDate) {
  const url = `${NASA_APOD_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.reverse() : [data];
}

async function loadGallery() {
  gallery.innerHTML = "";
  loading.style.display = "block";

  const startDate = startInput.value;
  const endDate = endInput.value;

  try {
    const photos = await fetchAPOD(startDate, endDate);
    loading.style.display = "none";

    photos.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("gallery-item");

      if (item.media_type === "image") {
        div.innerHTML = `<img src="${item.url}" alt="${item.title}"><h3>${item.title}</h3><p>${item.date}</p>`;
      } else {
        div.innerHTML = `<iframe src="${item.url.replace("watch?v=", "embed/")}" frameborder="0"></iframe><h3>${item.title}</h3><p>${item.date}</p>`;
      }

      div.addEventListener("click", () => openModal(item));
      gallery.appendChild(div);
    });
  } catch (err) {
    loading.textContent = `⚠ Error: ${err.message}`;
  }
}

function openModal(item) {
  modal.style.display = "flex";
  modalContent.innerHTML = `
    <span id="closeModal" style="cursor:pointer;float:right;font-size:28px;">&times;</span>
    <h2>${item.title}</h2>
    <p>${item.date}</p>
    ${
      item.media_type === "image"
        ? `<img src="${item.hdurl || item.url}" alt="${item.title}">`
        : `<iframe src="${item.url.replace("watch?v=", "embed/")}" frameborder="0"></iframe>`
    }
    <p>${item.explanation}</p>
  `;

  document.getElementById("closeModal").onclick = () => { modal.style.display = "none"; };
}

searchBtn.addEventListener("click", loadGallery);
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
window.addEventListener("DOMContentLoaded", loadGallery);
