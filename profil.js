/* Profils Double B : Julien, Eric, Thierry, Claire.
   Choisi une fois par téléphone, gardé ensuite. Barre « Changer de profil » en haut de chaque page. */
(function(){
  const KEY="2b-profil";
  const SKIN="#f3c9a4",SKIN_D="#e2ae86",INK="#2a211b";
  const face=(brows)=>`<ellipse cx="38" cy="56" rx="5" ry="6.5" fill="${SKIN_D}"/><ellipse cx="82" cy="56" rx="5" ry="6.5" fill="${SKIN_D}"/>
    <rect x="52" y="74" width="16" height="14" rx="5" fill="${SKIN_D}"/>
    <ellipse cx="60" cy="53" rx="23" ry="26" fill="${SKIN}"/>
    <circle cx="51" cy="55" r="2.7" fill="${INK}"/><circle cx="69" cy="55" r="2.7" fill="${INK}"/>
    <circle cx="45.5" cy="62" r="3.4" fill="#f29c8f" opacity=".45"/><circle cx="74.5" cy="62" r="3.4" fill="#f29c8f" opacity=".45"/>
    <path d="M46 47.5 Q51 44.5 56 47.5 M64 47.5 Q69 44.5 74 47.5" stroke="${brows}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M51.5 66 Q60 73 68.5 66" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const body=(shirt)=>`<path d="M16 122 C18 98 36 87 60 87 C84 87 102 98 104 122Z" fill="${shirt}"/><path d="M50 87 L60 98 L70 87" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-linejoin="round"/>`;
  const AV={
    julien:{nom:"Julien",bg:"#fde7b5",svg:()=>body("#f2a516")+face("#b8892e")+
      `<path d="M36 52 C33 30 46 21 61 21 C77 21 88 31 85 52 C83 43 78 37 70 35 C66 40 56 41 49 38 C44 41 39 46 36 52Z" fill="#e7bd55"/>
       <path d="M49 38 C55 30 68 28 78 33 C70 31 60 33 55 38Z" fill="#f6d77f"/>`},
    eric:{nom:"Eric",bg:"#dfe8f5",svg:()=>body("#2f5d9e")+face("#8f8f8f")+
      `<path d="M36 56 C31 31 45 21 60 21 C76 21 90 31 84 56 C83 47 81 41 77 38 C68 34 52 34 43 38 C39 42 37 48 36 56Z" fill="#c3c3c3"/>
       <path d="M43 38 C50 31 64 29 74 33" stroke="#e2e2e2" stroke-width="3" fill="none" stroke-linecap="round"/>
       <path d="M53 41 Q60 39.5 67 41" stroke="${SKIN_D}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`},
    thierry:{nom:"Thierry",bg:"#dcefe2",svg:()=>body("#2f7d4f")+face("#6b5544")+
      `<ellipse cx="51" cy="35" rx="9" ry="4.2" fill="#fff" opacity=".55" transform="rotate(-22 51 35)"/>
       <circle cx="64" cy="31" r="1.8" fill="#fff" opacity=".5"/>`},
    claire:{nom:"Claire",bg:"#f4e3ee",svg:()=>`<path d="M33 58 C29 31 44 19 60 19 C76 19 91 31 87 58 C89 75 88 90 84 104 L36 104 C32 90 31 75 33 58Z" fill="#5b3620"/>`+body("#b0457a")+face("#4a2c1a")+
      `<path d="M36 52 C35 31 47 22 60 22 C74 22 86 31 84 52 C80 41 72 35 61 37 C55 41 45 44 36 52Z" fill="#6b4226"/>
       <path d="M52 27 C60 23 72 25 78 32" stroke="#8a5a36" stroke-width="2.4" fill="none" stroke-linecap="round"/>
       <circle cx="37.5" cy="66" r="2" fill="#f2a516"/><circle cx="82.5" cy="66" r="2" fill="#f2a516"/>
       <path d="M53 67.5 Q60 72.5 67 67.5" stroke="#c0485d" stroke-width="2.6" fill="none" stroke-linecap="round"/>`}
  };
  let uid=0;
  const avatar=(id,size)=>{const a=AV[id];const c="pc"+(++uid);return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true"><defs><clipPath id="${c}"><circle cx="60" cy="60" r="60"/></clipPath></defs><circle cx="60" cy="60" r="60" fill="${a.bg}"/><g clip-path="url(#${c})">${a.svg()}</g></svg>`};
  const get=()=>{try{const v=localStorage.getItem(KEY);return AV[v]?v:null}catch{return null}};
  const set=v=>{try{localStorage.setItem(KEY,v)}catch{}};

  const css=`
  .pbar{height:58px;line-height:1.2;font-size:16px;box-sizing:border-box;display:flex;align-items:center;gap:10px;max-width:680px;margin:0 auto 10px;padding:6px 6px 6px 8px;background:var(--surface,#fff);border:1px solid var(--line,#e6e1d5);border-radius:16px}
  .pbar .who{display:flex;align-items:center;gap:10px;flex:1;min-width:0;font-weight:800;font-size:17px}
  .pbar .who small{display:block;font-size:12px;font-weight:600;color:var(--muted,#6f695d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pbar .who>div{min-width:0}
  .pbar button{height:44px;border-radius:12px;border:1px solid var(--line,#e6e1d5);background:var(--sunken,#f9f7f2);color:var(--fg,#1d1b17);font:inherit;font-weight:700;font-size:15px;padding:0 14px;cursor:pointer}
  .pick{position:fixed;inset:0;z-index:50;background:var(--bg,#f4f2ec);overflow:auto;display:flex;flex-direction:column;align-items:center;padding:max(28px,env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom));animation:pIn .25s ease-out}
  .biglogo{display:flex;align-items:center;gap:14px;justify-content:center}
  .biglogo img{width:84px;height:84px;border-radius:20px;box-shadow:0 6px 18px rgba(0,0,0,.18)}
  .biglogo .bl-n{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:800;font-size:40px;line-height:1;letter-spacing:-.5px;color:var(--fg,#1d1b17);text-align:left}
  .biglogo .bl-n b{color:#f2a516}
  .biglogo .bl-t{font-family:"Figtree",system-ui,sans-serif;font-weight:800;font-size:11px;letter-spacing:.2em;margin-top:7px;color:var(--fg,#1d1b17);text-align:left}
  .biglogo .bl-t b{color:#f2a516}
  .pick .lg{width:min(300px,78vw);height:auto;margin-top:6px}
  .pick .tag{font-family:"Figtree",system-ui,sans-serif;font-weight:800;font-size:14px;letter-spacing:.24em;color:var(--fg,#1d1b17);margin-top:8px;text-align:center}
  .pick .tag b{color:#f2a516}
  .pick h2{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:30px;font-weight:800;margin:30px 0 6px;text-align:center}
  .pick p{margin:0 0 18px;color:var(--muted,#6f695d);font-size:16px;text-align:center}
  .pick .cards{display:grid;grid-template-columns:repeat(4,minmax(0,160px));gap:14px;width:100%;justify-content:center}
  @media (max-width:560px){.pick .cards{grid-template-columns:1fr;max-width:360px;margin:0 auto}}
  .pick .card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 12px;border-radius:22px;border:2px solid var(--line,#e6e1d5);background:var(--surface,#fff);font:inherit;cursor:pointer;color:var(--fg,#1d1b17);transition:transform .15s ease,border-color .15s ease}
  @media (max-width:560px){.pick .card{flex-direction:row;padding:12px 16px;gap:16px}}
  .pick .card span{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:24px;font-weight:800}
  .pick .card.cur{border-color:#f2a516;box-shadow:0 0 0 4px rgba(242,165,22,.25)}
  .pick .card:active{transform:scale(.97)}
  .pick .cancel{margin-top:22px;height:50px;border-radius:14px;border:1px solid var(--line,#e6e1d5);background:var(--surface,#fff);font:inherit;font-weight:700;padding:0 22px;color:var(--fg,#1d1b17)}
  .tour{position:fixed;inset:0;z-index:60;background:rgba(10,8,4,.6);display:flex;align-items:center;justify-content:center;padding:20px;animation:pIn .25s ease-out}
  .tour .tb{background:var(--surface,#fff);color:var(--fg,#1d1b17);border-radius:26px;max-width:420px;width:100%;padding:26px 22px 20px;text-align:center;display:flex;flex-direction:column;gap:12px;font-family:"Figtree",system-ui,sans-serif}
  .tour .em{font-size:64px;line-height:1}
  .tour h3{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:26px;font-weight:800;margin:0}
  .tour p{margin:0;font-size:18px;line-height:1.45;color:var(--muted,#6f695d)}
  .tour .dots{display:flex;gap:7px;justify-content:center;margin:4px 0}
  .tour .dots i{width:9px;height:9px;border-radius:50%;background:var(--line,#e6e1d5)}
  .tour .dots i.on{background:#f2a516;width:24px;border-radius:5px}
  .tour .tbtn{display:grid;grid-template-columns:1fr 1.6fr;gap:8px}
  .tour button{height:56px;border-radius:16px;border:0;font:inherit;font-weight:800;font-size:17px;cursor:pointer}
  .tour .nx{background:#f2a516;color:#2a1d00} .tour .sk{background:var(--sunken,#f9f7f2);color:var(--fg,#1d1b17);border:1px solid var(--line,#e6e1d5)}
  @keyframes pIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.pick{animation:none}}

  /* Finitions communes aux 4 onglets : boutons qui réagissent au doigt, ombres douces, fenêtres qui glissent */
  html{-webkit-tap-highlight-color:transparent}
  body{background-image:radial-gradient(900px 340px at 50% -180px,color-mix(in srgb,var(--accent,#f2a516) 13%,transparent),transparent 70%);background-repeat:no-repeat}
  button,a,input,select,textarea,label,[role=button]{touch-action:manipulation}
  button,.btn,.apps a,[role=button]{transition:scale .12s ease,background-color .2s ease,color .2s ease,box-shadow .2s ease,border-color .2s ease,opacity .2s ease}
  button:not(:disabled):active,.apps a:active,[role=button]:active{scale:.97}
  .btn:not(:disabled):active,.pnew:active,.pcard:active,.ev:active{scale:.985}
  input,select,textarea{transition:border-color .15s ease,box-shadow .15s ease}
  .btn:not(.soft):not(.del):not(.danger):not(.confirm){background-image:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0));box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 6px 14px -8px color-mix(in srgb,var(--accent,#f2a516) 90%,#000)}
  .btn.danger{box-shadow:0 6px 14px -8px var(--danger,#c23a2b)}
  .apps a[aria-current="page"]{background-image:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,0));box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 4px 12px -6px color-mix(in srgb,var(--accent,#f2a516) 90%,#000)}
  .tabs button[aria-selected="true"],.vue button[aria-selected="true"]{box-shadow:0 4px 12px -6px rgba(0,0,0,.45)}
  .pbar,.apps,.tabs,.vue,.month,.sup,.panel,.pcard,.tblcard,.kpi,.chartbox,section.day,.ln,.pempty{box-shadow:0 1px 2px rgba(60,40,10,.04),0 6px 18px -10px rgba(60,40,10,.14)}
  .pbar svg{border-radius:50%;box-shadow:0 0 0 2px var(--surface,#fff),0 0 0 4px color-mix(in srgb,var(--accent,#f2a516) 55%,transparent)}
  .sheet:not([hidden]),.modal{animation:fIn .18s ease-out}
  .sheet:not([hidden])>.box,.sheet:not([hidden])>.sh,.modal>.box{animation:upIn .28s cubic-bezier(.2,.85,.25,1)}
  .toast:not([hidden]){animation:tIn .26s cubic-bezier(.2,.85,.25,1);box-shadow:0 10px 26px -8px rgba(0,0,0,.45)}
  @keyframes fIn{from{opacity:0}to{opacity:1}}
  @keyframes upIn{from{opacity:.4;transform:translateY(28px)}to{opacity:1;transform:none}}
  @keyframes tIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
  @media (prefers-reduced-motion:reduce){.sheet,.modal,.sheet>.box,.sheet>.sh,.modal>.box,.toast{animation:none!important}button:active,.apps a:active{scale:none}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  function picker(canCancel){
    const cur=get();const m=document.createElement("div");m.className="pick";m.setAttribute("role","dialog");m.setAttribute("aria-label","Choisis ton profil");
    m.innerHTML=`<div class="biglogo"><img src="icone-appli.svg" alt="" width="84" height="84"><div><div class="bl-n">Double <b>B</b></div><div class="bl-t">COMMANDE <b>·</b> DEVIS <b>·</b> ANALYSE</div></div></div>
      <h2>Qui es-tu ?</h2><p>Touche ton prénom. C'est retenu sur ce téléphone.</p>
      <div class="cards">${Object.keys(AV).map(id=>`<button class="card${id===cur?" cur":""}" data-p="${id}">${avatar(id,96)}<span>${AV[id].nom}</span></button>`).join("")}</div>
      ${canCancel?`<button class="cancel" type="button">Annuler</button>`:""}`;
    document.body.appendChild(m);document.documentElement.style.overflow="hidden";
    m.addEventListener("click",e=>{
      const b=e.target.closest("[data-p]");
      if(b){const changed=b.dataset.p!==cur;set(b.dataset.p);document.documentElement.style.overflow="";m.remove();
        if(changed&&cur)location.reload();else{bar();tour()}return}
      if(e.target.closest(".cancel")){document.documentElement.style.overflow="";m.remove()}
    });
  }
  function bar(){
    const id=get();if(!id)return;
    let b=document.getElementById("pbar")||document.querySelector(".pbar");
    if(!b){const wrap=document.querySelector(".wrap:not([hidden]):not(.gate)")||document.querySelector("#app");if(!wrap)return;b=document.createElement("div");b.className="pbar";wrap.prepend(b)}
    b.innerHTML=`<div class="who">${avatar(id,40)}<div>${AV[id].nom}<small>Profil sur ce téléphone</small></div></div><button type="button">Changer de profil</button>`;
    b.querySelector("button").onclick=()=>picker(true);
  }
  /* Mini visite guidée : une seule fois par téléphone */
  function tour(){
    try{if(localStorage.getItem("2b-visite"))return;localStorage.setItem("2b-visite","1")}catch{return}
    const nom=AV[get()]?AV[get()].nom:"";
    const S=[["👋",`Bienvenue ${nom} !`,"Voici l'appli du Double B. Elle a 4 parties, en haut de l'écran. On fait le tour en 30 secondes."],
      ["🛒","Commande","Appuie sur « Commander » à côté de ce qui manque. Tout se retrouve dans « À commander ». En haut, choisis Cuisine ou Bar & Salle."],
      ["📄","Menus & devis","Colle un menu : il se met tout seul dans la belle trame. Les forfaits apéritifs et les devis sont prêts à envoyer."],
      ["📊","Chiffres","Chaque jour : clients sur place, à emporter et CA du midi et du soir. Les totaux se calculent tout seuls. Dans « Coût des plats », tu vois ce que coûte chaque plat."],
      ["📅","Événements","Privatisations, traiteur et petites notes, dans un calendrier que toute l'équipe voit."],
      ["✅","C'est parti !","Tout s'enregistre tout seul. Tu peux changer de profil à tout moment, tout en haut."]];
    let i=0;const m=document.createElement("div");m.className="tour";m.setAttribute("role","dialog");m.setAttribute("aria-label","Visite guidée");
    const draw=()=>{const [e,t,p]=S[i];m.innerHTML=`<div class="tb"><div class="em" aria-hidden="true">${e}</div><h3>${t}</h3><p>${p}</p>
      <div class="dots">${S.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("")}</div>
      <div class="tbtn">${i<S.length-1?`<button class="sk" type="button" data-t="skip">Passer</button><button class="nx" type="button" data-t="next">Suivant</button>`:`<button class="nx" type="button" data-t="skip" style="grid-column:1/-1">Commencer</button>`}</div></div>`};
    draw();document.body.appendChild(m);
    m.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;if(b.dataset.t==="next"){i++;draw()}else m.remove()});
  }
  function ensure(){if(!get())picker(false);else{bar();tour()}}
  window.Profil={get,ensure,avatar,noms:Object.fromEntries(Object.entries(AV).map(([k,v])=>[k,v.nom]))};
  let hasCode=false;try{hasCode=!!localStorage.getItem("commande2b-code")}catch{}
  if(hasCode&&!document.getElementById("gate"))ensure();   // l'écran Commande l'appelle lui-même après le code
  else if(get())bar();                                      // barre remplie tout de suite : rien ne bouge à l'affichage
})();
