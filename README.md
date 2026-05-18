# Yile Cai Personal Homepage

This repository hosts the source for [https://Keria04.github.io](https://Keria04.github.io).

The site is built with Jekyll and GitHub Pages. Most routine content updates are data or Markdown edits rather than layout changes.

## Common Updates

- Homepage text and section cards: edit `_data/home.yml`.
- Education and interests: edit the corresponding sections in `_data/home.yml`.
- Blog or weekly notes: add Markdown files to `_posts/`.
- Publication entries: add Markdown files to `_publications/`.
- CV placeholder or future CV content: edit `_pages/cv.md`.
- Writing templates: copy files from `_drafts/`.

See `CONTENT_GUIDE.md` for the exact formats.

## Local Preview

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`.

## Deploy

Push changes to `master`; GitHub Pages deploys the site automatically.
