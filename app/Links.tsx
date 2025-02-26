import { LinksFunction } from "@remix-run/node";

import styles from "./tailwind.css"

export const Links: LinksFunction = () => {
  return [
    {rel: "stylesheet", href: styles}
  ];
};
