const api_prefix = "apps/arzz-form";

document.addEventListener("DOMContentLoaded", async () => {
  const formContainer = document.getElementById("dynamic-form");
  const formType = formContainer.dataset.formType;
  const formId = formContainer.dataset.formId;

  const url = `${api_prefix}/form/${formType}/${formId}/get`;

  console.log(formContainer, formType, formId);
  const response = await fetch(url);
  const formObj = await response.json();

  console.log(formObj);
  const formHTML = await renderForm(formObj);
  formContainer.innerHTML = formHTML;
});

const handleSubmitForm = async (e) => {
  e.preventDefault();
  const form = e.target;
  const questionsObj = Object.fromEntries(new FormData(form));
  const orderId = form.querySelector("#orderId").value;
  const userId = form.querySelector("#userId").value;

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

  const response = await fetch(`${api_prefix}/form/submit`, {
    method: "POST",
    body: JSON.stringify(reqBody),
  });

  console.log(response, await response.json());
};

const renderForm = async (formObj) => {
  //TODO: add metafield info and submit it
  const query = new URLSearchParams(window.location.search);
  const orderId = query.get("orderId");
  const userId = document.getElementById("dynamic-form").getAttribute('data-customer-id');
  //const orderId = "6152169062700" // get from url

  const formHTML = `
  <form 
    onsubmit="handleSubmitForm(event);" 
    data-id="${formObj.id}"
    data-order-metafield-namespace="${formObj.orderMetafieldNamespace}"
    data-order-metafield-key="${formObj.orderMetafieldKey}"
    data-customer-metafield-namespace="${formObj.orderMetafieldNamespace}"
    data-customer-metafield-key="${formObj.customerMetafieldKey}"
  >
    <h2>${formObj.title}</h2>
    <div class="form-group">
      <h3>Order</h3>
      <input id="orderId" class="input" type="text" name="orderId" required disabled value="${orderId ? orderId : "please provide a valid order id"}">
      <input style="margin-top: 8px;" id="userId" class="input" type="text" name="userId" required disabled value="${userId ? userId : "login to get user id"}">
    </div>
    ${formObj.questions
      .map((question, index) => {
        return renderQuestion(question);
      })
      .join("")}
    <button class="submit-bttn" type="submit">Submit</button>
  </form>
  `;

  return formHTML;
};

const renderQuestion = (question) => {
  if (question.inputType === "nps") {
    const npsObj = JSON.parse(question.answers);
    window.nps = npsObj;
    return `
      <div class="form-group nps">
        <h3>${question.title}</h3>
        <label>${question.description}</label>
        <div 
          class="nps-container"
          style="display:flex; align-items:center; justify-content:center; gap:12px;"
        >
          <div class='nps-range'
            style="
              display: flex;
              gap: .4rem;
            "
          >
            ${Array.from({ length: npsObj.npsRange + 1 })
              .map((_, index) => {
                const value = index;
                return `
                <label 
                  for="nps-${value}" 
                  onclick="handleNpsChange(event)"
                  style="
                    background-color: ${value > npsObj.firstRange ? "green" : value <= npsObj.firstRange && value > npsObj.secondRange ? "yellowgreen" : "red"};
                    color: white;
                    padding: 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                  "
                >
                  ${value}
                </label>
                <input 
                  type="radio"
                  id="nps-${value}"
                  name="nps"
                  value="${value}"
                  required
                  style="display: none"
                  
                />
              `;
              })
              .join("")}
          </div>
          </div>
          <div id="nps-conditional-questions"></div>
      </div>
    `;
  }

  return inputHTML(question.inputType, question);
};

function handleNpsChange(e) {
  const nps = window.nps;
  const selectedRange = e.target.getAttribute("for").split("-")[1];
  const container = document.getElementById("nps-conditional-questions");
  let question;
  if (selectedRange <= nps.firstRange && selectedRange > nps.secondRange) {
    question = nps.firstQuestion;
  }
  if (selectedRange < nps.firstRange && selectedRange <= nps.secondRange) {
    question = nps.secondQuestion;
  }
  if (!question) {
    container.innerHTML = "";
    return;
  }
  console.log("question", question);
  console.log("nps", nps);

  const html = inputHTML(question.inputType, question);
  console.log("html", html);

  container.innerHTML = html;
}

const inputHTML = (inputType, question) => {
  if (inputType === "select") {
    const answers = question.answers.split(",").map((q) => q.trim());
    return `
      <div class="form-group select">
        <h3>${question.title}</h3>
        <label>${question.description}</label>
        <select class="input">
          ${answers
            .map((answer) => {
              return `<option value="${answer}">${answer}</option>`;
            })
            .join("")}
        </select>
      </div>
    `;
  }

  if (inputType === "radio") {
    const answers = question.answers.split(",").map((q) => q.trim());
    return `
      <div class="form-group radio">
        <h3>${question.title}</h3>
        <label>${question.description}</label>
        <div class="radio-options">
          ${answers
            .map((answer, index) => {
              return `
              <label>
                <input 
                  type="radio" 
                  id="${`${answer.split()[0]}-${index}`}" 
                  name="${question.title.split()[0]}" 
                  value="${`${answer.split()[0]}-${index}`}"
                />
                ${answer}
              </label>`;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  if (inputType === "checkbox") {
    const answers = question.answers.split(",").map((q) => q.trim());
    return `
      <div class="form-group checkbox">
        <h3>${question.title}</h3>
        <label>${question.description}</label>
        <div class="select-options">
          ${answers
            .map((answer, index) => {
              return `
                <label>
                  <input 
                    type="checkbox" 
                    id="${`${answer.split()[0]}-${index}`}" 
                    name="${question.title.split()[0]}"
                    value="${`${answer.split()[0]}-${index}`}"
                  />
                  ${answer}
                </label>`;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="form-group">
      <h3>${question.title}</h3>
      <label>${question.description}</label>
      <input class="input" type="${question.inputType}" name="${question.title}" ${question.required ? "required" : ""}>
    </div>
  `;
};
