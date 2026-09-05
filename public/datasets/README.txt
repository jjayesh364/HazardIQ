MANUAL IMPORT INSTRUCTIONS FOR INDIAN ROAD DATASETS

Due to strict licensing, EULA terms, and registration requirements, this simulator cannot automatically download raw images from IDD or DATS_2022.

To validate the SIH prototype against real images, please follow these manual steps:

1. India Driving Dataset (IDD)
- Register at: https://idd.insaan.iiit.ac.in/
- Download a sample subset.
- Extract any image (e.g., from the JPEGImages folder) and place it here:
  public/datasets/idd/sample_1.jpg

2. DATS_2022 Dataset
- Access via Mendeley Data: https://data.mendeley.com/datasets/nfc34n8svj/2
- Download the zip archive.
- Extract any image and place it here:
  public/datasets/dats2022/sample_1.jpg

Once placed, the simulator Dashboard will automatically detect the files upon refresh, changing the status from "REFERENCED ONLY" to "SAMPLE LOADED" and enabling visual inspection.
