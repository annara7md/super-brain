export type ClarificationStateStatus = "idle" | "asking" | "answered" | "complete";

export interface ClarificationQuestion {
  id: string;
  question: string;
  required: boolean;
}

export interface ClarificationState {
  status: ClarificationStateStatus;
  queue: ClarificationQuestion[];
  currentQuestionId?: string;
  answers: Record<string, string>;
}

export interface ClarificationStartInput {
  questions: ClarificationQuestion[];
}

export interface ClarificationAnswerInput {
  questionId: string;
  answer: string;
}

export interface ClarificationStepOutput {
  state: ClarificationState;
  prompt?: string;
  completedQuestionId?: string;
}
