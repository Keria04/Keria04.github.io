---
title: "ChartMuseum: Testing Visual Reasoning Capabilities of Large Vision-Language Models"
date: 2026-06-8
categories:
  - weekly
tags:
  - notes
excerpt: "Note of reading the ChartMuseum."
---

[ChartMuseum: Testing Visual Reasoning Capabilities of Large Vision-Language Models 2025 NIPS](https://arxiv.org/abs/2505.13444)

## Overview
这篇论文主要是在质疑：现有的 ChartQA benchmark 是否真的在测试模型的 visual reasoning 能力。作者发现，很多数据集里的问题其实只需要 OCR 和文本推理即可完成，因此设计了一个新的 benchmark——CHARTMUSEUM，专门强调真正依赖视觉结构理解的 chart reasoning。论文通过 synthetic visual reasoning 实验和大量真实图表 benchmark 证明：当前 LVLM 在真正的 visual reasoning 上仍然明显弱于人类。

## Problem

Existing chart understanding benchmarks mainly evaluate OCR-based textual reasoning rather than genuine visual reasoning. Many ChartQA tasks can be solved by extracting explicit text from charts and performing language-based reasoning, arithmetic, or symbolic manipulation. As a result, frontier LVLMs already achieve near-saturated performance on several prior benchmarks, making them insufficient for evaluating true visual intelligence. The paper argues that current benchmarks under-evaluate visual reasoning capabilities and fail to expose the gap between human and model understanding of charts.

## Core Idea

The paper proposes CHARTMUSEUM, a human-curated benchmark designed to explicitly evaluate visual reasoning in chart understanding. The core idea is to separate visual reasoning from textual reasoning and construct questions that require interpretation of visual structures rather than OCR shortcuts.



To support this claim, the authors first introduce a synthetic visual reasoning testbed where charts contain no textual information and therefore cannot be solved via text extraction. They show that model performance degrades significantly as visual complexity increases, while human performance remains stable. Based on this observation, they construct CHARTMUSEUM using real-world charts and fully human-written questions emphasizing complex visual reasoning.



The benchmark categorizes questions into four reasoning types:

- Textual Reasoning
- Visual Reasoning
- Visual/Textual Reasoning
- Synthesis Reasoning



The paper further proposes a taxonomy of visual tasks:

- Symbol Selection
- Visual Comparison
- Trajectory Tracking
- X/Y Value Identification

This taxonomy is used to analyze model failures in a more fine-grained manner.

## Key Insight

The most important insight of the paper is that strong reasoning performance in LVLMs does not imply strong visual reasoning ability. Current models rely heavily on textual extraction and symbolic reasoning, but struggle when reasoning depends on visual relationships, spatial structure, trajectories, or perceptual comparison.



The synthetic experiments demonstrate that visual complexity severely affects LVLMs while humans remain robust, suggesting that current multimodal models lack stable abstract visual reasoning capabilities. Moreover, reasoning models with extended chain-of-thought provide only marginal improvements, indicating that the bottleneck lies in visual understanding itself rather than reasoning depth.



Another key insight is that benchmark design fundamentally shapes perceived model capability. Benchmarks allowing OCR shortcuts or template-style questions may overestimate multimodal reasoning ability. CHARTMUSEUM instead emphasizes objective, human-written, visually grounded questions that better expose model weaknesses.

## Weakness

Although the paper successfully diagnoses weaknesses of current LVLMs, several limitations remain.



First, the benchmark still follows the standard QA paradigm, reducing visual reasoning into short-answer generation. This limits evaluation of interactive, grounded, or procedural reasoning abilities.



Second, the human evaluation is relatively small-scale compared to the full benchmark size. In addition, the benchmark mainly focuses on static charts and does not cover interactive dashboards or exploratory visualization tasks.

## Relation

This work is positioned within the evolution of chart understanding benchmarks. Earlier datasets mainly relied on synthetic charts and template-generated questions, while later benchmarks such as ChartQA introduced real-world charts and human annotations. More recent datasets, including CharXiv and ChartQAPro, further increased realism and difficulty, but still suffer from limitations such as narrow data sources, insufficient differentiation between frontier models, or dependence on model-generated questions.



CHARTMUSEUM distinguishes itself by emphasizing human-written questions, diverse real-world chart sources, and explicit separation between textual and visual reasoning. Compared with previous benchmarks, it is designed less as a general ChartQA dataset and more as a diagnostic benchmark for analyzing the visual reasoning limitations of LVLMs.

## Others

One particularly important experiment in the paper is the analysis of prior chart understanding benchmarks, especially ChartQA. The authors extract only the explicit textual information from charts — including titles, labels, legends, and annotated values — and provide this extracted text to the model without giving the chart image itself. 



Surprisingly, Claude-3.7-Sonnet still achieves 74.1% accuracy on ChartQA using only extracted text, compared with 87.4% when given the full chart image. 



This experiment strongly supports the paper’s main claim: many existing ChartQA benchmarks contain relatively limited visual reasoning requirements, since models can answer most questions using textual information alone. CHARTMUSEUM is specifically designed to avoid this issue by emphasizing questions that require genuinely visual understanding.
