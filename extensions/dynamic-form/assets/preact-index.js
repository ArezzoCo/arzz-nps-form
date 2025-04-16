//https://esm.sh/preact
import { h, render } from 'https://esm.sh/preact@10.18.2';
import { useEffect, useState } from 'https://esm.sh/preact@10.18.2/hooks';
import htm from 'https://esm.sh/htm';

// Initialize htm with Preact
const html = htm.bind(h);

const root = document.getElementById('preact-root');

function App (props) {
  return html`<${Container} />`;
}

const Container = (props) => {
  const [answers, setAnswers] = useState({});
  const [formObj, setFormObj] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [isError, setIsError] = useState(false);

  
  const formId = root.dataset.formId;
  const userId = root.dataset.customerId ? root.dataset.customerId : null;
  
  const query = new URLSearchParams(window.location.search);
  const orderId = query.get("orderId");
  
  const fetchForm = async () => {
    const response = await fetch(`apps/arzz-form/form/nps/${formId}/get`);
    const data = await response.json();
    setFormObj(data);
    setIsLoading(false);
  };

  const logForm = () => {
    console.log(formObj)
  };

  useEffect(()=>{
    fetchForm();
  },[])

  const handleSubmit = async(event) => {
    event.preventDefault();
    console.log("submit event", event);

    

    const form = event.target;
    const questionsObj = Object.fromEntries(new FormData(form));
    const orderId = form.querySelector("#orderId").value;
    const userId = form.querySelector("#userId").value;

   // **INÍCIO DA VALIDAÇÃO**
   const requiredFields = form.querySelectorAll('[data-required="true"]');
   setIsError(false);

   requiredFields.forEach(field => {
     verifyRequired(field);
     if (field.closest('.question').classList.contains('question--invalid')) {
       setIsError(true);
     }
   });

   // Validar o container do NPS separadamente
   const npsQuestionElement = form.querySelector('.question__nps');
   const npsContainer = form.querySelector('.nps-container');
   const npsRequiredInput = npsContainer?.querySelector('input[name="nps"][data-required="true"]');
   const npsSelectedOption = npsContainer?.querySelector('.nps__option--active');

   if (npsQuestionElement && npsRequiredInput && !npsSelectedOption) {
     npsQuestionElement.classList.add('question--invalid');
     setIsError(true); // Define o estado de erro se o NPS não estiver preenchido
   } else if (npsQuestionElement) {
     npsQuestionElement.classList.remove('question--invalid'); // Remove a classe se estiver válido
   }

   if (isError) {
     console.log("Formulário com erros. Por favor, preencha os campos obrigatórios.");
     return; // Impede o envio do formulário se houver erros
   }
   // **FIM DA VALIDAÇÃO**

    console.log('dataset', form.dataset);
    console.log("submitting form");
    console.log("Questions Object", questionsObj);
    console.log("order ID", orderId);
    console.log("user ID", userId);
    let formdataset = {};

    Object.assign(formdataset, form.dataset);
    const reqBody = {
      form: formdataset,
      questions: questionsObj,
      userId,
      orderId,
    };

    console.log("req body", reqBody);

    try {
      const response = await fetch('apps/arzz-form/form/submit', {
        method: "POST",
        body: JSON.stringify(reqBody),
      });

      console.log(response, await response.json());

      if (response.ok) {
        setIsSubmitted(true); // Atualiza o estado após o envio bem-sucedido
      } else {
        console.error("Erro no envio do formulário");
        // Aqui você pode adicionar lógica para exibir uma mensagem de erro ao usuário
      }
    } catch (error) {
      console.error("Erro ao enviar o formulário:", error);
      // Aqui você também pode adicionar lógica para exibir uma mensagem de erro ao usuário
    }
  }

  console.log("isLoading: ", isLoading);
  if(isLoading) {
    return html`<span class="loader"></span>`;
  }

  console.log("isSubmitted: ", isSubmitted);
  if(isSubmitted) {
    return html`<${ThankYou} />`;
  }

  return html`
  <div class=container id=dynamic-form>
    <form 
      class=form 
      onsubmit=${handleSubmit}
      data-order-metafield-namespace=${formObj.orderMetafieldNamespace}
      data-order-metafield-key=${formObj.orderMetafieldKey}
      data-customer-metafield-namespace=${formObj.customerMetafieldNamespace}
      data-customer-metafield-key=${formObj.customerMetafieldKey}
    >
      <h2 class=form__title>${formObj.title}</h2>
      <div class="form-group ">
        <input
          id="orderId" 
          class=input 
          type="text" 
          name="orderId" 
          required 
          disabled 
          value=${orderId ? orderId : "please provide a valid order id"}
        />
        <input 
          id="userId" 
          class="input" 
          type="text" 
          name="userId" 
          required 
          disabled 
          value="${userId ? userId : "login to get user id"}"
        />
      </div>
      ${formObj.questions && formObj.questions.map((question, index)=>{
        return handleQuestionType(question);
      })}
      <button class=submit type=submit>Submit</button>
    </form>
  </div>
  `;
}

