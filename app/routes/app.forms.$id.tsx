import { Prisma, Question } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
import { authenticate } from "app/shopify.server";
import { useState } from "react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { redirect } = await authenticate.admin(request);
  if (params.id !== "new" && isNaN(Number(params.id))) {
    return redirect("/app");
  }
  return params.id;
};

export default function Index() {
  const id = useLoaderData<typeof loader>();

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
          <Card>{id === "new" ? <NewForm /> : <EditForm />}</Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

const NewForm = () => {
  const [isDirty, setIsDirty] = useState(false);

  const [form, setForm] = useState<Prisma.FormUncheckedCreateInput & { questions: Prisma.QuestionUncheckedCreateInput[] }>({
    title: "",
    isActive: false,
    questions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Prisma.QuestionUncheckedCreateInput>({
    title: "",
    description: "",
    inputType: "text",
    answers: JSON.stringify({}),
    required: false,
    formId: 0,
  });
  const [deleteIconVisibility, setDeleteIconVisibility] = useState(false);

  const toggleModal = () => {
    console.log("toggleModal");
    if(modalActive) setIsEditing(false);
    setModalActive(!modalActive);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.title) {
      setErrors((prev) => ({ ...prev, questionTitle: "Title is required" }));
      return;
    }

    if(!newQuestion.inputType) {
      setErrors((prev) => ({ ...prev, questionInputType: "Input type is required" }));
      return;
    }

    if(newQuestion.answers.length < 1) {
      setErrors((prev) => ({ ...prev, questionAnswers: "At least 2 answers are required" }));
      return;
    }

    const oldQuestion = form.questions.find((q) => q.id === newQuestion.id);
    if (oldQuestion) {
      console.log('oldQuestion', oldQuestion);
      const index = form.questions.indexOf(oldQuestion);
      form.questions[index] = newQuestion;

      setForm({
        ...form,
        questions: form.questions,
      }); 
    }else{  
      setForm({
        ...form,
        questions: [...form.questions, {...newQuestion, id: form.questions.length}],
      });
    }

    setNewQuestion({
      title: "",
      description: "",
      inputType: "text",
      answers: JSON.stringify({}),
      required: false,
      formId: 0,
    });
    toggleModal();
    setIsEditing(false);
  };

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  const handleQuestionChange = (key: string, value: any) => {
    setNewQuestion((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    console.log(newQuestion);
  }

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
  ]

  const handleFormSubmit = async () => {
    
  }

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
            onChange={(value)=>{handleChange("title", value)}}
            error={errors.name}
            autoComplete="off"
          />
          <Checkbox
            label="Active form?"
            checked={form?.isActive || false}
            onChange={(value) => handleChange("isActive", value)}
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
            items={(form?.questions as Array<Question>) || []}
            renderItem={(question, index) => (
              <ResourceItem id={index.toString()} 
                shortcutActions={[
                  {
                    content: "Delete",
                    onAction: () => {
                      setForm({
                        ...form,
                        questions: form.questions.filter((q) => q.id !== question.id),
                      });
                    }
                  }
                ]}
                onClick={() => {
                  setIsEditing(true);
                  setNewQuestion(question);
                  toggleModal();}}
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

      <Button variant="primary" disabled={!isDirty} onClick={()=>{console.log('enviar', form)}}>
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
            {isEditing && <Text as="h3" variant="bodyMd" tone="critical">Editando Questão</Text>}
            <TextField
              label="Question Title"
              value={newQuestion.title}
              onChange={(value) =>
                handleQuestionChange("title", value)
              }
              error={errors.questionTitle}
              autoComplete="off"
            />
            <TextField
              label="Question Description"
              value={newQuestion.description!}
              onChange={(value) =>
                handleQuestionChange("description", value)
              }
              multiline
              autoComplete="off"
            />
            <Select 
              label="Input Type"
              options={questionInputOptions}
              value={newQuestion.inputType}
              onChange={(value) =>
                handleQuestionChange("inputType", value)
              }
            />
            <Checkbox
              label="Required"
              checked={newQuestion.required || false}
              onChange={(value) =>
                handleQuestionChange("required", value)
              }
            />
            <TextField
              label="Answers"
              helpText="Enter the possible answers separated by comma ','"
              value={newQuestion.answers}
              onChange={(value) =>
                handleQuestionChange("answers", value)
              }
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </FormLayout>
  );
};

const EditForm = () => {
  return <>Edit Form</>;
};
