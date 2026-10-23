---
title: "Compressive Neural Representations of Volumetric Scalar Fields"
date: "2026-10-23"
categories:
  - paper-notes
tags:
  - scientific-visualization
  - data-compression
  - implicit-neural-representations
excerpt: "How can a small neural field compress volumetric scalar data while preserving gradients? NeurComp tests quantized SIRENs and reconstruction quality."
---

**Paper:** [Original paper, arXiv v1](https://arxiv.org/abs/2104.04523v1) · [Published version](https://doi.org/10.1111/cgf.14295)

**Authors:** Yuzhe Lu, Kairong Jiang, Joshua A. Levine, and Matthew Berger.

**Year and venue:** 2021, Eurographics Conference on Visualization (EuroVis); *Computer Graphics Forum*, 40(3), 135–146.

**Version consulted:** The supplied 12-page PDF marked arXiv:2104.04523v1 (11 April 2021). Section, equation, figure, and table references below refer to that PDF. No separate appendix or supplementary material was included.

**Reading coverage:** Full paper, Sections 1–5 (user-confirmed), including the presented figures and tables. The reference list was available in the PDF; no separately hosted supplementary material was reviewed.

## Quick Reference

**When to revisit:** How can a small neural field compress volumetric scalar data while preserving gradients?

**Key takeaway:** NeurComp treats compression as fitting a coordinate-to-scalar function with fewer parameters than the original volume has samples, then compresses the learned weights. In the reported simulations, it generally offers a better compression–reconstruction trade-off than TTHRESH, especially at high compression ratios, while training cost and noisy inputs remain important limitations.

**Where to look:** [Method or Argument](#method-or-argument) for the representation, architecture, quantization, and gradient loss; [Evidence and Results](#evidence-and-results) for comparative tests; [My Learning Notes](#my-learning-notes) for three selected concepts. In the PDF, revisit **Fig. 2 and Eqs. (1)–(3)** (pipeline and objectives), **Figs. 3–4** (architecture and quantization), **Fig. 8** (3D compression), **Table 1 and Figs. 5, 13** (gradient and isosurface behavior), and **Fig. 14** (training time).

## Problem

Large numerical simulations and scientific measurements produce **volumetric scalar fields**: sampled values such as pressure, temperature, or mixture fraction on a 3D grid, sometimes repeated over time. High spatial and temporal resolutions make storage, transfer, access, and interactive visualization difficult. The paper seeks **lossy compression** that retains useful field structure while reducing storage, rather than exact recovery of every sample (Section 1).

Traditional volume compressors often transform the sampled data into coefficients using discrete cosine or wavelet transforms, tensor decompositions, or related representations. Compression follows when many coefficients can be discarded or quantized with limited reconstruction error. Their effectiveness depends partly on how well the data match the representation's assumptions. Other compressors use prediction or data fitting, such as the methods reviewed under ISABELA, SZ, and NURBS (Section 2.1). The important background distinction is that a transform does not itself remove information: it makes a representation available in which a subset of coefficients may be encoded more compactly.

Meanwhile, deep learning had been used for volume visualization, super-resolution, shape representation, and implicit field modeling, but many of those systems were not designed to **minimize storage for a given volume**. Implicit neural representations suggested a different approach: use a network as the field representation itself, rather than as a generic model that merely processes or renders a separately stored field (Section 2.2).

The paper therefore asks whether a **coordinate-based multilayer perceptron (MLP)** can represent arbitrary sampled scalar fields compactly, how its architecture and numerical precision should be chosen under a storage budget, and whether such a representation can preserve gradients, handle time-varying fields, and support on-demand visualization (Sections 1–3).

## Core Idea

Learn a function that maps a spatial (or spatiotemporal) coordinate to one scalar value. The trained **network parameters**, rather than the original grid of samples, become the compressed representation. A small network limits the number of stored parameters; **weight quantization** then reduces the number of bits devoted to most of those parameters. Decompression is function evaluation at requested positions (Figs. 1–2).

This combines data fitting with a learned, continuous field representation. Unlike a fixed transform with predetermined basis functions, the network's parameters are optimized for the supplied volume. Unlike a general-purpose pretrained compressor, **the method trains a separate representation for the particular field being compressed**. Compared with the paper's tensor-decomposition baseline TTHRESH, it uses a learned coordinate function and can explicitly include spatial-gradient agreement in its training objective. These choices offer flexible reconstruction, but require substantial per-volume optimization (Sections 2, 3, and 5).

## Method or Argument

### Field representation and compression budget

The input is a regular-grid scalar field represented as a $d$-dimensional tensor:

$$
X\in\mathbb{R}^{s_1\times s_2\times\cdots\times s_d},
\qquad C=\prod_{j=1}^{d}s_j.
$$

Here $s_j$ is the sample count along dimension $j$, and $C$ is the total number of sampled scalar values. A sample has integer index $\mathbf i=(i_1,\ldots,i_d)$, original value $X[\mathbf i]$, and corresponding real-valued domain coordinate $\mathbf p_i\in\mathbb R^d$. The index locates a stored grid sample; the coordinate is the network input. In 3D, $d=3$; for a time-varying field, the authors can use $d=4$ with time as an additional coordinate (Section 3, Fig. 2).

The model is a learned function and parameter vector:

$$
f_{\Theta}:\mathbb R^d\rightarrow\mathbb R,
\qquad \Theta\in\mathbb R^m,
\qquad f_{\Theta}(\mathbf p_i)\approx X[\mathbf i].
$$

The basic compression condition is $m<C$: fewer learned parameters than original samples. If each were stored at the same precision, the idealized sample-count-to-weight-count ratio would be $C/m$. Actual file size also depends on quantization, unquantized parameters, cluster centers, and representation overhead; thus $C/m$ is **not automatically the final compression ratio** (Sections 3 and 3.1.1).

### Encoding: fit the sampled scalar field

The neural **encoder** is the optimization process that learns $\Theta$ for one volume. Its starting objective is the squared error at sampled locations (Eq. (1)):

$$
\min_{\Theta}\sum_{\mathbf i}
\left(f_{\Theta}(\mathbf p_i)-X[\mathbf i]\right)^2.
$$

Training uses randomly selected minibatches of grid samples and gradient-based optimization. The experiments use Adam; the authors choose a learning rate based on network size, decrease it during training, and use batches of roughly 16K–64K sampled points as GPU memory permits (Section 4, Implementation Details). This is **function approximation under a model-size budget**, not lossless coding. At sufficient compression, some reconstruction error is expected.

### SIREN architecture and residual blocks

The authors build on **SIREN**, a fully connected implicit neural representation with sinusoidal activations and a carefully designed initialization. Sine activations make the represented function differentiable to arbitrary order, which becomes useful when fitting gradients. The initialization is intended to maintain useful activation statistics across layers (Section 3.1).

Two main design inputs are the layer count $l$ and target number of weights $m$. A common hidden width $k$ is derived so that the matrices collectively use approximately the desired budget; the authors report little benefit from varying the widths across intermediate layers. At fixed weight budget, making the model deeper does not always improve accuracy and can make training harder (Fig. 3).

To improve depth robustness, the authors adapt residual connections to keep activations in the range expected for their SIREN-based design. Suppressing bias terms as in the paper, one residual block is (Eq. (2)):

$$
\mathbf a_{i+1}=\frac12\left[\mathbf a_i+
\sin\!\left(\mathbf M^{2}_{i+1}
\sin(\mathbf M^{1}_{i+1}\mathbf a_i)\right)\right].
$$

The skip path carries the preceding activation; the sine branch contains two learnable layers. The factor $1/2$ averages the two paths rather than directly adding them, helping keep the output bounded in $[-1,1]$ when both inputs are in that range. The experiments generally use **eight residual blocks**, each counted as two layers (Section 3.1; Fig. 3). This bounding property should not be mistaken for a proof that every trained layer retains an exact theoretical activation distribution.

### Weight quantization: reduce bits per parameter

After fitting the network, the authors quantize the large **intermediate weight matrices**, but leave the first and last weight matrices at higher precision because those small matrices were empirically sensitive to quantization (Section 3.1.1; Fig. 2). The weight histograms in Fig. 4(a)–(c), shown for trained layers of the *ionization* volume, are approximately zero-mean and bell-shaped, with deeper layers more concentrated near zero. This is an **empirical observation about learned weights**, not a proof that SIREN's activation distribution forces normally distributed trained weights.

For each intermediate layer separately, $k$-means clusters its weights into $2^b$ groups. Each weight is stored as a **$b$-bit index** identifying a cluster center; the floating-point cluster centers are stored as well. Thus **9-bit quantization uses 512 centers** per quantized layer. These indexes approximate the weight values; the scheme is not simply removing all small weights (Section 3.1.1).

Choosing $b$ also changes the affordable network size. With roughly fixed compressed storage, more bits **per weight** require **fewer weights**. Lower $b$ allows a larger but coarsely quantized model; higher $b$ allows more precise weights in a smaller model. Fig. 4(d) compares these options and supports **9 bits as a practical trade-off in the tested configuration**, not a universal optimum. A simplified relation is $m\,b\approx\text{index-bit budget}$, but the true stored size must account for other parameters and cluster centers.

### Optional gradient regularization

Accurate scalar values at grid samples do not imply accurate spatial derivatives between them. To preserve first-order field behavior, the authors can add a gradient loss (Eq. (3)):

$$
\min_{\Theta}\sum_{\mathbf i}\left[
\left(f_{\Theta}(\mathbf p_i)-X[\mathbf i]\right)^2
+\lambda\left\|\nabla f_{\Theta}(\mathbf p_i)-X'[\mathbf i]\right\|_2^2
\right],\qquad \lambda=0.05.
$$

Here $X'[\mathbf i]$ denotes the target gradient, either supplied with the field or estimated numerically; $\nabla f_{\Theta}$ is obtained by differentiating the continuous network function. The paper uses **central differences** to estimate target gradients in the reported jet and *rt* tests. The authors warn that such estimates may be unreliable for noisy sources such as some medical images. Sine activations make differentiation convenient, but **do not by themselves guarantee correct gradients**; the additional loss explicitly encourages agreement (Section 3.1.2).

This matters for isosurfaces because the local gradient is perpendicular to a regular level surface. A small-amplitude, high-frequency error in scalar values can create disproportionately large errors in gradient direction and visibly noisy isosurfaces; gradient agreement addresses a different aspect of reconstruction fidelity than scalar PSNR alone.

### Decoding, random access, and direct rendering

The **decoder** evaluates $f_{\Theta}$ at grid locations to reconstruct the original sampling grid, or at arbitrary real-valued coordinates without reconstructing the entire volume first (Section 3.2; Fig. 2). For direct neural volume rendering, a ray marcher evaluates the network at positions along viewing rays. The renderer can also differentiate the network at those positions and normalize nonzero gradients for illumination and shading (Fig. 6).

The paper treats good-looking direct renderings as evidence **suggesting** reasonable behavior between sampled locations: the model appears to act as an interpolant, not only a memorizer of supplied grid values. Rendering quality does **not** establish exact off-grid accuracy or a formal guarantee against overfitting.

## Evidence and Results

### Compression quality against TTHRESH on 3D fields

**Question and conditions.** Does a quantized coordinate network offer a stronger compression–error trade-off than a competitive multidimensional volume compressor? The authors compare **NeurComp** with **TTHRESH**, a tensor-decomposition method, on seven 3D scalar volumes (including *jet*, *ionization*, *isotropic_p*, *magnetic*, *mhd_p*, *mhd_bx*, and *rt*). Inputs are float32 simulation fields of different grid sizes (Table 2). The main comparison varies compression ratio and reports **peak signal-to-noise ratio (PSNR)** for field reconstruction; higher PSNR means lower normalized reconstruction error. **Gradient regularization is not used in these Fig. 8 comparisons** (Section 4.1).

**Paper finding.** NeurComp has higher PSNR over much of the tested range, with an exception for *jet* at low compression ratios. The authors report larger gains at higher compression ratios (Fig. 8). Fig. 1 illustrates *jet* at **175:1, PSNR 62.9**, and **1,307:1, PSNR 45.9**; the figure supports visual preservation of predominant features at those two settings, not lossless preservation.

**Visual evidence and scope.** For magnetohydrodynamic fields, Fig. 9 shows smoother reconstructed features and retention of structures selected by the transfer function. For *rt*, Fig. 10 compares results with approximately matched PSNR and shows fewer conspicuous high-frequency artifacts in NeurComp; the authors report a smaller compressed representation in those examples. These are dataset- and rendering-dependent observations, not a guarantee that smoother output always preserves every scientifically meaningful detail (Section 4.1).

### Why residual blocks and 9-bit weights were chosen

**Question and conditions.** With roughly fixed weight count $m=C/50$, how does increasing depth affect reconstruction, and do residual connections make depth choices more robust? Fig. 3 tests two volumes (*asteroid* and *ionization*) over multiple network depths, with unquantized and 8-bit-quantized variants.

**Paper finding.** Non-residual networks eventually lose PSNR as depth increases, and their preferred depth differs by volume. The residual design is more stable across depths and generally improves PSNR in these tests. Quantization produces a modest, **volume-dependent** reduction in performance; the *ionization* volume is notably sensitive (Section 3.1; Fig. 3).

**Further budget test.** Fig. 4(d) holds approximate *compressed network size* constant while increasing quantization bit-width and decreasing the number of weights. The authors select **9 bits** as a balance between numerical precision and representational capacity. Fig. 4(a)–(c) supplies weight-distribution observations motivating per-layer clustering, rather than a theoretical guarantee of quantization effectiveness (Section 3.1.1).

### Gradient fidelity and isosurface behavior

**Question and conditions.** Does adding a gradient term improve spatial derivatives without sacrificing much scalar-value fidelity? In the *jet* experiment, the two networks have the same **677:1 compression ratio** and are trained with or without gradient regularization. The target gradient is estimated by central differencing the original grid. The authors evaluate (i) scalar PSNR, (ii) **FD-Grad PSNR** from central differences of the reconstructed grid, and (iii) **Net-Grad PSNR** from differentiating the continuous network (Section 3.1.2; Table 1).

| Jet metric (PSNR) | Without gradient loss | With gradient loss |
| --- | ---: | ---: |
| Scalar field | 51.8 | 51.6 |
| FD-Grad | 52.0 | 54.7 |
| Net-Grad | 50.3 | 55.5 |

**Paper finding.** Gradient fitting slightly reduces scalar PSNR but improves both gradient metrics, especially direct network-gradient fidelity; the isosurfaces in Fig. 5 contain fewer erroneous high-frequency details. The numerical target remains an **estimated** gradient, not an independently measured exact physical derivative.

**Comparison with TTHRESH.** On *rt*, gradient-regularized NeurComp yields **545:1 compression, scalar PSNR 47.9, gradient PSNR 50.7**; TTHRESH yields **258:1, scalar PSNR 47.6, gradient PSNR 46.6** (Table 3; Section 4.4). Fig. 13 shows smoother NeurComp isosurfaces at comparable scalar PSNR. These results support the usefulness of gradient-aware fitting in the presented test, but the **compression ratios are not identical**; the comparison does not isolate every contributing design choice.

### Time variation, spatial scale, and continuous access

**Time-varying data.** By using four input coordinates instead of three, the authors fit *asteroid* (10 time steps) and *isabel* (12 time steps) as **4D volumes**, and compare them with 4D TTHRESH across three compression settings (Table 2; Section 4.2; Fig. 11). NeurComp performs better for the reported *asteroid* sequence. For *isabel*, the methods are closer at lower compression, while NeurComp has larger advantages at higher compression levels. The methods' ratios differ slightly, so the curves are not comparisons at exactly identical file sizes. This experiment establishes performance over **the selected time steps of these sequences**, not generalization to unrelated simulations.

**Spatial resolution.** Fig. 12 compares a $512^3$ *isotropic_p* volume with **centered $256^3$ and $128^3$ crops**. The authors hold $C/m$ at selected values (50, 100, 150, 200) and use 9-bit intermediate weights. Larger crops achieve better PSNR in these tests, even though they may attain higher effective compression ratios due partly to the amortized cost of cluster centers (Section 4.3). The experiment compares **different-sized spatial crops**, not multiple sampling densities of the *same* physical subregion; absolute network parameter count also changes with $C$. Its evidence therefore supports the observed scaling behavior under this design, rather than proving that denser sampling alone causes better compression.

**Continuous evaluation.** Fig. 6 demonstrates direct ray-marched rendering, with and without gradient-based illumination. This is evidence of an additional use of the representation, not a timing benchmark showing that neural rendering is faster than conventional volume rendering. The authors describe rendering quality as *suggestive* evidence of plausible interpolation (Section 3.2).

## Limitations

**Paper-stated limitations (Section 5):**

- **High per-volume training cost.** Training can require hours for large volumes. Fig. 14 reports timings on one NVIDIA V100 GPU with 16 GB memory. Higher compression ratios can train faster because they use smaller networks; the authors also note that comparable PSNR may be reached in roughly two-thirds of the reported time. This does not remove the practical encoding cost. Multiresolution and spatially localized training are proposed as future directions, not tested solutions here.
- **Limited generalization across volumes.** Each learned function is tailored to a specific input volume. This specialization may help approximation quality but typically requires retraining for a new volume. Encoding multiple time steps of one simulation as a 4D field does not establish transfer to unrelated simulations. Support for multiple coupled fields or varying simulation parameters is prospective.
- **Difficulty preserving noisy data.** On noisy volumes, especially some medical images, the network may retain predominant features but fail to preserve the noise itself. Fig. 15 shows a foot dataset at **25:1 compression and PSNR 35**; it is an illustration of retained shape, not proof that all image details survive. Noise can also make finite-difference gradient targets unreliable, limiting gradient regularization.

**Scope of proposed extensions:** Higher-order derivative constraints, improved gradient estimators, and physics-related differential expressions are discussed as opportunities (Section 5). The reported experiments demonstrate a first-order gradient loss; they do not validate arbitrary physics preservation. This is a boundary of the evidence, not an additional limitation the authors claim to have experimentally established.

## Relation

- **[TTHRESH: Tensor Compression for Multidimensional Visual Data](https://doi.org/10.1109/TVCG.2019.2904063)** (Ballester-Ripoll, Lindstrom, and Pajarola). Both target lossy compression of multidimensional regularly sampled scientific data, and this paper directly compares their PSNR–compression behavior on the same test volumes. TTHRESH uses a tensor-decomposition representation and coefficient coding, whereas NeurComp fits and quantizes a coordinate network. The comparison is useful when deciding how much a learned field representation gains over a strong transform/decomposition baseline **at the tested error and compression ranges** (Sections 2.1 and 4.1–4.2).
- **[Implicit Neural Representations with Periodic Activation Functions](https://arxiv.org/abs/2006.09661)** (Sitzmann et al., SIREN). Both use sinusoidal coordinate-based networks to represent continuous signals and their derivatives. SIREN supplies the activation and initialization ideas; NeurComp adapts that design with residual blocks and weight quantization **for a storage-constrained scalar-field compression task**, plus an optional gradient-fitting objective (Sections 2.2 and 3.1). These papers are methodologically connected; the paper does not present a direct compression benchmark against the original SIREN work.

## My Learning Notes

### How are SIREN activation statistics related to the distribution of its learned weights?

**Paper finding:** The trained intermediate-layer weights shown in Fig. 4(a)–(c) are approximately zero-mean and normally distributed, with deeper layers exhibiting less spread and more concentration near zero. This motivates per-layer, data-dependent $k$-means quantization.

**Additional explanation:** A **weight** is a learned parameter; a **pre-activation** is a weighted sum before applying the nonlinearity; an **activation** is the result after applying $\sin$. Under appropriate assumptions, sinusoidal activations can have an **arcsine-shaped** distribution; this is distinct from a normal distribution over **trained weights**. Activations influence parameter updates through backpropagation, so their statistics can affect training, but they do not by themselves determine the final weight histogram.

**Interpretation to verify:** The paper reports the weight pattern empirically and relates it to SIREN's activation statistics, but does **not** prove that a specified activation distribution necessarily produces normally distributed learned weights. The learning point worth retaining is the authors' research process: **inspect a model's learned statistics, identify a possible compression opportunity, then test an implementation choice**. This was explicitly selected as a point of personal interest; no causal proof was established in the reading discussion.

### With fixed storage, should a network have more coarse weights or fewer precise weights?

**Paper finding:** Fig. 4(d) varies bit-width $b$ and weight count $m$ in opposite directions while keeping compressed size approximately equal, and identifies **9-bit quantization** as a useful trade-off for the experiments.

**Additional explanation:** Under a simplified index-only budget $B$, $m\approx B/b$. A 6-bit network can afford more indexed weights than a 9-bit network of the same budget, but represents each with fewer possible centers; a 9-bit network may represent its individual weights more precisely but has fewer of them. This separates **representation capacity** from **numerical precision**. The actual budget also includes per-layer cluster centers and unquantized parameters, so the simplified expression is only an intuition, not a reproduction of the paper's storage calculation.

**When useful:** Compare model compression methods or design ablations at **matched total storage**, rather than comparing bit-widths while silently allowing file size to increase. No independent application test was conducted during this reading.

### Why can accurate scalar values still yield inaccurate gradients and noisy isosurfaces?

**Paper finding:** The gradient objective in Eq. (3), the separate FD-Grad and Net-Grad measurements in Table 1, and the surface comparisons in Figs. 5 and 13 show why scalar-field PSNR is not sufficient to characterize derivative quality. **FD-Grad** means finite differences of reconstructed *grid values*; **Net-Grad** means derivatives of the learned *continuous network function*. Both are compared with gradients numerically estimated from the supplied field.

**Additional explanation:** Consider the illustrative one-dimensional target $f(x)=x$ and reconstruction $\hat f(x)=x+0.01\sin(100x)$. The value error is at most $0.01$, but $\hat f'(x)-f'(x)=\cos(100x)$ can be as large as $1$ in magnitude. The example is **not an experiment in the paper**; it explains why a small amplitude error can create pronounced derivative errors, altered normals, and ripples in extracted isosurfaces.

**When useful:** For compression or learned field reconstruction, examine the quantity the downstream task actually depends on: values, derivatives, surface geometry, or other physical features. Gradient regularization improves agreement with the available gradient targets under the reported conditions, but unreliable targets can undermine it. No independent application test was conducted during this reading.
