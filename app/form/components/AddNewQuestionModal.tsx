import {
  Checkbox,
  FormLayout,
  Modal,
  TextField,
  Text,
  BlockStack,
  Divider,
} from "@shopify/polaris";
import InputTypeSelector from "./InputTypeSelector";
import { useQuestionState } from "../hooks/useQuestionState";
import { useState } from "react";
import { Prisma } from "@prisma/client";

interface props {
  open: boolean;
  onClose: () => void;
  title: string;
  primaryAction: {
    content: string;
    onAction: () => void;
  };
  secondaryActions: {
    content: string;
    onAction: () => void;
  }[];
  isEditing: {
    isEditing: boolean;
    index?: number;
  };
  newQuestion: Prisma.QuestionCreateWithoutFormInput;
  handleQuestionChange: (key: string, value: any) => void;
  setNpsData: any;
  npsData: npsData;
}

interface npsData {
  npsRange: number;
  firstRange?: number;
  firstQuestion?: Partial<Prisma.QuestionCreateWithoutFormInput>;

  secondRange?: number;
  secondQuestion?: Partial<Prisma.QuestionCreateWithoutFormInput>;
}

export const AddNewQuestionModal = ({
  open,
  onClose,
  isEditing,
  title,
  primaryAction,
  secondaryActions,
  newQuestion,
  handleQuestionChange,
  setNpsData,
  npsData,
}: props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        content: primaryAction.content,
        onAction: primaryAction.onAction,
      }}
      secondaryActions={[
        {
          content: secondaryActions[0].content,
          onAction: secondaryActions[0].onAction,
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
          <InputTypeSelector
            label="Input Type"
            value={newQuestion.inputType}
            onChange={(value) => {
              handleQuestionChange("inputType", value);
            }}
          />
          <TextField
            label="Question Title"
            value={newQuestion.title}
            onChange={(value) => {
              handleQuestionChange("title", value);
            }}
            error={errors.questionTitle}
            autoComplete="off"
          />
          <TextField
            label="Question Subtitle"
            value={newQuestion.description!}
            onChange={(value) => handleQuestionChange("description", value)}
            multiline
            autoComplete="off"
          />
          <Checkbox
            label="Answer Required"
            checked={newQuestion.required || false}
            onChange={(value) => {
              handleQuestionChange("required", value);
              if (value) {
                handleQuestionChange("showQuestion", true);
              }
            }}
          />
          <Checkbox
            label="Show Question"
            checked={newQuestion.showQuestion || false}
            onChange={(value) => {
              handleQuestionChange("showQuestion", value);
              if (!value) {
                handleQuestionChange("required", false);
              }
            }}
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
              <Text as="h2" variant="headingMd">
                NPS Options
              </Text>

              {/* 
                    <RangeSlider                
                      label={`NPS Range: ${npsData.npsRange}`}
                      value={npsData.npsRange}
                      onChange={(value) => setNpsData({...npsData, npsRange: Number(value)})} 
                      min={1}
                      max={10}
                    />
                */}

              <Text as="h3" variant="headingMd">
                Conditional Question
              </Text>

              {/* range and question input */}
              <Text as="p" variant="bodyMd">
                Rendered when NPS is {"\>"} 7 and {"\<"} 9
              </Text>
              {/* <RangeSlider 
                    label={`Render when the NPS is below ${npsData.firstRange}`}
                    value={npsData.firstRange!}
                    min={1}
                    max={npsData.npsRange}
                    onChange={(value) => setNpsData({...npsData, firstRange: Number(value)})}
                  /> */}
              {/* Question Input */}
              <InputTypeSelector
                label="Input Type"
                value={npsData.firstQuestion?.inputType!}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    firstQuestion: {
                      ...npsData.firstQuestion!,
                      inputType: value,
                    },
                  });
                }}
                noNps={true}
              />
              <TextField
                label="Question Title"
                autoComplete="off"
                value={npsData.firstQuestion?.title}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    firstQuestion: {
                      ...npsData.firstQuestion!,
                      title: value,
                    },
                  });
                }}
              />
              <TextField
                label="Question Subtitle"
                autoComplete="off"
                value={npsData.firstQuestion?.description ?? ""}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    firstQuestion: {
                      ...npsData.firstQuestion!,
                      description: value,
                    },
                  });
                }}
              />
              <TextField
                label="Answers"
                autoComplete="off"
                value={npsData.firstQuestion?.answers ?? ""}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    firstQuestion: {
                      ...npsData.firstQuestion,
                      answers: value,
                    },
                  });
                }}
              />
              <Checkbox
                label="Answer Required"
                checked={npsData.firstQuestion?.required || false}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    firstQuestion: {
                      ...npsData.firstQuestion!,
                      required: value,
                    },
                  });
                  if (value) {
                    setNpsData({
                      ...npsData,
                      firstQuestion: {
                        ...npsData.firstQuestion!,
                        required: value,
                        showQuestion: true,
                      },
                    });
                  }
                }}
              />
              <Checkbox
                label="Show Question"
                checked={npsData.firstQuestion?.showQuestion || false}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    firstQuestion: {
                      ...npsData.firstQuestion!,
                      showQuestion: value,
                    },
                  });
                  if (!value) {
                    setNpsData({
                      ...npsData,
                      firstQuestion: {
                        ...npsData.firstQuestion!,
                        showQuestion: value,
                        required: false,
                      },
                    });
                  }
                }}
              />
              <Divider />

              {/* Second Question */}

              <Text as="h3" variant="headingMd">
                Conditional Question
              </Text>
              <Text as="p" variant="bodyMd" tone="critical">
                Rendered when NPS is {"\<="} 7
              </Text>

              {/* <RangeSlider 
                    label={`Render when the NPS is below ${npsData.secondRange}`}
                    value={npsData.secondRange!}
                    min={1}
                    max={npsData.firstRange! -1}
                    onChange={(value) => setNpsData({...npsData, secondRange: Number(value)})}
                  /> */}

              <InputTypeSelector
                label="Input Type"
                value={npsData.secondQuestion?.inputType!}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    secondQuestion: {
                      ...npsData.secondQuestion!,
                      inputType: value,
                    },
                  });
                }}
                noNps={true}
              />

              <TextField
                label="Question Title"
                autoComplete="off"
                value={npsData.secondQuestion?.title}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    secondQuestion: {
                      ...npsData.secondQuestion!,
                      title: value,
                    },
                  });
                }}
              />

              <TextField
                label="Question Subtitle"
                autoComplete="off"
                value={npsData.secondQuestion?.description ?? ""}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    secondQuestion: {
                      ...npsData.secondQuestion!,
                      description: value,
                    },
                  });
                }}
              />
              <TextField
                label="Answers"
                autoComplete="off"
                value={npsData.secondQuestion?.answers ?? ""}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    secondQuestion: {
                      ...npsData.secondQuestion,
                      answers: value,
                    },
                  });
                }}
              />

              <Checkbox
                label="Answer Required"
                checked={npsData.secondQuestion?.required || false}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    secondQuestion: {
                      ...npsData.secondQuestion!,
                      required: value,
                    },
                  });
                  if (value) {
                    setNpsData({
                      ...npsData,
                      secondQuestion: {
                        ...npsData.secondQuestion!,
                        required: value,
                        showQuestion: true,
                      },
                    });
                  }
                }}
              />
              <Checkbox
                label="Show Question"
                checked={npsData.secondQuestion?.showQuestion || false}
                onChange={(value) => {
                  setNpsData({
                    ...npsData,
                    secondQuestion: {
                      ...npsData.secondQuestion!,
                      showQuestion: value,
                    },
                  });
                  if (!value) {
                    setNpsData({
                      ...npsData,
                      secondQuestion: {
                        ...npsData.secondQuestion!,
                        showQuestion: value,
                        required: false,
                      },
                    });
                  }
                }}
              />
            </BlockStack>
          )}
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
};
