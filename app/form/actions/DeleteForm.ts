import { Form } from "@prisma/client";
import db from "../../db.server";

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
