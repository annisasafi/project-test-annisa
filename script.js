const apiUrl = "https://suitmedia-backend.suitdev.com/api/ideas";
const postGrid = document.getElementById("postGrid");
const pagination = document.getElementById("pagination");
const itemInfo = document.getElementById("itemInfo");
const pageSizeSelect = document.getElementById("pageSizeSelect");
const sortSelect = document.getElementById("sortSelect");

let currentPage = parseInt(localStorage.getItem("page") || 1);
let pageSize = parseInt(localStorage.getItem("pageSize") || 10);
let sortOrder = localStorage.getItem("sortOrder") || "-published_at";

pageSizeSelect.value = pageSize;
sortSelect.value = sortOrder;

// Fetch and render posts
async function fetchPosts() {
  const url = `${apiUrl}?page[number]=${currentPage}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sortOrder}`;
  const response = await fetch(url);
  const data = await response.json();

  renderPosts(data.data);
  renderPagination(data.meta);
  updateItemInfo(data.meta);

  // Simpan state
  localStorage.setItem("page", currentPage);
  localStorage.setItem("pageSize", pageSize);
  localStorage.setItem("sortOrder", sortOrder);
}

function renderPosts(posts) {
  postGrid.innerHTML = "";

  posts.forEach(post => {
    const title = post.title;
    const date = new Date(post.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const imageUrl = post.small_image?.url || "";

    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
      <div class="post-image">
        <img src="${imageUrl}" alt="${title}" loading="lazy" />
      </div>
      <div class="post-content">
        <div class="post-date">${date}</div>
        <div class="post-title">${title}</div>
      </div>
    `;

    postGrid.appendChild(card);
  });
}

function renderPagination(meta) {
  const totalPages = meta.last_page;
  let buttons = '';

  // Tombol pertama & sebelumnya
  buttons += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="1">«</button>`;
  buttons += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button ${i === currentPage ? 'class="active"' : ''} data-page="${i}">${i}</button>`;
  }

  // Tombol selanjutnya & terakhir
  buttons += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;
  buttons += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${totalPages}">»</button>`;

  pagination.innerHTML = buttons;

  document.querySelectorAll('#pagination button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      setQueryParam('page', currentPage);
      fetchPosts();
    });
  });
}

function updateItemInfo(meta) {
  const start = (meta.current_page - 1) * meta.per_page + 1;
  const end = Math.min(meta.total, start + meta.per_page - 1);
  itemInfo.textContent = `Showing ${start} - ${end} of ${meta.total}`;
}

// Dropdown event handlers
sortSelect.addEventListener("change", () => {
  sortOrder = sortSelect.value;
  currentPage = 1;
  fetchPosts();
});

pageSizeSelect.addEventListener("change", () => {
  pageSize = parseInt(pageSizeSelect.value);
  currentPage = 1;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchPosts();
});

// Initial load
fetchPosts();
