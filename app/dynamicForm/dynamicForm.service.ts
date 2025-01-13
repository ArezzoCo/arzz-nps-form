import { DynamicForm, Prisma, PrismaClient, Step } from "@prisma/client";
import db from "../db.server";

const prisma = new PrismaClient();

export class DynamicFormService {
  
  async createForm(data: Prisma.DynamicFormCreateInput){
    return await prisma.dynamicForm.create({
      data,
    })
  }

  async getFormById(id: string): Promise<DynamicForm | null>{
    return await prisma.dynamicForm.findUnique({
      where: {id},
      include: {
        steps: {
          include: {
            questions: {
              include: {
                options: true,
                conditions: true
              }
            }
          }
        }
      }
    })
  }

  async getForms(): Promise<DynamicForm[]>{
    return await prisma.dynamicForm.findMany({
      include: {
        steps: {
          include: {
            questions: {
              include: {
                options: true,
                conditions: true
              }
            }
          }
        }
      }
    })
  }

  async updateForm(id: string, data: Prisma.DynamicFormUpdateInput): Promise<DynamicForm>{
    return await prisma.dynamicForm.update({
      where: {id},
      data
    })
  }

  async addStepToForm(
    formID: string,
    stepData: Prisma.StepCreateInput
  ): Promise<Step>{
    return await prisma.step.create({
      data: {
        ...stepData,
        form: {
          connect : {
            id: formID
          }
        }
      }
    })
  }

  async updateStep(
    stepID: string,
    data: Prisma.StepUpdateInput
  ): Promise<Step>{
    return await prisma.step.update({
      where: {id: stepID},
      data
    })
  }

  async deleteStep(stepID: string): Promise<Step>{
    return await prisma.step.delete({
      where: {id: stepID}
    })
  }

  async addQuestionToStep(
    stepID: string,
    questionData: Prisma.DynamicQuestionCreateInput
  ){
    return await prisma.dynamicQuestion.create({
      data: {
        ...questionData,
        step: {
          connect: {
            id: stepID
          }
        }
      }
    })
  }

  async updateQuestion(
    questionID: string,
    data: Prisma.DynamicQuestionUpdateInput
  ){
    return await prisma.dynamicQuestion.update({
      where: {id: questionID},
      data: {
        ...data
      }
    })
  }

  async deleteQuestion(questionID: string){
    return await prisma.dynamicQuestion.delete({
      where: {id: questionID}
    })
  }

  async addConditionToQuestion(
    questionID: string,
    conditionData: Prisma.QuestionConditionCreateInput
  ){
    return await prisma.questionCondition.create({
      data: {
        ...conditionData,
        question: {
          connect: {
            id: questionID
          }
        }
      }
    })
  }

  async updateCondition(
    conditionID: string,
    data: Prisma.QuestionConditionUpdateInput
  ){
    return await prisma.questionCondition.update({
      where: {id: conditionID},
      data
    })
  }

  async deleteCondition(conditionID: string){
    return await prisma.questionCondition.delete({
      where: {id: conditionID}
    })
  }

  async addOptionToQuestion(
    questionID: string,
    optionData: Prisma.OptionCreateInput
  ){
    return await prisma.option.create({
      data: {
        ...optionData,
        question: {
          connect: {
            id: questionID
          }
        }
      }
    })
  }


  async updateOption(
    optionID: string,
    data: Prisma.OptionUpdateInput
  ){
    return await prisma.option.update({
      where: {id: optionID},
      data
    })
  }

  async deleteOption(optionID: string){
    return await prisma.option.delete({
      where: {id: optionID}
    })
  }

}