import { Form } from "@prisma/client";
import db from "../../db.server"

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