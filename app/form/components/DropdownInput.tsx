import { BlockStack, Box, Icon, InlineStack } from "@shopify/polaris";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";

interface props {
  titleChild: React.ReactNode;
  innerChild: React.ReactNode;
  defaultOpen?: boolean;
}
export const DropdownInput = ({
  titleChild,
  innerChild,
  defaultOpen = false,
}: props) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <BlockStack gap={"500"}>
      <InlineStack align="space-between">
        {titleChild}
        <div onClick={()=>{setIsOpen(!isOpen)}}
          style={{
            cursor: "pointer",
          }}
        >
          <Icon source={isOpen ? ChevronUpIcon : ChevronDownIcon} />
        </div >
      </InlineStack>
      <Box visuallyHidden={!isOpen}>{innerChild}</Box>
    </BlockStack>
  );
};
