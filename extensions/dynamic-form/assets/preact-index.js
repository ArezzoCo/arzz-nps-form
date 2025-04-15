//https://esm.sh/preact
import { h, render } from 'https://esm.sh/preact@10.18.2';
import { useEffect, useState } from 'https://esm.sh/preact@10.18.2/hooks';
import htm from 'https://esm.sh/htm';

// Initialize htm with Preact
const html = htm.bind(h);

function App (props) {
  return html`<${Container} />`;
}

const Container = (props) => {
  const [answers, setAnswers] = useState({});
  const [formObj, setFormObj] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const root = document.getElementById('preact-root');
  const orderId = root.dataset.orderId;
  const userId = root.dataset.userId ? root.dataset.userId : null;
  
  const fetchForm = async () => {
    const response = await fetch('apps/arzz-form/form/nps/51/get');
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
  }

  if(isLoading) {
    return html`<span class="loader"></span>`;
  }

  return html`
  <div class=container id=dynamic-form>
    <form 
      class=form 
      onsubmit=${handleSubmit} 
      data-id=${formObj.id}
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
        console.log(question.required)
        return handleQuestionType(question);
      })}
      <button class=submit type=submit>Submit</button>
    </form>
  </div>
  `;
}

const handleQuestionType = (question) => {
  if(question.inputType === "nps") {
    return html`<${QuestionNps} question=${question} />`
  }

  if(question.inputType === "select") {
    return html`<${QuestionSelect} question=${question} />`
  }

  if(question.inputType === "radio") {
    return html`<${QuestionRadio} question=${question} />`
  }

  if(question.inputType === "checkbox") {
    return html`<${QuestionCheckbox} question=${question} />`
  }

  return html`<${QuestionDefault} question=${question} />`
}

const QuestionDefault = ({question}) =>{
  return html`
    <div class="question ${question.required ? "question--required" : ""}">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <input
        class="question__input"
        placeholder="placeholder"
        type="${question.inputType}"
        required=${question.required}
      />
    </div>
  `
}

const QuestionNps = ({question}) => {
  const [npsValue, setNpsValue] = useState();

  const npsObj = JSON.parse(question.answers);

  console.log("npsObj", npsObj);

  const handleNpsChange = (event) => {
    const selectedValue = event.target.textContent;
    setNpsValue(Number(selectedValue));

    const options = document.querySelectorAll('.nps__option');
    options.forEach((option) => {
      option.classList.remove("nps__option--active");
    })
    event.target.classList.add("nps__option--active");
  }

  return html`
    <div class="question question__nps">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <div class="nps-container">
        <div class='nps__buttons'>
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
                  required
                  style="display: none"
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

  return html`
    <div class="question">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <select class="question__input" name="${question.name}">
        ${answers.map((answer) => html`<option value="${answer}">${answer}</option>`)}
      </select>
    </div>
  `;
}

const QuestionRadio = ({question}) => {
  const answers = question.answers.split(",").map((q)=> q.trim());

  return html`
    <div class="question">
      <label class="question__title">${question.title}</label>
      ${question.description && html`<p class="question__desc">${question.description}</p>`}
      <div class="column">
        ${answers.map((answer, index)=> {
          return html`
            <label
              class="question__input question__input--radio"
              for="${`${answer.split()[0]}-${index}`}"
            >
              <input
                type="radio"
                id="${`${answer.split()[0]}-${index}`}"
                name="${question.title.split()[0]}"
                value="${`${answer.split()[0]}-${index}`}"
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

  return html`
    <div class="question">
      <label class="question__title">${question.title}</label>
      ${answers.map((answer, index) => {
        return html`
          <label
            class="question__input question__input--checkbox"
            for="${`${answer.split()[0]}-${index}`}"
          >
            <input
              type="checkbox"
              id="${`${answer.split()[0]}-${index}`}"
              name="${question.title.split()[0]}"
              value="${`${answer.split()[0]}-${index}`}"
            />
            ${answer}
          </label>
        `;
      })}
    </div>
  `;
}


render(html`<${App}/>`, document.getElementById('preact-root'));