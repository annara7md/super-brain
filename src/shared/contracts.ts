export type PlanStatus = 'draft' | 'active' | 'blocked' | 'done';

export interface Objective {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  objectiveId: string;
}

export interface PlanTask {
  id: string;
  title: string;
  status: PlanStatus;
  owner?: string;
  sprintId?: string;
}

export interface PlanningWorkspace {
  objectives: Objective[];
  milestones: Milestone[];
  tasks: PlanTask[];
}
