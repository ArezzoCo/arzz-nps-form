import { Prisma, Question } from "@prisma/client"
import db from "../db.server"

export async function GetQuestion(id: number): Promise<Question | null> {
  const question = await db.question.findUnique({
    where: { id }
  })

  return question
}

export async function GetQuestions(
  filter: Partial<Question> = {},
  skip = 0,
  take = 10
): Promise<Question[]> {
  const questions = await db.question.findMany({
    where: {
      ...filter
    },
    skip,
    take
  })

  return questions
}

export async function CreateQuestion(data: Prisma.QuestionCreateInput): Promise<Question> {
  const question = await db.question.create({
    data
  })

  return question
}

export async function UpdateQuestion(id: number, data: Prisma.QuestionUpdateInput): Promise<Question> {
  const question = await db.question.update({
    where: { id },
    data
  })

  return question
}

export async function DeleteQuestion(id: number): Promise<Question> {
  const question = await db.question.delete({
    where: { id }
  })

  return question
}