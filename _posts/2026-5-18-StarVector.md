---
title: "StarVector: Generating Scalable Vector Graphics Code From Images And Text"
date: 2026-05-18
categories:
  - weekly
tags:
  - notes
excerpt: "Note of reading the StarVector."
---

[StarVector: Generating Scalable Vector Graphics Code From Images And Text](https://arxiv.org/abs/2312.11556)(2025 CVPR)

## Problem

Traditional SVG generation and image vectorization methods mainly rely on curve/path fitting, which lacks semantic understanding and often produces overly complex SVG code with many redundant paths. Existing deep learning approaches also struggle to generalize to diverse SVG primitives beyond simple paths (e.g., circles, polygons, text). 

The paper aims to solve:

- How to generate semantically meaningful and compact SVG code from images or text.
- How to leverage SVG primitives directly instead of approximating everything with paths.

## Core Idea

- Treat SVG generation as a **multimodal code generation problem** instead of pure image reconstruction.

- Propose **StarVector**, a Multimodal Large Language Model (MLLM) that takes either:

  - raster images (Image-to-SVG), or
  - text instructions (Text-to-SVG),

  and autoregressively generates SVG code directly. 

- Use:

  - a vision encoder (CLIP / SigLIP ViT),
  - an adapter projecting visual tokens into the LLM space,
  - and a StarCoder-based LLM backbone for SVG code generation.  

- Construct:

  - **SVG-Stack**: a 2M-scale SVG dataset,
  - **SVG-Bench**: benchmark across Image-to-SVG, Text-to-SVG, and diagram generation tasks.  

- Introduce **DinoScore** as a perceptual metric better aligned with human preference than pixel-wise metrics such as MSE.  

## Key Insight

- SVG generation should not be viewed as merely “pixel reconstruction.”
   The key observation is that semantically correct primitive usage (e.g., `<circle>`, `<text>`) produces more meaningful and compact SVGs than approximating everything with `<path>`.  
- Their qualitative comparison is very convincing:
   traditional vectorization methods often achieve lower MSE but produce huge, messy SVGs, while StarVector produces cleaner semantic structures with far fewer tokens.  
- Another important insight:
   **human perception of SVG quality is poorly correlated with MSE**, especially for diagrams and structured graphics. DinoScore aligns much better with human judgments.  

## Weakness

-  complex SVGs still a problem

-  generation validity mainly relies on decoding heuristics and logit biasing.

## Relation

- Different from traditional vectorization:
   previous methods optimize curves in pixel space, while StarVector generates SVG code semantically.
- Related to:
  - multimodal large language models (Flamingo, LLaVA, GPT-4V),
  - code generation LLMs (StarCoder),
  - SVG generation works such as DeepSVG, Im2Vec, IconShop,
  - inverse rendering and structured visual generation.  

## Others
