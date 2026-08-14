const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopBenefits=window.matchMedia('(min-width: 761px)');
const benefitPaths=window.AX_EDUCATION_BENEFIT_IMAGES||[];
const articleToImage=[0,0,1,1,2];

benefitPaths.forEach((path)=>{
  const image=new Image();
  image.src=path;
});

const articles=[...document.querySelectorAll('.benefit-copy article')];
const benefitImages=[...document.querySelectorAll('.benefit-image')];
const progress=document.querySelector('.progress');
const progressValue=document.querySelector('.progress-value');
const circumference=2*Math.PI*27;
let activeIndex=0;

benefitImages.forEach((image,index)=>{
  if(benefitPaths[index])image.src=benefitPaths[index];
});

function activateBenefit(index){
  const safeIndex=Math.max(0,Math.min(articles.length-1,index));
  activeIndex=safeIndex;
  articles.forEach((article,articleIndex)=>{
    article.classList.toggle('active',articleIndex===safeIndex);
    article.classList.toggle('past',articleIndex<safeIndex);
  });

  const imageIndex=articleToImage[safeIndex];
  benefitImages.forEach((image,index)=>image.classList.toggle('active',index===imageIndex));

  const percentage=(safeIndex+1)*20;
  const offset=circumference*(1-percentage/100);
  progressValue?.style.setProperty('--progress-offset',offset.toFixed(3));
  progress?.setAttribute('aria-valuenow',String(percentage));
  progress?.setAttribute('aria-label',`교육 참여 효과 진행률 ${percentage}%`);
}

activateBenefit(activeIndex);

if(!reducedMotion&&desktopBenefits.matches&&'IntersectionObserver' in window){
  const benefitSection=document.querySelector('.benefits');
  let sectionVisible=false;
  let framePending=false;

  const updateFromScroll=()=>{
    framePending=false;
    if(!sectionVisible)return;
    const readingLine=window.innerHeight*.5;
    let nearestIndex=0;
    let nearestDistance=Infinity;
    articles.forEach((article,index)=>{
      const rect=article.getBoundingClientRect();
      const distance=Math.abs(rect.top+rect.height*.5-readingLine);
      if(distance<nearestDistance){nearestDistance=distance;nearestIndex=index;}
    });
    activateBenefit(nearestIndex);
  };

  const requestScrollUpdate=()=>{
    if(framePending||!sectionVisible)return;
    framePending=true;
    requestAnimationFrame(updateFromScroll);
  };

  const sectionObserver=new IntersectionObserver((entries)=>{
    sectionVisible=entries.some((entry)=>entry.isIntersecting);
    requestScrollUpdate();
  },{rootMargin:'12% 0px 12% 0px'});

  if(benefitSection)sectionObserver.observe(benefitSection);
  addEventListener('scroll',requestScrollUpdate,{passive:true});
  addEventListener('resize',requestScrollUpdate,{passive:true});
}else{
  articles.forEach((article)=>article.classList.remove('past'));
}
