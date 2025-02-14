interface props {
  orderId: string;
  orderMetafieldNamespace: string;
  orderMetafieldKey: string
}
export const GET_ORDER_METAFIELD_DATA = ({ orderId, orderMetafieldNamespace, orderMetafieldKey}: props) =>{
  return `#graphql
  query GetOrderMetafieldData {
    order(id: "gid://shopify/Order/${orderId}") {
      id
      metafield(namespace: "${orderMetafieldNamespace}" ,key: "${orderMetafieldKey}"){
        value
      }
    }
  }
  `;
}