import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  FormLayout,
  TextField,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const action = async ({request, params}: ActionFunctionArgs) => {
  const { redirect } = await authenticate.admin(request);
  const formData = await request.formData();
  const orderId = formData.get("orderId");
  console.log("Action", orderId);
  await setMetafield(orderId as string, request);
  return redirect("/app");

}

export const loader = async ({request}: LoaderFunctionArgs) => {
  return {};
}

const setMetafield = async (orderId: string, request: any) => {
  const { admin } = await authenticate.admin(request);

  const query = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `
  const variables = {
    "metafields": [
      {
        "key": "test_text",
        "namespace": "custom",
        "ownerId": orderId,
        "type": "single_line_text_field",
        "value": "setado pela página de teste",
      }
    ]
  }

  const response = await admin.graphql(query, { variables });
  console.log("Response", response);
}

export default function AdditionalPage() {
  return (
    <Page>
      <TitleBar title="GraphQl Sandbox Page" />
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingLg" alignment="center">Teste da API GraphQL</Text>
            <GraphQlForm />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

const GraphQlForm = () => {
  const [orderId, setOrderId] = useState<string>("");

  const submit = useSubmit();
  const handleSubmit = async () => {
    console.log("Submit", orderId);
    const formData = new FormData();
    formData.append("orderId", orderId);
    submit(formData, { method: "POST" });
  }

  return (
    <FormLayout>
      <FormLayout.Group>
        <TextField
          label="Order ID"
          value={orderId}
          onChange={(value)=>setOrderId(value)}
          autoComplete="off"
          multiline
        />
      </FormLayout.Group>
      <FormLayout.Group>
        <Button variant="primary" onClick={handleSubmit}>Enviar</Button>
      </FormLayout.Group>
    </FormLayout>
  )
}


