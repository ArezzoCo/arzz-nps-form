import { Form, Prisma } from "@prisma/client";
import db from "../db.server";
import { connect } from "http2";

export async function GetForm(id: number): Promise<Form | null> {
  const form = await db.form.findUnique({
    where: { id },
    include: {
      questions: true,
      OrderNPS: true,
    },
  });

  if (!form) return null;

  return form;
}

export async function GetForms(
  filter: Partial<Form> = {},
  skip = 0,
  take = 10,
): Promise<Form[]> {
  const forms = await db.form.findMany({
    where: {
      ...filter,
    },
    skip,
    take,
    include: {
      questions: true,
      OrderNPS: true,
    }
  });

  return forms;
}

export async function CreateForm(
  formData: Prisma.FormCreateWithoutQuestionsInput,
  questions: Prisma.QuestionCreateWithoutFormInput[],
) /**: Promise<Form>*/ {
  console.log("CreateForm form", formData);
  console.log("CreateForm questions", questions);

  const formValues = await JSON.parse(formData as any);
  const questionValues = await JSON.parse(questions as any);


  const form = await db.form.create({
    data: {
      ...formValues,
      questions: {
        createMany: {
          data: questionValues,
        },
      },
    },
  });

  return form;
}

export async function UpdateForm(
  id: number,
  formData: Prisma.FormUpdateWithoutQuestionsInput,
  questions: Prisma.QuestionUpdateWithoutFormInput[],
)/*: Promise<Form> */ {
  console.log("UpdateForm form", formData);
  console.log("UpdateForm questions", questions);
  const formValues = await JSON.parse(formData as any);
  const questionValues = await JSON.parse(questions as any);
  const form = await db.form.update({
    data: {
      id: id,
      title: formValues.title,
      formType: formValues.formType,
      questions: {
        updateMany: questionValues.map((question: any)=>({
          where: { id: question.id },
          data: {
            question: question.question,
            questionType: question.questionType,
            options: question.options,
            required: question.required,
          }
        })),
      },
    },
    where: { id },
  });

  return form;
}

export async function DeleteForm(id: number): Promise<Form> {
  const form = await db.form.delete({
    where: { id },
    include: {
      questions: true,
      OrderNPS: true,
    }
  });

  return form;
}
