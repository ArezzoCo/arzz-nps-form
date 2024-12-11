import React, { useState } from 'react';
import { Page, Card, Button, ResourceList, ResourceItem, Text } from '@shopify/polaris';

const FormListPage = ({ forms, onSelectForm, onCreateForm }: any) => {
  return (
    <Page
      title="Formulários"
      primaryAction={{
        content: 'Criar Formulário',
        onAction: onCreateForm,
      }}
    >
      <Card>
        <ResourceList
          resourceName={{ singular: 'formulário', plural: 'formulários' }}
          items={forms}
          renderItem={(form) => {
            return (
              <ResourceItem
                id={form.id}
                accessibilityLabel={`Ver detalhes de ${form.title}`}
                onClick={() => onSelectForm(form.id)}
              >
                <h3>
                  <Text as='h2' variant="bodyLg">{form.title}</Text>
                </h3>
                <div>{form.isActive ? 'Ativo' : 'Inativo'}</div>
              </ResourceItem>
            );
          }}
        />
      </Card>
    </Page>
  );
};

export default FormListPage;
