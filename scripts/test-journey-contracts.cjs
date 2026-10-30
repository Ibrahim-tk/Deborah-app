/* Local TS loader for dependency-free node:test execution; never used by the app build. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const cache = new Map();
function source(file) {
  if (process.env.FLOW_TEST_VERSION === 'v1' && file.startsWith('src/')) file = 'versions/v1/' + file;
  let resolved = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    resolved = [resolved + '.ts', resolved + '.tsx', path.join(resolved, 'index.ts')].find(fs.existsSync);
  }
  if (!resolved) throw new Error('Cannot resolve ' + file);
  if (resolved.endsWith('.json')) return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (cache.has(resolved)) return cache.get(resolved).exports;
  const module = { exports: {} }; cache.set(resolved, module);
  const js = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), { fileName: resolved, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const localRequire = (id) => id.startsWith('@flow-v1/') ? source('versions/v1/src/' + id.slice(9)) : id.startsWith('.') ? source(path.resolve(path.dirname(resolved), id)) : id.startsWith('@shared/') ? source('src/shared/' + id.slice(8)) : require(id);
  new Function('require', 'module', 'exports', js.replaceAll('import.meta.env', '({ DEV: true })'))(localRequire, module, module.exports);
  return module.exports;
}
const { useAppStore: store, loadScenario } = source('src/shared/store');
const { contextFor, ensureConversation } = source('src/shared/bridge/context');
const { createConversationEngine } = source('src/shared/engine');
const { answerSteps, productAllowed } = source('src/shared/engine/plans');
const { runPlan, useRunnerStore } = source('src/shared/bridge/conversationRunner');
const { SECTION_ORDER } = source('src/shared/types/domain');
const { toggleSelection } = source('src/apps/mobile/patterns/widgets/QuestionChoices/selection');
const engine = createConversationEngine();
const handlers = { onGate() { throw new Error('Unexpected gate'); }, onPrompt() {} };
function seed(id='S22') {
  assert.equal(loadScenario(id).ok, true);
  store.getState().setDev({ speed: 'instant', failNext: false });
  const s = store.getState();
  const c = s.conversations.byId[s.conversations.activeByProfile[s.activeProfileId]] ?? ensureConversation(s);
  return { s, c, ctx: contextFor(s, c) };
}
function answerMessages(plan) { return plan.filter(x=>x.type==='message' && x.message.kind==='answer'); }

test('None stays exclusive and stable IDs survive toggles', () => {
  assert.deepEqual(toggleSelection(['thyroid-med'], 'hrt', 'none'), ['thyroid-med','hrt']);
  assert.deepEqual(toggleSelection(['thyroid-med','hrt'], 'none', 'none'), ['none']);
  assert.deepEqual(toggleSelection(['none'], 'hrt', 'none'), ['hrt']);
  assert.deepEqual(toggleSelection(['hrt'], 'hrt', 'none'), []);
});
test('every existing scenario loads without losing its active profile', () => {
  const { SEEDS } = source('src/shared/scenarios');
  for (const id of Object.keys(SEEDS)) {
    assert.equal(loadScenario(id).ok, true, id);
    const s = store.getState();
    // Preauth / empty worlds (S01, S28 teen invite, …) have no profiles yet.
    if (s.profiles.order.length === 0) continue;
    assert.ok(s.profiles.byId[s.activeProfileId], id);
  }
});
test('provider ending waits for review, then has seven sections with no quota or product plan', async () => {
  const { s, c, ctx }=seed();
  assert.equal(answerMessages(answerSteps(ctx,c,ctx.profile)).length,0);
  const before=s.freeConsultationsUsed;
  s.confirmFacts(c.id,c.facts.map(f=>f.id));
  const next=store.getState(); const conv=next.conversations.byId[c.id];
  const plan=engine.handleUserInput(contextFor(next,conv),{kind:'finishReview'});
  assert.equal(answerMessages(plan).length,1);
  assert.deepEqual(answerMessages(plan)[0].message.answer.sections.map(s=>s.key),SECTION_ORDER);
  assert.equal(plan.some(x=>x.type==='store' && ['completeConsultation','createPlanFromAnswer'].includes(x.action.type)),false);
  assert.equal(plan.some(x=>x.type==='prompt'),false);
  await runPlan(plan,c.id,handlers);
  const done=store.getState().conversations.byId[c.id];
  const answer=done.messages.find(m=>m.kind==='answer').answer;
  assert.equal(answer.product,undefined);assert.ok(answer.sections.every(s=>s.body));
  assert.match(answer.sections[0].body,/new breast lump/);
  assert.equal(store.getState().freeConsultationsUsed,before);
  assert.equal(done.providerReview.state,'done');
  assert.equal(engine.handleUserInput(contextFor(store.getState(),done),{kind:'finishReview'}).length,0);
  assert.equal(answerMessages(engine.handleUserInput(contextFor(store.getState(),done),{kind:'requestAnswer'})).length,0);
});
test('discard leaves profile intact but permits provider-directed answer', () => {
  const { s,c }=seed();const original=JSON.stringify(s.profiles.byId[c.profileId]);
  s.discardFacts(c.id,c.facts.map(f=>f.id));
  const now=store.getState();assert.equal(JSON.stringify(now.profiles.byId[c.profileId]),original);
  assert.equal(answerMessages(engine.handleUserInput(contextFor(now,now.conversations.byId[c.id]),{kind:'finishReview'})).length,1);
});
test('partial save writes selected facts only; unresolved edits keep ending waiting', () => {
  const { s,c }=seed();s.confirmFacts(c.id,[c.facts[0].id]);
  let now=store.getState();assert.equal(engine.handleUserInput(contextFor(now,now.conversations.byId[c.id]),{kind:'finishReview'}).length,0);
  s.discardFacts(c.id,c.facts.slice(1).map(f=>f.id));now=store.getState();
  assert.equal(now.profiles.byId[c.profileId].confirmedFacts.length,1);
  assert.equal(answerMessages(engine.handleUserInput(contextFor(now,now.conversations.byId[c.id]),{kind:'finishReview'})).length,1);
});
test('normal answer remains counted and creates its existing plan; minors keep product suppressed', () => {
  const { c,ctx }=seed('S18');
  const clean={...c,status:'ready',redFlag:false,providerReview:undefined,facts:[]};
  const plan=answerSteps({...ctx,conversation:clean},clean,ctx.profile);
  assert.equal(answerMessages(plan).length,1);
  assert.ok(plan.some(x=>x.type==='store'&&x.action.type==='completeConsultation'));
  assert.ok(plan.some(x=>x.type==='store'&&x.action.type==='createPlanFromAnswer'));
  const minor={...ctx.profile,dob:'2011-01-01'};
  assert.equal(productAllowed({...ctx,profile:minor},clean,minor),false);
});
test('selected emergency stays an emergency; non-emergency red flag waits for review', () => {
  const { c,ctx }=seed(); const plain={...c,redFlag:false,providerReview:undefined,status:'intake'};
  const base={...ctx,conversation:plain};
  const urgent=engine.handleUserInput(base,{kind:'intakeAnswer',questionId:'red-flags-female',optionIds:['chest-fainting']});
  assert.ok(urgent.some(x=>x.type==='message'&&x.message.kind==='emergency'));
  assert.equal(answerMessages(urgent).length,0);
  const review=engine.handleUserInput(base,{kind:'intakeAnswer',questionId:'red-flags-female',optionIds:['breast-lump']});
  assert.ok(review.some(x=>x.type==='store'&&x.action.patch?.providerReview?.state==='waiting'));
  assert.equal(answerMessages(review).length,0);
});
test('requestAnswer cannot bypass emergency/crisis or pending review', () => {
  const { c,ctx }=seed();
  for(const patch of [{status:'safety'},{gentleNext:true}]) assert.equal(answerMessages(engine.handleUserInput({...ctx,conversation:{...c,...patch}},{kind:'requestAnswer'})).length,0);
});
test('reset cancels delayed runner writes and old prompts', async () => {
  const {c}=seed();store.getState().setDev({speed:'normal'});
  let prompted=false;
  const pending=runPlan([{type:'delay',ms:20},{type:'store',action:{type:'updateProfile',profileId:'p-self',patch:{name:'LEAK'}}},{type:'prompt',prompt:'followUpOptIn'}],c.id,{onGate(){},onPrompt(){prompted=true;}});
  loadScenario('S21');await pending;
  assert.notEqual(store.getState().profiles.byId['p-self'].name,'LEAK');
  assert.equal(prompted,false);assert.deepEqual(useRunnerStore.getState().busy,{});
});
test('ordinary, pregnancy, male and dependent consults keep their question-to-answer route', async () => {
  for (const id of ['S14','S15','S16','S17','S18','S09']) {
    const seeded=seed(id);
    let conv=seeded.c;
    const opening=engine.handleUserInput(seeded.ctx,{kind:'text',text:id==='S09'?'Her periods have been irregular':'I keep waking at 3am'});
    await runPlan(opening,conv.id,handlers);
    let count=0;
    for(;count<24;count++) {
      const st=store.getState();conv=st.conversations.byId[st.conversations.activeByProfile[st.activeProfileId]];
      if(conv.status==='answered')break;
      const ctx=contextFor(st,conv);
      let input;
      if(conv.status==='ready') input={kind:'requestAnswer'};
      else {
        const q=[...conv.messages].reverse().find(m=>m.intake&&!m.intake.answered&&!m.intake.skipped)?.intake;
        assert.ok(q,`${id}: no active question at ${conv.status}`);
        // Free-text session questions (e.g. session-goal) use the composer → kind text.
        if (q.input === 'text' || !q.options?.length) {
          input={kind:'text',text:'Sleep through the night'};
        } else {
          const option=q.options.find(o=>o.id==='none')??q.options.find(o=>o.id==='agree')??q.options.find(o=>o.id==='cycling')??q.options[0];
          assert.ok(option,`${id}: expected a categorical question`);
          input={kind:'intakeAnswer',questionId:q.questionId,optionIds:[option.id]};
        }
      }
      await runPlan(engine.handleUserInput(ctx,input),conv.id,handlers);
    }
    assert.ok(count<24,id+' did not finish');
    const answer=conv.messages.find(m=>m.kind==='answer');assert.ok(answer,id);
    assert.deepEqual(answer.answer.sections.map(s=>s.key),SECTION_ORDER,id);
    if(['S16','S09'].includes(id))assert.equal(answer.answer.product,undefined,id);
  }
});
test('onboarding saves the same profile context for self, teen, child and adult partner', () => {
  const {saveOnboarding}=source('src/apps/mobile/screens/onboarding/HealthBasics/saveOnboarding');
  for(const [age,relationship,pathName] of [[28,'self',null],[15,'child','guardian-teen'],[9,'child','guardian-child'],[52,'partner','adult-agreement']]) {
    seed('S03');const year=2026-age;
    const gender=age===15?'female':'male';
    // V2: sex at birth and gender identity are distinct; both are required on save.
    const id=saveOnboarding({profileFor:relationship==='self'?'self':'dependent',relationship,memberName:'Demo',birthDate:`${year}-06-15`,sex:gender,gender,consent:'yes',medications:'None',supplements:'None',genesisGold:'no'});
    const s=store.getState();const p=s.profiles.byId[id];assert.equal(p.health.birthYear.value,year);
    assert.equal(p.sexAtBirth,gender);
    assert.equal(p.health.genderIdentity?.value,gender);
    if(pathName){assert.equal(p.consent.path,pathName);assert.equal(p.consent.attestedBy,s.accountId);}
    else assert.equal(id,'p-self');
  }
});
// Full M-1.8 + Health Profile path (onboarding keys, then profile banks).
const fullPathKeys=()=>{const m=source('src/apps/mobile/screens/onboarding/HealthBasics/steps');return (a)=>[...m.visibleStepKeys(a),...m.profileStepKeys(a)];};
// Adults' optional sex-characteristics section (legal brief), before the banks.
const SC=['sexVariation','sexCharacteristics','hormoneTherapy','sexProcedures'];
// Version 2 only — frozen V1 healthBasics has no gender × age meds branches.
if (process.env.FLOW_TEST_VERSION !== 'v1') {
  test('V2 healthBasics visibleSteps branch by gender and age', () => {
    const keys=fullPathKeys();
    const dobFor=(age)=>`${new Date().getFullYear()-age}-06-15`;
    // Sex routes banks; identity then pronouns, then banks.
    const base=(age,sex,extra={})=>{
      const a = { profileFor: 'self', birthDate: dobFor(age), sex, pronouns: 'they-them', gender: sex, ...extra };
      return a;
    };
    assert.ok(keys(base(35,'female')).includes('pronouns'));
    assert.ok(keys(base(35,'female')).includes('gender'));
    assert.ok(keys(base(35,'female')).indexOf('gender') > keys(base(35,'female')).indexOf('sex'));
    assert.ok(keys(base(35,'female')).indexOf('pronouns') > keys(base(35,'female')).indexOf('gender'));
    assert.deepEqual(keys(base(35,'female')).filter((k)=>!['profileFor','birthDate','sex','pronouns','gender'].includes(k)),
      [...SC,'reproductive','medications','supplements','genesisGold']);
    assert.ok(!keys(base(35,'female')).includes('periodsStarted'));
    assert.ok(keys(base(35,'female',{ reproductive: 'menstruation' })).includes('periodsStarted'));
    assert.deepEqual(keys(base(35,'male')).filter((k)=>!['profileFor','birthDate','sex','pronouns','gender'].includes(k)),
      [...SC,'pubertyAge','fertilityConcerns','medications','supplements','genesisGold']);
    assert.ok(keys(base(15,'male')).includes('pubertyStart'));
    assert.ok(keys(base(15,'male')).includes('pubertyNotes'));
    assert.ok(!keys(base(15,'male')).includes('reproductive'));
    assert.ok(keys(base(15,'female')).includes('reproductiveTeen'));
    assert.ok(!keys(base(15,'female')).includes('periodsStarted'));
    assert.ok(keys(base(15,'female',{ reproductiveTeen: 'menstruation' })).includes('periodsStarted'));
    // Prefer-not / intersex / trans: identity early; banks = puberty → reproductive → meds.
    for (const g of ['trans-man', 'trans-woman', 'prefer-not', 'intersex']) {
      const adult = keys(base(40, g));
      assert.ok(adult.includes('otherPuberty'));
      assert.ok(adult.includes('reproductive'));
      assert.ok(adult.indexOf('gender') < adult.indexOf('pronouns'));
      assert.ok(adult.indexOf('pronouns') < adult.indexOf('otherPuberty'));
      assert.ok(adult.indexOf('reproductive') > adult.indexOf('otherPuberty'));
      assert.ok(adult.indexOf('medications') > adult.indexOf('reproductive'));
      const teen = keys(base(16, g));
      assert.ok(teen.includes('otherPuberty'));
      assert.ok(teen.includes('reproductiveTeen'));
      assert.ok(teen.indexOf('reproductiveTeen') > teen.indexOf('otherPuberty'));
      assert.ok(!teen.includes('pubertyStart'));
    }
    // Non-binary persona: sex prefer-not → identity → pronouns → puberty → reproductive → meds.
    assert.ok(keys(base(28, 'prefer-not', { gender: 'non-binary' })).includes('otherPuberty'));
    assert.ok(keys(base(28, 'prefer-not', { gender: 'non-binary' })).includes('reproductive'));
    assert.ok(keys({profileFor:'dependent',relationship:'child',memberName:'Sam',birthDate:dobFor(9),consent:'yes',sex:'male',pronouns:'he-him',gender:'male'}).includes('guardianNames'));
    assert.ok(keys({profileFor:'dependent',relationship:'child',memberName:'Sam',birthDate:dobFor(9),consent:'yes',sex:'male',pronouns:'he-him',gender:'male'}).includes('childMedications'));
    assert.ok(!keys({profileFor:'dependent',relationship:'child',memberName:'Sam',birthDate:dobFor(9),consent:'yes',sex:'male',pronouns:'he-him',gender:'male'}).includes('medications'));
  });

  test('Myself Female trees include sex, identity, pronouns, then reproductive nests', () => {
    const visibleStepKeys = fullPathKeys();
    const y = new Date().getFullYear();
    const myself = (age, extra = {}) => ({
      profileFor: 'self',
      birthDate: `${y - age}-06-15`,
      sex: 'female',
      pronouns: 'she-her',
      gender: 'female',
      ...extra,
    });
    // Adults 18–59: identity + pronouns early; reproductive; periods only after Menstruation.
    assert.deepEqual(visibleStepKeys(myself(28, { reproductive: 'pre-menopausal' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'reproductive', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(28, { reproductive: 'menstruation', periodsStarted: 'yes' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'reproductive', 'periodsStarted', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(48, { reproductive: 'peri-menopausal', hrtStatus: 'yes', hrtType: 'combined' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'reproductive', 'hrtStatus', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(48, { reproductive: 'peri-menopausal', hrtStatus: 'no' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'reproductive', 'hrtStatus', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(55, { reproductive: 'post-menopausal', ageAtLastPeriod: '52', hrtStatus: 'no' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'reproductive', 'ageAtLastPeriod', 'hrtStatus', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(50, { reproductive: 'surgically-menopausal', hysterectomy: 'yes', ovariesRemoved: 'partial', hrtStatus: 'yes', hrtType: 'estrogen-only' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'reproductive', 'hysterectomy', 'ovariesRemoved', 'hrtStatus', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(28, { reproductive: 'pregnant-postpartum' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'reproductive', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(66)), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'medications', 'supplements', 'genesisGold',
    ]);
    assert.ok(!visibleStepKeys(myself(66, { reproductive: 'peri-menopausal' })).includes('hrtStatus'));
    assert.deepEqual(visibleStepKeys(myself(15, { reproductiveTeen: 'pre-menopausal', pubertyBlockers: 'no' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', 'reproductiveTeen', 'pubertyBlockers', 'medications', 'supplements', 'genesisGold',
    ]);
    assert.deepEqual(visibleStepKeys(myself(15, { reproductiveTeen: 'menstruation', periodsStarted: 'yes', pubertyBlockers: 'no' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', 'reproductiveTeen', 'periodsStarted', 'pubertyBlockers', 'medications', 'supplements', 'genesisGold',
    ]);
    // Non-binary: sex Prefer not → identity → pronouns → puberty → reproductive → meds.
    assert.deepEqual(visibleStepKeys(myself(28, { sex: 'prefer-not', pronouns: 'they-them', gender: 'non-binary', otherPuberty: 'yes', reproductive: 'pre-menopausal' })), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns', ...SC, 'otherPuberty', 'reproductive', 'medications', 'supplements', 'genesisGold',
    ]);
    // Under-13 Myself: demography stays in the map; M-1.10 sheet on DOB Continue.
    assert.deepEqual(visibleStepKeys({ profileFor: 'self', birthDate: `${y - 8}-06-15` }), [
      'profileFor', 'birthDate', 'sex', 'gender', 'pronouns',
    ]);
  });

  test('legal brief: sex-characteristics section for all adults, body answers route the banks', () => {
    const keys = fullPathKeys();
    const steps = source('src/apps/mobile/screens/onboarding/HealthBasics/steps');
    const y = new Date().getFullYear();
    const me = (age, extra = {}) => ({ profileFor: 'self', birthDate: `${y - age}-06-15`, sex: 'female', gender: 'woman', pronouns: 'she-her', ...extra });
    // Every adult sees the section (not only intersex / mismatch); teens and children never do.
    for (const sex of ['female', 'male', 'intersex', 'prefer-not']) {
      const k = keys(me(30, { sex }));
      for (const key of SC) assert.ok(k.includes(key), `${sex} adult sees ${key}`);
      assert.ok(k.indexOf('sexProcedures') < k.indexOf('medications'));
    }
    for (const key of SC) assert.ok(!keys(me(16)).includes(key), `teen hides ${key}`);
    for (const key of SC) assert.ok(!keys(me(9, { profileFor: 'dependent', relationship: 'child', memberName: 'Sam', consent: 'yes' })).includes(key));
    // Skipped / None / Prefer not → routes on sex at birth exactly as before.
    for (const body of [undefined, 'None of these', 'Prefer not to say, Uterus']) {
      assert.ok(keys(me(30, { sex: 'male', sexCharacteristics: body })).includes('pubertyAge'), String(body));
      assert.ok(!keys(me(30, { sex: 'male', sexCharacteristics: body })).includes('reproductive'), String(body));
    }
    // Body answers win over sex at birth.
    const uterus = keys(me(30, { sex: 'prefer-not', sexCharacteristics: 'Uterus, Ovaries' }));
    assert.ok(uterus.includes('reproductive') && !uterus.includes('otherPuberty') && !uterus.includes('pubertyAge'));
    const prostate = keys(me(30, { sex: 'female', sexCharacteristics: 'Prostate, Testes' }));
    assert.ok(prostate.includes('pubertyAge') && prostate.includes('fertilityConcerns') && !prostate.includes('reproductive'));
    const mixed = keys(me(30, { sex: 'male', sexCharacteristics: 'Uterus, Testes' }));
    assert.ok(mixed.includes('otherPuberty') && mixed.includes('reproductive'));
    assert.equal(steps.routeSexFor({ sex: 'male' }), 'male');
    // Optional hormone context only when relevant; procedure follow-up note removed (user 2026-10-31).
    assert.ok(!keys(me(30)).includes('hormoneTherapyNote'));
    assert.ok(keys(me(30, { hormoneTherapy: 'yes' })).includes('hormoneTherapyNote'));
    assert.ok(!keys(me(30, { sexProcedures: 'Hysterectomy' })).includes('sexProceduresNote'));
    // Hormones asked once: "No" on the section hides the menopause HRT question.
    assert.ok(keys(me(50, { reproductive: 'peri-menopausal' })).includes('hrtStatus'));
    assert.ok(!keys(me(50, { reproductive: 'peri-menopausal', hormoneTherapy: 'no' })).includes('hrtStatus'));
  });

  test('legal brief: copy, options and one privacy notice', () => {
    const hb = source('src/shared/data/intake/healthBasics.json');
    const step = (k) => hb.steps.find((s) => s.key === k);
    assert.equal(step('gender').title, 'How would you describe your gender?');
    assert.deepEqual(step('gender').choices.map((c) => c.label), ['Man', 'Woman', 'Non-binary', 'Agender', 'Not listed', 'Prefer not to say']);
    assert.deepEqual(step('sex').choices.map((c) => c.label), ['Male', 'Female', 'Intersex', 'Prefer not to say']);
    assert.deepEqual(step('sexVariation').choices.map((c) => c.value), ['yes', 'no', 'unknown', 'prefer-not']);
    assert.deepEqual(step('hormoneTherapy').choices.map((c) => c.value), ['yes', 'no', 'unknown', 'prefer-not']);
    assert.deepEqual(step('hormoneTherapy').expandChoices.map((c) => c.value), ['yes', 'no', 'partially']);
    for (const organ of ['Uterus', 'Cervix', 'Ovaries', 'Vagina', 'Testes', 'Prostate', 'Penis/phallus', 'Micropenis/macroclitoris', 'Breast tissue', 'Prefer not to say'])
      assert.ok(step('sexCharacteristics').suggestions.some((x) => x.label === organ), organ);
    assert.ok(step('sexProcedures').suggestions.some((x) => x.label === 'Other'));
    const notes = hb.steps.filter((s) => /advertisers/.test(s.note ?? ''));
    assert.deepEqual(notes.map((s) => s.key), ['sexVariation']);
    assert.match(notes[0].note, /optional.*never sold or shared with advertisers, encrypted, and editable or deletable anytime/);
  });

  test('HRT answer pre-fills the hormones question when the profile is reopened', () => {
    const { SEX_CHARACTERISTIC_KEYS } = source('src/apps/mobile/screens/onboarding/HealthBasics/saveOnboarding');
    assert.ok(SEX_CHARACTERISTIC_KEYS.includes('hormoneTherapyNote') && SEX_CHARACTERISTIC_KEYS.includes('sexProceduresNote'));
    const src = require('node:fs').readFileSync(require('node:path').resolve(__dirname, '../src/apps/mobile/screens/onboarding/HealthBasics/healthProfile.ts'), 'utf8');
    assert.match(src, /a\.hormoneTherapy = 'yes'/);
  });

  test('all 28 PDF personas match healthBasics visibleSteps', () => {
    const { PDF_PERSONA_RUNS, seedAnswersFor } = source('src/shell/nav/JourneyRunner/pdfPersonas');
    const visibleStepKeys = fullPathKeys();
    assert.equal(PDF_PERSONA_RUNS.length, 28);
    for (const run of PDF_PERSONA_RUNS) {
      if (run.ageBand === 'lt13') {
        assert.deepEqual(run.expectedSteps, ['profileFor', 'birthDate'], run.id);
        assert.equal(run.stopAt, 'gate', run.id);
        continue;
      }
      const seeded = seedAnswersFor(run.gender, run.ageBand);
      assert.deepEqual(visibleStepKeys(seeded), run.expectedSteps, run.id);
      assert.equal(run.stopAt, 'deborah', run.id);
      assert.ok(seeded.sex, run.id);
      assert.ok(seeded.pronouns, run.id);
      assert.equal(seeded.gender, run.gender, run.id);
      assert.ok(run.expectedSteps.includes('gender'), run.id);
      assert.ok(run.expectedSteps.indexOf('gender') < run.expectedSteps.indexOf('pronouns'), run.id);
      assert.ok(run.expectedSteps.indexOf('pronouns') < run.expectedSteps.indexOf('genesisGold'), run.id);
      if (run.gender === 'non-binary') assert.equal(seeded.sex, 'prefer-not', run.id);
    }
  });
}
