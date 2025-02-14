import { Prisma } from "@prisma/client";
import { useState } from "react";

export const useQuestionState = () => {
  const [questions, setQuestions] = useState<
    Prisma.QuestionCreateWithoutFormInput[]
  >([]);
  const [newQuestion, setNewQuestion] =
    useState<Prisma.QuestionCreateWithoutFormInput>({
      title: "",
      description: "",
      inputType: "text",
      answers: "",
      required: true,
      showQuestion: true,
    });
  interface npsData {
    npsRange: number;
    firstRange?: number;
    firstQuestion?: Partial<Prisma.QuestionCreateWithoutFormInput>;

    secondRange?: number;
    secondQuestion?: Partial<Prisma.QuestionCreateWithoutFormInput>;
  }
  const [npsData, setNpsData] = useState<npsData>({
    npsRange: 10,
    firstRange: 8,
    firstQuestion: {
      required: true,
      showQuestion: true,
    },
    secondRange: 6,
    secondQuestion: {
      required: true,
      showQuestion: true,
    },
  });

  const handleQuestionChange = (key: string, value: any) => {
    setNewQuestion((prev) => ({ ...prev, [key]: value }));
  };
  const addQuestion = (question: Prisma.QuestionCreateWithoutFormInput) => {
    setQuestions((prev) => [...prev, question]);
  };

  const updateQuestion = (
    index: number,
    question: Prisma.QuestionCreateWithoutFormInput,
  ) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = question;
      return newQuestions;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    setNewQuestion,
    newQuestion,
    questions,
    handleQuestionChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
    setQuestions,

    npsData,
    setNpsData,
  };
};
