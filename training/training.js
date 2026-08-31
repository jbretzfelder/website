/* =========================================================
   Original inline script block 1
   Extracted automatically from index.html.
   ========================================================= */

/* ---- Top-level view switching ---- */
function showView(viewId){
  document.querySelectorAll('.top-view').forEach(v=>v.classList.toggle('active', v.id===viewId));
  window.scrollTo({top:0, behavior:'instant'});
  if(viewId === 'view-home') refreshHomeStatus();
}
function goHome(){ showView('view-home'); closeMobileNav(); }
function openModule(viewId){ showView(viewId); closeMobileNav(); }
function toggleMobileNav(){
  document.querySelectorAll('.sidebar').forEach(s=>s.classList.toggle('sidebar-open'));
  document.querySelectorAll('.sidebar-backdrop').forEach(b=>b.classList.toggle('show'));
}
function closeMobileNav(){
  document.querySelectorAll('.sidebar').forEach(s=>s.classList.remove('sidebar-open'));
  document.querySelectorAll('.sidebar-backdrop').forEach(b=>b.classList.remove('show'));
}

function refreshHomeStatus(){
  function setStatus(el, doneCount, total){
    if(!el) return;
    if(doneCount === 0){ el.style.display = 'none'; return; }
    el.style.display = 'inline-block';
    if(doneCount >= total){
      el.textContent = 'Complete';
      el.className = 'home-card-status complete';
    } else {
      el.textContent = doneCount + ' of ' + total;
      el.className = 'home-card-status progress';
    }
  }
  const modules = [
    {el: document.getElementById('statusThread'), done: Object.values(bpProgress).filter(Boolean).length, total: bpSECTIONS.length},
    {el: document.getElementById('statusAsam'), done: Object.values(asamProgress).filter(Boolean).length, total: asamTRACKED_SECTIONS.length},
    {el: document.getElementById('statusItp'), done: Object.values(itpProgress).filter(Boolean).length, total: itpTRACKED_SECTIONS.length},
    {el: document.getElementById('statusNote'), done: Object.values(noteProgress).filter(Boolean).length, total: noteTRACKED_SECTIONS.length},
    {el: document.getElementById('statusConclusion'), done: Object.values(conclusionProgress).filter(Boolean).length, total: conclusionSECTIONS.length},
    {el: document.getElementById('statusLoc'), done: Object.values(locProgress).filter(Boolean).length, total: locTRACKED_SECTIONS.length},
    {el: document.getElementById('statusCooccurring'), done: Object.values(cocProgress).filter(Boolean).length, total: cocTRACKED_SECTIONS.length},
    {el: document.getElementById('statusMI'), done: Object.values(miProgress).filter(Boolean).length, total: miTRACKED_SECTIONS.length},
    {el: document.getElementById('statusGroup'), done: Object.values(groupProgress).filter(Boolean).length, total: groupTRACKED_SECTIONS.length},
    {el: document.getElementById('statusEthics'), done: Object.values(ethProgress).filter(Boolean).length, total: ethTRACKED_SECTIONS.length},
    {el: document.getElementById('statusFamily'), done: Object.values(familyProgress).filter(Boolean).length, total: famTRACKED_SECTIONS.length},
    {el: document.getElementById('statusCulture'), done: Object.values(cultProgress).filter(Boolean).length, total: cultTRACKED_SECTIONS.length},
    {el: document.getElementById('statusUpdatedAssessments'), done: Object.values(uaProgress).filter(Boolean).length, total: uaTRACKED_SECTIONS.length},
  ];
  modules.forEach(m => setStatus(m.el, m.done, m.total));

  const completeCount = modules.filter(m => m.done >= m.total).length;
  const overallCountEl = document.getElementById('homeOverallCount');
  const overallFillEl = document.getElementById('homeOverallFill');
  if(overallCountEl) overallCountEl.textContent = completeCount + ' of ' + modules.length + ' complete';
  if(overallFillEl) overallFillEl.style.width = (completeCount / modules.length * 100) + '%';
}

/* =====================================================
   BIG PICTURE MODULE
   ===================================================== */
const bpCHAPTERS = [
  {title:'The Golden Thread', sections:[
    {id:'welcome', label:'Welcome'},
    {id:'thread', label:'The Golden Thread'},
    {id:'thread-example', label:'Follow one thread end to end'},
  ]},
];
const bpSECTIONS = bpCHAPTERS.flatMap(c => c.sections);

let bpProgress = {};
try{ bpProgress = JSON.parse(localStorage.getItem('doctrain-bigpicture-progress') || '{}'); }catch(e){ bpProgress = {}; }

function bpSaveProgress(){
  localStorage.setItem('doctrain-bigpicture-progress', JSON.stringify(bpProgress));
  renderBPNav();
}
function bpMarkComplete(id){
  bpProgress[id] = true;
  bpSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let bpCurrentSection = 'welcome';
function renderBPNav(){
  const navList = document.getElementById('navList-bp');
  navList.innerHTML = '';
  bpCHAPTERS.forEach(chapter=>{
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (bpCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>bpGoTo(s.id);
      const check = document.createElement('span');
      check.className = 'nav-check' + (bpProgress[s.id] ? ' done':'');
      check.textContent = bpProgress[s.id] ? '✓' : '';
      li.appendChild(check);
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = bpSECTIONS.filter(s=>bpProgress[s.id]).length;
  document.getElementById('progressLabel-bp').textContent = doneCount + ' of ' + bpSECTIONS.length + ' complete';
  document.getElementById('progressFill-bp').style.width = (doneCount/bpSECTIONS.length*100) + '%';
}

function bpGoTo(id){
  bpCurrentSection = id;
  document.querySelectorAll('#view-bigpicture section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderBPNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-bp').onclick = ()=>{
  if(confirm('Reset your progress on the Golden Thread overview?')){
    localStorage.removeItem('doctrain-bigpicture-progress');
    bpProgress = {};
    bpSaveProgress();
    resetBeats('welcomeBeats');
    resetBeats('threadBeats');
    resetBeats('threadExampleBeats');
  }
};

/* =====================================================
   GENERIC BEAT-SEQUENCE ENGINE
   Used to click through any section's content one piece
   at a time, instead of showing it all as a wall of text.
   Already-read beats fade to gray; the current beat and
   its "Continue" button stay fully visible.
   ===================================================== */
const BEAT_REGISTRY = {};
const SECTION_TO_CONTAINER = {
  welcome:'welcomeBeats', thread:'threadBeats', 'thread-example':'threadExampleBeats',
  why:'whyBeats', specificity:'specificityBeats',
  dim1:'dim1Beats', dim2:'dim2Beats', dim3:'dim3Beats', dim4:'dim4Beats', dim5:'dim5Beats', dim6:'dim6Beats',
  rating:'ratingBeats', criteria:'criteriaBeats', assembly:'assemblyBeats',
  itpwhy:'itpWhyBeats', itpanatomy:'itpAnatomyBeats', itpanatomyexample:'itpAnatomyExampleBeats', itpfromfinding:'itpFromFindingBeats',
  itpobjectives:'itpObjectivesBeats', itpinterventions:'itpInterventionsBeats',
  itpindividualized:'itpIndividualizedBeats', itpgoals:'itpGoalsBeats',
  itpreviews:'itpReviewsBeats', itpassembly:'itpAssemblyBeats',
  notewhy:'noteWhyBeats', noteanatomy:'noteAnatomyBeats', notetypes:'noteTypesBeats',
  notedescribe:'noteDescribeBeats', noteresponse:'noteResponseBeats', noterisk:'noteRiskBeats',
  noteassembly:'noteAssemblyBeats',
  'loc-why':'locWhyBeats', 'loc-continuum':'locContinuumBeats', 'loc-focus':'locFocusBeats', 'loc-test':'locTestBeats',
  'loc-practice1':'locPractice1Beats', 'loc-transitions':'locTransitionsBeats', 'loc-practice2':'locPractice2Beats',
  'loc-domains':'locDomainsBeats', 'loc-justify':'locJustifyBeats', 'loc-assembly':'locAssemblyBeats',
  'concl-arc':'conclArcBeats', 'concl-monday':'conclMondayBeats',
  'coc-why':'cocWhyBeats', 'coc-scope':'cocScopeBeats', 'coc-withdrawal':'cocWithdrawalBeats',
  'coc-baseline':'cocBaselineBeats', 'coc-si-reframe':'cocSiReframeBeats', 'coc-si-response':'cocSiResponseBeats',
  'coc-assembly':'cocAssemblyBeats',
  'mi-why':'miWhyBeats', 'mi-spirit':'miSpiritBeats', 'mi-stages':'miStagesBeats', 'mi-oars':'miOarsBeats',
  'mi-reflections':'miReflectionsBeats', 'mi-resistance':'miResistanceBeats', 'mi-changetalk':'miChangetalkBeats',
  'mi-assembly':'miAssemblyBeats',
  'gr-why':'grWhyBeats', 'gr-types':'grTypesBeats', 'gr-workinggroup':'grWorkingGroupBeats', 'gr-skills':'grSkillsBeats',
  'gr-blocking':'grBlockingBeats', 'gr-topics':'grTopicsBeats', 'gr-difficult':'grDifficultBeats', 'gr-assembly':'grAssemblyBeats',
  'eth-why':'ethWhyBeats', 'eth-principles':'ethPrinciplesBeats', 'eth-dual':'ethDualBeats', 'eth-selfdisclosure':'ethSelfdisclosureBeats',
  'eth-gifts':'ethGiftsBeats', 'eth-confidentiality':'ethConfidentialityBeats', 'eth-crossing':'ethCrossingBeats', 'eth-assembly':'ethAssemblyBeats',
  'fam-why':'famWhyBeats', 'fam-web':'famWebBeats', 'fam-roles':'famRolesBeats', 'fam-enabling':'famEnablingBeats',
  'fam-codependency':'famCodependencyBeats', 'fam-sessions':'famSessionsBeats', 'fam-resistance':'famResistanceBeats', 'fam-assembly':'famAssemblyBeats',
  'cult-why':'cultWhyBeats', 'cult-define':'cultDefineBeats', 'cult-lens':'cultLensBeats', 'cult-humility':'cultHumilityBeats',
  'cult-authorship':'cultAuthorshipBeats', 'cult-intersectionality':'cultIntersectionalityBeats', 'cult-practice':'cultPracticeBeats', 'cult-assembly':'cultAssemblyBeats',
  'ua-why':'uaWhyBeats', 'ua-newinfo':'uaNewInfoBeats', 'ua-gap':'uaGapBeats', 'ua-scenarios':'uaScenariosBeats', 'ua-assembly':'uaAssemblyBeats',
};

function registerBeats(containerId, beats, finalHtml, afterRender, gate){
  BEAT_REGISTRY[containerId] = {beats, finalHtml, index:0, afterRender: afterRender || null, gate: gate || null};
  renderBeatContainer(containerId);
}
function advanceBeat(containerId){
  const state = BEAT_REGISTRY[containerId];
  if(!state) return;
  state.index = Math.min(state.index + 1, state.beats.length - 1);
  renderBeatContainer(containerId);
  const container = document.getElementById(containerId);
  const current = container ? container.querySelector('.beat-current') : null;
  if(current){
    current.scrollIntoView({behavior:'smooth', block:'start'});
  }
}
function beatKind(html){
  return /scenario-box|textarea|rating-row|criteria-grid|quiz-card|assemblyRatings|classifyCard/.test(html) ? 'practice' : 'read';
}
function renderBeatContainer(containerId){
  const state = BEAT_REGISTRY[containerId];
  const container = document.getElementById(containerId);
  if(!container || !state) return;
  container.innerHTML = '';
  for(let i=0; i<=state.index; i++){
    const div = document.createElement('div');
    const kind = beatKind(state.beats[i]);
    div.className = 'beat beat-kind-' + kind + (i < state.index ? ' beat-read' : ' beat-current');
    const tag = kind === 'practice' ? '<div class="beat-kind-tag">✏️ Try it yourself</div>' : '';
    div.innerHTML = tag + state.beats[i];
    container.appendChild(div);
  }
  const btnWrap = document.createElement('div');
  btnWrap.className = 'beat';
  btnWrap.id = containerId + '-nav';
  container.appendChild(btnWrap);
  updateBeatNav(containerId);
  setupBeatObserver(containerId);
  if(state.afterRender) state.afterRender();
}
function updateBeatNav(containerId){
  const state = BEAT_REGISTRY[containerId];
  const navEl = document.getElementById(containerId + '-nav');
  if(!state || !navEl) return;
  if(state.index < state.beats.length - 1){
    navEl.innerHTML = `<button class="btn" onclick="advanceBeat('${containerId}')">Continue</button>`;
  } else if(state.gate && !state.gate()){
    navEl.innerHTML = `<p class="beat-gate-note">Finish the exercise above to continue.</p>`;
  } else {
    navEl.innerHTML = state.finalHtml;
  }
}
function setupBeatObserver(containerId){
  const state = BEAT_REGISTRY[containerId];
  const container = document.getElementById(containerId);
  if(!state || !container) return;
  if(state.observer) state.observer.disconnect();
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, {threshold:.4});
  container.querySelectorAll('.beat.beat-read').forEach(el=>{
    // Elements not yet fully in the viewport start dimmed until the
    // observer confirms visibility; elements already fully on-screen
    // (e.g. right after clicking Continue) start bright immediately,
    // since the reader is looking right at them.
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    el.classList.toggle('in-view', alreadyVisible);
    observer.observe(el);
  });
  state.observer = observer;
}
function resetBeats(containerId){
  if(BEAT_REGISTRY[containerId]){
    if(BEAT_REGISTRY[containerId].observer) BEAT_REGISTRY[containerId].observer.disconnect();
    BEAT_REGISTRY[containerId].index = 0;
    renderBeatContainer(containerId);
  }
}

/* ---- Welcome ---- */
const WELCOME_BEATS = [
  `<p class="lede">If some part of you is dreading this — dreading feeling lost, dreading getting it wrong — that's a completely normal way to feel walking into something new. This training was built with that feeling in mind.</p>`,
  `<p>You didn't get into this work for the paperwork. You got into it because you're good at sitting with people in hard moments, and you wanted to help them get somewhere better. Whatever else brought you here, that's underneath it.</p>
   <div class="reflection-label">Not required, just for you — and not saved anywhere</div>
   <textarea class="reflection" placeholder="If you want, jot down what brought you to this work. Nothing here is saved or seen by anyone — it's just a moment to think, not a form."></textarea>`,
  `<p>Here's the part that's easy to lose sight of: almost everything that actually helps a client happens outside of documentation — in the room, in a conversation, in a moment where something shifts. Documentation can feel like the opposite of that. Like it's taking you away from the real work.</p>`,
  `<p>But it isn't separate from helping the client — <strong>it's what protects your ability to keep helping them.</strong> If the documentation doesn't hold up, the client's stay doesn't get approved. If the stay isn't approved, the work you did with them doesn't get to continue. Every ASAM, every ITP, every note is part of how your client stays in the room with you long enough for the work to matter.</p>`,
  `<p>DocAssist can help you get the words on the page faster. But it can't hand you the <em>why</em>. Without the why, documentation is just words in the right boxes. With it, every sentence you write is doing something for your client — even the ones that never say a word to them directly.</p>`,
  `<p>So this isn't paperwork training. It's an extension of the clinical work you're already good at. Let's start with how it all fits together.</p>
   <div class="callout">One more thing before you start: there's no reason to push through all four modules back to back. Progress saves automatically, so it's fine to do the Golden Thread today and come back for ASAM tomorrow. And everything here is about the judgment behind the words — when you're ready to actually draft a document, that happens in <a href="https://bretzfelder.com/docassist" target="_blank" rel="noopener">DocAssist</a>, not here.</div>`,
];
const WELCOME_FINAL = `<button class="btn" onclick="bpMarkComplete('welcome'); bpGoTo('thread')">Start: The Golden Thread →</button>`;

/* ---- Golden Thread ---- */
const THREAD_BEATS = [
  `<p class="lede">Start here regardless of how much documentation experience you're coming in with. Everything else in this training — every rule about wording, every checkbox, every field — exists to serve one idea. Once you have this idea clearly, the rest stops feeling like paperwork and starts feeling obvious.</p>`,

  `<p><strong>Quick definitions before anything else:</strong></p>
   <p><span class="term" onclick="this.classList.toggle('term-open')">ASAM<span class="term-def">American Society of Addiction Medicine. In practice, "an ASAM" means the standardized clinical assessment used to determine what level of care a client needs, organized into 6 dimensions.</span></span> is a standardized clinical assessment used to figure out what level of care a client needs.</p>
   <p><span class="term" onclick="this.classList.toggle('term-open')">ITP<span class="term-def">Individual Treatment Plan.</span></span> stands for Individual Treatment Plan — the document that turns each problem identified in the ASAM into a specific, personalized goal.</p>
   <p>There's a third piece too — the Individual Note, which documents what actually happens in session. Here's how all three fit together.</p>`,

  `<h2>Three documents, one job each</h2>
   <p>Woodhaven's clinical record is built primarily from three documents — there are other supporting pieces of paperwork, but these three are the backbone. Each one has exactly one job. In plain terms, before any clinical jargon:</p>
   <div class="thread-diagram">
     <div class="thread-box">
       <div class="thread-box-label">ASAM</div>
       <div class="thread-box-sub">Identifies the problem</div>
       <div class="thread-box-detail">What's actually wrong with this client, how severe it is, and why they need this <span class="term" onclick="this.classList.toggle('term-open')">level of care<span class="term-def">The intensity of treatment a client is currently receiving — for example, 3.5 Residential. Almost everything in an ASAM exists to justify staying at this intensity, or supports stepping down to a less intensive one.</span></span> right now</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">ITP</div>
       <div class="thread-box-sub">Plans the solution</div>
       <div class="thread-box-detail">Turns each identified problem into a specific goal, with objectives and interventions to get there</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Individual Note</div>
       <div class="thread-box-sub">Proves the work</div>
       <div class="thread-box-detail">Documents, session by session, what actually happened toward each objective</div>
     </div>
   </div>
   <div class="thread-loop">↩ What gets documented in the Individual Note becomes the evidence for the next <span class="term" onclick="this.classList.toggle('term-open')">Continued Stay<span class="term-def">An ASAM written partway through treatment — as opposed to the Initial ASAM completed at admission — that reassesses whether a client still needs this level of care, based on what's happened since the last review.</span></span> ASAM — which re-identifies the problem, updates the plan, and the loop starts again. This is why it's called a <em>thread</em>: it never actually ends while the client is in treatment.</div>`,

  `<p>You'll actually draft all three of these documents inside DocAssist, which structures its fields to match this same thread — but the tool only helps you write faster. It can't decide what belongs in each field. That judgment is what the rest of this training builds, one document at a time: first the ASAM, then the ITP, then the Individual Note. Each gets its own deep-dive module. What you're about to learn here is just the shape they all share.</p>`,

  `<h2>Why the order matters — and why you can't skip a link</h2>
   <p>You cannot write a meaningful treatment plan for a problem that hasn't been documented anywhere. If an ITP goal doesn't trace back to something identified in the ASAM, it looks invented — because, procedurally, it was. You also can't write a meaningful session note if there's no objective for that session to be working toward. A note that isn't connected to a plan isn't documentation of treatment; it's just a record that a conversation happened.</p>
   <div class="callout"><strong>This is the single most important idea in this whole training:</strong> a <span class="term" onclick="this.classList.toggle('term-open')">reviewer<span class="term-def">Someone at the client's insurance company (the payer) who reads the documentation to decide whether to keep authorizing and paying for this level of care. Their job is to look for reasons the client no longer needs it — which is exactly why specific, evidence-based writing matters.</span></span> — or an auditor, months later — should be able to take any one Individual Note and trace it backward, link by link, to a specific ASAM finding, with nothing missing in between. If they can't, that note (and the billing behind it) is vulnerable, no matter how well-written the note is on its own.</div>`,

  `<h3>What "the thread breaks" actually looks like</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">Click each one to see what it looks like in practice.</p>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> ASAM without a matching ITP goal</div>
       <div class="break-card-body">A documented problem that nobody is treating. Raises the question of why the client is still here if the identified issue isn't part of the plan.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> ITP goal without a matching ASAM finding</div>
       <div class="break-card-body">A goal that looks arbitrary — like it was copied from a template rather than built for this client.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Individual Note without a referenced objective</div>
       <div class="break-card-body">Reads as unstructured conversation, not billable treatment toward an established plan.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Continued Stay ASAM that doesn't reflect what the notes actually showed</div>
       <div class="break-card-body">The record contradicts itself — the notes said one thing happened, the reassessment says something else.</div>
     </div>
   </div>
   <p>Every rule you'll learn in the rest of this training — why narratives need specific language, why ITP goals need to be edited instead of left as template text, why Individual Notes reference an exact goal letter and objective number — exists to keep this thread intact.</p>`,

  `<h2>Two things to let go of right now</h2>
   <div class="callout"><strong>This isn't a vocabulary test.</strong> You don't need to sound clinical. Plain, human language that's specific and true will always beat clinical-sounding language that's vague. "She said she'd reach out to her ex-boyfriend if she felt lonely" is a stronger sentence than any paragraph full of clinical terms that doesn't say what actually happened. If you're stuck trying to find the "right" clinical word, stop — just say what you saw or heard, in your own words. That's the whole job.</div>
   <div class="callout"><strong>You are not expected to just "know" the right answer.</strong> The State of Ohio licenses you to exercise clinical judgment — not to recite a fact you either know or don't. Judgment means weighing what you're seeing against your training and experience, and reaching a defensible conclusion, even when the picture is mixed or unclear. Every rating, every goal, every narrative in this system is a documented piece of your professional judgment. That's what all of this is actually asking for. You already do this every day with clients — this training is about putting it on paper as clearly as you already think it.</div>`,
];
const THREAD_FINAL = `<button class="btn" onclick="bpMarkComplete('thread'); bpGoTo('thread-example')">Next: Follow one thread end to end →</button>`;

/* ---- Follow one thread end to end ---- */
const THREAD_EXAMPLE_BEATS = [
  `<p class="lede">Here is the same piece of clinical reality, followed through all three documents, for one client. Notice what stays the same, and what changes form, at each step.</p>`,

  `<div class="card">
     <div class="step-header"><span class="step-number">1</span><span class="step-title">What the ASAM identifies</span></div>
     <div class="model-answer">Client reports nightly cravings, currently managed only through peer support available in the residential <span class="term" onclick="this.classList.toggle('term-open')">milieu<span class="term-def">The shared living/treatment environment of the unit — the group setting, peers, and staff a residential client is surrounded by day to day, as opposed to what happens when they're alone.</span></span>. When asked directly to identify a coping response to a craving occurring without staff or peers present, client was unable to name one... Client's current craving management is structurally dependent on this level of care and has not yet transferred to an independent coping plan.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Dimension 5, Continued Stay — this is the <strong>problem</strong>: no independent coping plan, one identified risky contact, no alternative supports named.</p>
   </div>`,

  `<div class="card">
     <div class="step-header"><span class="step-number">2</span><span class="step-title">What the ITP plans to do about it</span></div>
     <div class="card-label" style="color:var(--ink-soft); font-weight:600;">Section C — Dimensions 5 &amp; 6 · Goal A — Relapse Proneness <span style="font-weight:400; font-style:italic;">(these two lines are the section/category already showing in DocAssist, not something you type)</span></div>
     <div class="model-answer">Client stated, "I don't want to keep calling him just because I don't have anyone else."

Goal A: Client will develop coping skills to use during cravings occurring outside of program structure, reducing reliance on her previously identified using contact. (ESTABLISHED 7/24/2025)

Objective 1A: Client will identify two people, other than her previously identified using contact, that she can call when experiencing cravings. (START DATE 7/24/2025) (TARGET DATE 8/24/2025)

Intervention 1A: This clinician will use motivational interviewing to help client identify and commit to alternative support contacts.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Notice this goal didn't come from a template pulled at random — every part of it answers a specific gap named in Step 1, and the required client quote anchors it in her own words. That's what "individualized" means in an ITP: <em>if you can't point to the ASAM sentence that justifies this goal, the goal doesn't belong here yet.</em> The date fields on the objective aren't decoration either — they're what a reviewer checks to confirm this plan is actually being worked, not just written once and forgotten.</p>
   </div>`,

  `<div class="card">
     <div class="step-header"><span class="step-number">3</span><span class="step-title">What the Individual Note proves happened</span></div>
     <div class="model-answer">Describe Therapeutic Interventions Provided:
- This clinician met with client to review Objective 1A of Goal A of Section C.
- Client was asked to identify support contacts other than her previously identified using contact.

Response — Intervention/Progress/Clinical Judgement:
- Client identified her sister and a former sponsor as two alternative contacts she is willing to reach out to during cravings.
- Client rated her confidence in following through as 6/10.
- Objective 1A: not yet completed. Next objective: same, continue reinforcing.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">"Objective 1A" is not a stylistic choice — it's the literal string that lets someone trace this note back to the exact goal it belongs to. That label is the thread, made visible. This is also exactly the two-box structure DocAssist's Individual Note tool generates, ready to paste into these two Remarkable fields.</p>
   </div>`,

  `<div class="callout"><strong>Where the loop closes:</strong> the Continued Stay ASAM doesn't recap what happened in each note — that's not its job, and it's not where progress belongs. But it does have to reflect the current picture: is this risk actually lower now, or does the client still need this level of care for the same reason? If the next Dimension 5 update reads exactly like this one — same risk, same language, nothing about what's changed since — the thread breaks right here. Not because a session went unmentioned, but because nobody actually reassessed anything. The Note documents whether the work is happening; the ASAM has to say what that means for whether treatment here is still necessary.</div>`,

  `<h2>Check your understanding</h2>
   <div class="quiz-card" id="quizCard"></div>`,
];
const THREAD_EXAMPLE_FINAL = `<button class="btn" onclick="openModule('view-asam')">Next: Start ASAM Module →</button>`;

const QUIZ_ITEMS = [
  {
    q: "An Individual Note describes good work on a goal that doesn't appear anywhere in the client's ITP. What does a reviewer conclude?",
    options: [
      "The clinician went above and beyond — this strengthens the record",
      "The documented service may not be tied to an identified need, and could be denied",
      "It doesn't matter, since the note itself is well written",
    ],
    correctIdx: 1,
    explain: "Billable treatment has to trace back to an identified problem and an established plan. A note describing work with no matching ITP goal looks like unstructured conversation, not treatment toward a documented need — regardless of how well it's written."
  },
  {
    q: "Which document has to exist first, for the thread to hold together?",
    options: ["The Individual Note", "The ITP", "The ASAM"],
    correctIdx: 2,
    explain: "The ASAM identifies the problem. Without it, there's nothing for the ITP to build a goal around, and nothing for a note to eventually justify progress against."
  },
  {
    q: "An ASAM finding says a client has 'no independent coping plan' and one named risky contact. Which ITP objective is actually built on that finding?",
    options: [
      "\"Client will feel more confident in recovery.\"",
      "\"Client will identify two people, other than her named contact, to call during cravings, by next review.\"",
      "\"Client will attend all groups this week.\"",
    ],
    correctIdx: 1,
    explain: "The objective has to answer the specific gap named in the ASAM — no alternative supports identified, one named risky contact. A vague confidence goal or a generic attendance goal isn't built from this finding at all; it could apply to any client."
  },
  {
    q: "Danielle's notes show she's been actively working on identifying support contacts, but her next Continued Stay ASAM's Dimension 5 reads exactly the same as it did last time — same risk, same wording, nothing updated. What just happened to the thread?",
    options: [
      "Nothing — the ASAM isn't supposed to reference what happened in notes anyway",
      "It broke — the ASAM was never actually reassessed against the current picture, just copied forward",
      "It's fine, since progress belongs in the Note, not the ASAM",
    ],
    correctIdx: 1,
    explain: "The ASAM shouldn't recap sessions — that's true, and progress does belong in the Note. But the ASAM still has to reassess whether the risk itself has actually changed. An identical Dimension 5 at every review, regardless of what's happened in treatment, means nobody actually looked — that's the break."
  },
];

function buildQuiz(containerId, items, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answeredCount = 0;
  items.forEach((item, qIdx)=>{
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-q';
    const qText = document.createElement('div');
    qText.className = 'quiz-q-text';
    qText.textContent = (items.length > 1 ? (qIdx+1) + '. ' : '') + item.q;
    qDiv.appendChild(qText);
    const optsDiv = document.createElement('div');
    optsDiv.className = 'quiz-options';
    item.options.forEach((optText, optIdx)=>{
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = optText;
      btn.addEventListener('click', ()=>{
        const allBtns = optsDiv.querySelectorAll('.quiz-option');
        allBtns.forEach(b=>b.disabled = true);
        if(optIdx === item.correctIdx){
          btn.classList.add('correct');
        } else {
          btn.classList.add('wrong');
          allBtns[item.correctIdx].classList.add('correct');
        }
        qDiv.querySelector('.quiz-explain').classList.add('show');
        answeredCount++;
        if(answeredCount === items.length && onAllAnswered){
          onAllAnswered();
        }
      });
      optsDiv.appendChild(btn);
    });
    qDiv.appendChild(optsDiv);
    const explain = document.createElement('div');
    explain.className = 'quiz-explain';
    explain.textContent = item.explain;
    qDiv.appendChild(explain);
    card.appendChild(qDiv);
  });
}

/* =====================================================
   LEVELS OF CARE MODULE
   ===================================================== */
const locCHAPTERS = [
  {title:'Levels of Care Module', sections:[
    {id:'loc-why', label:'What "level of care" means'},
    {id:'loc-continuum', label:'The continuum of care'},
    {id:'loc-focus', label:'Same continuum, different jobs'},
    {id:'loc-test', label:'The residential necessity test'},
    {id:'loc-practice1', label:'Case study: Maria'},
    {id:'loc-transitions', label:'Transition readiness by level'},
    {id:'loc-practice2', label:'One more case, three scenarios'},
    {id:'loc-domains', label:'Five domains, one weak link'},
    {id:'loc-justify', label:'Justifying it on paper'},
    {id:'loc-assembly', label:'Put it all together'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'loc-cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
  ]},
];
const locSECTIONS = locCHAPTERS.flatMap(c => c.sections);
const locTRACKED_SECTIONS = locSECTIONS.filter(s => s.trackProgress !== false);

let locProgress = {};
try{ locProgress = JSON.parse(localStorage.getItem('doctrain-loc-progress') || '{}'); }catch(e){ locProgress = {}; }

function locSaveProgress(){
  localStorage.setItem('doctrain-loc-progress', JSON.stringify(locProgress));
  renderLOCNav();
}
function locMarkComplete(id){
  locProgress[id] = true;
  locSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let locCurrentSection = 'loc-why';
function renderLOCNav(){
  const navList = document.getElementById('navList-loc');
  navList.innerHTML = '';
  locCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (locCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>locGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (locProgress[s.id] ? ' done':'');
        check.textContent = locProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = locTRACKED_SECTIONS.filter(s=>locProgress[s.id]).length;
  document.getElementById('progressLabel-loc').textContent = doneCount + ' of ' + locTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-loc').style.width = (doneCount/locTRACKED_SECTIONS.length*100) + '%';
  const locFinalBadge = document.getElementById('locFinalBadge');
  if(locFinalBadge) locFinalBadge.style.display = (doneCount === locTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function locGoTo(id){
  locCurrentSection = id;
  document.querySelectorAll('#view-loc section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderLOCNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-loc').onclick = ()=>{
  if(confirm('Reset all Levels of Care module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-loc-progress');
    locProgress = {};
    locSaveProgress();
    ['locWhyBeats','locContinuumBeats','locFocusBeats','locTestBeats','locPractice1Beats','locTransitionsBeats','locPractice2Beats','locDomainsBeats','locJustifyBeats','locAssemblyBeats'].forEach(resetBeats);
  }
};

/* ---- Generic two-or-more-option decision exercise ----
   Reused for the Maria case, the David case, the vignette/domain
   matching set, and the Danielle domain-readiness assembly. Each
   item is a row: a prompt, a set of button options, and which
   option index is correct. */
function renderLocDecision(containerId, items, onDoneSectionId, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answered = 0;
  items.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    const optsHtml = item.options.map((opt,i)=>`<button class="pill-btn" data-val="${i}" data-idx="${idx}">${opt}</button>`).join('');
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.prompt}</div>
        <div class="classify-explain" id="${containerId}-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">${optsHtml}</div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = items[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const chosenVal = parseInt(btn.dataset.val, 10);
      const correct = chosenVal === item.correctIdx;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns[item.correctIdx].classList.add('chosen-correct');
      }
      document.getElementById(`${containerId}-explain-${idx}`).classList.add('show');
      answered++;
      if(answered === items.length){
        if(onDoneSectionId) locMarkComplete(onDoneSectionId);
        if(onAllAnswered) onAllAnswered();
      }
    });
  });
}
function locRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
}


/* ---- Why this module ---- */
const LOC_WHY_BEATS = [
  `<p class="lede">Before you're ever asked to weigh in on what level of care a client needs, it helps to slow all the way down and get clear on what these numbers even mean. This module assumes nothing — if you've never opened an ASAM in your life, you're in exactly the right place.</p>`,

  `<h3>What "level of care" actually means</h3>
   <p>It's not a grade of how sick someone is. It's the <em>setting</em> a client is receiving treatment in right now — how much structure, how much staff oversight, and how many hours of programming a day. A client can be clinically appropriate for more than one setting on a given day; picking the right one is a judgment call, not a lookup.</p>
   <p style="font-size:13px; color:var(--ink-soft);">One heads-up before you start: this module uses Danielle, the same client you've seen elsewhere in this training, for its final practice case — so if you've done the ASAM module already, some details will feel familiar. If you haven't, that's fine too; nothing here requires it.</p>`,

  `<h3>Why getting this wrong costs something real</h3>
   <p>Almost every counselor in this building has had the same experience: a client steps down before they're actually ready, and within 30 days they're back. That's not a coincidence and it's not bad luck — it's what happens when "ready" gets decided by things like time served or good behavior in the building, instead of by whether the client can actually hold their recovery together without staff nearby.</p>
   <p>The mistake runs the other way too. Keeping someone at a higher level of care than they clinically need isn't "safe" by default — it's a real cost to the client: more restriction, more time away from their life, and a documentation record that won't survive review, since insurance won't keep paying for a level of care the evidence doesn't support. Both directions cause real harm. This module is about learning to tell the difference.</p>`,

  `<div class="callout"><strong>How this connects to the Golden Thread:</strong> level of care is the question underneath almost everything an ASAM documents. Every one of the six dimensions you may already know from the ASAM module exists, in part, to answer one question: does this person still need <em>this much</em> structure, or would less be enough? This module goes deep on that one decision, on its own, before you ever have to write a full narrative around it.</div>`,

  `<h3>What's ahead</h3>
   <p>In order: what the full continuum of care actually looks like, what makes each level different in <em>kind</em> and not just intensity, a decision framework for the transition staff make constantly (3.5 to 2.5), several real practice scenarios, and finally, how to put a level-of-care decision into words that hold up on paper.</p>`,
];
const LOC_WHY_FINAL = `<button class="btn" onclick="locMarkComplete('loc-why'); locGoTo('loc-continuum')">Next: The continuum of care →</button>`;

/* ---- The continuum of care ---- */
const LOC_CONTINUUM_BEATS = [
  `<p class="lede">ASAM's levels aren't a severity scale from 1 to 10. They're a menu of different treatment settings, each with its own staffing, structure, and hours — and the number attached to each one describes the setting, not how "far along" a client is.</p>`,

  `<h3>Reading the numbers</h3>
   <p>A whole number is a broad category (0, 1, 2, 3, 4). A decimal after it narrows that down to a specific level within the category — for example, 3.1, 3.5, and 3.7 are all forms of residential care, but they're built for very different clinical pictures. Higher numbers mean more structure and staff involvement, not "more sick." A client can genuinely need a 3.5 today and a 1 in three months, and neither one is a reflection of how "bad" their case is — just what setting fits where they are right now.</p>`,

  `<h3>The full continuum, low to high</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">Click each one to see what it actually looks like day to day.</p>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 0.5 — Early Intervention</div>
       <div class="break-card-body">Education and monitoring for at-risk use that hasn't reached a diagnosable disorder — often a single session or a short series, not ongoing treatment.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 1 — Outpatient</div>
       <div class="break-card-body">Scheduled individual or group sessions, usually a few hours a week. The client is living independently full-time and managing everything else in their life around it.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 2.1 — Intensive Outpatient (IOP)</div>
       <div class="break-card-body">Several hours of programming, several days a week — more structure than standard outpatient, but the client still lives independently and manages their own schedule around it.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 2.5 — Partial Hospitalization (Day Treatment)</div>
       <div class="break-card-body">20+ hours of programming a week — most of the day, most days — but the client returns home in the evenings and overnight. The first level where a client is genuinely tested on unsupervised time.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 3.1 — Clinically Managed Low-Intensity Residential</div>
       <div class="break-card-body">Live-in care with lighter clinical structure than 3.5, often used for longer-term stays while a client builds stability and independent living skills.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 3.5 — Clinically Managed High-Intensity Residential</div>
       <div class="break-card-body">Live-in care with 24/7 clinical oversight from non-medical staff — no nursing on site. This is where intensive skill-building and behavioral work happens.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 3.7 / 3.7WM — Medically Monitored Intensive Inpatient / Withdrawal Management</div>
       <div class="break-card-body">Live-in care with 24/7 medical monitoring — nursing always available, physician oversight. Built for medical stabilization, most often acute withdrawal.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> 4 — Medically Managed Intensive Inpatient</div>
       <div class="break-card-body">Hospital-level care for the most acute medical or psychiatric presentations — beyond what a residential facility is equipped to manage.</div>
     </div>
   </div>`,

  `<div class="callout">Woodhaven currently operates five of these levels: <strong>1 (Outpatient), 2.1 (IOP), 2.5, 3.5, and 3.7WM</strong>. This module's practice sections zoom in on the 3.7WM → 3.5 → 2.5 stretch specifically, since that's where the highest-stakes, hardest-to-call transitions happen. But the same idea — demonstrated readiness over time served, one weak domain holding a decision — applies just as much to a 2.5-to-2.1 or 2.1-to-1 conversation.</div>`,

  `<h2>Check your understanding</h2>
   <div class="quiz-card" id="locContinuumQuizCard"></div>`,
];
const LOC_CONTINUUM_FINAL = `<button class="btn" onclick="locGoTo('loc-focus')">Next: Same continuum, different jobs →</button>`;

const LOC_CONTINUUM_QUIZ_ITEMS = [
  {
    q: "A client moves from 3.5 to 2.5. What does that transition actually mean?",
    options: [
      "She's gotten worse and needs to be monitored more closely",
      "She's gotten better slowly, so she needs less treatment overall",
      "She's ready to practice what she's learned with less supervision, not less treatment",
    ],
    correctIdx: 2,
    explain: "2.5 is still 20+ hours a week of programming — it's not a lighter version of treatment. What changes is supervision: evenings and nights are now unsupervised, which is exactly the skill 2.5 exists to test."
  },
  {
    q: "What does a higher ASAM level number mean?",
    options: [
      "The client is sicker than a client at a lower level",
      "The setting has more structure and staff involvement, not that the client is worse off",
      "The client has been in treatment longer",
    ],
    correctIdx: 1,
    explain: "The number describes the treatment setting, not a severity score. A client can need a high level of care briefly and a lower one for much longer — the number tracks the setting that fits right now."
  },
];


/* ---- Same continuum, different jobs ---- */
const LOC_FOCUS_BEATS = [
  `<p class="lede">Here's the single biggest misconception to unlearn: 3.7WM, 3.5, and 2.5 don't just differ by "how much" structure a client gets. They differ by what job each level is actually doing. Mixing that up is where a lot of bad level-of-care decisions start.</p>`,

  `<div class="thread-diagram">
     <div class="thread-box">
       <div class="thread-box-label">3.7WM</div>
       <div class="thread-box-sub">Medical Stabilization</div>
       <div class="thread-box-detail">24/7 medical monitoring, physician availability, nursing always on site. Structured programming 5+ hours a day. The goal is getting the body safe.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">3.5</div>
       <div class="thread-box-sub">Skill-Building &amp; Behavioral Change</div>
       <div class="thread-box-detail">24/7 clinical oversight from non-medical staff — no nursing on site. Intensive programming. The goal is building the skills recovery actually requires.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">2.5</div>
       <div class="thread-box-sub">Real-World Application</div>
       <div class="thread-box-detail">20+ hours a week of programming, evenings and nights at home. The goal is proving those skills hold up with less supervision.</div>
     </div>
   </div>`,

  `<div class="callout"><strong>Critical mindset to hold onto: there is no nursing available at 3.5.</strong> A client transitioning from 3.7WM to 3.5 has to be able to manage their own medical needs — or need only the level of support non-medical clinical staff can actually provide. If a client is still relying on nursing for medication compliance or reassurance about physical symptoms, that's not a 3.5 need, no matter how emotionally or behaviorally ready they otherwise look.</div>`,

  `<h3>What actually changes at each step</h3>
   <ul class="checklist">
     <li>3.7WM → 3.5 isn't "less medical support" — it's a hard line. Nursing goes away entirely.</li>
     <li>3.5 → 2.5 isn't "less treatment" — it's the same intensity of programming, minus 24-hour supervision. Evenings become the client's first unsupervised test.</li>
     <li>Compliance inside the building — attending groups, following rules, being polite to staff — doesn't answer whether a client is ready for either step. It tells you almost nothing about what happens when nobody's watching.</li>
   </ul>`,

  `<h2>Check your understanding</h2>
   <div class="quiz-card" id="locFocusQuizCard"></div>`,
];
const LOC_FOCUS_FINAL = `<button class="btn" onclick="locMarkComplete('loc-focus'); locGoTo('loc-test')">Next: The residential necessity test →</button>`;

const LOC_FOCUS_QUIZ_ITEMS = [
  {
    q: "A client at 3.5 asks the on-call staff member for help managing her diabetes medication overnight. What does this tell you?",
    options: [
      "Nothing unusual — 3.5 has nursing coverage for exactly this",
      "This is a mismatch — 3.5 has no nursing on site, so ongoing medical dependence like this belongs at a level with medical monitoring",
      "It's fine as long as she's compliant with groups during the day",
    ],
    correctIdx: 1,
    explain: "3.5 is clinical, not medical, oversight — there's no nursing on site. A client who still needs hands-on medical support hasn't finished the job 3.7WM exists to do."
  },
];

/* ---- The residential necessity test ---- */
const LOC_TEST_BEATS = [
  `<p class="lede">Now the actual decision framework — specifically for the judgment call staff make constantly: is this client ready to move from 3.5 to 2.5?</p>`,

  `<div class="callout" style="font-size:15px; text-align:center;"><strong>The litmus test:</strong> "Can this person maintain their recovery gains for 12–16 hours without professional oversight?"</div>
   <p>If the honest answer is no, they need 3.5. If the honest answer is yes — across the board, not just in the areas that are easy to feel good about — they're ready for 2.5. It's a simple question to ask and a hard one to answer honestly, because it isn't the same question as "is this person doing well here."</p>`,

  `<h3>What "no" looks like</h3>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Needs 3.5</span>
       <p>Environmental Control Needs:
- Cannot resist substance use when alone or unsupervised
- Lacks safe, sober housing
- Lives with active users or an unsupportive family
- History of immediate relapse when structure decreases

Skill Deficit Severity:
- Cannot manage basic daily living tasks consistently
- Needs real-time modeling or practice for interpersonal skills
- Requires immediate intervention for maladaptive behaviors
- Cannot generalize coping skills from counseling into daily situations</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Ready for 2.5</span>
       <p>Recovery behaviors during unsupervised time

Stable housing and transportation

Can identify and use support systems independently

Consistent engagement even when structure decreases

Self-management of medical needs</p>
     </div>
   </div>`,

  `<div class="callout">Notice what's missing from both lists: attendance, rule-following, being polite to staff. Those are baseline expectations, not evidence of readiness — the litmus test is about what happens the moment nobody's watching, not how someone behaves inside the building.</div>`,
];
const LOC_TEST_FINAL = `<button class="btn" onclick="locMarkComplete('loc-test'); locGoTo('loc-practice1')">Next: Case study — Maria →</button>`;


/* ---- Case study: Maria ---- */
const LOC_PRACTICE1_BEATS = [
  `<p class="lede">Time to apply the litmus test to a real kind of case — the kind you'll see constantly.</p>`,

  `<div class="scenario-box">
     <div class="who">Client: Maria, 28 — 3.5 Residential, Day 45</div>
     Maria follows program rules and attends all groups without incident. She needs constant reminders from staff for basic hygiene tasks. She consistently chooses relationships that staff and peers have flagged as problematic. When confronted directly about these patterns, she shuts down and disengages from the conversation.
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you decide, run her through the litmus test:</div>
     <ol>
       <li>Rule-following and attendance don't answer the question. What does?</li>
       <li>Does she show the skill-deficit pattern (needs real-time modeling, can't generalize coping skills, needs immediate intervention for maladaptive patterns) — or the unsupervised-ready pattern?</li>
       <li>What happens the moment structure decreases and nobody's there to redirect her?</li>
     </ol>
   </div>
   <div class="card" id="locMariaClassifyCard"><!-- injected by JS --></div>`,
];
const LOC_PRACTICE1_FINAL = `<button class="btn" onclick="locGoTo('loc-transitions')">Next: Transition readiness by level →</button>`;

const LOC_MARIA_ITEMS = [
  {
    prompt: "Maria: ready for 2.5, or maintain 3.5?",
    options: ["Ready for 2.5", "Maintain 3.5"],
    correctIdx: 1,
    explain: "Maintain 3.5. Needing constant hygiene reminders, consistently choosing problematic relationships, and shutting down instead of engaging with feedback are all skill-deficit signs — she needs real-time intervention and modeling, which 2.5's reduced supervision can't provide. Compliance with the program's structure isn't the same as being able to function without it."
  },
];

/* ---- Transition readiness by level ---- */
const LOC_TRANSITIONS_BEATS = [
  `<p class="lede">Readiness isn't about time served or program completion. It's about demonstrable evidence of specific capabilities at each level — the same skill actually shown, not just time passed.</p>`,

  `<p style="font-size:13.5px; color:var(--ink-soft);">Click each transition to see what actually counts as evidence.</p>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> From 3.7WM to 3.5</div>
       <div class="break-card-body">Medical stability achieved. Engagement with treatment programming. Reduced acute symptoms. Can function without constant medical oversight — no more relying on nursing for medication compliance or reassurance.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> From 3.5 to 2.5</div>
       <div class="break-card-body">Demonstrated coping skills across various situations, not just in session. Consistent program engagement. Beginning insight into triggers and warning signs. Can maintain recovery behaviors when unsupervised. Safe living environment secured.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> From 2.5 to Outpatient</div>
       <div class="break-card-body">Stable in the community for an extended period. Strong support network actually activated, not just identified. Employment or other meaningful activity engaged. Independent medical management.</div>
     </div>
   </div>`,

  `<div class="callout">Notice the pattern across all three: every item is something a reviewer — or you, six months from now — could point to and say "here's the evidence." None of them are "enough time has passed" or "no incidents this week." Absence of a problem isn't the same as demonstrated readiness.</div>`,
];
const LOC_TRANSITIONS_FINAL = `<button class="btn" onclick="locMarkComplete('loc-transitions'); locGoTo('loc-practice2')">Next: One more case, three scenarios →</button>`;


/* ---- One more case, three scenarios ---- */
const LOC_PRACTICE2_BEATS = [
  `<p class="lede">One more single case to walk through carefully, then three quick-hit scenarios to round out the pattern.</p>`,

  `<div class="scenario-box">
     <div class="who">Client: David, 45 — 3.7WM, Day 12</div>
     David is diabetic. His blood sugar has been stable for 5 days. He's attending all groups and his mood has improved. Yesterday he asked the nurse three separate times about minor stomach discomfort. He takes all of his medications, but only when reminded by nursing staff.
   </div>
   <div class="card" id="locDavidClassifyCard"><!-- injected by JS --></div>`,

  `<h3>Three quick vignettes — which domain is the actual problem?</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">In each of these, everything else about the client looks ready for 2.5. One domain isn't. Pick the domain, then read why it's enough on its own to hold the recommendation at 3.5.</p>
   <div class="card" id="locVignetteClassifyCard"><!-- injected by JS --></div>`,

  `<div class="callout"><strong>The pattern across all four cases in this section:</strong> one weak domain is enough to keep someone at the higher level of care, even when everything else looks ready. That's not overcaution — a single unresolved risk area is exactly what a relapse exploits. This is sometimes called the "one weak domain" rule, and it holds up because recovery doesn't fail on the areas that are already solid.</div>`,
];
const LOC_PRACTICE2_FINAL = `<button class="btn" onclick="locGoTo('loc-domains')">Next: Five domains, one weak link →</button>`;

const LOC_DAVID_ITEMS = [
  {
    prompt: "David: ready to move to 3.5, or maintain 3.7WM?",
    options: ["Ready for 3.5", "Maintain 3.7WM"],
    correctIdx: 1,
    explain: "Maintain 3.7WM. Blood sugar stability and mood improvement are real progress, but he's still relying on nursing for medication compliance and for reassurance about physical symptoms — exactly the support 3.5 doesn't have. \"Takes his medications when reminded\" isn't the same as managing them independently."
  },
];

const LOC_VIGNETTE_ITEMS = [
  {
    prompt: "Medically stable, mood stable, good program engagement — but the client's family is actively using substances in the home she'll return to.",
    options: ["Medical Complexity", "Support Systems", "Social Skills"],
    correctIdx: 1,
    explain: "Support Systems. An actively-using household isn't a background detail — it's a toxic environment that will actively undermine early recovery the moment she's unsupervised there. Recommendation: maintain 3.5 until a safe living environment is secured; this can't be worked around from a distance."
  },
  {
    prompt: "Medically stable, psychiatrically stable, strong daily living skills — but a documented history of relapsing immediately whenever structure decreases in the past.",
    options: ["Psychiatric Stability", "Daily Living Skills", "Medical Complexity"],
    correctIdx: 0,
    explain: "Psychiatric Stability. \"Stable right now, inside a highly structured setting\" isn't the same question as \"stable when structure decreases\" — and history is the best predictor available. Recommendation: maintain 3.5; the pattern needs to actually be interrupted once before it's safe to test again with less supervision."
  },
  {
    prompt: "Every other area is stable — except the client cannot manage interpersonal conflict without staff stepping in to mediate.",
    options: ["Social Skills", "Support Systems", "Daily Living Skills"],
    correctIdx: 0,
    explain: "Social Skills. Interpersonal conflict is inevitable in any community setting, supervised or not — and 2.5's evening hours are exactly when staff won't be there to mediate. Recommendation: maintain 3.5 until she can navigate conflict independently."
  },
];


/* ---- Five domains, one weak link ---- */
const LOC_DOMAINS_BEATS = [
  `<p class="lede">Now that you've seen the one-weak-domain rule in action four times, here are the five domains themselves, spelled out — the questions worth actually asking before recommending any 3.5 → 2.5 transition.</p>`,

  `<p style="font-size:13.5px; color:var(--ink-soft);">Click each domain to see the specific questions underneath it.</p>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Medical Complexity</div>
       <div class="break-card-body">Can they manage their medications independently? Do they recognize a medical emergency when it's happening? Can they communicate clearly with healthcare providers on their own?</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Psychiatric Stability</div>
       <div class="break-card-body">Are they managing symptoms without 24/7 oversight? Are they using coping skills consistently, not just when prompted? Do they recognize their own early warning signs?</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Social Skills</div>
       <div class="break-card-body">Are they navigating relationships appropriately? Can they manage conflict without staff intervention? Are they building healthy support connections, or repeating the same patterns?</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Daily Living Skills</div>
       <div class="break-card-body">Cooking, cleaning, budgeting — independently? Time management and basic self-care? Transportation and the general logistics of daily life?</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Support Systems</div>
       <div class="break-card-body">Are recovery-oriented relationships actually established, or just identified on paper? Are family or social supports engaged in a way that helps, not hurts? Are community resources identified <em>and</em> accessible — not just theoretically available?</div>
     </div>
   </div>`,

  `<div class="callout">If you've already been through the ASAM module, these five domains will feel familiar — they're the same clinical picture as the six dimensions, reorganized around one specific decision: is this person ready for less supervision, right now, in each of these areas. If you haven't been through that module, nothing here requires it; you now have everything you need for this one.</div>`,

  `<h2>Check your understanding</h2>
   <div class="quiz-card" id="locDomainsQuizCard"></div>`,
];
const LOC_DOMAINS_FINAL = `<button class="btn" onclick="locMarkComplete('loc-domains'); locGoTo('loc-justify')">Next: Justifying it on paper →</button>`;

const LOC_DOMAINS_QUIZ_ITEMS = [
  {
    q: "A client has excellent daily living skills, strong support systems, and good medical self-management — but has never once had to resolve a conflict without a staff member stepping in. What's the recommendation?",
    options: [
      "Ready for 2.5 — four out of five domains is a strong track record",
      "Maintain 3.5 — the one untested domain (Social Skills) is enough on its own",
      "It depends on how many groups she's attended",
    ],
    correctIdx: 1,
    explain: "One weak or untested domain is enough to hold the recommendation at the higher level of care. A strong track record everywhere else doesn't offset a domain that hasn't actually been demonstrated — and conflict without staff nearby is exactly what 2.5's evening hours will test."
  },
];


/* ---- Justifying it on paper ---- */
const LOC_JUSTIFY_BEATS = [
  `<p class="lede">Deciding the right level of care is only half the job. The other half is writing it down in a way that actually holds up — because the words in the ASAM are the only evidence a reviewer ever sees.</p>`,

  `<div class="callout"><strong>The reframe worth holding onto:</strong> an ASAM isn't an intake form. It's a clinical argument. Every dimension is answering one question for whoever's reviewing it: why does this person need this level of care right now, and why would a lower level of care fall short? If that idea is clear, everything about how these narratives get written starts to make more sense.</div>`,

  `<p>A payer reviewer isn't reading your documentation to get to know the client. They're reading it looking for a reason a lower, cheaper level of care would do. Every sentence either gives them that reason or takes it away — which means vague, reassuring language is exactly what makes their job easier, not yours.</p>`,

  `<h3>Same clinical picture, two very different write-ups</h3>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Gets challenged</span>
       <p>Client is motivated for treatment and wants to get sober for his family. He agrees he has a problem and is ready to do the work.</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Justifies the level of care</span>
       <p>Client verbalizes intent to remain sober but has not yet demonstrated follow-through: missed his assigned relapse-prevention worksheet twice this week and continues to minimize his use as "not that bad compared to some people here." This gap between stated intent and observed behavior indicates he still requires the structured, monitored intervention this level of care provides to translate motivation into sustained behavior change.</p>
     </div>
   </div>
   <p class="hero-note">Same client, same week. The left version is true, reassuring, and completely useless to a reviewer — it reads as a reason to discharge. The right version says exactly the same underlying reality, but names the specific gap between what he says and what he does, which is the actual reason a lower level of care wouldn't hold him accountable the same way.</p>`,

  `<h3>Six ways a real ASAM can fail to justify the level of care</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">These are drawn from an actual set of weak dimension write-ups. Click each to see exactly what's missing.</p>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> "Client reports heavy alcohol use. Currently in withdrawal. Medical staff monitoring. Risk is high."</div>
       <div class="break-card-body">No substances named specifically, no quantities, no frequency, no withdrawal history, no vital sign trend. "Risk is high" is a conclusion with nothing underneath it — a reviewer can't picture what "monitoring" is actually catching.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> "Client has some medical history. No acute concerns at this time. Medications noted in chart."</div>
       <div class="break-card-body">"Medications noted in chart" is not documentation — it's a pointer to documentation that doesn't exist in this dimension. If a condition doesn't connect to relapse risk or treatment needs, say so plainly; if it does, say exactly how.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> "Client reports history of depression and anxiety. Has been prescribed medication in the past. Denies current suicidal ideation. Mood is stable."</div>
       <div class="break-card-body">A list of diagnoses without any description of how symptoms are presenting right now, or how they're affecting treatment engagement. History alone doesn't justify anything — current presentation and its clinical impact does.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> "Client is motivated for treatment and wants to get sober for his family. He agrees he has a problem and is ready to do the work."</div>
       <div class="break-card-body">This is the most common failure mode in the whole document. "Motivated" and "ready to do the work" describe almost every client who voluntarily admits — they justify nothing on their own, and read as a reason to discharge rather than continue.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> "Client has been to treatment before and relapsed. He is at risk for relapse. Residential level of care is recommended."</div>
       <div class="break-card-body">A conclusion asserted without an argument underneath it. Being "at risk for relapse" needs the pattern, history, or trigger that supports that conclusion — otherwise a reviewer has no way to evaluate whether the recommendation is sound.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> "Client has family support. Living situation is somewhat unstable. Will need to address this in treatment."</div>
       <div class="break-card-body">"Somewhat unstable" could mean almost anything — from a noisy household to an actively using one. Without describing what's actually unstable, this sentence can't do the job it's supposed to do: showing whether the environment supports or undermines this client's recovery.</div>
     </div>
   </div>`,

  `<h3>Try it: rewrite one</h3>
   <p>Here's a weak Dimension 5 write-up. Using what you now know about the residential necessity test, rewrite it so it actually justifies the level of care.</p>
   <div class="scenario-box">
     <div class="who">Weak version — Dimension 5, Relapse/Continued Use Potential</div>
     Client has been to treatment before and relapsed. He is at risk for relapse. Residential level of care is recommended.
     <div class="meta" style="margin-top:10px; display:block;">Background fact you can use: this is his second treatment episode. He relapsed within a week of his last discharge, after returning to the same apartment and the same using contact, with no alternative coping plan in place.</div>
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you write, work through these:</div>
     <ol>
       <li>What's the actual pattern — not just "he relapsed once," but what happened, how fast, and under what conditions?</li>
       <li>What does the residential necessity test say about whether that pattern could repeat outside this level of care?</li>
       <li>What's still missing right now that would need to change before a lower level of care could hold?</li>
     </ol>
   </div>
   <textarea id="locJustifyAnswer" placeholder="Write your rewritten Dimension 5 narrative here..." oninput="document.getElementById('locJustifyRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="locJustifyRevealBtn" disabled onclick="locRevealModel('locJustify'); locMarkComplete('loc-justify')">Reveal model answer</button>
   </div>
   <div class="reveal" id="locJustifyReveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">This is client's second treatment episode. Following his first discharge, he relapsed within one week after returning to the same residence and the same using contact, with no independent coping plan or alternative living arrangement in place. He has not yet identified what would be different this time, and no new coping strategy or environmental change has been established to interrupt that pattern. Given the speed and consistency of his prior relapse under similar unsupervised conditions, his risk of continued use without this level of care's structure and monitoring remains significant.</div>
     <ul class="checklist">
       <li>Names the actual pattern — how fast, under what conditions — instead of asserting "at risk" with nothing underneath it</li>
       <li>Ties directly to the litmus test: what happens without this level of care's structure, specifically</li>
       <li>Says what's still missing, which is what a lower level of care would actually need to see before a step-down makes sense</li>
     </ul>
   </div>`,

  `<h3>What every level-of-care justification needs</h3>
   <ul class="checklist">
     <li>Specific evidence — a date, a quote, a number, an observed behavior. Not a conclusion standing alone.</li>
     <li>A description of what happens <em>without</em> this level of care, not just how the client is doing inside it</li>
     <li>A direct link to one of the five domains — medical, psychiatric, social, daily living, or support systems — so the recommendation is traceable, not just asserted</li>
   </ul>`,
];
const LOC_JUSTIFY_FINAL = `<button class="btn" onclick="locGoTo('loc-assembly')">Next: Put it all together →</button>`;


/* ---- Put it all together: Danielle ---- */
const LOC_ASSEMBLY_BEATS = [
  `<p class="lede">One last case — the same kind of decision you'll make constantly, gathered into a single full picture. This is Danielle, three weeks into 3.5, being considered for a step-down to 2.5.</p>`,

  `<div class="scenario-box">
     <div class="who">Client: Danielle — 3.5 Residential, Week 3, Continued Stay review</div>
     <strong>Medical Complexity:</strong> No active medical issues; manages her own basic health needs without staff involvement.<br><br>
     <strong>Psychiatric Stability:</strong> Mood has been stable for the full three weeks. No crisis episodes. Uses coping skills consistently in session and can name her early warning signs.<br><br>
     <strong>Social Skills:</strong> Two documented incidents this week where staff had to step in to mediate conflicts with peers; she was unable to de-escalate or resolve either one independently.<br><br>
     <strong>Daily Living Skills:</strong> Manages her own hygiene, laundry, and daily schedule independently, without reminders.<br><br>
     <strong>Support Systems:</strong> Her previously identified using contact still lives two blocks from her planned discharge residence. She has named two alternative support contacts — her sister and a former sponsor — but hasn't yet had to actually call either one under real craving conditions.
   </div>`,

  `<h3>Work through each domain</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">For each one, decide: is this domain ready for 2.5, or not yet?</p>
   <div class="card" id="locAssemblyClassifyCard"><!-- injected by JS --></div>`,

  `<div class="reveal" id="locAssemblyOverallReveal">
     <div class="card-label">Overall recommendation</div>
     <div class="callout">Four of five domains look ready. But Social Skills isn't — two staff-mediated conflicts in one week is exactly the kind of real-time intervention 3.5 exists to provide, and 2.5's evening hours won't have staff standing by to catch it. One weak domain is enough. <strong>Recommendation: maintain 3.5</strong>, with a specific objective addressing independent conflict navigation before the next review.</div>
   </div>`,

  `<h3>Write the justification</h3>
   <p>Write the one-to-two sentence justification you'd put in Danielle's Continued Stay ASAM explaining why 3.5 remains necessary, based specifically on the Social Skills domain.</p>
   <div class="scaffold-box">
     <div class="scaffold-label">What your answer needs:</div>
     <ol>
       <li>The specific, dated evidence (two staff-mediated conflicts this week)</li>
       <li>What that evidence means for unsupervised time specifically</li>
       <li>What would need to change before this domain would support a step-down</li>
     </ol>
   </div>
   <textarea id="locAssemblyAnswer" placeholder="Write your justification here..." oninput="document.getElementById('locAssemblyRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="locAssemblyRevealBtn" disabled onclick="locRevealModel('locAssembly'); locMarkComplete('loc-assembly')">Reveal model answer</button>
   </div>
   <div class="reveal" id="locAssemblyReveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">This week, client required staff mediation to resolve two separate peer conflicts and was unable to de-escalate or resolve either independently. Given that 2.5's evening hours provide no staff availability for this kind of real-time intervention, client has not yet demonstrated the independent conflict-resolution skills this level of care is structured to support. Continued residential placement at 3.5 is recommended to directly address this gap before considering a step-down.</div>
   </div>`,

  `<div class="callout">Notice this is the exact shape of every LOC justification in this module: specific dated evidence, what it means for unsupervised time, and what's still missing. That's the whole formula — everything else is just applying it to a different domain.</div>
   <span class="badge-done" id="locFinalBadge" style="display:none;">🎉 You've completed the Levels of Care module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="locGoTo('loc-cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span> is built to be reopened anytime you're actually weighing a transition — not just read once during training.
   </div>
   <div class="callout" style="margin-top:16px;">
     <strong>Where this connects:</strong> the ASAM module is where a decision like this one gets written into the six-dimension narrative a reviewer actually sees.
   </div>`,
];
const LOC_ASSEMBLY_FINAL = `<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
  <button class="btn secondary" onclick="goHome()">← Back to Clinical Training home</button>
  <button class="btn" onclick="openModule('view-asam')">Go to: ASAM Module →</button>
</div>`;

const LOC_ASSEMBLY_ITEMS = [
  {
    prompt: "Medical Complexity",
    options: ["Ready for 2.5", "Not yet"],
    correctIdx: 0,
    explain: "Ready. She manages her own basic health needs without staff involvement — no ongoing medical dependence to flag here."
  },
  {
    prompt: "Psychiatric Stability",
    options: ["Ready for 2.5", "Not yet"],
    correctIdx: 0,
    explain: "Ready. Three full weeks of stable mood, consistent use of coping skills in session, and the ability to name her own warning signs — this is demonstrated, not just claimed."
  },
  {
    prompt: "Social Skills",
    options: ["Ready for 2.5", "Not yet"],
    correctIdx: 1,
    explain: "Not yet. Two staff-mediated conflicts this week means she hasn't shown she can navigate conflict without intervention — and 2.5's evening hours won't have staff there to step in."
  },
  {
    prompt: "Daily Living Skills",
    options: ["Ready for 2.5", "Not yet"],
    correctIdx: 0,
    explain: "Ready. Independent hygiene, laundry, and schedule management without reminders — exactly what this domain is asking about."
  },
  {
    prompt: "Support Systems",
    options: ["Ready for 2.5", "Not yet"],
    correctIdx: 0,
    explain: "Ready, with a caveat worth watching. Two alternative contacts are named and willing — untested under real craving conditions is a reasonable early-2.5 goal, not a reason to hold her at 3.5 on its own. The proximity of her prior contact is worth flagging for her ITP, but it doesn't override this domain by itself."
  },
];


/* ---- Render wiring for interactive sections ---- */
function locRenderContinuum(){
  buildQuiz('locContinuumQuizCard', LOC_CONTINUUM_QUIZ_ITEMS, ()=>locMarkComplete('loc-continuum'));
}
function locRenderFocus(){
  buildQuiz('locFocusQuizCard', LOC_FOCUS_QUIZ_ITEMS, ()=>locMarkComplete('loc-focus'));
}
function locRenderPractice1(){
  renderLocDecision('locMariaClassifyCard', LOC_MARIA_ITEMS, 'loc-practice1');
}
function locRenderPractice2(){
  renderLocDecision('locDavidClassifyCard', LOC_DAVID_ITEMS, null);
  renderLocDecision('locVignetteClassifyCard', LOC_VIGNETTE_ITEMS, 'loc-practice2');
}
function locRenderDomains(){
  buildQuiz('locDomainsQuizCard', LOC_DOMAINS_QUIZ_ITEMS, ()=>locMarkComplete('loc-domains'));
}
function locShowAssemblyOverall(){
  const el = document.getElementById('locAssemblyOverallReveal');
  if(el) el.classList.add('show');
}
function locRenderAssembly(){
  renderLocDecision('locAssemblyClassifyCard', LOC_ASSEMBLY_ITEMS, null, locShowAssemblyOverall);
}


/* =====================================================
   ASAM MODULE
   ===================================================== */
const asamCHAPTERS = [
  {title:'ASAM Module', sections:[
    {id:'why', label:'Why this matters'},
    {id:'specificity', label:'Specific vs. generic'},
    {id:'dim1', label:'Dimension 1 deep dive'},
    {id:'dim2', label:'Dimension 2 deep dive'},
    {id:'dim3', label:'Dimension 3 deep dive'},
    {id:'dim4', label:'Dimension 4 deep dive'},
    {id:'dim5', label:'Dimension 5 deep dive'},
    {id:'dim6', label:'Dimension 6 deep dive'},
    {id:'rating', label:'Risk rating calibration'},
    {id:'criteria', label:'Criteria checklist'},
    {id:'assembly', label:'Put it all together'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
    {id:'mistakes', label:'Common mistakes recap', trackProgress:false},
    {id:'faq', label:'FAQ', trackProgress:false},
  ]},
];
const asamSECTIONS = asamCHAPTERS.flatMap(c => c.sections);
const asamTRACKED_SECTIONS = asamSECTIONS.filter(s => s.trackProgress !== false);

let asamProgress = {};
try{ asamProgress = JSON.parse(localStorage.getItem('doctrain-asam-progress') || '{}'); }catch(e){ asamProgress = {}; }

function asamSaveProgress(){
  localStorage.setItem('doctrain-asam-progress', JSON.stringify(asamProgress));
  renderASAMNav();
}
function markComplete(id){
  asamProgress[id] = true;
  asamSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let asamCurrentSection = 'why';
function renderASAMNav(){
  const navList = document.getElementById('navList-asam');
  navList.innerHTML = '';
  asamCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (asamCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>asamGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (asamProgress[s.id] ? ' done':'');
        check.textContent = asamProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = asamTRACKED_SECTIONS.filter(s=>asamProgress[s.id]).length;
  document.getElementById('progressLabel-asam').textContent = doneCount + ' of ' + asamTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-asam').style.width = (doneCount/asamTRACKED_SECTIONS.length*100) + '%';
  const finalBadge = document.getElementById('finalBadge');
  if(finalBadge) finalBadge.style.display = (doneCount === asamTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function asamGoTo(id){
  asamCurrentSection = id;
  document.querySelectorAll('#view-asam section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderASAMNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-asam').onclick = ()=>{
  if(confirm('Reset all ASAM module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-asam-progress');
    asamProgress = {};
    asamSaveProgress();
    ['whyBeats','specificityBeats','dim1Beats','dim2Beats','dim3Beats','dim4Beats','dim5Beats','dim6Beats','ratingBeats','criteriaBeats','assemblyBeats'].forEach(resetBeats);
  }
};

/* =====================================================
   ITP MODULE
   ===================================================== */
const itpCHAPTERS = [
  {title:'ITP Module', sections:[
    {id:'itpwhy', label:'Why this module'},
    {id:'itpanatomy', label:'The anatomy of a goal'},
    {id:'itpanatomyexample', label:'A goal, worked through'},
    {id:'itpfromfinding', label:'Turning a finding into a goal'},
    {id:'itpobjectives', label:'Writing measurable objectives'},
    {id:'itpinterventions', label:'Writing real interventions'},
    {id:'itpindividualized', label:'Making it hers, not a template'},
    {id:'itpgoals', label:'How many goals'},
    {id:'itpreviews', label:'Treatment plan reviews'},
    {id:'itpassembly', label:'Put it all together'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'itpcheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
    {id:'itpmistakes', label:'Common mistakes recap', trackProgress:false},
    {id:'itpfaq', label:'FAQ', trackProgress:false},
  ]},
];
const itpSECTIONS = itpCHAPTERS.flatMap(c => c.sections);
const itpTRACKED_SECTIONS = itpSECTIONS.filter(s => s.trackProgress !== false);

let itpProgress = {};
try{ itpProgress = JSON.parse(localStorage.getItem('doctrain-itp-progress') || '{}'); }catch(e){ itpProgress = {}; }

function itpSaveProgress(){
  localStorage.setItem('doctrain-itp-progress', JSON.stringify(itpProgress));
  renderITPNav();
}
function itpMarkComplete(id){
  itpProgress[id] = true;
  itpSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let itpCurrentSection = 'itpwhy';
function renderITPNav(){
  const navList = document.getElementById('navList-itp');
  navList.innerHTML = '';
  itpCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (itpCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>itpGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (itpProgress[s.id] ? ' done':'');
        check.textContent = itpProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = itpTRACKED_SECTIONS.filter(s=>itpProgress[s.id]).length;
  document.getElementById('progressLabel-itp').textContent = doneCount + ' of ' + itpTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-itp').style.width = (doneCount/itpTRACKED_SECTIONS.length*100) + '%';
  const itpFinalBadge = document.getElementById('itpFinalBadge');
  if(itpFinalBadge) itpFinalBadge.style.display = (doneCount === itpTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function itpGoTo(id){
  itpCurrentSection = id;
  document.querySelectorAll('#view-itp section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderITPNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-itp').onclick = ()=>{
  if(confirm('Reset all ITP module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-itp-progress');
    itpProgress = {};
    itpSaveProgress();
    ['itpWhyBeats','itpAnatomyBeats','itpAnatomyExampleBeats','itpFromFindingBeats','itpObjectivesBeats','itpInterventionsBeats','itpIndividualizedBeats','itpGoalsBeats','itpReviewsBeats','itpAssemblyBeats'].forEach(resetBeats);
  }
};

/* =====================================================
   INDIVIDUAL NOTES MODULE
   ===================================================== */
const noteCHAPTERS = [
  {title:'Individual Notes Module', sections:[
    {id:'notewhy', label:'Why this module'},
    {id:'noteanatomy', label:'The anatomy of a note'},
    {id:'notetypes', label:'Four session types'},
    {id:'notedescribe', label:'Writing the session description'},
    {id:'noteresponse', label:'Writing the response'},
    {id:'noterisk', label:'Risk & safety'},
    {id:'noteassembly', label:'Put it all together'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'notecheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
    {id:'notemistakes', label:'Common mistakes recap', trackProgress:false},
    {id:'notefaq', label:'FAQ', trackProgress:false},
  ]},
];
const noteSECTIONS = noteCHAPTERS.flatMap(c => c.sections);
const noteTRACKED_SECTIONS = noteSECTIONS.filter(s => s.trackProgress !== false);

let noteProgress = {};
try{ noteProgress = JSON.parse(localStorage.getItem('doctrain-note-progress') || '{}'); }catch(e){ noteProgress = {}; }

function noteSaveProgress(){
  localStorage.setItem('doctrain-note-progress', JSON.stringify(noteProgress));
  renderNoteNav();
}
function noteMarkComplete(id){
  noteProgress[id] = true;
  noteSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let noteCurrentSection = 'notewhy';
function renderNoteNav(){
  const navList = document.getElementById('navList-note');
  navList.innerHTML = '';
  noteCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (noteCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>noteGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (noteProgress[s.id] ? ' done':'');
        check.textContent = noteProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = noteTRACKED_SECTIONS.filter(s=>noteProgress[s.id]).length;
  document.getElementById('progressLabel-note').textContent = doneCount + ' of ' + noteTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-note').style.width = (doneCount/noteTRACKED_SECTIONS.length*100) + '%';
  const noteFinalBadge = document.getElementById('noteFinalBadge');
  if(noteFinalBadge) noteFinalBadge.style.display = (doneCount === noteTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function noteGoTo(id){
  noteCurrentSection = id;
  document.querySelectorAll('#view-note section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderNoteNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-note').onclick = ()=>{
  if(confirm('Reset all Individual Notes module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-note-progress');
    noteProgress = {};
    noteSaveProgress();
    ['noteWhyBeats','noteAnatomyBeats','noteTypesBeats','noteDescribeBeats','noteResponseBeats','noteRiskBeats','noteAssemblyBeats'].forEach(resetBeats);
  }
};

/* =====================================================
   CONCLUSION MODULE
   ===================================================== */
const conclusionCHAPTERS = [
  {title:'Case Walkthrough: Danielle', sections:[
    {id:'concl-arc', label:"Danielle's thread, start to finish"},
    {id:'concl-monday', label:'What changes now'},
  ]},
];
const conclusionSECTIONS = conclusionCHAPTERS.flatMap(c => c.sections);

let conclusionProgress = {};
try{ conclusionProgress = JSON.parse(localStorage.getItem('doctrain-conclusion-progress') || '{}'); }catch(e){ conclusionProgress = {}; }

function conclusionSaveProgress(){
  localStorage.setItem('doctrain-conclusion-progress', JSON.stringify(conclusionProgress));
  renderConclusionNav();
}
function conclusionMarkComplete(id){
  conclusionProgress[id] = true;
  conclusionSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let conclusionCurrentSection = 'concl-arc';
function renderConclusionNav(){
  const navList = document.getElementById('navList-conclusion');
  navList.innerHTML = '';
  conclusionCHAPTERS.forEach(chapter=>{
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (conclusionCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>conclGoTo(s.id);
      const check = document.createElement('span');
      check.className = 'nav-check' + (conclusionProgress[s.id] ? ' done':'');
      check.textContent = conclusionProgress[s.id] ? '✓' : '';
      li.appendChild(check);
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = conclusionSECTIONS.filter(s=>conclusionProgress[s.id]).length;
  document.getElementById('progressLabel-conclusion').textContent = doneCount + ' of ' + conclusionSECTIONS.length + ' complete';
  document.getElementById('progressFill-conclusion').style.width = (doneCount/conclusionSECTIONS.length*100) + '%';
  const conclusionFinalBadge = document.getElementById('conclusionFinalBadge');
  if(conclusionFinalBadge) conclusionFinalBadge.style.display = (doneCount === conclusionSECTIONS.length) ? 'inline-block' : 'none';
}

function conclGoTo(id){
  conclusionCurrentSection = id;
  document.querySelectorAll('#view-conclusion section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderConclusionNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-conclusion').onclick = ()=>{
  if(confirm('Reset your progress on the Danielle case walkthrough?')){
    localStorage.removeItem('doctrain-conclusion-progress');
    conclusionProgress = {};
    conclusionSaveProgress();
    ['conclArcBeats','conclMondayBeats'].forEach(resetBeats);
  }
};

/* ---- Specificity classify exercise ---- */
const CLASSIFY_ITEMS = [
  {text:"Client is doing well overall and engaging in treatment.", answer:'generic', explain:"No behavioral evidence, no date, could describe almost any client on almost any day."},
  {text:"Client left group twice this week (7/21/2025, 7/24/2025) when peers discussed relapse triggers, and declined to process why when approached individually.", answer:'specific', explain:"Dated, behavioral, observable — a reviewer can picture exactly what happened."},
  {text:"Client has good insight into their disease and is highly motivated to stay sober.", answer:'generic', explain:"This is the classic challenge-message pattern — unqualified positive framing reads as a reason to discharge, not continue."},
  {text:"Client stated she has 'no plan' for what she would do if she relapsed after discharge, when asked directly during individual session on 7/23/2025.", answer:'specific', explain:"Direct quote, dated, and answers the actual clinical question (relapse plan) rather than describing mood."},
  {text:"Client's family is supportive and provides a safe home environment.", answer:'generic', explain:"‘Safe’ and ‘supportive’ are conclusions, not evidence — what specifically makes it safe? A reviewer will read this as evidence for discharge."},
  {text:"Client's brother, who lives in the home client will return to, is currently in active use and has declined to leave during client's residency, per client report 7/20/2025.", answer:'specific', explain:"Specific person, specific fact, dated — gives a concrete reason the environment is not yet safe."},
];

function renderClassify(){
  const card = document.getElementById('classifyCard');
  if(!card) return;
  card.innerHTML = '';
  let answeredCount = 0;
  CLASSIFY_ITEMS.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.text}</div>
        <div class="classify-explain" id="explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">
        <button class="pill-btn" data-val="specific" data-idx="${idx}">Specific</button>
        <button class="pill-btn" data-val="generic" data-idx="${idx}">Generic</button>
      </div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = CLASSIFY_ITEMS[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const correct = btn.dataset.val === item.answer;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns.forEach(b=>{ if(b.dataset.val === item.answer) b.classList.add('chosen-correct'); });
      }
      document.getElementById(`explain-${idx}`).classList.add('show');
      answeredCount++;
      if(answeredCount === CLASSIFY_ITEMS.length){
        markComplete('specificity');
      }
    });
  });
}

/* ---- Dimension deep-dive reveal ---- */
/* ---- Why this matters ---- */
const WHY_BEATS = [
  `<p class="lede">Before anything about wording, ratings, or dimensions: what is an ASAM actually <em>for</em>? It has one job — identify the problem. Clearly enough that anyone reading it (a reviewer, a new counselor picking up the case, you in three weeks) understands exactly what's still wrong with this client and why they need to be here, at this level of care, right now.</p>
   <div class="callout"><strong>This is the whole reason any of this matters:</strong> if the ASAM doesn't make the problem obvious, nothing downstream can fix that. A vague ASAM isn't just a compliance risk — it means the actual clinical picture never got written down clearly enough for anyone to act on it. Every rule in this module (specific language, the six dimensions, the rating scale) exists only to serve that one purpose. Write it well, and you're protecting this client's ability to keep getting the care they actually need.</div>`,

  `<p class="lede">This module assumes you've already been through <span class="inline-link" onclick="openModule('view-bigpicture')" role="link" tabindex="0">The Golden Thread</span> — if you haven't, start there first. Here, we go deep on writing the ASAM link of that thread well.</p>
   <p style="font-size:13px; color:var(--ink-soft);">This module runs long — about 35–45 minutes across all six dimensions. It's fine to split it across a couple of sittings; your progress is saved section by section.</p>
   <p>None of what follows is about catching you doing something wrong. It's about giving you the tools to write down what you already know clinically, in a way that holds up — because the words in an ASAM narrative are the evidence a reviewer uses to decide whether continued residential care is medically necessary. Two clinicians can describe the same client and produce a note that gets approved — or one that gets denied.</p>`,

  `<div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Gets challenged</span>
       <p>Client continues to struggle with cravings. Client has some insight into their disease but needs more time to solidify recovery skills. Client is doing okay overall.</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Survives review</span>
       <p>Client reports cravings 4–5x/day, unprompted, occurring most acutely in unstructured evening hours. Client could not identify a coping skill when asked directly during session on 7/22/2025, relying instead on staff redirection. Without 24-hour structure, client's stated plan is to "go back to the same friends," which client identifies as their primary using environment.</p>
     </div>
   </div>
   <p class="hero-note">Same client. The left version is reassuring and vague — a reviewer reads it as "stable enough to step down." The right version is specific and behavioral — it gives the reviewer a reason this level of care is still needed <em>today</em>.</p>`,

  `<h2>The core problem reviewers are trained to look for</h2>
   <p>A payer reviewer's job is to find reasons to authorize a lower, cheaper level of care. Every sentence you write either gives them ammunition to do that, or takes it away. Reviewers are pattern-matching against two things:</p>
   <ul>
     <li><strong>Genericness</strong> — language that could describe any client, on any day, at any facility. If a sentence would still be true with the name swapped out, it does no work.</li>
     <li><strong>Positive framing without specificity</strong> — "good insight," "motivated," "supportive family" — these read as reasons to discharge, not reasons to continue. That's exactly why <a href="https://bretzfelder.com/docassist" target="_blank" rel="noopener">DocAssist</a> throws a challenge message when you select them: it's not second-guessing your clinical judgment, it's stopping you before that sentence gets used against the client.</li>
   </ul>
   <div class="callout"><strong>The skill this training builds:</strong> turning true clinical observations into specific, dated, behaviorally-anchored language — without inventing anything or overstating severity.</div>`,

  `<h3>What "individualized" actually means</h3>
   <p>It doesn't mean unique words. It means the sentence contains something that could only be true of <em>this</em> client, on <em>this</em> day: a number, a quote, a named trigger, a specific failed attempt, a time of day, a refusal, a behavior a staff member witnessed. Anything a reviewer can picture is evidence. Anything they have to take your word for is an opinion.</p>`,
];
const WHY_FINAL = `<button class="btn" onclick="markComplete('why'); asamGoTo('specificity')">Next: Spot the difference →</button>`;

/* ---- Specific vs generic ---- */
const SPECIFICITY_BEATS = [
  `<p class="lede">For each statement, decide whether it would survive payer review on its own, or whether a reviewer would read it as filler. Click your answer, then read why. Notice as you go: none of the "specific" examples below use fancy clinical language — they just say exactly what happened.</p>`,
  `<div class="card" id="classifyCard"><!-- rows injected by JS --></div>`,
];
const SPECIFICITY_FINAL = `<button class="btn" onclick="asamGoTo('dim1')">Next: Dimension 1 deep dive →</button>`;

/* ---- Dimension 1 ---- */
const DIM1_BEATS = [
  `<p class="lede">This dimension gets underused once acute withdrawal has passed. Clinicians often write "N/A" or "denies withdrawal symptoms" and move on — but a reviewer isn't just asking whether the client is currently withdrawing. They're asking whether the risk of intoxication or withdrawal has actually resolved enough that this level of care is no longer needed for that reason specifically.</p>
   <p style="font-size:13px; color:var(--ink-soft);">One heads-up before you start: every dimension in this module — this one included — uses the same client, Danielle. That's deliberate. You'll see one real, consistent case get more complete each time, rather than six unrelated examples to keep straight.</p>`,
  `<h3>What a reviewer is actually asking</h3>
   <p>Not "is anything happening right now?" but "how far along is this client in a process that used to be dangerous, and is anyone still watching it?" A short abstinence window compared to a long history of use, residual physical symptoms, or anything nursing is still monitoring — all of that is real information. Writing "no withdrawal symptoms" and stopping there throws it away.</p>
   <div class="callout">This dimension often feels like the easiest one to rush past — which is exactly why it's worth slowing down. You're not being tested on medical knowledge here, just on documenting what's actually still true, even when the acute part is over.</div>`,
  `<h3>What to look for</h3>
   <p>Things worth checking for and naming in this dimension, if present:</p>
   <ul class="checklist">
     <li>What nursing's vital sign checks actually show — stable, or still fluctuating</li>
     <li>Residual physical symptoms: sleep disturbance, appetite changes, fatigue, lingering cravings tied to the withdrawal timeline</li>
     <li>Any PRN (as-needed) medication still being used for withdrawal-related symptoms</li>
     <li>The specific gap between length of use and length of abstinence — the two numbers that make this dimension real, not generic</li>
     <li>Anything suggesting the client is minimizing or unaware of symptoms nursing is still tracking</li>
   </ul>`,
  `<h3>Try it: write the Dimension 1 narrative</h3>
   <div class="scenario-box">
     <div class="who">Client: Danielle, <span class="term" onclick="this.classList.toggle('term-open')">3.5 Residential<span class="term-def">ASAM Level 3.5: Clinically Managed High-Intensity Residential Services. A structured, live-in level of care for adults needing 24-hour support, without the round-the-clock medical/nursing monitoring that Level 3.7WM (medically monitored withdrawal management) would require.</span></span>, Continued Stay — Week 3</div>
     Danielle completed medical withdrawal management prior to admission. Nursing checks 7/20/2025–7/24/2025 show stable vital signs. She denies nausea, tremors, or other acute withdrawal symptoms. She reports intermittent trouble falling asleep and low energy in the evenings, which she attributes to "still adjusting." She used heroin daily for approximately two years prior to admission and has now been abstinent 18 days.
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you write, work through these in order:</div>
     <ol>
       <li>What's actually resolved? (What do the nursing checks show?)</li>
       <li>What's still lingering, even though it's not "acute" anymore? (Sleep, energy, anything else she mentioned)</li>
       <li>What's the gap between how long she used and how long she's been abstinent — and why does that gap matter?</li>
     </ol>
   </div>
   <textarea id="dim1Answer" placeholder="Write your Dimension 1 narrative here..." oninput="document.getElementById('dim1RevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="dim1RevealBtn" disabled onclick="revealModel('dim1')">Reveal model answer</button>
   </div>
   <div class="reveal" id="dim1Reveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Client completed medical withdrawal management prior to residential admission and has remained medically stable throughout this reporting period, with vital signs within normal limits per nursing checks 7/20/2025–7/24/2025 and no reported nausea, tremors, or other acute withdrawal symptoms. Client continues to report intermittent sleep disturbance and evening low energy, which she attributes to "still adjusting" — mild residual symptoms consistent with early post-acute withdrawal following approximately two years of daily heroin use, currently abstinent 18 days. These symptoms do not currently require medical intervention but are being monitored, given the significant gap between her length of use and her length of abstinence.</div>
     <ul class="checklist">
       <li>States plainly what's resolved (acute withdrawal) instead of leaving the dimension blank</li>
       <li>Still documents the residual symptoms instead of writing "N/A"</li>
       <li>Uses the specific numbers — two years of use against 18 days of abstinence — to justify continued monitoring</li>
       <li>Doesn't confuse "medically stable" with "no ongoing risk"</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="dim1CheckCard"></div>
   </div>`,
];
const DIM1_FINAL = `<button class="btn" onclick="asamGoTo('dim2')">Next: Dimension 2 deep dive →</button>`;

/* ---- Dimension 2 ---- */
const DIM2_BEATS = [
  `<p class="lede">This isn't a list of every physical complaint a client has. It's asking one specific question: does a physical health condition change what this client needs from treatment, or raise their relapse risk, in a way that matters right now?</p>`,
  `<h3>What a reviewer is actually asking</h3>
   <p>A chronic condition that has nothing to do with treatment doesn't need much space here. But a condition that's tangled up with the substance use — chronic pain that was previously treated with the same drug the client is now in treatment for, for example — is not background information. It's an active part of the clinical picture, and it belongs in this dimension in exactly those terms.</p>`,
  `<div class="callout">You don't need a medical degree to write this well. You just need to report what the client told you and what you observed, plainly, and let your clinical judgment connect it to relapse risk — which is exactly what this dimension is asking you to do.</div>`,
  `<h3>What to look for</h3>
   <p>Things worth checking for and naming in this dimension, if present:</p>
   <ul class="checklist">
     <li>Chronic pain, especially pain previously treated with the same substance the client is now in treatment for</li>
     <li>Any medical condition that requires medication that could interact with recovery (or that a client could misuse)</li>
     <li>Pregnancy, infectious disease status, or other conditions that need coordination with outside providers</li>
     <li>Anything the client connects, in their own words, to cravings or a desire to use</li>
     <li>Pending referrals or appointments tied to a physical condition, and whether they're actually being followed up on</li>
   </ul>`,
  `<h3>Try it: write the Dimension 2 narrative</h3>
   <div class="scenario-box">
     <div class="who">Client: Danielle, 3.5 Residential, Continued Stay — Week 3</div>
     Danielle has chronic lower back pain from a car accident two years ago. She was previously prescribed opioid pain medication for this injury, which she reports contributed to her opioid use disorder. She is not currently prescribed any opioid medication. She rates her pain as 5–6 out of 10 most days, and a physical therapy referral is pending. She has not raised this pain in group, but mentioned to her individual counselor this week that "some days it's hard not to think about how much easier the pills made it."
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you write, work through these in order:</div>
     <ol>
       <li>What's the physical condition, specifically, and where does it come from?</li>
       <li>What's her own language connecting it to cravings or use?</li>
       <li>What's being done about it right now (or not), and why does that matter for relapse risk?</li>
     </ol>
   </div>
   <textarea id="dim2Answer" placeholder="Write your Dimension 2 narrative here..." oninput="document.getElementById('dim2RevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="dim2RevealBtn" disabled onclick="revealModel('dim2')">Reveal model answer</button>
   </div>
   <div class="reveal" id="dim2Reveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Client has chronic lower back pain secondary to a motor vehicle accident approximately two years ago, previously managed with prescribed opioid medication that client identifies as a contributing factor to her opioid use disorder. Client is not currently prescribed opioid pain medication and rates her pain as 5–6/10 on most days; a physical therapy referral is pending. During individual session this week, client disclosed unprompted that "some days it's hard not to think about how much easier the pills made it," directly connecting her untreated physical pain to cravings for her drug of choice. This biomedical condition is not incidental to her recovery — it is an active, specific relapse risk that requires continued coordination between pain management and substance use treatment before step-down.</div>
     <ul class="checklist">
       <li>Names the specific condition and its origin instead of a vague "chronic pain" label</li>
       <li>Connects the condition directly to relapse risk, using the client's own words as evidence</li>
       <li>Documents current status (no opioids, PT referral pending) instead of leaving it open-ended</li>
       <li>Frames it as something needing continued coordination, not just background history</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="dim2CheckCard"></div>
   </div>`,
];
const DIM2_FINAL = `<button class="btn" onclick="asamGoTo('dim3')">Next: Dimension 3 deep dive →</button>`;

/* ---- Dimension 3 ---- */
const DIM3_BEATS = [
  `<p class="lede">This is the dimension most likely to get underdocumented because clinicians worry they're not qualified to say something clinical enough about it. You don't need to diagnose anything here. You need to report what you directly observed — plainly, in your own words — and let your clinical judgment do the rest.</p>`,
  `<h3>What a reviewer is actually asking</h3>
   <p>Not "does this client have a diagnosed mental health condition?" Behavioral and emotional symptoms are real and relevant whether or not they've ever been formally diagnosed. Irritability, avoidance, a tearful reaction to a specific topic — these are observable facts. Writing them down is well within your role. Deciding what they mean clinically is exactly the judgment you're licensed to provide.</p>`,
  `<div class="callout">If you catch yourself writing "no concerns" here because nothing has been formally diagnosed, stop and ask: what did I actually see or hear this week? That's the dimension.</div>`,
  `<h3>What to look for</h3>
   <p>Things worth checking for and naming in this dimension, if present:</p>
   <ul class="checklist">
     <li>Mood shifts, irritability, or tearfulness tied to a specific topic or situation — not a general "mood"</li>
     <li>Avoidance: changing the subject, leaving group, declining to engage with a particular topic</li>
     <li>Changes in sleep, appetite, or concentration</li>
     <li>Trauma history that hasn't yet been directly addressed in treatment</li>
     <li>A gap between how the client presents in group versus individual session</li>
   </ul>`,
  `<h3>Try it: write the Dimension 3 narrative</h3>
   <div class="scenario-box">
     <div class="who">Client: Danielle, 3.5 Residential, Continued Stay — Week 3</div>
     Danielle has a self-reported history of anxiety, though she has no formal diagnosis or current psychiatric medication. She has become visibly irritable with peers twice this week during group discussions unrelated to her own material (7/21/2025, 7/24/2025). In individual session 7/23/2025, when her counselor asked about the car accident connected to her back pain, client became tearful, stated "I don't really talk about that," and asked to change the subject. She has not engaged in any trauma-focused treatment.
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you write, work through these in order:</div>
     <ol>
       <li>What specific behaviors did you observe, and when? (Dates, not "sometimes")</li>
       <li>What did she actually say, in her own words?</li>
       <li>Why does this matter for her continued treatment need — what's still unaddressed?</li>
     </ol>
   </div>
   <textarea id="dim3Answer" placeholder="Write your Dimension 3 narrative here..." oninput="document.getElementById('dim3RevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="dim3RevealBtn" disabled onclick="revealModel('dim3')">Reveal model answer</button>
   </div>
   <div class="reveal" id="dim3Reveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Client reports a history of anxiety without formal diagnosis or current psychiatric medication. This week, client displayed increased irritability toward peers on two occasions during group (7/21/2025, 7/24/2025) in discussions unrelated to her own treatment material. In individual session 7/23/2025, when asked about the motor vehicle accident associated with her chronic pain, client became tearful, stated "I don't really talk about that," and requested to change the subject. Client has not engaged in trauma-focused treatment. These observed emotional and behavioral symptoms — irritability and an avoided trauma response — have not yet been directly addressed in treatment and represent a continued area of clinical need that could affect her overall stability and relapse risk if left unaddressed.</div>
     <ul class="checklist">
       <li>Documents observed behavior (irritability, tearfulness, avoidance) instead of a self-assigned diagnosis</li>
       <li>Uses specific, dated incidents rather than "sometimes seems anxious"</li>
       <li>Reports the client's own words without over-interpreting them</li>
       <li>Connects the unaddressed symptoms to treatment need without requiring a diagnosis to justify it</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="dim3CheckCard"></div>
   </div>`,

  `<div class="callout" style="text-align:center;"><strong>Halfway there.</strong> Three dimensions down, three to go. Every one you've just done follows the same shape on purpose — spot the reviewer's real question, write it specifically, check it against Danielle's evidence. Dimensions 4–6 will feel more familiar because of that, not harder.</div>`,
];
const DIM3_FINAL = `<button class="btn" onclick="asamGoTo('dim4')">Next: Dimension 4 deep dive →</button>`;

const DIM_CHECK_ITEMS = {
  dim1: [{
    q: "Danielle currently has no acute withdrawal symptoms. Why does Dimension 1 still need more than 'client denies withdrawal symptoms'?",
    options: [
      "Because reviewers require a minimum word count for every dimension",
      "Because the gap between how long she used and how long she's been abstinent is itself clinically relevant information a reviewer needs to see",
      "Because Dimension 1 is always the most severe dimension in early recovery",
    ],
    correctIdx: 1,
    explain: "No acute symptoms doesn't mean no relevant information. A short abstinence window against a long use history is exactly the kind of specific, real detail this dimension is asking for."
  }],
  dim2: [{
    q: "Danielle's back pain doesn't currently require an opioid prescription. Why does it still matter for Dimension 2?",
    options: [
      "It doesn't — pain without an active opioid prescription isn't clinically relevant",
      "Because she directly linked her pain to cravings for her drug of choice, which makes it an active relapse risk, not just a background health issue",
      "Because Dimension 2 must always mention every physical complaint regardless of relevance",
    ],
    correctIdx: 1,
    explain: "The condition itself isn't the point — what matters is that she connected it, in her own words, to wanting to use again. That link is what makes it belong in this dimension."
  }],
  dim3: [{
    q: "The counselor isn't a psychiatrist and hasn't diagnosed Danielle with anything. Does that mean Dimension 3 should just say 'no diagnosis, no concerns'?",
    options: [
      "Yes — only formally diagnosed conditions belong in Dimension 3",
      "No — documenting what you directly observed (irritability, tearfulness, avoidance) is exactly what's being asked for, and doesn't require a diagnosis",
      "No, but only if a psychiatrist has been consulted first",
    ],
    correctIdx: 1,
    explain: "You're not being asked to diagnose — you're being asked to report what you saw and heard, and use your clinical judgment to connect it to treatment need. That's within your role every time."
  }],
  dim4: [{
    q: "What actually makes the Dimension 4 model answer strong?",
    options: [
      "It uses more clinical terminology than a counselor would normally say out loud",
      "It shows the specific gap between what she said and what she did, with dates",
      "It's longer than a typical narrative",
    ],
    correctIdx: 1,
    explain: "Length and clinical-sounding words aren't what make it work. It works because it names a real, dated gap between her stated intent and her actual follow-through — something a reviewer can picture."
  }],
  dim5: [{
    q: "Why does this Dimension 5 answer focus on what happens when structure is removed, instead of how well she's doing in the program?",
    options: [
      "Because doing well in the program isn't worth mentioning at all",
      "Because relapse potential is about what happens without this level of care, not with it — that's the actual clinical question",
      "Because it needs to sound more serious than Dimension 4",
    ],
    correctIdx: 1,
    explain: "Engaging well here and being able to manage without this level of care are two different questions. Dimension 5 is asking the second one. Judgment means recognizing which question you're actually answering."
  }],
  dim6: [{
    q: "The mother in this scenario clearly cares about her daughter. Why doesn't the narrative say that made the environment safer?",
    options: [
      "Because the goal is to make the family look bad",
      "Because caring and providing structural boundaries against use are two different things — the narrative reports what's actually true about each",
      "Because DocAssist requires negative framing for Dimension 6",
    ],
    correctIdx: 1,
    explain: "This is judgment, not cynicism: you can document that someone loves their daughter and, separately and just as truthfully, that their home doesn't yet have the structure to prevent use. Neither fact cancels the other out."
  }],
};

function revealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
  buildQuiz(id + 'CheckCard', DIM_CHECK_ITEMS[id], null);
  markComplete(id);
}

/* ---- Dimension 4 ---- */
const DIM4_BEATS = [
  `<p class="lede">This is the dimension most likely to accidentally argue <em>against</em> your client. "Client is motivated" is true almost every week, for almost every client — which is exactly why it carries no weight with a reviewer.</p>`,
  `<h3>What a reviewer is actually asking</h3>
   <p>Not "is this client trying?" but "does this client's current stage of change require the structure of this level of care to avoid relapse, or could a lower level of care meet the same need?" Ambivalence, minimization, and inconsistency between stated intent and observed behavior are what justify continued stay — not the presence or absence of motivation as a personality trait.</p>`,
  `<div class="callout"><strong>Why "good insight and motivation" triggers a challenge message in DocAssist:</strong> if true and unqualified, it's a reason to discharge. The fix isn't to avoid the topic — it's to describe the <em>gap</em> between insight and action.</div>`,
  `<h3>What to look for</h3>
   <p>Things worth checking for and naming in this dimension, if present:</p>
   <ul class="checklist">
     <li>What the client says versus what they actually follow through on — missed assignments, no-shows, agreed-to steps not taken</li>
     <li>Minimizing language: "just a habit," "not like the others here," comparisons that downplay severity</li>
     <li>Compliance with structure (attendance, being polite) without any sign of internalizing the risk</li>
     <li>Specific commitments made in session and whether they were actually kept</li>
     <li>Any real, observed shift in stage of change — not just a client saying the "right" thing</li>
   </ul>`,
  `<h3>Try it: write the Dimension 4 narrative</h3>
   <div class="scenario-box">
     <div class="who">Client: Danielle, 3.5 Residential, Continued Stay — Week 3</div>
     Danielle tells her counselor she "knows she needs to stay sober for her kids." In group, she has said twice this week that she's "not like the other people here" and doesn't think she has a "real problem" with opioids — she calls it "a bad habit." She agreed to complete a relapse prevention worksheet on Tuesday and did not turn it in. When reminded Thursday, she said she'd "get to it." She has attended all groups and is polite with staff.
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you write, work through these in order:</div>
     <ol>
       <li>What does she say about her recovery, in her own words?</li>
       <li>What did she actually do (or not do) that doesn't match that?</li>
       <li>Why does that gap mean she still needs this level of care, specifically?</li>
     </ol>
   </div>
   <textarea id="dim4Answer" placeholder="Write your Dimension 4 narrative here..." oninput="document.getElementById('dim4RevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="dim4RevealBtn" disabled onclick="revealModel('dim4')">Reveal model answer</button>
   </div>
   <div class="reveal" id="dim4Reveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Client verbalizes intent to maintain sobriety, citing her children as motivation, but minimizes the severity of her opioid use, referring to it as "a bad habit" rather than a substance use disorder, and distinguishes herself from peers in group ("not like the other people here") on two occasions this week. This stated insight is inconsistent with follow-through: client did not complete an assigned relapse prevention worksheet due 7/22/2025, and when reminded 7/24/2025 responded she would "get to it," without a specific plan. Client's compliance with the structure of the program (group attendance, cooperative affect) is not accompanied by internalization of relapse risk, indicating continued need for the structure and accountability of this level of care to address ambivalence before a lower level of care is appropriate.</div>
     <ul class="checklist">
       <li>Uses the client's own words as evidence, not the counselor's interpretation stated as fact</li>
       <li>Names the specific gap: stated intent vs. missed worksheet vs. minimizing language</li>
       <li>Includes dates so it reads as this week, not "generally"</li>
       <li>Explicitly ties the gap back to why this LOC is still needed — doesn't just describe the client, argues the case</li>
       <li>Doesn't overstate — it doesn't call her "resistant" or "non-compliant," which isn't supported by the facts</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="dim4CheckCard"></div>
   </div>`,
];
const DIM4_FINAL = `<button class="btn" onclick="asamGoTo('dim5')">Next: Dimension 5 deep dive →</button>`;

/* ---- Dimension 5 ---- */
const DIM5_BEATS = [
  `<p class="lede">This is where most Continued Stay ASAMs win or lose. Progress in treatment and continued relapse potential are not opposites — a client can be doing well in the program and still have almost no ability to resist use outside it. Documentation has to hold both at once.</p>`,
  `<h3>The mistake this dimension invites</h3>
   <p>Because clients often are engaging well by week 2–3, counselors describe engagement in Dimension 5 instead of relapse risk. Engagement belongs in Dimension 4. Dimension 5 needs evidence about what happens when structure is removed: cravings, triggers, coping skill application (or failure to apply one), and the client's own account of what they'd do differently if given unstructured time today.</p>
   <div class="callout">This is usually the hardest dimension to write, precisely because your client really is doing well in front of you. That's not a contradiction you need to resolve — it's exactly what this dimension is asking you to document.</div>`,
  `<h3>What to look for</h3>
   <p>Things worth checking for and naming in this dimension, if present:</p>
   <ul class="checklist">
     <li>What the client says they'd do in an unstructured moment — or whether they can answer that at all</li>
     <li>Specific people or places that are named relapse triggers or contacts</li>
     <li>Coping skills the client can name in session versus ones they've actually demonstrated outside the milieu</li>
     <li>What's happened during any prior pass, visit, or discharge, if there's history to draw on</li>
     <li>How confident the client sounds — in their own words — about handling a craving alone</li>
   </ul>`,
  `<h3>Try it: write the Dimension 5 narrative</h3>
   <div class="scenario-box">
     <div class="who">Client: Danielle, 3.5 Residential, Continued Stay — Week 3</div>
     Danielle reports cravings most evenings, which she rates as "manageable" with peer support in the milieu. When her counselor asked directly what she would do if she had a craving alone in her apartment, she paused and said she "hadn't thought about it." She identifies her ex-boyfriend, who still uses, as someone she'd likely reach out to "just to talk" if she felt lonely. She has not yet identified a specific person she could call instead.
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you write, work through these in order:</div>
     <ol>
       <li>How is she managing cravings right now, with the structure of this level of care?</li>
       <li>What happens (or what does she say would happen) without that structure?</li>
       <li>What's the specific relapse pathway she's named, and what's missing as an alternative?</li>
     </ol>
   </div>
   <textarea id="dim5Answer" placeholder="Write your Dimension 5 narrative here..." oninput="document.getElementById('dim5RevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="dim5RevealBtn" disabled onclick="revealModel('dim5')">Reveal model answer</button>
   </div>
   <div class="reveal" id="dim5Reveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Client reports nightly cravings, currently managed only through peer support available in the residential milieu. When asked directly to identify a coping response to a craving occurring without staff or peers present, client was unable to name one, stating she "hadn't thought about it." Client identifies her ex-boyfriend, an active user, as a likely contact "just to talk" during periods of loneliness, and has not yet identified an alternative support to call in his place. Client's current craving management is structurally dependent on this level of care and has not yet transferred to an independent coping plan, indicating continued relapse risk if stepped down at this time.</div>
     <ul class="checklist">
       <li>Separates "managing well here" from "could manage without here" — the actual clinical question</li>
       <li>Uses the client's own gap ("hadn't thought about it") instead of the counselor concluding "poor coping skills"</li>
       <li>Names the specific relapse pathway (the ex-boyfriend) without editorializing about him</li>
       <li>Ends by connecting directly to level-of-care need, not just describing the client</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="dim5CheckCard"></div>
   </div>`,
];
const DIM5_FINAL = `<button class="btn" onclick="asamGoTo('dim6')">Next: Dimension 6 deep dive →</button>`;

/* ---- Dimension 6 ---- */
const DIM6_BEATS = [
  `<p class="lede">This dimension has the same trap as Dimension 4: a "supportive" environment sounds like good news, and to a reviewer, good news at home reads as "doesn't need residential." The narrative has to describe the environment specifically enough to show why it isn't yet safe to return to — even when the people in it care about the client.</p>`,
  `<h3>What actually carries weight here</h3>
   <p>Not whether family "loves" the client — whether the physical environment contains active use, whether household members can or will enforce boundaries, whether the client has anywhere to go that isn't the environment tied to their using pattern, and what specifically would happen in the first 48 hours if discharged today.</p>
   <div class="callout">This one can feel uncomfortable, like you're being asked to say something negative about someone's family. You're not — you're describing structural facts about the environment, not judging the people in it.</div>`,
  `<h3>What to look for</h3>
   <p>Things worth checking for and naming in this dimension, if present:</p>
   <ul class="checklist">
     <li>Who the client would actually return to, and that person's stated stance on use in the home</li>
     <li>Physical proximity to known using contacts or triggering locations</li>
     <li>Whether the household will actually enforce a no-use policy — not whether they say they support the client</li>
     <li>Sober supports (or the lack of them) near the discharge address</li>
     <li>The client's own stated preference versus what the environment can actually provide — these are two different facts</li>
   </ul>`,
  `<h3>Try it: write the Dimension 6 narrative</h3>
   <div class="scenario-box">
     <div class="who">Client: Danielle, 3.5 Residential, Continued Stay — Week 3</div>
     Danielle's mother, who she would return to, is supportive and attends family sessions, but has said she "doesn't want to police" Danielle and will not agree to a no-use household policy. Danielle's ex-boyfriend lives two blocks away. Danielle has no current housing alternative and no sober support identified within walking distance of her mother's home. She states she "loves her mom's house" and wants to go back there.
   </div>
   <div class="scaffold-box">
     <div class="scaffold-label">Before you write, work through these in order:</div>
     <ol>
       <li>Where would she actually go, and what's true about that specific place?</li>
       <li>What structural boundaries against use exist there — or don't?</li>
       <li>How does what she wants compare to what the environment can actually support?</li>
     </ol>
   </div>
   <textarea id="dim6Answer" placeholder="Write your Dimension 6 narrative here..." oninput="document.getElementById('dim6RevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="dim6RevealBtn" disabled onclick="revealModel('dim6')">Reveal model answer</button>
   </div>
   <div class="reveal" id="dim6Reveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Client's identified discharge residence is her mother's home. While supportive of client emotionally and consistently present for family sessions, mother has declined to enforce a no-use household policy, stating she "doesn't want to police" client. Client's ex-boyfriend, an active user and identified relapse contact, resides two blocks from this address. Client has no alternative housing option and has not identified sober support within proximity to this residence. Client's stated preference to return to this environment ("loves her mom's house") does not reflect an assessment of its recovery risk. Current environment does not provide the structural barriers to use necessary to support step-down at this time.</div>
     <ul class="checklist">
       <li>Describes the environment's structural features (proximity, enforceable boundaries), not just family sentiment</li>
       <li>Reports mother's stance as fact, without characterizing her as uncaring</li>
       <li>Distinguishes what the client wants from what the environment supports — a key distinction reviewers look for</li>
       <li>Explicit "why this LOC" conclusion at the end</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="dim6CheckCard"></div>
   </div>`,
];
const DIM6_FINAL = `<button class="btn" onclick="asamGoTo('rating')">Next: Risk rating calibration →</button>`;

/* ---- Risk rating calibration ---- */
const RATING_BEATS = [
  `<p class="lede">The 0–4 rating isn't a summary of how the client is doing overall — it's a measure of acuity in that dimension specifically. A client can be a 3 on Dimension 5 while being a 1 on Dimension 4 in the same week.</p>
   <div class="callout">DocAssist will auto-suggest a rating based on the inputs you select, and tag it "Auto-suggested." That's a starting point, not a verdict — you should always be able to defend whatever number ends up in Remarkable, whether it's the suggestion or your own adjustment.</div>
   <div class="card-label">Rating scale reference</div>
   <ul class="checklist" style="margin-top:4px;">
     <li><strong>0</strong> — No signs or symptoms in this dimension</li>
     <li><strong>1</strong> — Mild; unlikely to interfere with treatment</li>
     <li><strong>2</strong> — Moderate; requires monitoring, some interference likely</li>
     <li><strong>3</strong> — Significant impairment; requires active intervention at this LOC</li>
     <li><strong>4</strong> — Severe/imminent; requires the highest available structure</li>
   </ul>`,
  `<h3>Five examples, across the full scale</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">Different clients, different dimensions, different weeks. Read each one and pick the rating you'd assign before checking.</p>
   <div id="ratingExamples"></div>`,
];
const RATING_FINAL = `<button class="btn" onclick="asamGoTo('criteria')">Next: Criteria checklist practice →</button>`;

/* ---- Criteria checklist ---- */
const CRITERIA_BEATS = [
  `<p class="lede">The <span class="term" onclick="this.classList.toggle('term-open')">criteria checklist<span class="term-def">The specific lettered clinical criteria (a, b, c...) tied to each dimension in Ohio's ASAM framework. Checking one means you can point to exact language in your narrative that supports it — not just a general impression.</span></span> in DocAssist isn't decoration — it's what you'll click against in Remarkable while the narrative is open next to it. This only works if you can read your own narrative and identify which specific criteria it supports. Read the Dimension 5 model answer below, then check every criterion it actually provides evidence for.</p>
   <div class="scenario-box">
     <div class="who">Reference: Dimension 5 model answer</div>
     Client reports nightly cravings, currently managed only through peer support available in the residential milieu... client was unable to name one coping response... identifies her ex-boyfriend, an active user, as a likely contact... has not yet identified an alternative support... craving management is structurally dependent on this level of care.
   </div>
   <div class="criteria-grid" id="criteriaGrid"><!-- injected --></div>
   <button class="btn" onclick="checkCriteria()">Check my answer</button>
   <div class="reveal" id="criteriaReveal">
     <p style="font-size:13.5px; color:var(--ink-soft);">Correct answers are highlighted green. Anything you checked that wasn't supported is highlighted red. Anything you missed is highlighted amber.</p>
   </div>`,
  `<h2>Pulling it together</h2>
   <p class="lede">Five last questions, mixing everything from this module so far. If you get one wrong, that's exactly what this space is for — read the explanation and move on.</p>
   <div class="quiz-card" id="asamFinalQuizCard"></div>`,
];
const CRITERIA_FINAL = `<button class="btn" onclick="asamGoTo('assembly')">Next: Put it all together →</button>`;

/* ---- Full assembly ---- */
const ASSEMBLY_BEATS = [
  `<p class="lede">This is what an actual Continued Stay ASAM review looks like: not one dimension at a time, but the whole picture, rated dimension by dimension, then argued as a whole. Everything below is Danielle's full case — the same client from every section of this module — pulled into one place.</p>
   <div class="scenario-box">
     <div class="who">Client: Danielle, 3.5 Residential, Continued Stay — Week 3, full picture</div>
     <p style="margin:0 0 10px;"><strong>Dimension 1:</strong> Medically stable since completing withdrawal management prior to admission; 18 days abstinent from heroin after roughly two years of daily use, with mild residual sleep disturbance and low energy.</p>
     <p style="margin:0 0 10px;"><strong>Dimension 2:</strong> Chronic lower back pain from a car accident, previously treated with opioids that contributed to her opioid use disorder; not currently prescribed opioids, but has directly linked her pain to cravings.</p>
     <p style="margin:0 0 10px;"><strong>Dimension 3:</strong> Self-reported anxiety with no formal diagnosis; increased irritability with peers twice this week, and a tearful, avoidant reaction when asked about the accident connected to her pain.</p>
     <p style="margin:0 0 10px;"><strong>Dimension 4:</strong> States she "knows she needs to stay sober for her kids" but minimizes her opioid use as "a bad habit" and did not complete an assigned relapse-prevention worksheet.</p>
     <p style="margin:0 0 10px;"><strong>Dimension 5:</strong> Reports nightly cravings with no independent coping plan, and identifies her ex-boyfriend — an active user living two blocks from her planned discharge residence — as a likely contact if lonely.</p>
     <p style="margin:0;"><strong>Dimension 6:</strong> Her mother, the planned discharge resource, is emotionally supportive but has declined to enforce a no-use household policy.</p>
   </div>`,

  `<h3>Rate each dimension</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">Use your judgment first — don't just try to remember what you rated in earlier sections. Click a number for each dimension below.</p>
   <div id="assemblyRatings"></div>`,

  `<h3>Now, in your own words</h3>
   <p class="lede">In two or three plain-language sentences — no clinical vocabulary required — what's the strongest reason this client still needs residential treatment right now?</p>
   <textarea id="assemblySynthesis" placeholder="Write your synthesis here..." oninput="document.getElementById('assemblySynthesisRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="assemblySynthesisRevealBtn" disabled onclick="document.getElementById('assemblySynthesisReveal').classList.add('show')">Reveal a model synthesis</button>
   </div>
   <div class="reveal" id="assemblySynthesisReveal">
     <div class="card-label">One reasonable synthesis</div>
     <div class="model-answer">She's saying the right things about wanting to stay sober, but the things underneath that — the pain she hasn't dealt with, the trauma she avoids talking about, the nightly cravings, and a home that won't have any real boundaries — haven't actually changed yet. If she left today, nothing structural would stop her from calling the one person two blocks from her mom's house.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Notice this uses almost no clinical language at all. It's true, it's specific, and it's exactly the kind of sentence your own clinical judgment is capable of producing — the six dimension narratives above just break it into its parts.</p>
   </div>`,

  `<div class="callout"><strong>This is the whole point of the training:</strong> six dimensions, one document, one clinician's judgment about one real person — expressed in plain language, backed by specifics, ready to become the first link in the next ITP and the next Individual Note.</div>
   <span class="badge-done" id="finalBadge" style="display:none;">🎉 You've completed the ASAM module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="asamGoTo('cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span>, <span class="inline-link" onclick="asamGoTo('mistakes')" role="link" tabindex="0">common mistakes recap</span>, and <span class="inline-link" onclick="asamGoTo('faq')" role="link" tabindex="0">FAQ</span> are built to be reopened anytime you're actually writing an ASAM — not just read once during training.
   </div>
   <div class="callout" style="margin-top:16px;">
     <strong>Where this connects:</strong> deciding <em>which</em> level of care a client needs — and justifying it, domain by domain — is its own skill. The <span class="inline-link" onclick="openModule('view-loc')" role="link" tabindex="0">Levels of Care module</span> covers it, and feeds directly into narratives like the ones you just wrote here.
   </div>
   <div class="callout" style="margin-top:16px;">
     <strong>Coming next:</strong> the ITP module — turning everything you just practiced here into individualized goals and objectives.
   </div>`,
];
const ASSEMBLY_FINAL = `<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
  <button class="btn" onclick="openModule('view-itp')">Next: Start ITP Module →</button>
  <button class="btn secondary" onclick="openModule('view-loc')">Go to: Levels of Care Module →</button>
  <button class="btn secondary" onclick="goHome()">← Back to Clinical Training home</button>
</div>`;

/* ---- Cumulative "pulling it together" check ---- */
const ASAM_FINAL_QUIZ_ITEMS = [
  {
    q: "A counselor writes a Dimension 5 narrative in plain, everyday language with no clinical terms, but it includes specific dates, quotes, and a clear risk. Does it need clinical vocabulary added before it's ready?",
    options: ["Yes, reviewers expect clinical terminology", "No — specific and true beats clinical-sounding and vague, every time"],
    correctIdx: 1,
    explain: "Plain language that's accurate and specific does the job. Chasing the \"right\" clinical word is not what makes documentation strong."
  },
  {
    q: "A counselor isn't 100% sure whether a client's presentation is a 2 or a 3 on a dimension. What should they do?",
    options: [
      "Leave the rating blank until they're certain",
      "Use their clinical judgment to reach a defensible rating based on what they observed, and document why",
      "Always default to the higher number to be safe",
    ],
    correctIdx: 1,
    explain: "You're licensed to judge, not to already know. Weigh what you saw against your training and reach a defensible conclusion — that professional judgment is the actual content being documented."
  },
  {
    q: "Why does 'client has good insight and is highly motivated' trigger a challenge message instead of being treated as good news?",
    options: [
      "Because DocAssist assumes clients are lying about motivation",
      "Because unqualified, it reads as a reason to discharge rather than a reason to continue care",
      "Because motivation is never true for clients in residential treatment",
    ],
    correctIdx: 1,
    explain: "It's not that motivation isn't real — it's that stating it without the gap between insight and behavior hands a reviewer a reason to step the client down."
  },
  {
    q: "Which of these would a reviewer treat as evidence, and which as an opinion they have to take your word for?",
    options: [
      "\"Client seems to be struggling\" is evidence; \"client missed 3 of 4 groups this week\" is opinion",
      "\"Client missed 3 of 4 groups this week\" is evidence; \"client seems to be struggling\" is opinion",
    ],
    correctIdx: 1,
    explain: "Anything a reviewer can picture — a number, a date, a quote, an observed behavior — is evidence. A conclusion with nothing behind it is an opinion, no matter how confidently it's written."
  },
  {
    q: "An ASAM narrative, an ITP goal, and an Individual Note all exist for one client this week. What connects them?",
    options: [
      "Nothing required — each document has its own separate purpose",
      "They're all expressions of the same clinical judgment about this client, at different points in the thread",
    ],
    correctIdx: 1,
    explain: "The ASAM identifies the problem, the ITP plans around it, the note proves progress against it — but underneath all three is the same clinician's judgment about what's actually going on with this client."
  },
];

function renderASAMFinalQuiz(){
  buildQuiz('asamFinalQuizCard', ASAM_FINAL_QUIZ_ITEMS, null);
}

/* ---- Risk rating exercise: five examples across the scale ---- */
const RATING_EXAMPLES = [
  {key:'r1', who:'Dimension 6 — Recovery Environment', text:'Client\'s discharge home has no other substance users. Family has agreed to and is enforcing firm household boundaries. Client has also identified a sober living option as a backup if needed.', correct:0,
   note:'0 — No signs or symptoms in this dimension. The environment itself presents no identified risk, and there\'s a backup plan besides.'},
  {key:'r2', who:'Dimension 3 — Emotional/Behavioral/Cognitive', text:'Client reports mild anxiety about the upcoming discharge date. Sleeping normally, eating normally, engaging appropriately in all groups this week, no behavioral concerns observed by staff.', correct:1,
   note:'1 — Mild. Some anticipatory anxiety about discharge is a normal, expected reaction — not a symptom pattern that\'s interfering with treatment.'},
  {key:'r3', who:'Dimension 2 — Biomedical Conditions and Complications', text:'Client has untreated Hepatitis C, currently stable, referred to an outside specialist with an appointment pending. No acute symptoms currently affecting participation in treatment.', correct:2,
   note:'2 — Moderate. Nothing acute right now, but an unresolved medical condition that still requires outside coordination and monitoring is more than mild.'},
  {key:'r4', who:'Dimension 5 — Relapse/Continued Use Potential', text:'Client reports nightly cravings, no independent coping plan, and has identified a relapse contact two blocks from her planned discharge residence. Unable to name an alternative support.', correct:3,
   note:'3 — Significant impairment. Nightly cravings with no independent plan and a named, proximate contact go beyond moderate — this needs active intervention at this level of care.'},
  {key:'r5', who:'Dimension 1 — Acute Intoxication/Withdrawal Potential', text:'Client is 12 hours post-admission with ongoing tremors, vomiting, and elevated vital signs. Nursing has administered PRN medication twice in the last 4 hours, and medical staff are discussing whether a higher level of care is needed.', correct:4,
   note:'4 — Severe/imminent. Active, escalating withdrawal symptoms that are already prompting a conversation about a higher level of care are exactly what a 4 is for.'},
];
let ratingAnswered = new Set();

function renderRatingExamples(){
  const container = document.getElementById('ratingExamples');
  if(!container) return;
  container.innerHTML = '';
  ratingAnswered = new Set();
  RATING_EXAMPLES.forEach(ex=>{
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.innerHTML = `
      <div class="card-label">${ex.who}</div>
      <p style="font-size:14px; margin-top:0;">${ex.text}</p>
    `;
    const row = document.createElement('div');
    row.className = 'rating-row';
    [0,1,2,3,4].forEach(v=>{
      const pill = document.createElement('div');
      pill.className = 'rating-pill';
      pill.dataset.val = v;
      pill.textContent = v;
      row.appendChild(pill);
    });
    wrap.appendChild(row);
    const fb = document.createElement('div');
    fb.className = 'rating-feedback';
    wrap.appendChild(fb);
    container.appendChild(wrap);

    row.querySelectorAll('.rating-pill').forEach(pill=>{
      pill.addEventListener('click', ()=>{
        row.querySelectorAll('.rating-pill').forEach(p=>p.classList.remove('selected'));
        pill.classList.add('selected');
        const val = parseInt(pill.dataset.val, 10);
        fb.classList.add('show');
        if(val === ex.correct){
          fb.className = 'rating-feedback show match';
          fb.textContent = ex.note;
        } else {
          fb.className = 'rating-feedback show mismatch';
          fb.textContent = "Most reviewers would land on a " + ex.correct + " here. " + ex.note;
        }
        ratingAnswered.add(ex.key);
        if(ratingAnswered.size === RATING_EXAMPLES.length){
          markComplete('rating');
        }
      });
    });
  });
}

/* ---- Criteria checklist exercise ---- */
const CRITERIA_OPTIONS = [
  {key:'a', label:'a — Craving reported at a frequency/intensity that impairs functioning', correct:true},
  {key:'b', label:'b — Client demonstrates independent application of coping skills', correct:false},
  {key:'c', label:'c — Client unable to identify a coping response when directly assessed', correct:true},
  {key:'d', label:'d — Identified, proximate relapse trigger/contact', correct:true},
  {key:'e', label:'e — Client reports no current desire to use', correct:false},
  {key:'f', label:'f — Coping/relapse prevention is structurally dependent on current LOC', correct:true},
];

function renderCriteria(){
  const grid = document.getElementById('criteriaGrid');
  if(!grid) return;
  grid.innerHTML = '';
  CRITERIA_OPTIONS.forEach(opt=>{
    const label = document.createElement('label');
    label.className = 'criteria-opt';
    label.innerHTML = `<input type="checkbox" data-key="${opt.key}"> <span>${opt.label}</span>`;
    grid.appendChild(label);
  });
}

function checkCriteria(){
  const grid = document.getElementById('criteriaGrid');
  CRITERIA_OPTIONS.forEach(opt=>{
    const input = grid.querySelector(`input[data-key="${opt.key}"]`);
    const label = input.closest('.criteria-opt');
    label.classList.remove('correct-yes','correct-no','checked-wrong','missed');
    if(opt.correct && input.checked){
      label.classList.add('correct-yes');
    } else if(opt.correct && !input.checked){
      label.classList.add('missed');
    } else if(!opt.correct && input.checked){
      label.classList.add('checked-wrong');
    }
  });
  document.getElementById('criteriaReveal').classList.add('show');
  markComplete('criteria');
}

/* ---- Full assembly exercise ---- */
const ASSEMBLY_DIMS = [
  {key:'d1', label:'Dimension 1 — Acute Intoxication/Withdrawal Potential', correct:1,
   note:"Mild — no acute symptoms requiring medical intervention, but a two-year use history against 18 days of abstinence is enough of a gap to warrant continued monitoring, not a 0."},
  {key:'d2', label:'Dimension 2 — Biomedical Conditions and Complications', correct:2,
   note:"Moderate — the pain itself isn't treated with opioids right now, but she's directly linked it to cravings for her drug of choice; that's an active relapse risk needing coordination, not just background information."},
  {key:'d3', label:'Dimension 3 — Emotional/Behavioral/Cognitive Conditions', correct:2,
   note:"Moderate — real, observed symptoms (irritability, an unprocessed trauma response) are affecting her peer relationships and haven't been addressed in treatment yet, though this isn't an acute crisis."},
  {key:'d4', label:'Dimension 4 — Readiness to Change', correct:2,
   note:"Moderate — her stated intent doesn't match her behavior (missed worksheet, minimizing language), which needs active intervention, though she isn't refusing treatment outright."},
  {key:'d5', label:'Dimension 5 — Relapse/Continued Use Potential', correct:3,
   note:"Significant — nightly cravings, no independent coping plan, and a named, proximate relapse contact go beyond moderate impairment."},
  {key:'d6', label:'Dimension 6 — Recovery Environment', correct:3,
   note:"Significant — no enforceable boundaries in the discharge home, and a named relapse contact two blocks away, mean the environment doesn't yet support a safe step-down."},
];
let assemblyAnswered = new Set();

function renderAssemblyRatings(){
  const container = document.getElementById('assemblyRatings');
  if(!container) return;
  container.innerHTML = '';
  assemblyAnswered = new Set();
  ASSEMBLY_DIMS.forEach(dim=>{
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:26px;';
    const label = document.createElement('div');
    label.style.cssText = 'font-size:13.5px; font-weight:600; color:var(--green-800); margin-bottom:8px;';
    label.textContent = dim.label;
    wrap.appendChild(label);

    const row = document.createElement('div');
    row.className = 'rating-row';
    [0,1,2,3,4].forEach(v=>{
      const pill = document.createElement('div');
      pill.className = 'rating-pill';
      pill.dataset.val = v;
      pill.textContent = v;
      row.appendChild(pill);
    });
    wrap.appendChild(row);

    const fb = document.createElement('div');
    fb.className = 'rating-feedback';
    wrap.appendChild(fb);
    container.appendChild(wrap);

    row.querySelectorAll('.rating-pill').forEach(pill=>{
      pill.addEventListener('click', ()=>{
        row.querySelectorAll('.rating-pill').forEach(p=>p.classList.remove('selected'));
        pill.classList.add('selected');
        const val = parseInt(pill.dataset.val, 10);
        fb.classList.add('show');
        if(val === dim.correct){
          fb.className = 'rating-feedback show match';
          fb.textContent = dim.note;
        } else {
          fb.className = 'rating-feedback show mismatch';
          fb.textContent = "Most reviewers would land on a " + dim.correct + " here. " + dim.note;
        }
        assemblyAnswered.add(dim.key);
        if(assemblyAnswered.size === ASSEMBLY_DIMS.length){
          markComplete('assembly');
        }
      });
    });
  });
}

/* =====================================================
   ITP MODULE CONTENT
   Same client, Danielle, threaded through from the ASAM
   module — this is the exact case her ASAM findings
   came from, now turned into an actual treatment plan.
   ===================================================== */

/* ---- Why this module ---- */
const ITP_WHY_BEATS = [
  `<p class="lede">This module assumes you've already been through <span class="inline-link" onclick="openModule('view-bigpicture')" role="link" tabindex="0">The Golden Thread</span> and the <span class="inline-link" onclick="openModule('view-asam')" role="link" tabindex="0">ASAM module</span> — if you haven't done both, start there first. Here, we go deep on the second link: turning what the ASAM identified into an actual plan.</p>
   <p style="font-size:13px; color:var(--ink-soft);">About 30 minutes, start to finish. If you already finished ASAM in this sitting, this is a natural place to stop and pick back up later instead.</p>
   <p>If some part of you has never written one of these and isn't sure where to even start — that's exactly who this was built for. There's no assumed background here. We'll build it up one piece at a time.</p>`,

  `<p><strong>In plain terms, an ITP — Individual Treatment Plan — does one job:</strong> it takes each significant problem the ASAM identified and turns it into a specific, personalized plan to address it. Nothing more mysterious than that.</p>
   <p>Every ITP entry is built from three layers:</p>
   <ul class="checklist">
     <li><strong>A Goal</strong> — the broad direction. "Reduce relapse potential." "Address untreated trauma symptoms."</li>
     <li><strong>One or more Objectives</strong> — specific, measurable, dated steps toward that goal.</li>
     <li><strong>An Intervention</strong> for each objective — what <em>you</em>, the clinician, will actually do to help the client get there.</li>
   </ul>
   <p>We'll go layer by layer starting in the next section. For now, just hold onto the shape: problem → goal → objective → intervention.</p>`,

  `<p><a href="https://bretzfelder.com/docassist" target="_blank" rel="noopener">DocAssist</a> gives you a library of clinically vetted goals to start from, organized so each one lines up with the ASAM dimension it addresses, and it can flag when something's still missing. It can't tell you which library goal actually fits this client, whether to use the library at all versus writing one from scratch, or whether you've made it hers yet. That judgment is what this training builds.</p>`,

  `<h2>Why a goal left exactly as the library wrote it is worse than it looks</h2>
   <p>A goal left unedited from the template doesn't just look lazy — it breaks the thread. Remember: a reviewer, or an auditor months later, should be able to trace any Individual Note back through the ITP to a specific ASAM finding. If the ITP goal could belong to any client, that trace fails right there, no matter how good the note describing it is. DocAssist actually watches for this directly — a goal left unchanged from its default text triggers a warning before you can submit.</p>
   <div class="callout"><strong>The reframe to hold onto:</strong> you didn't get into this work to write treatment plans. But a specific, individualized plan is what lets you keep doing the work that actually matters with this client — because it's what protects their ability to stay in treatment long enough for it to matter. We can't help the client if we don't document.</div>`,

  `<h2>What "individualized" means for an ITP, specifically</h2>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Left as the library wrote it</span>
       <p>Goal A: Client will develop coping skills to use when experiencing high-risk situations and/or cravings. (ESTABLISHED 7/24/2025)

Objective 1A: Learn and implement 3 personal coping strategies to manage urges to lapse back into chemical use. (START DATE 7/24/2025) (TARGET DATE TBD)</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Edited into her plan</span>
       <p>Client stated, "I don't want to keep calling him just because I don't have anyone else."

Goal A: Client will develop coping skills to use during cravings occurring outside of program structure, reducing reliance on her previously identified using contact. (ESTABLISHED 7/24/2025)

Objective 1A: Client will identify two people, other than her previously identified using contact, that she can call when experiencing cravings. (START DATE 7/24/2025) (TARGET DATE 8/24/2025)</p>
     </div>
   </div>
   <p class="hero-note">Same starting point — both came from the same library goal category. The left version was accepted as-is: no client quote, and a target date left at "TBD," which is really no target at all. The right version was actually edited: it names her specific gap, is anchored by her own words, and has a real, checkable target date.</p>`,
];
const ITP_WHY_FINAL = `<button class="btn" onclick="itpMarkComplete('itpwhy'); itpGoTo('itpanatomy')">Next: The anatomy of a goal →</button>`;

/* ---- Anatomy of a goal ---- */
const ITP_ANATOMY_BEATS = [
  `<p class="lede">This is the actual anatomy. Everything else in this module — and everything DocAssist does — is just a faster way to produce these four pieces. If you were writing a treatment plan by hand, in a different system, or on paper, this is still the structure you'd be building.</p>
   <div class="thread-diagram">
     <div class="thread-box">
       <div class="thread-box-label">Problem</div>
       <div class="thread-box-sub">From the ASAM</div>
       <div class="thread-box-detail">A specific gap or unresolved risk the ASAM already identified. You don't invent this here — you find it there.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Goal</div>
       <div class="thread-box-sub">The direction</div>
       <div class="thread-box-detail">What you're working toward to address that problem.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Objective</div>
       <div class="thread-box-sub">What she'll do</div>
       <div class="thread-box-detail">A specific, checkable step toward the goal — something you can point to as done or not done, by a real date.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Intervention</div>
       <div class="thread-box-sub">What you'll do</div>
       <div class="thread-box-detail">Your action as the clinician to help her get there — not hers, yours.</div>
     </div>
   </div>
   <div class="callout"><strong>The whole chain in one sentence:</strong> you find the goal from a problem already named in the ASAM, then decide what she's going to do about it (the objective) and how you're going to help her get there (the intervention).</div>`,

  `<h3>How this looks inside DocAssist</h3>
   <p>If you're using DocAssist, it organizes this same structure into a library so you're not starting from a blank page. If you're not using it — the four pieces above are still exactly what you're building; this next part is just about the tool's organization.</p>
   <p>DocAssist's goal library is organized into three sections, and each one lines up with two ASAM dimensions:</p>
   <ul class="checklist">
     <li><strong>Section A</strong> — Dimensions 1 &amp; 2 (Acute Intoxication/Withdrawal, Biomedical Conditions)</li>
     <li><strong>Section B</strong> — Dimensions 3 &amp; 4 (Emotional/Behavioral/Cognitive, Readiness to Change)</li>
     <li><strong>Section C</strong> — Dimensions 5 &amp; 6 (Relapse/Continued Use Potential, Recovery Environment)</li>
   </ul>
   <p>Within each section is a set of goal categories — things like Chronic Pain, PTSD, Treatment Resistance, Relapse Proneness — each with several preset goal options to choose from, and several preset objective/intervention pairs you check off as relevant. Every section also has a "+ Add Custom Goal" option, which lets you write the goal name, goal text, and its own objectives/interventions entirely from scratch. Neither path is the fallback — the library is a fast, clinically sound starting point when a category fits well; writing from scratch is just as normal when a client's situation doesn't map cleanly onto one.</p>
   <p style="font-size:13px; color:var(--ink-soft);">One bookkeeping detail worth knowing now: the Goal gets a letter (A, B, C) within its section, the Objective is numbered to that letter (1A, 2A, 1B...), and the Intervention shares its objective's number. More on what that means next.</p>`,

  `<h3>Why letters reset per section</h3>
   <p>A goal's real identity is its section <em>and</em> its letter together — "Section C, Goal A" is a completely different goal from "Section A, Goal A," even though they share a letter. This isn't a bug to work around; it's just how the library is organized, since each section is scoped to its own pair of dimensions. When you reference a goal anywhere — in an Individual Note, in a review — always carry the section along with the letter.</p>`,
];
const ITP_ANATOMY_FINAL = `<button class="btn" onclick="itpMarkComplete('itpanatomy'); itpGoTo('itpanatomyexample')">Next: See it worked through an example →</button>`;

/* ---- Anatomy of a goal, part 2: worked example ---- */
const ITP_ANATOMY_EXAMPLE_BEATS = [
  `<p class="lede">Now the same structure, worked through one real example — Danielle's Dimension 5 finding from the Golden Thread (nightly cravings, no independent coping plan, one named risky contact) turned into a goal.</p>`,

  `<div class="card">
     <div class="card-label">Worked example — Danielle, Section C, Goal A <span style="font-weight:400; font-style:italic; color:var(--ink-soft);">(the section and category are already showing in DocAssist — not something you type)</span></div>
     <div class="model-answer">Client stated, "I don't want to keep calling him just because I don't have anyone else."

Goal A: Client will develop coping skills to use during cravings occurring outside of program structure, reducing reliance on her previously identified using contact. (ESTABLISHED 7/24/2025)

Objective 1A: Client will identify two people, other than her previously identified using contact, that she can call when experiencing cravings. (START DATE 7/24/2025) (TARGET DATE 8/24/2025)

Intervention 1A: This clinician will use motivational interviewing to help client identify and commit to alternative support contacts.</div>
     <ul class="checklist">
       <li><strong>Section C, Goal A</strong> — the direction: reduce relapse potential tied to unstructured-time cravings. Started from the Relapse Proneness category, then edited to name her specific gap.</li>
       <li><strong>The client quote</strong> — required for every goal. It's what makes this collaborative treatment planning, not something written about her without her.</li>
       <li><strong>Objective 1A</strong> — this specific gap (no alternative contact, one named risky one) isn't captured word-for-word by any of the category's standard pairs, so it was added as a custom objective. That's a normal, expected part of the process, not a failure to find the "right" checkbox.</li>
       <li><strong>Intervention 1A</strong> — the clinician's action: motivational interviewing, aimed specifically at getting to that objective. Not "provide support" — a named technique with a purpose.</li>
     </ul>
   </div>`,

  `<h3>The three date fields, and what each one actually captures</h3>
   <p>Dates live on the Goal and the Objective, not the Intervention:</p>
   <ul class="checklist">
     <li><strong>Established</strong> (on the Goal) — auto-filled to today's date the moment you generate the plan.</li>
     <li><strong>Start Date</strong> (on the Objective) — also auto-filled to today's date at generation. In practice, Established and Start Date will almost always show the same day, because both are stamped at the same moment.</li>
     <li><strong>Target Date</strong> (on the Objective) — the one field you actually choose. This is the real, checkable deadline, and it's the only date in the whole plan that takes deliberate judgment to set well.</li>
   </ul>
   <div class="callout">There's no separate field that gets stamped at each later review — DocAssist doesn't track a running history of check-ins on an objective. That's exactly why the Treatment Plan Reviews section later in this module matters: keeping the plan current is something <em>you</em> have to do deliberately, not something the tool does for you.</div>`,

  `<h3>The confusion this section exists to prevent</h3>
   <p>Goal and Objective get mixed up constantly, because both can sound like reasonable sentences on their own. The test: <strong>if the sentence could still be true next month, next year, forever — it's a goal.</strong> If it has a specific, checkable condition and a target date attached, it's an objective.</p>
   <div class="callout">"Client will develop coping skills for cravings outside program structure" (no target date, never really "done") is the goal. "Client will identify two alternative contacts by 8/24/2025" (checkable, dated) is the objective underneath it. If you notice your objective reads exactly like your goal, that's the signal to make it more specific.</div>`,
];
const ITP_ANATOMY_EXAMPLE_FINAL = `<button class="btn" onclick="itpMarkComplete('itpanatomyexample'); itpGoTo('itpfromfinding')">Next: Turn a finding into a goal →</button>`;

/* ---- From finding to goal (practice) ---- */
const ITP_FROMFINDING_BEATS = [
  `<p class="lede">Here's a finding you may recognize from the ASAM module — Danielle's Dimension 2 narrative about her chronic pain and its link to cravings. Dimension 2 lives in Section A of the goal library, alongside Dimension 1. The library's Chronic Pain category happens to have a close fit here, so we'll practice that path: pick the closest preset option and edit it so it actually answers this finding, plus write the client quote that anchors it. (If nothing in a category fit this well, writing a custom goal from scratch would be just as valid — we'll use the library here simply because it gives us something concrete to edit.)</p>`,

  `<h3>What your answer needs</h3>
   <ul class="checklist">
     <li>A goal sentence — built from a Chronic Pain preset option, edited to name the actual link this finding describes (pain connected to cravings, specifically)</li>
     <li>A direct client quote — her own words from the finding, not a paraphrase</li>
     <li>No target date and no single checkable condition yet — that's the objective's job, coming next</li>
   </ul>`,

  `<div class="scenario-box">
     <div class="who">ASAM finding — Dimension 2, Danielle</div>
     Client has chronic lower back pain secondary to a motor vehicle accident, previously managed with prescribed opioid medication that client identifies as a contributing factor to her opioid use disorder. Client is not currently prescribed opioid pain medication. During individual session, client disclosed unprompted that "some days it's hard not to think about how much easier the pills made it," directly connecting her untreated physical pain to cravings for her drug of choice. A physical therapy referral is pending.
   </div>
   <p style="font-size:13px; color:var(--ink-soft);">For reference, the Chronic Pain category's preset goal options include: "Regulate pain without addictive medications," "Develop healthy options to deal with chronic pain," and similar. None of them mention cravings on their own — that link is what you have to add.</p>
   <textarea id="itpFromFindingAnswer" placeholder='Start with the quote: Client stated, &quot;...&quot;  Then the goal: Goal A: Client will...' oninput="document.getElementById('itpFromFindingRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="itpFromFindingRevealBtn" disabled onclick="itpRevealModel('fromfinding')">Reveal model answer</button>
   </div>
   <div class="reveal" id="fromfindingReveal">
     <div class="card-label">Model answer <span style="font-weight:400; font-style:italic; color:var(--ink-soft);">(Section A — Dimensions 1 &amp; 2 · Goal A — Chronic Pain, already showing in DocAssist, not typed)</span></div>
     <div class="model-answer">Client stated, "Some days it's hard not to think about how much easier the pills made it."

Goal A: Client will develop non-opioid strategies to manage pain-related cravings, reducing relapse risk associated with her untreated chronic pain. (ESTABLISHED 7/24/2025)</div>
     <ul class="checklist">
       <li>Built from the library's "Develop healthy options to deal with chronic pain" option, but edited to name the exact mechanism from the finding — pain connected to cravings — not just "manage pain"</li>
       <li>Says what the goal is <em>for</em> (reducing relapse risk), not just a restated symptom</li>
       <li>Uses her own disclosure as the required client quote — nothing invented</li>
       <li>No target date, no single checkable condition — because it's a direction, not a step. That's what makes it a goal and not an objective.</li>
     </ul>
     <p style="font-size:13px; color:var(--ink-soft);">Notice this edit only exists because the finding named a specific link — pain to cravings, in the client's own words. If the ASAM narrative had just said "client has chronic pain," there'd be nothing here to build a substance-use-relevant edit from, and the library default might be all you could honestly write.</p>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="fromfindingCheckCard"></div>
   </div>`,
];
const ITP_FROMFINDING_FINAL = `<button class="btn" onclick="itpGoTo('itpobjectives')">Next: Writing measurable objectives →</button>`;

/* ---- Objectives (practice) ---- */
const ITP_OBJECTIVES_BEATS = [
  `<p class="lede">Now the harder layer. A weak objective is the single most common ITP problem — usually because it accidentally restates the goal instead of naming a checkable step underneath it.</p>`,

  `<h3>What makes an objective strong</h3>
   <ul class="checklist">
     <li>Specific — names an observable action or outcome, not a feeling or a general improvement</li>
     <li>Measurable — a reviewer could look at the record and say yes or no, did this happen</li>
     <li>Has a real Target Date — not left at the default "TBD"</li>
     <li>Owned by the client — it describes what <em>the client</em> will do or demonstrate (the clinician's action is a separate layer, coming next)</li>
   </ul>
   <div class="callout">Quick gut-check: read your objective back and ask, "could this be true forever and never actually get marked complete?" If yes, it's a goal wearing an objective's number — make it more specific.</div>`,

  `<h3>Try it: write the objective under Section A, Goal A</h3>
   <div class="scenario-box">
     <div class="who">Section A, Goal A, from the previous section</div>
     Client will develop non-opioid strategies to manage pain-related cravings, reducing relapse risk associated with her untreated chronic pain. (Additional context: a PT referral is pending; client has not yet used any non-opioid coping technique for pain, by her own report. The Chronic Pain category's preset pairs include "Investigate the use of alternative pain remedies to reduce dependence on medication.")
   </div>
   <textarea id="itpObjectivesAnswer" placeholder="Write Objective 1A, with a Start Date and Target Date..." oninput="document.getElementById('itpObjectivesRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="itpObjectivesRevealBtn" disabled onclick="itpRevealModel('objectives')">Reveal model answer</button>
   </div>
   <div class="reveal" id="objectivesReveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Objective 1A: Client will identify and use at least one non-pharmacological pain management technique (e.g., a PT-recommended exercise or a breathing/grounding technique) when experiencing pain-related cravings, as evidenced by self-report. (START DATE 7/24/2025) (TARGET DATE 8/24/2025)</div>
     <ul class="checklist">
       <li>Checked and edited from the category's "investigate alternative pain remedies" pair, made more specific to what "using" one actually looks like</li>
       <li>Has both a condition ("when experiencing pain-related cravings") and a way to confirm it happened ("as evidenced by self-report")</li>
       <li>Has a real Target Date, not left at "TBD"</li>
       <li>Is something Danielle does — not something the clinician does, which belongs in the intervention</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="objectivesCheckCard"></div>
   </div>`,
];
const ITP_OBJECTIVES_FINAL = `<button class="btn" onclick="itpGoTo('itpinterventions')">Next: Writing real interventions →</button>`;

/* ---- Interventions (practice) ---- */
const ITP_INTERVENTIONS_BEATS = [
  `<p class="lede">The most common intervention mistake: writing what the <em>client</em> will do again, instead of what <em>you</em> will do to help them get there. An intervention is always the clinician's action.</p>`,

  `<h3>What a strong intervention names</h3>
   <ul class="checklist">
     <li>A specific technique or modality — motivational interviewing, psychoeducation, cognitive-behavioral coping skills work, case management coordination, trauma-informed processing — not just "counseling" or "support"</li>
     <li>What it's aimed at — tied specifically to the objective it shares a number with, not a generic restatement of "helping the client recover"</li>
   </ul>
   <div class="callout">If your intervention sentence starts with "Client will..." — stop. That's the objective again. An intervention starts with "This clinician will..." or "Counselor will..." When you check an objective's box in DocAssist, its paired intervention comes along with it — but it still needs to actually fit, or be edited until it does.</div>`,

  `<h3>Try it: write the intervention for Objective 1A</h3>
   <div class="scenario-box">
     <div class="who">Objective 1A, from the previous section</div>
     Client will identify and use at least one non-pharmacological pain management technique when experiencing pain-related cravings, as evidenced by self-report. (START DATE 7/24/2025) (TARGET DATE 8/24/2025) (Additional context: a PT referral is pending but has not yet resulted in an appointment.)
   </div>
   <textarea id="itpInterventionsAnswer" placeholder="Write Intervention 1A..." oninput="document.getElementById('itpInterventionsRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="itpInterventionsRevealBtn" disabled onclick="itpRevealModel('interventions')">Reveal model answer</button>
   </div>
   <div class="reveal" id="interventionsReveal">
     <div class="card-label">Model answer</div>
     <div class="model-answer">Intervention 1A: This clinician will provide psychoeducation on non-opioid pain management strategies and coordinate with the pending physical therapy referral to ensure client has access to at least one alternative technique before her target date.</div>
     <ul class="checklist">
       <li>Starts with the clinician's action, not the client's</li>
       <li>Names specific techniques (psychoeducation, care coordination) instead of "provide support"</li>
       <li>Directly aimed at making Objective 1B achievable — connects the pending PT referral to the actual goal</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="interventionsCheckCard"></div>
   </div>`,
];
const ITP_INTERVENTIONS_FINAL = `<button class="btn" onclick="itpGoTo('itpindividualized')">Next: Making it hers, not a template →</button>`;

/* ---- Making it hers, not a template (classify exercise) ---- */
const ITP_INDIVIDUALIZED_BEATS = [
  `<p class="lede">For each goal or objective below, decide whether it's individualized to a real, specific client — or whether it reads like unedited template language that could apply to anyone. Click your answer, then read why.</p>`,
  `<div class="card" id="itpClassifyCard"><!-- rows injected by JS --></div>`,
];
const ITP_INDIVIDUALIZED_FINAL = `<button class="btn" onclick="itpGoTo('itpgoals')">Next: How many goals →</button>`;

const ITP_CLASSIFY_ITEMS = [
  {text:"Goal A: Client will develop healthy coping skills and improve overall wellness. (ESTABLISHED 7/24/2025)", answer:'generic', explain:"Left exactly as the library wrote it, with no client quote attached — this is exactly what triggers DocAssist's SMART warning and quote warning before you can submit."},
  {text:"Client stated, \"I don't want to keep calling him just because I don't have anyone else.\"<br><br>Goal A: Client will develop coping skills to use during cravings occurring outside of program structure, reducing reliance on her previously identified using contact. (ESTABLISHED 7/24/2025)", answer:'specific', explain:"Edited from the library default to name her specific gap, and anchored with her own words as the required client quote."},
  {text:"Objective 1A: Learn and implement 3 personal coping strategies to manage urges to lapse back into chemical use. (START DATE 7/24/2025) (TARGET DATE TBD)", answer:'generic', explain:"Straight from the library, unedited, and the Target Date was left at \"TBD\" — nothing here confirms it's actually Danielle's plan or gives a reviewer a real deadline to check."},
  {text:"Objective 1A: Client will identify two people, other than her previously identified using contact, that she can call when experiencing cravings. (START DATE 7/24/2025) (TARGET DATE 8/24/2025)", answer:'specific', explain:"Names her specific gap (one risky contact, zero alternatives) and has a real target date a reviewer can check."},
  {text:"Goal B: Understand the negative impact of the current environment on addiction recovery. (ESTABLISHED 7/24/2025)", answer:'generic', explain:"This is the unedited Living Environment Deficiency default — true in general, but it doesn't yet say anything only true of Danielle's mother's house or her ex-boyfriend living two blocks away."},
  {text:"Client stated, \"I love my mom's house.\"<br><br>Goal B: Client will identify a discharge environment with enforceable boundaries against use, given her mother's stated unwillingness to enforce a no-use household policy. (ESTABLISHED 7/24/2025)", answer:'specific', explain:"Edited to name the actual structural gap (mother won't enforce boundaries) and anchored with the client's own stated preference — which the goal has to work against, not pretend doesn't exist."},
];

function renderItpClassify(){
  const card = document.getElementById('itpClassifyCard');
  if(!card) return;
  card.innerHTML = '';
  let answeredCount = 0;
  ITP_CLASSIFY_ITEMS.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.text}</div>
        <div class="classify-explain" id="itp-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">
        <button class="pill-btn" data-val="specific" data-idx="${idx}">Individualized</button>
        <button class="pill-btn" data-val="generic" data-idx="${idx}">Template</button>
      </div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = ITP_CLASSIFY_ITEMS[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const correct = btn.dataset.val === item.answer;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns.forEach(b=>{ if(b.dataset.val === item.answer) b.classList.add('chosen-correct'); });
      }
      document.getElementById(`itp-explain-${idx}`).classList.add('show');
      answeredCount++;
      if(answeredCount === ITP_CLASSIFY_ITEMS.length){
        itpMarkComplete('itpindividualized');
      }
    });
  });
}

/* ---- How many goals ---- */
const ITP_GOALS_BEATS = [
  `<p class="lede">A natural instinct is to write a goal for every dimension in the ASAM. Resist it — that turns the ITP back into a template exercise, just six of them instead of one.</p>`,

  `<h3>The actual question for each dimension</h3>
   <p>Not "did this dimension get a rating above 0?" but "is this dimension actively driving the client's need for this level of care right now?" A dimension can be real, true, and still not need its own dedicated goal if it's stable, resolving on its own, or already being addressed through medical monitoring rather than counseling intervention.</p>
   <div class="callout">Danielle's Dimension 1 (withdrawal) is a good example: real, documented, worth continued monitoring — but medically stable, and not something a counseling goal and objective would meaningfully address. It stays in the ASAM narrative as monitored, without becoming its own ITP goal.</div>`,

  `<h3>Danielle's actual ITP, across three sections</h3>
   <p style="font-size:13.5px; color:var(--ink-soft);">Here's what a realistic plan looks like once you apply that filter — five goals across five active findings, organized into the sections their dimensions belong to, skipping the one dimension that didn't need one. Remember: letters reset at the start of each section. One section at a time.</p>
   <div class="card">
     <div class="card-label">Section A — Dimensions 1 &amp; 2</div>
     <p style="font-size:13.5px; margin:8px 0 2px;"><strong>Goal A — Chronic Pain (Dimension 2)</strong></p>
     <p style="font-size:13.5px; margin:2px 0 0;">Develop non-opioid strategies to manage pain-related cravings. <em style="color:var(--ink-soft);">No goal for Dimension 1 — monitored in the ASAM instead.</em></p>
   </div>`,

  `<div class="card">
     <div class="card-label">Section B — Dimensions 3 &amp; 4</div>
     <p style="font-size:13.5px; margin:8px 0 2px;"><strong>Goal A — Posttraumatic Stress Disorder (Dimension 3)</strong></p>
     <p style="font-size:13.5px; margin:2px 0 10px;">Begin addressing the trauma response connected to her motor vehicle accident, to reduce avoidance and peer irritability.</p>
     <p style="font-size:13.5px; margin:0 0 2px;"><strong>Goal B — Treatment Resistance (Dimension 4)</strong></p>
     <p style="font-size:13.5px; margin:2px 0 0;">Increase congruence between her stated recovery intent and her observable behavior.</p>
   </div>`,

  `<div class="card">
     <div class="card-label">Section C — Dimensions 5 &amp; 6</div>
     <p style="font-size:13.5px; margin:8px 0 2px;"><strong>Goal A — Relapse Proneness (Dimension 5)</strong></p>
     <p style="font-size:13.5px; margin:2px 0 10px;">Develop coping skills to use during cravings occurring outside of program structure.</p>
     <p style="font-size:13.5px; margin:0 0 2px;"><strong>Goal B — Living Environment Deficiency (Dimension 6)</strong></p>
     <p style="font-size:13.5px; margin:2px 0 0;">Identify a discharge environment with enforceable boundaries against use.</p>
   </div>
   <p>Notice there are two goals lettered "A" and two lettered "B" in this plan — Section B's Goal A is not the same goal as Section C's Goal A. That's exactly why you always carry the section along with the letter when you reference one.</p>`,

  `<h3>How goals get prioritized within a section, not just listed</h3>
   <p>Within a section, the order isn't arbitrary — the goal tied to the most acute or highest-risk finding usually goes first, with goals addressing underlying contributors following it. Danielle's Section B, for example, leads with the PTSD goal because the unaddressed trauma response is arguably driving the readiness-to-change gap in Goal B — not the other way around.</p>`,
];
const ITP_GOALS_FINAL = `<button class="btn" onclick="itpMarkComplete('itpgoals'); itpGoTo('itpreviews')">Next: Treatment plan reviews →</button>`;

/* ---- Treatment plan reviews ---- */
const ITP_REVIEWS_BEATS = [
  `<p class="lede">An ITP isn't written once and forgotten — it gets revisited at every treatment plan review, and this is where the Golden Thread either stays intact or quietly breaks.</p>`,

  `<div class="callout"><strong>Important to understand about the dates:</strong> DocAssist doesn't keep a running history of check-ins on an objective — there's no field that logs "this was looked at again on this date." Established and Start Date are simply whatever day you generate the plan on. That means if you regenerate an existing goal at a later review, its Established date will show <em>that later day</em>, not the original date the goal was first written. Keeping track of that history is on you and the record, not the tool.</div>`,

  `<h3>What a review actually has to do</h3>
   <ul class="checklist">
     <li>Check each open objective against what the Individual Notes since the last review actually showed — not against memory or assumption</li>
     <li>Note in the record whether this is the same original goal still being worked, or an intentionally fresh one — see the "Continued" convention below</li>
     <li>Update the Target Date on any objective that's still relevant but whose old target has passed</li>
     <li>Add new objectives (or, rarely, new goals) if a new active finding has emerged in a Continued Stay ASAM</li>
   </ul>
   <div class="callout"><strong>The "Continued" convention:</strong> since DocAssist always stamps Established as today's date when you generate the plan, that field alone can't tell a later reader whether a goal is brand new or has been active since week one. The fix is simple: when a goal is still the same one from a prior review, note that directly — for example, <span class="term" onclick="this.classList.toggle('term-open')">"Goal A (Continued 8/24/2025)"<span class="term-def">This means: Goal A already existed before this review — it isn't a new goal — and this particular review/check-in on it happened 8/24/2025. Write the real review date here, not the Established date DocAssist generated.</span></span> next to the goal, using the date of <em>this</em> review. That one word and date is what lets someone reading the record later tell "still working this" apart from "just started this."</div>`,

  `<div class="callout"><strong>The mistake this invites:</strong> carrying Objective 1A of Section C forward with a stale Target Date, review after review, without checking whether the notes since the last review actually addressed it. If three Individual Notes in a row never mention Objective 1A, the review should say that plainly — not just leave an old target date sitting there as if nothing happened.</div>`,

  `<h3>Where the thread actually closes</h3>
   <p>Recall from the Golden Thread: what gets documented in the Individual Note becomes the evidence for the next Continued Stay ASAM, which then feeds the next treatment plan review. If Danielle's notes show she followed through and named her sister and her sponsor as alternative contacts, the next review of Section C, Goal A should say exactly that — either marking Objective 1A complete, or noting real but partial progress with an updated Target Date. If the review is silent on it, that silence is a visible gap in the thread, even if every individual document looked fine on its own.</p>`,

  `<h3>Check your understanding</h3>
   <div class="quiz-card" id="itpReviewsQuizCard"></div>`,
];
const ITP_REVIEWS_FINAL = `<button class="btn" onclick="itpGoTo('itpassembly')">Next: Put it all together →</button>`;

const ITP_REVIEWS_QUIZ_ITEMS = [
  {
    q: "At Danielle's next treatment plan review, Section C's Objective 1A is carried forward with its Target Date still showing the original date, even though three Individual Notes since the last review discussed her progress identifying alternative contacts. What's missing?",
    options: [
      "Nothing — objectives are supposed to stay the same until they're fully complete",
      "The review should reflect what those notes actually showed and update the Target Date accordingly, whether that's progress, a stall, or completion — not leave it untouched",
      "The objective should be deleted entirely since it's been open for multiple reviews",
    ],
    correctIdx: 1,
    explain: "A review that ignores what the notes since the last review actually showed breaks the thread — even if the original objective was well written. DocAssist won't flag a stale Target Date for you; that's a judgment call you have to make."
  },
  {
    q: "Danielle's PT referral (tied to Section A, Goal A, Objective 1A) still hasn't resulted in an appointment by the next review. What should happen to that objective?",
    options: [
      "Leave it exactly as written — appointments are outside the clinician's control",
      "Note the barrier, and revise the intervention or Target Date to reflect what's actually achievable given that barrier",
      "Remove the goal since the referral hasn't gone through yet",
    ],
    correctIdx: 1,
    explain: "A stalled real-world barrier is exactly the kind of thing a review should name and adjust for — not something to leave unaddressed or use as a reason to drop the goal."
  },
];

function renderItpReviewsQuiz(){
  buildQuiz('itpReviewsQuizCard', ITP_REVIEWS_QUIZ_ITEMS, ()=>itpMarkComplete('itpreviews'));
}

/* ---- Full assembly ---- */
const ITP_ASSEMBLY_BEATS = [
  `<p class="lede">One more finding, no scaffolding this time. Danielle's Dimension 4 finding lives in Section B, alongside her Dimension 3 (PTSD) goal — so this one is Section B, Goal B. Write the full client quote, Goal, Objective, and Intervention below.</p>`,

  `<div class="scenario-box">
     <div class="who">ASAM finding — Dimension 4, Danielle</div>
     Client verbalizes intent to maintain sobriety, citing her children as motivation, but minimizes the severity of her opioid use, referring to it as "a bad habit," and distinguishes herself from peers in group ("not like the other people here"). This stated insight is inconsistent with follow-through: client did not complete an assigned relapse prevention worksheet due 7/22/2025, and when reminded 7/24/2025 responded she would "get to it," without a specific plan.
   </div>
   <p style="font-size:13px; color:var(--ink-soft);">This falls under the library's Treatment Resistance category. Preset goal options include "Learn the facts about addiction, and make a logical decision about the treatment necessary to arrest it" — a reasonable starting point to edit from.</p>
   <textarea id="itpAssemblyAnswer" placeholder="Write the client quote, Goal B, Objective 1B, and Intervention 1B here..." style="min-height:180px;" oninput="document.getElementById('itpAssemblyRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="itpAssemblyRevealBtn" disabled onclick="itpRevealModel('assembly')">Reveal model answer</button>
   </div>
   <div class="reveal" id="assemblyReveal">
     <div class="card-label">Model answer <span style="font-weight:400; font-style:italic; color:var(--ink-soft);">(Section B — Dimensions 3 &amp; 4 · Goal B — Treatment Resistance, already showing in DocAssist, not typed)</span></div>
     <div class="model-answer">Client stated, "I'm not like the other people here — it's more of a bad habit."

Goal B: Client will make a logical, honest assessment of her opioid use and increase congruence between her stated recovery intent and her observable behavior. (ESTABLISHED 7/24/2025)

Objective 1B: Client will complete the assigned relapse prevention worksheet and review it with her counselor within one week of assignment, addressing the gap between her stated commitment and her minimizing language in group ("a bad habit"). (START DATE 7/24/2025) (TARGET DATE 7/31/2025)

Intervention 1B: This clinician will use motivational interviewing to explore client's ambivalence and reinforce follow-through on assigned recovery tasks.</div>
     <ul class="checklist">
       <li>Goal is edited from the Treatment Resistance library default to name the actual gap (stated intent vs. behavior), not just "increase motivation"</li>
       <li>Client quote uses her own minimizing language, which is exactly what the goal has to address</li>
       <li>Objective has a real Target Date (one week out) and references the specific minimizing pattern that makes it hers</li>
       <li>Intervention is the clinician's action (motivational interviewing), aimed specifically at closing that gap</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Check your understanding</div>
     <div class="quiz-card" id="itpAssemblyQuizCard"></div>
   </div>`,

  `<h2>Zooming back out</h2>
   <p>Step back for a second from Section B, Goal B specifically, to everything you've built across these two modules. In the ASAM module, you took what you observed about one client — cravings, a missed worksheet, a mother who won't set boundaries — and turned it into specific, evidence-based findings a reviewer could picture. In this module, you took those same findings and turned them into a plan: a direction, a checkable step, and a named clinical action, all traceable back to the exact sentence that justified them.</p>
   <p>That's the whole thread, in practice, not just in a diagram. If this is the first time you've ever written either of these documents, you now have the real shape of both — the third piece, the Individual Note, is what proves this plan is actually being worked, and it's next. If you've been writing ASAMs and ITPs for a while already, this is the moment worth sitting with: the six-dimension narrative and the goal-and-objective plan were never two separate chores. They're the same clinical judgment about the same person, written down twice, in two different shapes, so the record can hold together under review. Once that clicks, neither document is something you write <em>and then</em> think about the client — writing it well <em>is</em> thinking about the client.</p>`,

  `<div class="callout"><strong>This is the whole point of both modules together:</strong> a problem the ASAM already proved is real, turned into a direction, a checkable step, and a specific clinician action — all individualized enough that a reviewer could only be reading about one real person.</div>
   <span class="badge-done" id="itpFinalBadge" style="display:none;">🎉 You've completed the ITP module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="itpGoTo('itpcheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span>, <span class="inline-link" onclick="itpGoTo('itpmistakes')" role="link" tabindex="0">common mistakes recap</span>, and <span class="inline-link" onclick="itpGoTo('itpfaq')" role="link" tabindex="0">FAQ</span> are built to be reopened anytime you're actually writing an ITP — not just read once during training.
   </div>
   <div class="callout" style="margin-top:16px;">
     <strong>Coming next:</strong> the Individual Notes module — proving, session by session, that this plan is actually being worked. Once that exists, Danielle's thread will run unbroken from the first thing you ever wrote about her cravings to the note documenting whether she actually called her sister instead of her ex.
   </div>`,
];
const ITP_ASSEMBLY_FINAL = `<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
  <button class="btn" onclick="openModule('view-note')">Next: Start Individual Notes Module →</button>
  <button class="btn secondary" onclick="goHome()">← Back to Clinical Training home</button>
</div>`;

const ITP_ASSEMBLY_QUIZ_ITEMS = [
  {
    q: "Which part of the model answer above is the objective, specifically?",
    options: [
      "\"Client will increase congruence between her stated recovery intent and her observable behavior.\"",
      "\"Client will complete the assigned relapse prevention worksheet and review it with her counselor within one week of assignment...\"",
      "\"This clinician will use motivational interviewing to explore client's ambivalence...\"",
    ],
    correctIdx: 1,
    explain: "It's the specific, dated, checkable step — the goal is the broad direction above it, and the intervention is the clinician's action below it."
  },
];

const ITP_CHECK_ITEMS = {
  fromfinding: [{
    q: "The Dimension 2 finding mentions PT is pending but doesn't yet exist. Should the goal wait until the PT appointment actually happens?",
    options: [
      "Yes — a goal can't be written until every referral in it is already scheduled",
      "No — the goal can be written now, based on the finding that already exists; the pending referral becomes part of the intervention or objective instead",
      "No — pending referrals should be left out of the plan entirely",
    ],
    correctIdx: 1,
    explain: "The goal only needs a real, documented problem to build from — which this finding already provides. Logistics like a pending referral show up one layer down, in the objective or intervention."
  }],
  objectives: [{
    q: "What would make 'Client will manage her pain better' a weak objective, even though it's related to the right goal?",
    options: [
      "It's too short to be taken seriously",
      "It has no specific, checkable action and no date — a reviewer can't confirm it happened or didn't",
      "It doesn't use enough clinical language",
    ],
    correctIdx: 1,
    explain: "\"Manage her pain better\" could be true or false depending entirely on opinion. A strong objective names an observable action with a target date, so it's checkable either way."
  }],
  interventions: [{
    q: "\"Client will use a coping technique when pain-related cravings occur\" is written as Intervention 1A. What's wrong with it?",
    options: [
      "Nothing — it's specific and dated",
      "It describes the client's action, not the clinician's — it's actually a restated objective, not an intervention",
      "It's too long for an intervention",
    ],
    correctIdx: 1,
    explain: "An intervention is always what the clinician does. This sentence describes Danielle's behavior, which already belongs in Objective 1A one layer up."
  }],
  assembly: []
};

function itpRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
  if(ITP_CHECK_ITEMS[id] && ITP_CHECK_ITEMS[id].length){
    buildQuiz(id + 'CheckCard', ITP_CHECK_ITEMS[id], ()=>itpMarkComplete(id === 'fromfinding' ? 'itpfromfinding' : id === 'objectives' ? 'itpobjectives' : id === 'interventions' ? 'itpinterventions' : id));
  }
  if(id === 'assembly'){
    buildQuiz('itpAssemblyQuizCard', ITP_ASSEMBLY_QUIZ_ITEMS, ()=>itpMarkComplete('itpassembly'));
  }
}

/* =====================================================
   INDIVIDUAL NOTES MODULE CONTENT
   Same client, Danielle, threaded through from the ASAM
   and ITP modules — the note practiced here reviews the
   exact objective (Section C, Goal A, Objective 1A) built
   in the ITP module and previewed back in the Golden Thread.
   ===================================================== */

/* ---- Why this module ---- */
const NOTE_WHY_BEATS = [
  `<p class="lede">This module assumes you've already been through the <span class="inline-link" onclick="openModule('view-itp')" role="link" tabindex="0">ITP module</span> — if you haven't, start there first. This is the third and final link in the Golden Thread: the ASAM found the problem, the ITP planned it, and the Individual Note is what proves, session by session, that the plan is actually being worked.</p>
   <p style="font-size:13px; color:var(--ink-soft);">Last module — about 25 minutes. This one maps most directly onto what you'll actually type after a session, so it's worth having <a href="https://bretzfelder.com/docassist" target="_blank" rel="noopener">DocAssist</a> open in another tab to look at the real fields alongside this.</p>`,

  `<p><strong>In plain terms, an Individual Note does one job:</strong> it documents what happened in a specific session, and connects it back to a specific objective in the client's ITP. <a href="https://bretzfelder.com/docassist" target="_blank" rel="noopener">DocAssist</a> generates it as two boxes:</p>
   <ul class="checklist">
     <li><strong>Describe Therapeutic Interventions Provided</strong> — which objective(s) you worked on, and what you did in session.</li>
     <li><strong>Response — Intervention/Progress/Clinical Judgement</strong> — how the client responded, whether anything was completed, what's next, and a required risk &amp; safety line.</li>
   </ul>`,

  `<p>DocAssist auto-generates some of the connective sentences — which objective was reviewed, whether it was completed, what's assigned next — from a few fields you fill in. But it has no idea what actually happened in the room. The free-text parts, and the judgment about what belongs in them, are entirely yours. That's what this module builds.</p>`,

  `<h2>Before anything else: a progress note is not a therapy note</h2>
   <p>This is one of the most important distinctions in this whole module, and it's easy to get backwards. An Individual Note documents <strong>progress toward a specific objective</strong> — not a transcript of the session, not a record of everything the client disclosed, not her full emotional processing of a topic. If you find yourself writing down everything discussed the way you might in a personal clinical log, stop. That's not what this field is for.</p>
   <div class="callout"><strong>This isn't just a stylistic preference — it can genuinely protect or harm the client.</strong> A progress note is part of the official clinical record. It can be subpoenaed in legal proceedings — custody disputes, criminal cases, civil litigation — and used by parties who do not have the client's best interests in mind. A note that reads like a therapy transcript, full of extensive personal disclosures, trauma details, or unrelated history, hands over material that was never meant to leave the therapeutic relationship, and can be used against the very client it was written about.</p>`,

  `<h3>The practical test</h3>
   <p>Before writing a sentence into either box, ask: <strong>does this document progress toward the objective, or does it just repeat what she told me?</strong> If it's the second, it almost always doesn't belong here — even if it felt like the most important part of the session emotionally.</p>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Reads like a therapy transcript</span>
       <p>Client disclosed extensive details about a traumatic event from her childhood, describing the specific circumstances and the person involved at length. Client also discussed feelings of betrayal regarding a past relationship and shared history from three prior relationships.</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Reads like a progress note</span>
       <p>In the course of working toward Objective 1C, client identified a specific trigger connected to a past traumatic event. Client's affect was tearful but she was able to re-engage with the session's focus after a brief grounding exercise.</p>
     </div>
   </div>
   <p class="hero-note">The right column doesn't pretend the trauma wasn't discussed — it says enough to show clinical relevance to the objective, without reproducing the disclosure itself. That's the line: acknowledge what's clinically relevant, don't transcribe it.</p>`,

  `<h2>Why a note with no objective reference is a real problem</h2>
   <p>Recall the single most important idea from the Golden Thread: a reviewer or auditor should be able to take any Individual Note and trace it backward to a specific ASAM finding, with nothing missing in between. A note that never names which objective it's working toward can't be traced to anything — it just reads as a conversation that happened, not treatment toward a documented plan.</p>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Just a conversation</span>
       <p>This clinician met with client for individual session. Client discussed feelings about recovery and expressed some progress. No concerns noted.</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Proves the plan is being worked</span>
       <p>This clinician met with client to review Objective 1A of Goal A of Section C. Client identified her sister and a former sponsor as two alternative contacts she is willing to reach out to during cravings. Client rated her confidence in following through as 6/10. No risk or safety concerns identified this session.</p>
     </div>
   </div>
   <p class="hero-note">Notice this second example follows the same rule as the one above: specific and traceable, but still proportionate. It documents what's needed to show progress — not everything Danielle said in the room.</p>`,
];
const NOTE_WHY_FINAL = `<button class="btn" onclick="noteMarkComplete('notewhy'); noteGoTo('noteanatomy')">Next: The anatomy of a note →</button>`;

/* ---- Anatomy of a note ---- */
const NOTE_ANATOMY_BEATS = [
  `<p class="lede">Let's look at the fields that build a note, using the same objective from the Golden Thread and the ITP module — Danielle's Section C, Goal A, Objective 1A.</p>`,

  `<h3>The fields, in order</h3>
   <ul class="checklist">
     <li><strong>Client name &amp; date</strong></li>
     <li><strong>Session Type</strong> — one of four; changes which fields show and which sentences auto-generate (next section goes deep on this)</li>
     <li><strong>ITP Reference</strong> — Objective(s) Reviewed and Objective(s) Assigned Next, each just a Goal Letter and an Objective Number</li>
     <li><strong>Therapeutic Interventions Used</strong> — Motivational Interviewing or CBT — Cognitive Restructuring, selected as chips</li>
     <li><strong>Session Description</strong> — free text, what occurred in session</li>
     <li><strong>Response — Intervention/Progress/Clinical Judgement</strong> — free text, how the client responded</li>
     <li><strong>Risk &amp; Safety</strong> — checkboxes plus optional free text</li>
   </ul>
   <div class="callout">One honest note about the intervention chips: selecting Motivational Interviewing or CBT doesn't currently generate its own sentence in the output. Pick whichever the session actually centered on — if it centered on exploring what the client wants and building motivation, that's MI; if it centered on examining thought patterns or challenging distorted thinking, that's CBT — and if it mattered clinically, say so in your free text too.</div>`,

  `<h3>The reference format</h3>
   <p>An objective gets referenced as its number, its goal letter, and now its section: "Objective 1A of Goal A of Section C." Including the section closes a real gap — since letters reset per section, "Goal A" by itself could mean three different goals, and now the note says exactly which one it means without you having to track that separately.</p>
   <div class="callout"><strong>Remember from the ITP module:</strong> letters reset at the start of every section, so a bare "Goal A" is still ambiguous on its own — that's exactly why the section is included. It's still worth double-checking that the section named matches the section the goal actually lives in, especially if a client has similarly-named goals in more than one section.</div>`,

  `<div class="card">
     <div class="card-label">Worked example — Danielle, reviewing Section C, Goal A, Objective 1A</div>
     <div class="card-label" style="margin-top:14px; color:var(--green-700);">Describe Therapeutic Interventions Provided</div>
     <div class="model-answer">- This clinician met with client to review Objective 1A of Goal A of Section C.

- Client was asked to identify support contacts other than her previously identified using contact.</div>
     <div class="card-label" style="margin-top:14px; color:var(--green-700);">Response — Intervention/Progress/Clinical Judgement</div>
     <div class="model-answer">- Client identified her sister and a former sponsor as two alternative contacts she is willing to reach out to during cravings.

- Client rated her confidence in following through as 6/10.

- No risk or safety concerns identified this session.</div>
     <ul class="checklist">
       <li>"Objective 1A of Goal A" is the literal reference string — this is what lets someone trace this note back to the exact goal it belongs to.</li>
       <li>The client wasn't marked "Completed" yet — the objective stays open, so the thread continues into the next note instead of closing here.</li>
       <li>This is exactly the note you saw previewed in the Golden Thread, before you'd learned any of the mechanics behind it.</li>
     </ul>
   </div>`,

  `<h3>Reviewed vs. Assigned Next</h3>
   <p>Objective(s) Reviewed rows can be checked "Completed" — this only applies to something you actually worked on today. Objective(s) Assigned Next rows have no Completed checkbox, because they haven't happened yet; they're what the client will work on before the next session.</p>`,
];
const NOTE_ANATOMY_FINAL = `<button class="btn" onclick="noteMarkComplete('noteanatomy'); noteGoTo('notetypes')">Next: Four session types →</button>`;

/* ---- Session types (practice) ---- */
const NOTE_TYPES_BEATS = [
  `<p class="lede">The Session Type you pick changes which fields appear and which auto-generated sentences open the note. Getting it right matters — using the wrong type can make a note claim progress that never happened, or hide a required note that a first meeting actually needs.</p>`,

  `<h3>The four types</h3>
   <ul class="checklist">
     <li><strong>Working off ITP (Reviewing)</strong> — the default, routine session. Opens with a line naming the objective(s) reviewed, or a generic line if none were selected.</li>
     <li><strong>Updating/Revising ITP</strong> — for when the plan itself is changing. Opens by naming that the ITP was updated, then lists what was reviewed.</li>
     <li><strong>First Meeting/Initial ITP</strong> — the "Objective(s) Reviewed" fields hide entirely, since there's nothing to review yet. Opens with rapport-building and completing the initial plan.</li>
     <li><strong>Crisis Intervention</strong> — the whole ITP Reference section hides. Opens by stating the client's original ITP goals aren't a reflection of today's crisis note, since a crisis session isn't routine progress on the existing plan.</li>
   </ul>
   <div class="callout">Notice the pattern: the tool doesn't just relabel the same note four ways — it removes fields that wouldn't make sense for that type of session. If you can't find the "Objective(s) Reviewed" fields, check whether you've picked First Meeting or Crisis first before assuming something's broken.</div>`,

  `<h3>Try it: match each scenario to its session type</h3>
   <div class="quiz-card" id="noteTypesQuizCard"></div>`,
];
const NOTE_TYPES_FINAL = `<button class="btn" onclick="noteGoTo('notedescribe')">Next: Writing the session description →</button>`;

const NOTE_TYPES_QUIZ_ITEMS = [
  {
    q: "Danielle is admitted today. This is the very first time her counselor is meeting with her one-on-one.",
    options: ["Working off ITP (Reviewing)", "First Meeting/Initial ITP", "Crisis Intervention"],
    correctIdx: 1,
    explain: "Nothing has been reviewed yet — there's no existing objective to reference. First Meeting hides the \"Reviewed\" fields entirely, since a note claiming to review something that doesn't exist yet would be inaccurate."
  },
  {
    q: "Danielle's counselor meets with her for a routine individual session to work on Objective 1A, same as most weeks.",
    options: ["Working off ITP (Reviewing)", "Updating/Revising ITP", "Crisis Intervention"],
    correctIdx: 0,
    explain: "This is the default, ordinary case — reviewing progress on an existing objective without changing the plan itself."
  },
  {
    q: "Danielle attempted to leave the facility against staff advice and required an emergency safety intervention.",
    options: ["Working off ITP (Reviewing)", "First Meeting/Initial ITP", "Crisis Intervention"],
    correctIdx: 2,
    explain: "An acute event like this isn't routine progress on the existing plan — Crisis Intervention hides the ITP reference fields and opens by stating the original goals aren't a reflection of today's note."
  },
  {
    q: "At Danielle's treatment plan review, her counselor meets with her specifically to revise Goal A because her circumstances have changed.",
    options: ["Working off ITP (Reviewing)", "Updating/Revising ITP", "First Meeting/Initial ITP"],
    correctIdx: 1,
    explain: "This session is specifically about changing the plan, not just working the existing one — that's what Updating/Revising ITP is for."
  },
];

function renderNoteTypesQuiz(){
  buildQuiz('noteTypesQuizCard', NOTE_TYPES_QUIZ_ITEMS, ()=>noteMarkComplete('notetypes'));
}

/* ---- Writing the session description (practice) ---- */
const NOTE_DESCRIBE_BEATS = [
  `<p class="lede">DocAssist auto-generates a line naming which objective you reviewed. Your job in the Session Description field is to say what actually happened — the auto-generated line proves you worked on the right thing, but your free text is what proves it was real.</p>
   <div class="callout">Keep the earlier rule in mind here: this is the field where it's easiest to accidentally slide into therapy-note territory. Describe the clinical task and what was addressed toward the objective — not everything the client said while you were addressing it.</div>`,

  `<h3>What your answer needs</h3>
   <ul class="checklist">
     <li>Name the clinical task tied to the objective — what you actually asked her to do or work on this session</li>
     <li>One or two sentences is usually enough — this field isn't where the outcome goes, just the task</li>
     <li>Leave out anything she said that isn't necessary to show the task was addressed (the "why," the backstory, her feelings about it)</li>
   </ul>`,

  `<h3>Try it: write the session description</h3>
   <div class="scenario-box">
     <div class="who">Session — Danielle, reviewing Section C, Goal A, Objective 1A</div>
     <div class="meta">Session Type: Working off ITP (Reviewing) &nbsp;·&nbsp; Objective Reviewed: 1, Goal A (not yet marked complete)</div>
     <p style="margin:0;">During session, Danielle was asked to name two people, other than her ex-boyfriend, she could call during a craving. After some hesitation, she named her sister and a former AA sponsor, and said she felt comfortable reaching out to both.</p>
   </div>
   <textarea id="noteDescribeAnswer" placeholder="e.g. Client was asked to identify support contacts other than..." oninput="document.getElementById('noteDescribeRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="noteDescribeRevealBtn" disabled onclick="noteRevealModel('describe')">Reveal model answer</button>
   </div>
   <div class="reveal" id="describeReveal">
     <div class="card-label">Full generated box (auto-text + your free text)</div>
     <div class="model-answer">- This clinician met with client to review Objective 1A of Goal A of Section C.

- Client was asked to identify support contacts other than her previously identified using contact.</div>
     <ul class="checklist">
       <li>The first bullet is auto-generated from the objective reference you entered — you don't write this part</li>
       <li>The second bullet is your free text — it names the actual clinical task (identifying alternative contacts), without yet revealing the outcome, which belongs in the Response box next</li>
       <li>It stays at the level of the clinical task — it doesn't reproduce anything Danielle said about why her ex is still someone she'd consider calling, which isn't necessary to show progress on this objective</li>
       <li>Written in complete sentences, ready to paste verbatim into Remarkable — not a shorthand fragment</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="describeCheckCard"></div>
   </div>`,
];
const NOTE_DESCRIBE_FINAL = `<button class="btn" onclick="noteGoTo('noteresponse')">Next: Writing the response →</button>`;

/* ---- Writing the response (practice) ---- */
const NOTE_RESPONSE_BEATS = [
  `<p class="lede">The Response box is where the outcome lives — what the client actually said or did, whether the objective is complete, and the risk &amp; safety line every note requires.</p>
   <div class="callout">Same rule as the last section, since it applies here just as much: document her response <em>to the objective</em>, not everything she processed emotionally while getting there. A confidence rating and a concrete outcome are progress. A full account of her feelings about her ex-boyfriend is not — even if that's most of what the session actually felt like.</div>`,

  `<h3>What your answer needs</h3>
   <ul class="checklist">
     <li>The actual outcome — what she said or did in direct response to the task, not a general summary of the session</li>
     <li>Something measurable if you have it — a rating, a specific statement, a concrete behavior</li>
     <li>Whether this counts as progress toward the objective — even "not yet, and here's why" is a complete, honest answer</li>
   </ul>`,

  `<h3>Try it: write the response</h3>
   <div class="scenario-box">
     <div class="who">Same session — Danielle, Objective 1A</div>
     Danielle named her sister and a former sponsor as two people she'd call instead of her ex. She rated her confidence in actually following through as 6 out of 10. Her counselor did not mark the objective complete — this was the first time she'd named anyone, and follow-through hasn't been observed yet. No risk concerns came up this session.
   </div>
   <textarea id="noteResponseAnswer" placeholder="e.g. Client identified... and rated her confidence in following through as..." oninput="document.getElementById('noteResponseRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="noteResponseRevealBtn" disabled onclick="noteRevealModel('response')">Reveal model answer</button>
   </div>
   <div class="reveal" id="responseReveal">
     <div class="card-label">Full generated box (your free text + auto-text)</div>
     <div class="model-answer">- Client identified her sister and a former sponsor as two alternative contacts she is willing to reach out to during cravings.

- Client rated her confidence in following through as 6/10.

- No risk or safety concerns identified this session.</div>
     <ul class="checklist">
       <li>Because the objective wasn't marked "Completed," no auto-generated completion sentence appears — the record accurately shows this is still in progress</li>
       <li>The confidence rating (6/10) is exactly the kind of specific, checkable detail that makes a response read as real rather than boilerplate</li>
       <li>The risk line appears automatically because no risk checkboxes were checked — it's a real clinical claim, so it only belongs here because it's actually true</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="responseCheckCard"></div>
   </div>`,
];
const NOTE_RESPONSE_FINAL = `<button class="btn" onclick="noteGoTo('noterisk')">Next: Risk & safety →</button>`;

/* ---- Risk & safety ---- */
const NOTE_RISK_BEATS = [
  `<p class="lede">Every note gets a risk &amp; safety line — there's no way to leave it blank. That makes it one of the few places in this whole system where silence still produces a claim.</p>`,

  `<h3>How the line gets built</h3>
   <ul class="checklist">
     <li>Check any of "SI denied," "HI denied," or "Safety plan reviewed," and those join together as the line, e.g. "SI denied; HI denied."</li>
     <li>Check none of them, and the note defaults to: <em>"No risk or safety concerns identified this session."</em></li>
     <li>Check "Concerns present," and a free-text field opens — whatever you write there gets added after the line above.</li>
   </ul>
   <div class="callout"><strong>The real danger here:</strong> the default line is reassuring. If something concerning actually happened and you simply forget to check "Concerns present," the note doesn't stay silent about it — it actively states that nothing was wrong. An empty risk section isn't neutral; it's a specific, false claim of safety.</div>`,

  `<h3>Quick check</h3>
   <div class="quiz-card" id="riskQuizCard"></div>`,
];
const NOTE_RISK_FINAL = `<button class="btn" onclick="noteMarkComplete('noterisk'); noteGoTo('noteassembly')">Next: Put it all together →</button>`;

const NOTE_RISK_QUIZ_ITEMS = [
  {
    q: "During session, Danielle mentions passive thoughts of \"what's the point\" that concern her counselor, though she denies any plan or intent. The counselor forgets to check \"Concerns present\" before generating the note. What does the note now say?",
    options: [
      "Nothing — the risk section is simply left blank",
      "\"No risk or safety concerns identified this session\" — a specific claim that isn't true",
      "The note won't generate until the field is completed",
    ],
    correctIdx: 1,
    explain: "The tool always produces a risk line. If nothing is checked, it defaults to the reassuring statement — which becomes actively false if something concerning actually happened and wasn't flagged."
  },
  {
    q: "A counselor checks \"SI denied\" and \"HI denied\" every single session, regardless of what was actually discussed, just to be thorough. What's the problem with that habit?",
    options: [
      "There's no problem — more documentation is always safer",
      "Those checkboxes should only be checked when SI/HI were actually assessed and denied that session — checking them reflexively risks documenting an assessment that didn't happen",
      "It's fine as long as the Response box also has free text",
    ],
    correctIdx: 1,
    explain: "Every checkbox in this section is a specific clinical claim. Checking it out of habit rather than because you actually assessed for it that session risks documenting something that didn't occur."
  },
];

function renderRiskQuiz(){
  buildQuiz('riskQuizCard', NOTE_RISK_QUIZ_ITEMS, ()=>noteMarkComplete('noterisk'));
}

/* ---- Full assembly ---- */
const NOTE_ASSEMBLY_BEATS = [
  `<p class="lede">One more session, no scaffolding this time. This session touches two different goals from two different sections — a completely normal thing to happen in one visit. Write both output boxes in full.</p>`,

  `<div class="scenario-box">
     <div class="who">Session — Danielle, Working off ITP (Reviewing)</div>
     Danielle's counselor met with her to review Objective 1A of Goal A in Section A (chronic pain / non-opioid coping). Danielle reported she used a breathing technique from physical therapy twice this week when pain-related cravings came up, and said it "actually helped a little." Her counselor marked this objective complete. The counselor then assigned Danielle Objective 1B of Goal B in Section B (Treatment Resistance) — reviewing the relapse prevention worksheet due at the next session, since Danielle admitted she still hadn't started it. No risk or safety concerns came up.
   </div>
   <textarea id="noteAssemblyAnswer" placeholder="Write both the Describe box and the Response box here..." style="min-height:180px;" oninput="document.getElementById('noteAssemblyRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="noteAssemblyRevealBtn" disabled onclick="noteRevealModel('noteassembly')">Reveal model answer</button>
   </div>
   <div class="reveal" id="noteassemblyReveal">
     <div class="card-label">Model answer</div>
     <div class="card-label" style="margin-top:6px; color:var(--green-700);">Describe Therapeutic Interventions Provided</div>
     <div class="model-answer">- This clinician met with client to review Objective 1A of Goal A of Section A.

- Client reported using a breathing technique introduced by physical therapy on two occasions this week when experiencing pain-related cravings.

- This clinician assigned client Objective 1B of Goal B of Section B from their ITP.</div>
     <div class="card-label" style="margin-top:14px; color:var(--green-700);">Response — Intervention/Progress/Clinical Judgement</div>
     <div class="model-answer">- Client completed Objective 1A of Goal A of Section A from their ITP.

- Client stated the technique "actually helped a little," and acknowledged she has not yet started the assigned relapse prevention worksheet tied to Objective 1B of Goal B of Section B.

- Client will work on Objective 1B of Goal B of Section B from their ITP due next week.

- No risk or safety concerns identified this session.</div>
     <ul class="checklist">
       <li>Two separate goals, from two separate sections, both referenced correctly by their own goal letter — nothing gets merged or confused between them</li>
       <li>The completed objective (1A of Goal A) generates a clean completion sentence, because the underlying evidence in the free text actually supports it</li>
       <li>The newly assigned objective (1B of Goal B) shows up in both boxes — described as assigned, then reflected as what's next — closing the loop for this session and opening it for the next one</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Check your understanding</div>
     <div class="quiz-card" id="noteAssemblyQuizCard"></div>
   </div>`,

  `<div class="callout"><strong>This is the whole point of the module:</strong> a plan that already existed, worked in real session time, with enough specific evidence that a reviewer could trace this exact note back through the ITP to the ASAM finding that started the whole thread.</div>
   <span class="badge-done" id="noteFinalBadge" style="display:none;">🎉 You've completed the Individual Notes module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="noteGoTo('notecheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span>, <span class="inline-link" onclick="noteGoTo('notemistakes')" role="link" tabindex="0">common mistakes recap</span>, and <span class="inline-link" onclick="noteGoTo('notefaq')" role="link" tabindex="0">FAQ</span> are built to be reopened anytime you're actually writing a note — not just read once during training.
   </div>
   <div class="callout" style="margin-top:16px;">
     <strong>Last stop:</strong> <span class="inline-link" onclick="openModule('view-conclusion')" role="link" tabindex="0">Case Walkthrough: Danielle</span> — Danielle's entire thread, from the first thing you learned about her cravings to the note you just wrote, all in one place.
   </div>`,
];
const NOTE_ASSEMBLY_FINAL = `<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
  <button class="btn" onclick="openModule('view-conclusion')">Next: Case Walkthrough: Danielle →</button>
  <button class="btn secondary" onclick="goHome()">← Back to Clinical Training home</button>
</div>`;

const NOTE_ASSEMBLY_QUIZ_ITEMS = [
  {
    q: "Why does Objective 1A of Goal A get marked complete in the Response box, while Objective 1B of Goal B only appears as something to work on next?",
    options: [
      "It's arbitrary — either could have been marked either way",
      "The free text actually supports completion for 1A (a technique was used, with real evidence), while 1B was only just assigned and hasn't been attempted yet",
      "Only one objective is allowed to be marked complete per note",
    ],
    correctIdx: 1,
    explain: "A completion claim needs real evidence behind it. 1A had it this session; 1B is brand new and couldn't possibly be complete yet."
  },
];

const NOTE_CHECK_ITEMS = {
  describe: [{
    q: "The auto-generated first bullet already says an objective was reviewed. Why does the free text still matter?",
    options: [
      "It doesn't — the auto-generated line is sufficient on its own",
      "The auto-generated line only proves the right objective was selected; the free text is the only place that proves something real actually happened toward it",
      "Free text is only required for Crisis Intervention notes",
    ],
    correctIdx: 1,
    explain: "The reference line is structural, not evidentiary. Without your free text, the note would say an objective was worked on without ever showing what that actually looked like."
  }],
  response: [{
    q: "Why does no completion sentence appear for an objective that was reviewed but not checked \"Completed\"?",
    options: [
      "It's a bug — every reviewed objective should show a completion sentence",
      "The tool only generates a completion claim when you've actually marked it complete, so the note doesn't overstate progress",
      "Completion sentences only apply to Crisis Intervention notes",
    ],
    correctIdx: 1,
    explain: "This is exactly the safeguard that keeps a note honest — it can't accidentally claim an objective is done just because it was mentioned."
  }],
  noteassembly: []
};

function noteRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
  if(NOTE_CHECK_ITEMS[id] && NOTE_CHECK_ITEMS[id].length){
    buildQuiz(id + 'CheckCard', NOTE_CHECK_ITEMS[id], ()=>noteMarkComplete(id === 'describe' ? 'notedescribe' : id === 'response' ? 'noteresponse' : id));
  }
  if(id === 'noteassembly'){
    buildQuiz('noteAssemblyQuizCard', NOTE_ASSEMBLY_QUIZ_ITEMS, ()=>noteMarkComplete('noteassembly'));
  }
}

/* =====================================================
   CONCLUSION MODULE CONTENT
   ===================================================== */

/* ---- Danielle's thread, start to finish ---- */
const CONCL_ARC_BEATS = [
  `<p class="lede">You've now been through the ASAM module, the Levels of Care module, the ITP module, and the Individual Notes module. Before calling this training done, let's see the whole thing in one place — not as four skills you picked up in four separate modules, but as one continuous, true story about one person.</p>`,

  `<div class="card">
     <div class="step-header"><span class="step-number">1</span><span class="step-title">What the ASAM identified</span></div>
     <div class="model-answer">Client reports nightly cravings, currently managed only through peer support available in the residential milieu. When asked directly to identify a coping response to a craving occurring without staff or peers present, client was unable to name one... Client's current craving management is structurally dependent on this level of care and has not yet transferred to an independent coping plan.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Dimension 5, Continued Stay — the problem: no independent coping plan, one identified risky contact, no alternative supports named.</p>
   </div>`,

  `<div class="card">
     <div class="step-header"><span class="step-number">2</span><span class="step-title">What the level of care review confirmed</span></div>
     <div style="font-weight:700; color:var(--green-800); font-size:13px; margin-bottom:10px;">Client: Danielle, 3.5 Residential, Continued Stay — Week 3</div>
     <p style="font-size:14.5px; margin-top:0;">Four of five domains were ready to step down toward 2.5. <strong>Support Systems</strong> was the domain that mattered most here: her previously identified using contact still lives two blocks from her planned discharge residence, and while she'd named two alternative contacts — her sister and a former sponsor — she hadn't yet had to actually call either one under real craving conditions.</p>
     <div class="model-answer">This week, client required staff mediation to resolve two separate peer conflicts and was unable to de-escalate or resolve either independently. Given that 2.5's evening hours provide no staff availability for this kind of real-time intervention, client has not yet demonstrated the independent conflict-resolution skills this level of care is structured to support. Continued residential placement at 3.5 is recommended to directly address this gap before considering a step-down.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">One weak domain (Social Skills) was enough on its own to keep her at 3.5 — but it's the same untested Support Systems gap that becomes the actual ASAM finding above, and the actual ITP goal below.</p>
   </div>`,

  `<div class="card">
     <div class="step-header"><span class="step-number">3</span><span class="step-title">What the ITP planned to do about it</span></div>
     <div class="card-label" style="color:var(--ink-soft); font-weight:600;">Section C — Dimensions 5 &amp; 6 · Goal A — Relapse Proneness <span style="font-weight:400; font-style:italic;">(already showing in DocAssist, not typed)</span></div>
     <div class="model-answer">Client stated, "I don't want to keep calling him just because I don't have anyone else."

Goal A: Client will develop coping skills to use during cravings occurring outside of program structure, reducing reliance on her previously identified using contact. (ESTABLISHED 7/24/2025)

Objective 1A: Client will identify two people, other than her previously identified using contact, that she can call when experiencing cravings. (START DATE 7/24/2025) (TARGET DATE 8/24/2025)

Intervention 1A: This clinician will use motivational interviewing to help client identify and commit to alternative support contacts.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Built from that exact finding, with her own words attached — nothing here could belong to any other client.</p>
   </div>`,

  `<div class="card">
     <div class="step-header"><span class="step-number">4</span><span class="step-title">What the Individual Note proved actually happened</span></div>
     <div class="card-label" style="margin-top:6px; color:var(--green-700);">Describe Therapeutic Interventions Provided</div>
     <div class="model-answer">- This clinician met with client to review Objective 1A of Goal A of Section C.

- Client was asked to identify support contacts other than her previously identified using contact.</div>
     <div class="card-label" style="margin-top:14px; color:var(--green-700);">Response — Intervention/Progress/Clinical Judgement</div>
     <div class="model-answer">- Client identified her sister and a former sponsor as two alternative contacts she is willing to reach out to during cravings.

- Client rated her confidence in following through as 6/10.

- No risk or safety concerns identified this session.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Traceable by name — "Objective 1A of Goal A" — straight back to Step 3, which traces straight back to the same gap Steps 1 and 2 both identified.</p>
   </div>`,

  `<h2>Same person, same truth, four shapes</h2>
   <p>Notice what didn't change across all four documents: the underlying clinical reality. What changed is the <em>job</em> each document does with that reality. The ASAM proved the problem was real and serious enough to justify this level of care. The level of care review is what actually decided — and justified, domain by domain — that 3.5 was still the right level to prove it at. The ITP turned that proof into a direction and a checkable step. The Note proved the step was actually being worked, with real evidence — a confidence rating, two named people, an honest "not yet completed."</p>
   <div class="callout">If a reviewer picked up only one of these four documents, they'd have an incomplete, arguable picture. Together, they can trace an unbroken line from "here's what's wrong," to "here's why this level of care," to "here's the plan," to "here's proof it's working" — which is the entire reason any of this documentation exists.</div>`,

  `<h2>Pulling it all together</h2>
   <div class="quiz-card" id="conclArcQuizCard"></div>`,
];
const CONCL_ARC_FINAL = `<button class="btn" onclick="conclusionMarkComplete('concl-arc'); conclGoTo('concl-monday')">Next: What changes now →</button>`;

const CONCL_ARC_QUIZ_ITEMS = [
  {
    q: "A reviewer wants to confirm Danielle still needs residential treatment for relapse risk specifically. Which single document gives them the clearest justification for that, on its own?",
    options: ["The Individual Note", "The ITP", "The ASAM"],
    correctIdx: 2,
    explain: "The ASAM is where the severity and clinical justification for the level of care actually lives. The ITP and Note matter, but they only make sense once the ASAM has established there's a real problem to plan around."
  },
  {
    q: "Four of Danielle's five ASAM domains were ready for a step-down to 2.5. Why did the review still recommend staying at 3.5?",
    options: [
      "It didn't — with four of five domains ready, a step-down was recommended",
      "One weak domain (Social Skills) was enough on its own, since 2.5 has no staff available in the evenings to catch what 3.5 currently catches",
      "All five domains have to be weighted equally and averaged before a decision can be made",
    ],
    correctIdx: 1,
    explain: "One weak domain is enough to hold a level of care, even with four strong ones — the question isn't an average, it's whether the specific gap left would actually be unsupported at the lower level."
  },
  {
    q: "A new counselor picks up Danielle's chart mid-treatment and wants to know: is this relapse-prevention plan actually working, or just written down? Which document answers that?",
    options: ["The ASAM", "The ITP", "The Individual Note"],
    correctIdx: 2,
    explain: "The ASAM and ITP describe the problem and the plan. Only the Individual Note documents whether real progress is actually happening, session by session."
  },
  {
    q: "Danielle's ITP goal is in Section C. Her Individual Note now references \"Objective 1A of Goal A of Section C.\" Why does including the section actually matter here?",
    options: [
      "It doesn't — Goal A always means the same thing everywhere",
      "Because letters reset per section, so without naming the section, \"Goal A\" alone could mean one of several different goals",
      "It's just a formatting preference with no real effect on tracing the note",
    ],
    correctIdx: 1,
    explain: "Letters reset at the start of every section, so a bare \"Goal A\" is genuinely ambiguous on its own. Naming the section is what makes the reference point to exactly one goal instead of possibly three."
  },
  {
    q: "Which of these is the accurate way to describe what changed, and what didn't, across all four documents about Danielle's relapse risk?",
    options: [
      "The underlying clinical truth changed each time, to fit each document's format",
      "The underlying clinical truth stayed the same; only the job each document does with it changed",
      "Nothing changed at all — the four documents are just copies of each other",
    ],
    correctIdx: 1,
    explain: "This is the core idea of the whole training. One real clinical picture, told four times, doing four different jobs — identify, justify the level of care, plan, prove — not four unrelated stories."
  },
];

function renderConclArcQuiz(){
  buildQuiz('conclArcQuizCard', CONCL_ARC_QUIZ_ITEMS, ()=>conclusionMarkComplete('concl-arc'));
}

/* ---- What actually changes now ---- */
const CONCL_MONDAY_BEATS = [
  `<p class="lede">Training ends here, but your next real session, ASAM, or note doesn't wait for a training module. Here's the short version of everything above, organized around the actual moment you'll be sitting down to write.</p>`,

  `<h3>Before you write an ASAM narrative...</h3>
   <ul class="checklist">
     <li>Ask: could this sentence describe any client, on any day? If yes, add the number, date, quote, or behavior that makes it theirs.</li>
     <li>Write in plain language first. Chase accuracy, not clinical-sounding vocabulary.</li>
     <li>You're not expected to already know the answer — you're licensed to exercise judgment. A defensible 2 beats a guessed 3.</li>
   </ul>`,

  `<h3>Before you determine or justify a level of care...</h3>
   <ul class="checklist">
     <li>Ask, domain by domain: is this specific area actually ready for the lower level, or not yet? One weak domain is enough to hold the higher level of care, even with four strong ones.</li>
     <li>Write the justification with the same three pieces every time: the specific dated evidence, what it means for unsupervised time, and what would need to change before it would support a step-down.</li>
     <li>The ASAM narrative is where this decision actually gets written into what a reviewer sees — the two documents aren't separate judgments, they're the same one, twice.</li>
   </ul>`,

  `<h3>Before you write an ITP goal...</h3>
   <ul class="checklist">
     <li>Ask: can I point to the exact ASAM sentence this goal answers? If not, it doesn't belong yet.</li>
     <li>Whether you start from the library or write it from scratch, edit it until it's true of this specific client — and don't submit without her own words attached.</li>
     <li>Keep the section and the letter together in your head. "Goal A" alone is not a complete reference.</li>
   </ul>`,

  `<h3>Before you write an Individual Note...</h3>
   <ul class="checklist">
     <li>Ask what's progress toward the objective, not what was discussed. A progress note isn't a therapy transcript — oversharing can end up subpoenaed and used against the client.</li>
     <li>Reference the exact objective, by goal letter and number — and remember you're the one who has to keep track of which section it's in.</li>
     <li>Let your free text carry the actual evidence. The auto-generated lines only prove you picked the right objective, not that anything real happened toward it.</li>
     <li>Never let the risk &amp; safety line default by accident. If something concerning happened, "Concerns present" and real detail are the only way that shows up.</li>
   </ul>`,

  `<h2>If this has felt mechanical until today</h2>
   <p>If you've been writing ASAMs, level of care reviews, ITPs, and Notes for a while already, the goal of this training was never to teach you new forms. It was to make the connections between the ones you already know visible — so that six-dimension narrative, that domain-by-domain level of care call, that goal-and-objective plan, and that session note stop feeling like four separate chores you get through, and start feeling like what they actually are: the same clinical judgment about the same person, written down four times, in four shapes that hold each other up.</p>
   <div class="callout">Once that clicks, the extra specificity this training keeps asking for stops feeling like busywork. It's not decoration on top of the real clinical work — it <em>is</em> the clinical work, made visible enough that someone else can trust it.</div>`,

  `<h2>One more time, the whole point</h2>
   <p>You didn't get into this work to fill out forms. You got into it to help people get somewhere better. Every specific sentence, every edited goal, every objective reference in a note — all of it exists for one reason: it's what lets your client stay in the room with you long enough for the actual work to matter. We can't help the client if we don't document. Now you know exactly how the documenting works.</p>
   <span class="badge-done" id="conclusionFinalBadge" style="display:none;">🎉 You've completed this training — nice work</span>`,

  `<h2>This isn't the only place to learn this</h2>
   <p>A training module can't cover every real case you'll actually sit with, and it isn't supposed to. If something still feels unclear, or a client in front of you doesn't fit neatly into anything covered here, that's a completely normal thing to run into — not a sign you missed something.</p>
   <ul class="checklist">
     <li>Bring it to your clinical supervisor — that's exactly what supervision is for</li>
     <li>Reach out to the Clinical Director directly if it's bigger than a supervision question</li>
     <li>Talk it through with a peer — someone else on staff has probably run into the same thing</li>
   </ul>
   <div class="callout">Asking for help isn't a sign you didn't learn this well enough. It's how documentation actually gets learned — one real, specific case at a time, with someone else to think it through with. We're here to support you.</div>`,

  `<div class="callout" style="margin-top:4px;"><strong>Keep the reference material close:</strong> every module's cheat sheet, mistakes recap, and FAQ are built to be reopened anytime you're actually writing — not just read once during training. And when you're ready to write for real: <a href="https://bretzfelder.com/docassist" target="_blank" rel="noopener">DocAssist</a>.</div>
   <div style="margin-top:18px;">
     <button class="btn" onclick="conclusionMarkComplete('concl-monday'); goHome()">← Back to Clinical Training home</button>
   </div>`,
];
const CONCL_MONDAY_FINAL = `<span style="font-size:13px; color:var(--ink-soft);">You've reached the end of Clinical Training. Thank you for taking this seriously.</span>`;

function conclMondayAfterRender(){
  const st = BEAT_REGISTRY['conclMondayBeats'];
  if(st && st.index === st.beats.length - 1){
    conclusionMarkComplete('concl-monday');
  }
}

/* =====================================================
   CO-OCCURRING DISORDERS MODULE
   ===================================================== */
const cocCHAPTERS = [
  {title:'Co-Occurring Disorders', sections:[
    {id:'coc-why', label:'Mental health isn\'t separate'},
    {id:'coc-scope', label:'What we treat, and when it\'s not ours'},
    {id:'coc-withdrawal', label:'Withdrawal vs. diagnosis'},
    {id:'coc-baseline', label:'Baseline and decompensation'},
    {id:'coc-si-reframe', label:'Suicidality: the reframe'},
    {id:'coc-si-response', label:'Suicidality: what you do'},
    {id:'coc-assembly', label:'Put it together: Danielle'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'coc-cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
  ]},
];
const cocSECTIONS = cocCHAPTERS.flatMap(c => c.sections);
const cocTRACKED_SECTIONS = cocSECTIONS.filter(s => s.trackProgress !== false);

let cocProgress = {};
try{ cocProgress = JSON.parse(localStorage.getItem('doctrain-coc-progress') || '{}'); }catch(e){ cocProgress = {}; }

function cocSaveProgress(){
  localStorage.setItem('doctrain-coc-progress', JSON.stringify(cocProgress));
  renderCOCNav();
}
function cocMarkComplete(id){
  cocProgress[id] = true;
  cocSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let cocCurrentSection = 'coc-why';
function renderCOCNav(){
  const navList = document.getElementById('navList-coc');
  navList.innerHTML = '';
  cocCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (cocCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>cocGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (cocProgress[s.id] ? ' done':'');
        check.textContent = cocProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = cocTRACKED_SECTIONS.filter(s=>cocProgress[s.id]).length;
  document.getElementById('progressLabel-coc').textContent = doneCount + ' of ' + cocTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-coc').style.width = (doneCount/cocTRACKED_SECTIONS.length*100) + '%';
  const cocFinalBadge = document.getElementById('cocFinalBadge');
  if(cocFinalBadge) cocFinalBadge.style.display = (doneCount === cocTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function cocGoTo(id){
  cocCurrentSection = id;
  document.querySelectorAll('#view-cooccurring section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderCOCNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-coc').onclick = ()=>{
  if(confirm('Reset all Co-Occurring Disorders module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-coc-progress');
    cocProgress = {};
    cocSaveProgress();
    ['cocWhyBeats','cocScopeBeats','cocWithdrawalBeats','cocBaselineBeats','cocSiReframeBeats','cocSiResponseBeats','cocAssemblyBeats'].forEach(resetBeats);
  }
};

/* ---- Generic decision exercise (reused across this module) ---- */
function cocRenderDecision(containerId, items, onDoneSectionId, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answered = 0;
  items.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    const optsHtml = item.options.map((opt,i)=>`<button class="pill-btn" data-val="${i}" data-idx="${idx}">${opt}</button>`).join('');
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.prompt}</div>
        <div class="classify-explain" id="${containerId}-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">${optsHtml}</div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = items[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const chosenVal = parseInt(btn.dataset.val, 10);
      const correct = chosenVal === item.correctIdx;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns[item.correctIdx].classList.add('chosen-correct');
      }
      document.getElementById(`${containerId}-explain-${idx}`).classList.add('show');
      answered++;
      if(answered === items.length){
        if(onDoneSectionId) cocMarkComplete(onDoneSectionId);
        if(onAllAnswered) onAllAnswered();
      }
    });
  });
}
function cocRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
}

/* ---- Why this module ---- */
const COC_WHY_BEATS = [
  `<p class="lede">If mental health comes up with a client and your stomach tightens a little — you're not alone, and this module exists to take that feeling apart. There's no test at the end designed to catch you out. The goal is simple: you should leave this feeling steadier around clients who present with mental health symptoms, not more anxious.</p>`,

  `<h3>The number that changes how you should think about this</h3>
   <p>The vast majority of the clients you'll work with here have a co-occurring mental health condition alongside their substance use — not a small subset, not an occasional complication. Depression, anxiety, trauma-related symptoms, and mood instability show up constantly alongside substance use, because for a lot of clients, the substance use started as an attempt to manage those very symptoms. If you're waiting for "the co-occurring client" to show up as a distinct, unusual case, you'll be waiting the wrong way — statistically, they're most of the caseload.</p>`,

  `<h3>"We don't treat mental health" is true and misleading at the same time</h3>
   <p>Woodhaven isn't a psychiatric hospital, and we're not running a separate mental health treatment track alongside substance use treatment. That part is true. But here's the part that gets lost: nearly everything you already do here — structure, routine, groups, coping skills, accountability, sleep and nutrition regulation, a client feeling heard — is also mental health treatment, whether or not anyone calls it that. <strong>We are almost always treating mental health. We just don't treat it as a separate problem with its own separate plan.</strong> It's woven into the substance use treatment, not bolted onto the side of it.</p>`,

  `<div class="callout"><strong>The one exception, previewed:</strong> there's exactly one condition under which mental health becomes something we don't address here — when it supersedes the substance use concern. That's the whole subject of the next section, and it's a narrower line than most staff assume.</div>`,

  `<h3>What's ahead</h3>
   <p>In order: where the line actually sits between "we work with this" and "this needs a different level of care," why withdrawal makes early diagnosis unreliable, what "baseline" means and why stability matters more than symptom-free, and then a full section on suicidality — including the exact steps behind our official policy, with a chance to practice your own response before you ever need it for real.</p>`,
];
const COC_WHY_FINAL = `<button class="btn" onclick="cocMarkComplete('coc-why'); cocGoTo('coc-scope')">Next: What we treat, and when it's not ours →</button>`;

/* ---- Scope: the supersedes threshold ---- */
const COC_SCOPE_BEATS = [
  `<p class="lede">This is the section most staff want most clearly answered: when does a client's mental health become something we can't work with here? The answer isn't a diagnosis list. It's a comparison.</p>`,

  `<h3>The rule</h3>
   <p>A client can have real, observable symptoms of a mental health condition — including a serious one — and still be appropriate for this level of care, as long as <strong>the substance use concern remains the bigger of the two problems.</strong> The moment that flips — the mental health symptoms become the dominant, driving concern, bigger than the substance use issue that brought them here — that's no longer something we address here. It becomes a level-of-care conversation.</p>
   <p>Notice what that rule does <em>not</em> say. It doesn't say "no symptoms allowed." It doesn't say "any signs of a serious diagnosis means immediate transfer." It says: which one is bigger, right now, for this client?</p>`,

  `<h3>What that looks like in practice</h3>
   <p>A client can show signs and symptoms consistent with a condition like schizophrenia — odd beliefs, disorganized thinking, a flattened affect — and still be someone we work with, as long as those symptoms aren't the more severe or more urgent concern compared to their substance use. If they can still engage, function within the structure, and their symptoms aren't escalating or driving unsafe behavior, that's not automatically a "this doesn't belong here" situation.</p>
   <p>What changes the answer is escalation or dominance — the symptoms become unmanageable within this setting, start driving behavior that isn't safe, or simply become the loudest, most urgent thing about the client's presentation, eclipsing the substance use work entirely. That's when it supersedes, and that's when it stops being ours to manage alone.</p>`,

  `<div class="callout"><strong>Always consult your supervisor when you're not sure which side of that line a client is on.</strong> This isn't a call you're expected to make solo, and getting a second set of eyes on a borderline case is exactly what the judgment call is supposed to look like — not a sign you don't know what you're doing.</div>`,

  `<h3>Try it: which side of the line?</h3>
   <p>For each client presentation below, decide whether it's something we continue working with here (monitoring, consulting as needed) or a presentation where mental health has superseded the substance use concern (a level-of-care conversation with your supervisor).</p>
   <div class="classify-card" id="cocScopeClassifyCard"></div>`,
];
const COC_SCOPE_FINAL = `<button class="btn" onclick="cocGoTo('coc-withdrawal')">Next: Withdrawal vs. diagnosis →</button>`;

const COC_SCOPE_ITEMS = [
  {
    prompt: "A client reports a long-standing history of mild depression, takes a stable prescribed medication for it, and is fully participating in groups and individual sessions. Their substance use is clearly the more urgent, active concern.",
    options: ["Continue working with them here", "Mental health has superseded — LOC conversation"],
    correctIdx: 0,
    explain: "Stable, managed symptoms that aren't the dominant concern, alongside full engagement, is exactly the profile of a client we continue working with — with ongoing monitoring, not escalation."
  },
  {
    prompt: "A client begins expressing paranoid beliefs about staff poisoning their food, refuses to eat, and can no longer be redirected into group. The paranoia is now the most urgent thing happening with this client.",
    options: ["Continue working with them here", "Mental health has superseded — LOC conversation"],
    correctIdx: 1,
    explain: "Once symptoms escalate to the point of driving unsafe behavior (refusing to eat) and becoming the dominant, most urgent concern — bigger than the substance use issue — that's the supersede line. This calls for an immediate supervisor consult about appropriateness of this level of care."
  },
  {
    prompt: "A client with generalized anxiety has a rough day, is visibly anxious in group, but still participates, still eats, still sleeps, and returns to baseline by evening.",
    options: ["Continue working with them here", "Mental health has superseded — LOC conversation"],
    correctIdx: 0,
    explain: "A hard day with visible symptoms isn't the same as decompensation or supersession. The client is still functioning and still engaging — that's well within what we continue to support here."
  },
  {
    prompt: "A client discloses passive suicidal thoughts during an individual session but denies any plan or intent, and remains engaged and safe for the rest of the day.",
    options: ["Continue working with them here", "Mental health has superseded — LOC conversation"],
    correctIdx: 0,
    explain: "This isn't automatically a supersede situation — it's a specific-response situation, covered in detail later in this module. Disclosure without escalating risk still gets worked with here, following the crisis protocol, not necessarily a level-of-care change."
  },
];

function cocRenderScope(){
  cocRenderDecision('cocScopeClassifyCard', COC_SCOPE_ITEMS, 'coc-scope');
}

/* ---- Withdrawal vs. diagnosis ---- */
const COC_WITHDRAWAL_BEATS = [
  `<p class="lede">Here's a fact that changes how you should read almost everything a client says or shows in their first days here: withdrawal can look a lot like a mental health disorder, even when it isn't one.</p>`,

  `<h3>What withdrawal can mimic</h3>
   <ul class="checklist">
     <li>Anxiety symptoms — racing thoughts, restlessness, panic-like physical sensations</li>
     <li>Depressive symptoms — flat affect, low energy, hopelessness, poor sleep and appetite</li>
     <li>Psychosis-like symptoms — disorganized thinking, irritability, occasionally perceptual disturbances</li>
     <li>Mood instability — swings that can look like a mood disorder over the course of a single day</li>
   </ul>
   <p>None of that means the client doesn't have a real underlying condition. It means you genuinely cannot tell, reliably, in the first days of withdrawal — and neither can anyone else on the team.</p>`,

  `<div class="callout"><strong>The practical rule:</strong> mental health cannot be adequately identified or diagnosed while a client is in early recovery, because withdrawal symptoms distort the picture too much. Document what you observe — specific behaviors, specific statements, specific dates — rather than a diagnostic conclusion about what it means. "Client appeared withdrawn and tearful, minimal engagement in group" is useful and accurate. "Client is depressed" is a conclusion you're not positioned to make yet, and it can follow the client through their chart in a way that's hard to walk back.</div>`,

  `<h3>The good news underneath this</h3>
   <p>Many symptoms that look alarming in week one clear up substantially on their own as the client stabilizes and the body finishes clearing whatever it was managing. That's not a reason to ignore what you're seeing — it's a reason to give it time before drawing conclusions, while still tracking and documenting it carefully. What matters is what's actually happening once that early window has passed.</p>`,

  `<h3>Quick check</h3>
   <div class="quiz-card" id="cocWithdrawalQuizCard"></div>`,
];
const COC_WITHDRAWAL_FINAL = `<button class="btn" onclick="cocMarkComplete('coc-withdrawal'); cocGoTo('coc-baseline')">Next: Baseline and decompensation →</button>`;

const COC_WITHDRAWAL_QUIZ_ITEMS = [
  {
    q: "A client is three days into withdrawal and shows flat affect, poor sleep, and says \"nothing matters anymore.\" What's the most clinically sound documentation approach right now?",
    options: [
      "Document a working diagnosis of major depressive disorder",
      "Document the specific observed behaviors and statements, without concluding a diagnosis this early",
      "Don't document any of it, since it's probably just withdrawal",
    ],
    correctIdx: 1,
    explain: "Withdrawal can produce this exact picture without an underlying mood disorder being present. Document what you actually observed — it's real and worth tracking — without committing to a diagnostic label this early."
  },
  {
    q: "Why does 'many symptoms clear up as the client stabilizes' matter for how you respond in the moment?",
    options: [
      "It means you should dismiss or minimize what the client is reporting",
      "It's a reason to keep tracking and supporting the client through it, rather than jumping straight to a diagnostic conclusion or a level-of-care decision based on day-one symptoms",
      "It means withdrawal symptoms are never something to take seriously",
    ],
    correctIdx: 1,
    explain: "The point isn't to ignore what you're seeing — it's to keep supporting the client and tracking what happens, rather than treating early, withdrawal-influenced symptoms as the final picture."
  },
];

function cocRenderWithdrawalQuiz(){
  buildQuiz('cocWithdrawalQuizCard', COC_WITHDRAWAL_QUIZ_ITEMS, ()=>cocMarkComplete('coc-withdrawal'));
}

/* ---- Baseline and decompensation ---- */
const COC_BASELINE_BEATS = [
  `<p class="lede">Once the acute withdrawal window has passed, the question changes. It's no longer "what does this symptom mean" — it's "what does normal look like for this specific client, and are they holding it?"</p>`,

  `<h3>Stability, not symptom-free</h3>
   <p>This is worth saying plainly, because it's easy to miss: the goal is not a client with zero symptoms. Recovery looks different for every client, and so do reasonable expectations for growth. A client with a long-standing, well-managed anxiety condition who is still anxious, but consistently at their own normal level, is doing exactly what we're hoping for. A baseline that includes some symptoms, held steady, is success — not a problem waiting to be solved.</p>`,

  `<h3>The functional question that actually matters</h3>
   <p>When you're checking in on how a client is doing, the most useful question isn't "are their symptoms gone" — it's <strong>can they engage in group and individual sessions, even on the most minor level?</strong> A client who's visibly struggling but still shows up, still says something in group, still sits through an individual session, is still working. That's the bar, and it's a lower bar than a lot of staff assume.</p>`,

  `<h3>What decompensation actually means</h3>
   <p>Decompensation is a real, meaningful drop below that established baseline — not a bad day, not a symptomatic day that still looks like their normal. It's when a client who could engage no longer can, when functioning that was previously stable starts genuinely breaking down. That's the trigger to reopen the conversation about whether this is still the right level of care for this client — and that conversation goes to your supervisor, not a decision you make solo in the moment.</p>`,

  `<h3>Try it: baseline or decompensation?</h3>
   <div class="classify-card" id="cocBaselineClassifyCard"></div>`,
];
const COC_BASELINE_FINAL = `<button class="btn" onclick="cocGoTo('coc-si-reframe')">Next: Suicidality — the reframe →</button>`;

const COC_BASELINE_ITEMS = [
  {
    prompt: "A client with a documented history of moderate depression continues to show low energy and flat affect, consistent with how they've presented since admission, but still attends every group and speaks briefly in check-ins.",
    options: ["Holding baseline — continue supporting", "Decompensating — re-evaluate appropriateness"],
    correctIdx: 0,
    explain: "This is the client's established normal, and they're still functionally engaging, even minimally. That's baseline, held — exactly what we're looking for, not a red flag."
  },
  {
    prompt: "A client who has reliably participated in groups for two weeks suddenly stops speaking entirely, refuses to leave their room for programming, and this has continued for three consecutive days.",
    options: ["Holding baseline — continue supporting", "Decompensating — re-evaluate appropriateness"],
    correctIdx: 1,
    explain: "This is a real, sustained drop from an established, functioning baseline — not a bad afternoon. This is exactly the kind of change that should prompt a supervisor conversation about whether this level of care still fits."
  },
  {
    prompt: "A client has an unusually hard, tearful day after a difficult phone call with family, but is back to their normal engagement level by the next morning.",
    options: ["Holding baseline — continue supporting", "Decompensating — re-evaluate appropriateness"],
    correctIdx: 0,
    explain: "A single hard day with a clear trigger, followed by a return to baseline, is a normal part of treatment — not decompensation. The question is whether the drop is sustained and represents a real break from their normal, not whether a hard day happened at all."
  },
];

function cocRenderBaseline(){
  cocRenderDecision('cocBaselineClassifyCard', COC_BASELINE_ITEMS, 'coc-baseline');
}

/* ---- Suicidality: the reframe ---- */
const COC_SI_REFRAME_BEATS = [
  `<p class="lede">Say the word "suicidal" in a shift report and watch what happens to the room. For a lot of staff, it's the single word most likely to trigger genuine panic. This section is about taking that panic apart, piece by piece — because panic is exactly the wrong response, and it's not the one the policy actually asks of you.</p>`,

  `<h3>It's not cause for panic. It's cause for a specific response.</h3>
   <p>Those are two different things, and mixing them up is where a lot of staff distress comes from. A specific response is calm, procedural, and something you already know how to start: you monitor the client, you contact your supervisor, and you make the necessary referral. That's it. That's the shape of it. The next section walks through exactly what that looks like — the point of this section is just to get your nervous system out of the way first.</p>`,

  `<h3>A client telling you is a good thing</h3>
   <p>This might be the single most important reframe in this whole module: <strong>a client expressing that they're suicidal is a good thing.</strong> It means they trust you enough, and feel safe enough, to say something most people never say out loud. A huge number of people who are struggling this way say nothing at all — which means there's no warning, and no chance to help before something happens. A disclosure is the opposite of a warning sign that things have gone wrong. It's an opening.</p>`,

  `<div class="callout"><strong>It's also not attention-seeking.</strong> However it's phrased, however calm or offhand it sounds, treat every disclosure as real and as an emergency requiring the specific response above — never as a bid for attention to be managed or minimized. Being an emergency and being cause for panic are still two different things; you can take it completely seriously without your voice or your face telegraphing alarm.</div>`,

  `<h3>Yes, it's okay to ask directly</h3>
   <p>Some staff worry that asking about suicide directly might put the idea in a client's head, or make things worse. It doesn't. Asking directly — "Are you having thoughts of hurting yourself?" — does not increase risk, and you don't need to couch it in softer language to make it safer. If anything, a direct question makes it easier and safer for a client to answer honestly, instead of guessing whether it's okay to say something this heavy out loud.</p>`,

  `<h3>Quick check</h3>
   <div class="quiz-card" id="cocSiReframeQuizCard"></div>`,
];
const COC_SI_REFRAME_FINAL = `<button class="btn" onclick="cocMarkComplete('coc-si-reframe'); cocGoTo('coc-si-response')">Next: What you actually do →</button>`;

const COC_SI_REFRAME_QUIZ_ITEMS = [
  {
    q: "A client casually mentions suicidal thoughts, and part of you wonders if they're just seeking attention. What's the right way to treat that disclosure?",
    options: [
      "Take it seriously and follow the specific response protocol regardless of how it was phrased",
      "Wait and see if they bring it up again before responding",
      "Gently point out that this seems like it might be for attention",
    ],
    correctIdx: 0,
    explain: "However a disclosure is phrased, it isn't attention-seeking, and it's never something to wait out or minimize. Every disclosure gets the same real response."
  },
  {
    q: "You're worried that asking a client directly about suicidal thoughts might make things worse. What does this module say about that?",
    options: [
      "Asking directly can plant the idea, so it's better to ask around it",
      "Asking directly doesn't increase risk, and you don't have to couch it — it's good and appropriate to ask plainly",
      "Only licensed clinicians are permitted to ever ask this question",
    ],
    correctIdx: 1,
    explain: "Asking directly doesn't increase risk. A direct, plain question makes it easier for a client to answer honestly than a euphemistic one does."
  },
];

function cocRenderSiReframeQuiz(){
  buildQuiz('cocSiReframeQuizCard', COC_SI_REFRAME_QUIZ_ITEMS, ()=>cocMarkComplete('coc-si-reframe'));
}

/* ---- Suicidality: what you actually do (+ hands-on practice, tied to policy) ---- */
const COC_SI_RESPONSE_BEATS = [
  `<p class="lede">"Monitor, contact your supervisor, make the necessary referral" isn't just a helpful summary — it's the shape of Woodhaven's actual official procedure, <strong>Handling a Client with Suicidal/Homicidal Ideation/Intent</strong>. This section walks through it at the level every staff member needs to know, and then you'll practice using it.</p>`,

  `<h3>Two categories, two different urgencies</h3>
   <ul class="checklist">
     <li><strong>Ideation:</strong> the client is having thoughts of harming themselves (or others), but reports no intention to act on them right now.</li>
     <li><strong>Intent:</strong> the client expresses that they are going to act — right now, in that moment. This is more urgent and moves faster.</li>
   </ul>
   <p>You don't have to be certain which one you're looking at before you act — both start the same way, and if you're unsure, ask directly and treat it with the greater urgency until someone with more training tells you otherwise.</p>`,

  `<h3>What's true no matter which category it is</h3>
   <ul class="checklist">
     <li>Do not leave the client alone — stay with them until they're in the presence of the staff member or clinician who will assess or assist them further. This includes accompanying them to the bathroom: staying in the room if there's a stall, or remaining just outside with the door cracked if there isn't.</li>
     <li>Do a warm handoff — when you bring in your supervisor or the clinical/medical staff member taking over, tell them what the client said, their demeanor, and anything else relevant, so they're not starting from zero.</li>
     <li>Contact your supervisor or the clinical/medical staff assigned to your area right away. This is never a judgment call you have to carry alone.</li>
   </ul>`,

  `<h3>Where the two paths differ</h3>
   <p><strong>Ideation:</strong> clinical staff completes a lethality assessment/suicide screener, and a safety plan if it's clinically appropriate. If there's any chance exclusionary criteria could apply, staff consult the Clinical Director or Clinical Supervisor to review the case together.</p>
   <p><strong>Intent:</strong> this moves immediately — clinical/medical staff or the supervisor on duty completes a crisis intervention and lethality assessment right away. If risk comes back severe, that can mean an outside referral for further assessment, or 911 if that resource isn't reachable. <strong>A safety plan is not written when intent is present</strong> — intent calls for a faster, higher level of response than a safety plan is built for.</p>
   <div class="callout"><strong>Always consult your supervisor with any uncertainty</strong> — about which category you're looking at, whether something counts as a disclosure at all, or what to do next. That instruction isn't a formality here; it's built into the actual procedure at nearly every step.</div>`,

  `<h3>Try it: draft your response</h3>
   <p>You're mid-session with a client. She quietly says, "Honestly, sometimes I think everyone would be better off without me." She doesn't say anything about a plan, and when you gently follow up, she says she wouldn't actually do anything — just that the thought shows up sometimes.</p>

   <h3>What your answer needs</h3>
   <ul class="checklist">
     <li>A calm, direct follow-up question that clarifies ideation vs. intent — asked plainly, not euphemistically</li>
     <li>What you'll say to her, in plain language, about what happens next (who you're looping in, and why — not vague reassurance)</li>
     <li>What you do physically — you don't leave her alone while this gets sorted out</li>
     <li>Who you contact, and that a warm handoff includes what she actually said and how she seemed</li>
   </ul>

   <div class="scenario-box">
     <div class="who">Session — individual check-in, mid-conversation</div>
     <div class="meta">Client statement: "Sometimes I think everyone would be better off without me." Denies plan or intent on follow-up.</div>
     <p style="margin:0;">Write out, in your own words, exactly what you'd say and do in the next five minutes — from your first response to her, through who you contact and what you tell them.</p>
   </div>
   <textarea id="cocSiResponseAnswer" placeholder="e.g. I'd stay calm and ask her directly whether she's had any thoughts of acting on this or a plan to hurt herself. I'd tell her..." style="min-height:160px;" oninput="document.getElementById('cocSiResponseRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="cocSiResponseRevealBtn" disabled onclick="cocRevealModel('cocSiResponse'); cocMarkComplete('coc-si-response')">Reveal model answer</button>
   </div>
   <div class="reveal" id="cocSiResponseReveal">
     <div class="card-label">One reasonable way to handle this</div>
     <div class="model-answer">"Can I ask you something directly? Are you having any thoughts of hurting yourself, or a plan to?"

[She says no plan, no intent — just the thought showing up sometimes.]

"Thank you for telling me that — I know that's not easy to say. I'm not going anywhere right now, and I do want to loop in [supervisor/clinical staff] so we can make sure you've got the right support around this. That's not a punishment, it's just what we do to take this seriously."

[Stay with her. Do not leave her alone, including if she needs the bathroom before the handoff happens.]

[Contact supervisor/clinical staff]: "She just told me, unprompted, that sometimes she thinks everyone would be better off without her. I asked directly and she denied any plan or intent. She seemed calm but a little embarrassed after saying it. I haven't left her alone."</div>
     <ul class="checklist">
       <li>The direct question isn't softened, and it isn't skipped — that's what actually clarifies ideation vs. intent instead of guessing</li>
       <li>What's said to the client is calm, honest, and doesn't overpromise — it names what happens next without turning it into a crisis performance</li>
       <li>She's never left alone, which matches the policy's requirement regardless of which category this turns out to be</li>
       <li>The handoff includes her exact words, her demeanor, and the fact that a direct follow-up was already done — exactly the information the next person needs to not start from zero</li>
       <li>This scenario reads as ideation, not intent — so a lethality assessment/suicide screener and, if clinically appropriate, a safety plan are next. This mirrors Woodhaven's official Crisis Intervention procedure — for the complete steps, required contacts, and documentation, see <strong>"Handling a Client with Suicidal/Homicidal Ideation/Intent."</strong> This module gives you the shape of it; the policy is the source of truth.</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="cocSiResponseQuizCard"></div>
   </div>`,
];
const COC_SI_RESPONSE_FINAL = `<button class="btn" onclick="cocGoTo('coc-assembly')">Next: Put it together — Danielle →</button>`;

const COC_SI_RESPONSE_QUIZ_ITEMS = [
  {
    q: "A client says she's going to hurt herself tonight and describes how. What category is this, and what changes?",
    options: [
      "Ideation — complete a safety plan and continue the session",
      "Intent — this moves immediately, with clinical/medical staff or the supervisor on duty involved right away, and no safety plan is written",
      "Neither — this only counts if she's already attempted something",
    ],
    correctIdx: 1,
    explain: "A stated plan to act, in that moment, is intent — not ideation. Intent moves faster and skips the safety plan entirely, since a safety plan isn't the right tool for this level of urgency."
  },
  {
    q: "A client discloses passive thoughts of self-harm, with no plan or intent. A staff member is unsure whether this needs anything more than 'keeping an eye on it.' What should they do?",
    options: [
      "Handle it informally and mention it later if it seems relevant",
      "Follow the procedure — stay with the client, contact a supervisor or clinical staff for the lethality assessment/safety plan process, and do a warm handoff",
      "Wait to see if the client brings it up again before doing anything",
    ],
    correctIdx: 1,
    explain: "Even ideation without intent starts the same procedural response — staying with the client, contacting supervisor/clinical staff, and a warm handoff. 'Keeping an eye on it' informally isn't the same as following the actual steps."
  },
];

function cocRenderSiResponseQuiz(){
  buildQuiz('cocSiResponseQuizCard', COC_SI_RESPONSE_QUIZ_ITEMS, ()=>cocMarkComplete('coc-si-response'));
}

/* ---- Final assembly: Danielle ---- */
const COC_ASSEMBLY_BEATS = [
  `<p class="lede">One more scenario, no checklist scaffolding this time — just you, applying everything from this module to a client you already know from the rest of this training.</p>`,

  `<div class="scenario-box">
     <div class="who">Danielle — individual session, week three</div>
     <div class="meta">Established baseline: engaged in groups, occasional low mood tied to family stress, no prior risk history noted.</div>
     <p style="margin:0;">Near the end of session, Danielle goes quiet and says, "Some nights I lie there thinking it would just be easier if I wasn't around anymore." When you ask her directly whether she's thought about how she'd do that, she pauses and says, "I have, actually. I've thought about it more than I probably should."</p>
   </div>`,

  `<h3>Work through it</h3>
   <p>Answer each question based on everything you've covered in this module.</p>
   <div class="classify-card" id="cocAssemblyClassifyCard"></div>`,

  `<div class="reveal" id="cocAssemblyOverallReveal">
     <div class="card-label">Putting the whole picture together</div>
     <div class="callout">This is what "specific response, not panic" actually looks like end to end: a direct question resolved ideation vs. intent, she was never left alone, a safety plan stayed on the table because intent wasn't present, and the handoff carried her exact words forward instead of a vague summary. Nothing here required Danielle's mental health to "supersede" her substance use treatment — she stays in the program, on a safety plan, with everyone around her now paying closer attention. That's the system working the way it's supposed to.</div>
   </div>`,

  `<h3>Bringing it all together</h3>
   <p>Step back for a second from Danielle specifically. Every piece of this module was building toward the same underlying skill: telling the difference between what's within your scope to hold, steadily, and what needs someone with more training or a different setting — without either panicking or minimizing.</p>
   <ul class="checklist">
     <li>Mental health isn't a separate caseload here — it's already woven into the substance use work you're doing, for the vast majority of the clients you'll see</li>
     <li>The scope question is a comparison, not a symptom checklist: does the substance use concern still outweigh the mental health concern, or has that flipped?</li>
     <li>Early recovery isn't a reliable diagnostic window — document what you observe, not a conclusion, and give withdrawal time to clear before drawing one</li>
     <li>The goal is a held baseline, not zero symptoms — and the functional question is simply whether a client can still engage, even minimally</li>
     <li>A disclosure of suicidal thoughts is an opening, not an alarm to panic over — stay calm, ask directly, and follow the specific response the policy lays out</li>
     <li>None of this is a judgment call you're expected to make alone — consulting your supervisor is built into the procedure at nearly every step, not a fallback for when you're unsure</li>
   </ul>
   <div class="callout"><strong>The thing to actually carry with you:</strong> almost every client walking through this door is bringing some mental health need along with their substance use, and you are already equipped to work with that — calmly, and mostly by doing exactly what you already do well. The rare cases that genuinely need something more are easier to recognize precisely because you're not treating every symptom as one of them.</div>
   <span class="badge-done" id="cocFinalBadge" style="display:none;">🎉 You've completed the Co-Occurring Disorders module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="cocGoTo('coc-cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span> is built to be reopened anytime you're actually facing one of these calls — not just read once during training. And for the full procedural detail behind the suicidality section, the official policy — <strong>"Handling a Client with Suicidal/Homicidal Ideation/Intent"</strong> — is always the source of truth over this module.</div>
   <div class="callout" style="margin-top:16px;">
     <strong>Where this connects:</strong> anything you observe or act on here — a symptom, a disclosure, a safety plan — still has to make it into the client's record. The <span class="inline-link" onclick="openModule('view-note')" role="link" tabindex="0">Individual Notes module</span> covers how a risk & safety line actually gets documented, session by session.
   </div>`,
];
const COC_ASSEMBLY_FINAL = `<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
  <button class="btn secondary" onclick="cocGoTo('coc-cheatsheet')">View quick reference cheat sheet</button>
  <button class="btn" onclick="goHome()">Finish: Back to Clinical Training →</button>
</div>`;

const COC_ASSEMBLY_ITEMS = [
  {
    prompt: "Based on what Danielle said, is this ideation or intent?",
    options: ["Ideation", "Intent"],
    correctIdx: 0,
    explain: "She's describing thoughts and some level of having considered a method — but she hasn't stated she's going to act, and there's no stated plan for right now. This reads as ideation, though it's serious enough to warrant a careful lethality assessment, not a casual one."
  },
  {
    prompt: "Do you leave her alone while you go find your supervisor or clinical staff?",
    options: ["No — stay with her until she's handed off", "Yes, briefly, since she seems calm"],
    correctIdx: 0,
    explain: "This rule doesn't bend based on how calm someone seems. She stays with you, or with the staff member taking over, the whole way through — no exceptions for a client who seems okay in the moment."
  },
  {
    prompt: "Is a safety plan written right now?",
    options: ["Possibly, if clinically appropriate — that determination belongs to clinical staff", "No, since intent is present"],
    correctIdx: 0,
    explain: "This is ideation, not intent, so a safety plan is on the table if clinical staff judges it clinically appropriate. Since intent isn't present here, the rule against writing one during intent doesn't apply — but the actual decision still belongs to clinical staff completing the assessment, not to you in the moment."
  },
  {
    prompt: "What do you say to your supervisor in the handoff?",
    options: [
      "Her exact words, that you asked directly and she confirmed thinking about a method, and how she seemed — then let the assessment take it from there",
      "Just that she seems a little down today",
    ],
    correctIdx: 0,
    explain: "A warm handoff means the next person isn't starting from zero — her exact statement, your direct follow-up question and her answer, and her demeanor. Understating it as 'a little down' would strip out exactly the information that determines urgency."
  },
];

function cocShowAssemblyOverall(){
  const el = document.getElementById('cocAssemblyOverallReveal');
  if(el) el.classList.add('show');
}
function cocRenderAssembly(){
  cocRenderDecision('cocAssemblyClassifyCard', COC_ASSEMBLY_ITEMS, 'coc-assembly', cocShowAssemblyOverall);
  renderCOCNav();
}

/* =====================================================
   MOTIVATIONAL INTERVIEWING MODULE
   ===================================================== */
const miCHAPTERS = [
  {title:'Motivational Interviewing', sections:[
    {id:'mi-why', label:'Motivation is what we treat'},
    {id:'mi-spirit', label:'What MI actually is'},
    {id:'mi-stages', label:'Stages of Change'},
    {id:'mi-oars', label:'OARS: the four skills'},
    {id:'mi-reflections', label:'Reflections, one level deeper'},
    {id:'mi-resistance', label:'Rolling with resistance'},
    {id:'mi-changetalk', label:'Listening for change talk'},
    {id:'mi-assembly', label:'Put it together: Danielle'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'mi-cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
  ]},
];
const miSECTIONS = miCHAPTERS.flatMap(c => c.sections);
const miTRACKED_SECTIONS = miSECTIONS.filter(s => s.trackProgress !== false);

let miProgress = {};
try{ miProgress = JSON.parse(localStorage.getItem('doctrain-mi-progress') || '{}'); }catch(e){ miProgress = {}; }

function miSaveProgress(){
  localStorage.setItem('doctrain-mi-progress', JSON.stringify(miProgress));
  renderMINav();
}
function miMarkComplete(id){
  miProgress[id] = true;
  miSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let miCurrentSection = 'mi-why';
function renderMINav(){
  const navList = document.getElementById('navList-mi');
  navList.innerHTML = '';
  miCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (miCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>miGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (miProgress[s.id] ? ' done':'');
        check.textContent = miProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = miTRACKED_SECTIONS.filter(s=>miProgress[s.id]).length;
  document.getElementById('progressLabel-mi').textContent = doneCount + ' of ' + miTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-mi').style.width = (doneCount/miTRACKED_SECTIONS.length*100) + '%';
  const miFinalBadge = document.getElementById('miFinalBadge');
  if(miFinalBadge) miFinalBadge.style.display = (doneCount === miTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function miGoTo(id){
  miCurrentSection = id;
  document.querySelectorAll('#view-mi section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderMINav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-mi').onclick = ()=>{
  if(confirm('Reset all Motivational Interviewing module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-mi-progress');
    miProgress = {};
    miSaveProgress();
    ['miWhyBeats','miSpiritBeats','miStagesBeats','miOarsBeats','miReflectionsBeats','miResistanceBeats','miChangetalkBeats','miAssemblyBeats'].forEach(resetBeats);
  }
};

/* ---- Generic decision exercise (reused, same pattern as cocRenderDecision) ---- */
function miRenderDecision(containerId, items, onDoneSectionId, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answered = 0;
  items.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    const optsHtml = item.options.map((opt,i)=>`<button class="pill-btn" data-val="${i}" data-idx="${idx}">${opt}</button>`).join('');
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.prompt}</div>
        <div class="classify-explain" id="${containerId}-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">${optsHtml}</div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = items[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const chosenVal = parseInt(btn.dataset.val, 10);
      const correct = chosenVal === item.correctIdx;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns[item.correctIdx].classList.add('chosen-correct');
      }
      document.getElementById(`${containerId}-explain-${idx}`).classList.add('show');
      answered++;
      if(answered === items.length){
        if(onDoneSectionId) miMarkComplete(onDoneSectionId);
        if(onAllAnswered) onAllAnswered();
      }
    });
  });
}
function miRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
}

/* ---- Why this module ---- */
const MI_WHY_BEATS = [
  `<p class="lede">Here's the thing almost nobody tells new staff plainly: at this level of care, motivation isn't a nice-to-have that supports the treatment. It <em>is</em> the treatment, for a huge portion of what you'll do here.</p>`,

  `<h3>Everything requires it, and most of it isn't optional</h3>
   <p>Think about how much motivation it actually takes for a client to end up sitting across from you, engaged in a session. They had to find enough motivation to make the phone call. To show up to admissions. To sit through an intake assessment while dope sick or barely holding it together. To walk onto the unit. To go to group instead of staying in bed. To say something true to their counselor instead of the version that sounds better. To stay one more day when leaving would be so much easier. None of that is automatic. Every single link in that chain runs on motivation, and motivation is not a steady, reliable fuel source — it's more like weather.</p>`,

  `<h3>It moves by the minute, not by the week</h3>
   <p>A client can wake up genuinely hopeful, telling you this is the day everything changes — and lose all of it in thirty minutes after a hard phone call, a craving that hits out of nowhere, or a roommate who says the wrong thing. That swing isn't a sign of a "bad client" or a client who "isn't ready." It's what early recovery actually looks like, for almost everyone. If your model of motivation is "they either want it or they don't," you will misread this constantly — and you'll miss the moments where a small intervention could have kept someone in the building.</p>`,

  `<div class="callout"><strong>This is why motivational interviewing isn't a specialty skill for a few staff — it's the core intervention here.</strong> You are not just periodically checking a client's motivation the way you'd check a vital sign. You are constantly working to protect it and grow it, in nearly every interaction, because it's the thing standing between a client staying in treatment and a client walking out the door.</p></div>`,

  `<h3>The emergency room, not the operating room</h3>
   <p>If you compare what we do here to a hospital, this level of care is the emergency room — not the specialty surgical floor, not long-term rehab. In the ER, the job is to control the bleeding and stabilize the patient enough that the deeper healing work becomes possible somewhere down the line. Nobody expects the ER to fix the underlying condition permanently in one visit. That's not a failure of the ER — it's not what the ER is for.</p>
   <p>The same is true here. Clients are arriving in crisis, often not by their own choice, often barely able to hold a thought together through withdrawal. The deep trauma work, the identity work, the long rebuild — that comes later, in other settings, once someone can actually engage with it. Your job right now is to control the bleeding: keep the client safe, keep them here, keep enough motivation alive that "later" becomes possible for them at all.</p>`,

  `<h3>What's ahead</h3>
   <p>This module covers what motivational interviewing actually is (and the common ways well-meaning staff accidentally work against it), the stages of change and why almost every client here starts in the earliest ones, the four core skills that make up nearly everything you'll do in session, and then real practice — including a full scenario with Danielle, where a client is ready to walk.</p>`,
];
const MI_WHY_FINAL = `<button class="btn" onclick="miMarkComplete('mi-why'); miGoTo('mi-spirit')">Next: What MI actually is →</button>`;

/* ---- The MI Spirit ---- */
const MI_SPIRIT_BEATS = [
  `<p class="lede">Before any technique, there's a stance — a way of being with a client — that has to come first. Get the stance wrong and the techniques below will backfire, sometimes badly. Get the stance right and even an imperfect technique tends to still work.</p>`,

  `<h3>What motivational interviewing is</h3>
   <p>Motivational interviewing, or MI, is a way of talking with someone that helps them find and strengthen their own reasons for changing — instead of you supplying the reasons for them. It was built specifically for people who feel two ways about change at once, which describes essentially every client you'll work with here. It isn't a trick, a script, or a way to talk someone into something they don't actually want. Used well, you can't really tell it's happening — it just feels like a conversation where the client did most of the realizing.</p>`,

  `<h3>The four pieces of the MI spirit — PACE</h3>
   <div class="thread-diagram">
     <div class="thread-box">
       <div class="thread-box-label">Partnership</div>
       <div class="thread-box-sub">Side by side, not top-down</div>
       <div class="thread-box-detail">You're not the expert fixing a broken person. You bring clinical knowledge; they bring expertise on their own life. Change happens in that collaboration, not from you dispensing answers.</div>
     </div>
     <div class="thread-arrow">+</div>
     <div class="thread-box">
       <div class="thread-box-label">Acceptance</div>
       <div class="thread-box-sub">Worth, empathy, autonomy, affirmation</div>
       <div class="thread-box-detail">The client has absolute worth regardless of where they are right now. You work to understand their world accurately. Their autonomy — including the right to not change yet — is real, not a formality.</div>
     </div>
     <div class="thread-arrow">+</div>
     <div class="thread-box">
       <div class="thread-box-label">Compassion</div>
       <div class="thread-box-sub">Their good, not your relief</div>
       <div class="thread-box-detail">Every choice you make in the room is meant to actively serve the client's wellbeing — not to make the conversation easier for you, or to make you feel like you did your job.</div>
     </div>
     <div class="thread-arrow">+</div>
     <div class="thread-box">
       <div class="thread-box-label">Evocation</div>
       <div class="thread-box-sub">Draw it out, don't install it</div>
       <div class="thread-box-detail">The motivation, the reasons, the values that could drive change already exist somewhere in this client. Your job is to draw them out into the open — not hand the client reasons of your own.</div>
     </div>
   </div>`,

  `<h3>The trap almost everyone falls into: the righting reflex</h3>
   <p>Here's the instinct that gets in the way more than any other, and it comes from a genuinely good place: when you see someone about to make a decision that's going to hurt them, every helping instinct in you wants to fix it. Warn them. Argue the other side. List the reasons this is a bad idea. That urge has a name — the <span class="term" onclick="this.classList.toggle('term-open')">righting reflex<span class="term-def">The instinct to correct, warn, or persuade someone the moment you sense they're heading toward a harmful choice. It's well-intentioned and it's also the single most common way MI goes wrong.</span></span> — and it is the single most common way well-meaning, caring staff accidentally work against themselves.</p>`,

  `<div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">The righting reflex</span>
       <p>Counselor: "You know using is going to cost you everything — your kids, your job, your freedom. Why would you even think about leaving right now?"

Client (internally): "You don't get it. Nobody gets it."</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">MI spirit</span>
       <p>Counselor: "Something's pulling you toward leaving today. Tell me what that's about."

Client: "I don't know... I guess I'm scared this isn't going to work anyway."</p>
     </div>
   </div>
   <p class="hero-note">Same client, same crisis moment. The first response makes the counselor the one arguing for change — which means the client, almost automatically, ends up defending the other side out loud. The second response keeps the client doing the talking, and the talking is where the actual movement happens.</p>`,

  `<h3>Why arguing for change backfires</h3>
   <p>When you argue for change, you put the client in the position of arguing against it — even if part of them agrees with you. People tend to believe what they hear themselves say more than what they hear someone else say. So every time you make the case for change instead of drawing it out of the client, you're handing the "against change" side of the argument to the one person in the room whose voice matters most. That's the whole mechanism behind almost every MI technique in this training: get the client talking in the direction of change, and get out of the way of them arguing against it.</p>`,

  `<h3>Quick check</h3>
   <div class="quiz-card" id="miSpiritQuizCard"></div>`,
];
const MI_SPIRIT_FINAL = `<button class="btn" onclick="miGoTo('mi-stages')">Next: Stages of Change →</button>`;

const MI_SPIRIT_QUIZ_ITEMS = [
  {
    q: "A client says she's thinking about signing out AMA. Your gut instinct is to immediately tell her all the reasons that would be a mistake. What does the MI spirit suggest instead?",
    options: [
      "List the risks clearly and firmly so she understands the stakes",
      "Get curious about what's behind the thought, and let her do most of the talking",
      "Agree it's her choice and drop the subject entirely",
    ],
    correctIdx: 1,
    explain: "Arguing the case for staying recruits her into arguing the case for leaving — out loud, to you. Getting curious keeps her talking, which is where the actual movement happens. This isn't the same as dropping the subject; it's engaging with it differently."
  },
  {
    q: "What does 'evocation' mean in the MI spirit?",
    options: [
      "Giving the client a compelling reason to change that they hadn't considered",
      "Drawing out motivations and reasons that already exist somewhere in the client, rather than supplying your own",
      "Evoking an emotional reaction to make the moment feel more serious",
    ],
    correctIdx: 1,
    explain: "Evocation assumes the reasons to change are already in there somewhere, even if buried under ambivalence. The work is drawing them out — not installing reasons of your own, however good those reasons are."
  },
];
function miRenderSpiritQuiz(){
  buildQuiz('miSpiritQuizCard', MI_SPIRIT_QUIZ_ITEMS, ()=>miMarkComplete('mi-spirit'));
}

/* ---- Stages of Change ---- */
const MI_STAGES_BEATS = [
  `<p class="lede">Nearly every misunderstanding staff have about "unmotivated" clients traces back to one thing: judging where a client is against the wrong yardstick. This section gives you the right one.</p>`,

  `<h3>The five stages</h3>
   <p>Change isn't a light switch — on or off, motivated or not. It's a process people move through, sometimes forward, sometimes backward, often more than once before it sticks. The stages of change model names five points along that path:</p>
   <div class="thread-diagram">
     <div class="thread-box">
       <div class="thread-box-label">Precontemplation</div>
       <div class="thread-box-sub">Not seeing it as a problem</div>
       <div class="thread-box-detail">No real intention to change in the foreseeable future. May not agree there's anything to change at all.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Contemplation</div>
       <div class="thread-box-sub">Genuinely torn</div>
       <div class="thread-box-detail">Aware there's a problem, weighing it against the upside of not changing. Can sit here a long time.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Preparation</div>
       <div class="thread-box-sub">Decided, not yet moving</div>
       <div class="thread-box-detail">Intends to act soon, may be taking small early steps, needs a concrete plan.</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Action</div>
       <div class="thread-box-sub">Actively doing the work</div>
       <div class="thread-box-detail">Visible behavior change is underway. This is what most people picture when they picture "recovery."</div>
     </div>
     <div class="thread-arrow">→</div>
     <div class="thread-box">
       <div class="thread-box-label">Maintenance</div>
       <div class="thread-box-sub">Sustaining it</div>
       <div class="thread-box-detail">Working to keep the change going and prevent a return to old patterns.</div>
     </div>
   </div>
   <div class="thread-loop">↩ Movement backward through these stages — sometimes all the way back to precontemplation — is a normal, expected part of most people's path, not a sign the model failed or the client failed.</div>`,

  `<div class="callout"><strong>Here's the piece that changes how you should read your caseload:</strong> almost nobody arrives at this level of care already in the action stage. Most clients walk in somewhere between precontemplation and contemplation — often pushed here by a court order, a family ultimatum, or a crisis, rather than by their own settled resolve. That's not a red flag. That's simply what admission to this level of care usually looks like.</div>`,

  `<h3>Why this matters for what you actually do</h3>
   <p>If you treat a precontemplative client like they're in the action stage — expecting insight, buy-in, and follow-through they haven't reached yet — you'll experience that as resistance, and the client will experience you as pushing. Matching your approach to the stage a client is actually in, instead of the stage you wish they were in, is one of the most practical skills in this whole training.</p>
   <ul class="checklist">
     <li><strong>Precontemplation:</strong> your job is to raise gentle doubt and stay curious — not to argue someone into agreement they're nowhere near ready for</li>
     <li><strong>Contemplation:</strong> your job is to help them explore both sides of their ambivalence honestly, including the real upsides of not changing, so the client — not you — tips the balance</li>
     <li><strong>Preparation:</strong> your job shifts to helping build a concrete, specific plan, since the decision is already largely made</li>
     <li><strong>Action and Maintenance:</strong> your job is support, reinforcement, and relapse planning — the "convince them" work is mostly behind you</li>
   </ul>`,

  `<h3>Try it: which stage?</h3>
   <p>Read each client statement and identify the stage it best reflects.</p>
   <div class="classify-card" id="miStagesClassifyCard"></div>`,
];
const MI_STAGES_FINAL = `<button class="btn" onclick="miMarkComplete('mi-stages'); miGoTo('mi-oars')">Next: OARS — the four core skills →</button>`;

const MI_STAGES_ITEMS = [
  {
    prompt: "\"I don't really have a problem. My wife's the one who's overreacting. I'm only here because she said she'd leave.\"",
    options: ["Precontemplation", "Contemplation", "Preparation"],
    correctIdx: 0,
    explain: "No acknowledgment of a problem, and the motivation to be here is entirely external. This is classic precontemplation — the work here is curiosity, not confrontation."
  },
  {
    prompt: "\"Part of me knows I need to stop. Part of me can't picture my life without it. Honestly I go back and forth on this ten times a day.\"",
    options: ["Precontemplation", "Contemplation", "Preparation"],
    correctIdx: 1,
    explain: "Genuine, active ambivalence — seeing both sides and sitting with the tension between them — is the defining feature of contemplation."
  },
  {
    prompt: "\"I know I want to get sober. I've been thinking about what I need to do when I leave here — find a sponsor, go to meetings. I just need to figure out the actual steps.\"",
    options: ["Contemplation", "Preparation", "Action"],
    correctIdx: 1,
    explain: "The decision is essentially made and the client is asking for a concrete plan. That combination — decided, not yet doing — is preparation."
  },
];
function miRenderStages(){
  miRenderDecision('miStagesClassifyCard', MI_STAGES_ITEMS, 'mi-stages');
}

/* ---- OARS ---- */
const MI_OARS_BEATS = [
  `<p class="lede">Almost everything you'll do in an MI-informed conversation is built from four core skills, known by the acronym OARS. None of them are complicated on their own. What makes them work is using them consistently, and leaning toward reflections more than questions.</p>`,

  `<h3>O — Open questions</h3>
   <p>An open question can't be answered with one word or a yes/no. It invites the client to actually think and elaborate, rather than just confirming or denying something you already said.</p>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Closed: "Are you worried about relapsing when you leave?"</div>
       <div class="break-card-body">Answerable in one word. Even a "yes" tells you almost nothing about what's actually on the client's mind.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Open: "What worries you most about leaving here?"</div>
       <div class="break-card-body">Requires the client to generate content, not just confirm yours. You'll almost always learn more from one open question than from five closed ones.</div>
     </div>
   </div>
   <p>Closed questions aren't forbidden — they're useful for pinning down a specific fact. The problem is a conversation made up mostly of closed questions, which starts to feel like an interrogation and puts the client in a passive, one-word-answer mode.</p>`,

  `<h3>A — Affirmations</h3>
   <p>An affirmation names something genuinely true about the client's strengths, efforts, or values — specific enough that it couldn't be said about just anyone. "You're doing great" is generic praise; it tends to slide right off. "You showed up to group today even after the call with your mom this morning — that took something" is specific enough to actually land, because it proves you were paying attention.</p>`,

  `<h3>R — Reflections</h3>
   <p>A reflection states back what you heard — not just the words, but a guess at the meaning underneath them. Reflections do more work in MI than any other skill, and get their own full section next. For now: a good reflection often sounds less like a question and more like a statement, even though it invites the client to correct you if you got it wrong. "It sounds like part of you is relieved to be here, and part of you is furious about it" is a reflection. "Are you relieved to be here?" is not — it's a closed question wearing a reflection's clothes.</p>`,

  `<h3>S — Summaries</h3>
   <p>A summary gathers up several things a client has said — sometimes across an entire session — and hands them back together. Summaries do two jobs at once: they show the client you've been tracking everything they've said, and they let you choose what to emphasize by what you include. A summary that pulls together every thread of change talk a client has offered, even scattered ones, can be more persuasive than anything you could say yourself — because it's entirely built from the client's own words.</p>`,

  `<h3>Try it: open or closed?</h3>
   <p>Sort each question below.</p>
   <div class="classify-card" id="miOarsClassifyCard"></div>`,
];
const MI_OARS_FINAL = `<button class="btn" onclick="miMarkComplete('mi-oars'); miGoTo('mi-reflections')">Next: Reflections, one level deeper →</button>`;

const MI_OARS_ITEMS = [
  {
    prompt: "\"Do you think you're ready to go back to group?\"",
    options: ["Open question", "Closed question"],
    correctIdx: 1,
    explain: "Answerable with a yes or no. It's a fine question to ask, but it's closed — it won't draw out much on its own."
  },
  {
    prompt: "\"What would it take for group to feel worth going back to?\"",
    options: ["Open question", "Closed question"],
    correctIdx: 0,
    explain: "There's no one-word answer available here — it requires the client to actually generate content and think it through."
  },
  {
    prompt: "\"Have you used in the last week?\"",
    options: ["Open question", "Closed question"],
    correctIdx: 1,
    explain: "This is closed by design, and that's appropriate — you're pinning down a specific fact, not exploring ambivalence. Not every closed question is a mistake."
  },
];
function miRenderOars(){
  miRenderDecision('miOarsClassifyCard', MI_OARS_ITEMS, 'mi-oars');
}

/* ---- Reflections, deeper ---- */
const MI_REFLECTIONS_BEATS = [
  `<p class="lede">Of the four OARS skills, reflections carry the most weight — and they're the one most staff underuse, usually because a good reflection can feel like it's not "doing" enough. It's doing more than it looks like.</p>`,

  `<h3>Simple vs. complex reflections</h3>
   <p>A <strong>simple reflection</strong> repeats or slightly rephrases what the client said, staying close to the surface. A <strong>complex reflection</strong> adds something — a guess at the feeling, the meaning, or the value underneath the words. Complex reflections take more of a risk, since you might guess wrong, but they move the conversation forward faster and show the client you're actually tracking with them, not just echoing.</p>
   <div class="card">
     <div class="step-header"><span class="step-number">1</span><span class="step-title">Client: "I don't know why I even bother coming to group. Nobody in there gets what I'm dealing with."</span></div>
     <div class="model-answer">Simple: "It feels pointless to go."

Complex: "It's lonely in there — like you're carrying something none of them would understand even if you said it out loud."</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Both are valid reflections. The complex version takes a guess at what's underneath "nobody gets it" — isolation — and offers it back. If the guess is wrong, the client will usually just correct it, which is fine and often useful too.</p>
   </div>`,

  `<h3>Double-sided reflections — naming both halves of ambivalence</h3>
   <p>Since almost every client here is carrying some version of "I want to and I don't want to" at the same time, one of the most useful reflection formats names both sides in a single sentence, usually joined with "and" rather than "but." <strong>Why "and," not "but":</strong> "but" tends to erase whatever came before it — the listener hears the first half as cancelled out. "And" lets both things stay true at once, which is exactly what ambivalence actually feels like from the inside.</p>
   <div class="card">
     <div class="step-header"><span class="step-number">2</span><span class="step-title">Client: "I want to get clean, but every time I think about actually staying stopped forever, I panic."</span></div>
     <div class="model-answer">"You want this for yourself, and the idea of forever feels like too much to hold onto right now."</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Notice neither half got dropped. The client doesn't have to pick a side to feel heard — which, counterintuitively, is often what finally lets them start leaning toward one.</p>
   </div>`,

  `<h3>Try it: write the reflection</h3>
   <p>Read the client statement, then write a reflection — your own words, aiming for complex rather than simple if you can.</p>

   <h3>What your answer needs</h3>
   <ul class="checklist">
     <li>A statement, not a question — even though it invites correction</li>
     <li>A guess at what's underneath the words, not just a rephrasing of them</li>
     <li>No advice, no reassurance, no "but" — just what you heard, handed back</li>
   </ul>

   <div class="scenario-box">
     <div class="who">Group check-in — client speaking during process group</div>
     <div class="meta">Day 9 of residential treatment</div>
     <p style="margin:0;">"Everyone keeps saying it gets easier. It doesn't feel easier. It feels like I traded one thing I couldn't stand for another thing I can't stand, and at least the first one worked."</p>
   </div>
   <textarea id="miReflectionsAnswer" placeholder="e.g. Right now this doesn't feel like progress — it feels like you gave up the one thing that actually worked, without anything real to replace it yet." style="min-height:120px;" oninput="document.getElementById('miReflectionsRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="miReflectionsRevealBtn" disabled onclick="miRevealModel('miReflections'); miMarkComplete('mi-reflections')">Reveal model answer</button>
   </div>
   <div class="reveal" id="miReflectionsReveal">
     <div class="card-label">One reasonable way to handle this</div>
     <div class="model-answer">"Right now, this feels like a worse deal — you gave up the thing that actually worked, and what you got in exchange doesn't feel like it's worked yet."</div>
     <ul class="checklist">
       <li>It's a statement, not "Do you feel like it's not working?" — which would have handed the client an easy one-word out</li>
       <li>It names the underlying logic of the complaint — a trade that feels like a loss — not just the surface words</li>
       <li>It resists the urge to reassure ("it really does get easier, I promise") — that would be the righting reflex, and it would have shut the client down instead of opening them up</li>
       <li>Leaving it there, without adding anything, is often the strongest move — it gives the client room to keep going, which is usually exactly what happens next</li>
     </ul>
   </div>`,
];
const MI_REFLECTIONS_FINAL = `<button class="btn" onclick="miGoTo('mi-resistance')">Next: Rolling with resistance →</button>`;

/* ---- Rolling with resistance ---- */
const MI_RESISTANCE_BEATS = [
  `<p class="lede">Every clinician here eventually sits across from a client who pushes back, shuts down, or flatly disagrees. What you do in that exact moment tends to decide whether the conversation opens back up or slams shut.</p>`,

  `<h3>What "resistance" actually is</h3>
   <p>Modern MI thinking treats what used to be called "resistance" less as a trait the client has and more as a signal about the conversation itself — often called <span class="term" onclick="this.classList.toggle('term-open')">discord<span class="term-def">Tension in the working relationship itself — the client pushing back against you specifically, as opposed to sustain talk, which is the client's own case for not changing.</span></span> when it's about the relationship, and <span class="term" onclick="this.classList.toggle('term-open')">sustain talk<span class="term-def">Anything the client says in favor of the status quo — the case for not changing. Normal, expected, and not a sign of failure.</span></span> when it's the client making the case for staying the same. Both are normal. Neither means you've failed, and neither means the client is unmotivated. Very often, resistance is actually a signal that you leaned too hard into the righting reflex a moment ago, and the client is pushing back against being pushed.</p>`,

  `<h3>Ways to roll with it, instead of fighting it</h3>
   <div class="mistake-grid">
     <div class="mistake-card">
       <div class="mistake-dim">Simple reflection</div>
       <div class="mistake-title">Just reflect it back</div>
       <div class="mistake-body">"You don't think this belongs here." Often, hearing their own pushback said back to them, calmly, takes the charge out of it.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Amplified reflection</div>
       <div class="mistake-title">Slightly overstate it</div>
       <div class="mistake-body">"You're saying none of this is helping at all." Overstated just enough that the client often walks it back themselves — into a more accurate, less extreme version.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Double-sided reflection</div>
       <div class="mistake-title">Name both sides</div>
       <div class="mistake-body">"Part of you is done with this conversation, and part of you is still sitting here talking to me about it." Names the resistance without ignoring that they're still engaged.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Shift the focus</div>
       <div class="mistake-title">Move off the stuck point</div>
       <div class="mistake-body">If a specific topic keeps triggering pushback, move to a related area where the client has more room to talk freely, and come back later.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Emphasize autonomy</div>
       <div class="mistake-title">Hand the choice back</div>
       <div class="mistake-body">"This is genuinely your call to make." Counterintuitively, explicitly acknowledging the client's right to choose often reduces the pushback, since there's nothing left to fight against.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Come alongside</div>
       <div class="mistake-title">Agree with a twist</div>
       <div class="mistake-body">"Maybe you're right — maybe this isn't for you." Said genuinely, not sarcastically, this can be disarming enough that the client starts arguing the other side, on their own.</div>
     </div>
   </div>
   <p style="font-size:13px; color:var(--ink-soft);">"Come alongside" is the one that takes the most practice to use well — it only works with genuine tone, real curiosity, and a relationship that can hold it. Used sarcastically, it does real damage. When in doubt, lean on the first three instead.</p>`,

  `<h3>What not to do</h3>
   <ul class="checklist">
     <li>Don't argue the other side — that's the righting reflex, and it's what usually created the resistance in the first place</li>
     <li>Don't confront the discrepancy head-on with facts and logic — that rarely lands as intended, and it usually reads as an attack</li>
     <li>Don't take it personally, and don't let your tone shift to frustrated or clipped — the client will feel that shift immediately, and it will escalate, not de-escalate</li>
   </ul>`,

  `<h3>Try it: respond without fighting it</h3>
   <p>A client crosses his arms and says, "You people keep telling me I have a problem. Maybe I just like to party. Did anyone consider that?"</p>

   <h3>What your answer needs</h3>
   <ul class="checklist">
     <li>No argument, no defending the treatment program, no listing evidence that he has a problem</li>
     <li>A reflection technique from this section — simple, amplified, double-sided, or come-alongside</li>
     <li>Tone that stays genuinely curious, not defensive</li>
   </ul>

   <div class="scenario-box">
     <div class="who">Individual session — client is visibly irritated</div>
     <div class="meta">Arms crossed, clipped tone, has been pushing back on the whole session so far</div>
     <p style="margin:0;">"You people keep telling me I have a problem. Maybe I just like to party. Did anyone consider that?"</p>
   </div>
   <textarea id="miResistanceAnswer" placeholder="e.g. Fair — maybe this is just about liking to party, and everyone around you is overreacting..." style="min-height:120px;" oninput="document.getElementById('miResistanceRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="miResistanceRevealBtn" disabled onclick="miRevealModel('miResistance'); miMarkComplete('mi-resistance')">Reveal model answer</button>
   </div>
   <div class="reveal" id="miResistanceReveal">
     <div class="card-label">One reasonable way to handle this</div>
     <div class="model-answer">"Maybe so. It sounds like you're tired of people deciding this is a problem before you've gotten to say your own piece about it."</div>
     <ul class="checklist">
       <li>"Maybe so" is a genuine come-alongside — it doesn't fight him, and it opens space instead of closing it</li>
       <li>The second half is a complex reflection aimed at what's likely underneath the pushback — not being heard — rather than the surface claim about partying</li>
       <li>There's no defense of the program, no evidence offered, nothing for him to push against</li>
       <li>This kind of response often gets a client talking again, sometimes toward the very thing they just pushed back on — but only if it's not the goal you're chasing in the moment</li>
     </ul>
     <div class="card-label" style="margin-top:18px;">Quick check</div>
     <div class="quiz-card" id="miResistanceQuizCard"></div>
   </div>`,
];
const MI_RESISTANCE_FINAL = `<button class="btn" onclick="miGoTo('mi-changetalk')">Next: Listening for change talk →</button>`;

const MI_RESISTANCE_QUIZ_ITEMS = [
  {
    q: "A client says, \"I'm not doing the workbook, it's stupid.\" What's the strongest first move, based on this section?",
    options: [
      "Explain why the workbook is clinically valuable so he understands its purpose",
      "Reflect what he said, possibly amplified or double-sided, rather than defending the assignment",
      "Tell him it's mandatory and he doesn't have a choice",
    ],
    correctIdx: 1,
    explain: "Defending the assignment invites him to keep arguing against it. A reflection keeps him talking without giving him something to push against — and often the pushback softens once it's just been heard."
  },
  {
    q: "What is 'coming alongside' meant to do?",
    options: [
      "Sarcastically point out the client is being unreasonable",
      "Genuinely agree with the client's stated position, in a way that sometimes leads them to argue the other side themselves",
      "Give up on the topic entirely and change the subject",
    ],
    correctIdx: 1,
    explain: "Done with genuine tone, coming alongside removes something to fight against — and it's not uncommon for the client to end up making the case for change themselves, since there's no one left arguing against them."
  },
];
function miRenderResistanceQuiz(){
  buildQuiz('miResistanceQuizCard', MI_RESISTANCE_QUIZ_ITEMS, ()=>miMarkComplete('mi-resistance'));
}

/* ---- Change talk ---- */
const MI_CHANGETALK_BEATS = [
  `<p class="lede">If everything so far in this module is about how to listen, this section is about what to listen <em>for</em>. Certain things a client says are worth noticing, reinforcing, and gently growing — because they predict actual change better than almost anything else you can measure.</p>`,

  `<h3>Change talk vs. sustain talk</h3>
   <p><span class="term" onclick="this.classList.toggle('term-open')">Change talk<span class="term-def">Anything a client says that favors movement toward change — desire, ability, reason, need, commitment, activation, or taking steps.</span></span> is anything the client says in favor of change. <span class="term" onclick="this.classList.toggle('term-open')">Sustain talk<span class="term-def">Anything a client says in favor of the status quo — the case for staying the same. Normal and expected, not a sign of failure.</span></span> is anything they say in favor of staying the same. Both show up constantly, often in the same sentence, and that's not a problem to solve — it's just what ambivalence sounds like out loud. Your job isn't to eliminate sustain talk. It's to notice change talk when it shows up, and gently grow more of it.</p>`,

  `<h3>DARN-CAT — the categories of change talk</h3>
   <p>Change talk isn't all the same strength. Researchers group it into two tiers: preparatory language, which leans toward change but hasn't committed yet, and mobilizing language, which is much closer to action.</p>
   <div class="cheat-grid">
     <div class="cheat-item"><strong>Desire</strong> — "I want to stop." / "I wish things were different."</div>
     <div class="cheat-item"><strong>Ability</strong> — "I could probably do this." / "I know I'm capable of it."</div>
     <div class="cheat-item"><strong>Reason</strong> — "My kids deserve better than this." / "I'm tired of losing jobs over it."</div>
     <div class="cheat-item"><strong>Need</strong> — "I have to change or I'm going to die." / "Something has to give."</div>
   </div>
   <p style="font-size:13px; color:var(--ink-soft); margin-top:-4px;">Desire, Ability, Reason, and Need (DARN) are preparatory — real movement, not yet a commitment.</p>
   <div class="cheat-grid">
     <div class="cheat-item"><strong>Commitment</strong> — "I'm going to call my sponsor tonight."</div>
     <div class="cheat-item"><strong>Activation</strong> — "I'm ready to start." / "I'm willing to try."</div>
     <div class="cheat-item"><strong>Taking Steps</strong> — "I already threw out the number." / "I called and made the appointment."</div>
   </div>
   <p style="font-size:13px; color:var(--ink-soft); margin-top:-4px;">Commitment, Activation, and Taking Steps (CAT) are mobilizing — this is where intention turns into motion.</p>`,

  `<h3>How to grow it once you hear it</h3>
   <ul class="checklist">
     <li><strong>Ask an open question that points at it:</strong> "You said part of you is tired of this — say more about that."</li>
     <li><strong>Reflect it back, so it stays in the room:</strong> "So even with everything else going on, you called and made that appointment."</li>
     <li><strong>Affirm it:</strong> naming the change talk as a strength reinforces it without lecturing.</li>
     <li><strong>Summarize it later:</strong> collecting scattered pieces of change talk into one summary — sometimes minutes or even a full session later — can be more powerful than any single reflection.</li>
   </ul>
   <div class="callout"><strong>What not to do:</strong> pounce on the first hint of change talk with excitement or relief. A client who feels like their ambivalence just got graded will often backpedal immediately, just to restore the balance. Stay steady — curious, not thrilled.</div>`,

  `<h3>Try it: spot the change talk</h3>
   <p>For each client statement, decide whether it's change talk, sustain talk, or a mix of both — and if it's change talk, roughly which category.</p>
   <div class="classify-card" id="miChangetalkClassifyCard"></div>`,
];
const MI_CHANGETALK_FINAL = `<button class="btn" onclick="miMarkComplete('mi-changetalk'); miGoTo('mi-assembly')">Next: Put it together — Danielle →</button>`;

const MI_CHANGETALK_ITEMS = [
  {
    prompt: "\"I don't know, I guess a part of me is just tired of waking up sick every day. I'm so tired of it.\"",
    options: ["Change talk — Desire/Reason", "Sustain talk", "Neither"],
    correctIdx: 0,
    explain: "Being 'tired of' the current situation is change talk — leaning toward Desire and Reason at once. It's tentative (\"I guess\"), but it's real movement worth reflecting back."
  },
  {
    prompt: "\"Honestly, using is the only thing that's ever actually worked for my anxiety. Nothing else has come close.\"",
    options: ["Change talk", "Sustain talk", "Neither"],
    correctIdx: 1,
    explain: "This is the case for staying the same — sustain talk. It's normal, and it's worth understanding rather than arguing against; it often points to an unmet need (anxiety management) that a good plan will need to address."
  },
  {
    prompt: "\"I already called my old sponsor this morning and asked if he'd take me back on.\"",
    options: ["Change talk — Commitment/Activation", "Change talk — Taking Steps", "Sustain talk"],
    correctIdx: 1,
    explain: "An action already completed is Taking Steps — the strongest, most mobilizing category of change talk there is. This is exactly the kind of statement worth reflecting and affirming."
  },
];
function miRenderChangetalk(){
  miRenderDecision('miChangetalkClassifyCard', MI_CHANGETALK_ITEMS, 'mi-changetalk');
}

/* ---- Final assembly: Danielle wants to leave ---- */
const MI_ASSEMBLY_BEATS = [
  `<p class="lede">One full scenario, pulling together the spirit, the stages, OARS, rolling with resistance, and change talk — with a client you already know from the rest of this training.</p>`,

  `<div class="scenario-box">
     <div class="who">Danielle — day 6, unscheduled check-in you requested</div>
     <div class="meta">Staff reported Danielle told a peer this morning she's "probably signing herself out today."</div>
     <p style="margin:0;">You find her in the day room. She won't quite meet your eyes. "I already made up my mind. This isn't working, and I've got things I need to handle at home anyway. I appreciate what you're all trying to do, but I'm good."</p>
   </div>`,

  `<h3>Work through it</h3>
   <p>Answer each question based on everything you've covered in this module.</p>
   <div class="classify-card" id="miAssemblyClassifyCard"></div>`,

  `<div class="reveal" id="miAssemblyOverallReveal">
     <div class="card-label">Putting the whole picture together</div>
     <div class="callout">Notice what didn't happen anywhere in this: no lecture about the risks of leaving, no list of reasons to stay, no argument. The entire response was built from curiosity and reflection — which is exactly what kept Danielle talking instead of walking out the door mid-conversation. Whether she ultimately stays or goes, this is what "controlling the bleeding" actually looks like in the moment: not a persuasive speech, but staying in the conversation with her long enough for her own reasons to surface.</div>
   </div>`,

  `<h3>Bringing it all together</h3>
   <p>Step back from Danielle specifically for a second. Everything in this module was building toward one underlying skill: staying in the room with a client's ambivalence instead of trying to resolve it for them.</p>
   <ul class="checklist">
     <li>Motivation isn't fixed and isn't optional to attend to — it's the thing you're actively protecting in nearly every interaction, because it's what keeps a client here long enough for anything else to matter</li>
     <li>The MI spirit — partnership, acceptance, compassion, evocation — is the stance everything else sits on top of. Without it, the techniques can do real damage</li>
     <li>Almost every client arrives in precontemplation or contemplation, not action — meet them there instead of expecting a stage they haven't reached</li>
     <li>OARS — open questions, affirmations, reflections, summaries — is most of what an MI-informed conversation is actually made of</li>
     <li>Resistance is a signal, not a verdict on the client. Roll with it instead of arguing against it, and it usually softens on its own</li>
     <li>Change talk predicts real movement. Notice it, reflect it, and let the client keep arguing their own case for change — don't argue it for them</li>
   </ul>
   <div class="callout"><strong>The thing to actually carry with you:</strong> you are not responsible for making a client want to change. You're responsible for staying curious, staying steady, and giving their own reasons room to surface — today, and again tomorrow, since motivation resets constantly and this work rarely finishes in one conversation.</div>
   <span class="badge-done" id="miFinalBadge" style="display:none;">🎉 You've completed the Motivational Interviewing module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="miGoTo('mi-cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span> is built to be reopened before a hard conversation, not just read once during training.
   </div>
   <div class="callout" style="margin-top:16px;">
     <strong>Where this connects:</strong> when you use an MI technique in session — a reflection, rolling with resistance, evoking change talk — that belongs in the "Describe Therapeutic Interventions Provided" box of the Individual Note. The <span class="inline-link" onclick="openModule('view-note')" role="link" tabindex="0">Individual Notes module</span> covers how to write that up.
   </div>`,
];
const MI_ASSEMBLY_FINAL = `<button class="btn" onclick="miGoTo('mi-cheatsheet')">View quick reference cheat sheet</button>
  <button class="btn" onclick="goHome()" style="margin-left:12px;">Finish: Back to Clinical Training →</button>`;

const MI_ASSEMBLY_ITEMS = [
  {
    prompt: "What stage of change does Danielle's opening statement sound like?",
    options: ["Precontemplation — doesn't see a problem", "Contemplation, likely tipping toward sustain talk in this moment", "Action — she's already decided and moving"],
    correctIdx: 1,
    explain: "She's not denying there's something to work on ('what you're all trying to do') — she's leaning toward the sustain-talk side of her own ambivalence right now. Treating this as settled, immovable action-stage resolve would be a misread."
  },
  {
    prompt: "What's the strongest first response?",
    options: [
      "\"Danielle, leaving now would be a huge mistake — think about everything you'd be walking away from.\"",
      "\"Sounds like you've thought this through. What's the 'things at home' piece about?\"",
      "\"You can't sign out today, we need to talk to your counselor first.\"",
    ],
    correctIdx: 1,
    explain: "The first option is the righting reflex, and it would likely recruit her straight into defending her decision to leave. The third asserts control she may not actually be able to be denied, and skips curiosity entirely. The second stays curious and open, and follows a thread she introduced herself."
  },
  {
    prompt: "She says, \"I appreciate what you're all trying to do.\" What's the strongest way to use that?",
    options: [
      "Ignore it and refocus on the risk of leaving",
      "Reflect and gently grow it — it's a small piece of change talk worth not letting slide by",
      "Point out that appreciating the program contradicts her decision to leave, to confront the inconsistency",
    ],
    correctIdx: 1,
    explain: "\"I appreciate what you're trying to do\" is a small, real piece of something — possibly Desire or Reason. Naming it (\"Something about being here is landing, even with everything else pulling you toward leaving\") keeps it alive instead of letting it pass unnoticed. Confronting the inconsistency directly risks triggering discord instead."
  },
  {
    prompt: "If Danielle still decides to leave after this conversation, was the conversation a failure?",
    options: ["Yes — the goal was to get her to stay, and that didn't happen", "No — staying in the conversation with genuine curiosity, without fighting her, was the work, regardless of the outcome today"],
    correctIdx: 1,
    explain: "MI isn't a persuasion technique with a guaranteed outcome — it's a way of staying connected to a client through ambivalence. Even if she leaves today, a conversation that didn't damage the relationship leaves the door open in a way an argument wouldn't have."
  },
];

function miShowAssemblyOverall(){
  const el = document.getElementById('miAssemblyOverallReveal');
  if(el) el.classList.add('show');
}
function miRenderAssembly(){
  miRenderDecision('miAssemblyClassifyCard', MI_ASSEMBLY_ITEMS, 'mi-assembly', miShowAssemblyOverall);
  renderMINav();
}

/* =====================================================
   GROUP FACILITATION SKILLS MODULE
   ===================================================== */
const groupCHAPTERS = [
  {title:'Group Facilitation Skills', sections:[
    {id:'gr-why', label:'The magic in the room'},
    {id:'gr-types', label:'Two kinds of group'},
    {id:'gr-workinggroup', label:'The working group'},
    {id:'gr-skills', label:'The facilitator toolkit'},
    {id:'gr-blocking', label:'Blocking'},
    {id:'gr-topics', label:'Choosing and running a topic'},
    {id:'gr-difficult', label:'Difficult dynamics'},
    {id:'gr-assembly', label:'Put it together: Danielle'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'gr-cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
  ]},
];
const groupSECTIONS = groupCHAPTERS.flatMap(c => c.sections);
const groupTRACKED_SECTIONS = groupSECTIONS.filter(s => s.trackProgress !== false);

let groupProgress = {};
try{ groupProgress = JSON.parse(localStorage.getItem('doctrain-group-progress') || '{}'); }catch(e){ groupProgress = {}; }

function groupSaveProgress(){
  localStorage.setItem('doctrain-group-progress', JSON.stringify(groupProgress));
  renderGroupNav();
}
function grMarkComplete(id){
  groupProgress[id] = true;
  groupSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let groupCurrentSection = 'gr-why';
function renderGroupNav(){
  const navList = document.getElementById('navList-group');
  navList.innerHTML = '';
  groupCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (groupCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>grGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (groupProgress[s.id] ? ' done':'');
        check.textContent = groupProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = groupTRACKED_SECTIONS.filter(s=>groupProgress[s.id]).length;
  document.getElementById('progressLabel-group').textContent = doneCount + ' of ' + groupTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-group').style.width = (doneCount/groupTRACKED_SECTIONS.length*100) + '%';
  const groupFinalBadge = document.getElementById('groupFinalBadge');
  if(groupFinalBadge) groupFinalBadge.style.display = (doneCount === groupTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function grGoTo(id){
  groupCurrentSection = id;
  document.querySelectorAll('#view-group section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderGroupNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-group').onclick = ()=>{
  if(confirm('Reset all Group Facilitation Skills module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-group-progress');
    groupProgress = {};
    groupSaveProgress();
    ['grWhyBeats','grTypesBeats','grWorkingGroupBeats','grSkillsBeats','grBlockingBeats','grTopicsBeats','grDifficultBeats','grAssemblyBeats'].forEach(resetBeats);
  }
};

/* ---- Generic decision exercise (reused, same pattern as cocRenderDecision/miRenderDecision) ---- */
function grRenderDecision(containerId, items, onDoneSectionId, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answered = 0;
  items.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    const optsHtml = item.options.map((opt,i)=>`<button class="pill-btn" data-val="${i}" data-idx="${idx}">${opt}</button>`).join('');
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.prompt}</div>
        <div class="classify-explain" id="${containerId}-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">${optsHtml}</div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = items[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const chosenVal = parseInt(btn.dataset.val, 10);
      const correct = chosenVal === item.correctIdx;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns[item.correctIdx].classList.add('chosen-correct');
      }
      document.getElementById(`${containerId}-explain-${idx}`).classList.add('show');
      answered++;
      if(answered === items.length){
        if(onDoneSectionId) grMarkComplete(onDoneSectionId);
        if(onAllAnswered) onAllAnswered();
      }
    });
  });
}
function grRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
}

/* ---- Why this module ---- */
const GR_WHY_BEATS = [
  `<p class="lede">If you've ever walked out of a group and felt like something real just happened in that room — not because of anything you said, but because of what the clients gave each other — you already know the thing this whole module is trying to protect and grow on purpose.</p>`,

  `<h3>The magic has a name: the working group</h3>
   <p>Group theory has a term for it: a <span class="term" onclick="this.classList.toggle('term-open')">working group<span class="term-def">A group that is genuinely on-task — present, turned toward each other and the material, doing the actual work of the group — as opposed to one that has drifted into avoidance, dependency, or distraction.</span></span>. When a group is working, something happens that individual sessions can't fully replicate: a client says the thing they've been too ashamed to say anywhere else, and instead of judgment, three other people nod, because they've thought the exact same thing. That moment — being known, and not rejected for it — is close to the center of what actually treats addiction. It's not a side benefit of group. For a lot of clients, it's the whole reason group works at all.</p>`,

  `<h3>Why this matters clinically, not just warmly</h3>
   <p>Addiction thrives in isolation. Substance use disorder research consistently points to social connection and belonging as some of the strongest protective factors against relapse — and conversely, disconnection and isolation as some of the strongest risk factors for it. This isn't just intuition. Frameworks like the "social cure" literature in recovery, and decades of mutual-aid research behind programs like AA and NA, point the same direction: recovery that survives outside of treatment tends to be recovery that's socially embedded, not recovery a person is carrying alone. Group is where we deliberately build that muscle, starting on day one, inside these walls.</p>`,

  `<div class="callout"><strong>Put simply:</strong> a person can know every fact about their addiction and still relapse in isolation. Group gives clients something a fact never can — the direct, felt experience of being less alone than they thought, from people who don't need it explained to them.</p></div>`,

  `<h3>It doesn't happen automatically</h3>
   <p>Here's the part that makes this a skill, not just a hope: a room full of people in early recovery doesn't automatically become a working group. Left alone, groups drift — toward silence, toward one person absorbing all the airtime, toward surface-level chatter that never actually touches anything real. The difference between a group that changes people and a group that just passes the time is, more often than not, the facilitator. That's what the rest of this module is about — not making the magic happen through force, but building the conditions where it's far more likely to.</p>`,

  `<h3>What's ahead</h3>
   <p>The two kinds of groups we run and what each is actually for, the concept of the working group and the specific ways a group can slip out of it, the core toolkit of facilitation skills, a deep dive on blocking, how to choose and run a topic, and then real practice with the difficult moments — the monopolizer, the silent room, the side conversation, the conflict that flares up mid-share.</p>`,
];
const GR_WHY_FINAL = `<button class="btn" onclick="grMarkComplete('gr-why'); grGoTo('gr-types')">Next: Two kinds of group →</button>`;

/* ---- Two kinds of group ---- */
const GR_TYPES_BEATS = [
  `<p class="lede">"Group" isn't one thing here — we run two distinct types, and confusing their purpose is one of the fastest ways to accidentally run a weaker version of both.</p>`,

  `<div class="thread-diagram">
     <div class="thread-box">
       <div class="thread-box-label">Process Group</div>
       <div class="thread-box-sub">Processes the present</div>
       <div class="thread-box-detail">Focused on what clients are feeling and going through right now, at this stage of their recovery. Sharing lets members relate their current struggle to someone else's, and realize they're not the only one carrying it.</div>
     </div>
     <div class="thread-arrow">≠</div>
     <div class="thread-box">
       <div class="thread-box-label">Recovery Support Group</div>
       <div class="thread-box-sub">Builds skills and knowledge</div>
       <div class="thread-box-detail">More structured and psychoeducational — teaching concepts, coping tools, and recovery content that clients can carry with them, with more of an explicit curriculum than a process group has.</div>
     </div>
   </div>`,

  `<h3>Process groups, in more depth</h3>
   <p>A process group isn't about teaching a concept — it's about creating room for clients to say what's actually happening for them right now, and have that met by peers instead of silence. The facilitator's job is less "deliver content" and more "create and protect the conditions" for honest sharing to happen safely. A good process group can cover almost any emotional terrain a client brings in that day — a hard phone call, a craving, guilt about their family, fear about leaving — because the content isn't scripted in advance the way it is in a recovery support group. The structure is in how it's facilitated, not in a lesson plan.</p>`,

  `<h3>Why the distinction actually matters</h3>
   <p>If you run a process group like a lecture, you'll get compliance instead of disclosure — clients will nod along instead of actually processing anything. If you run a recovery support group like an open process space, you'll run out of time to cover the material clients actually need, and structure that some clients rely on will feel like it's missing. Knowing which room you're in changes what "a good group" even looks like.</p>`,

  `<h3>Try it: which type, and why?</h3>
   <div class="classify-card" id="grTypesClassifyCard"></div>`,
];
const GR_TYPES_FINAL = `<button class="btn" onclick="grGoTo('gr-workinggroup')">Next: The working group →</button>`;

const GR_TYPES_ITEMS = [
  {
    prompt: "A group where the facilitator teaches the stages of relapse and walks through a worksheet identifying each client's personal warning signs.",
    options: ["Process group", "Recovery support group"],
    correctIdx: 1,
    explain: "Structured, psychoeducational content with a worksheet and a teaching goal — this is a recovery support group, built to transmit a specific skill or concept."
  },
  {
    prompt: "A group where the facilitator opens with \"What's been sitting with you today?\" and lets whatever comes up shape the rest of the session.",
    options: ["Process group", "Recovery support group"],
    correctIdx: 0,
    explain: "Unstructured, present-focused, and driven by whatever clients are actually carrying that day — this is the shape of a process group."
  },
];
function grRenderTypes(){
  grRenderDecision('grTypesClassifyCard', GR_TYPES_ITEMS, 'gr-types');
}

/* ---- The working group ---- */
const GR_WORKINGGROUP_BEATS = [
  `<p class="lede">This is the single most useful lens for reading a group in the moment — better than any checklist of "good" or "bad" group behaviors, because it tells you what to actually do about what you're seeing.</p>`,

  `<h3>What a working group looks like</h3>
   <p>A <strong>working group</strong> is on-task: members are present, turned toward each other and the material, doing the real work of the group even when it's uncomfortable. It doesn't mean the content is easy or that everyone's engaged every second — it means the group, as a whole, is oriented toward the actual purpose in the room. When you feel that "magic" from the last section, you're feeling a working group.</p>
   <p>Groups don't stay there automatically. Group theory names a handful of common ways a group slips out of working mode and into something else — not because anyone's being difficult on purpose, but because avoidance, discomfort, and group dynamics naturally pull in other directions. Recognizing which one you're looking at tells you what move to make next.</p>`,

  `<h3>Four ways a group slips off track</h3>
   <div class="mistake-grid">
     <div class="mistake-card">
       <div class="mistake-dim">Dependency</div>
       <div class="mistake-title">The group looks to you to fix it</div>
       <div class="mistake-body">Members go quiet and wait for you to have the answer, ask the next question, or solve the problem — instead of working with each other. Comfortable for the group, but it stalls the actual work.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Fight-flight</div>
       <div class="mistake-title">Conflict or distraction that avoids the topic</div>
       <div class="mistake-body">A side argument flares up, or the group suddenly gets very interested in something trivial — both can be the group's way of avoiding something harder underneath.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Pairing</div>
       <div class="mistake-title">Two members carry the group</div>
       <div class="mistake-body">Two clients fall into a back-and-forth that quietly excludes everyone else, and the rest of the group settles into watching instead of participating.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Storytelling / monopolizing</div>
       <div class="mistake-title">The group becomes an audience</div>
       <div class="mistake-body">One member's narrative takes over, and the group shifts from working together into passively listening to one long story — often comfortable for everyone, since no one else has to be vulnerable.</div>
     </div>
   </div>
   <div class="callout"><strong>None of these mean the group has failed, and none of them mean a member is being difficult on purpose.</strong> They're the predictable, normal ways groups avoid discomfort. Your job isn't to prevent them from ever happening — it's to notice when the group has drifted, and gently bring it back to work.</div>`,

  `<h3>The general move: name it, then redirect</h3>
   <p>You don't need a different technique for each one. The underlying move is almost always the same: notice out loud, without blame, that something has shifted — and then redirect the group back toward the actual work. "I notice we've been talking about the schedule for a few minutes — I wonder if that's easier to talk about than what came up for [client] a minute ago" does more work than it looks like. It names the drift, doesn't shame anyone for it, and hands the group a door back to the real material.</p>`,

  `<h3>Try it: which one is happening?</h3>
   <div class="classify-card" id="grWorkingGroupClassifyCard"></div>`,
];
const GR_WORKINGGROUP_FINAL = `<button class="btn" onclick="grMarkComplete('gr-workinggroup'); grGoTo('gr-skills')">Next: The facilitator's toolkit →</button>`;

const GR_WORKINGGROUP_ITEMS = [
  {
    prompt: "A client shares something vulnerable about her son. The group goes quiet, then everyone turns to you and waits for you to respond or ask the next question.",
    options: ["Dependency", "Fight-flight", "Pairing"],
    correctIdx: 0,
    explain: "The group is looking to the leader to carry the work instead of engaging with each other — that's dependency. The move here is often to redirect back to the group: \"What's coming up for others hearing that?\""
  },
  {
    prompt: "Two clients get into a sharp disagreement about whether 12-step programs \"actually work,\" right after a member shared something painful about a relapse.",
    options: ["Dependency", "Fight-flight", "Storytelling"],
    correctIdx: 1,
    explain: "A sudden conflict, conveniently timed right after something hard came up, often functions as fight-flight — the group avoiding the harder material by generating a fight to focus on instead."
  },
  {
    prompt: "One member has been talking for ten straight minutes about the full history of his using, in great detail, while the rest of the group listens quietly.",
    options: ["Pairing", "Storytelling / monopolizing", "Fight-flight"],
    correctIdx: 1,
    explain: "The group has become a passive audience to one member's narrative — this is the storytelling/monopolizing pattern, and it's a cue to gently interrupt and open the floor back up."
  },
];
function grRenderWorkingGroup(){
  grRenderDecision('grWorkingGroupClassifyCard', GR_WORKINGGROUP_ITEMS, 'gr-workinggroup');
}

/* ---- Facilitator toolkit ---- */
const GR_SKILLS_BEATS = [
  `<p class="lede">Most of what a skilled facilitator does in a session breaks down into a small set of moves, used over and over. None of them are complicated in isolation — the skill is in reaching for the right one at the right moment.</p>`,

  `<h3>Opening — set the container before content starts</h3>
   <p>A group that starts cold — no framing, straight into "so, who wants to share" — asks a lot of clients without giving them anything to hold onto. A brief, consistent opening (purpose of today's group, a quick guideline reminder, even just a grounding moment) sets a container that makes it safer to be vulnerable inside of. It doesn't need to be long. It needs to be there, every time, so clients know what kind of room they just walked into.</p>`,

  `<h3>Linking — connect one member's share to another's</h3>
   <p>Linking is one of the most powerful and most underused facilitation moves. When one client shares something, actively connect it to something another client has said — in this group or a past one. "[Client A], that sounds close to what [Client B] was describing last week about feeling like an outsider even around family." Linking is what turns a room of individual disclosures into an actual working group — it's the mechanism behind "I'm not the only one," made visible instead of left to chance.</p>`,

  `<h3>Evoking — draw out quieter members</h3>
   <p>Some clients won't volunteer, not because they have nothing to say, but because speaking up in a group is genuinely hard. Evoking means gently inviting them in without putting them on the spot: "[Client], I noticed you nodding when that came up — is any of that landing for you?" gives an easy, low-pressure entry point. It respects that they might say "not really" — the invitation matters more than a guaranteed response.</p>`,

  `<h3>Blocking — interrupt what isn't helping</h3>
   <p>Blocking means stepping in when a group behavior is working against the group's purpose — advice-giving, cross-talk, gossip, monopolizing — without shaming the person doing it. This is important and tricky enough to get its own full section next.</p>`,

  `<h3>Redirecting — bring a wandering group back</h3>
   <p>Redirecting is the general move from the last section: name what's happening, without judgment, and point the group back toward the actual work. It's the tool for dependency, fight-flight, pairing, and monopolizing alike — the specific wording changes, the underlying move doesn't.</p>`,

  `<h3>Closing — end with a deliberate wrap, not just running out of time</h3>
   <p>How a group ends matters almost as much as how it opens. A group that just stops when the clock runs out leaves whatever came up unprocessed and dangling. A brief, intentional close — one takeaway per person, or a simple check-out question — gives the group a sense of completion, and gives you a last chance to catch anyone who's leaving activated or distressed.</p>`,

  `<h3>Try it: name the skill</h3>
   <p>For each facilitator line, identify which skill it demonstrates.</p>
   <div class="classify-card" id="grSkillsClassifyCard"></div>`,
];
const GR_SKILLS_FINAL = `<button class="btn" onclick="grMarkComplete('gr-skills'); grGoTo('gr-blocking')">Next: Blocking, in depth →</button>`;

const GR_SKILLS_ITEMS = [
  {
    prompt: "\"That's really similar to what you shared last week, [Client] — that fear of letting people down. I wonder if you two are carrying more of the same thing than it feels like in the moment.\"",
    options: ["Linking", "Evoking", "Closing"],
    correctIdx: 0,
    explain: "This connects one member's experience to another's out loud — the definition of linking, and one of the clearest ways to build the 'not alone' feeling that makes group work."
  },
  {
    prompt: "\"Before we wrap up, let's go around — one word for how you're leaving today.\"",
    options: ["Opening", "Redirecting", "Closing"],
    correctIdx: 2,
    explain: "A deliberate check-out before ending the session is a closing move — giving the group a sense of completion instead of just running out of time."
  },
  {
    prompt: "\"[Client], you've been pretty quiet today — no pressure, but I'm curious if anything from this is landing for you.\"",
    options: ["Evoking", "Blocking", "Linking"],
    correctIdx: 0,
    explain: "A low-pressure invitation aimed at a quieter member, without putting them on the spot, is evoking."
  },
];
function grRenderSkills(){
  grRenderDecision('grSkillsClassifyCard', GR_SKILLS_ITEMS, 'gr-skills');
}

/* ---- Blocking, in depth ---- */
const GR_BLOCKING_BEATS = [
  `<p class="lede">Of all the facilitation skills, blocking is the one new staff tend to avoid the longest — because it can feel like interrupting or embarrassing someone. Done well, it protects the group without shaming the individual, and it's often a relief to the very person you're blocking.</p>`,

  `<h3>What blocking actually is</h3>
   <p>Blocking means stepping in to interrupt a behavior that's working against the group's purpose — not the person, the behavior. The goal is never to make someone feel wrong for what they did. It's to protect the group's time, safety, and focus, while leaving the person's dignity fully intact. A well-timed block usually doesn't feel like a correction to anyone in the room — it feels like the facilitator doing their job.</p>`,

  `<h3>Common behaviors that need blocking</h3>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Advice-giving</div>
       <div class="break-card-body">A client jumps in with "what you should do is..." the moment someone else shares. Advice shuts down processing — it turns a moment that needed to be felt and explored into a problem to be solved, usually before the person was ready for solutions.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Cross-talk / side conversation</div>
       <div class="break-card-body">Two members start a quiet side conversation while someone else is sharing, or a private exchange during group. It pulls energy and attention away from the person who's supposed to have the floor.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Monopolizing / storytelling</div>
       <div class="break-card-body">One member's turn stretches well past what the group's time and attention can hold, often sliding into extended narrative detail that isn't adding new processing — just filling time.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Gossip or talking about a peer who isn't present</div>
       <div class="break-card-body">A client starts describing another client's behavior or business instead of their own experience. This breaks trust in the room, even when it's not meant maliciously.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Judgment disguised as feedback</div>
       <div class="break-card-body">"I think you're just making excuses" said as if it were supportive feedback. This can shut a vulnerable sharer down fast, and needs a quick, gentle block to keep the room safe for whoever shares next.</div>
     </div>
   </div>`,

  `<h3>How to block without shutting the group down</h3>
   <ul class="checklist">
     <li><strong>Name the pattern, not the person's character:</strong> "Let's hold advice for a second" lands very differently than "Don't tell her what to do."</li>
     <li><strong>Redirect toward the skill you actually want:</strong> "Can you reflect back what you're hearing instead?" gives the interrupted member something better to do, not just a correction.</li>
     <li><strong>Keep your tone light and quick:</strong> a block that's delivered calmly, almost casually, rarely feels like a big deal. A block delivered with visible frustration will.</li>
     <li><strong>Return the floor to where it belongs:</strong> after blocking, redirect attention back to the original sharer — "[Client], you were saying..." — so the block doesn't accidentally become the new focus of the group.</li>
   </ul>`,

  `<h3>Try it: write the block</h3>
   <p>A client is sharing about a relapse. Mid-share, another client jumps in: "Girl, you just need to cut that guy off completely, that's your whole problem."</p>

   <h3>What your answer needs</h3>
   <ul class="checklist">
     <li>A block aimed at the behavior (advice-giving), not the client's character</li>
     <li>A redirect that gives the interrupting client something better to do</li>
     <li>A return of the floor back to the original sharer</li>
   </ul>

   <div class="scenario-box">
     <div class="who">Process group — mid-share</div>
     <div class="meta">Client A is sharing about a recent relapse. Client B interrupts with unsolicited advice.</div>
     <p style="margin:0;">Write out exactly what you'd say, in order, from the block through returning the floor to Client A.</p>
   </div>
   <textarea id="grBlockingAnswer" placeholder="e.g. Let's hold advice for a second, [Client B] — can you reflect back what you're hearing instead? ... [Client A], go ahead and keep going." style="min-height:120px;" oninput="document.getElementById('grBlockingRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="grBlockingRevealBtn" disabled onclick="grRevealModel('grBlocking'); grMarkComplete('gr-blocking')">Reveal model answer</button>
   </div>
   <div class="reveal" id="grBlockingReveal">
     <div class="card-label">One reasonable way to handle this</div>
     <div class="model-answer">"Let's hold advice for a moment — [Client B], can you reflect back what you're hearing instead of jumping to what she should do?"

[Client B] reflects.

"Thanks. [Client A], go ahead and keep going — you were talking about what happened after the call."</div>
     <ul class="checklist">
       <li>"Let's hold advice for a moment" blocks the behavior without any judgment of Client B's character or intentions</li>
       <li>Asking for a reflection instead gives Client B a concrete, better way to stay engaged — not just a correction with nowhere to go</li>
       <li>Handing the floor back explicitly ("go ahead and keep going") prevents the block itself from becoming the new center of attention</li>
       <li>The whole exchange takes seconds — a block doesn't need to be a whole conversation to work</li>
     </ul>
   </div>`,
];
const GR_BLOCKING_FINAL = `<button class="btn" onclick="grGoTo('gr-topics')">Next: Choosing and running a topic →</button>`;

/* ---- Choosing and running a topic ---- */
const GR_TOPICS_BEATS = [
  `<p class="lede">A blank "so, what's on everyone's mind today" can work, but it can also lead to a long silence. Having a few reliable ways to generate a topic — and knowing when to use your planned one versus following what the room actually brings in — makes group easier to run and stronger for clients.</p>`,

  `<h3>Where topics can come from</h3>
   <ul class="checklist">
     <li><strong>A quick check-in round:</strong> a one-word or one-sentence go-around at the start often surfaces the real topic on its own — someone's answer will point straight at what the group needs to talk about.</li>
     <li><strong>Something happening on the unit:</strong> a discharge, an admission, a hard night, a shared experience from the last 24 hours — using what's already alive in the room tends to generate more honest engagement than an abstract prompt.</li>
     <li><strong>A planned prompt, held loosely:</strong> having a prepared topic (a stage of change, a value, a common trigger) is useful as a backup, not a script to force through if the room clearly needs something else.</li>
     <li><strong>Something from an earlier group, revisited:</strong> if something significant came up last time and didn't get fully processed, checking back in on it shows the group that what they share here actually gets tracked and matters.</li>
   </ul>`,

  `<h3>The trade-off: planned topic vs. following the room</h3>
   <p>There's a real tension here, and neither side wins by default. A planned topic gives structure and makes sure important material gets covered — useful especially in recovery support groups. But if you force a planned topic through while the room is clearly sitting with something else (a hard morning, a shared loss, tension between members), you risk the group experiencing that as "not being seen," which itself is a rupture worth avoiding. A reasonable default: hold your planned topic loosely, name what you're noticing in the room, and let the group's actual state have real influence over which direction you go.</p>`,

  `<h3>Try it: pick your move</h3>
   <p>You planned to run a group on identifying personal triggers. During check-in, two clients mention a peer was discharged unexpectedly overnight, and the room feels heavy and unsettled.</p>
   <div class="classify-card" id="grTopicsClassifyCard"></div>`,
];
const GR_TOPICS_FINAL = `<button class="btn" onclick="grMarkComplete('gr-topics'); grGoTo('gr-difficult')">Next: Difficult dynamics →</button>`;

const GR_TOPICS_ITEMS = [
  {
    prompt: "Best first move given what came up in check-in?",
    options: [
      "Stick to the planned trigger-identification group exactly as prepared, to stay on schedule",
      "Name what you're noticing in the room and open space to process the discharge, holding the planned topic for another day",
    ],
    correctIdx: 1,
    explain: "Forcing the planned topic through here risks the group feeling unseen at a moment that clearly needs processing. The planned material isn't lost — it can run another day, once the room has room for it."
  },
];
function grRenderTopics(){
  grRenderDecision('grTopicsClassifyCard', GR_TOPICS_ITEMS, 'gr-topics');
}

/* ---- Difficult dynamics ---- */
const GR_DIFFICULT_BEATS = [
  `<p class="lede">These are the moments that make new facilitators most nervous — and usually, once you've got one or two solid moves for each, they stop feeling like emergencies and start feeling like Tuesday.</p>`,

  `<div class="mistake-grid">
     <div class="mistake-card">
       <div class="mistake-dim">The monopolizer</div>
       <div class="mistake-title">One member takes over</div>
       <div class="mistake-body">Block gently, name the time constraint honestly ("I want to make sure we hear from others too"), and offer to circle back if time allows. This isn't punishment — most monopolizers don't realize how much space they're taking.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">The silent room</div>
       <div class="mistake-title">Nobody wants to go first</div>
       <div class="mistake-body">Resist the urge to fill silence yourself immediately — a few seconds of quiet is tolerable and sometimes productive. If it stretches, try a lower-stakes entry point: a check-in word, a specific (gentle) invitation to one member, or naming the silence itself ("It feels quiet today — I'm curious what that's about").</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Cross-talk</div>
       <div class="mistake-title">Side conversations pull focus</div>
       <div class="mistake-body">A simple, warm redirect usually works: "Let's bring that back to the group — what were you two talking about?" This invites the content back in, rather than just shutting the side conversation down.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">Conflict between members</div>
       <div class="mistake-title">Tension flares mid-group</div>
       <div class="mistake-body">Don't rush to smooth it over or take a side. Name what's happening, slow it down, and get curious about what's underneath for each person — conflict handled well in group can become some of the most valuable material in the room.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">A client who shuts down or cries</div>
       <div class="mistake-title">Someone becomes overwhelmed</div>
       <div class="mistake-body">Slow down, check in directly and gently, and let the group know it's okay to sit with this — don't rush to move past it just because it's uncomfortable. Offer, don't force, continued sharing.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">A group that scapegoats one member</div>
       <div class="mistake-title">Piling on one person</div>
       <div class="mistake-body">Interrupt the pattern directly and protect the member being targeted, then get curious with the group about what's driving it — scapegoating is often the group's fight-flight pattern aimed at a person instead of a topic.</div>
     </div>
   </div>`,

  `<h3>The thread underneath all of these</h3>
   <p>Notice that almost none of these solutions involve confrontation, control, or "getting the group back in line" through authority. Nearly every move here is some version of naming what's happening out loud, staying curious instead of frustrated, and gently redirecting — the same underlying moves from the last several sections, applied to specific, high-pressure moments.</p>`,

  `<h3>Try it: pick your move</h3>
   <p>Halfway through a group, two clients start snapping at each other about who left dishes in the common area. It's escalating in tone, and the rest of the group has gone quiet and tense.</p>
   <div class="classify-card" id="grDifficultClassifyCard"></div>`,
];
const GR_DIFFICULT_FINAL = `<button class="btn" onclick="grMarkComplete('gr-difficult'); grGoTo('gr-assembly')">Next: Put it together — Danielle →</button>`;

const GR_DIFFICULT_ITEMS = [
  {
    prompt: "Best first move?",
    options: [
      "Firmly tell both clients this isn't the place for that and move on to the planned topic",
      "Name what's happening, slow it down, and get curious with both clients about what's underneath the conflict",
      "Let it play out for a few minutes since conflict resolves itself",
    ],
    correctIdx: 1,
    explain: "Shutting it down entirely skips a real opportunity — conflict, handled with curiosity instead of control, can become valuable material. Letting it escalate unmanaged risks real harm to the room's safety. Naming and slowing it down, with curiosity, threads that needle."
  },
];
function grRenderDifficult(){
  grRenderDecision('grDifficultClassifyCard', GR_DIFFICULT_ITEMS, 'gr-difficult');
}

/* ---- Final assembly: Danielle's process group ---- */
const GR_ASSEMBLY_BEATS = [
  `<p class="lede">One full scenario, pulling together the working group concept, the toolkit, blocking, and difficult dynamics — in a process group with a client you already know from the rest of this training.</p>`,

  `<div class="scenario-box">
     <div class="who">Process group — 8 clients, including Danielle</div>
     <div class="meta">Danielle shares that she's been dreading a call with her mother, who she says "never lets anything go."</div>
     <p style="margin:0;">Before Danielle finishes, another client jumps in: "Oh my god, my mom is exactly like that, you just have to set a hard boundary and hang up if she starts." A couple other members start nodding along and talking over each other about their own moms. Danielle goes quiet and looks down.</p>
   </div>`,

  `<h3>Work through it</h3>
   <p>Answer each question based on everything you've covered in this module.</p>
   <div class="classify-card" id="grAssemblyClassifyCard"></div>`,

  `<div class="reveal" id="grAssemblyOverallReveal">
     <div class="card-label">Putting the whole picture together</div>
     <div class="callout">Nothing here required raising your voice or taking control away from the group. A brief block on advice-giving, followed by handing the floor back to Danielle by name, did the whole job — it protected her share, kept the group's energy from scattering into a pairing/storytelling tangent about everyone else's mothers, and modeled exactly the kind of listening the group needed to offer her. That's a working group being gently steered back to work, not shut down.</div>
   </div>`,

  `<h3>Bringing it all together</h3>
   <p>Step back from Danielle specifically for a second. Every piece of this module was building toward the same underlying skill: noticing what a group is actually doing in the moment, and making small, well-placed moves that bring it back to real work — without ever needing to control the room through force.</p>
   <ul class="checklist">
     <li>Group isn't a side benefit of treatment — the connection it builds is one of the most protective forces against relapse there is, precisely because addiction thrives in isolation</li>
     <li>Process groups and recovery support groups do different jobs — know which room you're in before you decide what "a good group" looks like today</li>
     <li>A working group is the goal, not the default — dependency, fight-flight, pairing, and monopolizing are all normal ways groups drift, not signs of failure</li>
     <li>Opening, linking, evoking, blocking, redirecting, and closing are most of what facilitation actually is — a small toolkit, used constantly</li>
     <li>Blocking protects the group without shaming the individual — name the behavior, redirect to something better, return the floor</li>
     <li>Almost every difficult dynamic responds to the same underlying move: name it, slow it down, stay curious instead of taking control by force</li>
   </ul>
   <div class="callout"><strong>The thing to actually carry with you:</strong> the magic you feel in a working group isn't luck, and it isn't something only certain clients or certain facilitators can produce. It's the predictable result of a room where isolation loses, on purpose, for forty-five minutes at a time — and you have real, learnable tools for making that happen more often than not.</div>
   <span class="badge-done" id="groupFinalBadge" style="display:none;">🎉 You've completed the Group Facilitation Skills module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="grGoTo('gr-cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span> is built to be reopened before you walk into a group, not just read once during training.
   </div>`,
];
const GR_ASSEMBLY_FINAL = `<button class="btn secondary" onclick="grGoTo('gr-cheatsheet')">View quick reference cheat sheet</button>
  <button class="btn" onclick="goHome()" style="margin-left:12px;">Finish: Back to Clinical Training →</button>`;

const GR_ASSEMBLY_ITEMS = [
  {
    prompt: "What's happening in the group right now, in group-theory terms?",
    options: ["The group has drifted into pairing/storytelling — several members' own stories are crowding out Danielle's share", "The group is working exactly as it should", "This is dependency — the group is waiting on the facilitator"],
    correctIdx: 0,
    explain: "Multiple members jumping in with their own mother stories, talking over each other, has shifted the group's energy away from Danielle and into a shared tangent — closer to a storytelling drift than a working moment for her specifically."
  },
  {
    prompt: "What's the first behavior worth blocking?",
    options: ["The client who jumped in with advice before Danielle finished", "Danielle, for going quiet", "Nothing — let the group's energy run its course"],
    correctIdx: 0,
    explain: "The advice-giving interruption is what pulled focus away from Danielle mid-share. That's the behavior to block — gently, and aimed at the pattern, not the client's character."
  },
  {
    prompt: "After blocking the advice-giving, what's the strongest next move?",
    options: [
      "Move on to a different client since Danielle seems uncomfortable now",
      "Return the floor to Danielle by name, and invite her to keep going",
      "Ask the group why they keep interrupting people",
    ],
    correctIdx: 1,
    explain: "Handing the floor back explicitly is what actually repairs the moment for Danielle — without it, the block alone doesn't finish the job of protecting her share."
  },
  {
    prompt: "Once Danielle finishes, is there still a role for what the other members were bringing up about their own mothers?",
    options: ["No — that material should be dropped entirely, it was a distraction", "Yes — once Danielle's had her full turn, that shared material is a natural linking opportunity, connecting several members' experiences on purpose"], 
    correctIdx: 1,
    explain: "The impulse wasn't wrong, just early. Once Danielle has been fully heard, deliberately linking her experience to what several others clearly related to can turn the same material into one of the more powerful moments of the group — this time, on purpose and in the right order."
  },
];

function grShowAssemblyOverall(){
  const el = document.getElementById('grAssemblyOverallReveal');
  if(el) el.classList.add('show');
}
function grRenderAssembly(){
  grRenderDecision('grAssemblyClassifyCard', GR_ASSEMBLY_ITEMS, 'gr-assembly', grShowAssemblyOverall);
  renderGroupNav();
}

/* =====================================================
   ETHICS & BOUNDARIES MODULE
   ===================================================== */
const ethCHAPTERS = [
  {title:'Ethics & Boundaries', sections:[
    {id:'eth-why', label:'Why ethics protect the client'},
    {id:'eth-principles', label:'Six guiding principles'},
    {id:'eth-dual', label:'Dual relationships'},
    {id:'eth-selfdisclosure', label:'Self-disclosure'},
    {id:'eth-gifts', label:'Gifts & favoritism'},
    {id:'eth-confidentiality', label:'Confidentiality & its limits'},
    {id:'eth-crossing', label:'Crossing vs. violation'},
    {id:'eth-assembly', label:'Put it together'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'eth-cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
  ]},
];
const ethSECTIONS = ethCHAPTERS.flatMap(c => c.sections);
const ethTRACKED_SECTIONS = ethSECTIONS.filter(s => s.trackProgress !== false);

let ethProgress = {};
try{ ethProgress = JSON.parse(localStorage.getItem('doctrain-eth-progress') || '{}'); }catch(e){ ethProgress = {}; }

function ethSaveProgress(){
  localStorage.setItem('doctrain-eth-progress', JSON.stringify(ethProgress));
  renderEthNav();
}
function ethMarkComplete(id){
  ethProgress[id] = true;
  ethSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let ethCurrentSection = 'eth-why';
function renderEthNav(){
  const navList = document.getElementById('navList-eth');
  navList.innerHTML = '';
  ethCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (ethCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>ethGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (ethProgress[s.id] ? ' done':'');
        check.textContent = ethProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = ethTRACKED_SECTIONS.filter(s=>ethProgress[s.id]).length;
  document.getElementById('progressLabel-eth').textContent = doneCount + ' of ' + ethTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-eth').style.width = (doneCount/ethTRACKED_SECTIONS.length*100) + '%';
  const ethFinalBadge = document.getElementById('ethFinalBadge');
  if(ethFinalBadge) ethFinalBadge.style.display = (doneCount === ethTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function ethGoTo(id){
  ethCurrentSection = id;
  document.querySelectorAll('#view-ethics section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderEthNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-eth').onclick = ()=>{
  if(confirm('Reset all Ethics & Boundaries module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-eth-progress');
    ethProgress = {};
    ethSaveProgress();
    ['ethWhyBeats','ethPrinciplesBeats','ethDualBeats','ethSelfdisclosureBeats','ethGiftsBeats','ethConfidentialityBeats','ethCrossingBeats','ethAssemblyBeats'].forEach(resetBeats);
  }
};

/* ---- Generic decision exercise (reused, same pattern as grRenderDecision) ---- */
function ethRenderDecision(containerId, items, onDoneSectionId, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answered = 0;
  items.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    const optsHtml = item.options.map((opt,i)=>`<button class="pill-btn" data-val="${i}" data-idx="${idx}">${opt}</button>`).join('');
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.prompt}</div>
        <div class="classify-explain" id="${containerId}-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">${optsHtml}</div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = items[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const chosenVal = parseInt(btn.dataset.val, 10);
      const correct = chosenVal === item.correctIdx;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns[item.correctIdx].classList.add('chosen-correct');
      }
      document.getElementById(`${containerId}-explain-${idx}`).classList.add('show');
      answered++;
      if(answered === items.length){
        if(onDoneSectionId) ethMarkComplete(onDoneSectionId);
        if(onAllAnswered) onAllAnswered();
      }
    });
  });
}
function ethRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
}

/* ---- Why ethics exist ---- */
const ETH_WHY_BEATS = [
  `<p class="lede">Somewhere in your career, you will probably watch a genuinely good clinician lose their job, their licensure, or both — over something that didn't feel like a violation while it was happening. It rarely starts with someone deciding to cause harm. It starts with something that felt like caring.</p>`,

  `<h3>What ethics and boundaries are actually for</h3>
   <p>It's easy to think of ethics codes and boundary rules as a list of things you're not allowed to do — a compliance hurdle sitting between you and the real clinical work. Flip that around: every one of these rules exists because someone, somewhere, was harmed by a clinician who almost certainly didn't set out to harm them. The rules are downstream of real damage to real clients. Understanding <em>why</em> a boundary exists — what it protects the client from — is what makes it usable in the moments a written policy can't fully anticipate.</p>`,

  `<h3>The power differential is the whole reason</h3>
   <p>Here's the mechanism underneath almost every boundary you'll learn in this module: the relationship between you and a client is never between equals. You hold real power over things that matter enormously to them — your clinical documentation shapes their level of care, your notes can appear in custody proceedings or legal cases, your assessment of their engagement can affect discharge timing, and you have access to their most private disclosures. A client's ability to freely say "no" to you, or to something you initiate, is compromised by all of that — even when they seem completely willing, even when they say yes first. This is why reasoning that works between equals ("we're both adults, we both wanted this") doesn't transfer cleanly into this relationship. <span class="term" onclick="this.classList.toggle('term-open')">Informed consent<span class="term-def">A client's voluntary agreement, made with full understanding of the risks and alternatives. Ordinary informed consent assumes something close to equal footing between the two people — a condition the clinical power differential makes difficult to fully satisfy.</span></span> from a client, in this context, is never quite the same thing as consent between equals.</p>`,

  `<div class="callout"><strong>The single question underneath this entire module:</strong> does this choice benefit the client's treatment — or does it benefit me? My comfort, my ego, my loneliness, my need to be liked or needed, my finances, my curiosity. Anything that primarily serves you is happening at the client's cost, even when it doesn't feel that way, and even when the client seems to want it too.</p></div>`,

  `<h3>The good-intentions trap</h3>
   <p>Here's the part that makes this genuinely hard, not just a matter of willpower: something that seems good isn't always good. Almost none of the serious violations that end careers begin with a clinician who wanted to exploit someone. They begin with a clinician who wanted to help more than the role technically allowed — staying late for one more struggling client, sharing a personal story to make someone feel less alone, accepting a small gift because refusing felt cold, agreeing to "just one" contact after discharge because cutting someone off felt cruel. Every one of those impulses comes from a caring place. That's exactly what makes them dangerous — they don't feel like the beginning of a problem. They feel like being a good clinician.</p>`,

  `<h3>What's actually at stake</h3>
   <p>This isn't paperwork-level seriousness — it belongs in the same category as clinical harm, because that's what it ultimately produces. Boundary and ethics violations are one of the most common reasons clinicians lose their license permanently, lose their job with cause, and — often overlooked — do real, lasting harm to the client's ability to trust treatment again, and to the reputation of the program that could have helped the next client who walks through the door.</p>`,

  `<h3>What's ahead</h3>
   <p>The ACA's six core ethical principles, which give you a way to reason through situations no policy manual specifically covers. Then the recurring gray areas you'll actually run into here — dual relationships, self-disclosure, gifts and favoritism, and confidentiality's real limits. Then the distinction between a boundary crossing and a boundary violation, and how supervision is what keeps the first from becoming the second. Finally, a full scenario to work through everything at once.</p>`,
];
const ETH_WHY_FINAL = `<button class="btn" onclick="ethMarkComplete('eth-why'); ethGoTo('eth-principles')">Next: Six guiding principles →</button>`;

/* ---- The six principles ---- */
const ETH_PRINCIPLES_BEATS = [
  `<p class="lede">Policy manuals can't anticipate every situation you'll face. What they're built from — and what actually helps in the moment a policy doesn't cover — are the underlying principles behind them. The ACA Code of Ethics organizes these into six core principles. Think of them less as a checklist and more as six lenses to look through when a situation feels gray.</p>`,

  `<div class="principle-grid">
     <div class="principle-card">
       <div class="principle-label">Autonomy</div>
       <div class="principle-sub">Their right to self-direct</div>
       <div class="principle-detail">Respecting a client's right to make their own choices — including ones you disagree with, like leaving against medical advice.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Nonmaleficence</div>
       <div class="principle-sub">Above all, no harm</div>
       <div class="principle-detail">Avoiding harm — including harm that doesn't look like harm at first, like a "helpful" boundary crossing.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Beneficence</div>
       <div class="principle-sub">Actively do good</div>
       <div class="principle-detail">Going beyond "don't harm" to actively promote the client's wellbeing and growth.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Justice</div>
       <div class="principle-sub">Fair, without favorites</div>
       <div class="principle-detail">Treating clients equitably — the client you like most gets the same standard as the client you find most difficult.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Fidelity</div>
       <div class="principle-sub">Honor the role and the trust</div>
       <div class="principle-detail">Keeping your word, honoring the boundaries of your role, and being someone the client's trust was well-placed in.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Veracity</div>
       <div class="principle-sub">Truthful, including about limits</div>
       <div class="principle-detail">Being honest with clients — including honest about what you can't offer them, instead of a comfortable evasion.</div>
     </div>
   </div>`,

  `<h3>They can pull in different directions — that's the point</h3>
   <p>These principles aren't a lookup table with one right answer each time. Sometimes they genuinely compete. A client wants to sign out against every recommendation you'd give — autonomy says respect that choice; beneficence pulls you to keep advocating for them to stay. Neither principle is wrong. Ethical reasoning is the skill of weighing them against each other in a specific situation, not applying one mechanically and ignoring the rest.</p>`,

  `<div class="callout"><strong>Where this shows up constantly, even outside a formal "ethics dilemma":</strong> justice is often the first principle to quietly erode. Giving your favorite client a little more leeway, a softer consequence, an inside joke the rest of the group doesn't get — none of that feels like a violation of anything. It's justice breaking down in slow motion, one small exception at a time.</p></div>`,

  `<h3>Try it: which principle is most centrally at stake?</h3>
   <p>Read each situation and identify the principle that's most directly in tension.</p>
   <div class="classify-card" id="ethPrinciplesClassifyCard"></div>`,
];
const ETH_PRINCIPLES_FINAL = `<button class="btn" onclick="ethGoTo('eth-dual')">Next: Dual relationships →</button>`;

const ETH_PRINCIPLES_ITEMS = [
  {
    prompt: "A counselor consistently gives one client extra one-on-one time and lighter consequences for rule violations because they 'remind him of his own daughter.'",
    options: ["Justice", "Autonomy", "Veracity"],
    correctIdx: 0,
    explain: "Uneven treatment based on personal feelings — however sympathetic the reasoning — is a justice problem. Every client is owed the same standard, regardless of who reminds the counselor of whom."
  },
  {
    prompt: "A client insists on leaving treatment today despite the team's strong recommendation to stay. Staff feel a pull to physically block the door or make the process as difficult as possible to discourage her.",
    options: ["Autonomy", "Fidelity", "Justice"],
    correctIdx: 0,
    explain: "Short of an active safety emergency, a client's right to leave — even against strong clinical advice — is an autonomy question. The tension between wanting to protect her (beneficence) and respecting her choice (autonomy) is real, but coercing her to stay crosses into violating autonomy."
  },
  {
    prompt: "A client asks a staff member directly whether their insurance will keep covering treatment. The staff member isn't sure and gives a vague, reassuring answer instead of saying so.",
    options: ["Veracity", "Nonmaleficence", "Beneficence"],
    correctIdx: 0,
    explain: "A vague, falsely reassuring answer instead of an honest 'I don't know, let me find out' is a truthfulness problem — veracity — even when it's meant kindly."
  },
];
function ethRenderPrinciples(){
  ethRenderDecision('ethPrinciplesClassifyCard', ETH_PRINCIPLES_ITEMS, 'eth-principles');
}

/* ---- Dual relationships ---- */
const ETH_DUAL_BEATS = [
  `<p class="lede">A dual relationship happens when you're more than one thing to a client at the same time — counselor and friend, counselor and business contact, counselor and something more. It's one of the most common paths from good intentions to real harm, because most dual relationships start out looking completely benign.</p>`,

  `<h3>Why it's dangerous, even when it feels harmless</h3>
   <p>Remember the power differential from the last sections — it doesn't go away because a relationship feels warm or mutual. Layering a second relationship on top of the clinical one confuses which version of you the client is dealing with at any given moment, and makes it much harder for them to ever say no to you about anything, in either role. It can also compromise your own clinical judgment — it's difficult to hold a client accountable in treatment when you're also invested in them liking you as a friend.</p>`,

  `<h3>The categories you'll actually encounter</h3>
   <div class="break-cards">
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Romantic or sexual relationships</div>
       <div class="break-card-body">An absolute, no-exceptions bar with a current client — full stop, regardless of who initiates it or how mutual it seems. The ACA Code of Ethics also prohibits this with former clients for a minimum of five years after the professional relationship ends, and even after that, the burden is on the counselor to show the relationship isn't exploitative, given how much residual influence and trust may still be in play. "Five years" is a floor, not a green light — many situations remain inappropriate well beyond it.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Friendships and social media connections</div>
       <div class="break-card-body">Accepting a friend request, following a current client on social media, or building an outside friendship all blur the same line — the client can no longer fully trust which relationship they're in with you, and neither, eventually, can you.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Business dealings</div>
       <div class="break-card-body">Hiring a client, buying something from them, entering any financial arrangement — money and power tangle together in ways that are very hard to undo cleanly once treatment ends.</div>
     </div>
     <div class="break-card" onclick="this.classList.toggle('expanded')">
       <div class="break-card-title"><span class="break-card-icon">+</span> Post-discharge contact</div>
       <div class="break-card-body">Even entirely non-romantic ongoing contact after discharge — becoming a client's sponsor, staying in regular touch as a "mentor" — carries real risk, because the clinical relationship's influence doesn't switch off the day treatment ends.</div>
     </div>
   </div>`,

  `<h3>The "small town" trap</h3>
   <p>A common and understandable question: what about overlap that's genuinely hard to avoid — a rural area, a tight-knit recovery community, a client who happens to attend your place of worship? The rule doesn't bend here, but the response does. Unavoidable overlap isn't a loophole that makes dual relationships acceptable — it's a signal to increase transparency, documentation, and supervision around the overlap, not to relax the underlying caution. Bring it to your supervisor early and often, rather than deciding alone that "this situation is different."</p>`,

  `<h3>Try it: dual relationship or not?</h3>
   <div class="classify-card" id="ethDualClassifyCard"></div>`,
];
const ETH_DUAL_FINAL = `<button class="btn" onclick="ethMarkComplete('eth-dual'); ethGoTo('eth-selfdisclosure')">Next: Self-disclosure →</button>`;

const ETH_DUAL_ITEMS = [
  {
    prompt: "A counselor accepts a current client's follow request on a personal Instagram account, reasoning it's 'just social media, not a big deal.'",
    options: ["A dual relationship risk worth declining", "Fine — social media isn't a real relationship"],
    correctIdx: 0,
    explain: "Social media access is real access to a clinician's personal life, opinions, and relationships — it blurs the same line as any other outside friendship, however casual it feels."
  },
  {
    prompt: "A client offers to fix a staff member's car for a discounted rate, since he was a mechanic before treatment. Staff member is tempted since money is tight.",
    options: ["A business-dealing dual relationship to decline", "Fine, since it's the client's idea"],
    correctIdx: 0,
    explain: "Whose idea it was doesn't change the underlying risk — a financial arrangement with a current client tangles money and clinical power together, regardless of who proposed it."
  },
  {
    prompt: "A counselor and a client discover they both attend the same small church in a rural area they can't avoid, and the counselor brings this to supervision to discuss how to handle it.",
    options: ["Fine — this is unavoidable overlap being handled the right way", "Still a violation, no matter what"],
    correctIdx: 0,
    explain: "Unavoidable overlap isn't automatically a violation — bringing it to supervision proactively, with transparency, is exactly the right response to a real-world constraint that can't simply be avoided."
  },
];
function ethRenderDual(){
  ethRenderDecision('ethDualClassifyCard', ETH_DUAL_ITEMS, 'eth-dual');
}

/* ---- Self-disclosure ---- */
const ETH_SELFDISCLOSURE_BEATS = [
  `<p class="lede">Self-disclosure isn't inherently wrong — a brief, well-placed "I understand that feeling" can build real rapport. The trouble starts when disclosure quietly shifts from serving the client to serving the person doing the disclosing.</p>`,

  `<h3>The test: whose need does this serve?</h3>
   <p>Before sharing something personal, ask honestly: am I doing this because it will help this client's treatment right now, or because I want to be understood, liked, seen as relatable, or because talking about myself is easier than staying focused on them? That pull toward wanting to be seen is human and not shameful — but noticing it is exactly what tells you to hold back rather than share.</p>`,

  `<h3>What separates helpful disclosure from harmful disclosure</h3>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Serves the clinician</span>
       <p>Client: "Do you even understand what this is like?"

Counselor: "Actually, yes — my ex-husband was an addict for twelve years, and honestly it nearly broke me. There were nights I didn't think I'd survive it either. It's exhausting, watching someone you love destroy themselves..."</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Serves the client</span>
       <p>Client: "Do you even understand what this is like?"

Counselor: "I've been close to people who've struggled with this, so I have some understanding — though I know your experience is your own. What feels most misunderstood about it right now?"</p>
     </div>
   </div>
   <p class="hero-note">The first response makes the client the audience for the counselor's pain — the roles have effectively reversed. The second is brief, doesn't center the counselor's story, and immediately redirects back to the client. Length and focus are usually the clearest tells.</p>`,

  `<div class="callout"><strong>A useful rule of thumb:</strong> if a disclosure would require the client to respond with concern, comfort, or curiosity about you, it's very likely serving you, not them. Purposeful disclosure is brief enough that the client barely has to react to it before the focus is back on their own material.</div>`,

  `<h3>Try it: write your response</h3>
   <p>A client asks you directly: "Have you ever struggled with addiction yourself? Is that why you do this work?"</p>

   <h3>What your answer needs</h3>
   <ul class="checklist">
     <li>Doesn't require a detailed personal history to answer honestly</li>
     <li>Doesn't put the client in the position of comforting or reacting to you</li>
     <li>Redirects the focus back to the client's own experience within a sentence or two</li>
   </ul>

   <div class="scenario-box">
     <div class="who">Individual session — client asks directly</div>
     <div class="meta">She's asking sincerely, not testing you — genuinely curious what draws people to this work.</div>
     <p style="margin:0;">Write out exactly what you'd say.</p>
   </div>
   <textarea id="ethSelfdisclosureAnswer" placeholder="e.g. This work matters a lot to me personally, though I try to keep our sessions focused on you. What made you curious about that?" style="min-height:110px;" oninput="document.getElementById('ethSelfdisclosureRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="ethSelfdisclosureRevealBtn" disabled onclick="ethRevealModel('ethSelfdisclosure'); ethMarkComplete('eth-selfdisclosure')">Reveal model answer</button>
   </div>
   <div class="reveal" id="ethSelfdisclosureReveal">
     <div class="card-label">One reasonable way to handle this</div>
     <div class="model-answer">"This kind of work tends to matter personally to the people drawn to it, and I'm no exception — but I try to keep our time focused on you rather than my own story. What's behind you asking today?"</div>
     <ul class="checklist">
       <li>Answers honestly without disclosing specific personal history</li>
       <li>Doesn't invite the client to react to or comfort the counselor</li>
       <li>Turns the question back into an opening to learn more about what the client needs, which is often what's really behind the question in the first place</li>
     </ul>
   </div>`,
];
const ETH_SELFDISCLOSURE_FINAL = `<button class="btn" onclick="ethGoTo('eth-gifts')">Next: Gifts and favoritism →</button>`;

/* ---- Gifts and favoritism ---- */
const ETH_GIFTS_BEATS = [
  `<p class="lede">Nobody sets out to play favorites. It happens in small increments — a little more warmth here, a little more leniency there — until one client is quietly getting a different program than everyone else.</p>`,

  `<h3>Gifts</h3>
   <p>A client offering a small, heartfelt gift — a drawing, a handwritten note — can feel harsh to refuse outright, and many programs have specific policies about what's acceptable (often nothing with monetary value, and even sentimental items handled carefully and disclosed to the team). Follow your program's policy exactly, and when something falls in a gray area, decline warmly and explain briefly why, rather than deciding alone in the moment that "this one's fine."</p>`,

  `<h3>Favors and special treatment</h3>
   <p>This category is subtler and more common than outright gifts: extra minutes at the end of a session, a softer consequence for a rule violation, an inside joke the rest of the group isn't part of, jumping someone to the front of a waitlist because you like them. None of these look like ethics violations in the moment. Each one is justice quietly eroding — the client getting the exception isn't the only person affected; every other client is getting a slightly worse version of the program by comparison, even if they never find out why.</p>`,

  `<div class="callout"><strong>A useful check:</strong> if you wouldn't be comfortable explaining this exception to the rest of your team, in detail, out loud — that's usually a sign it shouldn't be happening quietly in the first place.</div>`,

  `<h3>Try it: appropriate or a problem?</h3>
   <div class="classify-card" id="ethGiftsClassifyCard"></div>`,
];
const ETH_GIFTS_FINAL = `<button class="btn" onclick="ethMarkComplete('eth-gifts'); ethGoTo('eth-confidentiality')">Next: Confidentiality and its limits →</button>`;

const ETH_GIFTS_ITEMS = [
  {
    prompt: "A client makes a friendship bracelet for her counselor and gives it to her on discharge day, following the program's policy allowing small handmade items.",
    options: ["Fine, within policy", "A boundary problem"],
    correctIdx: 0,
    explain: "A small, handmade, sentimental gift accepted within an explicit program policy — and presumably documented per that policy — is a normal, appropriate part of a warm therapeutic ending."
  },
  {
    prompt: "A counselor consistently lets one client skip chores 'because she's had a rough week' more often than other clients with similarly rough weeks.",
    options: ["Fine — compassion for a hard week", "A justice/favoritism problem"],
    correctIdx: 1,
    explain: "If the leniency isn't applied consistently to every client having an equally rough week, it's favoritism, however compassionate the individual instance feels — the standard has to be the same for everyone."
  },
];
function ethRenderGifts(){
  ethRenderDecision('ethGiftsClassifyCard', ETH_GIFTS_ITEMS, 'eth-gifts');
}

/* ---- Confidentiality and its limits ---- */
const ETH_CONFIDENTIALITY_BEATS = [
  `<p class="lede">Confidentiality is the foundation clients build their trust in treatment on — but it was never designed to be absolute, and knowing exactly where the limits sit matters as much as protecting the confidentiality itself.</p>`,

  `<h3>What it protects, and why it matters so much here</h3>
   <p>Substance use treatment carries unusually strong federal confidentiality protections, on top of the general clinical expectation of privacy — for good reason. Clients disclose things here that could affect custody, employment, legal standing, and relationships. If clients can't trust that what they say stays protected, they simply stop saying the things treatment depends on them saying.</p>`,

  `<h3>The real limits</h3>
   <ul class="checklist">
     <li><strong>Imminent risk to self or an identified other:</strong> the duty to warn or protect can require breaking confidentiality when someone's safety is at stake — the same principle behind the suicidality response covered in the Co-Occurring Disorders module.</li>
     <li><strong>Mandated reporting:</strong> disclosures involving abuse or neglect of a child, elder, or dependent adult typically require reporting, regardless of the general confidentiality protections around substance use treatment.</li>
     <li><strong>Court order or valid subpoena:</strong> confidentiality can be overridden by a proper legal order — this is a supervisor and compliance conversation, not a decision to navigate alone.</li>
     <li><strong>The client's own informed, written consent to release information:</strong> confidentiality belongs to the client — they can choose to waive it for a specific purpose, which is different from staff deciding to share on their behalf.</li>
   </ul>`,

  `<div class="callout"><strong>The everyday version of this that's easy to overlook:</strong> confidentiality isn't only broken in dramatic ways. Discussing a client by name in a break room, in an elevator, or with friends outside of work — even without meaning any harm — is a real confidentiality breach. The quiet, casual version is far more common than the dramatic, legally complicated version, and it's entirely within your control every day.</div>`,

  `<h3>Quick check</h3>
   <div class="quiz-card" id="ethConfidentialityQuizCard"></div>`,
];
const ETH_CONFIDENTIALITY_FINAL = `<button class="btn" onclick="ethGoTo('eth-crossing')">Next: Crossing vs. violation →</button>`;

const ETH_CONFIDENTIALITY_QUIZ_ITEMS = [
  {
    q: "A client discloses in session that they plan to seriously harm a specific, named person once they leave treatment. What's true about confidentiality here?",
    options: [
      "Confidentiality is absolute and this must stay in session",
      "This is a duty-to-warn situation where confidentiality can, and likely must, be broken to protect the identified person",
      "Only law enforcement can decide whether to break confidentiality, not clinical staff",
    ],
    correctIdx: 1,
    explain: "A specific, credible threat toward an identified person is exactly the kind of imminent risk that overrides ordinary confidentiality protections — this goes to a supervisor or clinical staff immediately, not something to sit on."
  },
  {
    q: "Two staff members are having lunch off-site and discuss a client's situation by name, careful to keep their voices down. Is this a confidentiality problem?",
    options: [
      "No — as long as no one else could hear them, this is fine",
      "Yes — discussing a client by name outside of a clinical context is a breach regardless of who might overhear",
    ],
    correctIdx: 1,
    explain: "The breach isn't really about whether someone overheard — it's that the client's information was shared outside of a legitimate clinical purpose. Even a quiet conversation at lunch is outside that boundary."
  },
];
function ethRenderConfidentialityQuiz(){
  buildQuiz('ethConfidentialityQuizCard', ETH_CONFIDENTIALITY_QUIZ_ITEMS, ()=>ethMarkComplete('eth-confidentiality'));
}

/* ---- Crossing vs. violation ---- */
const ETH_CROSSING_BEATS = [
  `<p class="lede">Not every deviation from a strict rule is a violation — but the difference isn't about how good your intentions were. It's about transparency, harm, and whose interest the deviation actually served.</p>`,

  `<h3>Two different things that get lumped together</h3>
   <div class="hero-compare">
     <div class="hero-col survive">
       <span class="hero-tag">Boundary crossing</span>
       <p>A departure from the usual frame that's disclosed, defensible, and doesn't serve the clinician at the client's expense — for example, briefly extending a session because a client disclosed something serious right at time's end, then documenting and mentioning it to your supervisor.</p>
     </div>
     <div class="hero-col deny">
       <span class="hero-tag">Boundary violation</span>
       <p>A departure that exploits the relationship, serves the clinician over the client, and typically happens quietly, without disclosure — for example, extending contact with a client outside of sessions because the clinician enjoys the connection, and never mentioning it to anyone.</p>
     </div>
   </div>
   <p class="hero-note">The line usually isn't "how big was the deviation" — it's "was this transparent, defensible, and in the client's interest, or was it quiet and in mine?"</p>`,

  `<h3>The slope runs one direction</h3>
   <p>Serious violations almost never start as serious violations. They start as a small, undisclosed crossing that felt justified in the moment — and because it wasn't brought to anyone, it never got tested against another set of eyes. That first undisclosed crossing makes the next, slightly larger one feel normal, because it worked out fine last time and no one objected — nobody knew to object. This is the actual mechanism behind the good-intentions trap from the start of this module: it's not one bad decision, it's a long series of small, quiet ones.</p>`,

  `<div class="callout"><strong>The single best protection you have is supervision — used early, not as damage control.</strong> Bringing a crossing to your supervisor the same week it happens, before it's had time to feel normal, is what keeps it a documented, defensible crossing instead of the first step down a slope. Waiting until it feels like something to hide is usually a sign it already needed to be said out loud.</div>`,

  `<h3>Try it: crossing or violation?</h3>
   <div class="classify-card" id="ethCrossingClassifyCard"></div>`,
];
const ETH_CROSSING_FINAL = `<button class="btn" onclick="ethMarkComplete('eth-crossing'); ethGoTo('eth-assembly')">Next: Put it together →</button>`;

const ETH_CROSSING_ITEMS = [
  {
    prompt: "A counselor gives a client a ride to a follow-up medical appointment when no other transportation is available, documents it, and informs their supervisor the same day.",
    options: ["Boundary crossing — disclosed and defensible", "Boundary violation"],
    correctIdx: 0,
    explain: "A one-time, transparent, documented departure that clearly serves the client's treatment need — not the clinician's — is the textbook shape of a defensible crossing, not a violation."
  },
  {
    prompt: "A counselor begins texting a client's personal phone regularly about how their week is going, without documenting it or mentioning it to the team, because 'it seemed to help.'",
    options: ["Boundary crossing", "Boundary violation"],
    correctIdx: 1,
    explain: "Ongoing, undisclosed personal contact outside the treatment structure — even with a caring justification — is a violation. The lack of transparency is exactly the marker that separates it from a defensible crossing."
  },
];
function ethRenderCrossing(){
  ethRenderDecision('ethCrossingClassifyCard', ETH_CROSSING_ITEMS, 'eth-crossing');
}

/* ---- Final assembly: a client asks you to be her sponsor ---- */
const ETH_ASSEMBLY_BEATS = [
  `<p class="lede">One full scenario, pulling together the power differential, the six principles, dual relationships, and the crossing/violation distinction — with a client you already know from the rest of this training.</p>`,

  `<div class="scenario-box">
     <div class="who">Danielle — her last day of residential treatment</div>
     <div class="meta">She's worked hard, built real trust with her primary counselor, and is anxious about maintaining sobriety once she's home.</div>
     <p style="margin:0;">On her way out, Danielle says: "You're the only person who's ever really gotten it. Would you be willing to be my sponsor once I'm out? I don't trust anyone else to help me stay sober the way you have."</p>
   </div>`,

  `<h3>Work through it</h3>
   <p>Answer each question based on everything you've covered in this module.</p>
   <div class="classify-card" id="ethAssemblyClassifyCard"></div>`,

  `<div class="reveal" id="ethAssemblyOverallReveal">
     <div class="card-label">Putting the whole picture together</div>
     <div class="callout">Notice that Danielle's request comes from a completely genuine, healthy place — she trusts the relationship that helped her, which is exactly what good treatment is supposed to build. That's precisely why this is worth taking seriously rather than dismissing. The caring, appropriate response isn't "yes, because she trusts me" or a cold "no" with no explanation — it's a warm decline that names why the relationship that helped her in treatment isn't built to also be her sponsor relationship, paired with real, practical help finding one. Redirecting well is not a lesser response than saying yes — for Danielle, it's the one that actually protects what she built here.</div>
   </div>`,

  `<h3>Bringing it all together</h3>
   <p>Step back from Danielle specifically for a second. Every piece of this module was building toward the same underlying habit of mind: noticing when something that feels caring is quietly about you, and choosing the client's actual interest over the version of "helping" that feels best in the moment.</p>
   <ul class="checklist">
     <li>Ethics and boundaries exist to protect clients from harm that often doesn't feel like harm while it's happening — including from clinicians with entirely good intentions</li>
     <li>The power differential means client consent in this relationship is never quite the same as consent between equals — that's the reasoning underneath nearly every rule in this module</li>
     <li>The six ACA principles — autonomy, nonmaleficence, beneficence, justice, fidelity, veracity — give you a way to reason through situations no policy specifically covers</li>
     <li>Dual relationships, self-disclosure, gifts, and favoritism all follow the same underlying test: does this serve the client's treatment, or does it serve me?</li>
     <li>Confidentiality is foundational and still has real limits — imminent risk, mandated reporting, legal orders, and the client's own informed consent to release information</li>
     <li>A boundary crossing brought to supervision stays a defensible crossing. Left quiet, it's the first step down a slope toward something much more serious</li>
   </ul>
   <div class="callout"><strong>The thing to actually carry with you:</strong> the fact that something feels good, or feels like it's helping, was never a reliable signal on its own — plenty of real harm has been done by people who felt exactly that way in the moment. Slowing down and asking "whose benefit is this really for" is a habit worth building long before you're ever standing in a moment that requires it.</div>
   <span class="badge-done" id="ethFinalBadge" style="display:none;">🎉 You've completed the Ethics & Boundaries module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="ethGoTo('eth-cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span> is built to be reopened next to a real, in-the-moment decision, not just read once during training.
   </div>`,
];
const ETH_ASSEMBLY_FINAL = `<button class="btn secondary" onclick="ethGoTo('eth-cheatsheet')">View quick reference cheat sheet</button>
  <button class="btn" onclick="goHome()" style="margin-left:12px;">Finish: Back to Clinical Training →</button>`;

const ETH_ASSEMBLY_ITEMS = [
  {
    prompt: "What makes Danielle's request understandable, even though the answer still needs to be no?",
    options: [
      "It comes from real trust built in treatment — which is a sign treatment worked, not a red flag about Danielle",
      "It's manipulative and she's testing the counselor",
    ],
    correctIdx: 0,
    explain: "This request reflects genuine, appropriate trust in the relationship that helped her — treating it as manipulation would misread a healthy outcome as a suspicious one. The concern here is about the relationship structure, not Danielle's motives."
  },
  {
    prompt: "If the counselor said yes, which principle would be most directly compromised?",
    options: ["Justice — every other discharged client deserves the same offer", "Fidelity — the counselor's role and the trust placed in that specific role wouldn't be honored", "Veracity — the counselor would have to lie about it"],
    correctIdx: 1,
    explain: "Becoming her sponsor collapses the clinical role into a different kind of relationship, which isn't what the trust Danielle placed in the counselor's professional role was actually for — that's a fidelity problem at its core, even though justice concerns could follow if it became a pattern."
  },
  {
    prompt: "What's the strongest response?",
    options: [
      "A flat 'no, that's against policy' with no further explanation",
      "Agree informally, without telling anyone, since Danielle really has worked hard and it feels earned",
      "A warm decline that explains why the relationship that helped her in treatment isn't built to also be her sponsor relationship, plus concrete help finding an appropriate sponsor",
    ],
    correctIdx: 2,
    explain: "A bare policy citation leaves Danielle feeling rejected without understanding why, and agreeing quietly is exactly the undisclosed dual relationship this module warns about. Explaining the real reason and helping her find an appropriate sponsor actually serves her ongoing recovery — which was the genuine goal underneath her request all along."
  },
];

function ethShowAssemblyOverall(){
  const el = document.getElementById('ethAssemblyOverallReveal');
  if(el) el.classList.add('show');
}
function ethRenderAssembly(){
  ethRenderDecision('ethAssemblyClassifyCard', ETH_ASSEMBLY_ITEMS, 'eth-assembly', ethShowAssemblyOverall);
  renderEthNav();
}

/* =====================================================
   FAMILY SYSTEMS MODULE
   ===================================================== */
const famCHAPTERS = [
  {title:'Family Systems', sections:[
    {id:'fam-why', label:'The people who never walk in'},
    {id:'fam-web', label:'Addiction is a family disease'},
    {id:'fam-roles', label:'Five family roles'},
    {id:'fam-enabling', label:'Enabling'},
    {id:'fam-codependency', label:'Codependency'},
    {id:'fam-sessions', label:'Why family sessions matter most'},
    {id:'fam-resistance', label:'When engagement is hard'},
    {id:'fam-assembly', label:'Put it together: Danielle'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'fam-cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
  ]},
];
const famSECTIONS = famCHAPTERS.flatMap(c => c.sections);
const famTRACKED_SECTIONS = famSECTIONS.filter(s => s.trackProgress !== false);

let familyProgress = {};
try{ familyProgress = JSON.parse(localStorage.getItem('doctrain-family-progress') || '{}'); }catch(e){ familyProgress = {}; }

function famSaveProgress(){
  localStorage.setItem('doctrain-family-progress', JSON.stringify(familyProgress));
  renderFamilyNav();
}
function famMarkComplete(id){
  familyProgress[id] = true;
  famSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let famCurrentSection = 'fam-why';
function renderFamilyNav(){
  const navList = document.getElementById('navList-family');
  navList.innerHTML = '';
  famCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (famCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>famGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (familyProgress[s.id] ? ' done':'');
        check.textContent = familyProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = famTRACKED_SECTIONS.filter(s=>familyProgress[s.id]).length;
  document.getElementById('progressLabel-family').textContent = doneCount + ' of ' + famTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-family').style.width = (doneCount/famTRACKED_SECTIONS.length*100) + '%';
  const famFinalBadge = document.getElementById('famFinalBadge');
  if(famFinalBadge) famFinalBadge.style.display = (doneCount === famTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function famGoTo(id){
  famCurrentSection = id;
  document.querySelectorAll('#view-family section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderFamilyNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-family').onclick = ()=>{
  if(confirm('Reset all Family Systems module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-family-progress');
    familyProgress = {};
    famSaveProgress();
    ['famWhyBeats','famWebBeats','famRolesBeats','famEnablingBeats','famCodependencyBeats','famSessionsBeats','famResistanceBeats','famAssemblyBeats'].forEach(resetBeats);
  }
};

/* ---- Generic decision exercise (reused, same pattern as ethRenderDecision) ---- */
function famRenderDecision(containerId, items, onDoneSectionId, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answered = 0;
  items.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    const optsHtml = item.options.map((opt,i)=>`<button class="pill-btn" data-val="${i}" data-idx="${idx}">${opt}</button>`).join('');
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.prompt}</div>
        <div class="classify-explain" id="${containerId}-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">${optsHtml}</div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = items[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const chosenVal = parseInt(btn.dataset.val, 10);
      const correct = chosenVal === item.correctIdx;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns[item.correctIdx].classList.add('chosen-correct');
      }
      document.getElementById(`${containerId}-explain-${idx}`).classList.add('show');
      answered++;
      if(answered === items.length){
        if(onDoneSectionId) famMarkComplete(onDoneSectionId);
        if(onAllAnswered) onAllAnswered();
      }
    });
  });
}
function famRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
}

/* ---- Why this module ---- */
const FAM_WHY_BEATS = [
  `<p class="lede">Somewhere tonight, a child is going to bed and praying — maybe without even the words for what she's asking — that her mom comes home from this place healthy, and that she won't have to keep living through what she's been living through. She will never sit in one of our groups. She will never meet you. But what happens in here, this week, is one of the biggest things standing between her and that prayer being answered.</p>`,

  `<h3>The audience you never see</h3>
   <p>It's easy, on a busy shift, to think of the person in front of you as the whole scope of the work. She isn't. Behind almost every client here is a small, specific cast of people whose daily lives are already shaped by this admission, and will be shaped again by how it goes: a spouse trying to figure out how to cover rent and pick the kids up from school without the second income or the second set of hands. A parent lying awake, running through every phone call they're afraid might come. Children who have learned to read a room for danger before they've learned to read a book.</p>`,

  `<h3>The scale of it</h3>
   <p>Multiply that small cast across a caseload, across a year, across the community this program sits in, and the honest number of lives touched by the work happening inside these walls isn't measured in single digits. It's closer to hundreds — parents, partners, children, siblings, coworkers, whole extended families — most of whom will never once set foot in this building, and all of whom are waiting, one way or another, to find out how this goes.</p>`,

  `<div class="callout"><strong>This isn't meant to add pressure to an already hard job — it's meant to add meaning to it.</strong> On the days documentation feels like paperwork and group feels like routine, this is the thing underneath all of it: you are not just treating the person in the room. You are, indirectly, doing something for every person whose life is tangled up in that person's recovery — most of whom you will never meet and never thank you.</div>`,

  `<h3>Why this module exists</h3>
   <p>Family work is sometimes treated as a soft add-on to the "real" clinical work — a box to check before discharge. It isn't. Addiction doesn't happen to one person in isolation, and recovery doesn't hold in isolation either. This module covers why the family itself needs attention, not just the client — the patterns families fall into around addiction, how deeply well-meaning people can end up protecting the very thing that's hurting them, and why completing family sessions before a client leaves here is one of the most consequential things this program does.</p>`,
];
const FAM_WHY_FINAL = `<button class="btn" onclick="famMarkComplete('fam-why'); famGoTo('fam-web')">Next: Addiction is a family disease →</button>`;

/* ---- The family web / systems concept ---- */
const FAM_WEB_BEATS = [
  `<p class="lede">"Addiction is a family disease" isn't just a comforting phrase support groups use. It describes something real and specific about how addiction actually behaves inside a household — and it changes what "treating the client" should mean.</p>`,

  `<h3>A family is a system, not a collection of individuals</h3>
   <p>Think of a family less like a group of separate people who happen to live together, and more like a single connected structure — the way a mobile hanging from the ceiling holds every piece in balance. Move one piece, and every other piece shifts to compensate. Addiction doesn't stay contained to the person using. Over time, the whole family reorganizes itself around it — schedules, roles, unspoken rules about what can and can't be said out loud — until the family's whole shape has adapted to the addiction's presence.</p>`,

  `<h3>Homeostasis: why families sometimes resist the very recovery they prayed for</h3>
   <p>Here's the piece that surprises a lot of new staff: <span class="term" onclick="this.classList.toggle('term-open')">homeostasis<span class="term-def">A system's tendency to maintain its current balance and resist change, even change that's clearly for the better — because the current arrangement, however painful, is at least familiar and predictable.</span></span> means a family system settles into whatever pattern it's built, even a painful one, and will often unconsciously resist a shift away from it — including the shift of a member getting sober. A spouse who has spent years as the one holding everything together may not know who they are, or what their marriage even looks like, without that role. A family that organized every holiday around managing one person's using may not know how to be together without that organizing problem. None of this means the family doesn't want recovery. It means recovery asks the whole system to change, not just the one person who used.</p>`,

  `<div class="callout"><strong>This is why "just treating the client" is often incomplete.</strong> A client can do everything right in here and return to a family system that never adjusted — the same roles, the same unspoken rules, the same homeostasis pulling everyone, including her, back toward the old shape. Family work is how that system gets a chance to change too, instead of quietly waiting for things to go back to "normal."</div>`,

  `<h3>What's ahead</h3>
   <p>The specific roles family members often fall into around addiction, the difference between enabling and helping, what codependency actually looks like, and why the family sessions that happen during treatment — while there's still structure and support in the room — matter as much as anything else on the treatment plan.</p>`,
];
const FAM_WEB_FINAL = `<button class="btn" onclick="famMarkComplete('fam-web'); famGoTo('fam-roles')">Next: Five family roles →</button>`;

/* ---- Five family roles ---- */
const FAM_ROLES_BEATS = [
  `<p class="lede">Watch enough families move through this work and you'll start to recognize the same handful of shapes people bend themselves into, trying to survive living alongside someone's addiction. None of these are character flaws. Every one of them is a survival strategy that made sense at the time — and every one of them hides real pain underneath.</p>`,

  `<div class="mistake-grid">
     <div class="mistake-card">
       <div class="mistake-dim">The Enabler / Caretaker</div>
       <div class="mistake-title">Holds it together on the surface</div>
       <div class="mistake-body">Covers for the addicted member, smooths things over, keeps the family looking functional to the outside world — often at real cost to their own needs.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">The Hero</div>
       <div class="mistake-title">Overachieves for the whole family</div>
       <div class="mistake-body">Excels at school, work, or sports, trying to give the family something to be proud of and prove that everything is okay — often exhausted and quietly terrified of failing.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">The Scapegoat</div>
       <div class="mistake-title">Pulls attention away from the addiction</div>
       <div class="mistake-body">Acts out, gets in trouble, becomes "the problem child" — which paradoxically gives the family something else to focus on besides the addiction itself.</div>
     </div>
     <div class="mistake-card">
       <div class="mistake-dim">The Lost Child</div>
       <div class="mistake-title">Disappears to stay safe</div>
       <div class="mistake-body">Withdraws, stays quiet, asks for nothing — trying not to add one more problem to a household that already feels like too much.</div>
     </div>
     <div class="mistake-card mistake-wide">
       <div class="mistake-dim">The Mascot</div>
       <div class="mistake-title">Uses humor to survive the tension</div>
       <div class="mistake-body">Jokes, deflects, lightens the mood in a house that badly needs relief — often carrying real anxiety underneath a constant performance of being fine.</div>
     </div>
   </div>`,

  `<h3>Why this matters clinically</h3>
   <p>These roles are worth recognizing for two reasons. First, they help you understand a client's own history — many clients were once the Hero, or the Lost Child, or the Scapegoat in their own family of origin, and those old patterns often resurface in how they cope now. Second, and just as important, they help you understand what you're walking into when you meet a client's family: a spouse who's spent years as the Caretaker isn't being difficult when they struggle to stop managing everything — they're doing the only thing they've known how to do for a long time.</p>`,

  `<div class="callout"><strong>Nobody chooses these roles consciously, and nobody stays fully inside one all the time.</strong> They're patterns, not sentences. Naming them gently, without pathologizing the person living inside one, is often the first real relief a family member gets — someone finally has a name for what they've been doing and why.</div>`,

  `<h3>Try it: which role?</h3>
   <div class="classify-card" id="famRolesClassifyCard"></div>`,
];
const FAM_ROLES_FINAL = `<button class="btn" onclick="famMarkComplete('fam-roles'); famGoTo('fam-enabling')">Next: Enabling →</button>`;

const FAM_ROLES_ITEMS = [
  {
    prompt: "A teenage son rarely speaks at dinner, keeps his door closed, and hasn't asked his parents for anything in over a year — teachers describe him as 'no trouble at all.'",
    options: ["Lost Child", "Hero", "Mascot"],
    correctIdx: 0,
    explain: "Withdrawing and asking for nothing, in an effort to avoid adding to an already overwhelmed household, is the Lost Child pattern — easy to overlook precisely because it causes no visible problems."
  },
  {
    prompt: "A wife has spent years calling her husband's boss with excuses when he's too hungover to work, and quietly moving money around to cover bills he's missed.",
    options: ["Enabler/Caretaker", "Scapegoat", "Mascot"],
    correctIdx: 0,
    explain: "Shielding the addicted member from real-world consequences, while holding the household together on the surface, is the defining Enabler/Caretaker pattern."
  },
  {
    prompt: "A younger sister is constantly getting suspended from school and picking fights, right around the same years her older brother's addiction was at its worst — family friends say she's 'always been the difficult one.'",
    options: ["Scapegoat", "Hero", "Lost Child"],
    correctIdx: 0,
    explain: "Acting out in a way that draws the family's attention and worry toward a new, more visible problem — often unconsciously — is the Scapegoat pattern, and it frequently develops alongside a sibling's addiction."
  },
];
function famRenderRoles(){
  famRenderDecision('famRolesClassifyCard', FAM_ROLES_ITEMS, 'fam-roles');
}

/* ---- Enabling ---- */
const FAM_ENABLING_BEATS = [
  `<p class="lede">If there's one concept that reframes almost everything a struggling family has been doing, it's this: the very behaviors meant to protect someone they love from the addiction are often what's letting the addiction continue.</p>`,

  `<h3>What enabling actually is</h3>
   <p><span class="term" onclick="this.classList.toggle('term-open')">Enabling<span class="term-def">Any action that shields a person from experiencing the natural consequences of their substance use — however loving or well-intentioned the action is.</span></span> is any action that removes or softens the natural consequences of someone's substance use — paying off a debt they ran up while using, lying to their employer to cover an absence, cleaning up a mess left behind, making excuses to the rest of the family. None of these come from indifference. They almost always come from love, fear, and a desperate hope that this time, help will be the thing that finally turns it around.</p>`,

  `<h3>The trap: it works, in the short term</h3>
   <p>Here's what makes enabling so hard to see from inside it: in the moment, it genuinely helps. The bill gets paid. The job doesn't get lost. The family doesn't have the public embarrassment they were dreading. Every one of those short-term reliefs reinforces the same pattern — and every one of them also removes a piece of the natural feedback that might otherwise prompt the person to face what's happening. This is the exact same good-intentions trap covered in the Ethics module, just showing up in a family instead of a clinician: something that looks and feels like help isn't always help.</p>`,

  `<h3>Enabling vs. helping</h3>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Enabling</span>
       <p>Wife pays off her husband's DUI fines quietly before he finds out how serious it is, and tells his family "it's handled" so he doesn't have to face them.</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Helping</span>
       <p>Wife lets her husband deal with the DUI fines and legal process himself, while offering to go with him to a lawyer appointment or attend a family session to support his recovery.</p>
     </div>
   </div>
   <p class="hero-note">Both responses come from love. Only one of them lets the consequence do the work it was always going to need to do.</p>`,

  `<h3>Try it: enabling or helping?</h3>
   <div class="classify-card" id="famEnablingClassifyCard"></div>`,
];
const FAM_ENABLING_FINAL = `<button class="btn" onclick="famMarkComplete('fam-enabling'); famGoTo('fam-codependency')">Next: Codependency →</button>`;

const FAM_ENABLING_ITEMS = [
  {
    prompt: "A father tells his adult son's landlord that the rent check will be a 'little late this month' without saying why, again, for the fourth month in a row.",
    options: ["Enabling", "Helping"],
    correctIdx: 0,
    explain: "Repeatedly smoothing over the practical consequences of someone's using — without it ever being addressed directly — is enabling, even though it comes from a father trying to protect his son."
  },
  {
    prompt: "A mother tells her daughter she loves her and wants her to get better, and offers to attend a family session at the treatment center, but won't lie to her daughter's employer about her absence.",
    options: ["Enabling", "Helping"],
    correctIdx: 1,
    explain: "Offering genuine support toward recovery, while declining to shield her from a real consequence, is helping — the support doesn't come at the cost of removing the natural feedback her behavior produces."
  },
];
function famRenderEnabling(){
  famRenderDecision('famEnablingClassifyCard', FAM_ENABLING_ITEMS, 'fam-enabling');
}

/* ---- Codependency ---- */
const FAM_CODEPENDENCY_BEATS = [
  `<p class="lede">Enabling describes specific actions. Codependency describes something deeper — a pattern where someone's entire sense of self gets built around managing another person's addiction.</p>`,

  `<h3>What codependency actually is</h3>
   <p><span class="term" onclick="this.classList.toggle('term-open')">Codependency<span class="term-def">A learned pattern in which a person's sense of identity, self-worth, and daily functioning become organized around managing, controlling, or rescuing someone else's addiction or dysfunction — often at serious cost to the codependent person's own needs.</span></span> often develops gradually, the same way the addiction itself did. A partner starts by helping a little more, worrying a little more, monitoring a little more closely — reasonable responses to a frightening situation. Over months or years, that vigilance can become the organizing center of their entire identity: their mood rises and falls with the addicted person's behavior, their own needs quietly stop registering as important, and "keeping him okay" becomes indistinguishable from their sense of who they are.</p>`,

  `<h3>Signs worth recognizing in family members you meet here</h3>
   <ul class="checklist">
     <li>Their own physical or emotional needs have taken a back seat for so long it barely registers as a sacrifice anymore</li>
     <li>A felt sense that their own worth depends on whether they can fix, manage, or control the addicted person's behavior</li>
     <li>Real difficulty setting or holding a boundary, even one they intellectually know is reasonable and even necessary</li>
     <li>Identity built almost entirely around the caretaking role — a genuine uncertainty about who they'd be without it</li>
   </ul>`,

  `<div class="callout"><strong>This isn't a diagnosis to hand someone in a hallway conversation.</strong> It's a lens for understanding why a spouse or parent might resist the very changes that would help them — and for approaching that resistance with compassion rather than frustration. Codependency, like the family roles before it, is a survival adaptation, not a character flaw.</div>`,

  `<h3>Distinguishing codependency from healthy love and support</h3>
   <p>Healthy support says: "I love you, I'm here for you, and I also have to take care of myself." Codependency says: "I can't take care of myself until you're okay" — which quietly hands control of one person's wellbeing to someone else's addiction. The line isn't about how much someone cares. It's about whether their own needs are still allowed to exist alongside that care.</p>`,

  `<h3>Try it: healthy support or codependency?</h3>
   <div class="classify-card" id="famCodependencyClassifyCard"></div>`,
];
const FAM_CODEPENDENCY_FINAL = `<button class="btn" onclick="famMarkComplete('fam-codependency'); famGoTo('fam-sessions')">Next: Why family sessions matter most →</button>`;

const FAM_CODEPENDENCY_ITEMS = [
  {
    prompt: "A husband says: 'I love my wife and I want her to get better, but I also started seeing my own therapist because I realized I'd stopped taking care of myself.'",
    options: ["Healthy support", "Codependency"],
    correctIdx: 0,
    explain: "Caring deeply while also attending to his own needs — including getting his own support — is exactly the balance healthy support strikes."
  },
  {
    prompt: "A mother says: 'I haven't slept a full night in three years. If she's not okay, I can't be okay. Nothing else in my life matters until she's better.'",
    options: ["Healthy support", "Codependency"],
    correctIdx: 1,
    explain: "Her own wellbeing has become entirely contingent on her daughter's — with nothing else in her life allowed to matter. That collapse of her own needs into the addicted person's condition is the core codependency pattern."
  },
];
function famRenderCodependency(){
  famRenderDecision('famCodependencyClassifyCard', FAM_CODEPENDENCY_ITEMS, 'fam-codependency');
}

/* ---- Why family sessions matter most ---- */
const FAM_SESSIONS_BEATS = [
  `<p class="lede">Everything in this module points toward one practical conclusion: family sessions completed during treatment are not a nice extra. They may be one of the single most important things standing between a successful discharge and a fast relapse.</p>`,

  `<h3>Why now — while the client is still here</h3>
   <p>Right now, while a client is in residential treatment, is close to the best possible window this family will ever have to start changing its own patterns. There's clinical structure in the room. There's a trained facilitator holding the space. There's some distance from the daily crisis of active use. None of that exists once a client is discharged and everyone is back inside the old system, under the old pressures, with the old homeostasis pulling everyone back toward familiar shape. If the family's patterns don't get a chance to shift here, they usually don't get a better chance later.</p>`,

  `<h3>What's actually accomplished in a family session</h3>
   <ul class="checklist">
     <li><strong>Psychoeducation:</strong> helping the family understand addiction as a disease that reorganized their whole system — not a moral failing of one person they need to keep managing</li>
     <li><strong>Naming the roles and patterns:</strong> gently helping family members recognize their own role, their own enabling, their own codependency — often for the first time, with real relief rather than shame</li>
     <li><strong>Starting new patterns safely:</strong> practicing a different way of relating, with support in the room, before they have to do it alone at home</li>
     <li><strong>Rebuilding trust incrementally:</strong> not erasing what's happened, but beginning the slow, honest work of repair</li>
     <li><strong>Setting shared expectations for aftercare:</strong> so everyone — client and family alike — leaves with the same understanding of what recovery is actually going to require from all of them, not just the client</li>
   </ul>`,

  `<h3>The other reason this matters — motivation</h3>
   <p>Recall from the Motivational Interviewing module how fragile and moment-to-moment motivation actually is in early recovery. Family is one of the single strongest sources of real, durable motivation a client has. A phone call with someone who's stuck by her through all of it. A family session where someone in her life says, out loud, that they see her trying. The image of walking back through her own front door as someone her family can trust again. When a client's motivation dips — and it will — a strong, honestly-rebuilt connection to family is frequently the thing that carries her through the moments willpower alone wouldn't.</p>`,

  `<div class="callout"><strong>The cost of skipping it:</strong> a client can complete every other part of treatment well and still walk back into an unchanged family system — the same enabling, the same codependency, the same unspoken rules — with no new tools on either side for relating differently. That's one of the most common, most preventable paths back to relapse there is.</div>`,

  `<h3>Try it: what's the priority?</h3>
   <p>A client is set to discharge in five days. Her family hasn't yet completed a family session, though her mother has been reachable and willing.</p>
   <div class="classify-card" id="famSessionsClassifyCard"></div>`,
];
const FAM_SESSIONS_FINAL = `<button class="btn" onclick="famMarkComplete('fam-sessions'); famGoTo('fam-resistance')">Next: When engagement is hard →</button>`;

const FAM_SESSIONS_ITEMS = [
  {
    prompt: "Best next step?",
    options: [
      "Treat it as optional and let discharge proceed on schedule regardless",
      "Make scheduling the family session an urgent priority for the remaining days, given how much rides on it",
    ],
    correctIdx: 1,
    explain: "With family engagement available and the discharge clock running, this is exactly the kind of urgent-but-not-flashy priority that's easy to let slip — and one of the most consequential to protect."
  },
];
function famRenderSessions(){
  famRenderDecision('famSessionsClassifyCard', FAM_SESSIONS_ITEMS, 'fam-sessions');
}

/* ---- When engagement is hard ---- */
const FAM_RESISTANCE_BEATS = [
  `<p class="lede">Knowing family sessions matter this much doesn't make them easy to arrange. Resistance shows up from both directions — sometimes from the family, sometimes from the client herself — and both are worth understanding rather than pushing past.</p>`,

  `<h3>When the family resists</h3>
   <ul class="checklist">
     <li><strong>Minimizing:</strong> "He's not that bad, he just needs to relax more." Often reflects the family's own homeostasis protecting itself, not indifference to the client's wellbeing.</li>
     <li><strong>Blame and anger:</strong> Years of accumulated hurt can surface as anger at the client, or at the program for "taking sides." This is grief and exhaustion, more often than it's rejection of the process.</li>
     <li><strong>Their own shame:</strong> A family member who's been enabling for years may avoid a session out of fear of being exposed or blamed themselves.</li>
     <li><strong>Simple logistics:</strong> distance, work schedules, childcare — real barriers, not always resistance in disguise, and worth solving practically (phone or video sessions) before assuming avoidance.</li>
   </ul>`,

  `<h3>When the client resists including family</h3>
   <p>Sometimes the client is the one hesitant to invite her family in — afraid of what will surface, afraid of being blamed, ashamed of what her family has already been through because of her. This deserves the same curiosity as any other resistance covered in this training, not pressure. Gently exploring what she's afraid will happen in the room is usually more productive than simply insisting the session happen.</p>`,

  `<div class="callout"><strong>The general approach, in both directions:</strong> normalize the resistance rather than treating it as a red flag, start smaller if a full family session feels too big (a single phone call, one family member instead of everyone at once), and keep returning to the same reframe used throughout this module — the goal isn't to assign blame, it's to help everyone build something healthier together.</div>`,

  `<h3>Try it: read the situation</h3>
   <div class="classify-card" id="famResistanceClassifyCard"></div>`,
];
const FAM_RESISTANCE_FINAL = `<button class="btn" onclick="famMarkComplete('fam-resistance'); famGoTo('fam-assembly')">Next: Put it together — Danielle →</button>`;

const FAM_RESISTANCE_ITEMS = [
  {
    prompt: "A client's mother says, 'I don't need to sit in some session and be told what I did wrong. I've done nothing but try to help her my whole life.'",
    options: ["Likely fear of being blamed, worth approaching gently", "A sign the mother doesn't care and should be skipped"],
    correctIdx: 0,
    explain: "Defensive framing like this often reflects fear of exposure or blame — sometimes tied to years of enabling the mother isn't ready to name — rather than a lack of care. Approaching it gently, and clarifying the session isn't about assigning blame, is more likely to open the door than confirming her fear by giving up."
  },
  {
    prompt: "A client says, 'I don't want my kids anywhere near this place. They shouldn't have to hear about any of it.'",
    options: ["Explore what she's afraid will happen, and consider whether a smaller, age-appropriate step is possible", "Respect it completely and drop the subject of family involvement entirely"],
    correctIdx: 0,
    explain: "This deserves curiosity rather than either forcing the issue or dropping it outright — there may be a smaller, protective way to involve family (a session with her partner first, for instance) that still moves the work forward without the specific fear she's naming."
  },
];
function famRenderResistance(){
  famRenderDecision('famResistanceClassifyCard', FAM_RESISTANCE_ITEMS, 'fam-resistance');
}

/* ---- Final assembly: Danielle's family session ---- */
const FAM_ASSEMBLY_BEATS = [
  `<p class="lede">One full scenario, pulling together the family web, the roles, enabling, codependency, and engaging a reluctant family member — with a client you already know from the rest of this training.</p>`,

  `<div class="scenario-box">
     <div class="who">Danielle — planning her family session, two weeks before discharge</div>
     <div class="meta">Her mother has been reachable but hesitant. She's the person Danielle plans to live with on discharge.</div>
     <p style="margin:0;">On the phone, her mother says: "Honestly, I don't know what a session is going to accomplish. I've already told her she can come home — I'm not going to turn my daughter away. I don't need a counselor telling me how to run my own house."</p>
   </div>`,

  `<h3>Work through it</h3>
   <p>Answer each question based on everything you've covered in this module.</p>
   <div class="classify-card" id="famAssemblyClassifyCard"></div>`,

  `<div class="reveal" id="famAssemblyOverallReveal">
     <div class="card-label">Putting the whole picture together</div>
     <div class="callout">Her mother's defensiveness is real, and so is her love for Danielle. None of that is being dismissed by still gently making the case for the session — it's exactly why the session matters, both for Danielle's recovery and for her mother, who's hearing "family session" as "you're about to be told you're doing it wrong." A family session isn't a referendum on her mother's house or her mother's rules. Done well, it's one of the only places in this entire process where a hard conversation about boundaries can happen without it feeling like an attack.</div>
   </div>`,

  `<h3>Bringing it all together</h3>
   <p>Step back from Danielle and her mother specifically for a second. Every piece of this module was building toward the same underlying truth: the client sitting in front of you is connected to a whole constellation of people whose lives are already touched by what happens here, whether or not they ever walk through these doors themselves.</p>
   <ul class="checklist">
     <li>Addiction reorganizes an entire family system, not just the person using — which is why treating only the client is often incomplete</li>
     <li>Families settle into roles — Enabler, Hero, Scapegoat, Lost Child, Mascot — that are survival strategies, not character flaws</li>
     <li>Enabling and codependency almost always come from love and fear, not indifference — recognizing this is what makes it possible to address with compassion instead of judgment</li>
     <li>Family sessions completed during treatment, while there's still structure and support in the room, are one of the best chances this family will get to build something different</li>
     <li>Family connection is also one of the strongest, most durable sources of motivation a client has — reason enough on its own to protect this work</li>
     <li>Resistance from family or from the client deserves curiosity, not pressure — and is almost always about fear, exhaustion, or shame, not a lack of care</li>
   </ul>
   <div class="callout"><strong>The thing to actually carry with you:</strong> somewhere tonight, a child, a spouse, or a parent connected to your caseload is hoping — maybe without knowing quite how to hope — that this time is different. Family work is how you give that hope somewhere real to land, instead of just wishing it were true.</div>
   <span class="badge-done" id="famFinalBadge" style="display:none;">🎉 You've completed the Family Systems module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="famGoTo('fam-cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span> is built to be reopened before a family session, not just read once during training.
   </div>`,
];
const FAM_ASSEMBLY_FINAL = `<button class="btn secondary" onclick="famGoTo('fam-cheatsheet')">View quick reference cheat sheet</button>
  <button class="btn" onclick="goHome()" style="margin-left:12px;">Finish: Back to Clinical Training →</button>`;

const FAM_ASSEMBLY_ITEMS = [
  {
    prompt: "What's most likely true about her mother's hesitation?",
    options: [
      "She doesn't care about Danielle's recovery",
      "She's bracing for a session that feels like criticism of her household and her rules, not an invitation to help",
    ],
    correctIdx: 1,
    explain: "Her words point to defensiveness and a fear of being blamed, not a lack of caring — offering her own home back to Danielle unconditionally is itself a real act of love, even without a no-use policy attached to it."
  },
  {
    prompt: "What's the strongest response to her hesitation?",
    options: [
      "Drop the session, since she's clearly not up for it right now",
      "Insist firmly that the session is mandatory and non-negotiable",
      "Acknowledge that she's already saying yes to something hard, and reframe the session as building a plan together rather than handing down rules",
    ],
    correctIdx: 2,
    explain: "Naming what she's already offering, and making clear the session isn't a lecture about her house, is far more likely to bring her in than either dropping the ask or leaning on mandate alone."
  },
  {
    prompt: "Which family role has her mother likely been playing, based on what she described?",
    options: ["Scapegoat", "Enabler/Caretaker", "Mascot"],
    correctIdx: 1,
    explain: "Being unwilling to \"police\" Danielle or set a no-use household policy, out of love and a fear of pushing her away, is the Enabler pattern — protecting the relationship at the cost of the boundary that would actually protect Danielle's recovery."
  },
  {
    prompt: "Why does this session matter for Danielle's motivation specifically, not just the family's functioning?",
    options: [
      "It doesn't relate to her motivation — motivation is a separate, individual issue",
      "A genuine, repaired connection with her mother is one of the strongest things that can carry her through a low-motivation moment after discharge",
    ],
    correctIdx: 1,
    explain: "Family connection is one of the most durable sources of motivation a client has — exactly the kind of thing that can hold when moment-to-moment willpower runs out, which the Motivational Interviewing module covers happens often in early recovery."
  },
];

function famShowAssemblyOverall(){
  const el = document.getElementById('famAssemblyOverallReveal');
  if(el) el.classList.add('show');
}
function famRenderAssembly(){
  famRenderDecision('famAssemblyClassifyCard', FAM_ASSEMBLY_ITEMS, 'fam-assembly', famShowAssemblyOverall);
  renderFamilyNav();
}

/* =====================================================
   CULTURAL HUMILITY MODULE
   ===================================================== */
const cultCHAPTERS = [
  {title:'Cultural Humility', sections:[
    {id:'cult-why', label:'Not a category'},
    {id:'cult-define', label:'What counts as culture'},
    {id:'cult-lens', label:'Your own lens'},
    {id:'cult-humility', label:'What humility means'},
    {id:'cult-authorship', label:'The author of their own story'},
    {id:'cult-intersectionality', label:'Intersectionality'},
    {id:'cult-practice', label:'Asking well'},
    {id:'cult-assembly', label:'Put it together: Danielle'},
  ]},
  {title:'Reference (look anytime)', sections:[
    {id:'cult-cheatsheet', label:'Quick reference cheat sheet', trackProgress:false},
  ]},
];
const cultSECTIONS = cultCHAPTERS.flatMap(c => c.sections);
const cultTRACKED_SECTIONS = cultSECTIONS.filter(s => s.trackProgress !== false);

let cultProgress = {};
try{ cultProgress = JSON.parse(localStorage.getItem('doctrain-culture-progress') || '{}'); }catch(e){ cultProgress = {}; }

function cultSaveProgress(){
  localStorage.setItem('doctrain-culture-progress', JSON.stringify(cultProgress));
  renderCultureNav();
}
function cultMarkComplete(id){
  cultProgress[id] = true;
  cultSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let cultCurrentSection = 'cult-why';
function renderCultureNav(){
  const navList = document.getElementById('navList-culture');
  navList.innerHTML = '';
  cultCHAPTERS.forEach(chapter=>{
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (cultCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>cultGoTo(s.id);
      if(s.trackProgress === false){
        const dash = document.createElement('span');
        dash.className = 'nav-check';
        dash.style.cssText = 'border-style:dashed; opacity:.6;';
        li.appendChild(dash);
      } else {
        const check = document.createElement('span');
        check.className = 'nav-check' + (cultProgress[s.id] ? ' done':'');
        check.textContent = cultProgress[s.id] ? '✓' : '';
        li.appendChild(check);
      }
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = cultTRACKED_SECTIONS.filter(s=>cultProgress[s.id]).length;
  document.getElementById('progressLabel-culture').textContent = doneCount + ' of ' + cultTRACKED_SECTIONS.length + ' complete';
  document.getElementById('progressFill-culture').style.width = (doneCount/cultTRACKED_SECTIONS.length*100) + '%';
  const cultFinalBadge = document.getElementById('cultFinalBadge');
  if(cultFinalBadge) cultFinalBadge.style.display = (doneCount === cultTRACKED_SECTIONS.length) ? 'inline-block' : 'none';
}

function cultGoTo(id){
  cultCurrentSection = id;
  document.querySelectorAll('#view-culture section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderCultureNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

document.getElementById('resetProgress-culture').onclick = ()=>{
  if(confirm('Reset all Cultural Humility module progress? This clears completion checkmarks and your written answers.')){
    localStorage.removeItem('doctrain-culture-progress');
    cultProgress = {};
    cultSaveProgress();
    ['cultWhyBeats','cultDefineBeats','cultLensBeats','cultHumilityBeats','cultAuthorshipBeats','cultIntersectionalityBeats','cultPracticeBeats','cultAssemblyBeats'].forEach(resetBeats);
  }
};

/* ---- Generic decision exercise (reused, same pattern as famRenderDecision) ---- */
function cultRenderDecision(containerId, items, onDoneSectionId, onAllAnswered){
  const card = document.getElementById(containerId);
  if(!card) return;
  card.innerHTML = '';
  let answered = 0;
  items.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    const optsHtml = item.options.map((opt,i)=>`<button class="pill-btn" data-val="${i}" data-idx="${idx}">${opt}</button>`).join('');
    row.innerHTML = `
      <div style="flex:1;">
        <div class="classify-text">${item.prompt}</div>
        <div class="classify-explain" id="${containerId}-explain-${idx}">${item.explain}</div>
      </div>
      <div class="classify-buttons">${optsHtml}</div>
    `;
    card.appendChild(row);
  });
  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.dataset.idx;
      const item = items[idx];
      const rowBtns = card.querySelectorAll(`[data-idx="${idx}"]`);
      rowBtns.forEach(b=>b.disabled = true);
      const chosenVal = parseInt(btn.dataset.val, 10);
      const correct = chosenVal === item.correctIdx;
      btn.classList.add(correct ? 'chosen-correct' : 'chosen-wrong');
      if(!correct){
        rowBtns[item.correctIdx].classList.add('chosen-correct');
      }
      document.getElementById(`${containerId}-explain-${idx}`).classList.add('show');
      answered++;
      if(answered === items.length){
        if(onDoneSectionId) cultMarkComplete(onDoneSectionId);
        if(onAllAnswered) onAllAnswered();
      }
    });
  });
}
function cultRevealModel(id){
  document.getElementById(id + 'Reveal').classList.add('show');
}

/* ---- Why this module ---- */
const CULT_WHY_BEATS = [
  `<p class="lede">Say the words "cultural humility" out loud and watch what happens in the room — someone's shoulders tense, someone assumes they already know where this is going, someone starts bracing for a lecture about politics. Let's clear that up immediately: this isn't about politics, and it isn't about telling you what to believe about anything. It's about something much simpler and much more useful — actually seeing the person sitting across from you.</p>`,

  `<h3>What this module is actually about</h3>
   <p>Every client who comes through here arrives with a full life you can't see at a glance — a family, a income, a hometown, a faith or lack of one, a set of values, a gender, an orientation, a set of political views, a body that works a certain way, a generation's worth of history. All of that is "culture," in the sense this module uses the word. Political views are one small piece of that — a real piece, worth understanding with the same curiosity as everything else — but they're not the point of this training, and neither is telling you which views to hold. The point is much bigger than any one of those pieces: learning to see the whole person, instead of assuming you already know them because you've noticed one thing about them.</p>`,

  `<h3>Why this matters as much as anything else in this training</h3>
   <p>Go back to the very first module in this training — the idea that we can't help the client if we don't document. Here's the version of that idea for this module: <strong>we can't help the client if we don't actually see them.</strong> A client who senses — even faintly — that a staff member has already decided who they are based on their race, their accent, their income, their politics, or their relationships, will not open up the way treatment requires. Trust is the foundation every other module in this training depends on: the motivation work, the group work, the family work, all of it. Trust doesn't survive being reduced to a category.</p>`,

  `<div class="callout"><strong>The risk of getting this wrong isn't abstract.</strong> Addiction already isolates people — it convinces them nobody could understand, nobody else has felt this, they're fundamentally alone in it. A clinician who makes assumptions instead of asking questions can accidentally confirm that exact fear, in the one place that's supposed to be proving it wrong.</div>`,

  `<h3>What's ahead</h3>
   <p>What actually counts as "culture" — it's a longer list than most people expect. Then the fact that you have a culture too, and it's shaping the room whether you notice it or not. A plain-language definition of humility itself. Why the person in front of you is always the real expert on their own story. Intersectionality — how overlapping identities interact rather than simply stack. And practical skills for asking well, including what to do when you get something wrong.</p>`,
];
const CULT_WHY_FINAL = `<button class="btn" onclick="cultMarkComplete('cult-why'); cultGoTo('cult-define')">Next: What counts as culture →</button>`;

/* ---- What counts as culture ---- */
const CULT_DEFINE_BEATS = [
  `<p class="lede">If "culture" only meant race or nationality, this would be a much shorter module. It means something far broader: anything that shapes how a person understands illness, help, authority, family, and recovery itself.</p>`,

  `<h3>All the major pieces — and no single one is the whole picture</h3>
   <div class="principle-grid">
     <div class="principle-card">
       <div class="principle-label">Race &amp; ethnicity</div>
       <div class="principle-detail">Can shape trust in institutions, experiences of stigma, and cultural expectations around family and help-seeking.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Income &amp; class</div>
       <div class="principle-detail">Shapes access to transportation, time off work, insurance, and how shame around addiction gets carried.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Geography</div>
       <div class="principle-detail">Rural, urban, and regional differences in privacy, community resources, and what "getting help" even looks like nearby.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Religion &amp; spirituality</div>
       <div class="principle-detail">Can be a central source of coping and meaning for some clients, and an uncomfortable or painful topic for others — never assume either way.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Political views</div>
       <div class="principle-detail">Shapes language and values a client uses to talk about responsibility, family, and government systems — not something to guess at or weigh in on.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Gender</div>
       <div class="principle-detail">Shapes norms around expressing emotion, asking for help, and caregiving roles — general patterns exist, but individuals vary enormously.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Sexual orientation</div>
       <div class="principle-detail">Can carry unique experiences of family acceptance or rejection, and unique relationship dynamics relevant to treatment and support systems.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Disability</div>
       <div class="principle-detail">Shapes communication needs, physical access, and how a client's other struggles get seen — or overlooked — by providers.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Age &amp; generation</div>
       <div class="principle-detail">Shapes relationships with technology, family expectations, and what a "normal" life stage is supposed to look like.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Language &amp; immigration</div>
       <div class="principle-detail">Shapes comfort with formal systems, family separation stress, and whether English is the language someone feels safest in.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Family structure</div>
       <div class="principle-detail">Blended families, chosen family, multigenerational households — "family" doesn't look the same for every client.</div>
     </div>
     <div class="principle-card">
       <div class="principle-label">Military/veteran status</div>
       <div class="principle-detail">Can shape stoicism, structure, trust in civilian systems, and unique trauma exposure relevant to treatment.</div>
     </div>
   </div>`,

  `<div class="callout"><strong>No single row on that list defines a person, and most of it is invisible at a glance.</strong> A real person is the specific, individual interaction of all of these at once — which is exactly why assuming from a single visible trait gets it wrong so often, and why asking matters so much more than guessing.</div>`,

  `<h3>Try it: which consideration is most relevant here?</h3>
   <p>For each short situation, identify which piece of culture is most directly relevant to get right.</p>
   <div class="classify-card" id="cultDefineClassifyCard"></div>`,
];
const CULT_DEFINE_FINAL = `<button class="btn" onclick="cultGoTo('cult-lens')">Next: Your own lens →</button>`;

const CULT_DEFINE_ITEMS = [
  {
    prompt: "A staff member assumes a client from a small rural town must hold certain political views, and makes a passing comment along those lines before actually asking her anything about herself.",
    options: ["Political views — an assumption made from geography, not from her", "Religion — she probably attends church"],
    correctIdx: 0,
    explain: "Geography doesn't reliably predict political views, and leading with an assumption instead of curiosity risks putting words in her mouth before she's said anything at all."
  },
  {
    prompt: "A client mentions he can't attend a recommended weekly aftercare group because he doesn't have reliable transportation and can't afford to miss more hourly-wage shifts.",
    options: ["Income & class — practical barriers shaped by financial reality", "Age & generation"],
    correctIdx: 0,
    explain: "Transportation and the ability to take unpaid time off are classic ways income and class shape whether a clinically 'right' recommendation is actually usable for a given client."
  },
  {
    prompt: "A counselor refers to a client's partner using a pronoun the client hasn't used yet, based on an assumption about the client's orientation.",
    options: ["Sexual orientation & gender — an assumption made instead of asked", "Family structure"],
    correctIdx: 0,
    explain: "Assuming a partner's gender, or a client's orientation, before the client has said anything is exactly the kind of small assumption that can quietly damage trust — asking costs nothing and prevents it."
  },
];
function cultRenderDefine(){
  cultRenderDecision('cultDefineClassifyCard', CULT_DEFINE_ITEMS, 'cult-define');
}

/* ---- Your own lens ---- */
const CULT_LENS_BEATS = [
  `<p class="lede">It's tempting to think of "culture" as something other people have, while your own way of seeing the world is just... normal. It isn't. It's a culture too — you just can't see it as easily, because you're standing inside it.</p>`,

  `<h3>The lens you don't notice you're wearing</h3>
   <p>Everything you consider "obvious" — what a healthy family looks like, how much emotion is normal to show, whether asking for help is a strength or a weakness, what a "good" recovery timeline looks like — was shaped by your own background just as much as a client's was shaped by theirs. The difference is that your own assumptions tend to feel invisible, like plain facts about the world, rather than one perspective among many. That invisibility is exactly what makes them risky: it's very hard to question something that doesn't feel like an assumption at all.</p>`,

  `<h3>Where this shows up in the room</h3>
   <p>A clinician who grew up in a family where emotions were discussed openly might unconsciously read a more reserved client as "resistant" or "not really engaging," when the client is actually engaging fully — just through a different cultural template for how feelings get expressed. A clinician whose own family treated asking for outside help as completely normal might not register how much it costs a client from a different background to be sitting in this chair at all. Neither read is malicious. Both are the clinician's own lens, quietly doing the interpreting.</p>`,

  `<div class="callout"><strong>Your own political and religious views belong to you, not to the session.</strong> Whatever you believe personally, the room isn't the place to share it, debate it, or let it color how you read a client's choices. This connects directly to the self-disclosure principle from the Ethics module — whose need is it serving if a client learns what you believe? Almost never theirs.</div>`,

  `<h3>A useful habit: naming your own reaction to yourself</h3>
   <p>You don't need to eliminate your own perspective — that's not possible, and it isn't the goal. The goal is noticing when it's active. If you catch yourself thinking "that's not how a normal family handles this" or "I don't get why that would even bother her," that reaction is worth pausing on. It's rarely a fact about the client. It's much more often a fact about your own lens meeting something unfamiliar.</p>`,

  `<h3>Quick check</h3>
   <div class="quiz-card" id="cultLensQuizCard"></div>`,
];
const CULT_LENS_FINAL = `<button class="btn" onclick="cultGoTo('cult-humility')">Next: What humility actually means →</button>`;

const CULT_LENS_QUIZ_ITEMS = [
  {
    q: "A counselor notices a client rarely makes eye contact and privately starts wondering if she's being dishonest or disengaged. What's the most useful next thought?",
    options: [
      "Trust the read — body language is universal, so this is a reliable warning sign",
      "Notice that eye-contact norms vary by culture and individual, and stay curious rather than concluding dishonesty from this alone",
      "Confront her directly about seeming dishonest",
    ],
    correctIdx: 1,
    explain: "Eye contact norms differ significantly across cultures and individuals. Treating a single, ambiguous cue as proof of dishonesty is exactly the kind of unexamined lens this section is about."
  },
  {
    q: "A client asks a counselor directly what she personally thinks about a political topic that's come up. What's the best response?",
    options: [
      "Share a brief, honest opinion since the client asked directly",
      "Redirect warmly without sharing a personal view, and turn the focus back to what the topic means for the client",
      "Refuse to respond at all and change the subject abruptly",
    ],
    correctIdx: 1,
    explain: "A warm redirect that doesn't share the counselor's own view, while still engaging with what matters to the client about it, keeps the session about the client — without a cold, jarring shutdown either."
  },
];
function cultRenderLensQuiz(){
  buildQuiz('cultLensQuizCard', CULT_LENS_QUIZ_ITEMS, ()=>cultMarkComplete('cult-lens'));
}

/* ---- What humility means ---- */
const CULT_HUMILITY_BEATS = [
  `<p class="lede">"Humility" gets used loosely enough in everyday language that it's worth pinning down exactly what it means in this specific context, because the definition changes what you're actually supposed to do with it.</p>`,

  `<h3>Humility, defined plainly</h3>
   <p>Here, humility means this: <strong>you do not automatically know important things about someone's life just because you've noticed which categories they might fall into.</strong> Not because you're uninformed, but because no category — race, income, faith, orientation, hometown — is ever the whole story of one specific human being. Humility is the honest acknowledgment of that limit, paired with genuine curiosity to close the gap by asking, rather than by assuming.</p>`,

  `<h3>Why "competence" is the wrong goal, and "humility" is the right one</h3>
   <p>Older training frameworks sometimes talked about "cultural competence" — the idea that with enough study, a clinician could become competent in a culture, almost like completing a course. The problem is that no culture is a fixed body of facts you can finish learning, and no individual is a perfect representative of any group they belong to. <span class="term" onclick="this.classList.toggle('term-open')">Cultural humility<span class="term-def">A lifelong stance of curiosity and self-reflection about culture and difference, rather than a finite body of knowledge that can be mastered or completed.</span></span> replaces "I have finished learning about this" with "I will keep learning about this, for as long as I do this work." It's not a certificate you earn once. It's a posture you hold for your whole career.</p>`,

  `<div class="callout"><strong>This reframe should feel like relief, not pressure.</strong> You are never going to fully "master" the cultural background of every client you'll ever meet, and you're not supposed to. The bar isn't total knowledge — it's staying curious, asking respectfully, and not pretending to know more than you do.</div>`,

  `<h3>Try it: competence mindset or humility mindset?</h3>
   <div class="classify-card" id="cultHumilityClassifyCard"></div>`,
];
const CULT_HUMILITY_FINAL = `<button class="btn" onclick="cultMarkComplete('cult-humility'); cultGoTo('cult-authorship')">Next: The author of their own story →</button>`;

const CULT_HUMILITY_ITEMS = [
  {
    prompt: "\"I've worked with a lot of clients from this background before, so I already have a good sense of what's going on with her.\"",
    options: ["Competence mindset", "Humility mindset"],
    correctIdx: 0,
    explain: "Treating past experience with a broad group as if it explains this specific individual is the competence mindset — it substitutes a general pattern for actually asking this client about her own life."
  },
  {
    prompt: "\"I don't want to assume anything about what this means to him — let me ask him directly what's important for me to understand.\"",
    options: ["Competence mindset", "Humility mindset"],
    correctIdx: 1,
    explain: "Staying curious and asking directly, instead of relying on prior assumptions, is exactly the humility mindset in action."
  },
];
function cultRenderHumility(){
  cultRenderDecision('cultHumilityClassifyCard', CULT_HUMILITY_ITEMS, 'cult-humility');
}

/* ---- Authorship ---- */
const CULT_AUTHORSHIP_BEATS = [
  `<p class="lede">Here's the single most practical idea in this entire module: the client in front of you is always the leading expert on their own life. Not you, no matter how much you've read or how many clients you've worked with who share a trait with them.</p>`,

  `<h3>Group averages don't predict individuals</h3>
   <p>Even a completely accurate general pattern about a group — say, a real statistical tendency in how a certain community relates to faith, or family, or authority — tells you very little about the specific person sitting across from you. The variation <em>within</em> almost any group is enormous, usually far larger than the average difference <em>between</em> groups. Two clients who share a race, a hometown, an income bracket, or a religion can have almost nothing else in common in how they actually relate to those things. Treating a group pattern as a prediction about an individual gets it wrong constantly, even when the underlying pattern itself is real.</p>`,

  `<h3>Ask, don't assume</h3>
   <p>The practical fix is almost embarrassingly simple, and it's the same fix in every single case: ask the client, rather than deciding on their behalf. Some useful ways to open that door:</p>
   <ul class="checklist">
     <li>"What's important for me to understand about your background as we work together?"</li>
     <li>"Is there anything about your culture, faith, or community that's shaping how you're thinking about this?"</li>
     <li>"I don't want to assume — can you tell me what that's actually like for you?"</li>
   </ul>
   <p>Notice none of these require the clinician to already know anything. They just require curiosity and a willingness to let the client be the one who answers.</p>`,

  `<div class="callout"><strong>This cuts both directions.</strong> Don't assume a client's struggles are explained by a category they belong to — and just as importantly, don't assume a category doesn't matter to them just because it doesn't seem to matter to you. Either assumption skips the same step: actually asking.</div>`,

  `<h3>Try it: assumption or curiosity?</h3>
   <div class="classify-card" id="cultAuthorshipClassifyCard"></div>`,
];
const CULT_AUTHORSHIP_FINAL = `<button class="btn" onclick="cultGoTo('cult-intersectionality')">Next: Intersectionality →</button>`;

const CULT_AUTHORSHIP_ITEMS = [
  {
    prompt: "\"She's from a wealthy family, so money obviously isn't part of what's driving this for her.\"",
    options: ["Assumption", "Curiosity"],
    correctIdx: 0,
    explain: "This decides, on the client's behalf and without asking, that income isn't a relevant factor — exactly the kind of assumption that can miss something significant, in either direction."
  },
  {
    prompt: "\"I noticed you mentioned your faith a couple of times — is that something that matters to how you think about recovery?\"",
    options: ["Assumption", "Curiosity"],
    correctIdx: 1,
    explain: "This opens a door based on something the client actually said, and lets the client decide how to answer, rather than deciding for them."
  },
];
function cultRenderAuthorship(){
  cultRenderDecision('cultAuthorshipClassifyCard', CULT_AUTHORSHIP_ITEMS, 'cult-authorship');
}

/* ---- Intersectionality ---- */
const CULT_INTERSECTIONALITY_BEATS = [
  `<p class="lede">Every piece of culture covered so far has been discussed one at a time. Real people don't experience their identities one at a time — they experience all of them together, at once, interacting with each other in ways that can't be predicted by looking at any single piece alone.</p>`,

  `<h3>What intersectionality means</h3>
   <p><span class="term" onclick="this.classList.toggle('term-open')">Intersectionality<span class="term-def">A framework describing how overlapping aspects of a person's identity — race, gender, class, orientation, disability, and more — combine and interact, rather than simply adding together, to shape a unique experience that can't be fully understood by looking at any one identity alone.</span></span> is the idea that overlapping identities don't just stack up like separate line items — they interact, and that interaction creates experiences that are genuinely different from any single identity considered on its own. Two clients who share one identity in common can still have almost nothing else in common once you factor in the rest of who they are.</p>`,

  `<h3>A concrete example</h3>
   <div class="card">
     <div class="step-header"><span class="step-number">1</span><span class="step-title">Consider two women veterans</span></div>
     <div class="model-answer">One is a 24-year-old first-generation college graduate from a major city. The other is a 55-year-old who grew up on a multigenerational family farm.

Both share "woman" and "veteran." Almost everything else about how they experienced military culture, how they talk about their service, what support systems exist around them, and what recovery even looks like day to day, may be completely different.</div>
     <p style="font-size:13px; color:var(--ink-soft); margin-bottom:0;">Neither "woman" nor "veteran" alone predicts either of their experiences. It's the specific combination — plus their age, background, and everything else — that shapes what's actually true for each of them.</p>
   </div>`,

  `<div class="callout"><strong>The clinical takeaway isn't complicated, even though the concept has a long name:</strong> don't stop asking after you've learned one thing about a client. A single identity, however accurately noted, is never the whole intersection of who someone is.</div>`,

  `<h3>Quick check</h3>
   <div class="quiz-card" id="cultIntersectionalityQuizCard"></div>`,
];
const CULT_INTERSECTIONALITY_FINAL = `<button class="btn" onclick="cultMarkComplete('cult-intersectionality'); cultGoTo('cult-practice')">Next: Asking well →</button>`;

const CULT_INTERSECTIONALITY_QUIZ_ITEMS = [
  {
    q: "A staff member learns a client is a single mother and assumes they now understand her main stressors, without asking about anything else in her life. What's the issue?",
    options: [
      "No issue — being a single mother is usually the dominant factor in someone's stress",
      "It treats one identity as if it explains the whole picture, when her specific combination of circumstances — income, health, community support, and more — is what actually shapes her experience",
    ],
    correctIdx: 1,
    explain: "Even a real, relevant identity like 'single mother' doesn't predict the full picture on its own — the interaction with everything else in her life is what actually determines her lived experience."
  },
];
function cultRenderIntersectionalityQuiz(){
  buildQuiz('cultIntersectionalityQuizCard', CULT_INTERSECTIONALITY_QUIZ_ITEMS, ()=>cultMarkComplete('cult-intersectionality'));
}

/* ---- Asking well, and recovering from mistakes ---- */
const CULT_PRACTICE_BEATS = [
  `<p class="lede">Everything in this module points toward two practical skills: asking well in the first place, and recovering gracefully on the (inevitable) occasions you get something wrong.</p>`,

  `<h3>Asking well</h3>
   <ul class="checklist">
     <li><strong>Ask open questions, not leading ones:</strong> "What's that like for you?" invites more than "That must be really hard, right?" which quietly supplies the answer.</li>
     <li><strong>Ask at the right moment, not as an interrogation:</strong> weave curiosity into the natural flow of a session rather than running through a checklist of identity questions up front.</li>
     <li><strong>Let "I'd rather not talk about that" be a complete answer:</strong> curiosity doesn't mean every question gets answered — respecting a boundary here is itself a form of cultural humility.</li>
     <li><strong>Don't outsource your own learning to the client as their job:</strong> it's fine to look something up on your own time; it's not the client's responsibility to educate you about their entire background during their own treatment.</li>
   </ul>`,

  `<h3>When you get something wrong</h3>
   <p>You will, at some point, make an assumption, use the wrong term, mispronounce a name, or misgender someone. This is normal, not a moral failure — and how you handle the moment matters far more than the mistake itself.</p>
   <div class="hero-compare">
     <div class="hero-col deny">
       <span class="hero-tag">Centers your own discomfort</span>
       <p>"Oh my gosh, I am SO sorry, I feel terrible, I can't believe I did that, I really try so hard to get this right, I hope you know I would never mean to..."</p>
     </div>
     <div class="hero-col survive">
       <span class="hero-tag">Brief, genuine, moves on</span>
       <p>"Sorry — thank you for correcting me." Then continues the conversation without dwelling on it further.</p>
     </div>
   </div>
   <p class="hero-note">A long, anxious apology asks the client to manage the clinician's guilt on top of whatever they were already dealing with. A brief, genuine correction respects them enough not to make the moment about the clinician at all.</p>`,

  `<h3>Try it: write your response</h3>
   <p>You've used the wrong pronoun for a client's partner twice in one session. The client gently corrects you the second time: "Actually, it's 'she.'"</p>

   <h3>What your answer needs</h3>
   <ul class="checklist">
     <li>A brief, genuine acknowledgment — not an extended apology</li>
     <li>No explanation or justification for the mistake</li>
     <li>An immediate return to the actual conversation, without lingering on it</li>
   </ul>

   <div class="scenario-box">
     <div class="who">Individual session — client just corrected a pronoun</div>
     <div class="meta">Her tone was calm and matter-of-fact, not upset.</div>
     <p style="margin:0;">Write out exactly what you'd say next.</p>
   </div>
   <textarea id="cultPracticeAnswer" placeholder="e.g. Thank you — got it. So you were saying she..." style="min-height:100px;" oninput="document.getElementById('cultPracticeRevealBtn').disabled = !this.value.trim()"></textarea>
   <div style="margin-top:10px;">
     <button class="btn" id="cultPracticeRevealBtn" disabled onclick="cultRevealModel('cultPractice'); cultMarkComplete('cult-practice')">Reveal model answer</button>
   </div>
   <div class="reveal" id="cultPracticeReveal">
     <div class="card-label">One reasonable way to handle this</div>
     <div class="model-answer">"Thank you — got it. So, going back to what you were saying about her..."</div>
     <ul class="checklist">
       <li>Brief and genuine, without an extended apology that would ask the client to manage the counselor's discomfort</li>
       <li>No justification or explanation offered — none was needed or asked for</li>
       <li>Immediately returns to the actual content of the session, which is where the client's attention deserves to stay</li>
     </ul>
   </div>`,
];
const CULT_PRACTICE_FINAL = `<button class="btn" onclick="cultGoTo('cult-assembly')">Next: Put it together — Danielle →</button>`;

/* ---- Final assembly: what you assumed about Danielle ---- */
const CULT_ASSEMBLY_BEATS = [
  `<p class="lede">One last exercise, pulling together everything in this module — using a client you already know well from the rest of this training, and a set of small, entirely plausible assumptions a well-meaning staff member could make about her without meaning any harm at all.</p>`,

  `<div class="scenario-box">
     <div class="who">Danielle — intake day, before anyone has really talked with her yet</div>
     <div class="meta">Paperwork lists her hometown, occupation, and emergency contact (her mother). She's polite but quiet during intake.</div>
     <p style="margin:0;">A staff member glances over her paperwork and forms a few quick, unspoken impressions before ever really talking with her.</p>
   </div>`,

  `<h3>Work through it</h3>
   <p>For each assumption a staff member might quietly form, decide whether it's a safe, evidence-based inference or an assumption that needs to be checked by actually asking.</p>
   <div class="classify-card" id="cultAssemblyClassifyCard"></div>`,

  `<div class="reveal" id="cultAssemblyOverallReveal">
     <div class="card-label">Putting the whole picture together</div>
     <div class="callout">None of the assumptions above came from a bad place — they're the ordinary, automatic guesses any brain makes when it doesn't have full information yet. That's exactly why this module exists: not because staff here are careless, but because filling gaps with assumption is what minds do by default, and it takes a deliberate habit of curiosity to catch it before it shapes how someone gets treated. Danielle's quietness during intake could mean any number of things — and the only way to actually know is the same answer this whole module keeps returning to: ask her.</div>
   </div>`,

  `<h3>Bringing it all together</h3>
   <p>Step back from Danielle specifically for a second. Every piece of this module was building toward the same underlying habit of mind: catching the moment your brain fills in a gap with a guess, and choosing curiosity instead.</p>
   <ul class="checklist">
     <li>Culture is everything that shapes how someone understands illness, help, family, and recovery — race, income, geography, faith, politics, gender, orientation, disability, age, language, family structure, and more</li>
     <li>You have a culture too, and it's shaping the room whether you notice it or not — including your own political and religious views, which belong outside the session, not in it</li>
     <li>Cultural humility is a lifelong stance of curiosity, not a finite body of knowledge you can finish learning</li>
     <li>The client is always the leading expert on their own life — group patterns, even accurate ones, rarely predict a specific individual</li>
     <li>Identities intersect and interact rather than simply stacking up — one identity, however real, is never the whole picture</li>
     <li>Ask open questions instead of guessing, and when you get something wrong, a brief, genuine correction beats a long apology every time</li>
   </ul>
   <div class="callout"><strong>The thing to actually carry with you:</strong> the person sitting across from you already knows their own story completely. Your job was never to arrive already knowing it too — it was always just to stay curious enough to let them tell it.</div>
   <span class="badge-done" id="cultFinalBadge" style="display:none;">🎉 You've completed the Cultural Humility module — nice work</span>
   <div class="callout" style="margin-top:16px;">
     <strong>Keep this handy:</strong> the <span class="inline-link" onclick="cultGoTo('cult-cheatsheet')" role="link" tabindex="0">quick reference cheat sheet</span> is built to be reopened before a session where difference is showing up, not just read once during training.
   </div>`,
];
const CULT_ASSEMBLY_FINAL = `<button class="btn secondary" onclick="cultGoTo('cult-cheatsheet')">View quick reference cheat sheet</button>
  <button class="btn" onclick="goHome()" style="margin-left:12px;">Finish: Back to Clinical Training →</button>`;

const CULT_ASSEMBLY_ITEMS = [
  {
    prompt: "\"She listed her mother as emergency contact, so they must have a warm, uncomplicated relationship.\"",
    options: ["Safe inference", "Needs to be checked by asking"],
    correctIdx: 1,
    explain: "Being the emergency contact says nothing reliable about what the relationship actually feels like — plenty of people list a parent out of practicality, logistics, or lack of anyone else, even when real tension exists. This needs to be asked about, not assumed from a form."
  },
  {
    prompt: "\"She listed her mother as emergency contact, so her mother is an important person to potentially include in family sessions.\"",
    options: ["Safe inference", "Needs to be checked by asking"],
    correctIdx: 0,
    explain: "This is a reasonably safe, low-stakes inference directly supported by the paperwork itself — though confirming with Danielle who she wants involved is still good practice, this particular read isn't a risky leap."
  },
  {
    prompt: "\"She's quiet during intake, so she's probably not very engaged or motivated for treatment.\"",
    options: ["Safe inference", "Needs to be checked by asking"],
    correctIdx: 1,
    explain: "Quietness on day one could reflect exhaustion, withdrawal symptoms, cultural communication style, fear, or a dozen other things that have nothing to do with motivation — this is exactly the kind of gap that needs curiosity, not a conclusion."
  },
  {
    prompt: "\"Her hometown is listed as a small town a few hours away, so she's probably never had access to much in the way of treatment resources before now.\"",
    options: ["Safe inference", "Needs to be checked by asking"],
    correctIdx: 1,
    explain: "This might be true, or she may have had significant prior treatment history elsewhere — geography alone doesn't reliably tell you either way, and her actual history belongs in the ASAM assessment, gathered by asking her directly."
  },
];

function cultShowAssemblyOverall(){
  const el = document.getElementById('cultAssemblyOverallReveal');
  if(el) el.classList.add('show');
}
function cultRenderAssembly(){
  cultRenderDecision('cultAssemblyClassifyCard', CULT_ASSEMBLY_ITEMS, 'cult-assembly', cultShowAssemblyOverall);
  renderCultureNav();
}

/* ---- Init ---- */
registerBeats('welcomeBeats', WELCOME_BEATS, WELCOME_FINAL);
registerBeats('threadBeats', THREAD_BEATS, THREAD_FINAL);
registerBeats('threadExampleBeats', THREAD_EXAMPLE_BEATS, THREAD_EXAMPLE_FINAL,
  ()=>buildQuiz('quizCard', QUIZ_ITEMS, ()=>bpMarkComplete('thread-example')),
  ()=>!!bpProgress['thread-example']);
renderBPNav();

registerBeats('locWhyBeats', LOC_WHY_BEATS, LOC_WHY_FINAL);
registerBeats('locContinuumBeats', LOC_CONTINUUM_BEATS, LOC_CONTINUUM_FINAL, locRenderContinuum, ()=>!!locProgress['loc-continuum']);
registerBeats('locFocusBeats', LOC_FOCUS_BEATS, LOC_FOCUS_FINAL, locRenderFocus, ()=>!!locProgress['loc-focus']);
registerBeats('locTestBeats', LOC_TEST_BEATS, LOC_TEST_FINAL);
registerBeats('locPractice1Beats', LOC_PRACTICE1_BEATS, LOC_PRACTICE1_FINAL, locRenderPractice1, ()=>!!locProgress['loc-practice1']);
registerBeats('locTransitionsBeats', LOC_TRANSITIONS_BEATS, LOC_TRANSITIONS_FINAL);
registerBeats('locPractice2Beats', LOC_PRACTICE2_BEATS, LOC_PRACTICE2_FINAL, locRenderPractice2, ()=>!!locProgress['loc-practice2']);
registerBeats('locDomainsBeats', LOC_DOMAINS_BEATS, LOC_DOMAINS_FINAL, locRenderDomains, ()=>!!locProgress['loc-domains']);
registerBeats('locJustifyBeats', LOC_JUSTIFY_BEATS, LOC_JUSTIFY_FINAL, null, ()=>!!locProgress['loc-justify']);
registerBeats('locAssemblyBeats', LOC_ASSEMBLY_BEATS, LOC_ASSEMBLY_FINAL, locRenderAssembly, ()=>!!locProgress['loc-assembly']);
renderLOCNav();

registerBeats('whyBeats', WHY_BEATS, WHY_FINAL);
registerBeats('specificityBeats', SPECIFICITY_BEATS, SPECIFICITY_FINAL, renderClassify, ()=>!!asamProgress['specificity']);
registerBeats('dim1Beats', DIM1_BEATS, DIM1_FINAL, null, ()=>!!asamProgress['dim1']);
registerBeats('dim2Beats', DIM2_BEATS, DIM2_FINAL, null, ()=>!!asamProgress['dim2']);
registerBeats('dim3Beats', DIM3_BEATS, DIM3_FINAL, null, ()=>!!asamProgress['dim3']);
registerBeats('dim4Beats', DIM4_BEATS, DIM4_FINAL, null, ()=>!!asamProgress['dim4']);
registerBeats('dim5Beats', DIM5_BEATS, DIM5_FINAL, null, ()=>!!asamProgress['dim5']);
registerBeats('dim6Beats', DIM6_BEATS, DIM6_FINAL, null, ()=>!!asamProgress['dim6']);
registerBeats('ratingBeats', RATING_BEATS, RATING_FINAL, renderRatingExamples, ()=>!!asamProgress['rating']);
registerBeats('criteriaBeats', CRITERIA_BEATS, CRITERIA_FINAL, ()=>{ renderCriteria(); renderASAMFinalQuiz(); }, ()=>!!asamProgress['criteria']);
registerBeats('assemblyBeats', ASSEMBLY_BEATS, ASSEMBLY_FINAL, renderAssemblyRatings, ()=>!!asamProgress['assembly']);
renderASAMNav();

registerBeats('itpWhyBeats', ITP_WHY_BEATS, ITP_WHY_FINAL);
registerBeats('itpAnatomyBeats', ITP_ANATOMY_BEATS, ITP_ANATOMY_FINAL);
registerBeats('itpAnatomyExampleBeats', ITP_ANATOMY_EXAMPLE_BEATS, ITP_ANATOMY_EXAMPLE_FINAL);
registerBeats('itpFromFindingBeats', ITP_FROMFINDING_BEATS, ITP_FROMFINDING_FINAL, null, ()=>!!itpProgress['itpfromfinding']);
registerBeats('itpObjectivesBeats', ITP_OBJECTIVES_BEATS, ITP_OBJECTIVES_FINAL, null, ()=>!!itpProgress['itpobjectives']);
registerBeats('itpInterventionsBeats', ITP_INTERVENTIONS_BEATS, ITP_INTERVENTIONS_FINAL, null, ()=>!!itpProgress['itpinterventions']);
registerBeats('itpIndividualizedBeats', ITP_INDIVIDUALIZED_BEATS, ITP_INDIVIDUALIZED_FINAL, renderItpClassify, ()=>!!itpProgress['itpindividualized']);
registerBeats('itpGoalsBeats', ITP_GOALS_BEATS, ITP_GOALS_FINAL);
registerBeats('itpReviewsBeats', ITP_REVIEWS_BEATS, ITP_REVIEWS_FINAL, renderItpReviewsQuiz, ()=>!!itpProgress['itpreviews']);
registerBeats('itpAssemblyBeats', ITP_ASSEMBLY_BEATS, ITP_ASSEMBLY_FINAL, null, ()=>!!itpProgress['itpassembly']);
renderITPNav();

registerBeats('noteWhyBeats', NOTE_WHY_BEATS, NOTE_WHY_FINAL);
registerBeats('noteAnatomyBeats', NOTE_ANATOMY_BEATS, NOTE_ANATOMY_FINAL);
registerBeats('noteTypesBeats', NOTE_TYPES_BEATS, NOTE_TYPES_FINAL, renderNoteTypesQuiz, ()=>!!noteProgress['notetypes']);
registerBeats('noteDescribeBeats', NOTE_DESCRIBE_BEATS, NOTE_DESCRIBE_FINAL, null, ()=>!!noteProgress['notedescribe']);
registerBeats('noteResponseBeats', NOTE_RESPONSE_BEATS, NOTE_RESPONSE_FINAL, null, ()=>!!noteProgress['noteresponse']);
registerBeats('noteRiskBeats', NOTE_RISK_BEATS, NOTE_RISK_FINAL, renderRiskQuiz, ()=>!!noteProgress['noterisk']);
registerBeats('noteAssemblyBeats', NOTE_ASSEMBLY_BEATS, NOTE_ASSEMBLY_FINAL, null, ()=>!!noteProgress['noteassembly']);
renderNoteNav();

registerBeats('conclArcBeats', CONCL_ARC_BEATS, CONCL_ARC_FINAL, renderConclArcQuiz, ()=>!!conclusionProgress['concl-arc']);
registerBeats('conclMondayBeats', CONCL_MONDAY_BEATS, CONCL_MONDAY_FINAL, conclMondayAfterRender);
renderConclusionNav();

registerBeats('cocWhyBeats', COC_WHY_BEATS, COC_WHY_FINAL);
registerBeats('cocScopeBeats', COC_SCOPE_BEATS, COC_SCOPE_FINAL, cocRenderScope, ()=>!!cocProgress['coc-scope']);
registerBeats('cocWithdrawalBeats', COC_WITHDRAWAL_BEATS, COC_WITHDRAWAL_FINAL, cocRenderWithdrawalQuiz, ()=>!!cocProgress['coc-withdrawal']);
registerBeats('cocBaselineBeats', COC_BASELINE_BEATS, COC_BASELINE_FINAL, cocRenderBaseline, ()=>!!cocProgress['coc-baseline']);
registerBeats('cocSiReframeBeats', COC_SI_REFRAME_BEATS, COC_SI_REFRAME_FINAL, cocRenderSiReframeQuiz, ()=>!!cocProgress['coc-si-reframe']);
registerBeats('cocSiResponseBeats', COC_SI_RESPONSE_BEATS, COC_SI_RESPONSE_FINAL, cocRenderSiResponseQuiz, ()=>!!cocProgress['coc-si-response']);
registerBeats('cocAssemblyBeats', COC_ASSEMBLY_BEATS, COC_ASSEMBLY_FINAL, cocRenderAssembly, ()=>!!cocProgress['coc-assembly']);
renderCOCNav();

registerBeats('miWhyBeats', MI_WHY_BEATS, MI_WHY_FINAL);
registerBeats('miSpiritBeats', MI_SPIRIT_BEATS, MI_SPIRIT_FINAL, miRenderSpiritQuiz, ()=>!!miProgress['mi-spirit']);
registerBeats('miStagesBeats', MI_STAGES_BEATS, MI_STAGES_FINAL, miRenderStages, ()=>!!miProgress['mi-stages']);
registerBeats('miOarsBeats', MI_OARS_BEATS, MI_OARS_FINAL, miRenderOars, ()=>!!miProgress['mi-oars']);
registerBeats('miReflectionsBeats', MI_REFLECTIONS_BEATS, MI_REFLECTIONS_FINAL, null, ()=>!!miProgress['mi-reflections']);
registerBeats('miResistanceBeats', MI_RESISTANCE_BEATS, MI_RESISTANCE_FINAL, miRenderResistanceQuiz, ()=>!!miProgress['mi-resistance']);
registerBeats('miChangetalkBeats', MI_CHANGETALK_BEATS, MI_CHANGETALK_FINAL, miRenderChangetalk, ()=>!!miProgress['mi-changetalk']);
registerBeats('miAssemblyBeats', MI_ASSEMBLY_BEATS, MI_ASSEMBLY_FINAL, miRenderAssembly, ()=>!!miProgress['mi-assembly']);
renderMINav();

registerBeats('grWhyBeats', GR_WHY_BEATS, GR_WHY_FINAL);
registerBeats('grTypesBeats', GR_TYPES_BEATS, GR_TYPES_FINAL, grRenderTypes, ()=>!!groupProgress['gr-types']);
registerBeats('grWorkingGroupBeats', GR_WORKINGGROUP_BEATS, GR_WORKINGGROUP_FINAL, grRenderWorkingGroup, ()=>!!groupProgress['gr-workinggroup']);
registerBeats('grSkillsBeats', GR_SKILLS_BEATS, GR_SKILLS_FINAL, grRenderSkills, ()=>!!groupProgress['gr-skills']);
registerBeats('grBlockingBeats', GR_BLOCKING_BEATS, GR_BLOCKING_FINAL, null, ()=>!!groupProgress['gr-blocking']);
registerBeats('grTopicsBeats', GR_TOPICS_BEATS, GR_TOPICS_FINAL, grRenderTopics, ()=>!!groupProgress['gr-topics']);
registerBeats('grDifficultBeats', GR_DIFFICULT_BEATS, GR_DIFFICULT_FINAL, grRenderDifficult, ()=>!!groupProgress['gr-difficult']);
registerBeats('grAssemblyBeats', GR_ASSEMBLY_BEATS, GR_ASSEMBLY_FINAL, grRenderAssembly, ()=>!!groupProgress['gr-assembly']);
renderGroupNav();

registerBeats('ethWhyBeats', ETH_WHY_BEATS, ETH_WHY_FINAL);
registerBeats('ethPrinciplesBeats', ETH_PRINCIPLES_BEATS, ETH_PRINCIPLES_FINAL, ethRenderPrinciples, ()=>!!ethProgress['eth-principles']);
registerBeats('ethDualBeats', ETH_DUAL_BEATS, ETH_DUAL_FINAL, ethRenderDual, ()=>!!ethProgress['eth-dual']);
registerBeats('ethSelfdisclosureBeats', ETH_SELFDISCLOSURE_BEATS, ETH_SELFDISCLOSURE_FINAL, null, ()=>!!ethProgress['eth-selfdisclosure']);
registerBeats('ethGiftsBeats', ETH_GIFTS_BEATS, ETH_GIFTS_FINAL, ethRenderGifts, ()=>!!ethProgress['eth-gifts']);
registerBeats('ethConfidentialityBeats', ETH_CONFIDENTIALITY_BEATS, ETH_CONFIDENTIALITY_FINAL, ethRenderConfidentialityQuiz, ()=>!!ethProgress['eth-confidentiality']);
registerBeats('ethCrossingBeats', ETH_CROSSING_BEATS, ETH_CROSSING_FINAL, ethRenderCrossing, ()=>!!ethProgress['eth-crossing']);
registerBeats('ethAssemblyBeats', ETH_ASSEMBLY_BEATS, ETH_ASSEMBLY_FINAL, ethRenderAssembly, ()=>!!ethProgress['eth-assembly']);
renderEthNav();

registerBeats('famWhyBeats', FAM_WHY_BEATS, FAM_WHY_FINAL);
registerBeats('famWebBeats', FAM_WEB_BEATS, FAM_WEB_FINAL);
registerBeats('famRolesBeats', FAM_ROLES_BEATS, FAM_ROLES_FINAL, famRenderRoles, ()=>!!familyProgress['fam-roles']);
registerBeats('famEnablingBeats', FAM_ENABLING_BEATS, FAM_ENABLING_FINAL, famRenderEnabling, ()=>!!familyProgress['fam-enabling']);
registerBeats('famCodependencyBeats', FAM_CODEPENDENCY_BEATS, FAM_CODEPENDENCY_FINAL, famRenderCodependency, ()=>!!familyProgress['fam-codependency']);
registerBeats('famSessionsBeats', FAM_SESSIONS_BEATS, FAM_SESSIONS_FINAL, famRenderSessions, ()=>!!familyProgress['fam-sessions']);
registerBeats('famResistanceBeats', FAM_RESISTANCE_BEATS, FAM_RESISTANCE_FINAL, famRenderResistance, ()=>!!familyProgress['fam-resistance']);
registerBeats('famAssemblyBeats', FAM_ASSEMBLY_BEATS, FAM_ASSEMBLY_FINAL, famRenderAssembly, ()=>!!familyProgress['fam-assembly']);
renderFamilyNav();

registerBeats('cultWhyBeats', CULT_WHY_BEATS, CULT_WHY_FINAL);
registerBeats('cultDefineBeats', CULT_DEFINE_BEATS, CULT_DEFINE_FINAL, cultRenderDefine, ()=>!!cultProgress['cult-define']);
registerBeats('cultLensBeats', CULT_LENS_BEATS, CULT_LENS_FINAL, cultRenderLensQuiz, ()=>!!cultProgress['cult-lens']);
registerBeats('cultHumilityBeats', CULT_HUMILITY_BEATS, CULT_HUMILITY_FINAL, cultRenderHumility, ()=>!!cultProgress['cult-humility']);
registerBeats('cultAuthorshipBeats', CULT_AUTHORSHIP_BEATS, CULT_AUTHORSHIP_FINAL, cultRenderAuthorship, ()=>!!cultProgress['cult-authorship']);
registerBeats('cultIntersectionalityBeats', CULT_INTERSECTIONALITY_BEATS, CULT_INTERSECTIONALITY_FINAL, cultRenderIntersectionalityQuiz, ()=>!!cultProgress['cult-intersectionality']);
registerBeats('cultPracticeBeats', CULT_PRACTICE_BEATS, CULT_PRACTICE_FINAL, null, ()=>!!cultProgress['cult-practice']);
registerBeats('cultAssemblyBeats', CULT_ASSEMBLY_BEATS, CULT_ASSEMBLY_FINAL, cultRenderAssembly, ()=>!!cultProgress['cult-assembly']);
renderCultureNav();


}
function uaMarkComplete(id){
  uaProgress[id] = true;
  uaSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}
let uaCurrentSection = 'ua-why';

function renderUaNav(){
  const navList = document.getElementById('navList-ua');
  if(!navList) return;
  navList.innerHTML = '';
  uaCHAPTERS.forEach(chapter=>{
    chapter.sections.forEach(s=>{
      const li = document.createElement('li');
      li.className = 'nav-item' + (uaCurrentSection===s.id ? ' active':'');
      li.onclick = ()=>uaGoTo(s.id);
      const check = document.createElement('span');
      check.className = 'nav-check' + (uaProgress[s.id] ? ' done':'');
      check.textContent = uaProgress[s.id] ? 'âœ“' : '';
      li.appendChild(check);
      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);
      navList.appendChild(li);
    });
  });
  const doneCount = uaTRACKED_SECTIONS.filter(s=>uaProgress[s.id]).length;
  const label = document.getElementById('progressLabel-ua');
  const fill = document.getElementById('progressFill-ua');
  if(label) label.textContent = doneCount + ' of ' + uaTRACKED_SECTIONS.length + ' complete';
  if(fill) fill.style.width = (doneCount/uaTRACKED_SECTIONS.length*100) + '%';
  const badge = document.getElementById('uaFinalBadge');
  if(badge) badge.style.display = doneCount === uaTRACKED_SECTIONS.length ? 'inline-block' : 'none';
}

function uaGoTo(id){
  uaCurrentSection = id;
  document.querySelectorAll('#view-updated-assessments section.module').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.id === id);
  });
  renderUaNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

const uaReset = document.getElementById('resetProgress-ua');
if(uaReset){
  uaReset.onclick = ()=>{
    if(confirm('Reset all Updated Assessments module progress?')){
      localStorage.removeItem('doctrain-updated-assessments-progress');
      uaProgress = {};
      uaSaveProgress();
      ['uaWhyBeats','uaNewInfoBeats','uaGapBeats','uaScenariosBeats','uaAssemblyBeats'].forEach(resetBeats);
    }
  };
}

const UA_WHY_BEATS = [
  `<p class="lede">An assessment is a picture of what we know about a client at a particular point in treatment. When that picture changes in a clinically meaningful way, the assessment has to change too.</p>`,
  `<p>There are two triggers to keep in your head. First: <strong>we learn new clinically relevant information that was not in the assessment before.</strong> Second: <strong>the client goes 24 hours or longer without receiving services.</strong></p>
   <div class="callout"><strong>The short version:</strong> new clinical information gets added to the assessment, and a 24-hour service gap gets explained in a brief updated assessment.</div>`,
  `<p>This is part of the same Golden Thread you already use everywhere else. The assessment identifies the clinical picture. The treatment plan and notes can only stay accurate if the assessment is updated when that picture changes.</p>`
];
const UA_WHY_FINAL = `<button class="btn" onclick="uaMarkComplete('ua-why'); uaGoTo('ua-newinfo')">Next: New clinical information â†’</button>`;

const UA_NEWINFO_BEATS = [
  `<p class="lede">If you learn clinically relevant information that was not known when the prior assessment was written, it belongs in an updated assessment.</p>
   <p>The important question is not whether the information is dramatic. The question is whether it changes or adds to what we clinically understand about the client.</p>`,
  `<div class="scenario-box">
     <div class="who">Example</div>
     A client discloses that they were sexually abused. That history was not identified in the original assessment, and it is now going to be addressed as part of treatment.
   </div>
   <p>That cannot live only in a progress note or only in the treatment plan. It is new, clinically relevant information that changes the clinical picture. <strong>An updated assessment is required.</strong></p>`,
  `<h3>Think beyond one kind of disclosure</h3>
   <p>The same rule applies whenever clinically relevant information emerges that the assessment did not previously contain. The assessment should reflect the information the treatment team is actually using to understand and treat the client.</p>
   <div class="callout"><strong>Useful gut-check:</strong> if this new information matters to how you understand the client's needs, risks, treatment focus, or clinical presentation, ask yourself why it is not in the assessment yet.</div>`,
  `<h3>Check your understanding</h3><div class="quiz-card" id="uaNewInfoQuizCard"></div>`
];
const UA_NEWINFO_QUIZ = [
  {
    q:"A client discloses clinically relevant trauma history that was not in the original assessment. The counselor plans to address it in treatment. What should happen?",
    options:["Document it only in the next progress note","Complete an updated assessment that includes the new clinically relevant information","Wait until discharge to add it to the record"],
    correctIdx:1,
    explain:"The clinical picture now includes information the assessment did not contain before. The assessment needs to be updated."
  },
  {
    q:"What is the basic trigger for an updated assessment when new information is involved?",
    options:["The information has to be unusually serious","The information is clinically relevant and was not known/documented in the prior assessment","The client has to specifically request a new assessment"],
    correctIdx:1,
    explain:"The rule is about new clinically relevant information, not whether it feels dramatic."
  }
];
function uaRenderNewInfo(){ buildQuiz('uaNewInfoQuizCard', UA_NEWINFO_QUIZ, ()=>uaMarkComplete('ua-newinfo')); }
const UA_NEWINFO_FINAL = `<button class="btn" onclick="uaGoTo('ua-gap')">Next: The 24-hour rule â†’</button>`;

const UA_GAP_BEATS = [
  `<p class="lede">The other trigger is time: if a client does not receive any services for <strong>24 hours or longer</strong>, there needs to be a brief updated assessment explaining why.</p>`,
  `<div class="scenario-box">
     <div class="who">Example</div>
     A client is sent to the hospital and is away from programming long enough that they receive no services for more than 24 hours.
   </div>
   <p>The chart now has a gap that needs an explanation. The updated assessment does not need to recreate the entire admission assessment. It needs to briefly identify what happened and why there was a 24-hour-or-longer interruption in services.</p>`,
  `<div class="callout"><strong>The rule is about the gap itself:</strong> once there has been 24 hours or longer with no services, explain the reason in a brief updated assessment.</div>`,
  `<h3>Check your understanding</h3><div class="quiz-card" id="uaGapQuizCard"></div>`
];
const UA_GAP_QUIZ = [
  {
    q:"A client receives no services for 30 hours because they were at the hospital. What is required?",
    options:["Nothing, because the reason is already obvious","A brief updated assessment identifying why the 24-hour-or-longer service gap occurred","Only a progress note after the client returns"],
    correctIdx:1,
    explain:"A gap of 24 hours or longer needs to be explained in a brief updated assessment."
  },
  {
    q:"A client misses one scheduled group but receives other clinical services that same day. Does the 24-hour service-gap rule apply based on that missed group alone?",
    options:["Yes","No"],
    correctIdx:1,
    explain:"The trigger described here is 24 hours or longer without receiving services, not a single missed service while other services continue."
  }
];
function uaRenderGap(){ buildQuiz('uaGapQuizCard', UA_GAP_QUIZ, ()=>uaMarkComplete('ua-gap')); }
const UA_GAP_FINAL = `<button class="btn" onclick="uaGoTo('ua-scenarios')">Next: Practice the decision â†’</button>`;

const UA_SCENARIOS = [
  {
    prompt:"During an individual session, a client discloses a history of sexual abuse that was not in the original assessment. The client and counselor are beginning to address it in treatment.",
    correct:true,
    yes:"Yes â€” updated assessment",
    no:"No updated assessment",
    explain:"Yes. This is new clinically relevant information that was not in the prior assessment and is now part of the clinical picture."
  },
  {
    prompt:"A client is away at the hospital and receives no services for 27 hours.",
    correct:true,
    yes:"Yes â€” updated assessment",
    no:"No updated assessment",
    explain:"Yes. A 24-hour-or-longer gap without services needs a brief updated assessment explaining why."
  },
  {
    prompt:"A client misses morning group, but attends an individual session and afternoon programming the same day. No new clinically relevant information emerges.",
    correct:false,
    yes:"Yes â€” updated assessment",
    no:"No updated assessment",
    explain:"No, based on the two triggers taught here. There was not a 24-hour service gap and there is no new clinically relevant information."
  },
  {
    prompt:"A client reports for the first time that the person they plan to live with after discharge is actively using substances, and this changes the treatment team's understanding of the recovery environment.",
    correct:true,
    yes:"Yes â€” updated assessment",
    no:"No updated assessment",
    explain:"Yes. The new information is clinically relevant and changes the picture the assessment is supposed to reflect."
  },
  {
    prompt:"A client receives no services for 25 hours because they were unavailable for treatment. The reason is known.",
    correct:true,
    yes:"Yes â€” updated assessment",
    no:"No updated assessment",
    explain:"Yes. Knowing the reason does not remove the need to document it. The 24-hour-or-longer gap still needs a brief updated assessment explaining why."
  }
];

function uaRenderScenarios(){
  const card = document.getElementById('uaScenarioCard');
  if(!card) return;
  card.innerHTML = '';
  const correctAnswers = new Set();

  UA_SCENARIOS.forEach((item, idx)=>{
    const row = document.createElement('div');
    row.className = 'classify-row';
    row.innerHTML = `
      <div class="classify-text">${item.prompt}</div>
      <div class="classify-buttons">
        <button class="pill-btn" data-idx="${idx}" data-answer="yes">${item.yes}</button>
        <button class="pill-btn" data-idx="${idx}" data-answer="no">${item.no}</button>
      </div>
      <div class="classify-explain" id="uaScenarioExplain-${idx}"></div>
    `;
    card.appendChild(row);
  });

  card.querySelectorAll('.pill-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.dataset.idx);
      const item = UA_SCENARIOS[idx];
      const isYes = btn.dataset.answer === 'yes';
      const correct = isYes === item.correct;
      const row = btn.closest('.classify-row');
      row.querySelectorAll('.pill-btn').forEach(b=>b.classList.remove('chosen-correct','chosen-wrong'));

      if(correct){
        btn.classList.add('chosen-correct');
        correctAnswers.add(idx);
      }else{
        btn.classList.add('chosen-wrong');
        correctAnswers.delete(idx);
      }

      const explain = document.getElementById(`uaScenarioExplain-${idx}`);
      explain.textContent = (correct ? 'Correct. ' : 'Try again. ') + item.explain;
      explain.classList.add('show');

      if(correctAnswers.size === UA_SCENARIOS.length){
        uaMarkComplete('ua-scenarios');
      }
    });
  });
}

const UA_SCENARIOS_BEATS = [
  `<p class="lede">For each situation, decide whether one of the two triggers is present: new clinically relevant information, or 24 hours or longer without services.</p>`,
  `<div class="quiz-card" id="uaScenarioCard"></div>`
];
const UA_SCENARIOS_FINAL = `<button class="btn" onclick="uaGoTo('ua-assembly')">Next: Put it together â†’</button>`;

const UA_ASSEMBLY_QUIZ = [
  {
    q:"Which statement best captures when new information requires an updated assessment?",
    options:["Whenever any new fact is learned, even if it has no clinical relevance","When new clinically relevant information emerges that was not reflected in the prior assessment","Only when a diagnosis changes"],
    correctIdx:1,
    explain:"The trigger is new clinically relevant information that the prior assessment did not contain."
  },
  {
    q:"A client has gone 24 hours or longer without receiving services. What should the updated assessment do?",
    options:["Briefly identify why the service gap occurred","Repeat every section of the original assessment word for word","Record a quiz score showing the client understands the gap"],
    correctIdx:0,
    explain:"The purpose is to explain the 24-hour-or-longer interruption in services."
  },
  {
    q:"Why does this matter to the Golden Thread?",
    options:["Because the assessment should match the clinical picture that the treatment plan and notes are working from","Because every progress note must be copied into an assessment","Because an assessment replaces the treatment plan"],
    correctIdx:0,
    explain:"The assessment is the clinical foundation. When the picture changes, the foundation needs to reflect it so the rest of the record stays connected."
  },
  {
    q:"A counselor thinks, 'I already put this new clinical information in my progress note, so I don't need to update the assessment.' What's the problem?",
    options:["Nothing â€” the note automatically changes the assessment","The note documents the session, but it does not update the assessment's clinical picture","Progress notes should never contain new information"],
    correctIdx:1,
    explain:"A progress note can document what happened in session, but clinically relevant new information still needs to be reflected in the assessment."
  }
];

function uaRenderAssembly(){ buildQuiz('uaAssemblyQuizCard', UA_ASSEMBLY_QUIZ, ()=>uaMarkComplete('ua-assembly')); }

const UA_ASSEMBLY_BEATS = [
  `<p class="lede">One last pass. You do not need a complicated decision tree. You need to recognize the two moments when the existing assessment is no longer enough.</p>
   <div class="callout"><strong>Ask two questions:</strong><br>1. Did we learn clinically relevant information that the assessment did not contain before?<br>2. Has the client gone 24 hours or longer without receiving services?</div>`,
  `<p>If the first answer is yes, update the assessment so the clinical picture is accurate. If the second answer is yes, complete a brief updated assessment that explains the service gap. Sometimes both can be true at the same time.</p>`,
  `<h3>Final check</h3><div class="quiz-card" id="uaAssemblyQuizCard"></div>`,
  `<div class="callout"><strong>Keep the principle:</strong> the assessment is not frozen at admission. When clinically relevant information changes what we know â€” or a 24-hour service gap interrupts the course of care â€” the record needs an updated assessment that tells the truth about what happened.</div>
   <span class="badge-done" id="uaFinalBadge" style="display:none;">You've completed the Updated Assessments module</span>`
];
const UA_ASSEMBLY_FINAL = `<button class="btn secondary" onclick="goHome()">â† Back to Clinical Training home</button>`;

registerBeats('uaWhyBeats', UA_WHY_BEATS, UA_WHY_FINAL);
registerBeats('uaNewInfoBeats', UA_NEWINFO_BEATS, UA_NEWINFO_FINAL, uaRenderNewInfo, ()=>!!uaProgress['ua-newinfo']);
registerBeats('uaGapBeats', UA_GAP_BEATS, UA_GAP_FINAL, uaRenderGap, ()=>!!uaProgress['ua-gap']);
registerBeats('uaScenariosBeats', UA_SCENARIOS_BEATS, UA_SCENARIOS_FINAL, uaRenderScenarios, ()=>!!uaProgress['ua-scenarios']);
registerBeats('uaAssemblyBeats', UA_ASSEMBLY_BEATS, UA_ASSEMBLY_FINAL, uaRenderAssembly, ()=>!!uaProgress['ua-assembly']);
renderUaNav();

/* =====================================================
   UPDATED ASSESSMENTS MODULE
   ===================================================== */
const uaCHAPTERS = [
  {title:'Updated Assessments', sections:[
    {id:'ua-why', label:'When an update is needed'},
    {id:'ua-newinfo', label:'New clinical information'},
    {id:'ua-gap', label:'24-hour service gaps'},
    {id:'ua-scenarios', label:'Practice the decision'},
    {id:'ua-assembly', label:'Put it into practice'},
  ]},
];

const uaSECTIONS = uaCHAPTERS.flatMap(c => c.sections);
const uaTRACKED_SECTIONS = uaSECTIONS.filter(s => s.trackProgress !== false);

let uaProgress = {};
try{
  uaProgress = JSON.parse(localStorage.getItem('doctrain-updated-assessments-progress') || '{}');
}catch(e){
  uaProgress = {};
}

function uaSaveProgress(){
  localStorage.setItem('doctrain-updated-assessments-progress', JSON.stringify(uaProgress));
  renderUaNav();
}

function uaMarkComplete(id){
  uaProgress[id] = true;
  uaSaveProgress();
  updateBeatNav(SECTION_TO_CONTAINER[id]);
}

let uaCurrentSection = 'ua-why';

function renderUaNav(){
  const navList = document.getElementById('navList-ua');
  if(!navList) return;

  navList.innerHTML = '';

  uaCHAPTERS.forEach(chapter => {
    const heading = document.createElement('li');
    heading.style.cssText = 'font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#7b9587; font-weight:700; margin:16px 0 6px; padding:0 8px;';
    heading.textContent = chapter.title;
    navList.appendChild(heading);

    chapter.sections.forEach(s => {
      const li = document.createElement('li');
      li.className = 'nav-item' + (uaCurrentSection === s.id ? ' active' : '');
      li.onclick = () => uaGoTo(s.id);

      const check = document.createElement('span');
      check.className = 'nav-check' + (uaProgress[s.id] ? ' done' : '');
      check.textContent = uaProgress[s.id] ? '\u2713' : '';
      li.appendChild(check);

      const label = document.createElement('span');
      label.textContent = s.label;
      li.appendChild(label);

      navList.appendChild(li);
    });
  });

  const doneCount = uaTRACKED_SECTIONS.filter(s => uaProgress[s.id]).length;

  const progressLabel = document.getElementById('progressLabel-ua');
  const progressFill = document.getElementById('progressFill-ua');

  if(progressLabel){
    progressLabel.textContent = doneCount + ' of ' + uaTRACKED_SECTIONS.length + ' complete';
  }
  if(progressFill){
    progressFill.style.width = (doneCount / uaTRACKED_SECTIONS.length * 100) + '%';
  }

  const finalBadge = document.getElementById('uaFinalBadge');
  if(finalBadge){
    finalBadge.style.display = doneCount === uaTRACKED_SECTIONS.length ? 'inline-block' : 'none';
  }
}

function uaGoTo(id){
  uaCurrentSection = id;

  document.querySelectorAll('#view-updated-assessments section.module').forEach(sec => {
    sec.classList.toggle('active', sec.dataset.id === id);
  });

  renderUaNav();
  closeMobileNav();
  window.scrollTo({top:0, behavior:'instant'});
}

const uaResetProgress = document.getElementById('resetProgress-ua');
if(uaResetProgress){
  uaResetProgress.onclick = () => {
    if(confirm('Reset all Updated Assessments module progress?')){
      localStorage.removeItem('doctrain-updated-assessments-progress');
      uaProgress = {};
      uaSaveProgress();
      [
        'uaWhyBeats',
        'uaNewInfoBeats',
        'uaGapBeats',
        'uaScenariosBeats',
        'uaAssemblyBeats'
      ].forEach(resetBeats);
    }
  };
}

/* ---- Why this matters ---- */
const UA_WHY_BEATS = [
  `<p class="lede">An assessment is a picture of what we know about a client at a particular point in treatment. When that picture changes in a clinically meaningful way, the assessment has to change too.</p>`,

  `<p>There are two triggers to keep in your head.</p>
   <div class="card">
     <div class="step-header"><span class="step-number">1</span><span class="step-title">New clinically relevant information</span></div>
     <p>If we learn clinically relevant information that was not reflected in the prior assessment, the assessment needs to be updated.</p>
   </div>
   <div class="card">
     <div class="step-header"><span class="step-number">2</span><span class="step-title">24 hours or longer without services</span></div>
     <p>If the client receives no services for 24 hours or longer, there needs to be a brief updated assessment explaining why the gap occurred.</p>
   </div>`,

  `<p>This fits the Golden Thread. The assessment is the clinical picture the treatment plan is built from. If the picture changes but the assessment does not, the rest of the documentation is working from an outdated foundation.</p>
   <div class="callout"><strong>The short version:</strong> new clinically relevant information gets reflected in an updated assessment, and a 24-hour-or-longer service gap gets explained in a brief updated assessment.</div>`
];

const UA_WHY_FINAL = `<button class="btn" onclick="uaMarkComplete('ua-why'); uaGoTo('ua-newinfo')">Next: New clinical information &rarr;</button>`;

/* ---- New clinically relevant information ---- */
const UA_NEWINFO_BEATS = [
  `<p class="lede">The first trigger is new information that matters clinically and was not reflected in the assessment before.</p>
   <p>The key phrase is <strong>clinically relevant</strong>. Not every new fact about a client requires an updated assessment.</p>`,

  `<div class="scenario-box">
     <div class="who">Example</div>
     A client discloses that they were sexually abused. That history was not identified in the original assessment, and it is now going to be addressed as part of treatment.
   </div>
   <p>That is new, clinically relevant information. The assessment now needs to reflect it.</p>`,

  `<p>A progress note can document that the disclosure occurred in session, but the progress note does not replace the assessment. If the new information changes or adds to the clinical picture, the assessment itself needs to be updated.</p>
   <div class="callout"><strong>Useful gut-check:</strong> Does this new information matter to how we understand the client's needs, risks, treatment focus, or clinical presentation? If yes, the assessment should reflect it.</div>`,

  `<h3>Check your understanding</h3>
   <div class="quiz-card" id="uaNewInfoQuizCard"></div>`
];

const UA_NEWINFO_QUIZ = [
  {
    q: "A client discloses clinically relevant trauma history that was not reflected in the original assessment, and it will now be addressed in treatment. What should happen?",
    options: [
      "Document it only in the next progress note",
      "Complete an updated assessment that includes the new clinically relevant information",
      "Wait until discharge to add it to the record"
    ],
    correctIdx: 1,
    explain: "The clinical picture now includes relevant information the assessment did not contain before. The assessment needs to be updated."
  },
  {
    q: "Which new information requires an updated assessment?",
    options: [
      "Every new fact learned about a client",
      "New clinically relevant information that was not reflected in the prior assessment",
      "Only information that changes the client's diagnosis"
    ],
    correctIdx: 1,
    explain: "The trigger is new clinically relevant information, not every new detail and not only a diagnosis change."
  }
];

function uaRenderNewInfo(){
  buildQuiz('uaNewInfoQuizCard', UA_NEWINFO_QUIZ, () => uaMarkComplete('ua-newinfo'));
}

const UA_NEWINFO_FINAL = `<button class="btn" onclick="uaGoTo('ua-gap')">Next: The 24-hour rule &rarr;</button>`;

/* ---- 24-hour service gap ---- */
const UA_GAP_BEATS = [
  `<p class="lede">The second trigger is a gap in services. If a client receives no services for 24 hours or longer, there needs to be a brief updated assessment explaining why.</p>`,

  `<div class="scenario-box">
     <div class="who">Example</div>
     A client goes to the hospital and receives no services for more than 24 hours.
   </div>
   <p>The chart now has a 24-hour-or-longer service gap. A brief updated assessment is needed to explain why that gap occurred.</p>`,

  `<div class="callout"><strong>Keep the rule precise:</strong> the trigger is 24 hours or longer without services. It is not simply that the client was physically away from the facility.</div>`,

  `<h3>Check your understanding</h3>
   <div class="quiz-card" id="uaGapQuizCard"></div>`
];

const UA_GAP_QUIZ = [
  {
    q: "A client receives no services for 30 hours because they were at the hospital. What is required?",
    options: [
      "Nothing, because the reason for the gap is already known",
      "A brief updated assessment explaining why the 24-hour-or-longer service gap occurred",
      "Only a progress note after the client returns"
    ],
    correctIdx: 1,
    explain: "A gap of 24 hours or longer without services needs to be explained in a brief updated assessment."
  },
  {
    q: "A client misses one scheduled group but receives other services that same day. Does the 24-hour service-gap rule apply based on that missed group alone?",
    options: [
      "Yes",
      "No"
    ],
    correctIdx: 1,
    explain: "The trigger is 24 hours or longer without receiving services, not one missed service while other services continue."
  }
];

function uaRenderGap(){
  buildQuiz('uaGapQuizCard', UA_GAP_QUIZ, () => uaMarkComplete('ua-gap'));
}

const UA_GAP_FINAL = `<button class="btn" onclick="uaGoTo('ua-scenarios')">Next: Practice the decision &rarr;</button>`;

/* ---- Practice scenarios ---- */
const UA_SCENARIO_QUIZ = [
  {
    q: "During an individual session, a client discloses a history of sexual abuse that was not reflected in the original assessment. The client and counselor are beginning to address it in treatment.",
    options: [
      "Updated assessment needed",
      "No updated assessment based on these facts alone"
    ],
    correctIdx: 0,
    explain: "This is new clinically relevant information that was not reflected in the prior assessment and is now part of the clinical picture."
  },
  {
    q: "A client is at the hospital and receives no services for 27 hours.",
    options: [
      "Updated assessment needed",
      "No updated assessment based on these facts alone"
    ],
    correctIdx: 0,
    explain: "There has been a 24-hour-or-longer gap without services, so a brief updated assessment is needed to explain why."
  },
  {
    q: "A client misses morning group, attends an individual session and afternoon programming the same day, and no new clinically relevant information emerges.",
    options: [
      "Updated assessment needed",
      "No updated assessment based on these facts alone"
    ],
    correctIdx: 1,
    explain: "There is no 24-hour service gap and no new clinically relevant information in this scenario."
  },
  {
    q: "For the first time, a client reports information about the planned discharge environment that changes the treatment team's clinical understanding of the client's recovery environment.",
    options: [
      "Updated assessment needed",
      "No updated assessment based on these facts alone"
    ],
    correctIdx: 0,
    explain: "The information is new and clinically relevant because it changes the clinical picture the team is using."
  }
];

const UA_SCENARIOS_BEATS = [
  `<p class="lede">For each situation, ask the same two questions: Is there new clinically relevant information? Has there been 24 hours or longer without services?</p>`,
  `<div class="quiz-card" id="uaScenarioQuizCard"></div>`
];

function uaRenderScenarios(){
  buildQuiz('uaScenarioQuizCard', UA_SCENARIO_QUIZ, () => uaMarkComplete('ua-scenarios'));
}

const UA_SCENARIOS_FINAL = `<button class="btn" onclick="uaGoTo('ua-assembly')">Next: Put it together &rarr;</button>`;

/* ---- Final assembly ---- */
const UA_ASSEMBLY_BEATS = [
  `<p class="lede">You do not need a complicated decision tree. You need to recognize when the assessment on file no longer tells the current clinical story.</p>
   <div class="card">
     <div class="step-header"><span class="step-number">1</span><span class="step-title">Ask about new information</span></div>
     <p>Did we learn clinically relevant information that was not reflected in the prior assessment?</p>
   </div>
   <div class="card">
     <div class="step-header"><span class="step-number">2</span><span class="step-title">Ask about a service gap</span></div>
     <p>Has the client gone 24 hours or longer without receiving services?</p>
   </div>`,

  `<p>If the first answer is yes, update the assessment so it reflects the current clinical picture. If the second answer is yes, complete a brief updated assessment explaining why the service gap occurred. Sometimes both triggers can be present.</p>`,

  `<h3>Final check</h3>
   <div class="quiz-card" id="uaAssemblyQuizCard"></div>`,

  `<div class="callout"><strong>Keep the principle:</strong> the assessment is not frozen at admission. When clinically relevant information changes what we know, or a 24-hour-or-longer gap interrupts services, the record needs an updated assessment that reflects what happened.</div>
   <span class="badge-done" id="uaFinalBadge" style="display:none;">You've completed the Updated Assessments module</span>`
];

const UA_ASSEMBLY_QUIZ = [
  {
    q: "Which statement best describes when new information requires an updated assessment?",
    options: [
      "Whenever any new fact is learned, even if it has no clinical relevance",
      "When new clinically relevant information emerges that was not reflected in the prior assessment",
      "Only when a diagnosis changes"
    ],
    correctIdx: 1,
    explain: "The trigger is new clinically relevant information that was not reflected in the prior assessment."
  },
  {
    q: "A client has gone 24 hours or longer without receiving services. What should happen?",
    options: [
      "A brief updated assessment should explain why the service gap occurred",
      "The original assessment must be copied word for word",
      "Nothing is required if staff already know the reason"
    ],
    correctIdx: 0,
    explain: "The 24-hour-or-longer gap needs to be explained in a brief updated assessment."
  },
  {
    q: "Why does this matter to the Golden Thread?",
    options: [
      "Because the assessment should reflect the clinical picture that the treatment plan and notes are working from",
      "Because every progress note should be copied into the assessment",
      "Because an assessment replaces the treatment plan"
    ],
    correctIdx: 0,
    explain: "The assessment is the clinical foundation. When the picture changes, that foundation needs to reflect the current picture."
  }
];

function uaRenderAssembly(){
  buildQuiz('uaAssemblyQuizCard', UA_ASSEMBLY_QUIZ, () => uaMarkComplete('ua-assembly'));
}

const UA_ASSEMBLY_FINAL = `<button class="btn secondary" onclick="goHome()">&larr; Back to Clinical Training home</button>`;

registerBeats(
  'uaWhyBeats',
  UA_WHY_BEATS,
  UA_WHY_FINAL
);

registerBeats(
  'uaNewInfoBeats',
  UA_NEWINFO_BEATS,
  UA_NEWINFO_FINAL,
  uaRenderNewInfo,
  () => !!uaProgress['ua-newinfo']
);

registerBeats(
  'uaGapBeats',
  UA_GAP_BEATS,
  UA_GAP_FINAL,
  uaRenderGap,
  () => !!uaProgress['ua-gap']
);

registerBeats(
  'uaScenariosBeats',
  UA_SCENARIOS_BEATS,
  UA_SCENARIOS_FINAL,
  uaRenderScenarios,
  () => !!uaProgress['ua-scenarios']
);

registerBeats(
  'uaAssemblyBeats',
  UA_ASSEMBLY_BEATS,
  UA_ASSEMBLY_FINAL,
  uaRenderAssembly,
  () => !!uaProgress['ua-assembly']
);

renderUaNav();

showView('view-home');