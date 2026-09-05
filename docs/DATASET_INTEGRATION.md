# Dataset Integration & Reference

## Overview
To anchor our Smart India Hackathon prototype in reality, we have incorporated a **Real Indian Data Reference** layer into our dashboard. This layer explicitly identifies the high-quality real-world datasets that validate our simulated obstacles, behavior models, and scenarios.

## Included Datasets

### 1. India Driving Dataset (IDD)
* **Official Source**: [idd.insaan.iiit.ac.in](https://idd.insaan.iiit.ac.in/)
* **Purpose**: IDD is used to validate the dimensions, classification, and appearance of unstructured Indian traffic objects (e.g., auto-rickshaws, pedestrians, cattle) within our simulation engine.
* **Classes**: 39 classes including `pedestrian`, `rider`, `auto-rickshaw`, `animal`, and `truck`.

### 2. DATS_2022 (Indian Road Traffic)
* **Official Source**: [Mendeley Data](https://data.mendeley.com/datasets/nfc34n8svj/2)
* **Purpose**: DATS_2022 serves as our reference for mixed traffic conditions, unstructured lane use, and dense market behavior, allowing us to accurately design our synthetic scenarios.

## Clarification: Validation vs. AI Training
**We explicitly state that this prototype currently does NOT use an AI/ML model trained on these datasets for real-time safety control.** 

Our core safety path planner and collision avoidance loops are strictly **deterministic** and **mathematical**. 

The datasets are included to:
1. Prove the authenticity of the scenarios we created.
2. Provide a clear pathway for future ML-based perception training.

## Manual Import Procedure & Viewer
Because these datasets are massively large and require official researcher registration/login, they are not bundled directly into this repository to respect licensing terms.

To view local sample data inside the simulator's built-in Dataset Viewer:
1. Register and download the dataset from the official URLs listed above.
2. Extract one or more images.
3. Place a sample image for IDD here: `public/datasets/idd/sample_1.jpg`
4. Place a sample image for DATS_2022 here: `public/datasets/dats2022/sample_1.jpg`
5. Refresh the dashboard. The application will detect the files, switch the status from "REFERENCED ONLY" to "SAMPLE LOADED", and enable visual inspection directly in the UI.
