window.AXEducationState={schedule:'',phoneVerification:{status:'idle',phoneNumber:'',verificationToken:null}};

const heroVideo=document.querySelector('.hero-video');
if(heroVideo){
  const showVideo=()=>heroVideo.classList.add('is-ready');
  if(heroVideo.readyState>=2)showVideo();
  else heroVideo.addEventListener('loadeddata',showVideo,{once:true});
}

const scheduleRadios=[...document.querySelectorAll('input[name="education_schedule"]')];
scheduleRadios.forEach((radio,index)=>{
  radio.addEventListener('change',()=>{if(radio.checked)window.AXEducationState.schedule=radio.value;});
  radio.addEventListener('keydown',(event)=>{
    const direction={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[event.key];
    if(!direction)return;
    event.preventDefault();
    const nextRadio=scheduleRadios[(index+direction+scheduleRadios.length)%scheduleRadios.length];
    nextRadio.checked=true;nextRadio.focus();nextRadio.dispatchEvent(new Event('change',{bubbles:true}));
  });
});

const phoneInput=document.querySelector('#applicant-phone');
const verificationButton=document.querySelector('#phone-verification-button');
const validPhone=(value)=>/^\d{10,11}$/.test(value.replace(/\D/g,''));
function requestPhoneVerification(phoneNumber){window.AXEducationState.phoneVerification={status:'not-configured',phoneNumber,verificationToken:null};return window.AXEducationState.phoneVerification;}
window.AXEducationPhoneVerification={request:requestPhoneVerification};
phoneInput?.addEventListener('input',()=>{const normalized=phoneInput.value.replace(/\D/g,'').slice(0,11);phoneInput.value=normalized;verificationButton.disabled=!validPhone(normalized);window.AXEducationState.phoneVerification={status:'idle',phoneNumber:normalized,verificationToken:null};});
verificationButton?.addEventListener('click',()=>{if(validPhone(phoneInput.value))requestPhoneVerification(phoneInput.value);});
document.querySelector('.payment-options')?.addEventListener('click',(event)=>{const button=event.target.closest('button');if(!button)return;document.querySelectorAll('.payment-options button').forEach((item)=>item.classList.toggle('selected',item===button));});
