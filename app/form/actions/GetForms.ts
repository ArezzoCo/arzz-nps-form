import db from "../../db.server";
import { Form } from "@prisma/client";

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