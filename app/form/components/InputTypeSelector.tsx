import { Select, SelectOption } from "@shopify/polaris";

interface props{
  label: string;
  value: string;
  onChange: (value: string) => void;

  noNps?: boolean;
}
export default function InputTypeSelector({
  label,
  value,
  onChange,
  noNps = false,

}: props){

  const questionInputOptions = [
    { label: "NPS Question", value: "nps" },
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

  const noNpsQuestionInputOptions = [
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

  return(
    <Select
      label={label}
      options={noNps ? noNpsQuestionInputOptions : questionInputOptions}
      value={value}
      onChange={onChange}
    />
  )
}