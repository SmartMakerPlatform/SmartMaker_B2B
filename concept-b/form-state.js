window.AXEducationState={
  schedule:'',
  phoneVerification:{status:'idle',phoneNumber:'',verificationToken:null}
};

document.querySelectorAll('input[name="education_schedule"]').forEach((radio)=>{
  radio.addEventListener('change',()=>{
    if(radio.checked)window.AXEducationState.schedule=radio.value;
  });
});

const phoneInput=document.querySelector('#applicant-phone');
const verificationButton=document.querySelector('#phone-verification-button');
const validPhone=(value)=>/^\d{10,11}$/.test(value.replace(/\D/g,''));

function requestPhoneVerification(phoneNumber){
  window.AXEducationState.phoneVerification={status:'not-configured',phoneNumber,verificationToken:null};
  return window.AXEducationState.phoneVerification;
}

window.AXEducationPhoneVerification={request:requestPhoneVerification};

phoneInput?.addEventListener('input',()=>{
  const normalized=phoneInput.value.replace(/\D/g,'').slice(0,11);
  phoneInput.value=normalized;
  verificationButton.disabled=!validPhone(normalized);
  window.AXEducationState.phoneVerification={status:'idle',phoneNumber:normalized,verificationToken:null};
});

verificationButton?.addEventListener('click',()=>{
  if(!validPhone(phoneInput.value))return;
  requestPhoneVerification(phoneInput.value);
});
