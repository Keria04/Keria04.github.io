---
title: "DL4SciVis: A State-of-the-Art Survey on Deep Learning for Scientific Visualization"
date: "2026-10-20"
categories:
  - paper-notes
tags:
  - survey
  - scientific-visualization
  - deep-learning
excerpt: "Which deep-learning approaches address scientific visualization tasks, and where are the gaps? This survey classifies 59 studies across six dimensions."
---

**Paper:** [Original paper](https://arxiv.org/abs/2204.06504v1)

**Authors:** Chaoli Wang and Jun Han.

**Year and venue:** 2023, TVCG.

**Version consulted:** 2022 arXiv v1.

**Reading coverage:** Sections 1–6, including Conclusions.

## Quick Reference

**When to revisit:** When I need to classify DL approaches to scientific visualization by research task, method, and evidence, or identify research gaps.

**Key takeaway:** This survey selects 59 representative deep-learning-for-scientific-visualization studies and organizes them by data setting, task, learning type, architecture, loss, and evaluation. Within that 2022 sample, work is concentrated in scalar-field data, data generation, supervised learning, and CNN-based designs; the authors use those patterns to suggest further opportunities and challenges, not to establish a complete ranking of the field.

**Where to look:** [Survey scope and taxonomy](#method-or-argument) explains how papers were selected and compared; [evidence and results](#evidence-and-results) separates counts and classifications from the authors' explanations; [limitations](#limitations) gives the boundaries of the conclusions. In the original PDF, revisit **Table 1** (papers, tasks, settings), **Tables 4–8** (model inputs/outputs), **Figure 1 and Table 9** (learning types), **Figure 2 and Table 10** (architectures), and **Tables 11–12** (losses and metrics).

## Problem

Artificial intelligence and visualization (AI+VIS) had become an active research intersection by the time of this survey. The paper distinguishes **AI4VIS**, which designs AI methods to address visualization problems, from **VIS4AI**, which uses visualization to help explain or analyze AI. Earlier AI+VIS surveys mainly covered visual analytics (VA) and information visualization (InfoVis), leaving a less systematic overview of **deep learning for scientific visualization (DL4SciVis)**. The question here is not whether deep learning can perform a particular SciVis task, but **what problems have been addressed, with what technical choices, and where does the surveyed literature leave gaps?** (Section 1.)

SciVis presents a distinctive combination of data and visualization requirements. Scalar and vector fields are often three-dimensional, time-dependent, or multivariate. The displayed result may require an explicit mapping and rendering stage: scalar values can be mapped to colors and opacities through a **transfer function** for direct volume rendering, or used to extract isosurfaces; vector fields can be traced into streamlines and stream surfaces using seeds. These representations are not simply interchangeable with ordinary images or closed geometric models. Flow surfaces can also carry physical attributes that matter to their interpretation. Thus, successes in computer vision (CV) and computer graphics (CG) provide useful starting points but do not automatically solve SciVis-specific problems (Section 1).

The authors aim to provide a task-oriented account of this emerging body of work and a common vocabulary for comparing designs and evaluations. This is **a literature synthesis, not a new network, dataset, controlled benchmark, or meta-analysis** (Sections 1–2, 6).

## Core Idea

**Use the research task as the main route through the literature, then compare each study along five further dimensions: domain setting, learning type, network architecture, loss function, and evaluation metric.** The task-centered organization makes the practical purpose of each deep-learning model visible before discussing its implementation. The other dimensions reveal recurrent choices—such as CNNs for grid-like volumes, graph networks for relational structures, and task-specific losses—and combinations that were underrepresented in the collected papers (Section 3).

Two design decisions make this more useful than a catalog of network names. First, a work can qualify when deep learning solves a **critical intermediate step** toward a SciVis objective, even if the model does not produce the final visualization or analysis result. Second, the survey compares **what is being represented and measured**, not merely whether a paper uses a familiar architecture or loss. The authors turn these observations into proposed opportunities in Section 4 and broader research challenges in Section 5. The explanation for *why* a category is sparse is frequently an author interpretation rather than a tested causal conclusion.

## Method or Argument

### Corpus construction and inclusion rules

The authors began with familiar visualization papers and searched DBLP, scanning **six visualization journals** and **three visualization conferences** (VIS, EuroVis, and PacificVis, with their specified paper categories). They searched paper titles using terms such as *deep*, *learning*, *neural*, *convolution*, *generative*, *adversarial*, *recurrent*, *CNN*, *RNN*, and *GAN*, then examined abstracts, introductions, and conclusions to decide relevance. They supplemented this set with more recent work from active researchers' pages and open repositories such as arXiv (Section 2).

The key inclusion test was whether a **deep neural network (DNN) addressed a SciVis problem**, directly or through a consequential intermediate step. The survey excludes non-deep machine learning, predominantly VA/InfoVis papers, and work considered closer to generic CV/CG than SciVis, including work primarily about point clouds and mesh geometry. It concentrates on scalar and vector fields, while adding selected fluid-simulation works because of their connection to flow visualization. For borderline work, the authors consider whether it appeared in a visualization venue **or** significantly influenced SciVis. The resulting set has **59 papers**, explicitly described as *representative rather than exhaustive*. This judgment-based boundary matters when using subsequent counts (Section 2; Table 1).

### The organizing map: data setting and research task

**Domain setting** means the underlying kind of scientific data or application, **not necessarily the tensor fed to the network**. The five settings are **scalar field, vector field, fluid simulation, particle, and image**. For example, Berger et al. [12] study scalar-volume rendering, while the model takes a viewpoint and transfer function rather than the entire scalar volume as its direct input. Some works span scalar and vector settings. Table 1 orders papers primarily by task, secondarily by setting, and then by publication year within a group (Sections 3.1–3.2).

The five **research tasks** are the main thread of Section 3.2. **Tables 4–8 list inference-stage inputs and outputs where applicable**, which is essential for identifying what the DL component actually does:

| Research task | Immediate DL purpose and typical output | Representative studies and downstream context |
| --- | --- | --- |
| **Data generation** | Produce or reconstruct scientific fields, models, or values. Subtasks are **super-resolution**, **compression and reconstruction**, **translation**, and **extrapolation**. | STNet [55] jointly synthesizes spatiotemporally super-resolved volumes; neurcomp [109] learns a coordinate-to-scalar-value representation for compression; Scalar2Vec [46] translates scalar fields to vector fields; LSP [163] predicts future fluid states. |
| **Visualization generation** | Synthesize rendering results or rendering-related high-resolution maps, often conditioned on view, transfer function, simulation parameters, or low-resolution rendered inputs. | Berger et al. [12] synthesize volume renderings conditioned on viewpoint and transfer function; InSituNet [63] generates images for parameter-space exploration; Weiss et al. [159] upsample isosurface rendering maps. |
| **Prediction** | Estimate data-related values, labels, positions, access behavior, or visualization-related parameters and scores. The forecast itself may serve another task. | Tkachev et al. [143] predict future local voxel values to flag regions with unusual errors; Hong et al. [71] predict data access patterns for particle tracing; Yang et al. [169] estimate viewpoint quality; DVAO [35] predicts ambient-occlusion volumes. |
| **Object detection and segmentation** | Detect, classify, or delineate features; outputs include hard/soft labels, masks, and regional classifications. | VC-Net [154] combines 3D volume and 2D maximum-intensity-projection (MIP) information to segment vessels; vortex-focused works [31, 11, 81] identify or segment vortical structures. |
| **Feature learning and extraction** | Learn useful representations, vectors, surface/node features, or feature positions for subsequent analysis. | FlowNet [48] learns streamline/surface representations for clustering and representative selection; SurfNet [52] learns surface features with a graph convolutional network; S4 [144] learns local spatiotemporal similarity. |

**How these tasks differ:** In data-generation super-resolution, the target may be a **higher-resolution 3D field** that still needs visualization. In visualization-generation super-resolution, the target is a **rendering image or related rendering maps**, not the underlying field (Tables 4–5). Prediction need not mean forecasting future time: it may estimate class likelihood, a viewpoint score, a reference-frame transformation, or an ambient-occlusion volume (Table 6). Feature extraction can be instrumental to a final goal such as finding representative streamlines without directly performing that final selection (Section 3.2.5).

### Learning type and architecture: two separate design axes

The survey's **learning-type taxonomy** distinguishes supervised, weakly supervised, semi-supervised, and unsupervised approaches. Under its unsupervised branch, **Figure 1** places *distributed*, *disentangled*, and *self-supervised* learning; it further distinguishes generative and contrastive self-supervision. The authors describe a common self-supervised route as learning representations on a pretext task from unlabeled data, then using them for a downstream task with a smaller labeled set. In **Table 9**, supervised learning dominates generation, prediction, and detection/segmentation; feature learning spans more learning types. The surveyed self-supervised examples [26, 120, 144] use contrastive rather than generative objectives (Section 3.3). **Terminology caution:** these are the authors' categories. Here *distributed learning* refers to learned, multi-layer data representations, **not distributed training across machines**; the Figure 1 hierarchy should not be assumed to be universal across ML literature.

**Network operation/connection** and **network structure** are distinct classification axes (Figure 2; Table 10):

| Axis | Types | Functional meaning in this survey |
| --- | --- | --- |
| **Operation / connection** | **CNN**, **MLP**, **RNN**, **GNN**, or combinations | CNNs apply convolutions to grid-like data such as images or volumes; MLPs use fully connected layers; RNNs model sequences (including LSTM variants); GNNs use graph connectivity and neighborhood relations, including GCNs on irregular structures. |
| **Structure** | **Encoder**, **decoder**, **encoder + decoder** | An encoder obtains a feature representation or estimated information; a decoder generates data or renderings from its input; a combined structure can learn representations and reconstruct or transform outputs. |

Thus **“CNN” and “encoder–decoder” describe different properties of the same model**. An autoencoder jointly trains an encoder and decoder to recover its input from a latent representation, whereas an encoder–decoder can also implement super-resolution or translation. GANs add a generator–discriminator training design; they are not a mutually exclusive alternative to a CNN operation type. One discriminative-network study [62] is not a GAN despite using a discriminator-like model (Section 3.4). The four surveyed GNN-related works [52, 64, 65, 131] use GCNs (Table 10).

### Training objectives and evaluation criteria

**Section 3.5 / Table 11** distinguishes five **loss optimization target levels**: **data**, **image**, **feature**, **probability**, and **parameter**. The common loss forms are **L1 / mean absolute error (MAE)**, **L2 / mean squared error (MSE)**, **binary cross-entropy (BCE)**, **Wasserstein**, and task-specific **others** (including cross-entropy, Dice, cosine-based distance, structural similarity, and contrastive objectives). L1 weights absolute deviations linearly; L2 squares them and therefore emphasizes large residuals. BCE is natural for binary class probabilities and some adversarial objectives. Wasserstein-based objectives compare distributions through an optimal-transport perspective. A *streamline*, *temporal*, *content*, or *cycle* loss is a task-level name; its underlying arithmetic may still be L1 or L2. More than half of the surveyed studies use multiple terms to constrain different aspects of output quality.

**Section 3.6 / Table 12** distinguishes **six evaluation levels**, which are not identical to the five loss-target levels:

| Evaluation level | What it checks | Examples in Table 12 |
| --- | --- | --- |
| **Data** | Raw reconstructed or predicted data values, directions, or compression effectiveness | PSNR, compression ratio (CR), average angle difference (AAD), RMSE |
| **Image** | Similarity of produced visualization images to reference images | SSIM, PSNR, LPIPS, FID, EMD |
| **Feature** | Similarity of derived scientific structures, shapes, or feature properties | Isosurface similarity (IS), mean closest-point distance (MCPD), Hausdorff distance (HD), critical-point position error |
| **Probability** | Classification, segmentation, or likelihood-related performance | F-score, precision/PPV, recall/TPR, intersection over union (IoU), false-positive rate |
| **Physics** | Fidelity of physics-related quantities | Kinetic energy, power spectra, vorticity error, wall-shear-stress error |
| **Human** | Agreement with ratings or choices made by human subjects | Mean opinion score (MOS), viewpoint-related error and matching measures |

The choice of metric must follow the **scientific question**, not the name of a network. A low field-wise MSE or high PSNR does not by itself establish that the derived flow lines, physical quantities, or visual interpretation are preserved. Conversely, an image-level score does not directly test the original field's numerical fidelity. Metrics may be reused across levels because the level depends on **what is compared**: MSE can compare voxels or derived features. The survey also notes qualitative visual results, comparisons with prior DL/non-DL approaches, and frequent training/inference time reporting; Table 12 is only the **quantitative-metric** perspective (Section 3.6).

### How the authors derive research opportunities

**Section 4** identifies gaps by reading the observed task, setting, learning-type, and architecture distributions together. These are **author-proposed directions**, not tested claims that adopting one technique will improve SciVis results:

1. **Single field → multiple fields.** Move beyond individually treated scalar/vector and time-varying fields to multivariate, tensor, and multi-run/ensemble data, including relations across variables and runs. Density-to-velocity translation [27] illustrates a cross-field mapping; the authors look to CV image translation and colorization for design ideas.
2. **Data generation → visualization generation.** Explore rendering itself, including the challenge of combining viewpoint, transfer function, and lighting inputs. Neural and differentiable rendering from CG are suggested as possible routes.
3. **Images/volumes → graphs.** Use graphs to encode scientific surfaces and relations such as topology, correlation, and transitions; investigate graph architectures beyond the surveyed GCN uses.
4. **Supervised → self-supervised.** Reduce dependence on costly annotations by learning reusable representations with pretext tasks; investigate the connection to downstream tasks and underexplored generative self-supervision.
5. **CNN/RNN → MLP and newer mechanisms.** Explore pure MLP approaches and possibilities such as transformers and implicit neural representations, rather than treating commonly used CNN/RNN designs as the only options.
6. **Distributed → disentangled learning and style transfer.** Test whether meaningful and interpretable *content* and *style* factors can be separated for scientific fields; the authors' vortex-pattern/Reynolds-number example is **hypothetical**, not an established physical factorization.
7. **Heavyweight → lightweight.** Explore weight quantization, pruning, knowledge distillation, and efficient architectures to address model size and training/inference cost.
8. **Centralized → federated.** Explore collaborating across locally trained models where scientific data cannot readily be shared; the paper proposes methods, not a guarantee of privacy or success on SciVis tasks.
9. **Data-driven → physics-informed.** Combine learned data mappings with physical information and governing laws. Some fluid-simulation studies considered physical quantities, but the authors describe them as having *some flavor* of physics-informed learning, not as equivalent to a common physics-informed-network framework.

### How the authors frame the open challenges

**Section 5** moves from underrepresented approaches to barriers to reliable use:

- **Model generalization:** Move beyond a “one training for one dataset” practice; adapting to genuinely unseen data is harder than changing variables or runs within the same simulation. Augmentation, pretraining, and connection designs are discussed as possible tools.
- **Benchmark datasets:** Build shared, sufficiently varied scientific datasets for comparable and reproducible research. The survey points to ScalarFlow [33] and a 2D fluid dataset [76] as encouraging examples, while recognizing the difficulty of collecting scientific data.
- **Few-shot learning:** Use prior knowledge to adapt with few labeled examples. The unresolved questions are which prior information transfers and how to use it effectively.
- **Multi-task learning:** Share information among related tasks rather than train a separate network for each; task definition, grouping, interference, and non-supervised use remain difficult.
- **Interpretable DL:** Move beyond black-box output to understanding and potentially controlling which learned components drive a result, especially when output violates constraints.
- **Automated ML:** Reduce manually intensive feature engineering, model/algorithm choice, and evaluation; neural architecture search raises its own search-space and cost questions.

The **Conclusion (Section 6)** restates the 59-paper, six-dimension contribution while acknowledging practical issues of outlier robustness, cross-dataset generalization, and real-world applicability. It places DL4SciVis within the broader AI4VIS / VIS4AI intersection rather than claiming that the survey establishes a universal solution.

## Evidence and Results

### Claim 1: A task-centered six-dimensional map can organize the selected DL4SciVis literature

**Question and basis:** Can a representative set of SciVis-focused deep-learning papers be organized into a navigable comparison? The authors apply the Section 2 eligibility rules to construct **59 papers**, ordered by task and setting in **Table 1**, with task-specific input/output tables (**Tables 4–8**) and cross-cutting tables for learning, architecture, loss, and evaluation (**Tables 9–12**).

**Result:** The six dimensions make it possible to ask separately what the DL component predicts or generates, what source data it addresses, how it is trained, and what its outcomes are measured against (Sections 2–3). Tables 4–8 are especially important because they expose intermediate DL outputs that otherwise might be mistaken for final research objectives.

**What this supports:** A structured overview **of this selected corpus** and a way to locate related work. It does **not** establish exhaustive coverage, unbiased incidence rates for all SciVis research, or an experimental comparison of the 59 methods.

### Claim 2: Task and data coverage are uneven in the 2022 sample

**Question and basis:** Which problem areas dominate the selected literature? **Table 1** and Sections **3.1, 3.2.6** classify the selected papers and compare category occupancy.

**Paper finding:** More than half of the papers deal with scalar-field settings and more than a quarter with vector-field settings; comparatively few address multivariate or ensemble data (Sections 3.1, 4). **Data generation** has substantially more papers than **visualization generation**; within data generation, **super-resolution** has more entries than compression/reconstruction, translation, or extrapolation (Section 3.2.6). The six visualization-generation studies in **Table 5** concern direct volume rendering or isosurface rendering, in the scope of this corpus (Section 3.2.2).

**Author interpretation:** The authors reason that data super-resolution resembles familiar CV tasks, while visualization generation must incorporate heterogeneous rendering parameters and extrapolation is inherently harder than interpolation. These are **explanations and hypotheses**, not controlled tests establishing why research counts differ. The proposed opportunity to expand multi-field tasks and visualization generation follows from the observed gaps, not from an experimental proof that those directions will outperform current methods (Sections 3.2.6, 4).

### Claim 3: Supervised learning and convolution-based architectures dominate the collected implementations

**Question and basis:** What training paradigms and architectures recur across tasks? **Figure 1 and Table 9** classify learning types; **Figure 2 and Table 10** classify network operations and structures; **Table 11** maps optimization targets and losses.

**Paper finding:** Supervised learning dominates the four categories of data generation, visualization generation, prediction, and object detection/segmentation. Feature learning uses more varied learning types, including unsupervised representation learning and contrastive self-supervision. In the survey's classification, visualization-generation papers are **all supervised**, and the three self-supervised examples [26, 120, 144] use contrastive learning (Section 3.3). CNN is the most frequent operation type, followed by CNN+MLP; encoder+decoder is the most common structural family. All four surveyed GNN examples use GCN. **L1 and L2 are the most common loss forms**, and more than half of the selected studies combine multiple loss terms (Sections 3.4–3.5).

**What this supports:** These are **usage patterns** under the authors' coding rules. They do not establish that the most common architecture or loss is the most accurate, or that unrepresented learning types are technically unsuitable for SciVis. The authors explicitly convert the gaps into proposals for GNN alternatives, self-supervised learning, disentangled representations, and lightweight models (Section 4).

### Claim 4: Evaluation concentrates on numerical and derived-feature agreement more than physics or human assessment

**Question and basis:** What evidence is used to judge DL4SciVis outputs? **Section 3.6 and Table 12** group quantitative metrics into data, image, feature, probability, physics, and human levels. The opening of Section 3.6 also checks whether papers present qualitative comparisons or quantitative metrics.

**Paper finding:** Every surveyed paper presents qualitative visualization results; many also report comparisons with DL/non-DL methods and runtime. The authors identify **six works** without quantitative metrics in their survey ([52, 62, 103, 120, 162, 168]). Of the quantitative categories, **data-level** metrics are used most, followed by feature, probability, and image, while **physics** and **human** metrics are least represented. **PSNR, SSIM, IS/MSE, and F-score** are respectively prominent in the data, image, feature, and probability levels. Some papers, including [2, 27, 47, 51], combine metrics from different levels (Section 3.6; Table 12).

**Author interpretation and boundary:** The authors link low physics-metric coverage to limited physics-informed SciVis work, and low human-metric coverage to a limited set of human-level quantitative measures. This suggests a need for broader evaluation, but **does not prove** that particular models are physically incorrect or unsuitable for users. Numerical scores, rendered-image resemblance, physical fidelity, human judgments, and execution time evaluate different properties; none is a substitute for all the others.

### Selected work-level numbers are illustrations, not a common benchmark

Individual surveyed papers report strong results **under their own designs and experimental conditions**, including neurcomp [109] reporting a compression ratio above **1,000×** with important features preserved (Section 3.2.1), and SurfNet [52] reporting **10–20× faster training per epoch**, **70–170× faster inference**, and **300–1,300× model reduction** relative to FlowNet [48] (Section 3.2.5). The survey relays these claims; it does not re-run the models under a common protocol. These numbers illustrate potential benefits of different representations, **not a field-wide speed or compression guarantee**.

## Limitations

**Paper-stated limitations and scope:**

- **Representative, not exhaustive:** The authors explicitly say the 59-paper collection is not exhaustive. Title-keyword search, venue selection, subsequent additions, and judgment-based SciVis relevance rules shape the corpus (Section 2). Counts describe this sample.
- **Deliberate topic boundary:** The work prioritizes scalar/vector field problems and generally excludes work primarily about mesh geometry, point clouds, or generic CV/CG. Selected fluid-simulation papers are included because of their relation to flow visualization. Consequently, it is not a comprehensive survey of deep learning for all scientific computing, meshes, or geometric representations (Abstract; Section 2).
- **Evidence is primarily cross-paper classification:** The survey organizes published methods and reports their original results; it does not supply a controlled benchmark or normalize all papers to a common dataset, metric, or runtime configuration (Sections 2–3). The authors discuss shortages of public scientific benchmarks in Section 5.
- **Time-specific conclusions:** The consulted literature and the forward-looking statements reflect the **April 2022** version. The absence or rarity of a category in that sample must not be presented as its absence from later DL4SciVis research.
- **Unresolved barriers acknowledged by the authors:** Generalization across datasets, robustness to outliers, and real-world applicability remain practical issues even as more methods become available (Sections 5–6).
