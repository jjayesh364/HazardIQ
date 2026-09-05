import { describe, it, expect, vi } from 'vitest';
import { DATASETS, checkDatasetSamples } from './index';

// Mock the global fetch
global.fetch = vi.fn();

describe('Dataset Metadata & Loading', () => {
  it('contains IDD and DATS_2022 metadata', () => {
    expect(DATASETS.length).toBe(2);
    expect(DATASETS.find(d => d.id === 'idd')).toBeDefined();
    expect(DATASETS.find(d => d.id === 'dats2022')).toBeDefined();
  });

  it('detects missing samples and returns false', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });
    
    const results = await checkDatasetSamples();
    expect(results.idd).toBe(false);
    expect(results.dats2022).toBe(false);
  });

  it('detects loaded samples and returns true', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('idd')) return Promise.resolve({ ok: true });
      if (url.includes('dats2022')) return Promise.resolve({ ok: true });
      return Promise.resolve({ ok: false });
    });
    
    const results = await checkDatasetSamples();
    expect(results.idd).toBe(true);
    expect(results.dats2022).toBe(true);
  });
});
