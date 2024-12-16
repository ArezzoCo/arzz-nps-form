import { Form, Prisma, Question } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Button,
  Card,
  Checkbox,
  FormLayout,
  Layout,
  Modal,
  Page,
  ResourceItem,
  ResourceList,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { CreateForm, GetForm } from "app/form/form.service";
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

export const action = async ({ request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const form = formData.get(
    "form",
  ) as unknown as Prisma.FormUncheckedCreateInput;
  const questions = formData.get(
    "questions",
  ) as unknown as Prisma.QuestionCreateWithoutFormInput[];

  console.log("action form", form);
  console.log("action questions", questions);

  CreateForm(form, questions);
  return null;
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

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
          <Card>{data.params === "new" ? <NewForm /> : <FormComponent formProp={data.form as Prisma.FormUncheckedCreateInput} />}</Card>
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
    setQuestions((prev) => prev.map((q, i) => (i === index ? question : q)));
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
  };
};

const NewForm = () => {
  const [isDirty, setIsDirty] = useState(false);
  const { form, handleChange, formTypes } = useFormState();
  const {
    setNewQuestion,
    newQuestion,
    questions,
    handleQuestionChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
  } = useQuestionState();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalActive, setModalActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const toggleModal = () => {
    console.log("toggleModal");
    if (modalActive) setIsEditing(false);
    setModalActive(!modalActive);
  };

  const handleAddQuestion = () => {
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

    if (isEditing) {
      updateQuestion(questions.indexOf(newQuestion), newQuestion);
    } else {
      addQuestion(newQuestion);
    }
    toggleModal();
    setIsEditing(false);
  };

  const questionInputOptions = [
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Date", value: "date" },
    { label: "Time", value: "time" },
    { label: "Select", value: "select" },
    { label: "Radio", value: "radio" },
    { label: "Checkbox", value: "checkbox" },
  ];

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
                  setIsEditing(true);
                  setNewQuestion(question);
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
          content: isEditing ? "Edit Question" : "Add Question",
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
            {isEditing && (
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
            <Select
              label="Input Type"
              options={questionInputOptions}
              value={newQuestion.inputType}
              onChange={(value) => handleQuestionChange("inputType", value)}
            />
            <Checkbox
              label="Required"
              checked={newQuestion.required || false}
              onChange={(value) => handleQuestionChange("required", value)}
            />
            <TextField
              label="Answers"
              helpText="Enter the possible answers separated by comma ','"
              value={newQuestion.answers}
              onChange={(value) => handleQuestionChange("answers", value)}
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </FormLayout>
  );
};

const EditForm = () => {
  return <>TODO: Implementar View + edit form</>;
};

interface FormComponentProps {
  formProp?: Prisma.FormUncheckedCreateInput;
}
const FormComponent = ({ formProp }: FormComponentProps) => {
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
  } = useQuestionState();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalActive, setModalActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(()=>{
    if(formProp && formProp.questions){
      setForm(formProp);
      setQuestions(formProp.questions as any);
    }
  },[])

  const toggleModal = () => {
    console.log("toggleModal");
    if (modalActive) setIsEditing(false);
    setModalActive(!modalActive);
  };

  const handleAddQuestion = () => {
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

    if (isEditing) {
      updateQuestion(questions.indexOf(newQuestion), newQuestion);
    } else {
      addQuestion(newQuestion);
    }
    toggleModal();
    setIsEditing(false);
  };

  const questionInputOptions = [
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Date", value: "date" },
    { label: "Time", value: "time" },
    { label: "Select", value: "select" },
    { label: "Radio", value: "radio" },
    { label: "Checkbox", value: "checkbox" },
  ];

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
                  setIsEditing(true);
                  setNewQuestion(question);
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
          content: isEditing ? "Edit Question" : "Add Question",
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
            {isEditing && (
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
            <Select
              label="Input Type"
              options={questionInputOptions}
              value={newQuestion.inputType}
              onChange={(value) => handleQuestionChange("inputType", value)}
            />
            <Checkbox
              label="Required"
              checked={newQuestion.required || false}
              onChange={(value) => handleQuestionChange("required", value)}
            />
            <TextField
              label="Answers"
              helpText="Enter the possible answers separated by comma ','"
              value={newQuestion.answers}
              onChange={(value) => handleQuestionChange("answers", value)}
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </FormLayout>
  );
};
