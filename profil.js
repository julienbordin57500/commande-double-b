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
  /* Sonnette des notifications */
  .pbar .bell{position:relative;width:46px;height:44px;padding:0;display:grid;place-items:center;flex:none}
  .pbar .bell svg{width:26px;height:26px;border-radius:0;box-shadow:none}
  .pbar .bell .w{opacity:0}
  .pbar .bell.has{background:var(--accent-soft,#fdf1d6);border-color:color-mix(in srgb,var(--accent,#f2a516) 60%,transparent);color:var(--fg,#1d1b17)}
  .pbar .bell.has .w{opacity:1}
  .pbar .bell.has svg{animation:ring 2.4s ease-in-out 1}
  .pbar .bell .nb{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#d63a2a;color:#fff;font-size:13px;font-weight:800;line-height:22px;text-align:center;box-shadow:0 0 0 2px var(--surface,#fff)}
  @keyframes ring{0%,40%,100%{transform:rotate(0)}5%{transform:rotate(-14deg)}10%{transform:rotate(12deg)}15%{transform:rotate(-9deg)}20%{transform:rotate(6deg)}25%{transform:rotate(-3deg)}}
  @media (max-width:400px){.pbar .chg .lg{display:none}}
  .npan{position:fixed;inset:0;z-index:45;background:rgba(10,8,4,.55);display:flex;align-items:flex-end;justify-content:center;animation:fIn .18s ease-out;font-family:"Figtree",system-ui,sans-serif}
  .npan .nbx{background:var(--bg,#f4f2ec);color:var(--fg,#1d1b17);width:100%;max-width:560px;max-height:88vh;border-radius:24px 24px 0 0;display:flex;flex-direction:column;animation:upIn .28s cubic-bezier(.2,.85,.25,1);padding-bottom:env(safe-area-inset-bottom,0px)}
  @media (min-width:700px){.npan{align-items:flex-start;justify-content:flex-end;padding:70px 24px}.npan .nbx{border-radius:24px;max-width:440px;max-height:80vh}}
  .npan .nh{display:flex;align-items:center;gap:10px;padding:16px 16px 10px}
  .npan .nh h3{flex:1;margin:0;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:24px;font-weight:800}
  .npan .nx{width:46px;height:46px;border-radius:14px;border:1px solid var(--line,#e6e1d5);background:var(--surface,#fff);color:var(--fg,#1d1b17);font-size:22px;font-weight:700}
  .npan .nall{margin:0 16px 10px;height:48px;border-radius:14px;border:1px solid var(--line,#e6e1d5);background:var(--surface,#fff);color:var(--fg,#1d1b17);font:inherit;font-weight:800;font-size:16px}
  .npan .nl{overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0 12px 16px;display:flex;flex-direction:column;gap:8px}
  .npan .ni{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px;min-height:68px;border-radius:16px;border:1px solid var(--line,#e6e1d5);background:var(--surface,#fff);color:var(--fg,#1d1b17);font:inherit;position:relative}
  .npan .ni .ic{flex:none;width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:22px;background:var(--sunken,#f9f7f2)}
  .npan .ni .tx{flex:1;min-width:0}
  .npan .ni b{display:block;font-size:16px;font-weight:600;line-height:1.25;overflow-wrap:anywhere}
  .npan .ni small{display:block;font-size:13.5px;color:var(--muted,#6f695d);margin-top:3px;line-height:1.3}
  .npan .ni.new{border-color:color-mix(in srgb,var(--accent,#f2a516) 55%,transparent);background:color-mix(in srgb,var(--accent,#f2a516) 9%,var(--surface,#fff))}
  .npan .ni.new b{font-weight:800}
  .npan .ni.new::after{content:"";position:absolute;top:12px;right:12px;width:10px;height:10px;border-radius:50%;background:#d63a2a}
  .npan .ne{text-align:center;color:var(--muted,#6f695d);padding:30px 16px 40px;font-size:16px;line-height:1.45}
  .npan .ne b{display:block;font-size:44px;margin-bottom:8px}
  /* Barre d'onglets en bas, comme une vraie appli : une icône dessinée par partie */
  body{padding-bottom:calc(88px + env(safe-area-inset-bottom,0px))!important}
  .bnav{position:fixed;left:0;right:0;bottom:0;z-index:15;display:flex;justify-content:center;padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px));
    background:color-mix(in srgb,var(--surface,#fff) 84%,transparent);-webkit-backdrop-filter:saturate(1.6) blur(16px);backdrop-filter:saturate(1.6) blur(16px);
    border-top:1px solid var(--line,#e6e1d5);box-shadow:0 -8px 24px -16px rgba(40,25,5,.35);view-transition-name:bnav;font-family:"Figtree",system-ui,sans-serif}
  .bnav .in{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));width:100%;max-width:560px;gap:2px}
  .bnav a{display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 0 2px;min-height:60px;border-radius:14px;text-decoration:none;color:var(--muted,#6f695d);font-size:11px;font-weight:700;letter-spacing:-.1px;white-space:nowrap}
  .bnav .ic{width:54px;height:34px;border-radius:17px;display:grid;place-items:center;transition:background-color .2s ease,color .2s ease}
  .bnav svg{width:25px;height:25px}
  .bnav a[aria-current="page"]{color:var(--fg,#1d1b17);font-weight:800}
  .bnav a[aria-current="page"] .ic{background:var(--accent,#f2a516);color:var(--accent-ink,#2a1d00);background-image:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0));box-shadow:0 5px 14px -6px color-mix(in srgb,var(--accent,#f2a516) 90%,#000);animation:icPop .38s cubic-bezier(.3,1.5,.5,1)}
  .bnav a:active .ic{scale:.9}
  @media (max-width:360px){.bnav{padding-inline:2px}.bnav a{font-size:10px;letter-spacing:-.2px}.bnav .ic{width:46px}}
  .bnav a{position:relative}.bnav .dot{position:absolute;top:0;left:calc(50% + 9px);min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--accent,#f2a516);color:var(--accent-ink,#2a1d00);font-size:11px;font-weight:800;line-height:18px;text-align:center;box-shadow:0 0 0 2px var(--surface,#fff)}
  .bnav a[aria-current="page"] .dot{display:none}
  html.typing .bnav{display:none}
  /* Dès qu'on fait défiler, la barre devient une capsule flottante en verre (on voit la page à travers) */
  .bnav{transition:left .45s cubic-bezier(.2,.8,.2,1),right .45s cubic-bezier(.2,.8,.2,1),bottom .45s cubic-bezier(.2,.8,.2,1),border-radius .45s ease,background-color .45s ease,padding .45s ease,box-shadow .45s ease}
  html.scrolled .bnav{left:10px;right:10px;bottom:calc(8px + env(safe-area-inset-bottom,0px));padding:4px;border-radius:28px;
    background:color-mix(in srgb,var(--surface,#fff) 52%,transparent);-webkit-backdrop-filter:saturate(1.9) blur(22px);backdrop-filter:saturate(1.9) blur(22px);
    border:1px solid color-mix(in srgb,#fff 45%,transparent);box-shadow:0 12px 32px -12px rgba(30,20,5,.45),inset 0 1px 0 rgba(255,255,255,.45)}
  /* Changement d'onglet en douceur : la nouvelle page apparaît en fondu en glissant légèrement */
  @view-transition{navigation:none}
  @media (prefers-reduced-motion:no-preference){
    .wrap>:not(.pbar):not(script){animation:pgIn .42s cubic-bezier(.2,.7,.2,1) both}
  }
  @keyframes pgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  html.typing body{padding-bottom:env(safe-area-inset-bottom,0px)!important}
  .toast{bottom:calc(96px + env(safe-area-inset-bottom,0px))!important}
  html.typing .toast{bottom:calc(20px + env(safe-area-inset-bottom,0px))!important}
  @keyframes icPop{0%{transform:scale(.8)}100%{transform:none}}
  @media (prefers-reduced-motion:reduce){.bnav a[aria-current="page"] .ic{animation:none}}
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
    b.innerHTML=`<div class="who">${avatar(id,40)}<div>${AV[id].nom}<small>Profil sur ce téléphone</small></div></div><button type="button" class="chg">Changer<span class="lg"> de profil</span></button><button type="button" class="bell" aria-label="Notifications">${BELL}<span class="nb" hidden></span></button>`;
    b.querySelector(".chg").onclick=()=>picker(true);
    b.querySelector(".bell").onclick=()=>Notifs.open();
    Notifs.badge();Notifs.start();
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
      ["🛎️","La sonnette","En haut à droite : quand quelqu'un ajoute un événement, un petit chiffre rouge apparaît. Touche-la pour voir quoi."],
      ["✅","C'est parti !","Tout s'enregistre tout seul. Tu peux changer de profil à tout moment, tout en haut."]];
    let i=0;const m=document.createElement("div");m.className="tour";m.setAttribute("role","dialog");m.setAttribute("aria-label","Visite guidée");
    const draw=()=>{const [e,t,p]=S[i];m.innerHTML=`<div class="tb"><div class="em" aria-hidden="true">${e}</div><h3>${t}</h3><p>${p}</p>
      <div class="dots">${S.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("")}</div>
      <div class="tbtn">${i<S.length-1?`<button class="sk" type="button" data-t="skip">Passer</button><button class="nx" type="button" data-t="next">Suivant</button>`:`<button class="nx" type="button" data-t="skip" style="grid-column:1/-1">Commencer</button>`}</div></div>`};
    draw();document.body.appendChild(m);
    m.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;if(b.dataset.t==="next"){i++;draw()}else m.remove()});
  }
  /* ---------- Notifications internes (pas d'alerte sur le téléphone) ----------
     Un ajout dans Événements, un événement confirmé ou annulé, et un rappel la veille.
     Jamais pour ses propres actions. Lu / non lu retenu pour chaque profil. */
  const BELL=`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8V5.5M13 5.5h6"/><path d="M5.5 22a10.5 10.5 0 0 1 21 0"/><path d="M3.5 22h25v3.2h-25z"/><path d="M11 15.5a6.5 6.5 0 0 1 3-3" opacity=".6"/><path class="w" d="M2.5 11.5l2 1.3M29.5 11.5l-2 1.3M5.5 6.8l1.6 1.8M26.5 6.8l-1.6 1.8"/></svg>`;
  const API="https://kokjumjhpasxxxrpspng.supabase.co/rest/v1/rpc/",PUB="sb_publishable_HIJXH1eJ_CP-A4G3AecDKg_NbBUD0m2";
  const code=()=>{try{return localStorage.getItem("commande2b-code")}catch{return null}};
  async function call(fn,args){const r=await fetch(API+fn,{method:"POST",headers:{"apikey":PUB,"Content-Type":"application/json"},body:JSON.stringify({p_code:code(),...args})});
    if(!r.ok)throw new Error("net");const t=await r.text();return t?JSON.parse(t):null}
  const ESC=x=>String(x??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  const NK=()=>"2b-notifs-"+get();
  const Notifs={list:[],t:null,
    load(){try{this.list=JSON.parse(localStorage.getItem(NK())||"[]")}catch{this.list=[]}},
    save(){try{localStorage.setItem(NK(),JSON.stringify(this.list))}catch{}},
    unread(){return this.list.filter(n=>!n.lu).length},
    badge(){if(!this.list.length)this.load();const k=this.unread();
      document.querySelectorAll(".pbar .bell").forEach(b=>{const nb=b.querySelector(".nb");nb.hidden=!k;nb.textContent=k>9?"9+":k;b.classList.toggle("has",k>0);
        b.setAttribute("aria-label",k?`Notifications : ${k} non lue${k>1?"s":""}`:"Notifications")});document.dispatchEvent(new CustomEvent("2b-notifs",{detail:k}))},
    async refresh(){if(!get()||!code())return;try{const l=await call("notifs_liste",{p_profil:get()});if(Array.isArray(l)){this.list=l;this.save();this.badge();if(document.querySelector(".npan"))this.draw()}}catch{}},
    start(){if(this.t)return;this.refresh();this.t=setInterval(()=>{if(document.visibilityState==="visible")this.refresh()},60000);
      document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")this.refresh()})},
    read(ids){const p=get();this.list.forEach(n=>{if(!ids||ids.includes(n.id))n.lu=true});this.save();this.badge();if(document.querySelector(".npan"))this.draw();
      call("notifs_lire",{p_profil:p,p_ids:ids||null}).catch(()=>{})},
    text(n){const T={privatisation:["🏠","privatisation"],traiteur:["🚚","traiteur"],note:["📌","pense-bête"]}[n.ev_type]||["📅","événement"];
      const today=new Date();today.setHours(0,0,0,0);const d=n.jour?new Date(n.jour+"T00:00"):null;const diff=d?Math.round((d-today)/864e5):null;
      const quand=diff===0?"aujourd'hui":diff===1?"demain":d?d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}):"";
      const det=[quand&&quand.charAt(0).toUpperCase()+quand.slice(1),n.heure,n.personnes?n.personnes+" pers.":""].filter(Boolean).join(" · ");
      const c=`« ${ESC(n.client||"Sans nom")} »`;let ic=T[0],t;
      if(n.quoi==="nouveau")t=n.ev_type==="note"?`Nouveau pense-bête : ${c}`:`Nouvelle ${T[1]} : ${c}`;
      else if(n.quoi==="confirme"){ic="✅";t=`Confirmé : ${T[1]} ${c}`}
      else if(n.quoi==="annule"){ic="❌";t=`Annulé : ${T[1]} ${c}`}
      else{ic="⏰";t=n.ev_type==="note"?`Pense-bête du jour : ${c}`:(diff===1?`Demain : ${T[1]} ${c}`:`Rappel : ${T[1]} ${c}`)}
      return {ic,t,det}},
    ago(s){const m=Math.round((Date.now()-new Date(s))/60000);if(m<1)return "à l'instant";if(m<60)return `il y a ${m} min`;const h=Math.round(m/60);if(h<24)return `il y a ${h} h`;
      const j=Math.round(h/24);return j===1?"hier":`il y a ${j} jours`},
    draw(){const m=document.querySelector(".npan");if(!m)return;const k=this.unread();
      m.querySelector(".nall").hidden=!k;
      m.querySelector(".nl").innerHTML=this.list.length?this.list.map(n=>{const x=this.text(n);const qui=n.par?(AV[n.par]?AV[n.par].nom:n.par):"Rappel automatique";
        return `<button type="button" class="ni${n.lu?"":" new"}" data-n="${ESC(n.id)}"><span class="ic" aria-hidden="true">${x.ic}</span><span class="tx"><b>${x.t}</b><small>${ESC(x.det)}</small><small>${ESC(qui)} · ${this.ago(n.le)}</small></span></button>`}).join("")
        :`<div class="ne"><b>🛎️</b>Rien de nouveau pour l'instant.<br>Quand quelqu'un ajoute un événement, tu le verras ici.</div>`},
    open(){if(document.querySelector(".npan"))return;const m=document.createElement("div");m.className="npan";m.setAttribute("role","dialog");m.setAttribute("aria-label","Notifications");
      m.innerHTML=`<div class="nbx"><div class="nh"><h3>Notifications</h3><button type="button" class="nx" aria-label="Fermer">✕</button></div><button type="button" class="nall">✓ Tout marquer comme lu</button><div class="nl"></div></div>`;
      document.body.appendChild(m);document.documentElement.style.overflow="hidden";this.draw();this.refresh();
      const close=()=>{m.remove();document.documentElement.style.overflow=""};
      m.addEventListener("click",e=>{if(e.target===m||e.target.closest(".nx")){close();return}
        if(e.target.closest(".nall")){this.read(null);return}
        const b=e.target.closest("[data-n]");if(!b)return;const n=this.list.find(x=>x.id===b.dataset.n);if(!n)return;
        if(!n.lu)this.read([n.id]);close();
        const h=`ev=${encodeURIComponent(n.ev||"")}&j=${encodeURIComponent(n.jour||"")}`;
        if(/evenements\.html$/.test(location.pathname))location.hash=h;else location.href="evenements.html#"+h});
      document.addEventListener("keydown",function k(e){if(e.key==="Escape"){close();document.removeEventListener("keydown",k)}})}
  };
  /* ---------- Barre d'onglets du bas ---------- */
  const IC={
    jour:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="4"/><path d="M12 4.5v1.5M4.5 13H6M18 13h1.5M6.7 7.7l1 1M17.3 7.7l-1 1"/><path d="M3 20h18"/></svg>`,
    cmd:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10h17l-1.8 8.6a2 2 0 0 1-2 1.6H7.3a2 2 0 0 1-2-1.6z"/><path d="M8 10l3.2-6M16 10l-3.2-6"/><path d="M9.5 14v2.5M14.5 14v2.5"/></svg>`,
    menu:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="3" width="15" height="18" rx="2.5"/><path d="M8 14.5a4 4 0 0 1 8 0zM7.5 14.5h9M12 9.5v1"/><path d="M9 17.8h6"/></svg>`,
    chif:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><rect x="5.5" y="12" width="3" height="5" rx="1"/><rect x="10.5" y="9" width="3" height="8" rx="1"/><rect x="15.5" y="6" width="3" height="11" rx="1"/><path d="M5 8.5l4.5-3.5 3 1.5 5-3.5"/></svg>`,
    ev:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M12 12.6l1.1 2.1 2.3.4-1.7 1.6.4 2.3-2.1-1.1-2.1 1.1.4-2.3-1.7-1.6 2.3-.4z" fill="currentColor" stroke-width="1"/></svg>`};
  const TABS=[["accueil.html","jour","Aujourd'hui"],["./","cmd","Commande"],["menus.html","menu","Menus"],["chiffres.html","chif","Chiffres"],["evenements.html","ev","Événements"]];
  function nav(){
    if(document.querySelector(".bnav"))return;
    const here=(location.pathname.split("/").pop()||"index.html");
    const cur=h=>h==="./"?(here==="index.html"||here===""):here===h;
    let n=0;try{const c=JSON.parse(localStorage.getItem("commande2b-cache")||"null");if(c&&c.produits)n=c.produits.filter(p=>p.acommander).length}catch{}
    const b=document.createElement("nav");b.className="bnav";b.setAttribute("aria-label","Parties de l'appli");
    b.innerHTML=`<div class="in">${TABS.map(([h,i,l])=>`<a href="${h}"${cur(h)?' aria-current="page"':""}><span class="ic">${IC[i]}</span>${i==="cmd"&&n?`<span class="dot">${n>99?"99+":n}</span>`:""}<span>${l}</span></a>`).join("")}</div>`;
    document.body.appendChild(b);
  }
  // Barre du bas : capsule en verre dès qu'on a un peu défilé
  const glass=()=>document.documentElement.classList.toggle("scrolled",window.scrollY>12);
  addEventListener("scroll",glass,{passive:true});glass();
  // Onglet touché : il s'allume tout de suite, sans attendre que la page suivante arrive
  document.addEventListener("click",e=>{const a=e.target.closest(".bnav a");if(!a||a.getAttribute("aria-current"))return;
    document.querySelectorAll(".bnav a[aria-current]").forEach(x=>x.removeAttribute("aria-current"));a.setAttribute("aria-current","page")});
  addEventListener("pageshow",e=>{if(e.persisted){document.querySelectorAll(".bnav").forEach(b=>b.remove());nav()}});
  // Mises à jour : on vérifie s'il y a une nouvelle version quand on revient dans l'appli
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&navigator.serviceWorker)navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{})});
  // Pendant la saisie, la barre se cache : le clavier et les résultats ont toute la place
  document.addEventListener("focusin",e=>{if(e.target.matches("input:not([type=checkbox]):not([type=radio]),textarea,select"))document.documentElement.classList.add("typing")});
  document.addEventListener("focusout",()=>setTimeout(()=>{const a=document.activeElement;if(!(a&&a.matches&&a.matches("input,textarea,select")))document.documentElement.classList.remove("typing")},60));
  function ensure(){nav();if(!get())picker(false);else{bar();tour()}}
  window.Profil={get,ensure,avatar,notifs:Notifs,noms:Object.fromEntries(Object.entries(AV).map(([k,v])=>[k,v.nom]))};
  let hasCode=false;try{hasCode=!!localStorage.getItem("commande2b-code")}catch{}
  if(hasCode)nav();
  if(hasCode&&!document.getElementById("gate"))ensure();   // l'écran Commande l'appelle lui-même après le code
  else if(get())bar();                                      // barre remplie tout de suite : rien ne bouge à l'affichage
})();
