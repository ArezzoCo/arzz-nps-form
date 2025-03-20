import { Prisma } from "@prisma/client";
import { useState } from "react";

export const useQuestionState = () => {
  const [questions, setQuestions] = useState<(typeof question)[]>([]);
  const [question, setQuestion] =
    useState<Prisma.QuestionCreateWithoutFormInput>({
      title: "",
      description: "",
      inputType: "select one",
      answers: "  ",
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
    if (key === "answers" && question.inputType === "nps") {
      try {
        const parsedValue = JSON.parse(value);
        setNpsData(parsedValue);
        console.log("parsedValue", parsedValue);
        console.log("npsData", npsData);
      } catch (e) {
        console.error("Error parsing JSON", e);
      }
    }
    setQuestion((prev) => ({ ...prev, [key]: value }));
  };
  const addQuestion = (question: Prisma.QuestionCreateWithoutFormInput) => {
    setQuestions((prev) => [...prev, question]);
  };

  const updateQuestion = (
    index: number,
    question: Prisma.QuestionCreateWithoutFormInput,
  ) => {
    if (question.inputType === "nps") {
      try {
        const parsedAnswers = JSON.parse(question.answers);
        setNpsData(parsedAnswers);
      } catch (error) {
        console.error("Failed to parse NPS data:", error);
      }
    }
    console.log("updateQuestion", index, question);
    setQuestions((prev) => {
      const newQuestions = [...prev]; // Cria uma cópia do array
      newQuestions[index] = question.inputType == 'nps'? {...question, answers: JSON.stringify(npsData)} : {...question}; // Cria uma cópia do objeto question
      return newQuestions;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    setQuestion,
    question,
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
