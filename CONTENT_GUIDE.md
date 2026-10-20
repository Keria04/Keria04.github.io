# Content Guide

This site is set up so regular updates do not require changing layout code.

## Homepage

Edit `_data/home.yml`.

- `profile`: main introduction and optional hero background image. The avatar field is retained for future use.
- `hero_links`: the primary links below the introduction.
- `contact_links`: homepage Email/GitHub/ORCID links.
- `sections`: the editorial index linking to the main pages.
- `notes`: title, description, and empty-state text for the homepage Notes block and `/notes/`.
- `education`: timeline entries.
- `research_interests`: research cards.
- `interests`: personal interest cards.

To change the hero background, place an image in `images/` and set:

```yaml
background_image: "your-image.jpg"
```

Leave it empty to use the clean default background.

The homepage shows the artwork once, in the cover. On smaller screens, the introduction sits below the image. The current cover uses `Frieren_background_clean.png`; the original image is retained in `images/`.

The latest three notes appear immediately below the cover. Publications appear on the homepage automatically once `_publications/` contains entries.

## Research Notes

For a paper reading note, copy [`_drafts/paper-note-template.md`](_drafts/paper-note-template.md) into `_posts/` using this filename format:

```text
YYYY-MM-DD-short-title.md
```

Each post should start with front matter:

```yaml
---
title: "Paper Title"
date: 2026-10-20
categories:
  - paper-notes
tags:
  - notes
  - visual-reasoning
  - benchmarks
excerpt: "When does chart QA require visual reasoning beyond OCR? Notes on how ChartMuseum tests this distinction."
---
```

Replace the example title, date, topics, and excerpt with the actual note information:

- `date` is the note's first publication date, matching the filename, not the paper's publication year. Future-dated posts are not published by the current configuration.
- Use `categories: [paper-notes]` for notes produced from reading papers with the literature-learning workflow. Categories describe content types; tags describe research topics. This is currently the only published category. Add another category only when publishing a different content type.
- Paper notes use `/paper-notes/<slug>/` URLs. The ten existing notes have `redirect_from` entries for their former `/weekly/<slug>/` URLs. When updating a note, preserve its filename, date, current category, any explicit permalink, and all existing `redirect_from` entries. A new note does not need an old-URL redirect.
- Keep `notes` and add 2–4 useful topic tags. Reuse existing task, method, or subject tags from `/tags/`; avoid inventing a new spelling for an existing topic. The generic `notes` tag is retained but hidden from topic chips.
- Write an English `excerpt` that starts with a concrete question or task and explains why the paper is relevant. Aim for about 100–160 characters; the list truncates at 180 characters. Avoid generic descriptions such as "Note of reading X."
- The page displays `title` automatically. Start the body with the paper link and reading information; do not repeat the title as an H1.

### Writing and checking a note

1. Discuss the paper with AI in Chinese if preferred, keeping technical terms in English. Confirm your actual reading coverage and the personal explanations worth retaining.
2. Ask AI to organize the confirmed material into clear English. Preserve the paper's assumptions, conditions, uncertainty, and source locations. Do not infer that every section was read just because the full paper was provided to AI.
3. Use `Quick Reference`, `Problem`, `Core Idea`, `Method or Argument`, `Evidence and Results`, and `Limitations`. Add `Relation`, `My Learning Notes`, and `Open Questions` only when useful.
4. Keep paper content substantial enough to reconstruct its reasoning. Put each important claim together with its evidence, conditions, result, and source. Only include personal judgments or learning progress that you actually confirmed. A targeted reading note should clearly state its narrower scope.
5. Check the main mechanism, key evidence, scope of conclusions, and a few important English sentences against your understanding and the paper. Mark unverified details explicitly. Remove template instructions, placeholders, and unused sections.
6. Save the file in `_posts/` and publish through the usual GitHub workflow. Check the resulting page, including formulas, images, source links, and section navigation. Keep its link in Zotero.

### Finding and revisiting notes

The homepage shows the latest three posts. `/notes/` shows all notes and a topic overview; clicking a topic opens the corresponding group in `/tags/`. Both lists show each note's question-oriented excerpt and topic links. These are generated from `_posts/`, so ordinary updates require no layout edits.

Note pages automatically generate an expandable **On this page** menu from Markdown H2 and H3 headings when there are at least two. No `toc` field or manually maintained contents list is needed. JavaScript must be enabled for this menu; the note itself remains readable without it. Existing heading anchors are preserved. Use the menu to revisit the method, evidence, limitations, or your learning notes.

When comparing papers, start from the same question, then compare the method, evidence, conditions, and limitations. Update the original note when correcting an understanding. Old notes can be reorganized when you actually reuse them; there is no need to rewrite the archive at once.

The old `_drafts/weekly-note-template.md` is retained as a draft reference. Its category is intentionally empty; choose an appropriate content type if you later publish a weekly update. It does not create a second published category. The homepage and `/notes/` currently aggregate all published posts; `/categories/` groups them by content type.

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

Homepage-specific editorial styles live in `_sass/layout/_home-editorial.scss`; shared section and note styles remain in `_sass/layout/_home.scss`. The Instrument Serif display font is self-hosted in `assets/fonts/instrument-serif/`, alongside its license.

`assets/js/home-wind.js` adds red petals to the cover. Pointer movement creates a wind effect; a short tap also creates a breeze. Visitors can pause the petals with the cover button. Animation stops when the cover leaves the viewport or the tab is hidden. The system's reduced-motion preference switches the petals to a static display and disables entrance animations. The homepage remains readable without JavaScript.

The homepage supports light and dark mode with its own paper, ink, and red accent palette. Site-wide theme selection is in `_config.yml`:

```yaml
site_theme: "mint"
```

Available template themes include `default`, `air`, `sunrise`, `mint`, `dirt`, and `contrast`.
