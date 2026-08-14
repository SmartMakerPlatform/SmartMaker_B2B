const verifyButton = document.querySelector('#verify-button');
const phoneInput = document.querySelector('input[name="phone"]');
const form = document.querySelector('#application-form');
const formStatus = document.querySelector('#form-status');

verifyButton.addEventListener('click', () => {
  if (!phoneInput.reportValidity()) return;
  verifyButton.textContent = '본인인증 (전화번호)';
  verifyButton.classList.add('verified');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  formStatus.textContent = '교육비 결제하기';
});
