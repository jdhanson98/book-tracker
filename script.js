const sampleBooks = [
  {
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
    status: "Read",
    rating: 5,
    year: 1937,
    cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg"
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    status: "Reading",
    rating: null,
    year: 1965,
    cover: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg"
  },
  {
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    status: "Want to Read",
    rating: null,
    year: 2010,
    cover: "https://covers.openlibrary.org/b/isbn/9780765326355-L.jpg"
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    status: "Read",
    rating: 4,
    year: 2021,
    cover: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderLibrary();
  setupLibrarySearchPlaceholder();
  setupOpenLibrarySearch();
});

function renderLibrary() {
  const libraryContainer = document.getElementById("library-books");
  const statsContainer = document.getElementById("stats-container");

  if (!libraryContainer || !statsContainer) return;

  const readBooks = sampleBooks.filter((book) => book.status === "Read");
  const ratedBooks = sampleBooks.filter((book) => Number.isFinite(book.rating));
  const averageRating = ratedBooks.length
    ? (ratedBooks.reduce((total, book) => total + book.rating, 0) / ratedBooks.length).toFixed(1)
    : "—";

  const stats = [
    { label: "Total books", value: sampleBooks.length },
    { label: "Books read", value: readBooks.length },
    { label: "Currently reading", value: sampleBooks.filter((book) => book.status === "Reading").length },
    { label: "Average rating", value: averageRating === "—" ? averageRating : `${averageRating} / 5` }
  ];

  statsContainer.innerHTML = stats.map((stat) => `
    <div class="col-6 col-lg-3">
      <div class="card stat-card shadow-sm h-100">
        <div class="card-body">
          <div class="stat-value">${escapeHtml(String(stat.value))}</div>
          <div class="text-secondary">${escapeHtml(stat.label)}</div>
        </div>
      </div>
    </div>
  `).join("");

  libraryContainer.innerHTML = sampleBooks.map((book) => `
    <div class="col-sm-6 col-lg-3">
      <article class="card book-card border-0 shadow-sm">
        <div class="book-cover-wrap">
          <img class="book-cover" src="${book.cover}" alt="Cover of ${escapeHtml(book.title)}" loading="lazy">
        </div>
        <div class="card-body d-flex flex-column">
          <span class="badge ${statusBadgeClass(book.status)} align-self-start mb-2">${escapeHtml(book.status)}</span>
          <h3 class="h5 book-title">${escapeHtml(book.title)}</h3>
          <p class="text-secondary mb-2">${escapeHtml(book.author)}</p>
          <p class="small text-secondary mb-2">First published: ${book.year}</p>
          <p class="mt-auto mb-0 fw-semibold">${book.rating ? `${"★".repeat(book.rating)}${"☆".repeat(5 - book.rating)}` : "Not rated"}</p>
        </div>
      </article>
    </div>
  `).join("");
}

function setupLibrarySearchPlaceholder() {
  const form = document.getElementById("library-search-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

function setupOpenLibrarySearch() {
  const form = document.getElementById("book-search-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = document.getElementById("book-title");
    const button = document.getElementById("search-button");
    const message = document.getElementById("search-message");
    const resultsContainer = document.getElementById("search-results");
    const title = input.value.trim();

    if (!title) return;

    button.disabled = true;
    button.textContent = "Searching...";
    message.innerHTML = '<div class="alert alert-info mb-0">Searching Open Library...</div>';
    resultsContainer.innerHTML = "";

    try {
      const fields = [
        "key",
        "title",
        "author_name",
        "first_publish_year",
        "edition_count",
        "cover_i",
        "isbn",
        "language"
      ].join(",");

      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=12&fields=${fields}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Open Library returned status ${response.status}.`);
      }

      const data = await response.json();
      const books = Array.isArray(data.docs) ? data.docs : [];

      if (books.length === 0) {
        message.innerHTML = '<div class="alert alert-warning mb-0">No matching books were found. Try a shorter or different title.</div>';
        return;
      }

      message.innerHTML = `<div class="alert alert-success mb-0">Showing ${books.length} result${books.length === 1 ? "" : "s"}.</div>`;
      resultsContainer.innerHTML = books.map(createSearchResultCard).join("");
    } catch (error) {
      console.error(error);
      message.innerHTML = '<div class="alert alert-danger mb-0">The search could not be completed. Check your internet connection and try again.</div>';
    } finally {
      button.disabled = false;
      button.textContent = "Search";
    }
  });
}

function createSearchResultCard(book) {
  const title = book.title || "Untitled";
  const authors = Array.isArray(book.author_name) && book.author_name.length
    ? book.author_name.slice(0, 3).join(", ")
    : "Unknown author";
  const year = book.first_publish_year || "Unknown";
  const editionCount = book.edition_count || "Unknown";
  const languageCount = Array.isArray(book.language) ? book.language.length : 0;
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
    : "";

  const coverMarkup = coverUrl
    ? `<img class="book-cover" src="${coverUrl}" alt="Cover of ${escapeHtml(title)}" loading="lazy">`
    : `<div class="book-cover-placeholder"><div class="display-4 mb-2">📚</div><span>No cover available</span></div>`;

  return `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <article class="card book-card border-0 shadow-sm">
        <div class="book-cover-wrap">${coverMarkup}</div>
        <div class="card-body d-flex flex-column">
          <h3 class="h5 book-title">${escapeHtml(title)}</h3>
          <p class="text-secondary">${escapeHtml(authors)}</p>
          <ul class="list-unstyled metadata-list text-secondary mb-4">
            <li><strong>First published:</strong> ${escapeHtml(String(year))}</li>
            <li><strong>Editions:</strong> ${escapeHtml(String(editionCount))}</li>
            <li><strong>Languages listed:</strong> ${languageCount}</li>
          </ul>
          <button class="btn btn-primary mt-auto" type="button" disabled>Add to library</button>
        </div>
      </article>
    </div>
  `;
}

function statusBadgeClass(status) {
  if (status === "Read") return "text-bg-success";
  if (status === "Reading") return "text-bg-primary";
  return "text-bg-secondary";
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  })[character]);
}
