import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { GetForm } from "app/form/actions/GetForm";
import { authenticate } from "app/shopify.server";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  //const { redirect } = await authenticate.admin(request);
  const formType = params.type as string;
  const formAction = params.action as string;

  // if(!params.id) { 
  //   return redirect("/app");
  // }

  // const validFormTypes = ["nps", "survey", "feedback"];
  // if (!validFormTypes.includes(formType)) {
  //   return redirect("/app");
  // }
  
  // const validFormActions = ["get", "submit"];
  // if (!validFormActions.includes(formAction)) {
  //   return redirect("/app");
  // }
  
  const formId = parseInt(params.id!);
  // if (isNaN(formId)) {
  //   return redirect("/app");
  // }

  const form = await GetForm(formId);
  // if (!form) {
  //   return redirect("/app");
  // }
  console.log("loader form", form);
  console.log("loader", params.type, params.id, params.action);
  return  json(form)
}