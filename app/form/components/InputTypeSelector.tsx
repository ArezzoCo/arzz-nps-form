import { Select, SelectOption } from "@shopify/polaris";
import { noNpsQuestionInputOptions, questionInputOptions } from "../utils";

interface props {
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
}: props) {
  return (
    <Select
      label={label}
      options={noNps ? noNpsQuestionInputOptions : questionInputOptions}
      value={value}
      onChange={onChange}
    />
  );
}
