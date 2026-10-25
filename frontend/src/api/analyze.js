import apiClient from './client';
import { MOCK_SAMPLES, getMockAnalysis } from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;

export async function getSamples() {
  if (USE_MOCK) {
    return Promise.resolve(MOCK_SAMPLES);
  }

  try {
    const response = await apiClient.get('/api/samples');
    return response.data;
  } catch (err) {
    // If backend is unreachable in dev, gracefully fall back to mock samples
    if (import.meta.env.DEV) {
      console.warn('Backend samples unreachable. Falling back to mock sample data.');
      return MOCK_SAMPLES;
    }
    const message = err.response?.data?.detail || err.message || 'Failed to fetch samples';
    throw new Error(message);
  }
}

export async function analyzeImages(beforeFile, afterFile, activeSampleId = 'forest', signal) {
  if (USE_MOCK) {
    // 3 second realistic inference delay as specified in requirements
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 3000);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Analysis was aborted by operator.', 'AbortError'));
        });
      }
    });

    return getMockAnalysis(activeSampleId);
  }

  let bFile = beforeFile;
  let aFile = afterFile;

  // If beforeFile or afterFile is null or a string (e.g. from preset selection), fetch sample blob
  if (!(bFile instanceof Blob)) {
    const url = typeof bFile === 'string' && bFile !== 'null' ? bFile : `/samples/${activeSampleId}_t1.jpg`;
    try {
      const res = await fetch(url);
      if (res.ok) bFile = await res.blob();
    } catch (e) {
      console.warn('Failed to fetch before sample blob:', e);
    }
  }

  if (!(aFile instanceof Blob)) {
    const url = typeof aFile === 'string' && aFile !== 'null' ? aFile : `/samples/${activeSampleId}_t2.jpg`;
    try {
      const res = await fetch(url);
      if (res.ok) aFile = await res.blob();
    } catch (e) {
      console.warn('Failed to fetch after sample blob:', e);
    }
  }

  const formData = new FormData();
  formData.append('before', bFile, 'before.jpg');
  formData.append('after', aFile, 'after.jpg');

  try {
    const response = await apiClient.post('/api/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal,
    });
    return response.data;
  } catch (err) {
    if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
      throw new Error('Analysis was aborted by operator.');
    }
    const detail = err.response?.data?.detail || err.message || 'Telemetry pipeline computation failed.';
    throw new Error(detail);
  }
}
