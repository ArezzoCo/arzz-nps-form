import { Form, Prisma, Question } from "@prisma/client";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Badge,
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
import { GetForm } from "app/form/actions/GetForm";
import { UpdateFormAndQuestions } from "app/form/actions/UpdateForm";
import { AddNewQuestionModal } from "app/form/components/AddNewQuestionModal";
import { DropdownInput } from "app/form/components/DropdownInput";
import InputTypeSelector from "app/form/components/InputTypeSelector";
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
        orderMetafieldKey: "nps",
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
  const requestFormData = await request.formData();
  const requestData = Object.fromEntries(requestFormData);
  const formData: Prisma.FormUncheckedCreateInput = JSON.parse(
    requestData?.form as string,
  );
  const questionsData: Prisma.QuestionCreateWithoutFormInput[] = Array.from(
    formData.questions as any,
  );

  console.log("formData", typeof formData, formData);
  console.log("questionsData", typeof questionsData, questionsData);
  //create or update form
  console.log(params.id);
  if (params.id == "new") {
    await CreateForm(formData);
  } else {
    //update form
    console.log("form", formData);
    await UpdateFormAndQuestions(Number(formData.id), formData);
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
  const [isLoading, setIsLoading] = useState(false);
  const { form, formTypes, handleChange, setForm } = useFormState();
  const {
    setQuestion,
    question,
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
    question?: typeof question;
  }>({
    isEditing: false,
  });

  useEffect(() => {
    if (formProp && formProp.questions) {
      setForm(formProp);
      setQuestions(formProp.questions as any);
    }
  }, []);

  const toggleModal = (questionData?: typeof question) => {
    console.log("toggleModal");

    //set editing to false when closing
    if (modalActive) setIsEditing({ isEditing: false });

    //updates question when data is passed
    if (questionData) {
      setQuestion(questionData);
    }
    if (questionData?.inputType == "nps") {
      console.log("isNPS", JSON.parse(questionData.answers));
      setNpsData(JSON.parse(questionData.answers));
    }

    setModalActive(!modalActive);
  };

  const handleAddQuestion = () => {
    console.log("add nova questao", question);

    if (!question.inputType) {
      setErrors((prev) => ({
        ...prev,
        questionInputType: "Select an input type",
      }));
      shopify.toast.show(errors.questionInputType);
      return;
    }

    if (question.inputType == "nps") {
      setQuestion({
        ...question,
        answers: JSON.stringify(npsData),
      });
    }

    if (!question.title) {
      setErrors((prev) => ({ ...prev, questionTitle: "Title is required" }));
      shopify.toast.show("Title is required");
      return;
    }

    if (!question.inputType) {
      setErrors((prev) => ({
        ...prev,
        questionInputType: "Input type is required",
      }));
      shopify.toast.show("Input type is required");
      return;
    }

    if (question.answers.length < 1) {
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
        updateQuestion(index, question);
      }
    } else {
      console.log("questao adicionada", question);
      shopify.toast.show("Questão Adicionada!");
      addQuestion(question);
    }
    toggleModal();
    setIsEditing({ isEditing: false });
  };

  const submit = useSubmit();
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      console.log("submit form", form);
      console.log("submit questions", questions);

      if (form.title == "") {
        return shopify.toast.show("Adicione um título");
      }

      if (questions.length < 1) {
        return shopify.toast.show("Adicione pelo menos uma questão");
      }

      const formData = new FormData();
      formData.append(
        "form",
        JSON.stringify({
          ...form,
          questions,
        }),
      );

      submit(formData, { method: "POST" });
    } catch (e: any) {
      shopify.toast.show(e);
    } finally {
      setIsLoading(false);
    }
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

          <Card>
            <DropdownInput
              titleChild={
                <Text as="h3" variant="headingSm">
                  Order Metafield
                </Text>
              }
              innerChild={
                <InlineStack align="start" gap={"500"}>
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
                </InlineStack>
              }
            />
          </Card>
          <Card>
            <DropdownInput
              titleChild={
                <Text as="h3" variant="headingSm">
                  Customer Metafield
                </Text>
              }
              innerChild={
                <InlineStack align="start" gap={"500"}>
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
                </InlineStack>
              }
            />
          </Card>
        </BlockStack>
      </FormLayout.Group>

      <FormLayout.Group>
        <BlockStack gap="500">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h3" variant="headingLg">
              Questions
            </Text>
            <Button
            variant="primary"
              onClick={() => {
                toggleModal();
              }}
            >
              Add Question
            </Button>
          </InlineStack>

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
                  console.log("edit click", question);
                  setIsEditing({
                    isEditing: true,
                    index: questions.indexOf(question),
                    question: question,
                  });
                  toggleModal(question);
                }}
              >
                <InlineStack gap={"500"}>
                  <BlockStack>
                    <Text as="h3" variant="headingMd">
                      {question.title}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {question.description}
                    </Text>
                  </BlockStack>

                  <Badge
                    tone={question.inputType == "nps" ? "info" : undefined}
                  >
                    {question.inputType}
                  </Badge>
                </InlineStack>
              </ResourceItem>
            )}
          />
        </BlockStack>
      </FormLayout.Group>

      <Button
        variant="primary"
        size="large"
        disabled={isDirty}
        loading={isLoading}
        onClick={() => {
          handleSubmit();
        }}
      >
        Save Form
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
        question={question}
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
