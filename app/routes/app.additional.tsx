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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { redirect } = await authenticate.admin(request);
  const formData = await request.formData();
  const orderId = formData.get("orderId");
  console.log("Action", orderId);
  await setMetafield(orderId as string, request);
  return redirect("/app");
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {};
};

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
  `;
  const variables = {
    metafields: [
      {
        key: "test_text",
        namespace: "custom",
        ownerId: orderId,
        type: "single_line_text_field",
        value: "setado pela página de teste",
      },
    ],
  };

  const response = await admin.graphql(query, { variables });
  console.log("Response", response);
};

export default function AdditionalPage() {
  return (
    <Page>
      <TitleBar title="GraphQl Sandbox Page" />
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingLg" alignment="center">
              Teste da API GraphQL
            </Text>
            <GraphQlForm />
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingLg" alignment="center">
              Teste Submit
            </Text>
            <SubmitForm />
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
  };

  return (
    <FormLayout>
      <FormLayout.Group>
        <TextField
          label="Order ID"
          value={orderId}
          onChange={(value) => setOrderId(value)}
          autoComplete="off"
          multiline
        />
      </FormLayout.Group>
      <FormLayout.Group>
        <Button variant="primary" onClick={handleSubmit}>
          Enviar
        </Button>
      </FormLayout.Group>
    </FormLayout>
  );
};

const SubmitForm = () => {
  const [formState, setFormState] = useState<string>(`{\n   "orderId": 6152174338348,\n   "userId": 8587652235564\n}`);
  const [feedbackVisibility, setFeedbackVisibility] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  const handleTestSubmit = async () => {
    setFeedbackVisibility(false);
    setFeedback("");
    console.log('Submit', formState)
    try {
      const response = await fetch('/form/submit', {
        method: 'POST',
        body: JSON.stringify(formState),
      })
      if(response.ok){
        const data = await response.json()
        setFeedback(JSON.stringify(data, null, 2))
        setFeedbackVisibility(true)
        console.log("feedback", data)
      }
    }catch(e){
      console.error(e)
    }

  }

  return(
    <FormLayout>
      <FormLayout.Group>
        <TextField 
          multiline={6} 
          label="Test Object"  
          autoComplete="off" 
          onChange={(value) => setFormState(value)}
          value={formState} 
        /> 
      </FormLayout.Group>
      <FormLayout.Group>
         <Button variant="primary" onClick={handleTestSubmit}>Enviar</Button>
      </FormLayout.Group>
      <FormLayout.Group>
        {feedbackVisibility && <Text as="p" variant="bodyMd">{feedback}</Text>}
      </FormLayout.Group>
    </FormLayout>
  )
}
