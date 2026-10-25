import { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeImages, getSamples } from '../api/analyze';

export const PROCESSING_STEPS = [
  { id: '01', title: 'Aligning images', detail: 'Geometric registration & sub-pixel orthorectification' },
  { id: '02', title: 'Computing difference', detail: 'Radiometric normalization & multi-band delta extraction' },
  { id: '03', title: 'Identifying regions', detail: 'Contour clustering & vector polygon extraction' },
  { id: '04', title: 'Generating report', detail: 'Compiling statistical summary & classification breakdown' },
];

export function useAnalysis() {
  const [state, setState] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'results' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Selected preset / samples
  const [samples, setSamples] = useState([]);
  const [activeSampleId, setActiveSampleId] = useState('forest');

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

  // Load available samples on mount
  useEffect(() => {
    let isMounted = true;
    getSamples()
      .then((data) => {
        if (isMounted) setSamples(data);
      })
      .catch((err) => {
        if (isMounted) console.error('Failed to load sample presets', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const startAnalysis = useCallback(async (beforeFile, afterFile, beforeUrl, afterUrl) => {
    setState('processing');
    setError(null);
    setProcessingProgress(8);
    setActiveStepIndex(0);

    abortControllerRef.current = new AbortController();

    // Advance simulated steps while awaiting pipeline response
    let currentStep = 0;
    let currentProgress = 10;
    
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    progressTimerRef.current = setInterval(() => {
      currentProgress = Math.min(94, currentProgress + 7);
      setProcessingProgress(currentProgress);

      if (currentProgress > 75) {
        currentStep = 3;
      } else if (currentProgress > 45) {
        currentStep = 2;
      } else if (currentProgress > 20) {
        currentStep = 1;
      }
      setActiveStepIndex(currentStep);
    }, 280);

    try {
      const data = await analyzeImages(
        beforeFile,
        afterFile,
        activeSampleId,
        abortControllerRef.current.signal
      );

      clearInterval(progressTimerRef.current);
      setProcessingProgress(100);
      setActiveStepIndex(3);

      // Brief moment for progress bar to hit 100%
      setTimeout(() => {
        setResult(data);
        setState('results');
        setViewMode('slider');
        setSliderPosition(52);
      }, 250);
    } catch (err) {
      clearInterval(progressTimerRef.current);
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        setState('ready');
      } else {
        setError(err.message || 'Telemetry pipeline computation failed. Check network or server status.');
        setState('error');
      }
    }
  }, [activeSampleId]);

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
    samples,
    activeSampleId,
    setActiveSampleId,
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
