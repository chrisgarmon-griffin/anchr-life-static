(function () {
'use strict';
document.documentElement.classList.add('js');
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
// Navigation remains visible when JavaScript is unavailable.
const menu = $('.menu-toggle'), links = $('#nav-links');
function closeMenu(returnFocus = false) {
  links.classList.remove('is-open');
  menu.setAttribute('aria-expanded','false');
  if (returnFocus) menu.focus();
}
menu?.addEventListener('click', () => {
  const opened = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(opened));
  links.classList.toggle('is-open',opened);
});
links?.addEventListener('click', event => { if(event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', event => {if (!event.target.closest('.site-header')) closeMenu();});
// Product tour uses independent, keyboard-accessible tabs on the current public site.
const tabs = $$('[data-product-tab]');
function selectProduct(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    panel.hidden = !selected;
    panel.tabIndex = selected ? 0 : -1;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectProduct(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();selectProduct(tabs[next],true);}
  });
});
if(tabs.length)selectProduct(tabs[0]);
const actions=$$('.daily-actions input');
actions.forEach(input=> input.addEventListener('change',()=> {
  const count=actions.filter(item=>item.checked).length;
  $('#daily-status').textContent=count===3 ? 'All three explored. Start with one today.' : `${count} of 3 explored`;
  $('#daily-progress').value=count;
}));
if ($('#time-form') && window.ANCHRDates) {
const birth=$('#child-birth'), timeForm=$('#time-form');
birth.max=ANCHRDates.localToday();
function timeError(message) {
  $('#time-error').textContent=message;
  $('#time-error').className='form-status error';
  birth.setAttribute('aria-invalid','true');
  $('#time-results').hidden=true;
  $('#time-placeholder').hidden=false;
}
timeForm.addEventListener('invalid',event=>{if(event.target===birth) timeError(birth.validity.rangeOverflow ? 'The date of birth must be today or earlier.' : 'Enter a valid date of birth.');},true);
timeForm.addEventListener('input',()=>{
  $('#time-error').textContent='';birth.removeAttribute('aria-invalid');
  $('#time-results').hidden=true;$('#time-placeholder').hidden=false;
});
timeForm.addEventListener('submit', event=>{
  event.preventDefault();
  let result;
  try {result=ANCHRDates.calculate(birth.value);} catch(error) {timeError(error.message);birth.focus();return;}
  const name=$('#child-name').value.trim();
  $('#time-error').textContent='';birth.removeAttribute('aria-invalid');
  $('#time-context').textContent=name ? `A little perspective for ${name}.` : 'A little perspective for your family.';
  $('#weeks-value').textContent=result.weeksLeft.toLocaleString();
  $('#saturdays-value').textContent=result.saturdays.toLocaleString();
  $('#days-value').textContent=result.daysLeft.toLocaleString();
  $('#weeks-label').textContent=result.weeksLeft===1?'week before turning 18':'weeks before turning 18';
  $('#adult-note').hidden=!result.isAdult;
  const grid=$('#week-grid'), cells=document.createDocumentFragment();
  for(let i=0;i<result.totalWeeks;i++){
    const cell=document.createElement('span');
    const state=(result.isAdult||i<result.passedWeeks)?'past':i===result.passedWeeks?'current':'future';
    cell.className=`week ${state}`;cell.setAttribute('aria-hidden','true');
    cells.appendChild(cell);
  }
  grid.replaceChildren(cells);
  grid.setAttribute('aria-label',`${result.totalWeeks} squares from birth to age 18. ${result.weeksLeft} approximate weeks remain. Squares show elapsed time, not parenting activity.`);
  $('#time-placeholder').hidden=true;$('#time-results').hidden=false;
  $('#time-results').setAttribute('tabindex','-1');$('#time-results').focus({preventScroll:true});
});
$('#reset-time').addEventListener('click',()=>{
  timeForm.reset();$('#time-results').hidden=true;$('#time-placeholder').hidden=false;
  $('#time-error').textContent='';birth.removeAttribute('aria-invalid');$('#child-name').focus();
});

}

// Restore a closed mobile menu when crossing back into the desktop layout.
const desktop=window.matchMedia?.('(min-width:1061px)');
desktop?.addEventListener?.('change',event=>{if(event.matches)closeMenu();});
if($('#year'))$('#year').textContent=String(new Date().getFullYear());
})();
