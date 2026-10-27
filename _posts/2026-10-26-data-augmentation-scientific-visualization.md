---
title: "A Study of Data Augmentation for Learning-Driven Scientific Visualization"
date: "2026-10-26"
categories:
  - paper-notes
tags:
  - scientific-visualization
  - data-augmentation
excerpt: "When does 3D data augmentation help scientific visualization models? This study separates the effects of method, quantity, and diversity on two tasks."
---

**Paper:** [Original paper](https://doi.org/10.1109/TVCG.2025.3587685).

**Authors:** Jun Han, Hao Zheng, and Jun Tao.

**Year and venue:** 2025, *IEEE Transactions on Visualization and Computer Graphics* (TVCG), 31(10), 8981–8993. DOI: 10.1109/TVCG.2025.3587685.

**Version consulted:** The supplied 13-page IEEE journal PDF (October 2025 issue, pp. 8981–8993), containing Sections I–VI, Figs. 1–12, Tables I–IX, and Eq. (1). The authors refer to an additional appendix/supplementary material, but it was not included in the supplied file; its experiments and implementation details have not been checked.

**Reading coverage:** Full supplied paper, Sections I–VI (user-confirmed), including the presented figures and tables. The separately hosted supplementary material was not part of this reading.

## Quick Reference

**When to revisit:** When does 3D data augmentation help scientific visualization models, and which of method, quantity, or diversity matters?

**Key takeaway:** This study compares nine ways to augment 3D scientific volumes, then tests how augmentation method, amount, and diversity affect spatial super-resolution and ambient occlusion prediction. In the examined datasets, models, and training procedure, adding more synthetic data generally helps; greater within-dataset diversity helps the more challenging ambient occlusion task, while the choice or mixture of augmentation methods has a smaller effect.

**Where to look:** [Method or Argument](#method-or-argument) explains how data and supervised targets are constructed and how factors are controlled; [Evidence and Results](#evidence-and-results) traces the claims to comparisons; [Limitations](#limitations) records scope and measurement caveats; [My Learning Notes](#my-learning-notes) revisits metric interpretation and diversity/interaction. In the paper, start with **Figs. 1–2** (study design), **Fig. 3 and Table II** (synthetic-data quality and cost), **Figs. 4–6** (method comparisons), **Tables III–V** (quantity), **Eq. (1) and Tables VI–IX** (diversity), and **Fig. 12** (factor correlation analysis).

## Problem

Deep learning usually benefits from many varied training examples, but high-resolution scientific volumes are expensive to obtain because their underlying simulations can be computationally costly. A limited training set can therefore restrict learned scientific visualization methods. Data augmentation offers a way to produce additional volumes from available simulation data rather than running all the additional simulations (Section I).

Common image augmentations and generative models already exist, but their effectiveness for **learning-driven scientific visualization** had not been systematically compared in the setting investigated here. This paper does not introduce a single new augmentation algorithm or a new downstream architecture. Its contribution is an empirical study of whether different ways of producing additional *three-dimensional volumetric data* improve the downstream models that consume them (Sections I–II).

The authors formulate three questions (Section I):

1. **Q1 — Method:** Do different augmentation approaches lead to meaningfully different results on scientific visualization tasks?
2. **Q2 — Quantity:** How does the number of augmented training samples affect different downstream networks?
3. **Q3 — Diversity:** Does increased variety in augmented data improve generalization, and does it matter how that variety is introduced?

These questions are distinct. The *method* describes how synthetic samples are produced; *quantity* describes how many are available; *diversity* describes variation within the resulting augmented training data. A method that generates visually convincing volumes is not necessarily the one that yields the best downstream predictor.

## Core Idea

**Evaluate augmentation twice: first as generated data, then as training material for another task.** The direct evaluation compares original and augmented volumes or their rendered images. The indirect evaluation asks whether training with augmented volumes improves predictions on held-out scientific data. This separation is central: synthetic-data fidelity, generation cost, and downstream usefulness are related but not equivalent (Sections I, IV-A–IV-B).

The study varies three factors—**method, quantity, and diversity**—while testing two tasks with different input–output relationships:

- **Spatial super-resolution (SSR):** recover a high-resolution volume from a lower-resolution version of the same underlying scalar field.
- **Ambient occlusion prediction (AOP):** predict a volume of ambient occlusion (AO) values from a volume of opacities. Unlike SSR, the target describes a different property from the input.

Rather than assuming that more sophisticated generators must be better, the authors compare simple spatial transformations with trained generators and study how the generated data function in both tasks. They interpret the different effects of diversity in relation to the information gap between the input and output of each task (Sections III–IV-C).

## Method or Argument

### Volumetric datasets, splits, and experimental context

The study uses six scientific datasets: **combustion, half-cylinder, ionization, supernova, Tangaroa, and vortex**. They represent different fields or phenomena, including flow, ionization, and astronomical structures. Table I reports spatial dimensions and sample counts for each dataset; the datasets also have different variables (for example, combustion contains HR, MF, and VORT variables, while Tangaroa and vortex use vorticity). The reported spatial grids differ substantially in size (Table I; Section IV, *Experimental settings*).

The authors normalize data to **[-1, 1]** and report using **20% of the available data for training and 80% for evaluation**. Learning-based augmentation is implemented in PyTorch; training and inference use an NVIDIA 3090 Ti GPU with 24 GB of memory. These are the paper's experimental conditions, not general requirements of the techniques (Section IV; Table I).

The study's abstract formulation starts from an original training set of volumes and seeks an additional set with similar data patterns:

$$
\mathcal V=\{V_1,\ldots,V_N\},\qquad
\widehat{\mathcal V}=\{\widehat V_1,\ldots,\widehat V_M\}.
$$

Here, $$N$$ counts available original volumes and $$M$$ counts generated volumes. The augmented samples are used to help train downstream predictors, not treated as new measured or simulated ground truth (Section III; Fig. 2).

### Nine augmentation methods

The first five methods directly transform existing data. The last four train a model to generate new data (Section III; Fig. 3).

| Group | Method | How an additional volume is produced |
|---|---|---|
| Traditional | **Noise injection (NI)** | Add voxel-wise Gaussian noise; the specified distribution has mean $$0$$ and variance $$0.15$$. |
| Traditional | **Interpolation** | Linearly combine two volumes using a randomly chosen interpolation weight. |
| Traditional | **Scale** | Randomly resize the volume along its dimensions. |
| Traditional | **Flip** | Reverse voxel order along randomly chosen axes. |
| Traditional | **Rotation** | Rotate a volume through a randomly selected angle in a selected coordinate plane. |
| Learning-based | **Generative adversarial network (GAN)** | Jointly train a generator and discriminator, then generate volumes from random noise. |
| Learning-based | **Variational autoencoder (VAE)** | Learn a latent distribution with an encoder–decoder, then sample a latent vector and decode it into a volume. |
| Learning-based | **Diffusion model (DM)** | Learn to reverse successive noise additions and generate a volume through iterative denoising. |
| Learning-based | **Implicit neural representation (INR) with a hypernetwork** | Fit INRs to original volumes; train a hypernetwork to generate INR weights, then evaluate a newly parameterized INR to synthesize a volume. |

For the **INR augmentation**, the two stages matter. First, an INR is fitted to each training volume so that its parameters represent that volume. Second, a hypernetwork generates sets of INR weights from Gaussian noise; each predicted weight set can then define a new volumetric sample. In this paper, **INR is used for data generation**, not simply as a compression format (Section III, pp. 8983–8984). The text also reports a denoising schedule in the second stage; the full learning-based model configurations are deferred to the unavailable appendix.

### Direct evaluation: quality of synthesized data

The authors generate synthetic samples at **six times the training size** for direct comparisons (Section IV-A):

- **Kullback–Leibler (KL) divergence** compares the distributions of augmented and original data at the volume-data level. Lower is better.
- **Kernel Inception Distance (KID)** compares rendered-image feature distributions using an Inception network. Lower is better.
- **CLIP-IQA** compares rendered images with a predefined text prompt through pretrained image–text features. Higher is preferred in the paper's evaluation; the paper describes this score in terms of diversity, although the measure is introduced as image-quality assessment.
- **Training time and GPU memory** provide a cost comparison for the learning-based approaches (Table II).

KL can be affected by noise; KID and CLIP-IQA use feature extractors pretrained outside scientific-volume data. Thus these direct measures provide different, imperfect perspectives rather than a single definitive quality ranking (Section IV-A).

### Indirect evaluation: downstream input–output pairs

**SSR.** A generated high-resolution volume supplies a training target. The authors construct its low-resolution counterpart by bicubic resampling, and a network learns the low-to-high-resolution mapping:

$$
V_{\mathrm{LR}}\longrightarrow \widehat V_{\mathrm{HR}}.
$$

The compared downstream models are **SSR-TVD, ESPCN, and SRGAN**. Synthetic data are used for **200 epochs of pretraining**, followed by **300 epochs of fine-tuning on original data**. The reported learning rate is $$10^{-4}$$ with multistep decay. The method-comparison experiments use a **spatial upscaling factor of four** (Section IV-B; Figs. 4–5).

**AOP.** Before supervision can be constructed, a **transfer function** converts each scalar volume into an **opacity volume**. A local AO algorithm (the paper's reference [21]) produces the corresponding target **AO volume**. A predictor learns:

$$
V_{\mathrm{opacity}}\longrightarrow \widehat V_{\mathrm{AO}}.
$$

The downstream networks are **V2V, U-Net, and DVAO**. They receive **200 epochs of pretraining on augmented data** and **400 epochs of fine-tuning on original data**; the reported learning rate is $$10^{-5}$$ with multistep decay (Section IV-B).

This paired-target construction explains why unconditional synthetic volumes can train these two tasks. It does **not** supply labels such as time, viewpoint, or ensemble parameters. The authors therefore exclude coordinate-conditioned networks such as **CoordNet** from their downstream architectures in this study: those models require a meaningful relation between a volume and the conditioning coordinates, which unconditional augmentation does not preserve (Section IV-B, p. 8986). This does not exclude all INRs from all downstream tasks.

### Downstream evaluation metrics

The downstream metrics examine different levels of agreement with ground truth (GT) (Section IV-B, pp. 8985–8986):

| Measure | Comparison | Preferred direction | Main interpretation |
|---|---|---|---|
| **Peak signal-to-noise ratio (PSNR)** | Predicted versus GT voxel values | Higher | Numerical reconstruction accuracy; computed from squared error. |
| **DreamSim** | Features of images rendered from predicted and GT volumes | Lower | Similarity of learned visual features, including sensitivity to shape and position changes. |
| **Chamfer distance (CD)** | Isosurfaces extracted from predicted and GT volumes at matched isovalues | Lower | Spatial proximity of the reconstructed 3D geometry. |

DreamSim computes a cosine distance between concatenated features from **CLIP, DINO, and OpenCLIP** backbones. CD compares spatial distances using an L2 norm; interpretation depends on the selected isovalue and extracted surfaces. The authors report all three measures for SSR, and mainly PSNR and DreamSim for AOP. A visually plausible rendering is not proof of low voxel error or accurate isosurface geometry.

The paper calls PSNR and CD insensitive to noisy data and notes that DreamSim relies on models pretrained on natural images. The noise statement should not be read as literal immunity: because PSNR is based on mean squared error, changes to voxel values can alter its score. The paper does not develop a formal noise-robustness analysis for these metrics in this passage.

### Factor-controlled comparisons

The experimental variables are organized as follows (Sections IV-B–IV-D; Fig. 2):

1. **Method (Q1):** Keep the amount of synthetic training data the same and change which of the nine augmentation methods produces it. Compare the resulting SSR and AOP models, including an unaugmented baseline.
2. **Quantity (Q2):** Use **INR** as the main generator and compare no augmentation against **2×, 4×, and 6× added synthetic samples relative to the original training count**. These labels are not the total-size multiplier: for example, Table III lists 20 original samples plus 40, 80, or 120 synthetic samples, respectively.
3. **Single-domain diversity (Q3, first setting):** Keep the augmentation method (**interpolation**) and the number of generated samples fixed, but produce them using **10%, 50%, or 100% of the available original training samples**. The baseline uses no synthetic augmentation. This changes the source-sample coverage, not the generated set's size.
4. **Cross-domain diversity (Q3, second setting):** Combine synthetic data from different augmentation methods. The paper compares mixtures within learning-based methods, within common transformations, and across the two families (Tables VIII–IX). Here **cross-domain means mixing augmentation methods**, not combining scientific fields such as combustion and astronomy.

For diversity comparisons, the paper defines a score based on inverse average **structural similarity (SSIM)** between rendered images:

$$
D=\left(\frac{1}{n(n-1)/2}
\sum_{i=1}^{n}\sum_{j=i+1}^{n}
\operatorname{SSIM}(I_i,I_j)\right)^{-1}.
$$

Here $$n$$ is the number of samples, and $$I_i$$ is the image rendered from sample $$i$$. A lower mean pairwise SSIM gives a higher diversity score. This is **Eq. (1)**, a quantitative definition; it should be kept distinct from how each diversity condition is constructed.

## Evidence and Results

### 1. Are the generated volumes equally faithful and equally costly?

**Question and design:** Compare all nine methods directly on multiple scientific datasets, using rendered examples, KL divergence, KID, CLIP-IQA, and training cost. **Fig. 3** visualizes the supernova case, while **Table II** reports measurements for combustion (HR), half-cylinder (VM), and supernova (Section IV-A).

**Paper finding:** The rendering examples favor **flip, scale, rotation, and INR** for structural appearance. The authors describe noise injection as blurring or damaging features, interpolation as sometimes creating artificial patterns, VAE and diffusion as oversmoothing features, and GAN as inadequately capturing structures in the illustrated case. **Flip and rotation** have the best KL values on two of three datasets; **scale** performs best on KID. CLIP-IQA rankings depend on both dataset and approach. Among learned generators, **DM takes the longest to train**, **VAE the shortest**, and **INR uses the least reported memory** (Table II).

**Scope:** These measures establish differences in synthetic-data appearance, measured distribution similarity, and implementation cost under the reported setup. They do **not** establish that the highest-fidelity generator necessarily improves a downstream network the most.

### 2. Does the augmentation method substantially change downstream performance?

**Question and design:** Train the same three SSR architectures and the same three AOP architectures with equally sized synthetic datasets made by different augmentation methods; compare against training without augmentation. SSR is evaluated with PSNR, DreamSim, and CD; AOP with PSNR and DreamSim (**Figs. 4–6**, Section IV-B.1).

**Paper finding:** In SSR, PSNR differences among augmentation methods are reported as **less than 1 dB** in the comparison, with similar DreamSim and CD scores across methods. AOP likewise shows no substantial separation between augmentation methods in the reported PSNR and DreamSim results. At the same time, the unaugmented baseline is often worse, so “method has a minor role” must **not** be confused with “augmentation provides no benefit.”

**Author interpretation:** Different methods capture enough structural information to give the network a useful pretrained starting point; subsequent fine-tuning on original data may reduce differences between the initial synthetic distributions.

**Scope:** Method choice has a relatively small effect **among the tested methods, datasets, downstream models, and pretrain/fine-tune schedules**. It is not a claim that arbitrary generators or tasks are interchangeable.

### 3. How much does adding more synthetic data help?

**Question and design:** Use INR-generated data at no augmentation and 2×, 4×, or 6× the original training count in additional synthetic samples. Examine SSR volume and isosurface renderings (**Figs. 7–8; Tables III–IV**) and AOP renderings (**Figs. 9–10; Table V**), alongside PSNR, DreamSim, and, for SSR, CD (Section IV-B.2).

**Paper finding:** More synthetic data generally improves reconstructed structures and scores. The authors report average improvements of approximately **5% in PSNR, 30% in DreamSim, and 22% in CD for SSR**, and approximately **6% in PSNR and 30% in DreamSim for AOP** across their evaluated conditions. In this reporting, improvement in DreamSim or CD means a **lower distance**, not a higher score. Visual examples include reduced noise effects and improved isosurface features.

**Author interpretation:** Synthetic data can approximate some patterns of unseen samples and help the network learn more useful representations. The improvement shows **diminishing returns**: gains from moving from 4× to 6× augmentation become small (p. 8989, analysis following Table V).

**Scope:** These are reported averages for the selected datasets, architectures, and **INR-based quantity experiment**. The data support benefits from increasing the synthetic sample count over the tested range, not indefinite gains from arbitrarily large synthetic datasets.

### 4. Which type of diversity helps, and are the factor trends stable across methods?

**Single-domain diversity — design and result:** With **interpolation** and the generated set size fixed, use progressively more original training samples to produce synthetic data. For **SSR**, increased diversity has no substantial effect on the reported PSNR and DreamSim scores (**Table VI**). For **AOP**, performance improves as source-sample coverage increases; the authors report average improvements of about **7% in PSNR and 20% in DreamSim**, with supporting rendered examples (**Table VII; Fig. 11**; Section IV-C.1).

**Author interpretation:** The SSR input already shares substantial information with its high-resolution target, whereas converting opacity into AO involves a larger input–output information gap. More varied training pairs can therefore help the latter task more. This explanation is offered by the authors; the tables primarily establish the task-specific empirical pattern.

**Cross-domain diversity — design and result:** Mix samples generated by different methods rather than broadening the original-sample coverage through a fixed method. For both SSR and AOP, the evaluated combinations yield **negligible or no significant improvements** (**Tables VIII–IX**; Section IV-C.2). The authors suggest that mixing methods may introduce inconsistent synthetic distributions and complicate optimization. That mechanism is an interpretation, not a separately demonstrated cause of the measured outcome.

**Method interactions — design and result:** The authors repeat the quantity test using **noise injection, scale, and INR** on ionization (H+) for SSR with SSR-TVD, and repeat the single-domain diversity test using **interpolation, DM, and INR** on vortex for AOP with V2V. PSNR follows similar increasing trends across methods (**Fig. 12a–b**, Section IV-D). The authors describe the method factor as independent of quantity and diversity.

**Scope:** Fig. 12 shows that the observed trends are **similar across the selected methods and configurations**. Similar plotted trends alone do not strictly establish statistical independence or the absence of interaction in untested architectures, datasets, or metrics. The figure does not directly test **quantity × diversity** interaction; its diversity comparison concerns **single-domain diversity**.

## Limitations

**Paper-stated limitations and boundaries:**

- **Computational cost of 3D generation:** Learning-based augmentation for 3D volumes faces expensive convolutional operations. The paper contrasts this with the broader availability of pretrained generative models for ordinary images (Section V).
- **Restricted downstream task scope:** The experiments concern unconditional augmentation for **SSR and AOP**, not every scientific visualization task. The authors suggest potential transfer to other spatial-structure tasks, but the reported experiments do not test those applications (Section V).
- **Missing temporal conditioning:** The studied unconditional generators do not create sequences with guaranteed temporal consistency. The authors therefore identify tasks such as **temporal super-resolution** as unsuitable for this augmentation setup without further changes (Section V; also Section IV-B on CoordNet).
- **Metric limitations:** KL is sensitive to noisy data; KID, CLIP-IQA, and DreamSim rely on image feature models not trained specifically for scientific volumes. Consequently, their measurements may miss scientific properties important to downstream interpretation (Sections IV-A–IV-B).
- **Diminishing gains:** Quantity improvements taper at the high end of the tested augmentation range. The authors propose data distillation as a future direction for retaining useful training information with fewer synthetic samples (Sections IV-B.2 and VI).

**Verification boundary:** Some generator configurations and additional qualitative results are assigned to the paper's supplementary appendix, which was not supplied. This note does not treat those missing details as verified.

## Relation

**Related paper:** [*SSR-TVD: Spatial Super-Resolution for Time-Varying Data Analysis and Visualization*](https://doi.org/10.1109/TVCG.2020.3032123) (Han and Wang, 2022; reference [15] here).

**Shared task and comparable condition:** Both concern spatial super-resolution of scientific volumetric data; this study explicitly uses **SSR-TVD as one of its downstream network architectures**. Their reported experimental designs are not otherwise identical.

**Key difference and why it matters:** SSR-TVD develops a network and training objective for recovering high-resolution time-varying volumes, with spatial and temporal learning signals. The present study instead asks how changing the *training data* through augmentation affects SSR-TVD and other networks. Thus, a result that different augmentation methods perform similarly is about **data preparation under this study's training protocol**, not evidence that the original SSR-TVD architecture or temporal-coherence design is unnecessary.

## My Learning Notes

### Why compare PSNR, DreamSim, and Chamfer distance instead of choosing one metric?

**Paper content:** These metrics test distinct aspects of a reconstructed scientific volume: **PSNR** measures voxel-value agreement, **DreamSim** measures similarity between rendered-image features, and **CD** measures proximity between isosurfaces. Their directions differ: higher PSNR is better, while lower DreamSim and CD are better (Section IV-B; Figs. 4–6). [The detailed measurement setup is above](#downstream-evaluation-metrics).

**Additional explanation:** Consider a reconstructed vortex. Its scalar values can be close to GT on average while a small but important structure has shifted. PSNR can indicate the overall numerical error; DreamSim may reflect the visible shift in a chosen rendering; and CD can test whether the extracted isosurface is geometrically close. This is an illustrative example, not a separate experiment in the paper. The three scores should be interpreted together rather than treated as interchangeable definitions of “quality.”

**Interpretive caution:** The paper says PSNR and CD are insensitive to noisy data, but that does not imply mathematical immunity to noise. PSNR depends on squared prediction error, so perturbing data values can change it. DreamSim, meanwhile, uses backbones pretrained on natural images, so a low DreamSim distance may not capture every scientifically important difference. The paper does not establish a universal noise-robustness guarantee for these metrics.

### What distinguishes single-domain from cross-domain diversity, and what does Figure 12 show about factor independence?

**Paper content:** In **single-domain diversity**, the generated set size and augmentation method are held fixed while **10%, 50%, or 100% of original training examples** are made available as sources; interpolation is the main method. In **cross-domain diversity**, the study mixes samples from different augmentation methods. “Domain” in this latter experiment refers to augmentation-method groupings, **not to different scientific application domains** (Section IV-C; Eq. (1); Tables VI–IX). [The controlled setups are detailed above](#factor-controlled-comparisons).

**Additional explanation:** These interventions change different things. Increasing source-sample coverage gives the same generator access to more distinct original patterns; mixing generators changes how samples are transformed or synthesized. Neither intervention automatically guarantees a downstream improvement. The paper's observed SSR/AOP differences follow from its specific comparisons, not from a general rule that diversity is always beneficial.

**Interpretation to verify, not a proven identity:** Fig. 12 presents similar PSNR trends for different methods when quantity or single-domain diversity increases. This supports a limited conclusion that those trends are relatively stable under the tested methods and tasks. **It does not by itself prove formal statistical independence** between factors. That stronger conclusion would require a clearly specified independence or interaction criterion and broader evidence than trend similarity alone (Section IV-D; Fig. 12).

**Application check:** Not performed; the decision was to defer testing rather than infer mastery from the discussion.
