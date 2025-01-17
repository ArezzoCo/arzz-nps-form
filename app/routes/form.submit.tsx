import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { GetForm } from "app/form/form.service";
import { CreateOrderNPS } from "app/orderNPS/orderNPS.service";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }:ActionFunctionArgs) => {
  const { admin } = await authenticate.public.appProxy(request);
  console.log('chegou na action')
  const data = await request.json()
  console.log(data)

  // salvar orderNPS
  const form = await GetForm(Number(data.formId))
  const OrderNPS: Prisma.OrderNPSCreateInput = {
    form: { connect: { id: form!.id } },
    orderId: data.orderId,
    questions: JSON.stringify(data.questions)
  }
  
  console.log(OrderNPS)
  const NPS = await CreateOrderNPS(OrderNPS)

  // salvar orderNPS no metafield
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
    "metafields": [
      {
        "key": "test_text",
        "namespace": "custom",
        "ownerId": `gid://shopify/Order/${data.orderId}`,
        "type": "single_line_text_field",
        "value": JSON.stringify(NPS),
      }
    ]
  }

  const response = await admin?.graphql(query, { variables });
  console.log("Response", response);


  return json({
    message: 'ok',
    data
  })
}