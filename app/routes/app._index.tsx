import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import FormListPage from "app/form/components/FormListPage";
import { GetForms } from "app/form/form.service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { redirect } = await authenticate.admin(request);
  const forms = await GetForms();
  console.log("loader", forms);

  return Response.json({forms});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("action");
  return null;
};

export default function Index() {
  const forms = useLoaderData<typeof loader>();
  
  const submit = useSubmit();
  const navigate = useNavigate();

  console.log("Index", Array.from(forms).length);

  return (
    <Page title="NPS Forms" primaryAction={{
      content: "Create Form",
      url: "app/forms/new",
    }}>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {Array.from(forms).length === 0 ? (
              <EmptyStatePage />
            ) : (
              <>Lista de forms</>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

const EmptyStatePage = () => {
  return (
    <EmptyState
      heading="Create and manage NPS Forms"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      action={{
        content: "Create Form",
        url: "/app/forms/new",
      }}
    >
      <p>Create and manage NPS Forms to send to your customers.</p>
    </EmptyState>
  );
};
