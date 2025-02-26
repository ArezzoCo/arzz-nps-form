import { Prisma } from "@prisma/client";
import db from "../../db.server";

export async function UpdateFormAndQuestions(
  id: number,
  formData: Prisma.FormUpdateInput
) {
  console.log("formdata", formData);

  const { questions, OrderNPS, ...formFields } = formData; // Remove OrderNPS

  // Buscar IDs das questões que pertencem ao formulário
  const existingQuestionIds = new Set(
    (await db.question.findMany({ 
      where: { formId: id }, 
      select: { id: true } 
    })).map((q) => q.id)
  );

  const receivedQuestionIds = new Set(
    (questions as any[])?.map((q) => q.id).filter((id) => id !== undefined) || []
  );

  const questionsToDelete = Array.from(existingQuestionIds).filter(
    (id) => !receivedQuestionIds.has(id)
  );

  // Remover questões excluídas
  if (questionsToDelete.length > 0) {
    await db.question.deleteMany({
      where: { id: { in: questionsToDelete } },
    });
  }

  // Separar questões novas e existentes
  const existingQuestions = (questions as any[])?.filter((q) => q.id !== undefined) || [];
  const newQuestions = (questions as any[])?.filter((q) => q.id === undefined) || [];

  const form = await db.form.update({
    where: { id },
    data: {
      ...formFields,
      updatedAt: new Date(),
      questions: {
        update: existingQuestions.map((q) => ({
          where: { id: q.id },
          data: {
            title: q.title,
            description: q.description,
            inputType: q.inputType,
            required: q.required,
            showQuestion: q.showQuestion,
            answers: q.answers,
          },
        })),
        create: newQuestions.map((q) => ({
          title: q.title,
          description: q.description,
          inputType: q.inputType,
          required: q.required,
          showQuestion: q.showQuestion,
          answers: q.answers,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  console.log("updated form", form);
  return form;
}
