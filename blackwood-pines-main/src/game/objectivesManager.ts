/**
 * Blackwood Pines - Objectives Management System
 * Tracks real-time events, manages 100+ objectives, updates completion status,
 * triggers achievement toasts, and syncs with saves.
 */

import { GameObjective, INITIAL_OBJECTIVES, ObjectiveCategory } from './objectivesData';
import { horrorAudio } from '../audio/horrorAudio';

export class ObjectivesManager {
  private objectives: GameObjective[] = [];
  private onObjectiveCompleteCallback?: (obj: GameObjective) => void;
  private onObjectivesUpdateCallback?: (list: GameObjective[]) => void;

  constructor() {
    this.reset();
  }

  public reset(completedIds?: string[]) {
    // Clone initial objectives
    this.objectives = INITIAL_OBJECTIVES.map((obj) => ({
      ...obj,
      current: completedIds?.includes(obj.id) ? obj.target : obj.current,
      completed: completedIds?.includes(obj.id) ? true : obj.completed,
    }));
    this.onObjectivesUpdateCallback?.(this.objectives);
  }

  public setOnComplete(cb: (obj: GameObjective) => void) {
    this.onObjectiveCompleteCallback = cb;
  }

  public setOnUpdate(cb: (list: GameObjective[]) => void) {
    this.onObjectivesUpdateCallback = cb;
  }

  public getObjectives(): GameObjective[] {
    return this.objectives;
  }

  public getCompletedCount(): number {
    return this.objectives.filter((o) => o.completed).length;
  }

  public getTotalCount(): number {
    return this.objectives.length;
  }

  public getCompletedIds(): string[] {
    return this.objectives.filter((o) => o.completed).map((o) => o.id);
  }

  public getByCategory(cat: ObjectiveCategory): GameObjective[] {
    return this.objectives.filter((o) => o.category === cat);
  }

  /**
   * Increment progress towards an objective
   */
  public addProgress(id: string, amount: number = 1) {
    const obj = this.objectives.find((o) => o.id === id);
    if (!obj || obj.completed) return;

    obj.current = Math.min(obj.target, obj.current + amount);
    if (obj.current >= obj.target) {
      obj.completed = true;
      this.triggerCompletion(obj);
    }
    this.onObjectivesUpdateCallback?.(this.objectives);
  }

  /**
   * Set absolute progress for an objective
   */
  public setProgress(id: string, value: number) {
    const obj = this.objectives.find((o) => o.id === id);
    if (!obj || obj.completed) return;

    obj.current = Math.min(obj.target, Math.max(obj.current, value));
    if (obj.current >= obj.target) {
      obj.completed = true;
      this.triggerCompletion(obj);
    }
    this.onObjectivesUpdateCallback?.(this.objectives);
  }

  /**
   * Mark an objective as immediately complete
   */
  public complete(id: string) {
    const obj = this.objectives.find((o) => o.id === id);
    if (!obj || obj.completed) return;

    obj.current = obj.target;
    obj.completed = true;
    this.triggerCompletion(obj);
    this.onObjectivesUpdateCallback?.(this.objectives);
  }

  private triggerCompletion(obj: GameObjective) {
    try {
      horrorAudio.playObjectivePing?.();
    } catch {}
    this.onObjectiveCompleteCallback?.(obj);
  }
}

export const objectivesManager = new ObjectivesManager();
