import { FormEvent, useMemo, useState } from "react";
import { AnswerMap, Question } from "./types";

type ClarificationFlowViewProps = {
  questions: Question[];
  initialAnswers?: AnswerMap;
  onComplete: (answers: AnswerMap) => void;
};

export function ClarificationFlowView({
  questions,
  initialAnswers = {},
  onComplete,
}: ClarificationFlowViewProps) {
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [questionIndex, setQuestionIndex] = useState(0);

  const currentQuestion = questions[questionIndex];
  const currentAnswer = useMemo(
    () => (currentQuestion ? answers[currentQuestion.id] ?? "" : ""),
    [answers, currentQuestion],
  );

  if (!currentQuestion) {
    return (
      <section aria-labelledby="clarification-title">
        <h2 id="clarification-title">2. Clarification</h2>
        <p>No clarification questions were generated.</p>
      </section>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = currentAnswer.trim();
    if (!trimmedAnswer) {
      return;
    }

    const nextAnswers = { ...answers, [currentQuestion.id]: trimmedAnswer };
    setAnswers(nextAnswers);

    const isLastQuestion = questionIndex === questions.length - 1;
    if (isLastQuestion) {
      onComplete(nextAnswers);
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  const canMoveBack = questionIndex > 0;

  return (
    <section aria-labelledby="clarification-title">
      <h2 id="clarification-title">2. Clarification</h2>
      <p>
        Question {questionIndex + 1} of {questions.length}
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="clarification-answer">{currentQuestion.prompt}</label>
        {currentQuestion.helperText ? <small>{currentQuestion.helperText}</small> : null}

        <textarea
          id="clarification-answer"
          rows={6}
          value={currentAnswer}
          onChange={(event) =>
            setAnswers((existing) => ({
              ...existing,
              [currentQuestion.id]: event.target.value,
            }))
          }
          required
        />

        <div>
          <button
            type="button"
            disabled={!canMoveBack}
            onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
          >
            Previous
          </button>
          <button type="submit" disabled={!currentAnswer.trim()}>
            {questionIndex === questions.length - 1 ? "Finish clarification" : "Next"}
          </button>
        </div>
      </form>
    </section>
  );
}
