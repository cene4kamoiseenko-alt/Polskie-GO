/**
 * BOBEK V5: physically registered FRONT-IDLE body and TWO distinct wardrobes.
 *
 * All drawing paths share one fixed 1024x1024 canvas. No independent cutout
 * crop/resize/origin is ever performed on garment components.
 * Backing face/body is sourced from the existing 2.5D experimental nude art
 * (assets/bobek-v3-sources.json.gz.b64); not the canonical production face.
 *
 * This is an art/layout proof for a new master, not a verified production rig:
 * no animated limb bones, side/back poses, or player wardrobe integration.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import sharp from 'sharp';

const root=process.cwd();
const dst=join(root,'apps/web/src/dev/bobek-v5');
mkdirSync(dst,{recursive:true});
const src=JSON.parse(gunzipSync(Buffer.from(readFileSync(join(root,'assets/bobek-v3-sources.json.gz.b64'),'utf8').trim(),'base64')).toString('utf8'));
if(typeof src.body!=='string')throw Error('Missing already-known nude beaver art');
const N=1024;
const body=await sharp(Buffer.from(src.body,'base64')).resize(680,958).png().toBuffer();
const bodyPNG=await sharp({create:{width:N,height:N,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
  .composite([{input:body,left:174,top:30}]).png().toBuffer();

const palettes={
  red:{dark:'#95192d',body:'#d62844',shine:'#ff5065',pale:'#ff94a1'},
  denim:{dark:'#174579',body:'#2c699d',shine:'#4b99d4',pale:'#82b9de'},
};
const defs=p=>`<defs>
<linearGradient id="fabric" x1=".12" y1=".1" x2=".9" y2=".86"><stop offset="0" stop-color="${p.shine}"/><stop offset=".27" stop-color="${p.body}"/><stop offset=".78" stop-color="${p.dark}"/></linearGradient>
<linearGradient id="hem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.shine}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>
</defs>`;
function shape(which, layer){
 const p=palettes[which], denim=which==='denim';
 switch(layer){
  case 'left-sleeve':return `<path d="M440 564 Q397 563 373 582 Q341 615 322 672 Q320 685 337 697 Q361 717 383 698 Q414 665 449 630 L465 590Z" fill="url(#fabric)" stroke="${p.dark}" stroke-width="9"/>
<path d="M327 674 Q348 690 378 694" fill="none" stroke="${p.shine}" stroke-width="7"/>
<path d="M351 626 Q377 630 392 654" fill="none" stroke="${p.dark}" stroke-opacity=".28" stroke-width="10"/>`;
  case 'right-sleeve':return `<path d="M705 564 Q745 561 770 590 Q799 625 824 680 Q827 697 808 711 Q792 728 775 712 Q735 681 706 635 L691 589Z" fill="url(#fabric)" stroke="${p.dark}" stroke-width="9"/>
<path d="M770 623 Q794 641 813 683" fill="none" stroke="${p.shine}" stroke-width="8" opacity=".60"/>
<path d="M771 703 Q788 707 809 696" fill="none" stroke="${p.dark}" stroke-width="13" stroke-linecap="round"/>`;
  case 'front':
   return denim ?
`<path d="M437 566 Q496 551 577 555 Q644 548 719 565 Q739 588 742 647 L757 797 Q750 839 723 848 Q576 870 415 843 Q397 836 397 795 L412 642 Q416 591 437 566Z" fill="url(#fabric)" stroke="${p.dark}" stroke-width="8"/>
<path d="M448 570 L516 603 L579 594 L649 604 L705 565" fill="none" stroke="${p.shine}" stroke-width="7" opacity=".7"/>
<path d="M520 580 L573 620 L558 664 L523 646Z M620 581 L571 620 L594 661 L622 644Z" fill="${p.body}" stroke="#acd2e9" stroke-width="5"/>
<path d="M575 623 L571 838" fill="none" stroke="#c7dceb" stroke-opacity=".7" stroke-width="7"/>
<path d="M437 767 L517 758 L517 805 L438 813 Z M632 758 L708 768 L708 813 L633 802Z" fill="${p.dark}" fill-opacity=".45" stroke="${p.shine}" stroke-width="4"/>
<path d="M424 806 Q581 825 738 806" fill="none" stroke="${p.dark}" stroke-width="22"/>
<path d="M425 796 Q584 814 740 795" fill="none" stroke="${p.shine}" stroke-opacity=".65" stroke-width="6"/>
<circle cx="584" cy="692" r="5" fill="#d5cfbb"/><circle cx="582" cy="749" r="5" fill="#d5cfbb"/><circle cx="579" cy="799" r="5" fill="#d5cfbb"/>`:
`<path d="M437 566 Q498 548 577 549 Q643 543 717 565 Q741 593 739 643 L756 796 Q753 833 731 848 Q582 870 419 842 Q396 832 397 790 L413 642 Q412 591 437 566Z" fill="url(#fabric)" stroke="${p.dark}" stroke-width="9"/>
<path d="M438 567 Q490 603 533 595 Q579 587 611 599 Q657 598 716 564" fill="none" stroke="${p.shine}" stroke-width="13" opacity=".7"/>
<path d="M454 608 Q482 646 468 740" fill="none" stroke="${p.shine}" stroke-width="7" opacity=".24"/>
<path d="M700 612 Q691 674 713 773" fill="none" stroke="${p.dark}" stroke-width="14" opacity=".28"/>
<path d="M422 798 Q576 816 747 797 L734 837 Q582 862 418 833Z" fill="url(#hem)" stroke="${p.dark}" stroke-width="5"/>
<path d="M517 731 Q576 749 640 725 L640 790 Q570 804 515 786Z" fill="${p.dark}" fill-opacity=".12" stroke="${p.shine}" stroke-opacity=".40" stroke-width="3"/>
<path d="M521 582 Q516 629 526 650 M612 586 Q620 626 618 649" fill="none" stroke="#fff2e8" stroke-width="7" stroke-linecap="round"/>
<circle cx="526" cy="649" r="7" fill="#fff2e8"/><circle cx="618" cy="648" r="7" fill="#fff2e8"/>
<text x="579" y="739" text-anchor="middle" font-family="DejaVu Sans,Arial" font-size="107" font-weight="bold" fill="#fff">PL</text>`;
  case 'collar':
   return denim ?
`<path d="M442 562 Q483 541 526 548 Q576 564 604 550 Q655 540 707 560 L648 623 L579 607 L505 628Z" fill="${p.dark}" stroke="${p.shine}" stroke-width="7"/>
<path d="M451 558 L509 603 L558 580 M698 557 L648 601 L598 579" fill="none" stroke="#c0d8ea" stroke-width="6"/>` :
`<path d="M443 555 Q496 521 549 548 Q576 566 610 545 Q675 523 712 554 Q708 584 672 599 Q609 614 560 603 Q497 613 446 582Z" fill="url(#hem)" stroke="${p.dark}" stroke-width="9"/>
<path d="M459 560 Q508 578 547 582 Q634 593 696 560" fill="none" stroke="${p.shine}" stroke-opacity=".75" stroke-width="9"/>`;
  default:throw Error('Unexpected garment part');
 }
}
const layers=['left-sleeve','right-sleeve','front','collar'];
async function saveWebP(png,stem){
 for(const width of [1024,512,256]){
  const target=join(dst,`${stem}${width===1024?'':'@'+width}.webp`);
  await sharp(png).resize(width,width).webp({lossless:width===1024,quality:width===1024?100:91,effort:4}).toFile(target);
  const meta=await sharp(target).metadata();
  if(meta.width!==width||meta.height!==width||!meta.hasAlpha)throw Error('Invalid alpha sprite: '+target);
 }
}
await saveWebP(bodyPNG,'body');
const buffers={body:bodyPNG};
for(const outfit of ['red','denim'])for(const part of layers){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs(palettes[outfit])}${shape(outfit,part)}</svg>`;
  writeFileSync(join(dst,`${outfit}-${part}.svg`),svg);
  const png=await sharp(Buffer.from(svg)).png().toBuffer();
  buffers[`${outfit}-${part}`]=png;
  await saveWebP(png,`${outfit}-${part}`);
}
for(const outfit of ['red','denim']){
 const composites=layers.map(part=>({input:buffers[`${outfit}-${part}`]}));
 const png=await sharp(bodyPNG).composite(composites).png().toBuffer();
 await saveWebP(png,`composite-${outfit}`);
}
writeFileSync(join(dst,'manifest.json'),JSON.stringify({
 version:'bobek-v5-shared-canvas-draft@1',
 type:'front-idle, registered transparent layer geometry',
 source:'existing V3 nude body art, not the canonical production face',
 bodyRect:{x:174,y:30,w:680,h:958},
 anchors:{neck:[567,558],shoulderLeft:[440,564],shoulderRight:[705,564],hem:[565,845]},
 layers:['body',...['red','denim'].flatMap(outfit=>layers.map(p=>`${outfit}-${p}`))],
 productionReady:false,
 review:'seams, fabric polish, canonical identity, animation and more views still pending',
},null,2)+'\n');
console.log('Bobek V5 QA: 11 original registered images + resized outputs and independent clothing SVGs.');
