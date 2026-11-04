/* Original SVG silhouettes and deterministic, time-addressable choreography. No remote assets. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const { clamp, progress } = EditEngine;
  const ease = x => 1-Math.pow(1-clamp(x,0,1),3);
  const frac = x => x-Math.floor(x);
  const rand = n => frac(Math.sin(n*127.1+311.7)*43758.5453);
  const defs = `<defs>
    <radialGradient id="sky"><stop id="sky-core" stop-color="#283128"/><stop offset=".58" stop-color="#111a1b"/><stop offset="1" stop-color="#070d10"/></radialGradient>
    <linearGradient id="robe-lu" x1="0" x2="1" y2=".8"><stop stop-color="#14252b"/><stop offset=".47" stop-color="#314d54"/><stop offset=".52" stop-color="#172a32"/><stop offset="1" stop-color="#081218"/></linearGradient>
    <linearGradient id="robe-huang" x1="0" x2="1" y2="1"><stop stop-color="#524e32"/><stop offset=".48" stop-color="#2a332b"/><stop offset=".6" stop-color="#696244"/><stop offset="1" stop-color="#131e1d"/></linearGradient>
    <linearGradient id="robe-yun" x1="0" x2=".8" y2="1"><stop stop-color="#ced5cc"/><stop offset=".3" stop-color="#6a8589"/><stop offset=".63" stop-color="#263e47"/><stop offset="1" stop-color="#111e29"/></linearGradient>
    <linearGradient id="blade"><stop stop-color="#fffcec"/><stop offset="1" stop-color="#78b1c7" stop-opacity="0"/></linearGradient>
    <radialGradient id="ground-glow"><stop stop-color="#b4d7ce" stop-opacity=".25"/><stop offset="1" stop-color="#87b5c1" stop-opacity="0"/></radialGradient>
    <linearGradient id="bottom-shade" x2="0" y2="1"><stop stop-color="#050a0f" stop-opacity="0"/><stop offset="1" stop-color="#050a0f"/></linearGradient>
    <filter id="soft-glow" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="bloom" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="22"/></filter>
    <symbol id="sword" viewBox="-12 -170 24 220"><path d="M0-165 5-145 3 4 0 13-3 4-5-145Z" fill="currentColor"/><path d="M-15 8Q0 0 15 8L12 15H-12ZM-3 16H3V42H-3ZM-5 42H5V47H-5Z" fill="currentColor"/></symbol>
    <g id="luyang" stroke-linejoin="round" stroke-linecap="round">
      <path d="M183 115Q122 84 132 55 119 28 151 16 179-9 209 9 247 12 242 50 259 76 227 121L220 220 153 216Z" fill="#071117" stroke="currentColor" stroke-width="2"/>
      <path d="M165 24Q128-33 188-29 214-17 204 22M204 23Q249-13 283 4L247 13 288 32Q242 34 212 47" fill="#12212a" stroke="currentColor" stroke-width="1.5"/>
      <path d="M215 37Q291 34 335 94L301 73 340 114Q276 83 213 60" fill="#234252" stroke="currentColor" stroke-width="1.3"/>
      <path d="M159 56Q162 32 195 31L217 51 215 77 224 91 211 101 204 122 186 130 162 114 155 85Z" fill="#33484a" stroke="currentColor" stroke-width="1.4"/>
      <path d="M143 67Q152 27 189 28 231 27 231 65L207 52 195 62 187 50 160 80 159 123 143 145Z" fill="#09151a"/>
      <path d="M171 122 174 154 145 180 214 200 230 165 203 147 204 120" fill="#263a3b" stroke="currentColor"/>
      <path d="M164 150Q118 156 88 207L42 332 65 424 119 399 146 277 140 386 108 520 82 692 111 775 177 787 211 739 238 801 304 781 298 656 255 466 233 370 249 267 288 350 351 330 323 220 236 158 212 153 194 188Z" fill="url(#robe-lu)" stroke="currentColor" stroke-width="2"/>
      <path d="M163 151 195 192 215 153 238 179 209 239 169 210 140 172M195 192 185 360 215 374 215 234" fill="#455d5c" stroke="currentColor" stroke-width="1.5"/>
      <path d="M145 365Q188 383 234 365L240 398Q192 412 137 397Z" fill="#0b151c" stroke="currentColor" stroke-width="2"/>
      <path d="M196 387 205 397 194 408 185 397Z" fill="currentColor"/>
      <path d="M149 410Q133 562 109 716M179 420 154 736 182 768M216 424 254 755M242 445 290 691M91 219 74 355 111 389M102 206 114 272M254 209 281 298 324 317" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".45"/>
      <path d="M205 406Q226 471 304 480L273 493 319 528Q220 503 200 423M145 392Q105 450 28 457L66 466 38 497Q135 480 158 411" fill="#1d3542" stroke="currentColor" stroke-width="1.5"/>
      <path d="M111 775 107 811 154 814 174 787M240 796 253 825 301 829 301 785" fill="#081319" stroke="currentColor" stroke-width="2"/>
      <path d="M75 398 74 428 89 446 104 438 104 404M320 330 331 348 349 348 355 333 350 324" fill="#344a49" stroke="currentColor" stroke-width="1.5"/>
      <g transform="translate(88 426) rotate(-21)"><path d="M-5 18 0 482 8 18 3 0Z" fill="url(#blade)" stroke="currentColor" stroke-width="1.2"/><path d="M-22 6Q0-6 22 6L20 12-20 12ZM-4-25H4V0H-4Z" fill="#738e8b" stroke="currentColor"/><path d="M-2-27Q-30-22-17 7" stroke="currentColor" fill="none"/></g>
    </g>
    <g id="huang" stroke-linejoin="round" stroke-linecap="round">
      <path d="M167 64Q115 58 111 120 92 203 121 271L88 404 150 389 182 239 232 251 290 423 342 408 303 281Q324 162 281 88 251 43 214 57Z" fill="#091617" stroke="currentColor" stroke-width="2"/>
      <path d="M170 66Q156 91 164 133L183 157 215 162 241 142 248 107 232 75 202 62Z" fill="#56614d" stroke="currentColor" stroke-width="1.5"/>
      <path d="M158 112Q153 73 194 58 242 47 257 95L260 123 231 99 217 81 205 104 177 90 169 131" fill="#111f20"/>
      <path d="M161 64 151 46 176 48 185 33 199 54M229 57 244 38 256 57 280 60 254 74" fill="#72715a" stroke="currentColor"/>
      <path d="M186 157 183 181 155 197 186 233 223 232 251 200 219 179 219 157" fill="#415347" stroke="currentColor" stroke-width="1.5"/>
      <path d="M158 193Q114 198 92 251L38 312 71 362 119 328 151 280 155 359 121 453 89 570 50 700Q136 741 193 709L224 734 293 711 368 720 315 561 272 451 244 359 252 271 299 310 354 279 320 218 248 194 217 217 187 216Z" fill="url(#robe-huang)" stroke="currentColor" stroke-width="2"/>
      <path d="M153 192 190 222 212 219 248 193 234 236 204 259 167 237Z" fill="#777558" stroke="currentColor"/>
      <path d="M157 337Q204 359 245 337L251 365Q208 385 149 361Z" fill="#202c25" stroke="currentColor" stroke-width="2"/>
      <path d="M206 354 217 364 207 377 196 364Z" fill="currentColor"/>
      <path d="M164 379Q129 541 105 676M195 393 166 699M224 388 247 702M253 407 325 697M105 236 75 304 82 337M276 226 306 270 332 268" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".5"/>
      <path d="M157 223Q66 192 15 280 5 326 66 400 76 421 26 454 84 447 93 405 71 359 45 316 62 244 154 249M244 218Q325 170 382 243 426 302 367 384 345 434 400 461 327 448 341 392 391 314 363 268 324 222 247 246" fill="#2a3d33" stroke="currentColor" stroke-width="2"/>
      <path d="M54 316 38 324 35 338 49 352 64 347M335 277 352 278 363 269 355 258 341 260" fill="#68705a" stroke="currentColor"/>
      <path d="M164 713 155 750 183 754 195 713M226 724 239 759 265 752 256 720" fill="#27392f" stroke="currentColor" stroke-width="2"/>
      <path d="M116 156Q100 276 151 312M277 140Q299 237 270 308M128 87Q109 53 125 33M263 83Q301 76 301 47" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".6"/>
    </g>
    <g id="yunzhi" stroke-linecap="round" stroke-linejoin="round">
      <path d="M168 79Q151 23 201 5 258-14 282 34 306 81 289 177L308 375 285 581 130 569 145 325 129 176Q124 107 168 79Z" fill="#07131d" stroke="currentColor" stroke-width="2"/>
      <path d="M181 67 178 111 193 141 216 150 243 137 257 113 257 74 237 47 208 46Z" fill="#82979a" stroke="currentColor" stroke-width="1.3"/>
      <path d="M164 105Q145 42 199 25 253 8 274 68L272 121 252 90 243 61 224 78 212 59 183 97 173 147Z" fill="#0b1a24"/>
      <path d="M199 34 202 13 215 1 225 22 255 35" fill="#b2c3bf" stroke="currentColor"/>
      <path d="M198 146 198 171 157 188 204 232 257 194 231 166 231 145" fill="#627b80" stroke="currentColor"/>
      <path d="M168 180Q115 175 85 228L37 423 6 577 77 596 149 503 139 613 111 766 84 907Q177 943 232 917L275 936 358 912 325 760 283 600 278 487 349 592 421 564 381 367 329 223 256 178 216 209Z" fill="url(#robe-yun)" stroke="currentColor" stroke-width="2"/>
      <path d="M174 182 217 213 250 182 274 205 226 274 187 232 151 198Z" fill="#90a4a1" stroke="currentColor" stroke-width="1.5"/>
      <path d="M217 213 202 396 228 404 236 260" fill="#18323e" stroke="currentColor" stroke-width="1.2"/>
      <path d="M149 396Q217 423 279 396L285 425Q211 454 143 426Z" fill="#142835" stroke="currentColor" stroke-width="2"/>
      <path d="M212 419 222 430 212 444 202 432Z" fill="currentColor"/>
      <path d="M168 458 119 884M205 468 187 915M242 463 280 916M278 492 328 869M95 232 59 509 87 538M128 237 113 402M305 238 353 512 390 544" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".53"/>
      <path d="M134 277 104 395 71 513 42 565M319 291 345 401 376 540" fill="none" stroke="#d6e4d8" stroke-width="1" opacity=".45"/>
      <path d="M146 407Q109 477 62 463L72 482 37 500Q107 514 156 435M279 422Q324 458 376 426L366 447 405 443Q349 493 278 446" fill="#324b57" stroke="currentColor" stroke-width="1.5"/>
      <path d="M173 108Q142 351 178 602L149 654 166 348M257 106Q289 310 255 545L283 612 275 351" fill="#0a1923" stroke="currentColor" stroke-width="1.4"/>
      <path d="M108 918 104 950 156 952 179 931M264 930 282 956 334 951 330 920" fill="#091923" stroke="currentColor"/>
    </g>
    <g id="halo-design" fill="none" stroke="currentColor"><circle r="310" stroke-width="2"/><circle r="294" opacity=".5"/><circle r="248" stroke-dasharray="2 18" stroke-width="4"/><circle r="230" stroke-width="1"/><path d="M0-338V-281M0 281V338M-338 0H-281M281 0H338M-240-240-199-199M199 199 240 240M-240 240-199 199M199-199 240-240" stroke-width="3"/><path d="M0-190 165 95H-165ZM0 190-165-95H165Z" opacity=".35"/></g>
    <g id="talisman"><path d="M-30-70H30V70H-30Z" fill="#554f2e" stroke="currentColor" stroke-width="2"/><path d="M-18-52H18M0-52V-8M-19-22 19 3-13 18 19 35-16 57M-15-7H15M0 8V60" fill="none" stroke="currentColor" stroke-width="2"/></g>
    <g id="four-seal" fill="none" stroke="currentColor"><path d="M-365-285 0-445 365-285V190L0 410-365 190Z" stroke-width="3"/><path d="M-365-285 0-74 365-285M0-74V410M0-445V-74M-365 190 0-74 365 190" stroke-width="1.5"/><circle cy="-74" r="390" stroke-dasharray="4 17"/></g>
  </defs>`;
  let svg, nodes = {}, activeKey = '', particles = [], stars = [], fxNodes = [];
  function get(id) { return svg.querySelector('#'+id); }
  function attr(node, name, value) { if(node) node.setAttribute(name,String(value)); }
  function opacity(node, n) { attr(node,'opacity',clamp(n,0,1).toFixed(3)); }
  function mount(el) {
    const starMarkup=Array.from({length:78},(_,i)=>`<circle class="star" cx="${rand(i+1)*1080}" cy="${rand(i+87)*1600}" r="${.6+rand(i+174)*2.5}" fill="#dce5d4"/>`).join('');
    const particleMarkup=Array.from({length:24},(_,i)=>`<path class="particle" d="M-1-8H1V8H-1Z" fill="currentColor"/>`).join('');
    el.innerHTML=`<svg xmlns="${NS}" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid meet">${defs}<rect width="1080" height="1920" fill="url(#sky)"/><g id="stars">${starMarkup}</g><g id="rays" stroke="currentColor" opacity=".1">${Array.from({length:16},(_,i)=>`<path d="M540 1110  ${540+Math.cos(i*Math.PI/8)*1500} ${1110+Math.sin(i*Math.PI/8)*1500}"/>`).join('')}</g><g id="back-ring" transform="translate(540 1040)" color="#cbb990"><use href="#halo-design"/></g><g id="mountains"><path d="M-100 1370 60 1220 130 1240 220 1050 380 1280 510 1180 640 1340 790 1140 920 1260 1150 1030V1920H-100Z" fill="#183335" opacity=".32"/><path d="M-100 1530 90 1420 190 1450 330 1310 430 1400 560 1370 700 1490 840 1320 1030 1450 1160 1380V1920H-100Z" fill="#13282c"/><path d="M-100 1690 190 1570 330 1610 480 1510 610 1560 750 1500 1080 1650V1920H-100Z" fill="#0a1c23"/></g><ellipse id="floor-glow" cx="540" cy="1630" rx="550" ry="170" fill="url(#ground-glow)"/><g id="effect-back"></g><g id="characters"><g id="char-left"></g><g id="char-main"></g><g id="char-right"></g></g><g id="effect-front"></g><g id="particles" color="#d6c18c">${particleMarkup}</g><g id="mist" stroke="currentColor" fill="none" opacity=".1"><path d="M-80 1640Q170 1510 420 1660T1160 1600" stroke-width="2"/><path d="M-100 1690Q190 1590 430 1710T1180 1660"/><path d="M-130 1750Q390 1630 690 1770T1190 1710" stroke-width="2"/></g><rect y="1530" width="1080" height="390" fill="url(#bottom-shade)"/></svg>`;
    svg=el.firstElementChild;
    ['sky-core','stars','rays','back-ring','mountains','floor-glow','effect-back','effect-front','characters','char-left','char-main','char-right','particles','mist'].forEach(id=>nodes[id]=get(id));
    particles=[...svg.querySelectorAll('.particle')];stars=[...svg.querySelectorAll('.star')];
  }
  function character(node, id, x, y, scale, alpha=1, rotation=0) {
    if(node.dataset.character!==id){ node.innerHTML=id?`<use href="#${id}"/>`:'';node.dataset.character=id; }
    attr(node,'transform',`translate(${x} ${y}) rotate(${rotation}) scale(${scale}) translate(-210 0)`);opacity(node,alpha);
  }
  function setup(scene) {
    let back='',front='';
    switch(scene.effect){
      case 'ink-reveal': case 'trio-title-reveal':
        back='<g id="fx-a" transform="translate(540 1100)"><circle r="550" fill="none" stroke="currentColor" stroke-width="1"/><circle r="535" fill="none" stroke="currentColor" stroke-dasharray="3 30"/></g>';break;
      case 'blue-sword-draw':
        front='<g id="fx-a"><path d="M120 1660 930 640" stroke="currentColor" stroke-width="24" filter="url(#soft-glow)"/><path d="M120 1660 930 640" stroke="#e9f4ed" stroke-width="4"/></g>';break;
      case 'gold-halo-draw': case 'sigil-pop':
        back='<g id="fx-a"><use href="#halo-design"/></g><g id="fx-b"><circle r="430" fill="none" stroke="currentColor" stroke-dasharray="3 22" stroke-width="2"/></g>';break;
      case 'white-sleeve':
        back='<g id="fx-a"><path d="M-200 1650Q300 720 1220 870" fill="none" stroke="currentColor" stroke-width="3"/><path d="M-200 1700Q300 770 1220 920" fill="none" stroke="currentColor" opacity=".3" stroke-width="36"/></g>';break;
      case 'seal-print':
        front='<g id="fx-a"><path d="M-230-185H230V185H-230ZM-210-165H210V165H-210Z" fill="#172218" stroke="currentColor" stroke-width="5"/><text y="25" text-anchor="middle" fill="currentColor" font-family="serif" font-size="130" letter-spacing="18">天庭</text><path d="M-160 85H160" stroke="currentColor"/></g>';break;
      case 'fire-sign':
        back='<g id="fx-a"><path d="M-360 20-280-75H280L360 20Z" fill="#5b4b28" stroke="currentColor" stroke-width="4"/><path d="M-280 20V320M280 20V320" stroke="currentColor" stroke-width="9"/><path d="M-215 40H215V150H-215Z" fill="#19211a" stroke="currentColor" stroke-width="3"/><text y="112" text-anchor="middle" fill="currentColor" font-size="64" font-family="serif">再來一次</text></g>';
        front='<g id="fx-b">'+Array.from({length:7},(_,i)=>`<path class="flame" d="M${-180+i*60} 80q-45-70 10-145-5 65 30 90 24-55 5-85 95 100-5 150Z" fill="currentColor" opacity=".5"/>`).join('')+'</g>';break;
      case 'small-halo':back='<g id="fx-a"><use href="#halo-design"/></g>';break;
      case 'smoke-flare':
        front='<g id="fx-a">'+Array.from({length:7},(_,i)=>`<ellipse cx="${180+i*115}" cy="${880+rand(i+300)*180}" rx="200" ry="${90+rand(i+301)*75}" fill="#0c1112" stroke="currentColor" stroke-width="1"/>`).join('')+'<path d="M480 900 440 1010 501 983 470 1100 580 945 523 960 558 890" fill="currentColor"/></g><g id="fx-b"><path d="M-170-10Q-150 140 0 140 150 140 170-10ZM-180-15H180" fill="#15241f" stroke="currentColor" stroke-width="4"/><path d="M-105 160H105" stroke="currentColor" stroke-width="3"/></g>';break;
      case 'shrink-seal':
        front='<g id="fx-a"><path d="M-160-160H160V160H-160Z" stroke="currentColor" stroke-width="4" fill="none"/><path d="M0-190 190 0 0 190-190 0Z" fill="none" stroke="currentColor"/><use href="#talisman" transform="scale(1.9)"/></g>';break;
      case 'freeze-chaos':
        front='<g id="fx-a">'+Array.from({length:10},(_,i)=>`<g class="paper" data-i="${i}"><use href="#talisman"/></g>`).join('')+'</g>';break;
      case 'silence-dark':
        front='<g id="fx-a"><path d="M250 1070H830" stroke="currentColor" stroke-width="1"/><path d="M540 1060V1080" stroke="currentColor"/></g>';break;
      case 'sword-origin':
        back='<g id="fx-a">'+Array.from({length:36},(_,i)=>`<g class="flying-sword" data-i="${i}"><use href="#sword" x="-12" y="-170" width="24" height="220"/></g>`).join('')+'</g><g id="fx-b"><circle r="390" fill="none" stroke="currentColor"/><circle r="425" fill="none" stroke="currentColor" stroke-dasharray="3 19"/></g>';break;
      case 'dual-timeline':
        back='<g id="fx-a"><path d="M540-100 491 500 580 910 488 1310 570 2020" stroke="currentColor" fill="none" stroke-width="35" filter="url(#soft-glow)"/><path d="M540-100 491 500 580 910 488 1310 570 2020" stroke="#e7f4f6" fill="none" stroke-width="4"/><path d="M0 1170 470 990M600 1390 1080 1110M20 1460 460 1280" stroke="currentColor" fill="none" stroke-width="2"/></g>';break;
      case 'stars-box':
        back='<g id="fx-a"><use href="#four-seal"/></g><g id="fx-b">'+Array.from({length:4},(_,i)=>`<g transform="translate(${[135,945,135,945][i]} ${[840,840,1370,1370][i]}) scale(.32)"><use href="#${i%2?'yunzhi':'luyang'}" x="-210"/></g>`).join('')+'</g>';break;
      case 'dual-shadow':
        front='<g id="fx-a"><path d="M540 650V1750" stroke="currentColor" stroke-width="2"/><circle cx="540" cy="1240" r="185" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="540" cy="1240" r="215" fill="none" stroke="currentColor" stroke-dasharray="2 20"/></g>';break;
      case 'one-hand-freeze':
        back='<g id="fx-a"><use href="#huang" transform="translate(540 750) scale(1.8) translate(-210 0)" opacity=".25"/></g>';
        front='<g id="fx-b"><path d="M60 1220Q540 1140 1020 1220M90 1250Q540 1170 990 1250M130 1290Q540 1210 950 1290" fill="none" stroke="currentColor" stroke-width="3"/></g>';break;
      case 'cosmic-dao':
        back='<g id="fx-a"><use href="#halo-design"/><circle r="430" stroke="currentColor" fill="none" stroke-width="1"/><circle r="470" stroke="currentColor" fill="none" stroke-dasharray="2 12" stroke-width="3"/></g><g id="fx-b"><path d="M-90-500Q500 0-90 500M90-500Q-500 0 90 500" fill="none" stroke="currentColor" stroke-width="3"/></g>';break;
    }
    nodes['effect-back'].innerHTML=back;nodes['effect-front'].innerHTML=front;
    fxNodes=[get('fx-a'),get('fx-b')];
    nodes.papers=[...svg.querySelectorAll('.paper')];nodes.swords=[...svg.querySelectorAll('.flying-sword')];
  }
  function render(scene, t, project) {
    if(!svg)return;
    if(!scene){opacity(svg,0);return;}opacity(svg,1);
    const key=scene.id+'|'+scene.effect;
    if(activeKey!==key){activeKey=key;setup(scene);}
    const p=progress(scene,t), entry=.35+.65*ease(p*5), epic=scene.phase==='epic', dark=scene.phase==='break';
    const color=scene.accent || '#cbb990';attr(svg,'color',color);
    attr(nodes['sky-core'],'stop-color',dark?'#080b0d':epic?'#142530':scene.phase==='fun'?'#3b3927':'#263332');
    attr(nodes['back-ring'],'color',color);attr(nodes.particles,'color',color);
    opacity(nodes.stars,dark?.04:epic?.85:.45);opacity(nodes.mountains,dark?.06:epic?.55:1);
    opacity(nodes['floor-glow'],dark?0:.6);opacity(nodes.rays,dark?0:epic?.18:.05);
    attr(nodes.rays,'transform',`rotate(${t*1.2} 540 1110)`);
    opacity(nodes['back-ring'],dark?0:scene.phase==='fun'?.15:.32);
    attr(nodes['back-ring'],'transform',`translate(540 ${epic?1100:1070}) rotate(${t*2}) scale(${epic?1.3:1})`);
    attr(nodes.mist,'transform',`translate(${Math.sin(t*.4)*50} ${Math.cos(t*.3)*18})`);
    stars.forEach((el,i)=>opacity(el,.3+.6*(Math.sin(t*(.2+rand(i)) + i)*.5+.5)));
    particles.forEach((el,i)=>{const v=frac(rand(i+100)+t*(epic?.025:.009));attr(el,'transform',`translate(${rand(i+122)*1080+Math.sin(t+i)*12} ${1850-v*1600}) rotate(${rand(i)*180})`);opacity(el,dark?0:Math.sin(v*Math.PI)*(.15+rand(i+5)*.45));});
    const main=nodes['char-main'],left=nodes['char-left'],right=nodes['char-right'];
    const float=Math.sin(t*1.2)*8;
    character(left,'',0,0,1,0);character(right,'',0,0,1,0);
    if(scene.character==='trio'||scene.phase==='intro'){
      const reveal=scene.phase==='intro'?.8+.2*ease(p*5):entry;
      character(left,'huang',240,1000+float,.8,reveal*.8);
      character(right,'yunzhi',825,790,.95,reveal*.8);
      character(main,'luyang',530,960,.94,reveal);
    } else if(scene.character){
      const id=scene.character;
      character(main,id,540, id==='yunzhi'?735:850+(id==='huang'?float:0),id==='yunzhi'?1.03:1.08,entry);
    }else character(main,'',0,0,1,0);
    const [a,b]=fxNodes;
    opacity(a,entry);opacity(b,entry);
    switch(scene.effect){
      case 'ink-reveal':
        opacity(nodes.characters,.75+entry*.25);attr(a,'transform',`translate(540 1100) rotate(${-p*12}) scale(${.85+p*.1})`);break;
      case 'trio-title-reveal':
        opacity(nodes.characters,entry);attr(a,'transform',`translate(540 1100) rotate(${p*8}) scale(${1.25-p*.18})`);break;
      default:opacity(nodes.characters,dark?0:1);
    }
    switch(scene.effect){
      case 'blue-sword-draw':opacity(a,Math.sin(clamp(p*2.4,0,1)*Math.PI)*.85+.1);attr(a,'transform',`translate(${(1-entry)*-450} ${(1-entry)*360})`);break;
      case 'gold-halo-draw':case 'sigil-pop':
        attr(a,'transform',`translate(540 1170) rotate(${p*45}) scale(${.7+entry*.55})`);
        attr(b,'transform',`translate(540 1170) rotate(${-p*30}) scale(${.7+entry*.35})`);opacity(b,.4);break;
      case 'white-sleeve':attr(a,'transform',`translate(${(1-entry)*-300} 0)`);opacity(a,.5);break;
      case 'seal-print':attr(a,'transform',`translate(560 1240) rotate(-12) scale(${1.7-entry*.7})`);break;
      case 'fire-sign':
        attr(a,'transform','translate(540 1180)');opacity(main,.55);
        attr(b,'transform',`translate(540 ${1640+Math.sin(t*13)*5}) scale(1 ${.85+Math.sin(t*17)*.1})`);break;
      case 'small-halo':
        character(main,'luyang',520,1030,.88,entry);
        character(left,'huang',545,930-entry*50,.47-entry*.25,entry);
        attr(a,'transform',`translate(545 ${965-entry*50}) scale(${.45-entry*.2}) rotate(${p*20})`);break;
      case 'smoke-flare':attr(a,'transform',`translate(${Math.sin(t)*15} ${-p*100})`);attr(b,'transform','translate(540 1510)');break;
      case 'shrink-seal':
        character(left,'luyang',295,1130+entry*120,.65-entry*.42,entry*.6);
        attr(a,'transform',`translate(295 1390) rotate(${p*55}) scale(${.3+entry*.4})`);break;
      case 'freeze-chaos':
        nodes.papers.forEach((el,i)=>{const move=Math.min(p,.4)/.4;attr(el,'transform',`translate(${110+rand(i+600)*860+Math.sin(i)*move*35} ${850+rand(i+620)*740-move*80}) rotate(${(rand(i+640)-.5)*80+move*25}) scale(.55)`);opacity(el,.35);});break;
      case 'silence-dark':
        opacity(a,.2+entry*.15);opacity(nodes.mist,0);break;
      case 'sword-origin':
        nodes.swords.forEach((el,i)=>{const angle=i*10+p*10,r=300+entry*380+Math.sin(i)*50;attr(el,'transform',`translate(540 1230) rotate(${angle}) translate(0 ${-r}) scale(${.6+rand(i+700)*.7})`);opacity(el,.25+rand(i+750)*.5);});
        attr(b,'transform',`translate(540 1230) rotate(${-p*25}) scale(${.8+entry*.35})`);opacity(b,.4);break;
      case 'dual-timeline':
        opacity(main,0);character(left,'luyang',310-p*35,1030,.85,entry);character(right,'luyang',790+p*35,920,.9,entry*.6,-5);opacity(a,.6+Math.sin(p*Math.PI)*.4);break;
      case 'stars-box':
        attr(a,'transform',`translate(540 1170) scale(${1.65-entry*.65}) rotate(${(1-entry)*15})`);opacity(b,entry*.65);
        character(main,'huang',540,1090,.65,entry);break;
      case 'dual-shadow':
        opacity(main,0);character(left,'huang',300+entry*75,1010,.8,entry);character(right,'huang',820-entry*75,1010,.8,entry*.8);attr(right,'color','#829dad');attr(a,'transform',`rotate(${p*20} 540 1240)`);break;
      case 'one-hand-freeze':
        character(main,'yunzhi',540,1160,.58,entry);attr(a,'transform',`translate(0 ${-entry*70})`);opacity(a,.6);attr(b,'transform',`translate(0 ${(1-entry)*-400})`);break;
      case 'cosmic-dao':
        attr(a,'transform',`translate(540 1210) rotate(${p*12}) scale(${1.25+entry*.22})`);
        attr(b,'transform',`translate(540 1210) rotate(${-p*15}) scale(${1.2+entry*.22})`);opacity(b,.4);
        character(main,'yunzhi',540,1350,.43,entry);break;
    }
    if(scene.effect!=='dual-shadow')attr(right,'color','inherit');
    if(scene.effect!=='silence-dark')opacity(nodes.mist,.13);
    const shock=epic?Math.exp(-p*18)*Math.sin(p*85)*5:0;
    attr(nodes.characters,'transform',`translate(${shock} 0)`);
    return { progress:p, entry };
  }
  window.EditArtwork={mount,render};
})();
