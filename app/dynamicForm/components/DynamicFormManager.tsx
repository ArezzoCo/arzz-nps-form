import React, { useEffect } from "react";
import { Card, Page, Button, Spinner, Banner, ResourceList, ResourceItem, Text } from "@shopify/polaris";
import { useDynamicForm } from "../hooks/useDynamicForm";
import { LoaderFunctionArgs } from "react-router";
import { authenticate } from "app/shopify.server";
import { useLoaderData } from "@remix-run/react";


export const DynamicFormManager = () => {

  const {
    forms,
    loading,
    error,
    getForms,
    createForm,
    getFormById,
    deleteStep,
  } = useDynamicForm()

  useEffect(() => {
    console.log('chegou no componente')

  }, []);


  return (
    <Page title="Gerenciador de Formulários Dinâmicos">
      {/* {loading && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Spinner accessibilityLabel="Carregando formulários" size="large" />
        </div>
      )} */}
      {/* {error && (
        <Banner tone="critical" title="Erro ao carregar formulários">
          <p>{error}</p>
        </Banner>
      )} */}
      {/* <Button variant="primary" onClick={()=>{}} disabled={loading}>
        Criar Novo Formulário
      </Button> */}
      {/* <Card>
        <Text as="h1">Formulários disponíveis</Text>
        {forms && forms.length > 0 ? (
          <ResourceList
            resourceName={{ singular: "formulário", plural: "formulários" }}
            items={forms}
            renderItem={(item) => {
              const { id, name } = item;
              return (
                <ResourceItem
                  id={id}
                  accessibilityLabel={`Visualizar ${name}`}
                  onClick={() => {}}
                >
                  <h3>{name}</h3>
                </ResourceItem>
              );
            }}
          />
        ) : (
          <p>Nenhum formulário disponível.</p>
        )}
      </Card> */}
    </Page>
  );
};

