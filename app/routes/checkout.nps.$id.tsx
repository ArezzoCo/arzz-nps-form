import { json, LoaderFunctionArgs } from "@remix-run/node";
import { GetForm } from "app/form/actions/GetForm";
import { authenticate } from "app/shopify.server";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);
  
  const formId = parseInt(params.id!);
  // if (isNaN(formId)) {
  //   return redirect("/app");
  // }
  console.log("checkout loader formId", formId);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Or restrict to specific origins for better security
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Specify allowed methods
    "Access-Control-Allow-Headers": "Content-Type, Authorization", // Specify allowed headers
  };

  const form = await GetForm(formId);
  return cors(json(form, {
    headers: corsHeaders
  }))
}

export const action = async ({request, params}: LoaderFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);

  return cors(json({}))
}