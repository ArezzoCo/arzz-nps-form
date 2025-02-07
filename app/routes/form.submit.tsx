import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { GetForm } from "app/form/form.service";
import { CreateOrderNPS } from "app/orderNPS/orderNPS.service";
import { authenticate } from "app/shopify.server";
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export const action = async ({ request }: ActionFunctionArgs) => {
  //const { admin } = await authenticate.public.appProxy(request);
  const { admin } = await authenticate.admin(request);
  console.log("chegou na action");
  const data = await request.json().then((data) => JSON.parse(data));
  console.log(data);
  console.log("id:", data.userId);

  // salvar orderNPS
  const NPS = saveNPS(admin, data);
  // salvar orderNPS no metafield
  const orderMetafieldResponse = await saveNPSonOrderMetafield(
    admin,
    data,
    NPS,
  );
  const customerMetafieldResponse = await saveNPSonCustomerMetafield(
    admin,
    data,
    NPS,
  );

  console.log("orderMetafieldResponse", orderMetafieldResponse);
  console.log("customerMetafieldResponse", customerMetafieldResponse);

  return json({
    message: "ok",
    data,
    orderMetafieldResponse,
    customerMetafieldResponse,
  });
};

const saveNPS = async (admin: AdminApiContextWithoutRest, data: any) => {
  if (!data.formId) return "debug NPS Survey";

  const form = await GetForm(Number(data.formId));
  if (!form) {
    return json({
      message: "Form not found",
    });
  }

  const OrderNPS: Prisma.OrderNPSCreateInput = {
    form: { connect: { id: form!.id } },
    orderId: data.orderId,
    questions: JSON.stringify(data.questions),
  };

  console.log(OrderNPS);
  return data.formId ? await CreateOrderNPS(OrderNPS) : "debug";
};

const getCustomerMetafieldData = async (
  admin: AdminApiContextWithoutRest,
  customerId: number,
) => {
  const query = `#graphql
  query GetCustomerMetafieldData {
    customer(id: "gid://shopify/Customer/${customerId}") {
      id
      metafield(namespace: "custom" ,key: "nps"){
        value
      }
    }
  }
  `;
  try {
    const response = await admin?.graphql(query);
    if (response.ok) {
      const data = await response.json();
      return data.data?.customer;
    }
  } catch (e) {
    console.log("erro ao buscar metafield do cliente");
  }
};

const getOrderMetafieldData = async (
  admin: AdminApiContextWithoutRest,
  orderId: number,
) => {
  const query = `#graphql
  query GetOrderMetafieldData {
    order(id: "gid://shopify/Order/${orderId}") {
      id
      metafield(namespace: "custom" ,key: "nps"){
        value
      }
    }
  }
  `;

  try {
    const response = await admin?.graphql(query);
    if (response.ok) {
      const data = await response.json();
      return data.data?.order;
    }
  } catch {
    console.log("erro ao buscar metafield do pedido");
  }
};

const saveNPSonOrderMetafield = async (
  admin: AdminApiContextWithoutRest,
  data: any,
  NPS: any,
) => {
  const orderMetafield = await getOrderMetafieldData(admin, data.userId);
  const previousSurveys = orderMetafield?.metafield?.value?.surveys;

  const npsObj = {
    surveys: previousSurveys ? [...previousSurveys, NPS] : [NPS], // se existir, adiciona, se não, cria
  };

  const query = `#graphql 
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
      }
      userErrors {
        field
        message
        code
      }}}`;

  const variables = {
    metafields: [
      {
        key: "nps",
        namespace: "custom",
        ownerId: `gid://shopify/Order/${data.orderId}`,
        type: "json",
        value: JSON.stringify(npsObj),
      },
    ],
  };

  const response = await admin?.graphql(query, { variables });
  return await response.json();
};

const saveNPSonCustomerMetafield = async (
  admin: AdminApiContextWithoutRest,
  data: any,
  NPS: any,
) => {
  const customerMetafield = await getCustomerMetafieldData(admin, data.userId);
  const previousSurveys = customerMetafield?.metafield?.value?.surveys;

  const npsObj = {
    surveys: previousSurveys ? [...previousSurveys, NPS] : [NPS], // se existir, adiciona, se não, cria
  };

  const query = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
      }
      userErrors {
        field
        message
        code
      }}}`;

  const variables = {
    metafields: [
      {
        key: "nps",
        namespace: "custom",
        ownerId: `gid://shopify/Customer/${data.userId}`,
        type: "json",
        value: JSON.stringify(npsObj),
      },
    ],
  };

  const response = await admin?.graphql(query, { variables });
  return await response.json();
};
