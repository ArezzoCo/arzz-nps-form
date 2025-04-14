import { h, render } from 'https://esm.sh/preact';
//https://esm.sh/preact
import htm from 'https://esm.sh/htm';

// Initialize htm with Preact
const html = htm.bind(h);

function App (props) {
  return html`
  <div>
    <h1>Hello ${props.name}!</h1>
    <${Container} />
  </div>`;
}

async function popup() {
  setTimeout(()=>{
    alert("Hello from the popup!");
  }, 1000);
}

const Container = (props) => {
  return html`
    <div class="container">
      <h1>Dynamic Form</h1>
      <div class="container__content">
        <button class="container__button" onClick=${popup}>Open Popup</button>
      </div>
    </div>
  `;
}

render(html`<${App} name="Preact" />`, document.getElementById('preact-root'));