# Basic Book Tracker

A front-end-only book tracker made with HTML, CSS, JavaScript, and Bootstrap.

## Pages

- `index.html`: Displays sample library books and calculated statistics.
- `add-book.html`: Searches the Open Library Search API and displays results as cards.

## Running the site

Because the site calls an external API, run it through a local development server instead of opening the HTML file directly.

### VS Code Live Server

1. Open the `book-tracker` folder in VS Code.
2. Install the Live Server extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

### Python

From inside the folder, run:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Current limitations

- The homepage library search is intentionally nonfunctional.
- The Add to Library buttons are intentionally disabled.
- The custom book modal is only a visual placeholder.
- There is no backend, local storage, or database.
