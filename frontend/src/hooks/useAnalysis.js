import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeImages } from '../api/analyze';
import { useFileDrop } from './useFileDrop';
import { fetchManifest, presetToFiles } from '../utils/presets';
import { AUTO_RUN_PRESETS } from '../config/constants';
import { MOCK_SAMPLES } from '../api/mock';

export const PROCESSING_STEPS = [
  { id: '01', title: 'Matching the two photos', detail: 'Lining up the two images so they overlap perfectly' },
  { id: '02', title: 'Looking for differences', detail: 'Comparing colors and patterns across the area' },
  { id: '03', title: 'Marking changed areas', detail: 'Outlining spots where ground or water changed' },
  { id: '04', title: 'Writing the summary', detail: 'Counting changed areas and writing a short report' },
];

export function useAnalysis() {
  const [state, setState] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'results' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Preset Manifest and Selection
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);
  const [presetLoading, setPresetLoading] = useState(false);
  const [loadingPresetId, setLoadingPresetId] = useState(null);
  const [presetError, setPresetError] = useState(null);

  // Dropzones
  const rawT1Drop = useFileDrop(null);
  const rawT2Drop = useFileDrop(null);

  // In-memory cache for preset analysis results (Map<presetId, { result, beforeFile, afterFile }>)
  const presetCacheRef = useRef(new Map());

  // Interactive Results Viewer state
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side' | 'overlay'
  const [sliderPosition, setSliderPosition] = useState(52); // percentage 5 - 95
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);

  // Processing stage progress & steps
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const abortControllerRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Load manifest at startup
  useEffect(() => {
    let isMounted = true;
    fetchManifest()
      .then((data) => {
        if (isMounted) setPresets(data);
      })
      .catch((err) => {
        console.warn('Failed to load preset manifest, falling back to mock presets:', err);
        if (isMounted) setPresets(MOCK_SAMPLES);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Invalidate preset highlight and cache when user manually changes or removes images
  const onT1FileSelect = useCallback((file) => {
    if (activePresetId) {
      presetCacheRef.current.delete(activePresetId);
      setActivePresetId(null);
    }
    setPresetError(null);
    rawT1Drop.handleFileSelect(file);
  }, [activePresetId, rawT1Drop]);

  const onT1Remove = useCallback(() => {
    if (activePresetId) {
      presetCacheRef.current.delete(activePresetId);
      setActivePresetId(null);
    }
    setPresetError(null);
    rawT1Drop.removeFile();
  }, [activePresetId, rawT1Drop]);

  const onT2FileSelect = useCallback((file) => {
    if (activePresetId) {
      presetCacheRef.current.delete(activePresetId);
      setActivePresetId(null);
    }
    setPresetError(null);
    rawT2Drop.handleFileSelect(file);
  }, [activePresetId, rawT2Drop]);

  const onT2Remove = useCallback(() => {
    if (activePresetId) {
      presetCacheRef.current.delete(activePresetId);
      setActivePresetId(null);
    }
    setPresetError(null);
    rawT2Drop.removeFile();
  }, [activePresetId, rawT2Drop]);

  const t1Drop = {
    ...rawT1Drop,
    handleFileSelect: onT1FileSelect,
    removeFile: onT1Remove,
  };

  const t2Drop = {
    ...rawT2Drop,
    handleFileSelect: onT2FileSelect,
    removeFile: onT2Remove,
  };

  // Core analysis execution
  const startAnalysis = useCallback(async (bFile, aFile, targetPresetId = null) => {
    const file1 = bFile || rawT1Drop.file;
    const file2 = aFile || rawT2Drop.file;

    if (!file1 || !file2) {
      setError('Please add both a before photo and an after photo to compare.');
      setState('error');
      return;
    }

    // Cancel any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    setState('processing');
    setError(null);
    setPresetError(null);
    setProcessingProgress(8);
    setActiveStepIndex(0);

    abortControllerRef.current = new AbortController();

    // Advance simulated steps while awaiting pipeline response
    let currentStep = 0;
    let currentProgress = 10;

    progressTimerRef.current = setInterval(() => {
      currentProgress = Math.min(94, currentProgress + 6);
      setProcessingProgress(currentProgress);

      if (currentProgress > 75) {
        currentStep = 3;
      } else if (currentProgress > 45) {
        currentStep = 2;
      } else if (currentProgress > 20) {
        currentStep = 1;
      }
      setActiveStepIndex(currentStep);
    }, 250);

    try {
      const data = await analyzeImages(
        file1,
        file2,
        targetPresetId || activePresetId || 'deforestation',
        abortControllerRef.current.signal
      );

      clearInterval(progressTimerRef.current);
      setProcessingProgress(100);
      setActiveStepIndex(3);

      // Cache result if this was for an active preset
      if (targetPresetId) {
        presetCacheRef.current.set(targetPresetId, {
          result: data,
          beforeFile: file1,
          afterFile: file2,
        });
      }

      setTimeout(() => {
        setResult(data);
        setState('results');
        setViewMode('slider');
        setSliderPosition(52);
      }, 200);
    } catch (err) {
      clearInterval(progressTimerRef.current);
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        // Aborted cleanly by operator / new preset selection
        return;
      }
      setError('Something went wrong while comparing the photos. Please try again.');
      setState('error');
    }
  }, [rawT1Drop.file, rawT2Drop.file, activePresetId]);

  // Load a preset benchmark dataset by ID
  const loadPreset = useCallback(async (presetId) => {
    // 1. Cancel any in-flight analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    setPresetError(null);
    setError(null);
    setActivePresetId(presetId);

    // 2. Cache Hit check: instant response without API call
    if (presetCacheRef.current.has(presetId)) {
      const cached = presetCacheRef.current.get(presetId);
      rawT1Drop.handleFileSelect(cached.beforeFile);
      rawT2Drop.handleFileSelect(cached.afterFile);
      setResult(cached.result);
      setState('results');
      setViewMode('slider');
      setSliderPosition(52);
      setPresetLoading(false);
      setLoadingPresetId(null);
      return;
    }

    // 3. Cache Miss: Reset results, load real files from manifest
    setResult(null);
    setPresetLoading(true);
    setLoadingPresetId(presetId);

    try {
      let currentPresets = presets;
      if (!currentPresets || currentPresets.length === 0) {
        currentPresets = await fetchManifest();
        setPresets(currentPresets);
      }

      const preset = currentPresets.find((p) => p.id === presetId);
      if (!preset) {
        throw new Error(`Preset folder '${presetId}' not found in manifest`);
      }

      // Convert URLs to real File objects
      const { beforeFile, afterFile } = await presetToFiles(preset);

      // Load previews into drop zones
      rawT1Drop.handleFileSelect(beforeFile);
      rawT2Drop.handleFileSelect(afterFile);

      setPresetLoading(false);
      setLoadingPresetId(null);

      // 4. Auto-run analysis if enabled
      if (AUTO_RUN_PRESETS) {
        await startAnalysis(beforeFile, afterFile, presetId);
      } else {
        setState('ready');
      }
    } catch (err) {
      console.error(`Failed to load preset '${presetId}':`, err);
      setPresetLoading(false);
      setLoadingPresetId(null);
      // Clean up to prevent half-loaded state
      rawT1Drop.removeFile();
      rawT2Drop.removeFile();
      setState('idle');
      setPresetError('Could not load example photos. Please try again.');
    }
  }, [presets, rawT1Drop, rawT2Drop, startAnalysis]);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setState('ready');
    setProcessingProgress(0);
    setActiveStepIndex(0);
  }, []);

  const resetAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setState('idle');
    setResult(null);
    setError(null);
    setPresetError(null);
    setActivePresetId(null);
    setHoveredRegionId(null);
    setSelectedRegionId(null);
    setSliderPosition(52);
    setProcessingProgress(0);
    setActiveStepIndex(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    setState,
    result,
    error,
    presets,
    samples: presets, // backwards compatibility
    activePresetId,
    activeSampleId: activePresetId, // backwards compatibility
    setActivePresetId,
    presetLoading,
    loadingPresetId,
    presetError,
    loadPreset,
    t1Drop,
    t2Drop,
    viewMode,
    setViewMode,
    sliderPosition,
    setSliderPosition,
    overlayOpacity,
    setOverlayOpacity,
    hoveredRegionId,
    setHoveredRegionId,
    selectedRegionId,
    setSelectedRegionId,
    processingProgress,
    activeStepIndex,
    startAnalysis,
    cancelAnalysis,
    resetAnalysis,
  };
}

export default useAnalysis;
