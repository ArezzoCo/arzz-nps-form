import { Form, Prisma } from "@prisma/client";
import db from "../db.server";

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
  data: Prisma.FormUpdateInput,
): Promise<Form> {
  const form = await db.form.update({
    where: { id },
    data,
  });

  return form;
}

export async function DeleteForm(id: number): Promise<Form> {
  const form = await db.form.delete({
    where: { id },
  });

  return form;
}
