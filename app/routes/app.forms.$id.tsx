import { LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  console.log('chamou aq')
  return null;

}

export default function NewFormPage(){
  return (
    <>New Form</>
  )
}