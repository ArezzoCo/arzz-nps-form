import { Form, Prisma, Question } from "@prisma/client";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Divider,
  FormLayout,
  Icon,
  InlineStack,
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
import {
  ClipboardIcon,
  PageDownIcon,
  PageUpIcon,
} from "@shopify/polaris-icons";
import { CreateForm } from "app/form/actions/CreateForm";
import { AddNewQuestionModal } from "app/form/components/AddNewQuestionModal";
import InputTypeSelector from "app/form/components/InputTypeSelector";
import { GetForm, UpdateForm } from "app/form/form.service";
import { useFormState } from "app/form/hooks/useFormState";
import { useQuestionState } from "app/form/hooks/useQuestionState";
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
        customerMetafieldKey: "surveys",
        customerMetafieldNamespace: "custom",
        orderMetafieldKey: "surveys",
        orderMetafieldNamespace: "custom",
        questions: [],
      } as Prisma.FormUncheckedCreateInput,
      params: params.id,
    };
  }
  const form = await GetForm(Number(params.id));
  return {
    form,
    params: params.id,
  };
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
  if (params.id == "new") {
    await CreateForm(form, questions);

  } else {
    //update form
    console.log("update form");
    return null;
    await UpdateForm(Number(params.id), form, questions);
  }
  return redirect("/app");
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const isFormEdit = data.params == "new" ? false : true;
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
            <FormComponent
              formProp={data.form as Prisma.FormUncheckedCreateInput}
              isFormEdit={isFormEdit}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

//TODO: quando clicado em uma questão, carregar detalhes da mesa
//TODO: fix update de questões 

interface FormComponentProps {
  formProp?: Prisma.FormUncheckedCreateInput;
  isFormEdit?: boolean;
}
const FormComponent = ({ formProp, isFormEdit }: FormComponentProps) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const { form, formTypes, handleChange, setForm } = useFormState();
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
    setNpsData,
  } = useQuestionState();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalActive, setModalActive] = useState(false);
  const [isEditing, setIsEditing] = useState<{
    isEditing: boolean;
    index?: number;
  }>({
    isEditing: false,
  });

  useEffect(() => {
    if (formProp && formProp.questions) {
      setForm(formProp);
      setQuestions(formProp.questions as any);
    }
  }, []);

  const toggleModal = () => {
    console.log("toggleModal");
    if (modalActive) setIsEditing({ isEditing: false });
    setModalActive(!modalActive);
  };

  const handleAddQuestion = () => {
    console.log("add nova questao", newQuestion);

    if (newQuestion.inputType == "nps") {
      setNewQuestion({
        ...newQuestion,
        answers: JSON.stringify(npsData),
      });
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
      console.log("update question");
      const index = isEditing.index !== undefined ? isEditing.index : -1;
      if (index >= 0) {
        updateQuestion(index, newQuestion);
      }
    } else {
      console.log("questao adicionada", newQuestion);
      addQuestion(newQuestion);
    }
    toggleModal();
    setIsEditing({ isEditing: false });
  };

  const submit = useSubmit();
  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("submit form", form);
    console.log("submit questions", questions);

    const formData = new FormData();
    formData.append("form", JSON.stringify(form));
    formData.append("questions", JSON.stringify(questions));

    submit(formData, { method: "POST" });
    setIsLoading(false);
  };

  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importFormState, setImportFormState] = useState<string>();

  return (
    <FormLayout>
      <FormLayout.Group>
        <BlockStack gap="500">
          <BlockStack align="center" gap={"500"}>
            <Text as="h2" variant="headingLg">
              Form Configuration
            </Text>
            <ButtonGroup>
              <Button
                icon={<Icon source={ClipboardIcon} tone="base" />}
                onClick={() => {
                  const formState = {
                    ...form,
                    questions: {
                      ...questions,
                    },
                  };

                  const jsonCopy = JSON.stringify(formState, null, 2);

                  navigator.clipboard
                    .writeText(jsonCopy)
                    .then(() => {
                      console.log("JSON Copiado com Sucesso!", jsonCopy);
                      shopify.toast.show(
                        "Copiado para a área de transferência",
                      );
                    })
                    .catch((err) => {
                      console.error("Erro ao copiar o estado", err);
                    });
                }}
              >
                Export JSON
              </Button>
              <Button
                variant="primary"
                icon={<Icon source={PageUpIcon} tone="base" />}
                onClick={() => {
                  setImportModalOpen(true);
                }}
              >
                Import JSON
              </Button>
            </ButtonGroup>
          </BlockStack>

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
            Metafield Configuration
        </Text>
          <Text as="h3" variant="headingSm">
            Order Metafield
          </Text>
          <TextField
            label="Metafield Namespace"
            value={form?.orderMetafieldNamespace ?? undefined}
            onChange={(value) => {
              handleChange("orderMetafieldNamespace", value);
            }}
            autoComplete="off"
          />
          <TextField
            label="Metafield Key"
            value={form?.orderMetafieldKey ?? undefined}
            onChange={(value) => {
              handleChange("orderMetafieldKey", value);
            }}
            autoComplete="off"
          />

          <Text as="h3" variant="headingSm">
            Customer Metafield
          </Text>
          <TextField
            label="Metafield Namespace"
            value={form?.customerMetafieldNamespace ?? undefined}
            onChange={(value) => {
              handleChange("customerMetafieldNamespace", value);
            }}
            autoComplete="off"
          />
          <TextField
            label="Metafield Key"
            value={form?.customerMetafieldKey ?? undefined}
            onChange={(value) => {
              handleChange("customerMetafieldKey", value);
            }}
            autoComplete="off"
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
        loading={isLoading}
        onClick={() => {
          handleSubmit();
        }}
      >
        Save
      </Button>
      
      <AddNewQuestionModal
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
        isEditing={isEditing}
        handleQuestionChange={handleQuestionChange}
        npsData={npsData}
        newQuestion={newQuestion}
        setNpsData={setNpsData}
        />
      

      <Modal
        open={importModalOpen}
        title="Import JSON"
        onClose={() => {
          setImportModalOpen(false);
        }}
        primaryAction={{
          content: "Save State",
          onAction: () => {
            try {
              if (!importFormState) {
                shopify.toast.show("State cannot be empty", {
                  isError: true,
                });
                return;
              }

              const inputObj = JSON.parse(importFormState);
              setForm(inputObj);

              const questionsObj = inputObj.questions;
              console.log(questionsObj);
              setQuestions(questionsObj);
              console.log("state questions", questions);
            } catch (err) {
            } finally {
              setImportFormState("");
              setImportModalOpen(false);
            }
          },
        }}
      >
        <Modal.Section>
          <TextField
            label="Import JSON State"
            value={importFormState}
            autoComplete="off"
            multiline={6}
            onChange={(value) => {
              setImportFormState(value);
            }}
          />
        </Modal.Section>
      </Modal>
    </FormLayout>
  );
};
