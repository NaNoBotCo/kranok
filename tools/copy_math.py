# copy_math.py — copy for the drawn sections (curl, bend, nest, scroll, borders, draw), EN + TH.
M = lambda s: f'<span class="math">{s}</span>'

EN = {
    "curl_kick": "ตัวเหงา · the curl",
    "curl_h": "A spiral that keeps its shape",
    "curl_p": [
        "At the foot of a kranok the line winds into a curl. A logarithmic spiral fits it: a spiral that grows by the same factor every turn, so a small curl and a large one have the same shape, and the line crosses every ray from the centre at the same angle.",
        "The other common spiral, the Archimedean, adds the same gap every turn, like a rolled mat. Switch between them and watch the gaps between the turns.",
    ],
    "curl_note": f"The logarithmic spiral is {M('r = e<sup>bθ</sup>')}: r is the distance from the centre, θ the angle turned, b the growth. Each turn multiplies r by {M('e<sup>2πb</sup>')}. Teachers say to coil the head like a snail shell. No published measurement says which spiral a drawn curl follows; the logarithmic spiral is this page's model.",
    "bend_kick": "One graph",
    "bend_h": "One graph draws the whole flame",
    "bend_p": [
        "A curve can be described by one thing: how sharply it bends at each point along its length. The graph is the bending of the gold flame beside it, from the eye of the curl to the tip. Change the graph and the flame follows.",
        f"Near the eye the bending is very large and falls off as one over the distance, {M('κ = a / s')}: that part is the logarithmic spiral. In the middle the bending is nearly flat, and the body of the flame runs almost straight. Near the tip it dips below zero, the line bends the other way, and the tip flicks.",
        "Mathematicians call this the natural equation of a curve: bending as a function of length, with nothing about where the curve sits on the page. Add up the bending and you get the direction; add up the direction and you get the line. The notches (bak) on the back are laid on top: a sawtooth that rises slowly and drops sharply, each point pushed forward toward the tip.",
    ],
    "nest_kick": "Flames on flames",
    "nest_h": "Kranok inside kranok",
    "nest_p": [
        "Each notch on a kranok's back ends in a small flame. Let every one grow a whole kranok of its own, and every notch on those, and so on. Architects speak of nested kranok, and a 2014 Burapha University report set out to model the kranok's fractal form; this recursion is the page's own.",
        f"With three notches and each child r times the size of its parent, level n has {M('3<sup>n</sup>')} flames, each with {M('r<sup>2n</sup>')} of the first flame's area. The gold adds up to a geometric series, {M('1 + 3r² + (3r²)² + …')}, which settles at {M('1 / (1 − 3r²)')} times the first flame while {M('3r² &lt; 1')}. Past r ≈ 0.58 it grows without end.",
    ],
    "nest_note": "The counts are exact. Overlaps are counted twice, so the gold figure is an upper bound.",
    "scroll_kick": "ลายก้านขด · lai kan khot",
    "scroll_h": "The scroll stem",
    "scroll_p": [
        "The Royal Institute dictionary calls lai kan khot a pattern drawn coiling this way and that. A stem waves along the band; from each slope a branch peels off and bends harder and harder until it winds into a curl in the next hollow. Flames grow on the outside of each curl.",
        f"The branch is the flame's curl run from the other end: the same bending, {M('κ = a / (L − s)')}, counted back from the end of the branch, so it tightens as it goes. Turn on Lines only to see the bones.",
    ],
    "scroll_note": "The wave is a cosine; the branches start at its steepest points and turn left after a crest, right after a trough.",
    "bord_kick": "ลายหน้ากระดาน · lai na kradan",
    "bord_h": "Seven ways to repeat along a band",
    "bord_p": [
        "Lai na kradan is the running band on the flat face between lotus mouldings, a motif repeated along a strip. However it is drawn, a band that repeats uses one of exactly seven combinations of slides, flips and half-turns. Mathematicians call them the seven frieze groups; the names on the buttons are John Conway's nicknames.", "A 2023 survey of seven Khmer-style stone temples in southern Isan found four of the seven there: p2mm, p1, p1m1 and p11m. No one has yet published a count for central Thai bands.",
    ],
    "rose_h": "Around a point",
    "rose_p": [
        f"Turn the flame around a centre n times and you get rotation symmetry, {M('C<sub>n</sub>')}. Add mirrors and you get {M('D<sub>n</sub>')}, with twice as many moves that leave the picture unchanged. Any rosette has one of these two kinds, for some n.",
    ],
    "rose_note": "Prachamyam, the four-petal flower set between other patterns, is symmetric about both axes: D4.",
    "own_kick": "Draw",
    "own_h": "Draw one",
    "own_p": ["Draw a line with your finger or mouse. When you lift, the line winds into a curl at its end, with the same bending as the scroll, and grows flames on alternate sides. Draw as many as you like and save the picture."],
}

