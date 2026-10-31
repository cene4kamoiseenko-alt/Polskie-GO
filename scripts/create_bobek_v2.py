from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import cairosvg, io, json, math
ROOT=Path(__file__).resolve().parents[1] / 'apps/web/src/dev/bobek-v2'
ROOT.mkdir(exist_ok=True)
S=1024
DEFS='''<defs>
<radialGradient id="fur" cx="35%" cy="25%" r="79%"><stop stop-color="#f8be6d"/><stop offset=".44" stop-color="#cd7b37"/><stop offset=".79" stop-color="#a85626"/><stop offset="1" stop-color="#693618"/></radialGradient>
<radialGradient id="belly" cx="37%" cy="18%" r="90%"><stop stop-color="#ffedbf"/><stop offset=".55" stop-color="#f1c986"/><stop offset="1" stop-color="#bd783b"/></radialGradient>
<radialGradient id="muzzle" cx="40%" cy="20%" r="85%"><stop stop-color="#fff2d1"/><stop offset=".62" stop-color="#f2d09a"/><stop offset="1" stop-color="#cc9555"/></radialGradient>
<linearGradient id="hood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff685a"/><stop offset=".28" stop-color="#e72f3f"/><stop offset=".7" stop-color="#b8152b"/><stop offset="1" stop-color="#77182b"/></linearGradient>
<linearGradient id="denim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#95c5e3"/><stop offset=".25" stop-color="#3d7ca7"/><stop offset=".76" stop-color="#255780"/><stop offset="1" stop-color="#173452"/></linearGradient>
<linearGradient id="tail" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9b572e"/><stop offset=".58" stop-color="#66351d"/><stop offset="1" stop-color="#422213"/></linearGradient>
<linearGradient id="cap" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ff655c"/><stop offset=".55" stop-color="#dd2839"/><stop offset="1" stop-color="#ac1930"/></linearGradient>
<linearGradient id="bag" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#768a99"/><stop offset=".4" stop-color="#324962"/><stop offset="1" stop-color="#17283f"/></linearGradient>
<radialGradient id="glow" cx="35%" cy="20%" r="85%"><stop stop-color="#fff" stop-opacity=".85"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>'''
def svg(body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{DEFS}{body}</svg>'

def face(pose):
    if pose=='think':
      mouth='<path d="M477 495 Q513 505 540 496" fill="none" stroke="#6e371d" stroke-width="10" stroke-linecap="round"/>'
      brows='<path d="M393 298 Q428 284 460 305 M557 297 Q590 286 625 312" fill="none" stroke="#803e1c" stroke-width="13" stroke-linecap="round"/>'
    elif pose=='celebrate':
      mouth='<path d="M457 470 Q510 567 568 473 Q558 555 518 554 Q481 546 457 470" fill="#782f2b" stroke="#8d3d22" stroke-width="9"/><path d="M493 533 Q518 511 544 537" fill="none" stroke="#f59b8b" stroke-width="11"/>'
      brows=''
    else:
      mouth='<path d="M453 472 Q509 539 568 476 Q557 548 512 548 Q469 544 453 472" fill="#702d28" stroke="#824522" stroke-width="8"/><path d="M473 524 Q515 500 555 525" fill="none" stroke="#e98a7f" stroke-width="12"/>'
      brows=''
    eyes='''<ellipse cx="427" cy="327" rx="50" ry="64" fill="#fff4e4" stroke="#8a4824" stroke-width="9"/>
 <ellipse cx="586" cy="327" rx="50" ry="64" fill="#fff4e4" stroke="#8a4824" stroke-width="9"/>
 <ellipse cx="443" cy="330" rx="27" ry="44" fill="#30231e"/><ellipse cx="571" cy="330" rx="27" ry="44" fill="#30231e"/>
 <ellipse cx="435" cy="315" rx="12" ry="18" fill="#fff"/><ellipse cx="563" cy="315" rx="12" ry="18" fill="#fff"/>
 <circle cx="452" cy="353" r="5" fill="#ad775f"/><circle cx="580" cy="354" r="5" fill="#ad775f"/>'''
    if pose=='happy':
      eyes=eyes.replace('<ellipse cx="586" cy="327" rx="50" ry="64" fill="#fff4e4" stroke="#8a4824" stroke-width="9"/>','<path d="M544 330 Q587 293 633 330" fill="none" stroke="#582a20" stroke-width="14" stroke-linecap="round"/>')
      eyes=eyes.replace('<ellipse cx="571" cy="330" rx="27" ry="44" fill="#30231e"/>','').replace('<ellipse cx="563" cy="315" rx="12" ry="18" fill="#fff"/>','').replace('<circle cx="580" cy="354" r="5" fill="#ad775f"/>','')
    return f'''<g>
<ellipse cx="313" cy="203" rx="56" ry="65" transform="rotate(-25 313 203)" fill="url(#fur)" stroke="#713b1a" stroke-width="11"/>
<ellipse cx="317" cy="205" rx="30" ry="38" transform="rotate(-25 317 205)" fill="#d9918a"/>
<ellipse cx="710" cy="203" rx="56" ry="65" transform="rotate(25 710 203)" fill="url(#fur)" stroke="#713b1a" stroke-width="11"/>
<ellipse cx="707" cy="204" rx="30" ry="38" transform="rotate(25 707 204)" fill="#d9918a"/>
<path d="M512 104 C666 91 755 203 747 352 C743 473 650 564 514 565 C370 566 277 485 279 344 C279 216 363 105 512 104Z" fill="url(#fur)" stroke="#9b4e22" stroke-width="12"/>
<path d="M315 350 C294 305 312 256 345 226" fill="none" stroke="#ffdb8a" stroke-width="15" opacity=".23" stroke-linecap="round"/>
<path d="M481 122 Q482 79 518 105 Q526 70 548 108" fill="url(#fur)" stroke="#974d25" stroke-width="8"/>
{brows}{eyes}
<ellipse cx="396" cy="414" rx="79" ry="76" fill="url(#muzzle)"/>
<ellipse cx="624" cy="414" rx="79" ry="76" fill="url(#muzzle)"/>
<ellipse cx="409" cy="422" rx="47" ry="36" fill="#d78779" opacity=".27"/><ellipse cx="616" cy="422" rx="47" ry="36" fill="#d78779" opacity=".27"/>
<path d="M469 405 Q512 373 555 405 Q552 427 515 440 Q474 431 469 405Z" fill="#3c2725" stroke="#704337" stroke-width="7"/><ellipse cx="495" cy="401" rx="15" ry="8" fill="#f6e3d0" opacity=".45"/>
{mouth}
<path d="M479 488 Q501 500 509 486 L512 542 Q489 556 480 532Z" fill="#fff5dd" stroke="#bd9878" stroke-width="5"/>
<path d="M513 488 Q530 500 550 489 L547 531 Q538 557 514 542Z" fill="#fff5dd" stroke="#bd9878" stroke-width="5"/>
<path d="M511 488 L512 541" fill="none" stroke="#cfb9a0" stroke-width="5"/>
<g stroke="#ab602d" stroke-width="4" opacity=".55" stroke-linecap="round"><path d="M344 427L285 407M349 446L284 445M355 461L293 485M671 427L733 408M672 446L735 448M665 461L732 485"/></g>
<g fill="#965124" opacity=".35"><circle cx="371" cy="439" r="3"/><circle cx="388" cy="451" r="3"/><circle cx="655" cy="440" r="3"/><circle cx="636" cy="452" r="3"/></g>
</g>'''

def paws(pose):
    if pose=='wave':
      armR='''<path d="M645 605 Q714 534 751 448 Q773 402 792 348 Q810 313 846 327 Q889 350 863 402 Q817 530 744 671Z" fill="url(#fur)" stroke="#8b4922" stroke-width="12"/>
      <path d="M791 346 Q775 290 793 269 Q815 256 825 307 Q826 255 846 253 Q863 267 852 318 Q863 276 883 284 Q899 304 874 339 Q898 306 913 326 Q924 348 893 378 Q857 418 819 403Z" fill="url(#fur)" stroke="#8b4922" stroke-width="9"/>'''
    elif pose=='celebrate':
      armR='''<path d="M648 610 Q723 521 753 391 L800 326 Q827 312 852 345 Q863 373 839 401 Q801 570 728 689Z" fill="url(#fur)" stroke="#8b4922" stroke-width="12"/>
      <ellipse cx="829" cy="351" rx="52" ry="49" fill="url(#fur)" stroke="#8b4922" stroke-width="9"/>'''
    elif pose=='think':
      armR='''<path d="M664 629 Q711 635 718 585 Q722 516 602 478 L583 520 Q666 571 662 650Z" fill="url(#fur)" stroke="#8b4922" stroke-width="12"/>
      <ellipse cx="598" cy="484" rx="47" ry="44" fill="url(#fur)" stroke="#8b4922" stroke-width="8"/>'''
    else:
      armR='''<path d="M653 595 Q724 600 759 718 Q767 762 731 785 Q691 807 671 751 L623 654Z" fill="url(#fur)" stroke="#8b4922" stroke-width="12"/>
      <ellipse cx="728" cy="758" rx="48" ry="45" fill="url(#fur)" stroke="#8b4922" stroke-width="7"/>'''
    if pose=='celebrate':
      armL='''<path d="M367 615 Q306 517 267 389 L219 319 Q196 312 177 340 Q159 369 186 397 Q218 559 290 691Z" fill="url(#fur)" stroke="#8b4922" stroke-width="12"/>
      <ellipse cx="196" cy="342" rx="52" ry="46" fill="url(#fur)" stroke="#8b4922" stroke-width="8"/>'''
    else:
      armL='''<path d="M368 588 Q309 595 272 705 Q251 763 288 789 Q331 811 356 743 L406 642Z" fill="url(#fur)" stroke="#8b4922" stroke-width="12"/>
      <ellipse cx="295" cy="757" rx="47" ry="42" fill="url(#fur)" stroke="#8b4922" stroke-width="8"/>'''
    return armL,armR

def body(pose):
    left,right=paws(pose)
    return f'''<ellipse cx="510" cy="970" rx="264" ry="24" fill="#3a2519" opacity=".17"/>
<path d="M377 754 Q250 710 178 805 Q137 892 237 934 Q315 955 387 876Z" fill="url(#tail)" stroke="#4d2e21" stroke-width="14"/>
<g stroke="#d09a63" stroke-opacity=".22" stroke-width="9" fill="none"><path d="M204 826L309 926M248 795L349 897M185 888L302 796M224 925L340 812"/></g>
<path d="M386 818 Q356 906 381 933 Q422 968 478 941 L489 822Z" fill="url(#fur)" stroke="#814522" stroke-width="12"/>
<path d="M552 824 Q542 907 571 934 Q625 966 664 923 L642 813Z" fill="url(#fur)" stroke="#814522" stroke-width="12"/>
<ellipse cx="425" cy="937" rx="70" ry="29" fill="#783d25"/><ellipse cx="607" cy="936" rx="72" ry="29" fill="#783d25"/>
{left}{right}
<path d="M508 533 C371 529 333 629 333 767 C339 860 408 893 516 893 C644 893 685 848 694 759 C696 636 650 529 508 533Z" fill="url(#fur)" stroke="#985025" stroke-width="13"/>
<ellipse cx="512" cy="720" rx="126" ry="163" fill="url(#belly)" stroke="#c99758" stroke-width="8"/>
<path d="M462 666 Q513 646 563 664" fill="none" stroke="#fff2c4" opacity=".55" stroke-width="10"/>
{face(pose)}'''

def clothes(pose, kind):
  wave=pose=='wave';celebrate=pose=='celebrate';think=pose=='think'
  if wave or celebrate:
    rSleeve='''<path d="M640 579 Q704 531 742 448 L759 416 Q790 431 814 451 Q774 570 731 682 L660 666Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="12"/>
    <path d="M747 443 Q782 434 814 457" stroke="#{ACCENT}" stroke-width="14" fill="none"/>'''
    lSleeve='''<path d="M354 587 Q315 597 289 668 L263 730 Q284 758 323 754 Q361 668 391 648Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="12"/>''' if not celebrate else '''<path d="M378 581 Q324 518 293 429 L269 403 Q239 420 216 447 Q262 582 293 672 L376 652Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="12"/>'''
  elif think:
    rSleeve='''<path d="M643 596 Q686 580 703 544 L638 494 Q606 533 586 533 L637 661Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="12"/>'''
    lSleeve='''<path d="M361 584 Q318 599 287 685 L263 729 Q294 763 334 752 Q361 683 387 644Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="12"/>'''
  else:
    lSleeve='''<path d="M361 584 Q314 602 283 682 L267 737 Q287 761 334 751 Q369 675 393 642Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="12"/>'''
    rSleeve='''<path d="M645 584 Q699 606 739 709 L749 730 Q718 770 686 749 Q650 679 620 639Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="12"/>'''
  common='''<path d="M391 576 Q445 540 506 542 Q581 540 626 572 Q692 620 689 743 L665 849 Q513 879 357 850 L336 741 Q334 625 391 576Z" fill="url(#{GRAD})" stroke="#{EDGE}" stroke-width="13"/>'''
  if kind=='hoodie':
    paths=(common+lSleeve+rSleeve).replace('{GRAD}','hood').replace('{EDGE}','9e2335').replace('{ACCENT}','991c31')
    return paths+'''<path d="M422 564 Q459 610 514 615 Q564 610 607 564 L563 544 Q513 577 468 541Z" fill="#8f192e" stroke="#6e1528" stroke-width="8"/>
<path d="M465 609 L457 671 M553 607 L567 670" fill="none" stroke="#ffe8dc" stroke-width="9" stroke-linecap="round"/>
<circle cx="456" cy="673" r="9" fill="#f3e9dd"/><circle cx="568" cy="670" r="9" fill="#f3e9dd"/>
<path d="M421 756 Q516 745 607 758 L619 809 Q515 835 406 809Z" fill="#b82134" stroke="#881b30" stroke-width="9"/>
<path d="M365 844 Q517 864 666 843" fill="none" stroke="#8b182c" stroke-width="20"/>
<text x="512" y="744" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-weight="900" font-size="103" fill="#fff1e6" stroke="#b92334" stroke-width="2" paint-order="stroke">PL</text>
<g fill="none" stroke="#f98384" opacity=".28" stroke-width="8"><path d="M365 635Q348 685 355 742"/><path d="M427 584Q495 566 560 585"/></g>'''
  paths=(common+lSleeve+rSleeve).replace('{GRAD}','denim').replace('{EDGE}','214d77').replace('{ACCENT}','284c77')
  return paths+'''<path d="M421 572 L506 634 L462 766 L384 592Z" fill="#7fb3d2" stroke="#315979" stroke-width="8"/>
<path d="M600 572 L507 634 L556 764 L648 598Z" fill="#78aacb" stroke="#315979" stroke-width="8"/>
<path d="M483 612 L510 655 L529 612 L518 850 L500 853Z" fill="#f0dcc5" stroke="#34546e" stroke-width="7"/>
<path d="M509 641L511 843" stroke="#d5e9f2" stroke-width="9" stroke-linecap="round"/>
<path d="M400 712L466 719L462 769L404 763Z M557 719L619 712L620 763L560 769Z" fill="#4d88b1" stroke="#b2d0e4" stroke-width="6"/>
<path d="M400 713 L463 718 M558 718 L620 713" stroke="#244763" stroke-width="9"/>
<g fill="#e8cb8d" stroke="#4b6272" stroke-width="2"><circle cx="511" cy="692" r="8"/><circle cx="511" cy="750" r="8"/><circle cx="511" cy="807" r="8"/></g>
<g stroke="#add4ea" opacity=".6" fill="none" stroke-width="5"><path d="M377 643 Q359 698 375 736"/><path d="M644 645Q670 689 667 734"/><path d="M387 826Q506 857 642 826"/></g>
<path d="M372 845Q515 866 661 845" stroke="#163654" stroke-width="17" fill="none"/>'''

def backpack():
  return '''<path d="M330 566 Q246 572 244 688 L244 775 Q246 841 322 837 L367 820 L365 639Z" fill="url(#bag)" stroke="#1e3247" stroke-width="12"/>
<path d="M310 608 Q256 673 274 771" fill="none" stroke="#b6cfdf" stroke-width="12" opacity=".42"/>
<path d="M369 587 Q402 561 432 578 L452 645" fill="none" stroke="#172a43" stroke-width="25" stroke-linecap="round"/>
<path d="M370 587 Q402 564 430 581 L452 645" fill="none" stroke="#8a9fac" stroke-width="12" stroke-linecap="round"/>
<rect x="272" y="702" width="62" height="84" rx="19" fill="#334d68" stroke="#8c9fb0" stroke-width="5"/>
<path d="M295 718 L313 718" stroke="#f4c465" stroke-width="8" stroke-linecap="round"/>'''

def cap():
  return '''<path d="M318 215 Q326 103 460 86 Q624 56 711 188 L711 247 Q614 218 503 214 Q383 209 321 246Z" fill="url(#cap)" stroke="#a52438" stroke-width="11"/>
<path d="M448 92 Q465 69 510 69 Q585 83 623 109 Q607 149 618 219 Q549 207 503 214 Q481 142 448 92Z" fill="#fff5e9" stroke="#b76e6f" stroke-width="8"/>
<path d="M420 230 Q567 215 730 260 Q770 277 733 304 Q619 321 447 276Z" fill="url(#cap)" stroke="#9f1b31" stroke-width="10"/>
<path d="M429 235 Q589 222 717 270" stroke="#ffaaa1" stroke-width="9" opacity=".5" fill="none"/>
<text x="542" y="187" font-family="DejaVu Sans,sans-serif" font-size="75" font-weight="900" text-anchor="middle" fill="#d62a3c">PL</text>'''

def glasses():
  return '''<ellipse cx="427" cy="332" rx="67" ry="59" fill="#c5eaf3" fill-opacity=".14" stroke="#2c292d" stroke-width="15"/>
<ellipse cx="586" cy="332" rx="67" ry="59" fill="#c5eaf3" fill-opacity=".14" stroke="#2c292d" stroke-width="15"/>
<path d="M494 326 Q511 313 519 325" fill="none" stroke="#272528" stroke-width="15"/>
<path d="M358 309 L303 298 M653 308 L720 291" fill="none" stroke="#2c292d" stroke-width="14" stroke-linecap="round"/>
<path d="M389 296Q416 281 449 290 M550 296Q575 282 607 295" fill="none" stroke="#ffffff" stroke-opacity=".4" stroke-width="7"/>'''

def blink():
  return '''<path d="M379 320 Q420 365 477 320 M532 320 Q585 365 640 319" stroke="#744025" fill="none" stroke-width="18" stroke-linecap="round"/>'''

poses=['idle','wave','think','happy','celebrate']
for p in poses:
    entries={
      'body':body(p),
      'top-hoodie-red':clothes(p,'hoodie'),
      'top-jacket-denim':clothes(p,'denim'),
      'backpack':backpack(),
      'cap-red':cap(),
      'glasses-round':glasses(),
      'blink':blink(),
    }
    folder=ROOT/p;folder.mkdir(exist_ok=True)
    for name,draw in entries.items():
        svgfile=folder/(name+'.svg')
        svgfile.write_text(svg(draw),encoding='utf8')
        raw=cairosvg.svg2png(bytestring=svg(draw).encode('utf8'),output_width=S,output_height=S)
        im=Image.open(io.BytesIO(raw)).convert('RGBA')
        im.save(folder/(name+'.webp'),format='WEBP',quality=91,method=0)
        im.resize((512,512),resample=Image.Resampling.LANCZOS).save(folder/(name+'@512.webp'),format='WEBP',quality=89,method=0)
        im.resize((256,256),resample=Image.Resampling.LANCZOS).save(folder/(name+'@256.webp'),format='WEBP',quality=89,method=0)
    print(p)
# composition preview
canvas=Image.new('RGB',(1800,1220),'#f6f3ee'); draw=ImageDraw.Draw(canvas)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f1=ImageFont.truetype(font,30);f2=ImageFont.truetype(font,20)
draw.text((38,28),'BOBEK V2 — оригинальные независимые слои · черновой арт-риг',font=f1,fill='#263451')
for row,style in enumerate(['top-hoodie-red','top-jacket-denim']):
    draw.text((25,100+row*530),style,font=f2,fill='#35465e')
    for col,p in enumerate(poses):
        unit=Image.new('RGBA',(1024,1024),(0,0,0,0))
        for name in ['body','backpack',style,'cap-red']:
            lay=Image.open(ROOT/p/(name+'.webp')).convert('RGBA')
            unit=Image.alpha_composite(unit,lay)
        unit.thumbnail((330,430))
        x=20+col*356;y=138+row*530
        canvas.paste(unit,(x+(320-unit.width)//2,y),unit)
        draw.text((x+120,y+435),p.upper(),font=f2,fill='#34465f')
canvas.save(str(ROOT / 'preview.png'))
(ROOT/'META.json').write_text(json.dumps({'canvas':1024,'poses':poses,'source':'authored SVG paint, original custom artwork','status':'draft','garments':['hoodie-red','jacket-denim','backpack-travel','cap-red','glasses-round']},indent=2))