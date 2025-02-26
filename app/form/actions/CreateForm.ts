import { Prisma } from "@prisma/client";
import db from "../../db.server";

export async function CreateForm(
  formData: Prisma.FormCreateInput,
) /**: Promise<Form>*/ {
  console.log("formdata", typeof formData, formData);
  const form = await db.form.create({
    data: {
      ...formData,
      questions: {
        createMany: {
          data: Array.isArray(formData.questions)
            ? formData.questions.map((question) => ({
                ...question,
              }))
            : [],
        },
      },
    },
  });

  return form;
}
