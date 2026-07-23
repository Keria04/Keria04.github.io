---
title: "Deep operator learning-based surrogate models for aerothermodynamic analysis of AEDC hypersonic waverider"
date: 2026-07-23
categories:
  - weekly
tags:
  - notes
excerpt: "Note of reading the DeepOnet for hypersonic waverider."
---

[Deep operator learning-based surrogate models for aerothermodynamic analysis of AEDC hypersonic waverider](http://arxiv.org/abs/2405.13234)

## Overview
这篇论文探索了 **DeepONet 是否能够作为高超声速 CFD 的代理模型**，直接学习攻角（AoA）到整个流场（体流场和表面流场）的映射，从而代替昂贵的 CFD 求解器。相比已有 surrogate 大多只预测升阻力等标量，它进一步预测完整流场，并针对激波导致的训练困难提出了 two-step DeepONet 训练策略。论文说明了神经算子在高超声速 CFD surrogate 上的可行性，也展示了其在工程优化中的巨大潜力。  

## Problem

- Most existing aerodynamic surrogate models predict only low-dimensional quantities such as lift, drag, or pressure coefficients. While useful for optimization, they cannot replace CFD in scenarios where the full flow field is required, such as heat transfer analysis, shock interaction, or downstream physics.

  The paper argues that the real challenge is learning a **mapping from operating conditions (AoA) to an entire flow field**, especially under hypersonic conditions where strong shocks introduce discontinuities that make neural operator training unstable and inaccurate.

  Therefore, the question is not merely whether DeepONet can approximate CFD, but whether it can remain accurate when the target function contains sharp discontinuities and millions of spatial locations.

## Core Idea

**Treat CFD as an operator-learning problem rather than a regression problem, and improve DeepONet training so that it can accurately learn discontinuous hypersonic flow fields instead of only smooth PDE solutions.**

## Key Insight

The most valuable insight is **not** that DeepONet works for CFD.

Instead, the paper highlights that **the training strategy becomes the bottleneck once discontinuities (shocks) appear.**

Vanilla DeepONet jointly optimizes the branch and trunk networks. Under hypersonic shocks, this optimization becomes difficult because both basis functions and coefficients are changing simultaneously.

The proposed two-step training decouples these two optimization problems:

- first learn the spatial basis (trunk);
- then learn the coefficients (branch).

This converts part of the optimization into a convex problem, improving convergence and allowing the learned basis to better represent discontinuous flow structures. The authors argue that this also makes the learned representation more interpretable because the trunk basis is fixed before learning the parametric dependence. 

This is a useful lesson beyond this paper:

**For neural operators, optimization strategy can matter as much as architecture when learning discontinuous PDE solutions.**

## Pros and Cons

- ### **Pros**

  - This is one of the earliest demonstrations that DeepONet can predict **full 3D hypersonic aerothermodynamic fields**, including both surface quantities (heat flux, wall shear stress) and volume quantities (density, pressure, velocity), instead of only integrated aerodynamic coefficients.  
  - The paper addresses a realistic engineering problem rather than synthetic PDE benchmarks. The CFD data are generated using high-fidelity US3D simulations on an industrial-scale waverider geometry, making the evaluation much more convincing than standard academic datasets. 
  - The comparison between vanilla DeepONet and two-step DeepONet provides useful insight into how neural operator optimization affects shock prediction, rather than simply introducing another architecture.
  - The computational benefit is substantial. After training, inference requires roughly **1 ms** on an A100 GPU compared with approximately **32,000 core-hours** for the CFD simulation, illustrating the potential of operator learning for design optimization.   
  
  ### **Cons**
  
  - The parameter space is very limited.The surrogate varies only the **angle of attack** while keeping geometry, Mach number, and boundary conditions essentially fixed. Therefore, it demonstrates interpolation over a single parameter rather than learning a truly general aerodynamic operator.  
  - The dataset is relatively small (21–29 CFD simulations), making it difficult to judge how the approach scales to richer design spaces involving geometry variation or multiple flight conditions. 
  - Although the paper claims improved interpretability, it provides little analysis of what the learned basis functions actually represent.
  - The work focuses on demonstrating feasibility rather than comparing against stronger neural operator baselines such as FNO, GNOT, or more recent geometry-aware operator models, so it is difficult to determine whether DeepONet is the best choice.

## Methods

The overall design is surprisingly simple.

The **branch network** receives the operating condition (AoA) and predicts the coefficients describing the solution.

The **trunk network** receives spatial coordinates and learns a set of basis functions over the computational domain.

The predicted flow field is reconstructed as a weighted combination of these learned basis functions. This naturally separates **parameter dependence** from **spatial dependence**, which explains why DeepONet is attractive for surrogate modeling. 

The main methodological contribution is the **two-step training strategy**.

Instead of jointly optimizing branch and trunk networks,

1. optimize the trunk basis first;
2. then fit the branch network to the learned basis coefficients.

This reduces optimization complexity and significantly improves convergence when shocks are present. 

An additional engineering detail worth remembering is that the loss gives **higher weight to shock regions**, detected using Sobel gradients of the density field. Rather than treating every spatial point equally, the model explicitly prioritizes the physically important discontinuities. 

## Relation

- This paper sits at the intersection of three research directions.

  First, it extends **DeepONet** from generic operator-learning benchmarks toward realistic hypersonic CFD applications.

  Second, it moves beyond traditional aerodynamic surrogate models that predict scalar outputs, demonstrating that neural operators can predict **entire flow fields**, making them much more useful for downstream engineering tasks.

  Third, it highlights an important issue that later neural operator research continues to address: **handling discontinuities and complex geometries.**

  From today’s perspective, this work can be viewed as an early engineering application of DeepONet. Later methods such as Geo-FNO, GNOT, Transolver, and other geometry-aware transformer-based operator models pursue the same long-term goal—learning solution operators on realistic CFD problems—but improve scalability, geometry handling, and representation power. This paper therefore represents a useful historical step showing that operator learning is practical even in demanding hypersonic settings. 

## Others

Several details are particularly memorable.

The paper predicts **both surface and volume quantities**, including density, pressure, velocity, heat flux, and wall shear stress, making it significantly richer than many aerodynamic surrogates that output only lift or drag. 

The surface model achieves maximum absolute errors of approximately **9.7% for heat flux** and **4.1% for wall shear stress** on an unseen angle of attack, while the volume model reports a global density error of about **5.1%** and successfully captures shock locations. 

For readers interested in inverse design, the most important takeaway is conceptual:

**This paper demonstrates that operator learning can replace CFD in the forward simulation loop. Once such a surrogate exists, it becomes a natural building block for optimization or inverse design pipelines, where thousands of CFD evaluations would otherwise be prohibitively expensive.** 