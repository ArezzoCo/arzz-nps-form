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
  const formId = form.dataset.id;
  console.log("submitting form");
  console.log("Questions Object", questionsObj);
  console.log("order ID", orderId);
  console.log("form ID", formId);

  const reqBody = {
    questions: questionsObj,
    orderId,
    formId,
  };

  console.log("req body", reqBody);

  const response = await fetch(`${api_prefix}/form/submit`, {
    method: "POST",
    body: JSON.stringify(reqBody),
  });

  console.log(response, await response.json());
};

const renderForm = async (formObj) => {
  const query = new URLSearchParams(window.location.search);
  const orderId = query.get("orderId");
  //const orderId = "6152169062700" // get from url

  const formHTML = `
  <form onsubmit="handleSubmitForm(event);" data-id="${formObj.id}">
    <h2>${formObj.title}</h2>
    <div class="form-group">
      <h3>Order</h3>
      <input id="orderId" class="input" type="text" name="orderId" required disabled value="${orderId ? orderId : "please provide a valid order id"}">
    </div>
    ${formObj.questions.map((question, index) => {
      return renderQuestion(question);
    })}
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
            ${Array.from({ length: npsObj.npsRange })
              .map((_, index) => {
                const value = index + 1;
                return `
                <label 
                  for="nps-${value}" 
                  onclick="handleNpsChange(event)"
                  style="
                    background-color: ${value > npsObj.firstRange ? 'green' : value <= npsObj.firstRange && value > npsObj.secondRange ? 'yellowgreen' : 'red' };
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

  return `
    <div class="form-group">
      <h3>${question.title}</h3>
      <label>${question.description}</label>
      <input class="input" type="${question.inputType}" name="${question.title}" ${question.required ? "required" : ""}>
    </div>
  `;
};

function handleNpsChange(e) {
  const nps = window.nps;
  const selectedRange = e.target.getAttribute("for").split("-")[1];
  const container = document.getElementById('nps-conditional-questions')
  let question;
  if(selectedRange <= nps.firstRange && selectedRange > nps.secondRange) {
    question = nps.firstQuestion
  }
  if(selectedRange < nps.firstRange && selectedRange <= nps.secondRange) {
    question = nps.secondQuestion
  }
  if (!question){
    container.innerHTML = "";
    return;
  }
  console.log('question', question)
  console.log("nps", nps);

  const html = `
  <div class="form-group">
    <h3>${question.title}</h3>
    <p>${question.description}</p>
    <input 
      class="input"
      name="${question.title}"
      type="${question.inputType}"
      required=${question.required} 
    />
  </div>
  `;

  container.innerHTML = html;
}
