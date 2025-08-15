import { CanvasState } from './canvas';

export type HistoryAction = {
  timestamp: number;
  description: string;
  state: CanvasState;
};

export interface HistoryState {
  past: HistoryAction[];
  present: HistoryAction | null;
  future: HistoryAction[];
  maxHistorySize: number;
}
