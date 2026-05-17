# Content Guide

This site is set up so regular updates do not require changing layout code.

## Homepage

Edit `_data/home.yml`.

- `profile`: main introduction, avatar, and optional hero background image.
- `spotlight`: the three items shown near the top of the homepage.
- `sections`: the cards that link to the main pages.
- `education`: timeline entries.
- `research_interests`: research cards.
- `interests`: personal interest cards.

To change the hero background, place an image in `images/` and set:

```yaml
background_image: "your-image.jpg"
```

Leave it empty to use the clean default background.

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

The homepage automatically shows the latest three posts. The full list appears at `/notes/`.

## Section Pages

- `/education/` is generated from `education` and `research_interests` in `_data/home.yml`.
- `/interests/` is generated from `interests` in `_data/home.yml`.
- `/notes/`, `/publications/`, and `/cv/` are independent pages.

## Publications

Edit `_data/publications.yml`. Add a new item under `items`:

```yaml
items:
  - title: "Paper Title"
    authors: "Yile Cai, Coauthor Name"
    venue: "Conference or Journal"
    year: "2026"
    status: "Under review"
    links:
      - label: "PDF"
        url: "/files/paper.pdf"
      - label: "Code"
        url: "https://github.com/Keria04/project"
```

The homepage and `/publications/` page update automatically.

## Appearance

The main homepage styles live in `_sass/layout/_home.scss`. Site-wide theme selection is in `_config.yml`:

```yaml
site_theme: "mint"
```

Available template themes include `default`, `air`, `sunrise`, `mint`, `dirt`, and `contrast`.