const verifyRequired = (element) => {
  const questionElement = element.closest('.question');
  if (questionElement) {
    let isFilled = false;

    if (element.tagName === 'INPUT') {
      if (element.type === 'radio' || element.type === 'checkbox') {
        // Para radio e checkbox, verifica se algum está marcado no grupo
        const name = element.name;
        const checkedInGroup = questionElement.querySelectorAll(`input[name="${name}"]:checked`);
        isFilled = checkedInGroup.length > 0;
      } else {
        isFilled = !!element.value.trim();
      }
    } else if (element.tagName === 'SELECT') {
      isFilled = !!element.value;
    } else if (element.classList.contains('nps-container')) {
      // Para NPS, verifica se algum botão foi clicado (se npsValue está definido)
      const selectedValueSpan = questionElement.querySelector('#selected-nps-value');
      isFilled = !!(selectedValueSpan && selectedValueSpan.textContent);
    }

    if (!isFilled && element.dataset.required === 'true') {
      questionElement.classList.add('question--invalid');
    } else {
      questionElement.classList.remove('question--invalid');
    }
  }
};

const handleQuestionType = (question) => {
  if(question.inputType === "nps") {
    return html`<${QuestionNps} question=${question}/>`
  }

  if(question.inputType === "select") {
    return html`<${QuestionSelect} question=${question} />`
  }

  if(question.inputType === "radio") {
    return html`<${QuestionRadio} question=${question} />`
  }

  if(question.inputType === "checkbox") {
    return html`<${QuestionCheckbox} question=${question}/>`
  }

  return html`<${QuestionDefault} question=${question}/>`
}

const QuestionDefault = ({question}) =>{
  const handleInputChange = (event) => {
    verifyRequired(event.target);
  };

  return html`
    <div class="question ${question.required ? "question--required" : ""}">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <input
        id="question-${question.id}"
        class="question__input"
        placeholder="${question.title}"
        name="${question.title.replace(/ /g, "_")}"
        type="${question.inputType}"
        data-required="${question.required}"
        onchange=${handleInputChange}
      />
    </div>
  `
}

const QuestionNps = ({question}) => {
  const [npsValue, setNpsValue] = useState();

  const npsObj = JSON.parse(question.answers);

  const handleNpsChange = (event) => {
    const selectedValue = event.target.textContent;
    setNpsValue(Number(selectedValue));

    const options = document.querySelectorAll('.nps__option');
    options.forEach((option) => {
      option.classList.remove("nps__option--active");
    })
    event.target.classList.add("nps__option--active");

    const npsContainer = event.target.closest('.nps-container');
    if (npsContainer) {
      verifyRequired(npsContainer); // Passa o container do NPS
    }
  }

  useEffect(() => {
    const npsContainer = document.querySelector('.nps-container');
    if (npsContainer) {
      verifyRequired(npsContainer); // Verificação inicial
    }
  }, [npsValue, question.required]);

  return html`
    <div class="question question__nps">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <div class="nps-container">
        <div class='nps__buttons'>
          <span id="selected-nps-value" class="hidden">${npsValue}</span>
          ${Array.from({ length: npsObj.npsRange + 1 })
            .map((_, index) => {
              return html`
                <label
                  class="nps__option"
                  for="nps-${index}"
                  onclick="${(event)=>handleNpsChange(event)}"
                >${index}</label>
                <input
                  type="radio"
                  id="nps-${index}"
                  name="nps"
                  value="${index}"
                  data-required="true"
                  style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;"
                />
              `;
            })}
        </div>
      </div>
      <div id="nps-conditional-questions">
        ${
          npsValue !== undefined &&
          npsValue <= npsObj.firstRange &&
          npsValue > npsObj.secondRange &&
          handleQuestionType(npsObj.firstQuestion)
        }

        ${
          npsValue !== undefined &&
          npsValue <= npsObj.secondRange &&
          handleQuestionType(npsObj.secondQuestion)
        }
      </div>
    </div>
  `;
}

