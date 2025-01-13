import { DynamicForm, Prisma, Step } from "@prisma/client";
import { useState } from "react";
import { DynamicFormService } from "../dynamicForm.service";

export interface FormData extends Partial<DynamicForm>{
  steps: StepData[]
}

export interface StepData extends Partial<Step>{
  questions: QuestionData[]
}

export interface QuestionData extends Partial<Prisma.DynamicQuestionCreateInput>{
}

export interface OptionsData extends Partial<Prisma.OptionCreateInput>{}
export interface ConditionsData extends Partial<Prisma.QuestionConditionCreateInput>{}

export const useDynamicForm = () => {
  const [form, setform] = useState<FormData | null>(null);
  const [forms, setforms] = useState<DynamicForm[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null >(null);
  const service = new DynamicFormService();

  const createForm = async (data: Prisma.DynamicFormCreateInput) => {
    setLoading(true);
    try {
      const form = await service.createForm(data);
      setform(form);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const getFormById = async (id: string) => {
    setLoading(true);
    try {
      const form = await service.getFormById(id);
      setform(form);
    }
    catch (error: any) {
      setError((error as Error).message);
    }
    finally {
      setLoading(false);
    }
  }

  const getForms = async () => {
    setLoading(true);
    try {
      const forms = await service.getForms();
      setforms(forms);
    }
    catch (error: any) {
      setError((error as Error).message);
    }
    finally {
      setLoading(false);
    }
  }

  const updateForm = async (id: string, data: Prisma.DynamicFormUpdateInput) => {
    setLoading(true);
    try {
      const form = await service.updateForm(id, data);
      setform(form);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const addStepToForm = async (formID: string, stepData: Prisma.StepCreateInput) => {
    setLoading(true);
    try {
      const step = await service.addStepToForm(formID, stepData);
      const updatedForm = {...form};
      const stepWithQuestions = { ...step, questions: [] };
      updatedForm?.steps?.push(stepWithQuestions);
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const updateStep = async (stepID: string, data: Prisma.StepUpdateInput) => {
    setLoading(true);
    try {
      const step = await service.updateStep(stepID, data);
      const updatedForm = { ...form };
      const stepIndex = updatedForm?.steps?.findIndex(step => step.id === stepID);
      if (stepIndex !== undefined && stepIndex !== -1) {
        if (updatedForm.steps && updatedForm.steps[stepIndex]) {
          updatedForm.steps[stepIndex] = { ...step, questions: updatedForm.steps[stepIndex].questions };
        }
        setform(updatedForm);
      }
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const deleteStep = async (stepID: string) => {
    setLoading(true);
    try {
      await service.deleteStep(stepID);
      const updatedForm = { ...form };
      updatedForm.steps = updatedForm.steps?.filter(step => step.id !== stepID);
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const addQuestionToStep = async (stepID: string, questionData: Prisma.DynamicQuestionCreateInput) => {
    setLoading(true);
    try {
      const question = await service.addQuestionToStep(stepID, questionData);
      const updatedForm = { ...form };
      const stepIndex = updatedForm?.steps?.findIndex(step => step.id === stepID);
      if (stepIndex !== undefined && stepIndex !== -1) {
        if (updatedForm.steps && updatedForm.steps[stepIndex]) {
          updatedForm.steps[stepIndex].questions.push(question);
        }
        setform(updatedForm);
      }
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const updateQuestion = async (questionID: string, data: Prisma.DynamicQuestionUpdateInput) => {
    setLoading(true);
    try {
      const question = await service.updateQuestion(questionID, data);
      const updatedForm = { ...form };
      updatedForm.steps?.forEach(step => {
        step.questions = step.questions.map(q => q.id === questionID ? question : q)
      })
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const deleteQuestion = async (questionID: string) => {
    setLoading(true);
    try {
      await service.deleteQuestion(questionID);
      const updatedForm = { ...form };
      updatedForm.steps?.forEach(step => {
        step.questions = step.questions.filter(q => q.id !== questionID)
      })
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const addConditionToQuestion = async (questionID: string, conditionData: Prisma.QuestionConditionCreateInput) => {
    setLoading(true);
    try {
      const condition = await service.addConditionToQuestion(questionID, conditionData);
      const updatedForm = { ...form };
      updatedForm.steps?.forEach(step => {
        step.questions = step.questions.map(q => {
          if (q.id === questionID) {
            q.conditions.push(condition);
          }
          return q;
        })
      })
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const updateCondition = async (conditionID: string, data: Prisma.QuestionConditionUpdateInput) => {
    setLoading(true);
    try {
      const condition = await service.updateCondition(conditionID, data);
      //setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const deleteCondition = async (conditionID: string) => {
    setLoading(true);
    try {
      await service.deleteCondition(conditionID);
      const updatedForm = { ...form };
      updatedForm.steps?.forEach(step => {
        step.questions = step.questions.map(q => {
          q.conditions = q.conditions.filter(c => c.id !== conditionID)
          return q;
        })
      })
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const addOptionToQuestion = async (questionID: string, optionData: Prisma.OptionCreateInput) => {
    setLoading(true);
    try {
      const option = await service.addOptionToQuestion(questionID, optionData);
      const updatedForm = { ...form };
      updatedForm.steps?.forEach(step => {
        step.questions = step.questions.map(q => {
          if (q.id === questionID) {
            q.options.push(option);
          }
          return q;
        })
      })
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const updateOption = async (optionID: string, data: Prisma.OptionUpdateInput) => {
    setLoading(true);
    try {
      const option = await service.updateOption(optionID, data);
      const updatedForm = { ...form };
      updatedForm.steps?.forEach(step => {
        step.questions = step.questions.map(q => {
          q.options = q.options.map(o => o.id === optionID ? option : o)
          return q;
        })
      })
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const deleteOption = async (optionID: string) => {
    setLoading(true);
    try {
      await service.deleteOption(optionID);
      const updatedForm = { ...form };
      updatedForm.steps?.forEach(step => {
        step.questions = step.questions.map(q => {
          q.options = q.options.filter(o => o.id !== optionID)
          return q;
        })
      })
      setform(updatedForm);
    } catch (error: any) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  

  return {
    form,
    forms,
    loading,
    error,
    createForm,
    getFormById,
    getForms,
    updateForm,
    addStepToForm,
    updateStep,
    deleteStep,
    addQuestionToStep,
    updateQuestion,
    deleteQuestion,
    addConditionToQuestion,
    updateCondition,
    deleteCondition,
    addOptionToQuestion,
    updateOption,
    deleteOption
  }
}