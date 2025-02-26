import { Form, Prisma } from "@prisma/client";
import db from "../db.server";
import { connect } from "http2";


//TODO: fix update
export async function UpdateForm(
  id: number,
  formData: Prisma.FormUncheckedUpdateWithoutQuestionsInput,
  questionsData: Prisma.QuestionUncheckedUpdateWithoutFormInput[],
)/*: Promise<Form> */ {
  console.log("UpdateForm form", formData);
  console.log("UpdateForm questions", questionsData);

  const form = await db.form.update({
    where: { id },
    data: {
      title: formData.title, 
    }
  })
  console.log("updated form", form)
  
  return form
  const questions = await db.question.updateMany({
    where: { id },
    data: questionsData
  })
  console.log("updated questions", questions)
  

  return form
  // const form = await db.form.update({
  //   data: {
  //     id: id,
  //     title: formValues.title,
  //     formType: formValues.formType,
  //     customerMetafieldKey: formValues.customerMetafieldKey,
  //     customerMetafieldNamespace: formValues.customerMetafieldNamespace
  //   },
  //   where: { id },
  // });

  //return form;
}