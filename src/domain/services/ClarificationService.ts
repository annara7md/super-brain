import {
  ClarificationAnswerInput,
  ClarificationStartInput,
  ClarificationState,
  ClarificationStepOutput,
} from "../models/clarification";

export class ClarificationService {
  start(input: ClarificationStartInput): ClarificationStepOutput {
    const next = input.questions[0];
    const state: ClarificationState = {
      status: next ? "asking" : "complete",
      queue: input.questions,
      currentQuestionId: next?.id,
      answers: {},
    };

    return {
      state,
      prompt: next?.question,
    };
  }

  answer(state: ClarificationState, input: ClarificationAnswerInput): ClarificationStepOutput {
    if (state.status !== "asking") {
      return { state };
    }

    if (state.currentQuestionId !== input.questionId) {
      throw new Error(
        `Expected answer for question ${state.currentQuestionId}, received ${input.questionId}.`,
      );
    }

    const queue = [...state.queue];
    const answered = queue.shift();
    const answers = { ...state.answers, [input.questionId]: input.answer.trim() };
    const next = queue[0];

    const nextState: ClarificationState = {
      status: next ? "asking" : "complete",
      queue,
      currentQuestionId: next?.id,
      answers,
    };

    return {
      state: nextState,
      completedQuestionId: answered?.id,
      prompt: next?.question,
    };
  }
}
