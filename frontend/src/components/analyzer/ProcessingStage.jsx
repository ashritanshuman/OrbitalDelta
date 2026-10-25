import React from 'react';
import { PROCESSING_STEPS } from '../../hooks/useAnalysis';
import ChamferButton from '../ui/ChamferButton';
import { X, Loader2, Check } from 'lucide-react';

export function ProcessingStage({
  progress = 0,
  activeStepIndex = 0,
  onCancel,
}) {
  return (
    <div className="w-full flex flex-col justify-between min-h-[520px] bg-panel">
      {/* Realtime Pipeline Monitor Header */}
      <div className="px-6 py-4 border-b border-line bg-[#0A0E13] flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-accent uppercase tracking-widest block font-semibold">
            REALTIME PIPELINE MONITOR
          </span>
          <h3 className="text-lg md:text-xl text-text font-display uppercase tracking-wide mt-0.5">
            Inference in progress
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-ok">
          <span className="w-2 h-2 rounded-full bg-ok animate-ping" />
          <span className="font-semibold tracking-wider uppercase">PROCESSING</span>
        </div>
      </div>

      {/* Main Progress Stepper Container */}
      <div className="max-w-2xl mx-auto w-full my-auto px-6 py-10" aria-live="polite">
        {/* Stepper list */}
        <div className="space-y-6">
          {PROCESSING_STEPS.map((step, idx) => {
            const isCompleted = idx < activeStepIndex || progress === 100;
            const isCurrent = idx === activeStepIndex && progress < 100;
            const isPending = idx > activeStepIndex && progress < 100;

            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Indicator icon */}
                <div
                  className={`w-6 h-6 flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                    isCompleted
                      ? 'bg-ok/15 border-ok text-ok'
                      : isCurrent
                      ? 'bg-accent/20 border-accent text-accent animate-pulse'
                      : 'bg-panel border-line text-faint'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs uppercase tracking-wider ${
                        isCurrent
                          ? 'text-accent font-semibold'
                          : isCompleted
                          ? 'text-text'
                          : 'text-faint'
                      }`}
                    >
                      {step.id} {step.title}
                    </span>

                    <span className="font-mono text-[10px] tracking-wider uppercase">
                      {isCompleted && <span className="text-ok">COMPLETE</span>}
                      {isCurrent && <span className="text-accent">RUNNING {progress}%</span>}
                      {isPending && <span className="text-faint">PENDING</span>}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-muted mt-0.5">
                    {step.detail}
                  </p>

                  {/* Progress bar on the active step */}
                  {isCurrent && (
                    <div className="w-full h-1 bg-[#07090C] border border-line mt-2 overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Progress Bar */}
        <div className="mt-8 pt-6 border-t border-line">
          <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-2 tracking-wider">
            <span>PIPELINE TOTAL COMPLETION</span>
            <span className="text-text font-bold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#07090C] border border-line overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cancel Action */}
        <div className="mt-8 flex justify-end">
          <ChamferButton
            id="btn-cancel-analysis"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            icon={X}
            className="border-line text-muted hover:text-text hover:border-faint"
          >
            ABORT PIPELINE
          </ChamferButton>
        </div>
      </div>

      {/* GPU Worker Telemetry */}
      <div className="font-mono text-[10px] text-faint text-center py-3 border-t border-line bg-[#0A0E13]">
        ACTIVE GPU WORKER: NODE-US-EAST-4 // TENSOR RT 10.2 COMPILED
      </div>
    </div>
  );
}

export default ProcessingStage;
