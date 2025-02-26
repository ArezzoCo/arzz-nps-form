import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { GetForm } from "app/form/actions/GetForm";
import { METAFIELDS_SET } from "app/graphql/mutations/metafieldsSet";
import { GET_CUSTOMER_METAFIELD_DATA } from "app/graphql/querys/getCustomerMetafieldData";
import { GET_ORDER_METAFIELD_DATA } from "app/graphql/querys/getOrderMetafieldData";
import { CreateOrderNPS } from "app/orderNPS/orderNPS.service";
import { authenticate } from "app/shopify.server";
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

interface FormSubmitData {
  form: {
    id: string;
    title: string;
    orderMetafieldNamespace: string;
    orderMetafieldKey: string;
    customerMetafieldNamespace: string;
    customerMetafieldKey: string;
  };
  questions: {
    nps: string;
    [key: string]: string;
  };
  userId: string;
  orderId: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  //const { admin, session } = await authenticate.public.appProxy(request)
  //const { admin } = await authenticate.admin(request);
  const { admin, session } = (await authenticate.public.appProxy(request))
    ? await authenticate.public.appProxy(request)
    : await authenticate.admin(request);
  console.log("chegou na action", session?.shop);

  const data = (await request.json()) as FormSubmitData;
  //.then((data) => JSON.parse(data));
  console.log(data);

  // check if user is valid
  console.log("running on ", session?.shop)
  const customerGid = await getCustomerMetafieldData(
    admin,
    data.userId,
    data.form.customerMetafieldNamespace,
    data.form.customerMetafieldKey,
  ).then((res) => (res ? res.id : null));
  console.log("customer id", customerGid);

  // check if order is valid
  console.log("searching order with id ", data.orderId)
  const orderGid = await getOrderMetafieldData(
    admin,
    data.orderId,
    data.form.orderMetafieldNamespace,
    data.form.orderMetafieldKey,
  ).then((res) => (
    res !== null ? res.id : null
  ));
  console.log("valid order gid", orderGid);

  if (!orderGid) {
    return json(
      {
        message: "Order not found",
      },
      { status: 400 },
    );
  }

  const npsToSaveOnMetafields = {
    formId: data.form.id,
    answers: data.questions,
    customerGid,
    orderGid,
  };

  // save user nps on customer metafield
  if (customerGid) {
    const customerMetafieldResponse = await saveNPSonCustomerMetafield(
      admin,
      customerGid,
      data.form.customerMetafieldNamespace,
      data.form.customerMetafieldKey,
      npsToSaveOnMetafields,
    );
    console.log("customerMetafieldResponse", customerMetafieldResponse);
  }
  // try and save nps on order metafield, if order is invalid, return error

  const orderMetafieldResponse = await saveNPSonOrderMetafield(
    admin,
    orderGid,
    data.form.orderMetafieldNamespace,
    data.form.orderMetafieldKey,
    npsToSaveOnMetafields,
  )
  console.log("orderMetafieldResponse", orderMetafieldResponse);

  // salva no banco de dados como redundancia 
  const NPS = saveNPS(admin, data);

  return json({
    message: "ok",
    data,
  });
};

const saveNPS = async (admin: any, data: any) => {
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
  admin: AdminApiContextWithoutRest | undefined,
  customerId: string,
  customerMetafieldNamespace: string,
  customerMetafieldKey: string,
) => {
  try {
    const query = `#graphql
    query GetCustomerMetafieldData {
    customer(id: "gid://shopify/Customer/${customerId}") {
      id
      metafield(namespace: "${customerMetafieldNamespace}" ,key: "${customerMetafieldKey}"){
        value
      }
    }
  }
    `
    const response = await admin?.graphql((query));
    if (response?.ok) {
      const data = await response.json().then((data) => data.data?.customer);
      console.log("customer data", data);
      return data;
    }
  } catch (e) {
    console.log("erro ao buscar metafield do cliente");
    return null;
  }
};

const getOrderMetafieldData = async (
  admin: AdminApiContextWithoutRest | undefined,
  orderId: string,
  orderMetafieldNamespace: string,
  orderMetafieldKey: string,
) => {
  try {
  const query = `#graphql
  query GetOrderMetafieldData {
    order(id: "gid://shopify/Order/${orderId}") {
      id
      metafield(namespace: "${orderMetafieldNamespace}" ,key: "${orderMetafieldKey}"){
        value
      }
    }
  }
  `;
    const response = await admin?.graphql((query));
    if (response?.ok) {
      const data = await response.json();
      console.log("order data", data.data);
      return data.data?.order;
    }
  } catch {
    console.log("erro ao buscar metafield do pedido");
    return null;
  }
};

const saveNPSonOrderMetafield = async (
  admin: AdminApiContextWithoutRest | undefined, 
  orderGid: string,
  orderMetafieldNamespace: string,
  orderMetafieldKey: string,
  nps: any
) => {
  const orderId = orderGid.split("/").pop();
  console.log("orderId", orderId);

  const surveys = await getOrderMetafieldData(
    admin,
    orderId!,
    orderMetafieldNamespace,
    orderMetafieldKey
  ).then((res) => {
    return res.metafield ? JSON.parse(res.metafield.value) : null;
  })

  console.log(`saving on metafield ${orderMetafieldNamespace}.${orderMetafieldKey}`);

  if (!surveys){
    console.log("no surveys found")
  }

  const variables = {
    metafields: [
      {
        key: orderMetafieldKey,
        namespace: orderMetafieldNamespace,
        ownerId: orderGid,
        type: "json",
        value: JSON.stringify({
          surveys: surveys ? [...surveys.surveys, nps] : [nps]
        }),
      },
    ],
  };

  const response = await admin?.graphql(METAFIELDS_SET, { variables });
  return await response?.json();
};

const saveNPSonCustomerMetafield = async (
  admin: AdminApiContextWithoutRest | undefined,
  customerGid: string,
  customerMetafieldNamespace: string,
  customerMetafieldKey: string,
  nps: any,
) => {
  const customerId = customerGid.split("/").pop();
  console.log("customerId", customerId);

  // get previous surveys
  console.log(
    `searching on metafield ${customerMetafieldNamespace}.${customerMetafieldKey}`,
  );
  const surveys = await getCustomerMetafieldData(
    admin,
    customerId!,
    customerMetafieldNamespace,
    customerMetafieldKey,
  ).then((res) => {
    return res.metafield ? JSON.parse(res.metafield.value) : null;
  });
  console.log("surveys", surveys);

  const answered_ids = await getCustomerMetafieldData(
    admin,
    customerId!,
    "custom",
    "answered_surveys",
  ).then((res) => {
    return res.metafield ? JSON.parse(res.metafield.value) : null;
  });
  console.log("answered_ids", answered_ids);

  if (!surveys) {
    console.log("No surveys found, creating new one");
  }

  const variables = {
    metafields: [
      {
        key: customerMetafieldKey,
        namespace: customerMetafieldNamespace,
        ownerId: customerGid,
        type: "json",
        value: JSON.stringify({
          surveys: surveys ? [...surveys.surveys, nps] : [nps],
        }),
      },
      {
        key: "answered_surveys",
        namespace: "custom",
        ownerId: customerGid,
        type: "json",
        value: JSON.stringify({
          ids: answered_ids ? [ ...answered_ids.ids, nps.formId ] : [nps.formId]
        })
      }
    ],
  };

  const response = await admin?.graphql(METAFIELDS_SET, { variables });
  const data = await response?.json();
  const metafields = data?.data.metafieldsSet

  return metafields
};
