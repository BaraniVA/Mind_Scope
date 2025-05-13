import type { Phase, Microtask } from './types';

export interface ParsedMicrotask {
  name: string;
}

export interface ParsedPhase {
  name: string;
  microtasks: ParsedMicrotask[];
}

export function parseAISuggestions(suggestions: string[]): ParsedPhase[] {
  const parsedPhases: ParsedPhase[] = [];
  let currentPhase: ParsedPhase | null = null;

  // Regex for top-level phases (e.g., "1. Phase Name", "1) Phase Name", "* Phase Name", "- Phase Name")
  // Captures the numbering/bullet and the phase name.
  const phaseRegex = /^\s*(\d+[\.\)]\*?|\*[ \t]|\-[ \t])\s*(.+)/;

  // Regex for microtasks.
  // Matches:
  // - At least two leading spaces (or a tab).
  // - Optionally followed by numbering/bullet (e.g., "1.1.", "a)", "-", "*") and a space.
  // - Captures the rest of the line as the microtask name.
  const microtaskRegex = /^\s{2,}(?:(?:\d+\.\d+[\.\)]?|[a-zA-Z][\.\)]|\d+[\.\)]|\*|\-)\s+)?(.+)/;
  // Alternative microtask regex for lines that start with a tab
  const tabbedMicrotaskRegex = /^\t(?:(?:\d+\.\d+[\.\)]?|[a-zA-Z][\.\)]|\d+[\.\)]|\*|\-)\s+)?(.+)/;


  for (const line of suggestions) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // Skip empty or whitespace-only lines

    // Attempt to match as a phase first
    // Phases are typically not heavily indented or less indented than their microtasks.
    const phaseMatch = line.match(phaseRegex);
    // Check if it's a phase: matches phaseRegex and is not significantly indented.
    const isLikelyPhase = phaseMatch && !(line.startsWith("  ") || line.startsWith("\t\t") || line.startsWith("    "));


    if (isLikelyPhase) {
      // Safely access phaseMatch[2] because isLikelyPhase ensures phaseMatch is not null.
      const phaseName = phaseMatch![2].trim(); 
      if (phaseName) {
        currentPhase = { name: phaseName, microtasks: [] };
        parsedPhases.push(currentPhase);
        continue; 
      }
    }

    // If it's not a phase, and a currentPhase context exists, try to parse as a microtask
    if (currentPhase) {
      // Check if the line is indented, indicating it could be a microtask
      if (line.startsWith("  ") || line.startsWith("\t")) {
        let microtaskName: string | null = null;
        const microtaskMatch = line.match(microtaskRegex);
        const tabbedMicrotaskMatch = line.match(tabbedMicrotaskRegex);

        if (microtaskMatch && microtaskMatch[1]) {
          microtaskName = microtaskMatch[1].trim();
        } else if (tabbedMicrotaskMatch && tabbedMicrotaskMatch[1]) {
          microtaskName = tabbedMicrotaskMatch[1].trim();
        }
        
        if (microtaskName) {
          currentPhase.microtasks.push({ name: microtaskName });
          continue;
        } else {
          // Fallback for indented lines that don't fit the specific microtask regex pattern
          // but are clearly part of the current phase due to indentation.
          const fallbackMicrotaskName = line.trim();
          if (fallbackMicrotaskName) {
            currentPhase.microtasks.push({ name: fallbackMicrotaskName });
            continue;
          }
        }
      }
    }
  }
  return parsedPhases;
}