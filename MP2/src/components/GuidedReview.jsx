import { useEffect, useRef, useState } from 'react';
import EducationalOverview from './EducationalOverview.jsx';
import FindingLessonCard from './FindingLessonCard.jsx';
import GuidedRecap from './GuidedRecap.jsx';

const STEPS = {
  OVERVIEW: 'overview',
  FINDING: 'finding',
  RECAP: 'recap',
};

const ANIMATION_MS = 260;
const SWIPE_DISTANCE_THRESHOLD = 72;
const SWIPE_VELOCITY_THRESHOLD = 0.45;
const EDGE_RESISTANCE = 0.35;

export default function GuidedReview({
  report,
  onRequestBrowseReport,
}) {
  const findings = report?.findings ?? [];
  const summary = report?.summary ?? { total: 0, critical: 0, major: 0, minor: 0, cosmetic: 0 };
  const [step, setStep] = useState(STEPS.OVERVIEW);
  const [findingIndex, setFindingIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [navDirection, setNavDirection] = useState('next');
  const [animPhase, setAnimPhase] = useState('idle');
  const [targetIndex, setTargetIndex] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSettlingSwipe, setIsSettlingSwipe] = useState(false);
  const guidedReviewRef = useRef(null);
  const pointerRef = useRef({
    id: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    startTime: 0,
    hasExceededDragThreshold: false,
    cancelledForVerticalScroll: false,
  });

  const currentFinding = findings[displayIndex] ?? null;
  const isAnimating = animPhase !== 'idle';
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  function navigateToIndex(nextIndex, direction) {
    if (nextIndex === findingIndex) return true;

    if (prefersReducedMotion) {
      setFindingIndex(nextIndex);
      setDisplayIndex(nextIndex);
      setNavDirection(direction);
      setSwipeOffset(0);
      return true;
    }

    setNavDirection(direction);
    setTargetIndex(nextIndex);
    setAnimPhase('out');
    return true;
  }

  function settleSwipeOffset() {
    if (prefersReducedMotion) {
      setSwipeOffset(0);
      setIsSettlingSwipe(false);
      return;
    }
    setIsSettlingSwipe(true);
    setSwipeOffset(0);
    window.setTimeout(() => setIsSettlingSwipe(false), 180);
  }

  function triggerFindingNavigation(direction, source = 'button') {
    if (step !== STEPS.FINDING || isAnimating) return false;

    if (direction === 'next') {
      if (findingIndex >= findings.length - 1) {
        if (source === 'gesture') settleSwipeOffset();
        return false;
      }
      return navigateToIndex(findingIndex + 1, 'next');
    }

    if (findingIndex <= 0) {
      if (source === 'gesture') settleSwipeOffset();
      return false;
    }
    return navigateToIndex(findingIndex - 1, 'prev');
  }

  function handleJumpToFinding(nextIndex) {
    if (step !== STEPS.FINDING || isAnimating) return;
    if (nextIndex < 0 || nextIndex >= findings.length) return;
    if (nextIndex === findingIndex) return;

    const direction = nextIndex > findingIndex ? 'next' : 'prev';
    navigateToIndex(nextIndex, direction);
  }

  function handleNext() {
    if (step === STEPS.OVERVIEW) {
      if (findings.length === 0) {
        setStep(STEPS.RECAP);
        return;
      }
      setFindingIndex(0);
      setDisplayIndex(0);
      setStep(STEPS.FINDING);
      return;
    }

    if (step === STEPS.FINDING) {
      if (findingIndex >= findings.length - 1) {
        setStep(STEPS.RECAP);
      } else {
        triggerFindingNavigation('next');
      }
    }
  }

  function handlePrevious() {
    if (step === STEPS.FINDING) {
      if (findingIndex > 0) {
        triggerFindingNavigation('prev');
      } else {
        setStep(STEPS.OVERVIEW);
      }
      return;
    }

    if (step === STEPS.RECAP) {
      if (findings.length > 0) {
        setStep(STEPS.FINDING);
        const lastIndex = findings.length - 1;
        setFindingIndex(lastIndex);
        setDisplayIndex(lastIndex);
      } else {
        setStep(STEPS.OVERVIEW);
      }
    }
  }

  function handlePointerDown(event) {
    if (step !== STEPS.FINDING || isAnimating || prefersReducedMotion || event.button !== 0) return;
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      startTime: performance.now(),
      hasExceededDragThreshold: false,
      cancelledForVerticalScroll: false,
    };
    setIsSettlingSwipe(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    const pointer = pointerRef.current;
    if (pointer.id !== event.pointerId || step !== STEPS.FINDING || isAnimating || prefersReducedMotion) return;

    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!pointer.hasExceededDragThreshold && absX + absY > 8) {
      pointer.hasExceededDragThreshold = true;
    }

    if (!pointer.hasExceededDragThreshold) return;

    if (!pointer.cancelledForVerticalScroll && absY > absX && absY > 12) {
      pointer.cancelledForVerticalScroll = true;
      setSwipeOffset(0);
      return;
    }

    if (pointer.cancelledForVerticalScroll) return;

    let adjustedOffset = deltaX;
    const atFirst = findingIndex <= 0;
    const atLast = findingIndex >= findings.length - 1;
    if ((atFirst && deltaX > 0) || (atLast && deltaX < 0)) {
      adjustedOffset = deltaX * EDGE_RESISTANCE;
    }

    pointer.lastX = event.clientX;
    setSwipeOffset(adjustedOffset);
  }

  function handlePointerEnd(event) {
    const pointer = pointerRef.current;
    if (pointer.id !== event.pointerId || step !== STEPS.FINDING || isAnimating || prefersReducedMotion) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const deltaX = event.clientX - pointer.startX;
    const elapsed = Math.max(performance.now() - pointer.startTime, 1);
    const velocity = Math.abs(deltaX / elapsed);
    const meetsDistance = Math.abs(deltaX) >= SWIPE_DISTANCE_THRESHOLD;
    const meetsVelocity = velocity >= SWIPE_VELOCITY_THRESHOLD;

    const shouldNavigate = !pointer.cancelledForVerticalScroll && (meetsDistance || meetsVelocity);
    let didNavigate = false;
    if (shouldNavigate) {
      if (deltaX < 0) {
        didNavigate = triggerFindingNavigation('next', 'gesture');
      } else {
        didNavigate = triggerFindingNavigation('prev', 'gesture');
      }
    }

    if (!didNavigate) {
      settleSwipeOffset();
    } else {
      setSwipeOffset(0);
      setIsSettlingSwipe(false);
    }
    pointerRef.current = {
      id: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      startTime: 0,
      hasExceededDragThreshold: false,
      cancelledForVerticalScroll: false,
    };
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPrefersReducedMotion(mediaQuery.matches);
    apply();
    mediaQuery.addEventListener('change', apply);
    return () => mediaQuery.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (animPhase !== 'out' || targetIndex === null) return undefined;

    const outTimer = window.setTimeout(() => {
      setDisplayIndex(targetIndex);
      setFindingIndex(targetIndex);
      setAnimPhase('prepare-in');
    }, ANIMATION_MS);

    return () => window.clearTimeout(outTimer);
  }, [animPhase, targetIndex]);

  useEffect(() => {
    if (animPhase !== 'prepare-in') return undefined;
    const rafId = window.requestAnimationFrame(() => {
      setAnimPhase('in');
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [animPhase]);

  useEffect(() => {
    if (animPhase !== 'in') return undefined;

    const inTimer = window.setTimeout(() => {
      setAnimPhase('idle');
      setTargetIndex(null);
      setSwipeOffset(0);
    }, ANIMATION_MS);

    return () => window.clearTimeout(inTimer);
  }, [animPhase]);

  useEffect(() => {
    if (step !== STEPS.FINDING) return;
    if (!prefersReducedMotion && animPhase !== 'idle') return;

    const rafId = window.requestAnimationFrame(() => {
      guidedReviewRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [findingIndex, animPhase, step, prefersReducedMotion]);

  const cardTranslatePercent =
    animPhase === 'out'
      ? (navDirection === 'next' ? -100 : 100)
      : animPhase === 'prepare-in'
        ? (navDirection === 'next' ? 100 : -100)
        : 0;

  const cardTransition =
    prefersReducedMotion
      ? 'none'
      :
    animPhase === 'out' || animPhase === 'in'
      ? `transform ${ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : isSettlingSwipe
        ? 'transform 180ms ease-out'
        : 'none';

  return (
    <section
      ref={guidedReviewRef}
      className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] p-5 md:p-7 flex flex-col gap-5"
      style={{ scrollMarginTop: '6rem' }}
      aria-labelledby="guided-review-heading"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-cta-bg)]">Guided review</p>
          <h2 id="guided-review-heading" className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
            Learn from the report, step by step
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Start with an overview, then review each finding with practical fixes.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[var(--color-text-muted)] rounded-lg border border-[var(--color-surface-border)] bg-white px-2.5 py-1">
          {step === STEPS.OVERVIEW && 'Step 1 of 3'}
          {step === STEPS.FINDING && 'Step 2 of 3'}
          {step === STEPS.RECAP && 'Step 3 of 3'}
        </span>
      </header>

      {step === STEPS.FINDING && findings.length > 0 && (
        <div className="flex flex-col gap-1.5" role="group" aria-label="Finding progress">
          <div className="flex items-center gap-1.5">
            {findings.map((finding, index) => {
              const isCurrent = index === findingIndex;
              const isCompleted = index < findingIndex;

              return (
                <button
                  key={finding.id || index}
                  type="button"
                  onClick={() => handleJumpToFinding(index)}
                  aria-label={`Go to finding ${index + 1} of ${findings.length}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'h-2 flex-1 rounded-full border transition-colors cursor-pointer',
                    isCurrent
                      ? 'bg-[var(--color-cta-bg)] border-[var(--color-cta-bg)]'
                      : isCompleted
                        ? 'bg-[#dbeec8] border-[#c5e2a9]'
                        : 'bg-[var(--color-surface-soft)] border-[var(--color-surface-border)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent)] focus-visible:ring-offset-2',
                    isAnimating ? 'pointer-events-none' : '',
                  ].join(' ')}
                />
              );
            })}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] tabular-nums">
            Finding {displayIndex + 1} of {findings.length}
          </p>
        </div>
      )}

      {step === STEPS.OVERVIEW && (
        <EducationalOverview summary={summary} findings={findings} />
      )}

      {step === STEPS.FINDING && currentFinding && (
        <div
          className="overflow-hidden [touch-action:pan-y] select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div
            className="will-change-transform"
            style={{
              transform: `translate3d(calc(${cardTranslatePercent}% + ${swipeOffset}px), 0, 0)`,
              transition: cardTransition,
            }}
          >
            <div className="flex flex-col gap-4">
              <FindingLessonCard
                finding={currentFinding}
                findingIndex={displayIndex}
                findingTotal={findings.length}
              />
            </div>
          </div>
        </div>
      )}

      {step === STEPS.RECAP && (
        <GuidedRecap
          findings={findings}
          onRequestBrowseReport={onRequestBrowseReport}
        />
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-surface-border)] pt-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={step === STEPS.OVERVIEW || isAnimating}
          className={[
            'text-sm font-semibold rounded-lg border px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent)] focus-visible:ring-offset-2',
            step === STEPS.OVERVIEW || isAnimating
              ? 'border-[var(--color-surface-border)] text-[var(--color-text-muted)] bg-white/60 cursor-not-allowed'
              : 'border-[var(--color-surface-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-focus-accent)] hover:text-[var(--color-text-primary)] cursor-pointer',
          ].join(' ')}
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={step === STEPS.RECAP || isAnimating}
          className={[
            'text-sm font-bold rounded-lg px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent)] focus-visible:ring-offset-2',
            step === STEPS.RECAP || isAnimating
              ? 'bg-white/60 text-[var(--color-text-muted)] cursor-not-allowed border border-[var(--color-surface-border)]'
              : 'bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] hover:bg-[var(--color-cta-hover)] active:translate-y-[1px] cursor-pointer shadow-[0_2px_0_0_var(--color-cta-shadow)]',
          ].join(' ')}
        >
          {step === STEPS.OVERVIEW && (findings.length > 0 ? 'Start walkthrough' : 'View recap')}
          {step === STEPS.FINDING && (findingIndex < findings.length - 1 ? 'Next finding' : 'Finish walkthrough')}
          {step === STEPS.RECAP && 'Complete'}
        </button>
      </footer>
    </section>
  );
}
