import { Prisma } from "@prisma/client";
import { useState } from "react";

export const useFormState = () => {
  const formTypes = [
    { label: "NPS", value: "nps" },
    { label: "Survey", value: "survey" },
  ];

  const [form, setForm] = useState<Prisma.FormUncheckedCreateInput>({
    title: "",
    formType: formTypes[0].value,
    customerMetafieldKey: "surveys",
    customerMetafieldNamespace: "custom",
    orderMetafieldKey: "surveys",
    orderMetafieldNamespace: "custom",
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return { setForm, form, formTypes, handleChange };
};