const QuestionSelect = ({question}) => {
  const answers = question.answers.split(",").map((q)=> q.trim());

  const handleSelectChange = (event) => {
    verifyRequired(event.target);
  };

  return html`
    <div class="question ${question.required? "question--required" : ""}">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <select
        id="${question.title.replace(/ /g, "_")}"
        name="${question.title.replace(/ /g, "_")}"
        class="question__input"
        data-required="${question.required}"
        onchange=${handleSelectChange}
      >
        <option value="" disabled selected>Select an option</option>
        ${answers.map((answer) => html`<option value="${answer}">${answer}</option>`)}
      </select>
    </div>
  `;
}

const QuestionRadio = ({question}) => {
  const answers = question.answers.split(",").map((q)=> q.trim());

  const handleRadioChange = (event) => {
    verifyRequired(event.target); // Passa o input de rádio que mudou
  };

  return html`
    <div class="question ${question.required? "question--required" : ""}">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <div class="column" onchange=${handleRadioChange}>
        ${answers.map((answer, index)=> {
          return html`
            <label
              class="question__input question__input--radio"
              for="radio-${question.title.replace(/ /g, "_")}-${index}"
            >
              <input
                type="radio"
                id="radio-${question.title.replace(/ /g, "_")}-${index}"
                name="radio-${question.title.replace(/ /g, "_")}"
                value="${`${answer.split()[0]}-${index}`}"
                data-required="${question.required}"
              />
              ${answer}
            </label>
          `;
        })}
      </div>
    </div>
  `;
}

const QuestionCheckbox = ({question}) => {
  const answers = question.answers.split(",").map((q)=> q.trim());

  const handleCheckboxChange = (event) => {
    verifyRequired(event.target); // Passa o input de checkbox que mudou
  };

  return html`
    <div class="question ${question.required? "question--required" : ""}" onchange=${handleCheckboxChange}>
      <label class="question__title">${question.title}</label>
      ${answers.map((answer, index) => {
        return html`
          <label
            class="question__input question__input--checkbox"
            for="checkbox-${question.title.replace(/ /g, "_")}-${index}"
          >
            <input
              id="checkbox-${question.title.replace(/ /g, "_")}-${index}"
              name="checkbox-${question.title.replace(/ /g, "_")}-${index}"
              value="${answer.split()[0]}-${index}"
              type="checkbox"
              data-required="${question.required}"
            />
            ${answer}
          </label>
        `;
      })}
    </div>
  `;
}

const ThankYou = () => {
  return html`
    <div class="thank-you-container">
      <div class="thank-you__illustration">
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#26a269" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
      </div>
      <h2 class="thank-you__title">Agradecemos sua participação!</h2>
      <p class="thank-you__message">Sua opinião é muito importante para nós. Obrigado por dedicar seu tempo para responder ao nosso formulário.</p>
      <div class="thank-you__actions">
        <button class="thank-you__button thank-you__button--primary" onClick=${()=>{
          alert("Redirecting to store...");
        }}>
          Go to store
        </button>
        <button class="thank-you__button thank-you__button--secondary" onClick=${()=>{
          alert("Redirecting to contact page...");
        }} >
          Contact us
        </button>
      </div>
    </div>
  `;
};

/* 
<div class="thank-you__actions">
  <button class="thank-you__button thank-you__button--primary" onClick={() => {
    // Aqui você pode adicionar a lógica para redirecionar o usuário para a loja
    window.location.href = '/loja'; // Substitua '/loja' pela URL da sua loja
  }}>
    Ir para a Loja
  </button>
  <button class="thank-you__button thank-you__button--secondary" onClick={() => {
    // Aqui você pode adicionar a lógica para abrir um formulário de contato ou redirecionar para a página de contato
    window.location.href = '/contato'; // Substitua '/contato' pela URL da sua página de contato
  }}>
    Entrar em Contato
  </button>
</div>
*/


render(html`<${App}/>`, document.getElementById('preact-root'));