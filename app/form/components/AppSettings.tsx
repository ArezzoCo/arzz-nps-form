import { BlockStack, Button, Card, InlineStack, Text, TextField } from "@shopify/polaris";
import { useState } from "react";

export const AppSettings = () => {
  const [customCSS, setCustomCSS] = useState<string>();
  const [customJs, setCustomJS] = useState<string>();
  const [customLiquid, setCustomLiquid] = useState<string>();

  const handleSaveSettings = async () => {
    console.log("values:", {
      customCSS,
      customJs,
      customLiquid
    })
  }

  return (
    <BlockStack gap={"500"}>
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h2" variant="headingLg">
          App Settings
        </Text>
        <Button
          variant="primary"
          size="large"
          onClick={handleSaveSettings}
        >Save Settings</Button>
      </InlineStack>
      <Card>
        <InlineStack align="start" gap={"500"} blockAlign="center">
        <TextField
          autoComplete="off"
          label="Custom CSS"
          multiline={5}
          value={customCSS}
          onChange={(e)=>{
            setCustomCSS(e)
          }}
          />
        <TextField
          autoComplete="off"
          label="Custom JS"
          multiline={5}
          value={customJs}
          onChange={(e)=>{
            setCustomJS(e)
          }}
          />
        <TextField
          autoComplete="off"
          label="Custom CSS"
          multiline={5}
          value={customLiquid}
          onChange={(e)=>{
            setCustomLiquid(e);
          }}
        />
        </InlineStack>
      </Card>
    </BlockStack>
  );
};
