export interface DatasetMetadata {
  id: string;
  name: string;
  officialUrl: string;
  purpose: string;
  sampleCountInfo: string;
  relevantClasses: string[];
  isLoaded: boolean;
}

export const DATASETS: DatasetMetadata[] = [
  {
    id: 'idd',
    name: 'India Driving Dataset (IDD)',
    officialUrl: 'https://idd.insaan.iiit.ac.in/',
    purpose: 'Ground truth for unstructured Indian traffic, used to validate our synthetic obstacle behaviors and dimensions.',
    sampleCountInfo: '10,000+ images, 39 classes',
    relevantClasses: ['pedestrian', 'auto-rickshaw', 'animal', 'rider', 'truck'],
    isLoaded: false // Requires manual download and placement in public/datasets/idd
  },
  {
    id: 'dats2022',
    name: 'DATS_2022 Dataset',
    officialUrl: 'https://data.mendeley.com/datasets/nfc34n8svj/2',
    purpose: 'Indian unstructured traffic reference for dense market and highway merge scenarios.',
    sampleCountInfo: 'Multiple driving clips and frames',
    relevantClasses: ['two-wheeler', 'three-wheeler', 'pedestrian', 'heavy-vehicle'],
    isLoaded: false // Checked dynamically
  }
];

export const checkDatasetSamples = async (): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = { idd: false, dats2022: false };
  
  try {
    const resIdd = await fetch('/datasets/idd/sample_1.jpg', { method: 'HEAD' });
    results.idd = resIdd.ok;
  } catch (e) {
    // Ignore fetch errors
  }
  
  try {
    const resDats = await fetch('/datasets/dats2022/sample_1.jpg', { method: 'HEAD' });
    results.dats2022 = resDats.ok;
  } catch (e) {
    // Ignore fetch errors
  }

  return results;
};
