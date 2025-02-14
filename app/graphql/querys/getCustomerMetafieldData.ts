interface props {
  customerId: string;
  customerMetafieldNamespace: string;
  customerMetafieldKey: string;
}
export const GET_CUSTOMER_METAFIELD_DATA = ({
  customerId,
  customerMetafieldNamespace,
  customerMetafieldKey,
}: props) => {
  return `#graphql
  query GetCustomerMetafieldData {
    customer(id: "gid://shopify/Customer/${customerId}") {
      id
      metafield(namespace: "${customerMetafieldNamespace}" ,key: "${customerMetafieldKey}"){
        value
      }
    }
  }
  `;
};
