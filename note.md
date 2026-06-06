Reconciliation System:
The core insight of this whole system: reconciliation is a set-difference problem solved with hash maps, wrapped in streaming I/O to handle scale, and delivered async because it's inherently a batch job. Every architectural decision flows from those three facts.

//Frontend
Screen 1: Upload
  - Two dropzones (System A, System B)
  - Validate: must be .csv, size limit warning
  - "Start Reconciliation" button → POST /api/reconcile

Screen 2: Processing
  - Spinner + progress bar
  - Poll GET /api/jobs/:id every 2s using TanStack Query
  - Show "Processing 240,000 / 1,000,000 rows..." if you emit progress events

Screen 3: Results Dashboard
  - Summary cards: Missing in A | Missing in B | Amount Mismatches | Status Mismatches
  - Pie chart (recharts): matched vs discrepant
  - Tabbed tables per discrepancy type
  - TanStack Table with virtualisation for large result sets
  - Export to CSV button per table

Bonus: Web Workers on the Frontend
For the bonus criterion, you can offload the CSV preview (first 100 rows) to a browser Web Worker so the UI doesn't freeze when the user drops a large file:
// csvPreviewWorker.js (browser)

self.onmessage = ({ data: file }) => {
  const reader = new FileReaderSync();
  const text = reader.readAsText(file.slice(0, 50000)); // first 50KB only
  // parse and postMessage back
};





