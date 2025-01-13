import { Form, Prisma, Question } from "@prisma/client";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Button,
  Card,
  Checkbox,
  Divider,
  FormLayout,
  Layout,
  Modal,
  Page,
  RangeSlider,
  ResourceItem,
  ResourceList,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import InputTypeSelector from "app/form/components/InputTypeSelector";
import { CreateForm, GetForm, UpdateForm } from "app/form/form.service";
import { authenticate } from "app/shopify.server";
import { useEffect, useState } from "react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { redirect } = await authenticate.admin(request);
  if (params.id !== "new" && isNaN(Number(params.id))) {
    return redirect("/app");
  }

  if (params.id === "new") {
    return {
      form: {
        title: "",
        formType: "nps",
        questions: [],
      } as Prisma.FormUncheckedCreateInput,
      params: params.id,
    }
  }
  const form = await GetForm(Number(params.id));
  return {
    form,
    params: params.id
  }
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const form = formData.get(
    "form",
  ) as unknown as Prisma.FormUncheckedCreateInput;
  const questions = formData.get(
    "questions",
  ) as unknown as Prisma.QuestionCreateWithoutFormInput[];

  console.log("action form", form);
  console.log("action questions", questions);
  //create or update form
  console.log(params.id);
  if (params.id == "new"){
    console.log('aaa')
    await CreateForm(form, questions);
  }else{
    //update form
    console.log("update form");
    await UpdateForm(Number(params.id), form, questions);
  }
  return redirect("/app");
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const isFormEdit = data.params == "new"? false : true;
  return (
    <Page
      title="NPS Form"
      backAction={{
        content: "Back",
        url: "/app",
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <FormComponent formProp={data.form as Prisma.FormUncheckedCreateInput} isFormEdit={isFormEdit} />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

const useFormState = () => {
  const formTypes = [
    { label: "NPS", value: "nps" },
    { label: "Survey", value: "survey" },
  ]

  const [form, setForm] = useState<Prisma.FormUncheckedCreateInput>({
    title: "",
    formType: formTypes[0].value,
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  
  return { setForm ,form, formTypes, handleChange };
};

const useQuestionState = () => {
  const [questions, setQuestions] = useState<
    Prisma.QuestionCreateWithoutFormInput[]
  >([]);
  const [newQuestion, setNewQuestion] =
    useState<Prisma.QuestionCreateWithoutFormInput>({
      title: "",
      description: "",
      inputType: "text",
      answers: "",
      required: false,
    });
  interface npsData {
    npsRange: number;
    firstRange?: number;
    firstQuestion?: Prisma.QuestionCreateWithoutFormInput;

    secondRange?: number;
    secondQuestion?: Prisma.QuestionCreateWithoutFormInput;
  }
  const [npsData, setNpsData] = useState<npsData>({
    npsRange: 10,
  });

  const handleQuestionChange = (key: string, value: any) => {
    setNewQuestion((prev) => ({ ...prev, [key]: value }));
  };
  const addQuestion = (question: Prisma.QuestionCreateWithoutFormInput) => {
    setQuestions((prev) => [...prev, question]);
  };



  const updateQuestion = (
    index: number,
    question: Prisma.QuestionCreateWithoutFormInput,
  ) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = question;
      return newQuestions;
    })
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    setNewQuestion,
    newQuestion,
    questions,
    handleQuestionChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
    setQuestions,

    npsData,
    setNpsData
  };
};

interface FormComponentProps {
  formProp?: Prisma.FormUncheckedCreateInput;
  isFormEdit?: boolean;
}
const FormComponent = ({ formProp, isFormEdit }: FormComponentProps) => {
  const [isDirty, setIsDirty] = useState(false);
  const { form, formTypes ,handleChange, setForm } = useFormState();
  const {
    setNewQuestion,
    newQuestion,
    questions,
    handleQuestionChange,
    setQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion,


    npsData,
    setNpsData
  } = useQuestionState();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalActive, setModalActive] = useState(false);
  const [isEditing, setIsEditing] = useState<{
    isEditing: boolean;
    index?: number;
  }>({
    isEditing: false,
  });

  useEffect(()=>{
    if(formProp && formProp.questions){
      setForm(formProp);
      setQuestions(formProp.questions as any);
    }
  },[])

  const toggleModal = () => {
    console.log("toggleModal");
    if (modalActive) setIsEditing({ isEditing: false });
    setModalActive(!modalActive);
  };

  const handleAddQuestion = () => {
    console.log('add nova questao', newQuestion)

    if(newQuestion.inputType == 'nps'){
      setNewQuestion({
        ...newQuestion,
        answers: JSON.stringify(npsData)
      })
    }

    if (!newQuestion.title) {
      setErrors((prev) => ({ ...prev, questionTitle: "Title is required" }));
      return;
    }

    if (!newQuestion.inputType) {
      setErrors((prev) => ({
        ...prev,
        questionInputType: "Input type is required",
      }));
      return;
    }

    if (newQuestion.answers.length < 1) {
      setErrors((prev) => ({
        ...prev,
        questionAnswers: "At least 2 answers are required",
      }));
      return;
    }



    if (isEditing.isEditing) {
      console.log("update question", );
      const index = isEditing.index !== undefined ? isEditing.index : -1;
      if (index >= 0) {
        updateQuestion(index, newQuestion);
      }
    } else {
      console.log('questao adicionada', newQuestion)
      addQuestion(newQuestion);
    }
    toggleModal();
    setIsEditing({ isEditing: false });
  };

  const submit = useSubmit();
  const handleSubmit = async () => {
    console.log("submit form", form);
    console.log("submit questions", questions);

    const formData = new FormData();
    formData.append("form", JSON.stringify(form));
    formData.append("questions", JSON.stringify(questions));

    submit(formData, { method: "POST" });
  };

  return (
    <FormLayout>
      <FormLayout.Group>
        <BlockStack gap="500">
          <Text as="h2" variant="headingLg">
            Form Configuration
          </Text>
          {isFormEdit && (
            <Text as="h3" variant="bodyMd" tone="critical">
              Editing Form
            </Text>
          )}
          <TextField
            label="Form name"
            value={form?.title}
            onChange={(value) => {
              handleChange("title", value);
            }}
            error={errors.name}
            autoComplete="off"
          />
          <Select
            label="Form Type"
            options={formTypes}
            value={form?.formType}
            onChange={(value) => {
              handleChange("formType", value);
            }}
          />
        </BlockStack>
      </FormLayout.Group>

      <FormLayout.Group>
        <BlockStack gap="500">
          <Text as="h3" variant="headingMd">
            Questions
          </Text>
          <Button
            onClick={() => {
              toggleModal();
            }}
          >
            Add Question
          </Button>

          <ResourceList
            resourceName={{ singular: "question", plural: "questions" }}
            items={(questions as Array<Question>) || []}
            renderItem={(question, index) => (
              <ResourceItem
                id={index.toString()}
                shortcutActions={[
                  {
                    content: "Delete",
                    onAction: () => {
                      removeQuestion(questions.indexOf(question));
                    },
                  },
                ]}
                onClick={() => {
                  setIsEditing({
                    isEditing: true,
                    index: questions.indexOf(question),
                  });
                  toggleModal();
                }}
              >
                <Text as="h2" variant="bodyMd">
                  {question.title}
                </Text>
                <div>{question.description}</div>
              </ResourceItem>
            )}
          />
        </BlockStack>
      </FormLayout.Group>

      <Button
        variant="primary"
        disabled={isDirty}
        onClick={() => {
          handleSubmit();
        }}
      >
        Save
      </Button>

      <Modal
        open={modalActive}
        onClose={toggleModal}
        title="Add New Question"
        primaryAction={{
          content: isEditing.isEditing ? "Edit Question" : "Add Question",
          onAction: handleAddQuestion,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleModal,
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            {isEditing.isEditing && (
              <Text as="h3" variant="bodyMd" tone="critical">
                Editando Questão
              </Text>
            )}
            <TextField
              label="Question Title"
              value={newQuestion.title}
              onChange={(value) => handleQuestionChange("title", value)}
              error={errors.questionTitle}
              autoComplete="off"
            />
            <TextField
              label="Question Description"
              value={newQuestion.description!}
              onChange={(value) => handleQuestionChange("description", value)}
              multiline
              autoComplete="off"
            />
            <InputTypeSelector
              label="Input Type"
              value={newQuestion.inputType}
              onChange={(value) => handleQuestionChange("inputType", value)}
            />
            <Checkbox
              label="Required"
              checked={newQuestion.required || false}
              onChange={(value) => handleQuestionChange("required", value)}
            />
            {newQuestion.inputType !== "nps" && (
              <TextField
                label="Answers"
                helpText="Enter the possible answers separated by comma ','"
                value={newQuestion.answers}
                onChange={(value) => handleQuestionChange("answers", value)}
                autoComplete="off"
              />
            )}
            {newQuestion.inputType === "nps" && (
            <BlockStack gap="500">
              <Text as="h2" variant="headingMd">NPS Options</Text>
              
              <RangeSlider
                label={`NPS Range: ${npsData.npsRange}`}
                value={npsData.npsRange}
                onChange={(value) => setNpsData({...npsData, npsRange: Number(value)})} 
                min={1}
                max={10}
              />

              <Text as="h3" variant="headingMd">First Conditional</Text>

              {/* range and question input */}
              <Text as="p" variant="bodyMd">The answer will be considered OK</Text>
              <RangeSlider 
                label={`Render when the NPS is below ${npsData.firstRange}`}
                value={npsData.firstRange!}
                min={1}
                max={npsData.npsRange}
                onChange={(value) => setNpsData({...npsData, firstRange: Number(value)})}
              />
              {/* Question Input */}
              <TextField
                label="Question Title"
                autoComplete="off"
                value={npsData.firstQuestion?.title}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  firstQuestion: {
                    ...npsData.firstQuestion!,
                    title: value
                  }
                })}}
              />
              <TextField
                label="Question Description"
                autoComplete="off"
                value={npsData.firstQuestion?.description ?? ""}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  firstQuestion: {
                    ...npsData.firstQuestion!,
                    description: value
                  }
                })}}
              />
              <InputTypeSelector 
                label="Input Type"
                value={npsData.firstQuestion?.inputType!}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  firstQuestion: {
                    ...npsData.firstQuestion!,
                    inputType: value
                  }
                })}}
                noNps={true}
              />
              <Checkbox
                label="Required"
                checked={npsData.firstQuestion?.required || false}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  firstQuestion: {
                    ...npsData.firstQuestion!,
                    required: value
                  }
                })}}
              />
              <Divider/>

              {/* Second Question */}

              <Text as="h3" variant="headingMd">Second Conditional</Text>
              <Text as="p" variant="bodyMd" tone="critical">The answer will be considered Bad</Text>

              <RangeSlider 
                label={`Render when the NPS is below ${npsData.secondRange}`}
                value={npsData.secondRange!}
                min={1}
                max={npsData.firstRange! -1}
                onChange={(value) => setNpsData({...npsData, secondRange: Number(value)})}
              />

              <TextField
                label="Question Title"
                autoComplete="off"
                value={npsData.secondQuestion?.title}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  secondQuestion: {
                    ...npsData.secondQuestion!,
                    title: value
                  }
                })}}
              />

              <TextField
                label="Question Description"
                autoComplete="off"
                value={npsData.secondQuestion?.description ?? ""}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  secondQuestion: {
                    ...npsData.secondQuestion!,
                    description: value
                  }
                })}}
              />
              <InputTypeSelector
                label="Input Type"
                value={npsData.secondQuestion?.inputType!}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  secondQuestion: {
                    ...npsData.secondQuestion!,
                    inputType: value
                  }
                })}}
                noNps={true}
              />
              <Checkbox
                label="required"
                checked={npsData.secondQuestion?.required || false}
                onChange={(value)=>{setNpsData({
                  ...npsData,
                  secondQuestion: {
                    ...npsData.secondQuestion!,
                    required: value
                  }
                })
                }}
                />


              

            </BlockStack>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </FormLayout>
  );
};

