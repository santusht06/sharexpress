// pdfRenderQueue.js
// Global singleton queue that limits concurrent PDF renders to MAX_CONCURRENT.
// Prevents unbounded parallel pdfjs instances from consuming all RAM/CPU.
// All PdfThumb components share this one queue.

const MAX_CONCURRENT = 2; // max simultaneous PDF renders at any time

let active = 0;
const queue = []; // pending render tasks: { run, cancel }

const next = () => {
  if (active >= MAX_CONCURRENT || queue.length === 0) return;
  const task = queue.shift();
  active++;
  task.run().finally(() => {
    active--;
    next(); // drain queue
  });
};

// Enqueue a render task.
// Returns a cancel function — call it to remove from queue or abort if running.
export const enqueueRender = (runFn) => {
  let cancelled = false;
  let cancelActive = null; // set by runFn if it starts

  const wrappedRun = () => {
    if (cancelled) return Promise.resolve();
    return runFn((cancelFn) => {
      cancelActive = cancelFn;
    });
  };

  const task = { run: wrappedRun };
  queue.push(task);
  next();

  return () => {
    cancelled = true;
    // Remove from queue if not yet started
    const idx = queue.indexOf(task);
    if (idx !== -1) queue.splice(idx, 1);
    // Abort if already running
    if (cancelActive) cancelActive();
  };
};
