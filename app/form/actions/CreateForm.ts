import { Prisma } from "@prisma/client";
import db from "../../db.server"

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