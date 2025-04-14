import {
  reactExtension,
  Banner,
  BlockStack,
  InlineLayout,
  ToggleButton,
  ToggleButtonGroup,
  View,
  Text,
  useShop
} from "@shopify/ui-extensions-react/checkout";
// Removed invalid Form import
import { useEffect, useState } from "react";


export const ThankYou = reactExtension("purchase.thank-you.block.render", () => (
  <BlockStack spacing="extraTight">
    <NPSContainer />
  </BlockStack>
));

const NPSContainer = () => {
  const shop = useShop();

  console.log("app started", shop.storefrontUrl);

  const fetchForm  = async () => {
    const response = await fetch(`${shop.storefrontUrl}/apps/arzz-form/checkout/nps/58`);
    if (!response.ok) {
      console.error("app Error fetching form data");
      return;
    }
    const data = await response.json();
    console.log('app', data);
  }

  useEffect(() => {
    fetchForm()
  },[])

  return(
    <BlockStack spacing="extraTight">
      <BlockStack spacing="tight">
        <Banner title="How likely are you to recommend us to a friend?" status="info" />
        <BlockStack spacing="tight">
          <NpsButton />
        </BlockStack>
      </BlockStack>
    </BlockStack>
  )

}

const NpsButton = ()=>{
  return(
    <ToggleButtonGroup
      value="none"
      onChange={(value) => {
        console.log(
          `onChange event with value: ${value}`,
        );
      }}
    >
      <InlineLayout spacing="base">
        <ToggleButton id="none">
          <View
            blockAlignment="center"
            inlineAlignment="center"
            minBlockSize="fill"
          >
            None
          </View>
        </ToggleButton>
        <ToggleButton id="points-100">
          <BlockStack
            inlineAlignment="center"
            spacing="none"
          >
            <Text>100</Text>
            <Text appearance="subdued">
              points
            </Text>
          </BlockStack>
        </ToggleButton>
        <ToggleButton id="points-200">
          <BlockStack
            inlineAlignment="center"
            spacing="none"
          >
            <Text>200</Text>
            <Text appearance="subdued">
              points
            </Text>
          </BlockStack>
        </ToggleButton>
        <ToggleButton id="points-300">
          <BlockStack
            inlineAlignment="center"
            spacing="none"
          >
            <Text>300</Text>
            <Text appearance="subdued">
              points
            </Text>
          </BlockStack>
        </ToggleButton>
      </InlineLayout>
    </ToggleButtonGroup>
  )
}