TH = {
    "curl_kick": "ตัวเหงา",
    "curl_h": "เกลียวที่รูปร่างไม่เปลี่ยน",
    "curl_p": [
        "ที่โคนของกนก เส้นจะม้วนเข้าเป็นขด เกลียวลอการิทึมเข้ากับขดนี้ได้ดี เกลียวแบบนี้ขยายด้วยอัตราเท่าเดิมทุกรอบ ขดเล็กกับขดใหญ่จึงมีรูปร่างเหมือนกัน และเส้นจะตัดเส้นรัศมีจากจุดศูนย์กลางด้วยมุมเท่ากันทุกเส้น",
        "เกลียวอีกแบบที่พบบ่อยคือเกลียวอาร์คิมิดีส ซึ่งเพิ่มระยะห่างเท่าเดิมทุกรอบ เหมือนเสื่อที่ม้วนไว้ ลองสลับดูแล้วสังเกตช่องว่างระหว่างรอบ",
    ],
    "curl_note": f"เกลียวลอการิทึมเขียนได้ว่า {M('r = e<sup>bθ</sup>')} r คือระยะจากจุดศูนย์กลาง θ คือมุมที่หมุนไป b คืออัตราขยาย ทุกหนึ่งรอบ r จะคูณด้วย {M('e<sup>2πb</sup>')} ครูสอนให้ขดหัวเหมือนก้นหอย ยังไม่มีงานตีพิมพ์ที่วัดว่าขดที่วาดด้วยมือเป็นเกลียวแบบไหน เกลียวลอการิทึมเป็นแบบจำลองของหน้านี้",
    "bend_kick": "กราฟเดียว",
    "bend_h": "กราฟเดียววาดได้ทั้งเปลว",
    "bend_p": [
        "เส้นโค้งเส้นหนึ่งบอกได้ด้วยสิ่งเดียว คือมันโค้งมากแค่ไหนที่แต่ละจุดตามความยาว กราฟคือความโค้งของเปลวทองที่อยู่ข้างกัน ตั้งแต่ตาขดจนถึงปลาย เปลี่ยนกราฟ เปลวก็เปลี่ยนตาม",
        f"ใกล้ตาขด ความโค้งสูงมากแล้วลดลงเป็นหนึ่งส่วนระยะทาง {M('κ = a / s')} ส่วนนี้คือเกลียวลอการิทึม ช่วงกลางความโค้งเกือบเป็นศูนย์ ตัวเปลวจึงเกือบตรง ใกล้ปลายความโค้งติดลบ เส้นโค้งกลับอีกทาง ปลายจึงสะบัด",
        "นักคณิตศาสตร์เรียกสิ่งนี้ว่าสมการธรรมชาติของเส้นโค้ง คือความโค้งตามความยาว โดยไม่สนว่าเส้นอยู่ตรงไหนบนกระดาษ รวมความโค้งได้ทิศทาง รวมทิศทางได้เส้น บากบนหลังกระหนกวางซ้อนลงไปอีกชั้น เป็นฟันเลื่อยที่ค่อย ๆ ขึ้นแล้วตกฉับ ปลายแต่ละบากถูกดันไปทางยอด",
    ],
    "nest_kick": "เปลวบนเปลว",
    "nest_h": "กนกในกนก",
    "nest_p": [
        "บากแต่ละบากบนหลังกระหนกจบด้วยเปลวเล็ก ๆ ลองให้ทุกบากงอกเป็นกระหนกทั้งตัว แล้วให้ทุกบากของตัวใหม่งอกต่อไปอีก ช่างสถาปัตย์พูดถึงตัวกระหนกที่ซ้อนกัน และรายงานวิจัยของมหาวิทยาลัยบูรพาปี 2557 ตั้งใจจำลองรูปแบบแฟร็กทัลของกระหนก การซ้อนแบบนี้เป็นของหน้านี้เอง",
        f"ถ้ามีสามบาก และตัวลูกมีขนาด r เท่าของตัวแม่ ชั้นที่ n จะมี {M('3<sup>n</sup>')} เปลว แต่ละเปลวมีพื้นที่ {M('r<sup>2n</sup>')} ของเปลวแรก ทองทั้งหมดรวมเป็นอนุกรมเรขาคณิต {M('1 + 3r² + (3r²)² + …')} ซึ่งเข้าใกล้ {M('1 / (1 − 3r²)')} เท่าของเปลวแรก ตราบที่ {M('3r² &lt; 1')} ถ้า r เกินราว 0.58 ทองจะเพิ่มไม่สิ้นสุด",
    ],
    "nest_note": "จำนวนเปลวนับได้ตรง ส่วนที่ซ้อนทับนับซ้ำ ตัวเลขทองจึงเป็นค่าสูงสุด",
    "scroll_kick": "ลายก้านขด",
    "scroll_h": "ลายก้านขด",
    "scroll_p": [
        "พจนานุกรมฉบับราชบัณฑิตยสถานให้ความหมายว่า ลายที่เขียนเป็นลายขดไปขดมา ก้านเลื้อยเป็นคลื่นไปตามแถบ จากแต่ละไหล่คลื่นมีก้านแยกออก โค้งแรงขึ้นเรื่อย ๆ จนม้วนเป็นขดในแอ่งถัดไป เปลวกนกงอกอยู่ด้านนอกของแต่ละขด",
        f"ก้านแยกคือขดของเปลวที่เดินจากอีกด้าน ความโค้งเท่าเดิม {M('κ = a / (L − s)')} แต่นับถอยจากปลายก้าน มันจึงม้วนแน่นขึ้นเรื่อย ๆ กดเฉพาะเส้นเพื่อดูโครง",
    ],
    "scroll_note": "คลื่นคือโคไซน์ ก้านแยกเริ่มที่จุดชันที่สุด เลี้ยวซ้ายหลังยอดคลื่น เลี้ยวขวาหลังท้องคลื่น",
    "bord_kick": "ลายหน้ากระดาน",
    "bord_h": "เจ็ดวิธีซ้ำลายตามแถบ",
    "bord_p": [
        "ลายหน้ากระดานคือลายแถบยาวบนพื้นตั้งระหว่างบัว ซ้ำลายเดียวไปตามแถบ ไม่ว่าจะวาดอย่างไร แถบที่ซ้ำลายต้องใช้หนึ่งในเจ็ดแบบของการเลื่อน การพลิก และการหมุนครึ่งรอบ นักคณิตศาสตร์เรียกว่ากรุปลายแถบ (frieze group) เจ็ดกรุป", "การสำรวจปราสาทหินแบบเขมรเจ็ดแห่งในอีสานใต้เมื่อปี 2566 พบสี่ในเจ็ดแบบ คือ p2mm p1 p1m1 และ p11m ยังไม่มีงานตีพิมพ์ที่นับลายหน้ากระดานภาคกลาง",
    ],
    "rose_h": "รอบจุดเดียว",
    "rose_p": [
        f"หมุนเปลวรอบจุดศูนย์กลาง n ครั้ง ได้สมมาตรการหมุน {M('C<sub>n</sub>')} เพิ่มกระจกเข้าไป ได้ {M('D<sub>n</sub>')} ซึ่งมีวิธีขยับที่ภาพไม่เปลี่ยนมากขึ้นสองเท่า ลายดอกรอบจุดทุกลายมีสมมาตรแบบใดแบบหนึ่งในสองแบบนี้ สำหรับ n สักค่า",
    ],
    "rose_note": "ประจำยาม ดอกสี่กลีบที่วางคั่นลายอื่น สมมาตรทั้งแกนตั้งและแกนนอน คือ D4",
    "own_kick": "วาด",
    "own_h": "วาดเอง",
    "own_p": ["ลากเส้นด้วยนิ้วหรือเมาส์ ยกนิ้วเมื่อไร ปลายเส้นจะม้วนเป็นขดด้วยความโค้งแบบเดียวกับก้านขด แล้วงอกเปลวกนกสลับซ้ายขวา วาดกี่เส้นก็ได้ แล้วบันทึกภาพ"],
}
