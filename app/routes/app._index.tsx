import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
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
  ResourceList,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { DeleteForm, GetForms } from "app/form/form.service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { redirect } = await authenticate.admin(request);
  const forms = await GetForms();
  console.log("loader", forms);

  return json({ forms });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("action");
  const formData = await request.formData();
  const formId = Number(formData.get("id"));
  request.method === "DELETE" && (await DeleteForm(formId));
  return null;
};

export default function Index() {
  const forms = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const navigate = useNavigate();

  console.log("Index", forms.forms);

  const handleDelete = async (id: number) => {
    const formData = new FormData();
    formData.append("id", id.toString());
    submit(formData, {method: "delete"});
  }

  return (
    <Page
      title="ARZZ Forms"
      primaryAction={{
        content: "Create Form",
        url: "forms/new",
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {Array.from(forms.forms).length === 0 ? (
              <EmptyStatePage />
            ) : (
              <ResourceList
                resourceName={{ singular: "form", plural: "forms" }}
                items={forms.forms}
                renderItem={(item) => {
                  return (
                    <ResourceList.Item
                      id={String(item.id)}
                      url={`/app/forms/${item.id}`}
                      accessibilityLabel={`View details for ${item.title}`}
                      shortcutActions={[
                        {
                          content: "Delete",
                          onAction: () => {
                            handleDelete(item.id);
                          },
                        }
                      ]}
                    >
                      <Text as="span">
                        ID:{item.id}
                      </Text>
                      <Text as="h2" fontWeight="bold">
                        {item.title}
                      </Text>

                    </ResourceList.Item>
                  );
                }}
              />
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
