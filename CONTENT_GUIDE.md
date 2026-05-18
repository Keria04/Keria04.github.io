# Content Guide

This site is set up so regular updates do not require changing layout code.

## Homepage

Edit `_data/home.yml`.

- `profile`: main introduction, avatar, and optional hero background image.
- `contact_links`: homepage Email/GitHub/ORCID links.
- `sections`: the cards that link to the main pages.
- `notes`: title, description, and empty-state text for the homepage Notes block and `/notes/`.
- `education`: timeline entries.
- `research_interests`: research cards.
- `interests`: personal interest cards.

To change the hero background, place an image in `images/` and set:

```yaml
background_image: "your-image.jpg"
```

Leave it empty to use the clean default background.

When `background_image` is set, the homepage shows it twice: as the hero background and as a clean full-width artwork band below the hero.

## Blog and Weekly Notes

Add Markdown files to `_posts/` using this filename format:

```text
YYYY-MM-DD-short-title.md
```

Each post should start with front matter:

```yaml
---
title: "Post Title"
date: 2026-05-17
categories:
  - weekly
tags:
  - research
excerpt: "One short summary."
---
```

The homepage automatically shows the latest three posts. The full list appears at `/notes/`. Both places read from `_posts/`, so adding or editing a post updates them together after GitHub Pages rebuilds.

You can copy `_drafts/weekly-note-template.md` when writing a weekly note. Rename the copy into `_posts/YYYY-MM-DD-title.md`.

## Section Pages

- `/education/` is generated from `education` and `research_interests` in `_data/home.yml`.
- `/interests/` is generated from `interests` in `_data/home.yml`.
- `/notes/`, `/publications/`, and `/cv/` are independent pages.

## Publications

Add one Markdown file per paper in `_publications/`:

```text
_publications/2026-paper-title.md
```

Use this front matter:

```yaml
---
title: "Paper Title"
authors: "Yile Cai, Coauthor Name"
venue: "Conference or Journal"
year: 2026
status: "Under review"
image: "/images/paper-thumbnail.jpg"
excerpt: "One or two sentences shown on the publication list."
abstract: "The abstract shown on the detail page."
paper_url: "https://example.com/paper.pdf"
code_url: "https://github.com/Keria04/project"
project_url: "https://example.com/project"
data_url:
slides_url:
---
```

Only links with values are shown. The homepage, `/publications/`, and the paper detail page update automatically.

You can copy `_drafts/publication-template.md` when adding a new publication.

## Appearance

The main homepage styles live in `_sass/layout/_home.scss`. Site-wide theme selection is in `_config.yml`:

```yaml
site_theme: "mint"
```

Available template themes include `default`, `air`, `sunrise`, `mint`, `dirt`, and `contrast`.
