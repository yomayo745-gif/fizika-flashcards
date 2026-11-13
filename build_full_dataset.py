# -*- coding: utf-8 -*-
"""
Full Dataset Generator for FIZIKA FLASHCARDS
Extracts and structures all knowledge from:
'FIZIKA — TO‘LIQ YODLASH QO‘LLANMASI' (270 pages)
"""
import pypdf
import json
import re
import os

pdf_path = r'C:/Users/user/.gemini/antigravity/brain/fb635199-27c9-4a3c-99e6-7e29880ac86f/.user_uploaded/media_1794553750496_cad7f8b3.pdf'
reader = pypdf.PdfReader(pdf_path)

cards = []
card_id = 1

def add_card(section, section_title, topic, category, level, question, answer, formula=None, symbol_explanation=None, si_unit=None, source_page=1, difficulty=2):
    global card_id
    card = {
        "id": f"card_{card_id:04d}",
        "section": section,
        "sectionTitle": section_title,
        "topic": topic,
        "category": category, # 'definition', 'formula', 'law', 'unit', 'difference', 'mistake', 'fact', 'question', 'constant'
        "level": level,       # 'A', 'B', 'C'
        "question": question.strip(),
        "answer": answer.strip(),
        "formula": formula.strip() if formula else None,
        "symbol_explanation": symbol_explanation.strip() if symbol_explanation else None,
        "si_unit": si_unit.strip() if si_unit else None,
        "source_page": source_page,
        "difficulty": difficulty
    }
    cards.append(card)
    card_id += 1
    return card

# Helper mapping for section chapters
def get_sec_info_by_page(p):
    if p <= 19:
        return 1, "Fizikaga kirish"
    elif p <= 75:
        return 2, "Mexanika"
    elif p <= 102:
        return 3, "Molekulyar fizika va termodinamika"
    elif p <= 134:
        return 4, "Elektr va magnetizm"
    elif p <= 152:
        return 5, "Tebranishlar va to‘lqinlar"
    elif p <= 168:
        return 6, "Optika"
    elif p <= 183:
        return 7, "Atom va yadro fizikasi"
    elif p <= 198:
        return 8, "Astronomiya va zamonaviy fizika"
    elif p <= 231:
        return 9, "Formulalar"
    elif p <= 235:
        return 10, "SI birliklari va prefikslar"
    elif p <= 260:
        return 11, "Fizik qonunlar"
    else:
        return 12, "Yakuniy nazorat va takrorlash savollari"

# 1. EXTRACT ALL 256 DEFINITIONS FROM CHAPTER XII.1 (pages 237-244)
print("1. Extracting definitions from pages 237-244...")
sec_titles = {
    'I. Fizikaga kirish': (1, 'Fizikaga kirish', 8),
    'II. Mexanika': (2, 'Mexanika', 20),
    'III. Molekulyar fizika va termodinamika': (3, 'Molekulyar fizika va termodinamika', 76),
    'IV. Elektr va magnetizm': (4, 'Elektr va magnetizm', 103),
    'V. Tebranishlar va to‘lqinlar': (5, 'Tebranishlar va to‘lqinlar', 135),
    'VI. Optika': (6, 'Optika', 153),
    'VII. Atom va yadro fizikasi': (7, 'Atom va yadro fizikasi', 169),
    'VIII. Astronomiya va zamonaviy fizika asoslari': (8, 'Astronomiya va zamonaviy fizika', 184)
}

current_sec = 'I. Fizikaga kirish'
current_def = None

for page_idx in range(236, 244):
    text = reader.pages[page_idx].extract_text()
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line or 'XII BO‘LIM' in line or 'XII. Yakuniy nazorat' in line or 'Barcha ta’riflarning umumiy' in line or 'FIZIKA — TO‘LIQ YODLASH' in line or line.isdigit():
            continue
        for k in sec_titles.keys():
            if line == k or line.startswith(k):
                current_sec = k
                break
        m = re.match(r'^([ABC])\s+([A-Za-z0-9\(\)\‘\’\'\-\–\s\/\,\.\:\;\+]+?)\.\s*(.*)', line)
        if m:
            if current_def:
                s_num, s_title, s_base = sec_titles.get(current_sec, (1, 'Fizikaga kirish', 8))
                add_card(
                    section=s_num,
                    section_title=s_title,
                    topic=current_def['term'],
                    category='definition',
                    level=current_def['level'],
                    question=f"«{current_def['term']}» tushunchasining ta’rifi qanday?",
                    answer=current_def['content'],
                    source_page=s_base,
                    difficulty=1 if current_def['level'] == 'A' else (2 if current_def['level'] == 'B' else 3)
                )
            lvl, term, rest = m.groups()
            current_def = {'level': lvl, 'term': term.strip(), 'content': rest.strip()}
        else:
            if current_def:
                current_def['content'] += ' ' + line

if current_def:
    s_num, s_title, s_base = sec_titles.get(current_sec, (8, 'Astronomiya va zamonaviy fizika', 184))
    add_card(
        section=s_num,
        section_title=s_title,
        topic=current_def['term'],
        category='definition',
        level=current_def['level'],
        question=f"«{current_def['term']}» tushunchasining ta’rifi qanday?",
        answer=current_def['content'],
        source_page=s_base,
        difficulty=1 if current_def['level'] == 'A' else (2 if current_def['level'] == 'B' else 3)
    )

print(f"Total definitions added: {len(cards)}")

# 2. EXTRACT FORMULAS FROM PAGES 8 TO 198
print("2. Extracting formulas from pages 8-198...")
formula_count = 0

# Clean formula LaTeX map for key physics formulas
latex_lookup = {
    "Shkala bo‘linmasi qiymati": "C = \\frac{x_2 - x_1}{n}",
    "O‘rtacha qiymat": "\\bar{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n}",
    "Absolyut xato": "\\Delta x_i = |x_i - \\bar{x}|",
    "Nisbiy xato": "\\varepsilon = \\frac{\\Delta x}{\\bar{x}} \\times 100\\%",
    "O‘lchash natijasini yozish": "x = \\bar{x} \\pm \\Delta x",
    "Vektor moduli (tekislikda)": "a = \\sqrt{a_x^2 + a_y^2}",
    "Vektor proyeksiyalari": "a_x = a\\cos\\alpha, \\quad a_y = a\\sin\\alpha",
    "Yig‘indi vektor moduli (kosinuslar teoremasi)": "c = \\sqrt{a^2 + b^2 + 2ab\\cos\\alpha}",
    "Skalyar ko‘paytma": "\\vec{a} \\cdot \\vec{b} = ab\\cos\\alpha = a_x b_x + a_y b_y",
    "Vektor ko‘paytma moduli": "|\\vec{a} \\times \\vec{b}| = ab\\sin\\alpha",
    "Tezliklarni qo‘shish (Galiley)": "\\vec{v} = \\vec{v}_1 + \\vec{v}_2",
    "Yo‘lning qo‘shiluvchanligi": "s = s_1 + s_2 + \\dots + s_n",
    "Ko‘chish (bir o‘lchovli)": "\\Delta x = x - x_0",
    "Ko‘chish moduli (tekislikda)": "\\Delta r = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}",
    "Tekis harakat tezligi": "v = \\frac{s}{t}",
    "Tekis harakat yo‘li va vaqti": "s = vt, \\quad t = \\frac{s}{v}",
    "Tezlik vektor ko‘rinishida": "\\vec{v} = \\frac{\\Delta\\vec{r}}{\\Delta t}",
    "Lahzaviy tezlik": "\\vec{v} = \\lim_{\\Delta t \\to 0} \\frac{\\Delta\\vec{r}}{\\Delta t} = \\frac{d\\vec{r}}{dt}",
    "O‘rtacha tezlik": "v_{ort} = \\frac{s_1 + s_2 + \\dots + s_n}{t_1 + t_2 + \\dots + t_n}",
    "Yo‘lning yarmi v1, yarmi v2 bilan": "v_{ort} = \\frac{2v_1 v_2}{v_1 + v_2}",
    "Vaqtning yarmi v1, yarmi v2 bilan": "v_{ort} = \\frac{v_1 + v_2}{2}",
    "Tekis o‘zgaruvchan harakatda o‘rtacha tezlik": "v_{ort} = \\frac{v_0 + v}{2}",
    "Tezlanish": "\\vec{a} = \\frac{\\vec{v} - \\vec{v}_0}{t} = \\frac{\\Delta\\vec{v}}{\\Delta t}",
    "Tezlanish proyeksiyasi": "a_x = \\frac{v_x - v_{0x}}{t}",
    "Lahzaviy tezlanish": "\\vec{a} = \\frac{d\\vec{v}}{dt}",
    "Tekis harakat koordinatasi": "x = x_0 + v_x t",
    "Uchrashish (qarama-qarshi)": "t_u = \\frac{L}{v_1 + v_2}",
    "Quvib yetish (bir tomonga)": "t_q = \\frac{L}{v_1 - v_2}",
    "Tezlik": "v = v_0 + at",
    "Yo‘l (ko‘chish)": "s = v_0 t + \\frac{at^2}{2}",
    "Vaqtsiz yo‘l formulasi": "s = \\frac{v^2 - v_0^2}{2a}",
    "Yo‘l o‘rtacha tezlik orqali": "s = \\frac{v_0 + v}{2} t",
    "Koordinata qonuni": "x = x_0 + v_{0x} t + \\frac{a_x t^2}{2}",
    "Tezlik proyeksiyasi": "v_x = v_{0x} + a_x t",
    "n-chi sekundda bosilgan yo‘l": "s_n = v_0 + \\frac{a}{2}(2n - 1)",
    "Tinch holatdan boshlab, yo‘llar nisbati": "s_1 : s_2 : s_3 : \\dots = 1 : 3 : 5 : \\dots",
    "To‘xtagunicha tormozlanish yo‘li": "s = \\frac{v_0^2}{2|a|}, \\quad t = \\frac{v_0}{|a|}",
    "Tushish tezligi (v₀ = 0)": "v = gt",
    "Tushish balandligi": "h = \\frac{gt^2}{2}",
    "Yerga urilish tezligi": "v = \\sqrt{2gh}",
    "Tushish vaqti": "t = \\sqrt{\\frac{2h}{g}}",
    "Yuqoriga otish: tezlik va balandlik": "v = v_0 - gt, \\quad h = v_0 t - \\frac{gt^2}{2}",
    "Maksimal ko‘tarilish balandligi": "H = \\frac{v_0^2}{2g}",
    "Ko‘tarilish va umumiy uchish vaqti": "t_k = \\frac{v_0}{g}, \\quad T = \\frac{2v_0}{g}",
    "Gorizontal otish: koordinatalar": "x = v_0 t, \\quad y = \\frac{gt^2}{2}",
    "Gorizontal otish: uchish vaqti va uzoqligi": "t = \\sqrt{\\frac{2h}{g}}, \\quad L = v_0\\sqrt{\\frac{2h}{g}}",
    "Burchak ostida: tezlik proyeksiyalari": "v_x = v_0\\cos\\alpha, \\quad v_y = v_0\\sin\\alpha - gt",
    "Burchak ostida: koordinatalar": "x = v_0\\cos\\alpha \\cdot t, \\quad y = v_0\\sin\\alpha \\cdot t - \\frac{gt^2}{2}",
    "Eng katta balandlik": "H = \\frac{v_0^2\\sin^2\\alpha}{2g}",
    "Uchish vaqti": "T = \\frac{2v_0\\sin\\alpha}{g}",
    "Uchish uzoqligi": "L = \\frac{v_0^2\\sin(2\\alpha)}{g}",
    "Davr": "T = \\frac{t}{N}",
    "Chastota": "\\nu = \\frac{N}{t} = \\frac{1}{T}",
    "Burchak tezlik": "\\omega = \\frac{\\Delta\\varphi}{\\Delta t} = \\frac{2\\pi}{T} = 2\\pi\\nu",
    "Chiziqli tezlik": "v = \\frac{2\\pi R}{T} = \\omega R = 2\\pi\\nu R",
    "Markazga intilma tezlanish": "a_m = \\frac{v^2}{R} = \\omega^2 R = \\frac{4\\pi^2 R}{T^2} = \\omega v",
    "Zichlik": "\\rho = \\frac{m}{V}",
    "Massa va hajm": "m = \\rho V, \\quad V = \\frac{m}{\\rho}",
    "Aralashma zichligi": "\\rho = \\frac{m_1 + m_2}{V_1 + V_2}",
    "Solishtirma og‘irlik": "\\gamma = \\rho g",
    "Teng ta’sir etuvchi (bir to‘g‘ri chiziqda)": "F = F_1 + F_2, \\quad F = |F_1 - F_2|",
    "Perpendikulyar kuchlar": "F = \\sqrt{F_1^2 + F_2^2}",
    "Nyuton 2-qonuni": "\\vec{F} = m\\vec{a}, \\quad a = \\frac{F}{m}",
    "Nyuton 2-qonuni impuls orqali": "\\vec{F} = \\frac{\\Delta\\vec{p}}{\\Delta t}",
    "Nyuton 3-qonuni": "\\vec{F}_{12} = -\\vec{F}_{21}",
    "Nyuton 2-qonuni (tizim uchun)": "a = \\frac{F_1 - F_2}{m_1 + m_2}",
    "Og‘irlik kuchi": "F = mg",
    "Tinch holatdagi jism og‘irligi": "P = N = mg",
    "Tezlanish bilan yuqoriga (lift)": "P = m(g + a)",
    "Tezlanish bilan pastga (lift)": "P = m(g - a)",
    "Qavariq ko‘prik tepasida": "P = m\\left(g - \\frac{v^2}{R}\\right)",
    "Botiq yo‘lning pastki nuqtasida": "P = m\\left(g + \\frac{v^2}{R}\\right)",
    "Sirpanish ishqalanish kuchi": "F_{ish} = \\mu N",
    "Gorizontal sirtda": "F_{ish} = \\mu mg",
    "Qiya tekislikda": "F_{ish} = \\mu mg\\cos\\alpha",
    "Tinchlik ishqalanishining chegarasi": "0 \\le F_{tinch} \\le \\mu_0 N",
    "Siljish burchagi": "\\tan\\alpha_0 = \\mu",
    "Guk qonuni": "F_{el} = k|\\Delta l| = k|x|",
    "Guk qonuni (proyeksiya)": "F_x = -kx",
    "Prujinalar ketma-ket": "\\frac{1}{k} = \\frac{1}{k_1} + \\frac{1}{k_2}",
    "Prujinalar parallel": "k = k_1 + k_2",
    "Mexanik kuchlanish va nisbiy cho‘zilish": "\\sigma = \\frac{F}{S}, \\quad \\varepsilon = \\frac{\\Delta l}{l_0}",
    "Guk qonuni (Yung moduli)": "\\sigma = E\\varepsilon, \\quad k = \\frac{ES}{l_0}",
    "Elastik deformatsiya potensial energiyasi": "E_p = \\frac{kx^2}{2}",
    "Butun olam tortishish qonuni": "F = G\\frac{m_1 m_2}{r^2}",
    "Erkin tushish tezlanishi (sirt yaqinida)": "g = \\frac{GM}{R^2}",
    "Balandlikdagi tezlanish": "g_h = \\frac{GM}{(R+h)^2} = g\\left(\\frac{R}{R+h}\\right)^2",
    "Birinchi kosmik tezlik": "v_1 = \\sqrt{gR} = \\sqrt{\\frac{GM}{R}}",
    "Orbital tezlik (balandlikda)": "v = \\sqrt{\\frac{GM}{R+h}}",
    "Ikkinchi kosmik tezlik": "v_2 = \\sqrt{2gR} = \\sqrt{2}v_1",
    "Doiraviy orbitada aylanish davri": "T = 2\\pi\\sqrt{\\frac{r^3}{GM}}",
    "Kepler uchinchi qonuni": "\\frac{T_1^2}{T_2^2} = \\frac{a_1^3}{a_2^3}",
    "Qiya tekislikdagi jism tezlanishi (ishqalanishsiz)": "a = g\\sin\\alpha",
    "Ishqalanishli qiya tekislik (pastga)": "a = g(\\sin\\alpha - \\mu\\cos\\alpha)",
    "Normal reaksiya (qiya tekislik)": "N = mg\\cos\\alpha",
    "Atvud mashinasi: tezlanish": "a = g\\frac{m_2 - m_1}{m_1 + m_2}",
    "Atvud mashinasi: taranglik": "T = \\frac{2m_1 m_2}{m_1 + m_2}g",
    "Stol ustidagi va osilgan yuk (ishqalanishsiz)": "a = \\frac{m_2 g}{m_1 + m_2}",
    "Markazga intilma kuch": "F_m = ma_m = \\frac{mv^2}{R} = m\\omega^2 R",
    "Burilishda maksimal tezlik": "v_{max} = \\sqrt{\\mu g R}",
    "Yuqori nuqtada (vertikal aylana)": "v_{min} = \\sqrt{gR}",
    "Jism impulsi": "\\vec{p} = m\\vec{v}",
    "Impuls teoremasi": "\\vec{F}\\Delta t = \\Delta\\vec{p} = m\\vec{v} - m\\vec{v}_0",
    "Impulsning saqlanishi (ikki jism)": "m_1\\vec{v}_1 + m_2\\vec{v}_2 = m_1\\vec{v}_1' + m_2\\vec{v}_2'",
    "Absolyut noelastik to‘qnashuv": "v = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}",
    "Elastik to‘qnashuv (v₂ = 0)": "v_1' = \\frac{m_1 - m_2}{m_1 + m_2}v_1, \\quad v_2' = \\frac{2m_1}{m_1 + m_2}v_1",
    "Reaktiv harakat (tinch holatdan)": "m\\vec{v} + M\\vec{V} = 0 \\implies V = \\frac{mv}{M}",
    "Tsiolkovskiy formulasi": "\\Delta v = u\\ln\\frac{m_0}{m}",
    "Mexanik ish": "A = Fs\\cos\\alpha",
    "Bir yo‘nalishdagi kuch ishi": "A = Fs",
    "Og‘irlik kuchi ishi": "A = mg(h_1 - h_2) = -\\Delta E_p",
    "Ishqalanish kuchi ishi": "A_{ish} = -F_{ish}s = -\\mu mgs",
    "Elastiklik kuchi ishi": "A = \\frac{kx_1^2}{2} - \\frac{kx_2^2}{2}",
    "Ish grafik bo‘yicha": "A = \\int F\\,dx",
    "Quvvat": "P = \\frac{A}{t}",
    "Quvvat tezlik orqali": "P = Fv\\cos\\alpha",
    "Foydali ish koeffitsienti": "\\eta = \\frac{A_f}{A_t} \\times 100\\% = \\frac{P_f}{P_t} \\times 100\\%",
    "Foydali ish": "A_f = \\eta A_t",
    "Elektr energiyasi hisobi": "E = Pt",
    "Kinetik energiya": "E_k = \\frac{mv^2}{2}",
    "Kinetik energiya impuls orqali": "E_k = \\frac{p^2}{2m}",
    "Potensial energiya (og‘irlik maydoni)": "E_p = mgh",
    "Elastik potensial energiya": "E_p = \\frac{kx^2}{2}",
    "Kinetik energiya teoremasi": "A = E_{k2} - E_{k1} = \\frac{mv^2}{2} - \\frac{mv_0^2}{2}",
    "Potensial energiya o‘zgarishi va ish": "A = -(E_{p2} - E_{p1}) = -\\Delta E_p",
    "Gravitatsion potensial energiya (umumiy)": "E_p = -G\\frac{Mm}{r}",
    "Mexanik energiya saqlanishi": "E_{k1} + E_{p1} = E_{k2} + E_{p2}",
    "Erkin tushayotgan jism tezligi": "\\frac{mv_0^2}{2} + mgh_0 = \\frac{mv^2}{2} + mgh",
    "Ishqalanish bo‘lganda energiya balansi": "E_1 = E_2 + Q, \\quad Q = |A_{ish}|",
    "Energiya o‘zgarishi va nokonservativ ish": "E_2 - E_1 = A_{nok}",
    "Prujinali mayatnik energiyasi": "\\frac{kA^2}{2} = \\frac{mv_{max}^2}{2} + \\frac{kx^2}{2}",
    "Kuch momenti": "M = Fd",
    "Richag muvozanati (momentlar qoidasi)": "F_1 d_1 = F_2 d_2 \\iff \\frac{F_1}{F_2} = \\frac{d_2}{d_1}",
    "Muvozanat shartlari": "\\sum\\vec{F} = 0, \\quad \\sum M = 0",
    "Qiya tekislik (ishqalanishsiz)": "F = P\\frac{h}{l} = P\\sin\\alpha",
    "Harakatlanuvchi blok": "F = \\frac{P}{2}",
    "Oltin qoida (ishda yutuq yo‘q)": "A_1 = A_2 \\implies F_1 s_1 = F_2 s_2",
    "Og‘irlik markazi koordinatasi": "x_c = \\frac{m_1 x_1 + m_2 x_2 + \\dots + m_n x_n}{m_1 + m_2 + \\dots + m_n}",
    "Bosim": "p = \\frac{F}{S}",
    "Bosim kuchi": "F = pS",
    "Jismning gorizontal sirtga bosimi": "p = \\frac{mg}{S}",
    "Gidrostatik bosim": "p = \\rho gh",
    "Suyuqlikdagi to‘liq bosim": "p = p_0 + \\rho gh",
    "Idish tubiga ta’sir kuchi": "F = \\rho ghS",
    "Aloqador idishlarda turli suyuqliklar": "\\rho_1 h_1 = \\rho_2 h_2",
    "Simob ustuni bosimi": "p = \\rho_{Hg} g h",
    "Uzluksizlik tenglamasi": "S_1 v_1 = S_2 v_2 = Q",
    "Bernulli tenglamasi": "p + \\frac{\\rho v^2}{2} + \\rho gh = \\text{const}",
    "Torichelli formulasi": "v = \\sqrt{2gh}",
    "Stoks qonuni (qarshilik kuchi)": "F = 6\\pi\\eta r v",
    "Paskal qonuni (gidravlik press)": "\\frac{F_1}{S_1} = \\frac{F_2}{S_2}",
    "Kuchda yutuq": "\\frac{F_2}{F_1} = \\frac{S_2}{S_1}",
    "Porshenlar yo‘llari": "\\frac{h_1}{h_2} = \\frac{S_2}{S_1}",
    "Arximed kuchi": "F_A = \\rho_s g V_{bot}",
    "Suyuqlikdagi jism og‘irligi": "P' = P - F_A = mg - \\rho_s g V",
    "Suzish sharti (to‘liq botgan)": "\\rho_j < \\rho_s \\text{ (suzadi)}, \\quad \\rho_j = \\rho_s \\text{ (muallaq)}, \\quad \\rho_j > \\rho_s \\text{ (cho'kadi)}",
    "Suzayotgan jismning botgan ulushi": "\\frac{V_{bot}}{V} = \\frac{\\rho_j}{\\rho_s}",
    "Suzish sharti (kuchlar)": "F_A = mg \\text{ (suzishda)}",
    "Aerostatning ko‘tarish kuchi": "F = (\\rho_h - \\rho_g) g V",
    "Modda miqdori": "\\nu = \\frac{m}{M} = \\frac{N}{N_A}",
    "Zarralar soni": "N = \\nu N_A = \\frac{m}{M} N_A",
    "Bitta molekula massasi": "m_0 = \\frac{M}{N_A} = \\frac{m}{N}",
    "Molekulalar konsentratsiyasi": "n = \\frac{N}{V}",
    "Molyar hajm (n.sh. da gaz)": "V_m = \\frac{V}{\\nu} = 22,4\\text{ l/mol}",
    "Selsiy va Kelvin": "T = t + 273,15",
    "Harorat o‘zgarishi": "\\Delta T = \\Delta t",
    "Selsiy va Farengeyt": "t_F = 1,8 t_C + 32",
    "Molekula o‘rtacha kinetik energiyasi": "\\bar{E}_k = \\frac{3}{2}kT",
    "O‘rtacha kvadratik tezlik": "v_{kv} = \\sqrt{\\frac{3kT}{m_0}} = \\sqrt{\\frac{3RT}{M}}",
    "Ideal gaz ichki energiyasi": "U = \\frac{i}{2}\\nu RT = \\frac{i}{2}\\frac{m}{M}RT",
    "Bir atomli ideal gaz": "U = \\frac{3}{2}\\nu RT = \\frac{3}{2}pV",
    "Ichki energiya o‘zgarishi": "\\Delta U = \\frac{i}{2}\\nu R\\Delta T",
    "Yonish issiqligi": "Q = qm",
    "Issiqlik balansi tenglamasi": "Q_{ber} = Q_{ol} \\iff \\sum Q_i = 0",
    "Aralashmaning muvozanat harorati": "\\theta = \\frac{c_1 m_1 t_1 + c_2 m_2 t_2}{c_1 m_1 + c_2 m_2}",
    "Yoqilg‘i issiqligi va FIK": "\\eta = \\frac{Q_f}{qm} \\times 100\\%",
    "Jism issiqlik sig‘imi": "C = \\frac{Q}{\\Delta t} = cm",
    "Solishtirma issiqlik sig‘imi": "c = \\frac{Q}{m\\Delta t}",
    "Isish va sovishda issiqlik miqdori": "Q = cm(t_2 - t_1) = cm\\Delta t",
    "Molyar issiqlik sig‘imi": "C_m = \\frac{Q}{\\nu\\Delta T} = cM",
    "Ideal gaz molyar sig‘imlari": "C_V = \\frac{i}{2}R, \\quad C_p = C_V + R = \\frac{i+2}{2}R",
    "Adiabata ko‘rsatkichi": "\\gamma = \\frac{C_p}{C_V} = \\frac{i+2}{i}",
    "Erish va qotish issiqligi": "Q = \\lambda m",
    "Muzni isitish va eritish (to‘liq)": "Q = c_m m(0 - t_0) + \\lambda m + c_s m(t - 0)",
    "Bug‘lanish va kondensatsiya issiqligi": "Q = Lm",
    "Nisbiy namlik": "\\varphi = \\frac{p}{p_t} \\times 100\\% = \\frac{\\rho}{\\rho_t} \\times 100\\%",
    "Chiziqli kengayish": "l = l_0(1 + \\alpha\\Delta t)",
    "Hajmiy kengayish": "V = V_0(1 + \\beta\\Delta t), \\quad \\beta \\approx 3\\alpha",
    "MKN asosiy tenglamasi": "p = \\frac{1}{3}nm_0\\bar{v^2} = \\frac{2}{3}n\\bar{E}_k",
    "Bosim va harorat": "p = nkT",
    "Mendeleev–Klapeyron tenglamasi": "pV = \\nu RT = \\frac{m}{M}RT",
    "Boyl–Mariott qonuni (T = const)": "p_1 V_1 = p_2 V_2 \\quad (pV = \\text{const})",
    "Gey-Lyussak qonuni (p = const)": "\\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\quad \\left(\\frac{V}{T} = \\text{const}\\right)",
    "Sharl qonuni (V = const)": "\\frac{p_1}{T_1} = \\frac{p_2}{T_2} \\quad \\left(\\frac{p}{T} = \\text{const}\\right)",
    "Birlashgan gaz qonuni": "\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}",
    "Dalton qonuni": "p = p_1 + p_2 + \\dots + p_n",
    "Gaz zichligi": "\\rho = \\frac{pM}{RT}",
    "Adiabata tenglamasi (Puasson)": "pV^\\gamma = \\text{const}",
    "Universal gaz doimiysi": "R = N_A k \\approx 8,31\\text{ J/(mol}\\cdot\\text{K)}",
    "Termodinamikaning 1-qonuni": "Q = \\Delta U + A",
    "Gaz bajargan ish (p = const)": "A = p\\Delta V = p(V_2 - V_1) = \\nu R\\Delta T",
    "Izoxorik jarayon": "A = 0, \\quad Q = \\Delta U = \\frac{i}{2}\\nu R\\Delta T",
    "Izotermik jarayon": "\\Delta U = 0, \\quad Q = A = \\nu RT\\ln\\frac{V_2}{V_1}",
    "Izobarik jarayon": "Q = \\Delta U + A = \\frac{i+2}{2}\\nu R\\Delta T",
    "Adiabatik jarayon": "Q = 0, \\quad A = -\\Delta U",
    "Issiqlik mashinasi FIK": "\\eta = \\frac{A}{Q_1} = \\frac{Q_1 - Q_2}{Q_1}",
    "Karno FIK (eng katta FIK)": "\\eta_{max} = \\frac{T_1 - T_2}{T_1} = 1 - \\frac{T_2}{T_1}",
    "Sovitgich mashinasi koeffitsienti": "\\varepsilon = \\frac{Q_2}{A} = \\frac{Q_2}{Q_1 - Q_2}",
    "Entropiya o‘zgarishi": "\\Delta S = \\frac{Q}{T}",
    "Sirt taranglik koeffitsienti": "\\sigma = \\frac{F}{l} = \\frac{A}{\\Delta S}",
    "Kapillyarda ko‘tarilish balandligi": "h = \\frac{2\\sigma\\cos\\theta}{\\rho gr}",
    "Laplas bosimi (sharsimon tomchi)": "\\Delta p = \\frac{2\\sigma}{r}",
    "Zaryadning kvantlanishi": "q = \\pm Ne",
    "Zaryadlarning o‘rtacha taqsimoti": "q_1' = q_2' = \\frac{q_1 + q_2}{2}",
    "Kulon qonuni (vakuumda)": "F = k\\frac{|q_1 q_2|}{r^2} = \\frac{1}{4\\pi\\varepsilon_0}\\frac{|q_1 q_2|}{r^2}",
    "Kulon qonuni (muhitda)": "F = \\frac{k|q_1 q_2|}{\\varepsilon r^2}",
    "Elektr doimiysi bilan bog‘lanish": "k = \\frac{1}{4\\pi\\varepsilon_0} \\approx 9\\cdot 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2",
    "Maydon kuchlanganligi": "\\vec{E} = \\frac{\\vec{F}}{q}",
    "Nuqtaviy zaryad maydoni": "E = k\\frac{|q|}{r^2} = \\frac{1}{4\\pi\\varepsilon_0}\\frac{|q|}{r^2}",
    "Superpozitsiya prinsipi": "\\vec{E} = \\vec{E}_1 + \\vec{E}_2 + \\dots + \\vec{E}_n",
    "Potensial va potensial energiya": "\\varphi = \\frac{W_p}{q} = k\\frac{q_0}{r}",
    "Kuchlanish va ish": "U = \\frac{A}{q} = \\varphi_1 - \\varphi_2, \\quad A = qU",
    "Bir jinsli maydonda kuchlanish": "U = Ed",
    "Zarra tezlanishi maydonda": "a = \\frac{qE}{m}",
    "Zaryad tezlashtirilgandagi tezlik": "\\frac{mv^2}{2} = qU \\implies v = \\sqrt{\\frac{2qU}{m}}",
    "Elektr sig‘imi": "C = \\frac{q}{U}",
    "Yassi kondensator sig‘imi": "C = \\frac{\\varepsilon\\varepsilon_0 S}{d}",
    "Kondensator energiyasi": "W = \\frac{CU^2}{2} = \\frac{qU}{2} = \\frac{q^2}{2C}",
    "Kondensatorlar parallel": "C = C_1 + C_2 + \\dots",
    "Kondensatorlar ketma-ket": "\\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\dots",
    "Tok kuchi": "I = \\frac{q}{t} = \\frac{\\Delta q}{\\Delta t}",
    "O‘tgan zaryad": "q = It",
    "Metalldagi tok kuchi (mikroskopik)": "I = nevS",
    "Tok zichligi": "j = \\frac{I}{S}",
    "Kuchlanish": "U = \\frac{A}{q}",
    "EYuK": "\\varepsilon = \\frac{A_t}{q}",
    "To‘liq zanjir uchun Om qonuni": "I = \\frac{\\varepsilon}{R + r}",
    "Manba qisqichlaridagi kuchlanish": "U = \\varepsilon - Ir = IR",
    "Qisqa tutashuv toki": "I_{qt} = \\frac{\\varepsilon}{r}",
    "Manbalarni ketma-ket ulash": "\\varepsilon = \\varepsilon_1 + \\varepsilon_2 + \\dots, \\quad r = r_1 + r_2 + \\dots",
    "Zanjirning FIK": "\\eta = \\frac{R}{R+r} = \\frac{U}{\\varepsilon}",
    "Qarshilik (Om qonunidan)": "R = \\frac{U}{I}",
    "O‘tkazgich qarshiligi": "R = \\rho\\frac{l}{S}",
    "O‘tkazuvchanlik": "G = \\frac{1}{R}, \\quad \\sigma = \\frac{1}{\\rho}",
    "Qarshilikning haroratga bog‘liqligi": "R = R_0(1 + \\alpha\\Delta t), \\quad \\rho = \\rho_0(1 + \\alpha\\Delta t)",
    "Om qonuni (zanjir qismi)": "I = \\frac{U}{R}",
    "Kuchlanish va qarshilik (Om qonunidan)": "U = IR, \\quad R = \\frac{U}{I}",
    "Kirxgof 1-qoida (tugun)": "\\sum I_{kir} = \\sum I_{chiq}",
    "Kirxgof 2-qoida (kontur)": "\\sum \\varepsilon_i = \\sum I_i R_i",
    "Ketma-ket: tok va kuchlanish": "I = I_1 = I_2 = \\dots, \\quad U = U_1 + U_2 + \\dots",
    "Ketma-ket: qarshilik": "R = R_1 + R_2 + \\dots + R_n",
    "Ketma-ket: kuchlanishlar nisbati": "\\frac{U_1}{U_2} = \\frac{R_1}{R_2}",
    "Parallel: kuchlanish va tok": "U = U_1 = U_2 = \\dots, \\quad I = I_1 + I_2 + \\dots",
    "Parallel: qarshilik": "\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\dots + \\frac{1}{R_n}",
    "Ikki qarshilik parallel": "R = \\frac{R_1 R_2}{R_1 + R_2}",
    "n ta bir xil qarshilik": "R_{ketma-ket} = nR_0, \\quad R_{parallel} = \\frac{R_0}{n}",
    "Parallel: toklar nisbati": "\\frac{I_1}{I_2} = \\frac{R_2}{R_1}",
    "Tok ishi": "A = UIt = I^2 Rt = \\frac{U^2}{R}t",
    "Tok quvvati": "P = UI = I^2 R = \\frac{U^2}{R}",
    "Joul–Lens qonuni": "Q = I^2 Rt",
    "Elektr energiyasi sarfi (kW·soat)": "E = Pt",
    "Elektr isitgich FIK": "\\eta = \\frac{cm\\Delta t}{Pt} \\times 100\\%",
    "Manba maksimal quvvati": "P_{max} = \\frac{\\varepsilon^2}{4r} \\quad (R = r)",
    "Faradeyning birlashgan qonuni": "m = \\frac{M}{Fn}It = kIt",
    "Faradey doimiysi": "F = N_A e \\approx 9,65\\cdot 10^4\\text{ C/mol}",
    "Amper kuchi": "F = BIl\\sin\\alpha",
    "Lorens kuchi": "F = |q|vB\\sin\\alpha",
    "Zarra aylana radiusi": "R = \\frac{mv}{|q|B}",
    "Aylanish davri": "T = \\frac{2\\pi m}{|q|B}",
    "To‘g‘ri tok maydoni": "B = \\frac{\\mu_0 I}{2\\pi r}",
    "Solenoid maydoni": "B = \\mu_0\\mu\\frac{N}{l}I = \\mu_0\\mu nI",
    "Magnit oqimi": "\\Phi = BS\\cos\\alpha",
    "Tokli ramkaga ta’sir momenti": "M = BIS\\sin\\alpha",
    "Parallel toklar o‘zaro ta’siri": "F = \\frac{\\mu_0 I_1 I_2 l}{2\\pi d}",
    "Faradey qonuni": "\\varepsilon_i = -\\frac{\\Delta\\Phi}{\\Delta t}",
    "N o‘ramli g‘altak EYuK": "\\varepsilon_i = -N\\frac{\\Delta\\Phi}{\\Delta t}",
    "Harakatlanuvchi o‘tkazgich EYuK": "\\varepsilon_i = Blv\\sin\\alpha",
    "O‘zinduksiya EYuK": "\\varepsilon_{oz} = -L\\frac{\\Delta I}{\\Delta t}",
    "Induktivlik": "L = \\frac{\\Phi}{I}",
    "Solenoid induktivligi": "L = \\mu_0\\mu\\frac{N^2 S}{l}",
    "Magnit maydon energiyasi": "W = \\frac{LI^2}{2}",
    "Transformator": "\\frac{U_1}{U_2} = \\frac{N_1}{N_2} = k = \\frac{I_2}{I_1}",
    "O‘zgaruvchan tok EYuK va kuchlanishi": "e = \\varepsilon_m\\sin\\omega t, \\quad u = U_m\\sin(\\omega t + \\varphi)",
    "Siklik chastota": "\\omega = 2\\pi\\nu = \\frac{2\\pi}{T}",
    "Ta’sir etuvchi qiymatlar": "I_{ef} = \\frac{I_m}{\\sqrt{2}}, \\quad U_{ef} = \\frac{U_m}{\\sqrt{2}}",
    "Induktiv qarshilik": "X_L = \\omega L = 2\\pi\\nu L",
    "Sig‘im qarshiligi": "X_C = \\frac{1}{\\omega C} = \\frac{1}{2\\pi\\nu C}",
    "To‘liq qarshilik (R, L, C ketma-ket)": "Z = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2}",
    "Tebranish konturi davri (Tomson)": "T = 2\\pi\\sqrt{LC}",
    "Kontur xususiy chastotasi (rezonans)": "\\nu_0 = \\frac{1}{2\\pi\\sqrt{LC}}, \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}",
    "Kontur energiyasi": "W = \\frac{CU_m^2}{2} = \\frac{LI_m^2}{2}",
    "O‘zgaruvchan tok quvvati": "P = U_{ef}I_{ef}\\cos\\varphi",
    "Garmonik tebranish tenglamasi": "x = A\\cos(\\omega t + \\varphi_0)",
    "Tezlik": "v = -A\\omega\\sin(\\omega t + \\varphi_0), \\quad v_{max} = A\\omega",
    "Tezlanish": "a = -A\\omega^2\\cos(\\omega t + \\varphi_0) = -\\omega^2 x, \\quad a_{max} = A\\omega^2",
    "Tebranish energiyasi": "E = \\frac{kA^2}{2} = \\frac{mv_{max}^2}{2} = \\frac{m\\omega^2 A^2}{2}",
    "Kinetik va potensial energiya": "E_k = \\frac{mv^2}{2}, \\quad E_p = \\frac{kx^2}{2}, \\quad E = E_k + E_p = \\text{const}",
    "Harakat tenglamasi": "ma = -kx \\implies \\ddot{x} + \\omega^2 x = 0",
    "So‘nuvchi tebranish amplitudasi": "A(t) = A_0 e^{-\\beta t}",
    "Faza": "\\varphi = \\omega t + \\varphi_0",
    "Faza farqi": "\\Delta\\varphi = \\varphi_2 - \\varphi_1 = \\frac{2\\pi\\Delta t}{T}",
    "Matematik mayatnik davri (Gyuygens)": "T = 2\\pi\\sqrt{\\frac{l}{g}}",
    "Chastota va siklik chastota": "\\nu = \\frac{1}{2\\pi}\\sqrt{\\frac{g}{l}}, \\quad \\omega = \\sqrt{\\frac{g}{l}}",
    "g ni mayatnik orqali aniqlash": "g = \\frac{4\\pi^2 l}{T^2}",
    "Tezlanishli sistemadagi mayatnik": "T = 2\\pi\\sqrt{\\frac{l}{g \\pm a}}",
    "Prujinali mayatnik davri": "T = 2\\pi\\sqrt{\\frac{m}{k}}",
    "Bikrlikni davr orqali topish": "k = \\frac{4\\pi^2 m}{T^2}",
    "Vertikal mayatnik muvozanat cho‘zilishi": "\\Delta l_0 = \\frac{mg}{k}, \\quad T = 2\\pi\\sqrt{\\frac{\\Delta l_0}{g}}",
    "To‘lqin uzunligi": "\\lambda = vT = \\frac{v}{\\nu}",
    "To‘lqin tezligi": "v = \\lambda\\nu = \\frac{\\lambda}{T}",
    "Interferensiya: kuchayish sharti": "\\Delta = k\\lambda \\quad (k = 0, 1, 2, \\dots)",
    "Interferensiya: susayish sharti": "\\Delta = (2k + 1)\\frac{\\lambda}{2}",
    "Turg‘un to‘lqin: ikki uchi mahkam tor": "L = n\\frac{\\lambda}{2}, \\quad \\nu_n = \\frac{nv}{2L}",
    "Yopiq nay (bir uchi berk)": "L = (2n - 1)\\frac{\\lambda}{4}, \\quad n = 1, 2, 3, \\dots",
    "Tor to‘lqin tezligi": "v = \\sqrt{\\frac{F}{\\mu}}",
    "To‘lqin intensivligi": "I = \\frac{P}{S} = \\frac{W}{St}",
    "Doppler effekti (akustik)": "\\nu' = \\nu\\frac{v \\pm v_k}{v \\mp v_m}",
    "Tovush darajasi": "L = 10\\lg\\frac{I}{I_0}",
    "Aks sado orqali masofa": "s = \\frac{vt}{2}",
    "Mach soni": "M = \\frac{v}{v_{tov}}",
    "Nay (ochiq) asosiy tovushi": "\\nu_1 = \\frac{v}{2L}",
    "Havoda tovush tezligi (taxminan)": "v \\approx 331 + 0,6t",
    "Ideal gazda tovush tezligi": "v = \\sqrt{\\frac{\\gamma RT}{M}}",
    "Chaqmoqqacha masofa": "s = vt \\approx 340 t",
    "Qattiq jism va suyuqlikda tezlik": "v = \\sqrt{\\frac{E}{\\rho}} \\text{ (sterjen)}, \\quad v = \\sqrt{\\frac{K}{\\rho}} \\text{ (suyuqlik)}",
    "Yorug‘lik tezligi va to‘lqin xususiyatlari": "c = \\lambda\\nu",
    "Muhitda tezlik": "v = \\frac{c}{n}, \\quad \\lambda = \\frac{\\lambda_0}{n}",
    "Radiolokatsiya": "s = \\frac{ct}{2}",
    "Maksvell: c orqali doimiylar": "c = \\frac{1}{\\sqrt{\\varepsilon_0\\mu_0}}",
    "Foton energiyasi": "E = h\\nu = \\frac{hc}{\\lambda}",
    "Yorug‘lik tezligi (vakuumda)": "c = 299\\,792\\,458\\text{ m/s} \\approx 3\\cdot 10^8\\text{ m/s}",
    "Yoritilganlik": "E = \\frac{I\\cos\\alpha}{r^2}",
    "Yorug‘lik masofa va vaqt": "s = ct",
    "Soyaning o‘lchami (o‘xshashlik)": "\\frac{H}{h} = \\frac{L}{l}",
    "Qaytish qonuni": "\\alpha = \\gamma",
    "Ko‘zgu burilganda nur burilishi": "\\Delta\\gamma = 2\\Delta\\varphi",
    "Yassi ko‘zguda tasvir masofasi": "f = d",
    "Sinish qonuni (Snellius)": "n_1\\sin\\alpha = n_2\\sin\\beta",
    "Nisbiy sinish ko‘rsatkichi": "n_{21} = \\frac{\\sin\\alpha}{\\sin\\beta} = \\frac{n_2}{n_1} = \\frac{v_1}{v_2}",
    "Absolyut sinish ko‘rsatkichi": "n = \\frac{c}{v} \\quad (n \\ge 1)",
    "Chegaraviy burchak": "\\sin\\alpha_0 = \\frac{n_2}{n_1} \\quad (n_1 > n_2), \\quad \\sin\\alpha_0 = \\frac{1}{n} \\text{ (havoga)}",
    "Prizma og‘ish burchagi (kichik burchak)": "\\delta \\approx (n - 1)A",
    "Parallel plastinkada siljish": "x = d\\frac{\\sin(\\alpha - \\beta)}{\\cos\\beta}",
    "Ko‘zgu fokus masofasi": "F = \\frac{R}{2}",
    "Ko‘zgu formulasi": "\\frac{1}{d} + \\frac{1}{f} = \\frac{1}{F}",
    "Chiziqli kattalashtirish": "\\Gamma = \\frac{H}{h} = \\frac{|f|}{d}",
    "Yupqa linza formulasi": "\\frac{1}{d} + \\frac{1}{f} = \\frac{1}{F}",
    "Linzaning optik kuchi": "D = \\frac{1}{F}",
    "Linzalar tizimi optik kuchi": "D = D_1 + D_2",
    "Linza yasovchi formula": "\\frac{1}{F} = \\left(\\frac{n_l}{n_m} - 1\\right)\\left(\\frac{1}{R_1} + \\frac{1}{R_2}\\right)",
    "Fokus masofasi optik kuch orqali": "F = \\frac{1}{D}",
    "Tasvir masofasi": "f = \\frac{dF}{d - F}",
    "Jism masofasi": "d = \\frac{fF}{f - F}",
    "Jism va tasvir orasidagi eng kichik masofa": "L_{min} = 4F",
    "Lupaning kattalashtirishi": "\\Gamma = \\frac{d_0}{F}",
    "Mikroskopning kattalashtirishi": "\\Gamma = \\Gamma_{ob}\\cdot\\Gamma_{ok} \\approx \\frac{L d_0}{F_{ob}F_{ok}}",
    "Teleskopning kattalashtirishi": "\\Gamma = \\frac{F_{ob}}{F_{ok}}",
    "Ko‘zoynak optik kuchi": "D = \\frac{1}{d_0} - \\frac{1}{d_k}",
    "To‘lqin uzunligi va rang (taxminiy)": "\\lambda_{qizil} \\approx 700\\text{ nm} \\to \\lambda_{binafsha} \\approx 400\\text{ nm}",
    "Difraksion panjara maksimumi": "d\\sin\\varphi = k\\lambda",
    "Yung tajribasi: yo‘l farqi va polosa kengligi": "\\Delta = \\frac{dx}{L}, \\quad \\Delta x = \\frac{\\lambda L}{d}",
    "Malyus qonuni": "I = I_0\\cos^2\\theta",
    "Bryuster qonuni": "\\tan\\theta_B = n",
    "Yupqa parda: yo‘l farqi": "\\Delta = 2dn\\cos\\beta \\left(+ \\frac{\\lambda}{2}\\right)",
    "Atom nurlanishi (Bor)": "h\\nu = E_m - E_n \\quad (m > n)",
    "Vodorod atomi energiya sathlari": "E_n = -\\frac{13,6\\text{ eV}}{n^2}",
    "Bor orbitalari radiusi": "r_n = n^2 r_1, \\quad r_1 = 5,29\\cdot 10^{-11}\\text{ m}",
    "Spektr chiziqlari (Ridberg)": "\\frac{1}{\\lambda} = R\\left(\\frac{1}{n^2} - \\frac{1}{m^2}\\right)",
    "Elektronlar soni va tartib raqami": "N_e = Z",
    "Massa soni": "A = Z + N",
    "Yadro radiusi": "R = R_0 A^{1/3}, \\quad R_0 \\approx 1,2\\cdot 10^{-15}\\text{ m}",
    "Massa defekti": "\\Delta m = Zm_p + Nm_n - M_{ya}",
    "Bog‘lanish energiyasi": "E_b = \\Delta m\\cdot c^2",
    "Massa–energiya ekvivalentligi (amalda)": "E[\\text{MeV}] = 931,5\\cdot \\Delta m[\\text{a.m.b.}]",
    "Solishtirma bog‘lanish energiyasi": "\\varepsilon = \\frac{E_b}{A}",
    "O‘rtacha atom massasi": "A_r = \\frac{\\sum A_i w_i}{100}",
    "Yemirilish qonuni": "N = N_0\\cdot 2^{-t/T}",
    "Yemirilish qonuni (eksponensial)": "N = N_0 e^{-\\lambda t}, \\quad \\lambda = \\frac{\\ln 2}{T} \\approx \\frac{0,693}{T}",
    "Yemirilgan yadrolar ulushi": "\\frac{\\Delta N}{N_0} = 1 - 2^{-t/T}",
    "Aktivlik": "A = \\lambda N = \\frac{\\Delta N}{\\Delta t} = A_0 2^{-t/T}",
    "Yutilgan doza": "D = \\frac{E}{m}",
    "Ekvivalent doza": "H = w D",
    "α-yemirilish": "{}^A_Z X \\to {}^{A-4}_{Z-2}Y + {}^4_2\\text{He}",
    "β⁻-yemirilish": "{}^A_Z X \\to {}^A_{Z+1}Y + {}^0_{-1}e + \\tilde{\\nu}",
    "β⁺-yemirilish": "{}^A_Z X \\to {}^A_{Z-1}Y + {}^0_{+1}e + \\nu",
    "Reaksiya energiyasi": "Q = (\\sum M_{bosh} - \\sum M_{oxir})c^2",
    "Zaryad va massa soni saqlanishi": "\\sum Z_{bosh} = \\sum Z_{oxir}, \\quad \\sum A_{bosh} = \\sum A_{oxir}",
    "Massa–energiya bog‘lanishi": "E = mc^2, \\quad E_0 = m_0 c^2",
    "Uran-235 bo‘linishi (misol)": "{}^{235}_{92}\\text{U} + {}^1_0 n \\to {}^{141}_{56}\\text{Ba} + {}^{92}_{36}\\text{Kr} + 3{}^1_0 n + \\approx 200\\text{ MeV}",
    "Termoyadro sintezi (D + T)": "{}^2_1\\text{H} + {}^3_1\\text{H} \\to {}^4_2\\text{He} + {}^1_0 n + 17,6\\text{ MeV}",
    "Reaktorning issiqlik quvvati": "P = \\frac{NE_1}{t}",
    "Zanjir reaksiya koeffitsienti": "k = \\frac{N_{i+1}}{N_i}",
    "Kepler uchinchi qonuni (Quyosh sistemasi)": "T^2 = a^3",
    "Yorug‘lik masofa orqali": "t = \\frac{s}{c}",
    "Yulduz yorqinligi (Stefan–Bolsman)": "L = 4\\pi R^2 \\sigma T^4",
    "Vin siljish qonuni": "\\lambda_{max} T = b, \\quad b \\approx 2,9\\cdot 10^{-3}\\text{ m}\\cdot\\text{K}",
    "Parallaks usuli": "d[\\text{pk}] = \\frac{1}{p['']}",
    "Habbl qonuni": "v = H_0 d",
    "Qizil siljish": "z = \\frac{\\lambda - \\lambda_0}{\\lambda_0} \\approx \\frac{v}{c}",
    "Koinot yoshi (taxminiy)": "t_0 \\approx \\frac{1}{H_0}",
    "Lorens faktori": "\\gamma = \\frac{1}{\\sqrt{1 - \\frac{v^2}{c^2}}}",
    "Vaqt sekinlashuvi": "t = \\frac{t_0}{\\sqrt{1 - \\frac{v^2}{c^2}}} = \\gamma t_0",
    "Uzunlikning qisqarishi": "l = l_0\\sqrt{1 - \\frac{v^2}{c^2}} = \\frac{l_0}{\\gamma}",
    "Tezliklarni qo‘shish (relyativistik)": "u = \\frac{v_1 + v_2}{1 + \\frac{v_1 v_2}{c^2}}",
    "To‘liq energiya va impuls": "E = \\gamma m_0 c^2, \\quad p = \\gamma m_0 v, \\quad E^2 = (pc)^2 + (m_0 c^2)^2",
    "Relyativistik kinetik energiya": "E_k = (\\gamma - 1)m_0 c^2",
    "Shvartsshild radiusi": "r_s = \\frac{2GM}{c^2}",
    "Foton impulsi va massasi": "p = \\frac{h}{\\lambda} = \\frac{E}{c}, \\quad m_f = \\frac{h\\nu}{c^2}",
    "Fotoeffekt uchun Eynshteyn tenglamasi": "h\\nu = A_{ch} + \\frac{mv_{max}^2}{2}",
    "Fotoeffekt qizil chegarasi": "\\nu_{min} = \\frac{A_{ch}}{h}, \\quad \\lambda_{max} = \\frac{hc}{A_{ch}}",
    "To‘xtatuvchi kuchlanish": "e U_t = \\frac{mv_{max}^2}{2} = h\\nu - A_{ch}",
    "de Broyl to‘lqin uzunligi": "\\lambda = \\frac{h}{p} = \\frac{h}{mv}",
    "Geyzenberg noaniqlik munosabati": "\\Delta x\\cdot\\Delta p \\ge \\frac{\\hbar}{2}, \\quad \\Delta E\\cdot\\Delta t \\ge \\frac{\\hbar}{2}",
    "Vodorod atomi sathlari": "E_n = -\\frac{13,6\\text{ eV}}{n^2}",
    "Kompton to‘lqin uzunligi o‘zgarishi": "\\Delta\\lambda = \\frac{h}{m_e c}(1 - \\cos\\theta)",
    "Plank nurlanish formulasi": "u(\\nu, T) = \\frac{8\\pi h \\nu^3}{c^3}\\frac{1}{e^{h\\nu/kT} - 1}"
}

for p in range(7, 198):
    txt = reader.pages[p].extract_text()
    parts = re.split(r'Natija birligi:\s*', txt)
    for i in range(len(parts)-1):
        pre = parts[i]
        post = parts[i+1]
        
        post_match = re.match(r'^(.*?)\|\s*Qachon ishlatiladi:\s*(.*?)(?:\n[A-Z0-9\(\+]|\n[0-9] ·|\Z)', post, re.DOTALL)
        unit = post_match.group(1).strip() if post_match else ''
        usage = post_match.group(2).strip().split('\n')[0] if post_match else ''
        
        lines = [l.strip() for l in pre.split('\n') if l.strip()]
        for idx in range(len(lines)-1, -1, -1):
            if lines[idx] in ['A', 'B', 'C'] and idx > 0:
                name = lines[idx-1]
                level = lines[idx]
                vars_lines = [vl for vl in lines[idx+1:] if '—' in vl or '-' in vl]
                vars_desc = '\n'.join(vars_lines)
                
                # Check if formula in latex_lookup
                f_latex = latex_lookup.get(name, "")
                if not f_latex:
                    # Clean lookup
                    clean_name = re.sub(r'\s+', ' ', name).strip()
                    f_latex = latex_lookup.get(clean_name, "")
                
                sec_num, sec_title = get_sec_info_by_page(p+1)
                
                ans_parts = []
                if f_latex:
                    ans_parts.append(f"Formula: $${f_latex}$$")
                if vars_desc:
                    ans_parts.append(f"Belgilar izohi:\n{vars_desc}")
                if unit:
                    ans_parts.append(f"Natija birligi: {unit}")
                if usage:
                    ans_parts.append(f"Qachon ishlatiladi: {usage}")
                
                answer_full = "\n\n".join(ans_parts)
                
                add_card(
                    section=sec_num,
                    section_title=sec_title,
                    topic=name,
                    category='formula',
                    level=level,
                    question=f"«{name}» formulasi, belgilar ma’nosi va qo‘llanishi qanday?",
                    answer=answer_full,
                    formula=f_latex if f_latex else None,
                    symbol_explanation=vars_desc if vars_desc else None,
                    si_unit=unit if unit else None,
                    source_page=p+1,
                    difficulty=1 if level == 'A' else (2 if level == 'B' else 3)
                )
                formula_count += 1
                break

print(f"Total formulas added: {formula_count}")

# 3. EXTRACT ALL LAWS FROM CHAPTER XII.4 (pages 259-260)
print("3. Extracting physical laws from pages 259-260...")
qonun_count = 0
cur_law_sec = 'I. Fizikaga kirish'
law_sec_map = {
    'I. Fizikaga kirish': (1, 'Fizikaga kirish', 9),
    'II. Mexanika': (2, 'Mexanika', 39),
    'III. Molekulyar fizika va termodinamika': (3, 'Molekulyar fizika va termodinamika', 98),
    'IV. Elektr va magnetizm': (4, 'Elektr va magnetizm', 106),
    'VI. Optika': (6, 'Optika', 155),
    'VII. Atom va yadro fizikasi': (7, 'Atom va yadro fizikasi', 171),
    'VIII. Astronomiya va zamonaviy fizika asoslari': (8, 'Astronomiya va zamonaviy fizika', 190)
}

law_text = reader.pages[258].extract_text() + '\n' + reader.pages[259].extract_text()
for line in law_text.split('\n'):
    line = line.strip()
    if not line or '4. Eng muhim fizik qonunlar' in line or 'XII BO‘LIM' in line or 'XII. Yakuniy nazorat' in line or 'FIZIKA — TO‘LIQ YODLASH' in line or line.isdigit():
        continue
    for k in law_sec_map.keys():
        if line == k or line.startswith(k):
            cur_law_sec = k
            break
    m = re.match(r'^([ABC])\s+([A-Za-z0-9\(\)\‘\’\'\-\–\s]+?)\.\s*(.*)', line)
    if m:
        lvl, law_name, law_body = m.groups()
        s_num, s_title, p_src = law_sec_map.get(cur_law_sec, (11, 'Fizik qonunlar', 259))
        add_card(
            section=11, # Direct section 11: Fizik qonunlar
            section_title='Fizik qonunlar',
            topic=law_name.strip(),
            category='law',
            level=lvl,
            question=f"«{law_name.strip()}» ning to‘liq ta’rifi va mazmuni qanday?",
            answer=law_body.strip(),
            source_page=p_src,
            difficulty=1 if lvl == 'A' else (2 if lvl == 'B' else 3)
        )
        qonun_count += 1

print(f"Total laws added: {qonun_count}")

# 4. EXTRACT SI UNITS, PREFIXES & CONSTANTS (Section 10)
print("4. Extracting SI Units, Prefixes and Constants from pages 232-235...")

# 7 Asosiy SI birligi
si_base = [
    ("Uzunlik", "l", "metr", "m", "Yorug‘likning vakuumda 1/299 792 458 s da bosib o‘tgan yo‘li (2019-yil)"),
    ("Massa", "m", "kilogramm", "kg", "Plank doimiysi h = 6,626 070 15·10⁻³⁴ J·s qiymati orqali (2019-yil)"),
    ("Vaqt", "t", "sekund", "s", "Seziy-133 atomi nurlanishining 9 192 631 770 davri davomiyligi"),
    ("Tok kuchi", "I", "amper", "A", "Elementar zaryad e = 1,602 176 634·10⁻¹⁹ C orqali"),
    ("Termodinamik harorat", "T", "kelvin", "K", "Bolsman doimiysi k = 1,380 649·10⁻²³ J/K orqali"),
    ("Modda miqdori", "ν", "mol", "mol", "Aynan 6,022 140 76·10²³ ta zarra (Avogadro soni N_A)"),
    ("Yorug‘lik kuchi", "I_v", "kandela", "cd", "Chastotasi 540·10¹² Hz bo‘lgan nurlanishning yorug‘lik samaradorligi orqali")
]

for name, sym, unit, usym, defn in si_base:
    add_card(
        section=10,
        section_title="SI birliklari va prefikslar",
        topic=f"SI asosiy birligi: {name}",
        category="unit",
        level="A",
        question=f"SI tizimida «{name}» kattaligining asosiy birligi, belgisi va ta’rifi qanday?",
        answer=f"Kattalik: {name}\nBelgisi: {sym}\nAsosiy birligi: {unit} ({usym})\n\nTa’rifi: {defn}\nManba: SI xalqaro tizimi (2019-yil)",
        si_unit=usym,
        source_page=232,
        difficulty=1
    )

# Prefikslar
prefixes = [
    ("yotta", "Y", "10^24", "karrali"),
    ("zetta", "Z", "10^21", "karrali"),
    ("eksa", "E", "10^18", "karrali"),
    ("peta", "P", "10^15", "karrali"),
    ("tera", "T", "10^12", "karrali"),
    ("giga", "G", "10^9", "karrali"),
    ("mega", "M", "10^6", "karrali"),
    ("kilo", "k", "10^3", "karrali"),
    ("gekto", "g", "10^2", "karrali"),
    ("deka", "da", "10^1", "karrali"),
    ("detsi", "d", "10^-1", "ulushli"),
    ("santi", "s", "10^-2", "ulushli"),
    ("milli", "m", "10^-3", "ulushli"),
    ("mikro", "μ (mk)", "10^-6", "ulushli"),
    ("nano", "n", "10^-9", "ulushli"),
    ("piko", "p", "10^-12", "ulushli"),
    ("femto", "f", "10^-15", "ulushli"),
    ("atto", "a", "10^-18", "ulushli"),
    ("zepto", "z", "10^-21", "ulushli"),
    ("yokto", "y", "10^-24", "ulushli")
]

for p_name, p_sym, p_mult, p_type in prefixes:
    add_card(
        section=10,
        section_title="SI birliklari va prefikslar",
        topic=f"Prefiks: {p_name}",
        category="unit",
        level="A",
        question=f"«{p_name}» prefiksining belgisi, turi va ko‘paytuvchisi qanday?",
        answer=f"Prefiks nomi: {p_name}\nBelgisi: {p_sym}\nTuri: {p_type} prefiks\nKo‘paytuvchi: {p_mult}\nMisol: 1 {p_sym}m = {p_mult} m",
        source_page=232,
        difficulty=1 if p_name in ['kilo', 'mega', 'milli', 'santi', 'mikro', 'nano'] else 2
    )

# Fizik doimiylar (Constants)
constants = [
    ("Yorug‘lik tezligi (vakuumda)", "c", "299 792 458 m/s ≈ 3·10⁸ m/s", "m/s", "A"),
    ("Gravitatsion doimiy", "G", "6,674·10⁻¹¹ N·m²/kg²", "N·m²/kg²", "A"),
    ("Erkin tushish tezlanishi (Yer)", "g", "9,81 m/s² ≈ 9,8 m/s² ≈ 10 m/s²", "m/s²", "A"),
    ("Plank doimiysi", "h", "6,626·10⁻³⁴ J·s (ħ = h/2π = 1,055·10⁻³⁴ J·s)", "J·s", "A"),
    ("Elementar zaryad", "e", "1,602·10⁻¹⁹ C", "C", "A"),
    ("Elektron massasi", "m_e", "9,109·10⁻³¹ kg ≈ 5,486·10⁻⁴ a.m.b.", "kg", "A"),
    ("Proton massasi", "m_p", "1,6726·10⁻²⁷ kg ≈ 1,00728 a.m.b. (≈ 1836 m_e)", "kg", "A"),
    ("Neytron massasi", "m_n", "1,6749·10⁻²⁷ kg ≈ 1,00866 a.m.b.", "kg", "A"),
    ("Atom massa birligi", "1 a.m.b. (u)", "1,6605·10⁻²⁷ kg ≡ 931,5 MeV/c²", "kg", "A"),
    ("Avogadro doimiysi", "N_A", "6,022·10²³ mol⁻¹", "mol⁻¹", "A"),
    ("Bolsman doimiysi", "k", "1,381·10⁻²³ J/K", "J/K", "A"),
    ("Universal gaz doimiysi", "R", "8,314 J/(mol·K) (R = N_A · k)", "J/(mol·K)", "A"),
    ("Normal molyar hajm", "V_m", "22,4 l/mol = 22,4·10⁻³ m³/mol (0 °C, 1 atm)", "m³/mol", "A"),
    ("Normal atmosfera bosimi", "p_0", "101 325 Pa = 760 mm Hg ≈ 10⁵ Pa", "Pa", "A"),
    ("Elektr doimiysi", "ε_0", "8,854·10⁻¹² F/m", "F/m", "A"),
    ("Kulon koeffitsienti", "k", "9·10⁹ N·m²/C² (k = 1 / (4πε₀))", "N·m²/C²", "A"),
    ("Magnit doimiysi", "μ_0", "4π·10⁻⁷ H/m ≈ 1,257·10⁻⁶ H/m", "H/m", "A"),
    ("Faradey doimiysi", "F", "9,65·10⁴ C/mol (F = N_A · e)", "C/mol", "A"),
    ("Stefan–Bolsman doimiysi", "σ", "5,67·10⁻⁸ W/(m²·K⁴)", "W/(m²·K⁴)", "B"),
    ("Ridberg doimiysi", "R_∞", "1,097·10⁷ m⁻¹", "m⁻¹", "B"),
    ("Bor radiusi", "r_1", "5,29·10⁻¹¹ m", "m", "B"),
    ("Suvning solishtirma issiqlik sig‘imi", "c_s", "4200 J/(kg·K)", "J/(kg·K)", "A"),
    ("Muzning erish issiqligi", "λ", "3,3·10⁵ J/kg (334 kJ/kg)", "J/kg", "A"),
    ("Suvning bug‘lanish issiqligi", "L", "2,26·10⁶ J/kg (100 °C da)", "J/kg", "A"),
    ("Suv zichligi (4 °C da)", "ρ", "1000 kg/m³ = 1 g/sm³", "kg/m³", "A"),
    ("Havo zichligi (n.sh.)", "ρ_h", "1,29 kg/m³", "kg/m³", "A"),
    ("Tovush tezligi (havoda, 20 °C)", "v", "≈ 340 m/s (20 °C da 343 m/s, 0 °C da 331 m/s)", "m/s", "A"),
    ("Yer massasi va radiusi", "M_Y, R_Y", "M ≈ 5,97·10²⁴ kg, R ≈ 6,37·10⁶ m (≈ 6400 km)", "kg, m", "B"),
    ("Oy massasi va radiusi", "M_O, R_O", "M ≈ 7,35·10²² kg, R ≈ 1,74·10⁶ m (g_Oy ≈ 1,62 m/s²)", "kg, m", "B"),
    ("Quyosh massasi", "M_Q", "1,99·10³⁰ kg (Yerdan ≈ 333 000 marta og‘ir)", "kg", "B"),
    ("Astronomik birlik (Yer–Quyosh masofasi)", "1 a.b.", "1,496·10¹¹ m ≈ 150 mln km", "m", "A"),
    ("Yer–Oy orasidagi masofa", "r", "3,84·10⁸ m ≈ 384 400 km", "m", "B")
]

for c_name, c_sym, c_val, c_unit, c_lvl in constants:
    add_card(
        section=10,
        section_title="SI birliklari va prefikslar",
        topic=f"Fizik doimiy: {c_name}",
        category="constant",
        level=c_lvl,
        question=f"«{c_name}» ning belgisi va qiymati qanday?",
        answer=f"Doimiy: {c_name}\nBelgisi: {c_sym}\nQiymati: {c_val}\nSI birligi: {c_unit}",
        si_unit=c_unit,
        source_page=234,
        difficulty=1 if c_lvl == 'A' else 2
    )

# Yunon alifbosi
greek_letters = [
    ("Alfa", "Α, α", "burchak, α-zarra, burchak tezlanish"),
    ("Beta", "Β, β", "burchak, β-zarra, hajm kengayish koeffitsienti"),
    ("Gamma", "Γ, γ", "γ-nurlanish, adiabata ko‘rsatkichi, Lorens faktori"),
    ("Delta", "Δ, δ", "o‘zgarish (Δ), chetlashish/og‘ish burchagi (δ)"),
    ("Epsilon", "Ε, ε", "EYuK, dielektrik singdiruvchanlik, nisbiy xato"),
    ("Teta", "Θ, θ", "burchak, harorat (Selsiy)"),
    ("Lambda", "Λ, λ", "to‘lqin uzunligi, solishtirma erish issiqligi, yemirilish doimiysi"),
    ("Myu", "Μ, μ", "ishqalanish koeffitsienti, magnit singdiruvchanlik, mikro (10⁻⁶)"),
    ("Nyu", "Ν, ν", "chastota, modda miqdori (mol)"),
    ("Pi", "Π, π", "doimiy son ≈ 3,14159..."),
    ("Ro", "Ρ, ρ", "zichlik, solishtirma elektr qarshilik"),
    ("Sigma", "Σ, σ", "yig‘indi (Σ), sirt taranglik, mexanik kuchlanish, Stefan–Bolsman doimiysi"),
    ("Tau", "Τ, τ", "xususiy vaqt, aylanish momenti"),
    ("Fi", "Φ, φ", "elektr potensial, magnit oqimi, tebranish fazasi"),
    ("Omega", "Ω, ω", "siklik chastota (ω), burchak tezlik (ω), elektr qarshilik birligi (Om — Ω)"),
    ("Eta", "Η, η", "foydali ish koeffitsienti (FIK), dinamik qovushoqlik")
]

for g_name, g_sym, g_mean in greek_letters:
    add_card(
        section=10,
        section_title="SI birliklari va prefikslar",
        topic=f"Yunon harfi: {g_name}",
        category="unit",
        level="A",
        question=f"Yunon alifbosidagi «{g_name}» ({g_sym}) harfi fizikada qanday kattaliklar belgisi sifatida ishlatiladi?",
        answer=f"Harf: {g_name} ({g_sym})\nFizikadagi ma’nosi:\n{g_mean}",
        source_page=235,
        difficulty=1
    )

# 5. EXTRACT REVIEW QUESTIONS (Section 12 - Takrorlash savollari)
print("5. Extracting review questions from pages 262-264...")
q_count = 0
cur_q_sec = 1
sec_headers = {
    'I. Fizikaga kirish': 1,
    'II. Mexanika': 2,
    'III. Molekulyar fizika va termodinamika': 3,
    'IV. Elektr va magnetizm': 4,
    'V. Tebranishlar va to‘lqinlar': 5,
    'VI. Optika': 6,
    'VII. Atom va yadro fizikasi': 7,
    'VIII. Astronomiya va zamonaviy fizika asoslari': 8
}

review_qa = [
    # Sec 1
    (1, "Fizika nimani o‘rganadi? Materiyaning qanday ko‘rinishlari bor?", 
     "Fizika — tabiatning eng umumiy qonuniyatlarini, materiyaning tuzilishini, xossalarini, harakatini va o‘zaro ta’sirlarini o‘rganadigan tabiiy fan.\nMateriya ikki ko‘rinishda mavjud: MODDA (massa va hajmga ega zarralar to‘plami) va MAYDON (jismlar orasidagi ta’sirlarni uzatuvchi materiya turi: gravitatsion, elektr, magnit).", 262),
    (1, "Fizik jism, modda va maydon tushunchalarini misollar bilan farqlang.",
     "1. Jism — aniq shakl, hajm va massaga ega buyum (masalan: mix, kitob, tosh).\n2. Modda — jism nimadan yasalgani (masalan: po‘lat, yog‘och, suv).\n3. Maydon — moddasiz, lekin o‘zaro ta’sirni uzatuvchi moddiy muhit (masalan: Yerning tortish maydoni, magnit maydon).", 262),
    (1, "SI ning 7 ta asosiy birligini sanang va belgilarini yozing.",
     "SI tizimida 7 ta asosiy birlik bor:\n1. Uzunlik — metr (m)\n2. Massa — kilogramm (kg)\n3. Vaqt — sekund (s)\n4. Tok kuchi — amper (A)\n5. Termodinamik harorat — kelvin (K)\n6. Modda miqdori — mol (mol)\n7. Yorug‘lik kuchi — kandela (cd)", 262),
    (1, "Shkala bo‘linmasi qiymati qanday topiladi? Absolyut va nisbiy xato farqi nimada?",
     "Shkala bo‘linmasi qiymati: C = (x2 - x1) / n (ikkita qo‘shni yozilgan son ayirmasini ular orasidagi bo‘linmalar soniga bo‘linadi).\nAbsolyut xato (Δx) — o‘lchangan qiymatning haqiqiy qiymatdan farqi (kattalik birligida: masalan ±0,1 sm).\nNisbiy xato (ε) — absolyut xatoning o‘lchangan qiymatga nisbati (foizda: ε = (Δx/x)·100%).", 262),
    (1, "Skalyar va vektor kattaliklarni farqlang; har biriga 4 tadan misol bering.",
     "Skalyar — faqat son qiymati (va birligi) bilan aniqlanadi. Misollar: massa, vaqt, yo‘l, harorat, energiya, ish, zichlik.\nVektor — son qiymatidan tashqari fazoviy yo‘nalishga ham ega. Misollar: ko‘chish, tezlik, tezlanish, kuch, impuls, maydon kuchlanganligi.", 262),
    (1, "Perpendikulyar ikki vektor yig‘indisining moduli qanday topiladi?",
     "Pifagor teoremasi orqali topiladi:\nc = √(a² + b²)\nChunki ular orasidagi burchak α = 90° bo‘lib, cos(90°) = 0 bo‘ladi.", 262),
    # Sec 2
    (2, "Nyutonning uchta qonunini ta’riflang va misollar keltiring.",
     "1-qonun (Inersiya): Tashqi kuch ta’sir etmasa, jism tinch turadi yoki to‘g‘ri chiziqli tekis harakatini saqlaydi.\n2-qonun: Jism tezlanishi unga ta’sir qiluvchi kuchga to‘g‘ri, massasiga teskari proporsional: a = F/m (F = ma).\n3-qonun: Jismlar bir-biriga modullari teng, yo‘nalishlari qarama-qarshi kuchlar bilan ta’sir qiladi: F₁₂ = -F₂₁.", 263),
    (2, "Massa va og‘irlik farqi nimada? Birliklari qanday?",
     "Massa (m) — jismning inertlik va gravitatsion xossasi o‘lchovi; skalyar; joyga bog‘liq emas (Oyda ham, Yerda ham bir xil). Birligi: kilogramm (kg).\nOg‘irlik (P) — jismning Yer tortishi tufayli tayanchni bosadigan yoki osmaga ta’sir etadigan kuchi; vektor; joyga va tezlanishga bog‘liq: P = m(g ± a). Birligi: nyuton (N).", 263),
    (2, "Ishqalanish kuchi formulasini yozing; qaysi omillarga bog‘liq?",
     "Formula: F_ish = μN (gorizontal tekislikda F_ish = μmg, qiya tekislikda F_ish = μmg cosα).\nBog‘liq omillar: tegib turgan sirtlar materiali va holatiga (ishqalanish koeffitsienti μ) hamda normal bosim kuchiga (N).\nBog‘liq emas: tegish yuzasi maydoniga va (katta bo‘lmagan oraliqda) tezlikka.", 263),
    (2, "Guk qonuni qanday ta’riflanadi? Prujina bikrligi k nimaga bog‘liq?",
     "Guk qonuni: Kichik elastik deformatsiyalarda paydo bo‘ladigan elastiklik kuchi uzayishga (siqilishga) to‘g‘ri proporsional va unga qarama-qarshi yo‘nalgan: F = -kx.\nBikrlik k = ES/l₀ bo‘lib, materialning Yung modulliga (E), sim kesim yuzasiga (S) to‘g‘ri va boshlang‘ich uzunligiga (l₀) teskari proporsionaldir.", 263),
    (2, "Butun olam tortishish qonunini yozing va G ning qiymatini ayting.",
     "Formula: F = G · (m₁ · m₂) / r²\nTa’rifi: Ikki moddiy nuqta massalari ko‘paytmasiga to‘g‘ri va ular orasidagi masofa kvadratiga teskari proporsional kuch bilan tortishadi.\nGravitatsion doimiy: G = 6,674·10⁻¹¹ N·m²/kg².", 263),
    (2, "Birinchi va ikkinchi kosmik tezliklar qiymatlari qanday?",
     "1-kosmik tezlik (Yer sirtida doiraviy orbita): v₁ = √(gR) ≈ 7,9 km/s.\n2-kosmik tezlik (Yer tortish maydonini tark etish): v₂ = √2 · v₁ ≈ 11,2 km/s.\n(3-kosmik tezlik — Quyosh sistemasidan chiqish: v₃ ≈ 16,7 km/s).", 263),
    (2, "Lift tezlanish bilan yuqoriga harakatlanganda yo‘lovchining og‘irligi qanday o‘zgaradi?",
     "Yo‘lovchining og‘irligi ortadi: P = m(g + a) > mg. Bunga ortiqcha yuklanish (peregruzka) deyiladi.\nPastga a tezlanish bilan harakatlanganda esa kamayadi: P = m(g - a). Agar a = g bo‘lsa, P = 0 bo‘lib, vaznsizlik yuzaga keladi.", 263),
    (2, "Kinematikaning asosiy tushunchalarini ta’riflang: trayektoriya, yo‘l, ko‘chish, tezlik, tezlanish.",
     "Trayektoriya — harakat davomida nuqta chizgan chiziq.\nYo‘l (s) — trayektoriya bo‘ylab bosib o‘tilgan masofa; skalyar, kamaymaydi.\nKo‘chish (Δr) — boshlang‘ich nuqtadan oxirgi nuqtaga o‘tkazilgan yo‘naltirilgan kesma (vektor).\nTezlik (v) — ko‘chishning vaqtga nisbati (v = s/t).\nTezlanish (a) — tezlik o‘zgarish tezligi: a = (v - v₀)/t.", 263),
    (2, "Aylana bo‘ylab tekis harakatda davr, chastota, burchak tezlik va markazga intilma tezlanish bog‘lanishi qanday?",
     "Davr: T = t/N\nChastota: ν = 1/T\nBurchak tezlik: ω = 2π/T = 2πν\nChiziqli tezlik: v = ωR = 2πR/T\nMarkazga intilma tezlanish: a_m = v²/R = ω²R = 4π²R/T² = ωv (markazga yo‘nalgan).", 263),
    (2, "Impulsning saqlanish qonuni qachon bajariladi? Noelastik to‘qnashuv formulasi qanday?",
     "Yopiq (berk) tizimlarda tashqi kuchlar bo‘lmaganda (yoki yig‘indisi nol bo‘lganda) to‘liq impuls saqlanadi: m₁v₁ + m₂v₂ = const.\nAbsolyut noelastik to‘qnashuvda ikkala jism to‘qnashgach birlashib harakatlanadi:\nv = (m₁v₁ + m₂v₂) / (m₁ + m₂).", 263),
    (2, "Mexanik ish, quvvat va FIK formulalarini yozing va birliklarini ayting.",
     "Ish: A = F·s·cosα (birligi: Joul, J = N·m)\nQuvvat: P = A/t = F·v·cosα (birligi: Vatt, W = J/s)\nFIK: η = (A_f / A_t) · 100% = (P_f / P_t) · 100% (o‘lchamsiz yoki %; har doim < 100%).", 263),
    (2, "Mexanik energiyaning saqlanish qonunini ta’riflang. Qachon bajarilmaydi?",
     "Yopiq tizimda faqat konservativ kuchlar (og‘irlik, elastiklik) ta’sir qilganda to‘liq mexanik energiya o‘zgarmas saqlanadi:\nE_k1 + E_p1 = E_k2 + E_p2 = const.\nIshqalanish yoki qarshilik (nokonservativ kuchlar) mavjud bo‘lganda bajarilmaydi — mexanik energiyaning bir qismi issiqlikka aylanadi (Q = |A_ish|).", 263),
    (2, "Paskal qonuni va gidravlik press qanday ishlaydi?",
     "Paskal qonuni: Suyuqlik yoki gazga berilgan tashqi bosim uning barcha nuqtalariga o‘zgarishsiz bir xil uzatiladi.\nGidravlik press: Kichik porshendagi bosim katta porshendagi bosimga teng (F₁/S₁ = F₂/S₂). Shuning uchun kuchda yutuq olinadi: F₂/F₁ = S₂/S₁.", 263),
    (2, "Arximed kuchi nimaga bog‘liq? Jismning suzish shartlarini yozing.",
     "Arximed kuchi: F_A = ρ_s · g · V_bot (faqat suyuqlik zichligi va botgan hajmga bog‘liq; jism massasi yoki shakliga bog‘liq emas).\nSuzish shartlari:\n1. ρ_j < ρ_s (F_A > mg) — jism sirtga qalqib chiqadi va suzadi;\n2. ρ_j = ρ_s (F_A = mg) — jism suyuqlik ichida muallaq turadi;\n3. ρ_j > ρ_s (F_A < mg) — jism tubiga cho‘kadi.", 263),
    # Sec 3
    (3, "MKN ning uch asosiy holatini ta’riflang va dalillarini keltiring.",
     "1. Barcha moddalar zarralardan (atom, molekula, ion) tashkil topgan (dalil: moddalarning siqilishi, mikroskopik tasvirlar);\n2. Zarralar to‘xtovsiz va tartibsiz (issiqlik) harakatda (dalil: diffuziya, Broun harakati);\n3. Zarralar o‘zaro tortishish va itarilish kuchlari bilan ta’sirlashadi (dalil: qattiq jismlarning shaklini saqlashi, elastiklik).", 263),
    (3, "Ideal gaz tenglamasi va izojarayonlar qonunlarini yozing.",
     "Mendeleev–Klapeyron tenglamasi: pV = νRT = (m/M)RT\nIzojarayonlar:\n1. Izotermik (T = const): pV = const (Boyl–Mariott qonuni)\n2. Izobarik (p = const): V/T = const (Gey-Lyussak qonuni)\n3. Izoxorik (V = const): p/T = const (Sharl qonuni)\n4. Birlashgan gaz qonuni: p₁V₁/T₁ = p₂V₂/T₂.", 263),
    (3, "Termodinamikaning birinchi va ikkinchi qonunlarini ta’riflang; Karno FIK ni yozing.",
     "1-qonun: Q = ΔU + A (sistemaga berilgan issiqlik ichki energiya o‘zgarishiga va tashqi ish bajarishga sarflanadi).\n2-qonun: Issiqlik o‘z-o‘zidan sovuq jismdan issiq jismga o‘tmaydi (Klauzius); issiqlikni to‘liq ishga aylantiruvchi davriy mashina yo‘q (Kelvin).\nKarno sikli eng katta nazariy FIK: η_max = (T₁ - T₂) / T₁ = 1 - T₂/T₁ (haroratlar Kelvinda).", 263),
    # Sec 4
    (4, "Kulon qonunini yozing va belgilarini izohlang. k nimaga teng?",
     "Formula: F = k · |q₁ · q₂| / (ε · r²)\nBelgilar: q₁, q₂ — nuqtaviy zaryadlar (C); r — masofa (m); ε — muhitning dielektrik singdiruvchanligi.\nDoimiy: k = 1/(4πε₀) ≈ 9·10⁹ N·m²/C²; elektr doimiysi ε₀ ≈ 8,85·10⁻¹² F/m.", 263),
    (4, "Elektr maydon kuchlanganligi va potensial qanday kattaliklar? Farqi nimada?",
     "Kuchlanganlik (E = F/q): Maydonning kuch xarakteristikasi; VEKTOR kattalik; birligi V/m yoki N/C. Musbat zaryadga ta’sir qiluvchi kuch yo‘nalishida bo‘ladi.\nPotensial (φ = W_p/q): Maydonning energiya xarakteristikasi; SKALYAR kattalik; birligi Volt (V = J/C). Sinov zaryadining potensial energiyasini bildiradi.\nBog‘lanishi: U = φ₁ - φ₂ = Ed (bir jinsli maydonda).", 263),
    (4, "Kondensator nima? Sig‘im va energiya formulalarini yozing.",
     "Kondensator — dielektrik bilan ajratilgan ikki o‘tkazgichdan iborat elektr zaryadi va energiyasini to‘plovchi asbob.\nSig‘im: C = q/U; Yassi kondensator uchun: C = εε₀S / d.\nEnergiyasi: W = CU²/2 = qU/2 = q²/(2C).", 263),
    (4, "Ketma-ket va parallel ulanishning asosiy xossalarini ayting.",
     "Ketma-ket: Tok bir xil (I = I₁ = I₂); Kuchlanishlar qo‘shiladi (U = U₁ + U₂); Qarshiliklar qo‘shiladi (R = R₁ + R₂).\nParallel: Kuchlanish bir xil (U = U₁ = U₂); Toklar qo‘shiladi (I = I₁ + I₂); O‘tkazuvchanliklar qo‘shiladi (1/R = 1/R₁ + 1/R₂); Ikki rezistor uchun: R = R₁R₂ / (R₁ + R₂).", 263),
    (4, "Tok ishi, quvvati va Joul–Lens qonunini yozing.",
     "Tok ishi: A = UIt = I²Rt = (U²/R)t (Joul)\nTok quvvati: P = A/t = UI = I²R = U²/R (Vatt)\nJoul–Lens qonuni: O‘tkazgichdan tok o‘tganda ajraladigan issiqlik miqdori tok kvadrati, qarshilik va vaqt ko‘paytmasiga teng: Q = I²Rt.\n1 kW·soat = 3,6·10⁶ J = 3,6 MJ.", 263),
    (4, "Amper kuchi va Lorens kuchi formulalarini yozing. Yo‘nalishi qanday topiladi?",
     "Amper kuchi (tokli o‘tkazgichga ta’sir): F = B·I·l·sinα\nLorens kuchi (harakatdagi zarraga ta’sir): F = |q|·v·B·sinα\nYo‘nalish CHAP QO‘L qoidasi bilan aniqlanadi: B chiziqlari kaftga kirsa, to‘rtta barmoq tok (yoki musbat zarra tezligi) bo‘ylab yo‘nalsa, 90° ga ochilgan bosh barmoq kuch yo‘nalishini ko‘rsatadi (manfiy zaryad uchun kuch teskari tomonga).", 263),
    (4, "Elektromagnit induksiya va Faradey qonuni nima? Lens qoidasi nimani bildiradi?",
     "Elektromagnit induksiya — berk konturdan o‘tuvchi magnit oqimi o‘zgarganda konturda elektr toki hosil bo‘lishi.\nFaradey qonuni: Induksiya EYuK magnit oqimining o‘zgarish tezligiga teskari ishora bilan teng: ε_i = -ΔΦ/Δt.\nLens qoidasi: Induksion tok shunday yo‘naladiki, uning xususiy magnit maydoni o‘zini vujudga keltirgan magnit oqimi o‘zgarishiga qarshilik ko‘rsatadi (energiyaning saqlanish qonuni natijasi).", 263),
    (4, "O‘zgaruvchan tokning ta’sir etuvchi (effektiv) qiymati nima? 220 V dagi amplitudani toping.",
     "Ta’sir etuvchi (effektiv) qiymat — o‘zgaruvchan tok bir xil vaqtda bir xil qarshilikda doimiy tok ajratgan issiqlik miqdoriga teng issiqlik ajratadigan tok qiymati.\nBog‘lanishi: I_ef = I_m / √2, U_ef = U_m / √2.\nAgar U_ef = 220 V bo‘lsa: U_m = 220 · √2 ≈ 220 · 1,414 ≈ 311 V.", 263),
    # Sec 5
    (5, "Garmonik tebranish tenglamasini yozing va tezlik hamda tezlanishni toping.",
     "Siljish tenglamasi: x(t) = A·cos(ωt + φ₀)\nTezlik: v(t) = x'(t) = -Aω·sin(ωt + φ₀); maksimal tezlik: v_max = Aω (muvozanat nuqtasida)\nTezlanish: a(t) = v'(t) = -Aω²·cos(ωt + φ₀) = -ω²x; maksimal tezlanish: a_max = Aω² (chetki nuqtalarda).", 264),
    (5, "Matematik va prujinali mayatniklar davri formulalarini yozing.",
     "Matematik mayatnik (Gyuygens): T = 2π√(l/g) — massaga bog‘liq emas, ip uzunligi (l) va erkin tushish tezlanishiga (g) bog‘liq.\nPrujinali mayatnik: T = 2π√(m/k) — g ga bog‘liq emas, jism massasi (m) va prujina bikrligiga (k) bog‘liq.", 264),
    (5, "Ko‘ndalang va bo‘ylama to‘lqinlarni farqlang. v = λν qanday keltirib chiqariladi?",
     "Ko‘ndalang to‘lqin — zarrachalar to‘lqin tarqalish yo‘nalishiga tik tebranadi (masalan: yorug‘lik, arqon to‘lqini, suv sirti; qattiq jismlarda tarqaladi).\nBo‘ylama to‘lqin — zarrachalar to‘lqin yo‘nalishi bo‘ylab tebranadi (masalan: tovush; barcha muhitlarda tarqaladi).\nKeltirib chiqarish: To‘lqin bir davrda (T) bir to‘lqin uzunligi (λ) masofani bosadi: v = λ/T. Chastota ν = 1/T bo‘lgani uchun: v = λν.", 264),
    # Sec 6
    (6, "Yorug‘likning sinish qonunini ta’riflang va to‘liq ichki qaytish shartini ayting.",
     "Sinish qonuni (Snellius): Tushuvchi nur, singan nur va perpendikulyar bir tekislikda yotadi; sinα / sinβ = n₂/n₁ = n₂₁.\nTo‘liq ichki qaytish sharti: 1) Nur optik zichroq muhitdan siyrakroq muhitga o‘tishi shart (n₁ > n₂); 2) Tushish burchagi chegaraviy burchakdan katta bo‘lishi lozim (α ≥ α₀, bunda sinα₀ = n₂/n₁; havoga chiqishda sinα₀ = 1/n).", 264),
    (6, "Yupqa linza formulasini yozing va kattalashtirishni izohlang.",
     "Yupqa linza formulasi: 1/d + 1/f = 1/F = D\n(d — jismgacha masofa; f — tasvirgacha masofa; F — fokus masofasi; D — optik kuch dioptriyada).\nIshoralar: Haqiqiy bo‘lsa +, mavhum bo‘lsa -; Yig‘uvchi linzada F > 0, sochuvchi linzada F < 0.\nChiziqli kattalashtirish: Γ = H/h = |f|/d.", 264),
    (6, "Dispersiya nima? Spektrda ranglar tartibi qanday?",
     "Dispersiya — moddaning sinish ko‘rsatkichining (n) yorug‘lik chastotasiga (rangiga) bog‘liqligi. Qizil nur eng kam sinadi (n kichik), binafsha nur eng ko‘p sinadi (n katta).\nRanglar tartibi (QTSYHKB): Qizil, To‘q sariq, Sariq, Yashil, Havorang, Ko‘k, Binafsha.\nMnemonika: «Qani, to‘g‘ri sarg‘aygan yashil hovlini ko‘raylik, bolalar».", 264),
    # Sec 7
    (7, "Atomning planetar modeli va Bor postulatlarini ayting.",
     "Rezerford modeli: Atom markazida musbat zaryadlangan, atom massasining 99,95% dan ortig‘ini jamlagan ixcham yadro bor; uning atrofida elektronlar aylanadi.\nBor 1-postulati: Atom faqat stasionar (diskret energiyali) holatlarda bo‘ladi va bu holatda nurlanmaydi.\nBor 2-postulati: Atom bir stasionar holatdan ikkinchisiga o‘tganda bitta foton chiqaradi yoki yutadi: hν = E_m - E_n.", 264),
    (7, "Radioaktiv yemirilish qonunini yozing; yarim yemirilish davri nima?",
     "Yarim yemirilish davri (T) — radioaktiv yadrolar dastlabki sonining yarmi yemirilishi uchun ketadigan vaqt (moddaning xususiyati, tashqi sharoitga bog‘liq emas).\nQonun: N(t) = N₀ · 2^(-t/T) = N₀ · e^(-λt).\nBunda: N — yemirilmay qolgan yadrolar soni; Yemirilganlar soni: ΔN = N₀(1 - 2^(-t/T)).", 264),
    (7, "α, β va γ nurlanishlarni jadvalda taqqoslang.",
     "α-nurlanish: Geliy yadrolari (⁴₂He); zaryadi +2e; tezligi ≈ 10⁷ m/s; ionlash qobiliyati eng yuqori; o‘tuvchanligi past (qog‘oz to‘xtatadi).\nβ-nurlanish: Tez elektronlar (yoki pozitronlar); zaryadi -e (+e); tezligi 0,3-0,99 c; o‘rtacha o‘tuvchan (alyuminiy to‘xtatadi).\nγ-nurlanish: Qisqa to‘lqinli elektromagnit fotonlar; zaryadsiz; tezligi c (300 000 km/s); o‘tuvchanligi juda yuqori (faqat qalin qo‘rg‘oshin yoki beton to‘xtatadi).", 264),
    (7, "Yadro bo‘linishi va termoyadro sintezi farqi nimada?",
     "Yadro bo‘linishi — og‘ir yadrolarning (uran-235, plutoniy-239) neytron zarbasidan 2 ta yengilroq parchaga bo‘linishi; har bir bo‘linishda ≈ 200 MeV energiya va 2-3 ta yangi neytron ajraladi (atom reaktorlari va atom bombasida ishlatiladi).\nTermoyadro sintezi — yengil yadrolarning (vodorod, deyteriy, tritiy) o‘ta yuqori haroratda (10⁷-10⁸ K) qo‘shilib og‘irroq geliy yadrosini hosil qilishi (Quyosh va yulduzlar energiyasi manbai; solishtirma energiyasi bo‘linishdan ancha yuqori).", 264),
    # Sec 8
    (8, "Quyosh sistemasi tarkibini sanang. Astronomik birlik va yorug‘lik yili nima?",
     "Tarkibi: Markaziy yulduz — Quyosh (massaning 99,86% i); 8 ta sayyora (Merkuriy, Venera, Yer, Mars — toshli; Yupiter, Saturn, Uran, Neptun — gigantlar); mitti sayyoralar (Pluton, Seres); asteroidlar kamari; kometalar; Koyper kamari va Oort buluti.\n1 Astronomik birlik (a.b.) — Yerdan Quyoshgacha o‘rtacha masofa: ≈ 1,496·10⁸ km ≈ 150 mln km.\n1 Yorug‘lik yili — yorug‘likning bir yilda bosib o‘tgan masofasi: ≈ 9,46·10¹² km.", 264),
    (8, "Maxsus nisbiylik nazariyasi postulatlari nima? E = mc² nimani bildiradi?",
     "MNN postulatlari (Eynshteyn, 1905):\n1. Barcha inersial sanoq sistemalarida fizika qonunlari bir xil bo‘ladi (nisbiylik prinsipi).\n2. Vakuumda yorug‘lik tezligi (c ≈ 3·10⁸ m/s) barcha inersial sanoq sistemalarida bir xil bo‘lib, manba yoki kuzatuvchi harakatiga bog‘liq emas (invariantlik).\nE = mc² — Massa va energiyaning ekvivalentlik qonuni: jismning tinchlikdagi har qanday massasi ulkan ichki energiyaga ekvivalentdir (E₀ = m₀c²).", 264),
    (8, "Fotoeffekt qonunlari va Eynshteyn tenglamasini ayting.",
     "Eynshteyn tenglamasi: hν = A_ch + mv²_max / 2\nQonunlari:\n1. Birlik vaqtda urib chiqarilgan fotoelektronlar soni (fototok) tushayotgan yorug‘lik intensivligiga to‘g‘ri proporsional.\n2. Fotoelektronlarning maksimal kinetik energiyasi faqat yorug‘lik chastotasiga (hν) chiziqli bog‘liq bo‘lib, yorug‘lik intensivligiga bog‘liq emas.\n3. Har bir modda uchun qizil chegara mavjud (ν_min = A_ch / h; λ_max = hc / A_ch); undan past chastotada fotoeffekt yuz bermaydi.", 264),
    (8, "de Broyl to‘lqinlari va Geyzenberg noaniqlik munosabati nima?",
     "de Broyl gipotezasi: Faqat yorug‘lik emas, balki massaga va impulsga ega barcha moddiy zarralar (elektron, proton) ham to‘lqin xususiyatiga ega: λ = h/p = h/(mv).\nGeyzenberg noaniqlik munosabati: Mikrozarraning koordinatasi va impulsini (yoki energiyasi va vaqtini) bir vaqtda mutlaq aniqlikda o‘lchash mumkin emas: Δx · Δp ≥ ħ/2; ΔE · Δt ≥ ħ/2.", 264)
]

for sec_idx, q_txt, a_txt, p_num in review_qa:
    add_card(
        section=12,
        section_title="Yakuniy nazorat va takrorlash savollari",
        topic="Nazorat savoli",
        category="question",
        level="B",
        question=q_txt,
        answer=a_txt,
        source_page=p_num,
        difficulty=2
    )
    q_count += 1

print(f"Total review questions added: {q_count}")

# 6. EXTRACT HIGH-YIELD DIFFERENCES (Farqlari)
print("6. Extracting key differences...")
diff_count = 0
differences = [
    (1, "Gipoteza, Qonun va Nazariya farqi",
     "• Gipoteza — tekshirilmagan, isbot talab qiluvchi ilmiy taxmin (masalan: 'Yorug‘lik zarralar oqimidir' XVII asr).\n• Qonun — tajribada ko‘p marta tasdiqlangan, miqdoriy formula bilan ifodalanadigan bog‘lanish ('Nima bo‘ladi': Butun olam tortishish qonuni).\n• Nazariya — qonunlar va tajribalarni birlashtiruvchi, sababini tushuntiruvchi va bashorat qiluvchi umumiy tizim ('Nega shunday bo‘ladi': Molekulyar-kinetik nazariya).", 9),
    (1, "Fizik va Kimyoviy hodisalar farqi",
     "• Fizik hodisa — moddaning tarkibi (molekulyar tuzilishi) o‘zgarmaydi. Misollar: muzning erishi, suvning qaynashi, simning qizishi, magnitlanish.\n• Kimyoviy hodisa — modda tarkibi o‘zgaradi va yangi modda hosil bo‘ladi. Misollar: temirning zanglashi, yog‘ochning yonishi, sutning achishi.", 10),
    (1, "Jism, Modda va Maydon farqi",
     "• Jism — aniq shakli, hajmi va massasi bor har qanday buyum (qoshiq, mashina, Yer).\n• Modda — jism qanday materialdan yasalgani (po‘lat, suv, shisha, havo).\n• Maydon — moddasiz, lekin o‘zaro ta’sirni fazoda uzatuvchi materiya turi (magnit maydon, gravitatsion maydon, elektr maydon).", 12),
    (2, "Trayektoriya, Yo‘l va Ko‘chish farqi",
     "• Trayektoriya — jism harakatlangan chiziq (fazoviy geometrik iz).\n• Yo‘l (s) — trayektoriya uzunligi; SKALYAR kattalik; doim ≥ 0, vaqt o‘tishi bilan hech qachon kamaymaydi.\n• Ko‘chish (Δr) — boshlang‘ich vaziyatdan oxirgi vaziyatga yo‘nalgan kesma; VEKTOR kattalik; moduli har doim yo‘ldan kichik yoki teng (|Δr| ≤ s). Yopiq trayektoriyada ko‘chish nolga teng!", 22),
    (2, "Tekis va Tekis o‘zgaruvchan harakat farqi",
     "• Tekis harakat — tezlik o‘zgarmas (v = const, a = 0); teng vaqt oraliqlarida teng yo‘llar bosiladi; x(t) to‘g‘ri chiziq, v(t) gorizontal chiziq.\n• Tekis o‘zgaruvchan harakat — tezlanish o‘zgarmas (a = const ≠ 0); tezlik vaqt bo‘yicha chiziqli o‘zgaradi (v = v₀ + at); yo‘l s = v₀t + at²/2; x(t) parabola.", 29),
    (2, "Og‘irlik kuchi (mg) va Jism og‘irligi (P) farqi",
     "• Og‘irlik kuchi (F = mg) — Yerning jismga ta’sir qiluvchi gravitatsion kuchi; jismning markaziga qo‘yilgan; tezlanishdan qat’i nazar o‘zgarmaydi.\n• Jism og‘irligi (P) — jismning Yer tortishi tufayli tayanchni bosadigan yoki osmaga ta’sir etadigan elastiklik kuchi; tayanchga qo‘yilgan; tezlanishga bog‘liq: yuqoriga tezlashganda ortadi P = m(g+a), erkin tushishda nolga teng (vaznsizlik: P = 0).", 46),
    (2, "Elastik va Plastik deformatsiya farqi",
     "• Elastik deformatsiya — tashqi yuklama olingach, jism dastlabki o‘lchamlari va shaklini to‘liq tiklaydi (masalan: po‘lat prujina, rezina).\n• Plastik deformatsiya — yuklama olingandan keyin ham jismda qoldiq deformatsiya saqlanib qoladi (masalan: plastilin, nam gil, qo‘rg‘oshin sim).", 50),
    (3, "Qattiq, Suyuq va Gaz agregat holatlari taqqoslashi",
     "• Qattiq jism — shakli va hajmini saqlaydi; zarralari zich va kristall panjarada tebranadi; deyarli siqilmaydi.\n• Suyuqlik — hajmini saqlaydi, lekin idish shaklini oladi; molekulalari o‘rnini sakrab almashtiradi; deyarli siqilmaydi.\n• Gaz — shakli va hajmini saqlamaydi, butun idishni to‘ldiradi; molekulalar erkin tartibsiz uchadi; juda oson siqiladi.", 81),
    (3, "Bug‘lanish va Qaynash farqi",
     "• Bug‘lanish — suyuqlikning FAQAT SIRTI dan har qanday haroratda sodir bo‘ladigan sekin bug‘ga aylanish jarayoni; bunda suyuqlik soviydi.\n• Qaynash — suyuqlikning BUTUN HAJMI bo‘ylab bug‘ pufakchalari hosil bo‘lib ro‘y beradigan shiddatli jarayon; faqat ma’lum qaynash haroratida yuz beradi; qaynash vaqtida suyuqlik harorati o‘zgarmaydi.", 92),
    (4, "Musbat va Manfiy zaryad taqqoslash",
     "• Musbat zaryad (+) — elektronlar yetishmasligi; protonlar orqali tashiladi; maydon kuch chiziqlari zaryaddan chiqadi.\n• Manfiy zaryad (-) — ortiqcha elektronlar mavjudligi; elektronlar orqali tashiladi; maydon kuch chiziqlari zaryadga kiradi.\nBir xillar itarishadi, qarama-qarshilar tortishadi.", 105),
    (6, "Yig‘uvchi va Sochuvchi linza farqi",
     "• Yig‘uvchi linza — o‘rtasi chetlariga qaraganda qalin; optik o‘qqa parallel nurlarni fokusda yig‘adi; fokus masofasi F > 0, optik kuch D > 0; haqiqiy va mavhum tasvir berishi mumkin.\n• Sochuvchi linza — o‘rtasi chetlariga qaraganda yupqa; parallel nurlarni sochadi; fojusi mavhum (F < 0, D < 0); haqiqiy jism uchun FAQAT kichraygan, to‘g‘ri, mavhum tasvir beradi.", 163)
]

for s_num, d_title, d_ans, p_src in differences:
    sec_id, sec_t = get_sec_info_by_page(p_src)
    add_card(
        section=sec_id,
        section_title=sec_t,
        topic=d_title,
        category='difference',
        level='A',
        question=f"«{d_title}» haqida tushuntiring: ularning asosiy belgilari va o‘zaro farqlari nimalarda?",
        answer=d_ans,
        source_page=p_src,
        difficulty=2
    )
    diff_count += 1

print(f"Total differences added: {diff_count}")

# 7. EXTRACT HIGH-YIELD PITFALLS / COMMON MISTAKES
print("7. Extracting key pitfalls (Ko‘p uchraydigan xatolar)...")
pitfall_count = 0
pitfalls = [
    (1, "Fizika faqat formulalardan iborat emas", "Xato: Fizikani faqat formulalar yodlash deb hisoblash.\nTo‘g‘risi: Formula — tabiat qonunining qisqa matematik yozuvi. Avval hodisaning fizik mohiyatini va qonuniyatini tushuning, so‘ng formulani yodlang.", 9),
    (1, "Massaning SI birligi gramm emas", "Xato: Massaning SI birligini gramm (g) deb hisoblash.\nTo‘g‘risi: SI xalqaro tizimida massa birligi KILOGRAMM (kg) dir. Formulalarga qo‘yishdan oldin grammni 1000 ga bo‘lib kg ga o‘tkazish shart!", 16),
    (1, "Belgi va birlikni adashtirish", "Xato: m (massa belgisi) bilan m (metr birligi belgisi) ni chalkashtirish.\nTo‘g‘risi: Fizik kattalik belgisi kursiv bilan (m — massa), o‘lchov birligi esa tik shriftda (m — metr) yoziladi.", 12),
    (2, "Tekis harakatda tezlik va sanoq jismi", "Xato: Harakat tezligini sanoq jismini ko‘rsatmasdan aytish ('avtomobil 60 km/soat tezlikda ketyapti').\nTo‘g‘risi: Har qanday harakat nisbiydir: yerga nisbatan 60 km/soat bo‘lsa, ichidagi yo‘lovchiga nisbatan avtomobil tinch turadi.", 20),
    (2, "O‘rtacha tezlik o‘rta arifmetik emas", "Xato: O‘rtacha tezlikni tezliklarning o‘rta arifmetigi deb hisoblash: v_ort = (v₁ + v₂)/2.\nTo‘g‘risi: O‘rtacha tezlik har doim BUTUN YO‘LNING BUTUN VAQTGA NISBATI dir: v_ort = S_umum / t_umum! Agar yo‘l teng ikkiga bo‘lingan bo‘lsa: v_ort = 2v₁v₂ / (v₁ + v₂).", 26),
    (2, "Yuqori nuqtada tezlanish nol emas", "Xato: Yuqoriga otilgan jism eng yuqori nuqtaga chiqqanda tezlanishi nolga teng deb o‘ylash.\nTo‘g‘risi: Eng yuqori nuqtada tezlik nol bo‘ladi (v = 0), lekin tezlanish har doim erkin tushish tezlanishiga teng bo‘lib qolaveradi: a = g = 9,8 m/s² pastga yo‘nalgan!", 28),
    (2, "Qiya tekislikda reaksiya kuchi mg ga teng emas", "Xato: Qiya tekislikdagi jism uchun tayanch reaksiya kuchini N = mg deb olish.\nTo‘g‘risi: Qiya tekislikda normal bosim va reaksiya kuchi N = mg·cosα bo‘ladi. Ishqalanish kuchi esa F_ish = μN = μmg·cosα ga teng.", 47),
    (2, "Inersiya kuch emas, balki xossa", "Xato: Inersiyani kuch deb atash va uning yo‘nalishi haqida gapirish.\nTo‘g‘risi: Inersiya — jismning o‘z tezligini saqlab qolishga intilish XOSSASIdir, kuch emas. U boshqa jismlarga kuch sifatida ta’sir qilmaydi.", 39),
    (2, "Arximed kuchi jism massasiga bog‘liq emas", "Xato: Arximed kuchini jism massasiga yoki og‘irligiga teng deb olish.\nTo‘g‘risi: F_A = ρ_s · g · V_bot. U faqat suyuqlik zichligi va botgan hajmga bog‘liq. Jism qanchalik og‘ir bo‘lishidan qat’i nazar, bir xil hajmda bir xil Arximed kuchi ta’sir qiladi.", 75),
    (3, "Gaz qonunlarida Selsiy haroratini qo‘yish", "Xato: Mendeleev–Klapeyron yoki gaz qonunlarida t (°C) ni to‘g‘ridan-to‘g‘ri qo‘yish.\nTo‘g‘risi: Termodinamika va gaz qonunlarida harorat FAQAT ABSOLYUT SHKALADA (Kelvin, K) qo‘yilishi shart: T = t + 273,15 K!", 83),
    (3, "Fazaviy o‘tish vaqtida harorat o‘zgarmaydi", "Xato: Muz eriyotganda yoki suv qaynayotganda berilgan issiqlik tufayli harorat ko‘tariladi deb hisoblash.\nTo‘g‘risi: Erish va qaynash davrida berilgan barcha energiya fazaviy o‘tishga (kristall panjarani buzishga yoki bug‘ hosil qilishga) sarflanadi; modda to‘liq erib yoki bug‘lanib bo‘lgunicha harorat mutlaqo o‘zgarmaydi!", 89),
    (4, "Qarshilik kuchlanishga bog‘liq emas", "Xato: R = U/I formulasiga qarab, kuchlanish oshsa qarshilik ham oshadi deb o‘ylash.\nTo‘g‘risi: Qarshilik faqat o‘tkazgich parametri (R = ρl/S) va haroratiga bog‘liq. Om qonunida R = const bo‘lib, kuchlanish oshsa tok kuchi mutanosib ortadi.", 117),
    (4, "Elektronlar tok yo‘nalishiga teskari harakatlanadi", "Xato: Elektronlar tok yo‘nalishi bo‘ylab oqadi deb o‘ylash.\nTo‘g‘risi: Tarixiy kelishuvga ko‘ra, tok yo‘nalishi deb musbat zaryadlar harakati (+ dan - ga) qabul qilingan. Metallarda esa manfiy zaryadli elektronlar teskari (- dan + ga) harakatlanadi.", 112),
    (4, "Kondensator sig‘imi zaryadga bog‘liq emas", "Xato: C = q/U formulasiga qarab, zaryad ko‘paytirilsa sig‘im ortadi deb hisoblash.\nTo‘g‘risi: Sig‘im faqat kondensatorning o‘lchamlari va dielektrikka bog‘liq: C = εε₀S / d. Zaryad 2 marta ortsa, qoplamalar orasidagi kuchlanish ham 2 marta ortadi, sig‘im o‘zgarmaydi.", 111),
    (6, "Ko‘zgu formulasi ishoralari", "Xato: Barcha hollarda ko‘zgu formulasini 1/d + 1/f = 1/F deb qat’iy olish.\nTo‘g‘risi: Mavhum tasvir hosil bo‘lganda f ning oldiga manfiy ishora qo‘yiladi (1/d - 1/f = 1/F), sochuvchi linza yoki qavariq ko‘zguda esa fokus masofasi manfiy bo‘ladi (-1/F).", 160)
]

for s_num, p_title, p_body, p_page in pitfalls:
    sec_id, sec_t = get_sec_info_by_page(p_page)
    add_card(
        section=sec_id,
        section_title=sec_t,
        topic=p_title,
        category='mistake',
        level='A',
        question=f"Fizikadagi muhim xatolik: «{p_title}» haqida nimalarni bilish shart?",
        answer=p_body,
        source_page=p_page,
        difficulty=2
    )
    pitfall_count += 1

print(f"Total pitfalls added: {pitfall_count}")

# 8. EXTRACT MNEMONICS (Eslab qolish usullari - page 270)
print("8. Extracting mnemonics from page 270...")
mnemonics = [
    ("Yo‘l va tezlik uchburchagi", "v = s/t, s = vt, t = s/v", "«Yo‘l — tezlik va vaqt ko‘paytmasi». Uchburchak shaklida tasavvur qiling: tepada s, pastda v va t. Kerakli kattalikni qo‘l bilan yopsangiz, formula ko‘rinadi: s ni yopsangiz vt, v ni yopsangiz s/t, t ni yopsangiz s/v.", 270),
    ("Om qonuni uchburchagi", "U = IR, I = U/R, R = U/I", "Om uchburchagi: yuqorida U (kuchlanish), pastda I (tok) va R (qarshilik). Kerakli kattalikni yopib formulasini oling: U = IR, I = U/R, R = U/I.", 270),
    ("Bosim kuchi va yuza", "p = F/S", "«Kuch yuzaga bo‘linadi»: yuza qanchalik kichik bo‘lsa — bosim shunchalik katta bo‘ladi (pichoq, igna, mix nima uchun o‘tkir qilinadi).", 270),
    ("Mexanik ish va quvvat", "A = Fs cos α, P = A/t", "«Ish — kuch va yo‘l kosinus bilan»; quvvat esa — ishning qanchalik tez bajarilishidir (ishning vaqtga nisbati).", 270),
    ("Potensial va kinetik energiya", "E_p = mgh, E_k = mv²/2", "«Massa-g-balandlik» (mgh — balandlik potensiali); Kinetik esa «yarim massa, tezlik kvadrati» (mv²/2).", 270),
    ("Issiqlik formulalari qofiyasi", "Q = cmΔt, Q = λm, Q = Lm, Q = qm", "• Q = cmΔt — «Sim-dt» (isitish)\n• Q = λm — «Lambda-m» (eritish)\n• Q = Lm — «L-m» (bug‘lash)\n• Q = qm — «q-m» (yoqish)", 270),
    ("Gravitatsiya va Kulon o‘xshashligi", "F = G m1 m2 / r² va F = k q1 q2 / r²", "Ikki buyuk qonun shakli mutlaqo bir xil: massalar o‘rnida zaryadlar, ikkalasi ham masofa kvadratiga (1/r²) teskari proporsional!", 270),
    ("Ideal gaz holat tenglamasi", "pV = νRT", "Mnemonika: «Pivo — nur» (p·V = ν·R·T). Eslatma: Harorat T har doim faqat Kelvinda olinadi!", 270),
    ("Mayatniklar davri", "T = 2π√(l/g) va T = 2π√(m/k)", "Mayatnik: uzunlik/g; prujina: massa/bikrlik. Ikkala davr ham 2π ildiz ostida!", 270),
    ("To‘lqin va yorug‘lik tezligi", "v = λν, c = λν", "«To‘lqin tezligi — to‘lqin uzunligi va chastota ko‘paytmasi». Vakuumda elektromagnit to‘lqin tezligi c = λν ga teng.", 270),
    ("Yupqa linza va ko‘zgu formulasi", "1/d + 1/f = 1/F", "«Jism va tasvir teskarilari yig‘indisi fokus masofasi teskarisiga teng».", 270),
    ("Kelvin va Selsiy bog‘lanishi", "T = t + 273,15", "«Kelvin — Selsiyga 273 qo‘shish». Muhim: haroratlar farqi Selsiyda ham, Kelvinda ham bir xil: ΔT = Δt!", 270),
    ("Tezlik birligini o‘tkazish", "1 m/s = 3,6 km/soat", "Km/soatdan m/s ga o‘tishda 3,6 ga BO‘L; teskarisiga (m/s dan km/soatga) o‘tishda 3,6 ga KO‘PAYTIR!", 270),
    ("Optik spektr ranglari", "Spektr: Q-T-S-Y-H-K-B", "«Qani, to‘g‘ri sarg‘aygan yashil hovlini ko‘raylik, bolalar»: Qizil, To‘q sariq, Sariq, Yashil, Havorang, Ko‘k, Binafsha.", 270)
]

for m_title, m_form, m_exp, m_p in mnemonics:
    add_card(
        section=9,
        section_title="Formulalar",
        topic=f"Mnemonika: {m_title}",
        category="formula",
        level="A",
        question=f"Fizikadagi «{m_title}» ni eslab qolish mnemonikasi qanday?",
        answer=f"Formula / Qoida: {m_form}\n\nEslab qolish usuli:\n{m_exp}",
        formula=m_form,
        source_page=m_p,
        difficulty=1
    )

print(f"Total mnemonics added: {len(mnemonics)}")
print(f"\n==========================================")
print(f"TOTAL FLASHCARDS GENERATED: {len(cards)}")
print(f"==========================================")

# Save JSON output
out_dir = r'C:\Users\user\.gemini\antigravity\scratch\fizika-flashcards\public\data'
os.makedirs(out_dir, exist_ok=True)
json_path = os.path.join(out_dir, 'physics_cards.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(cards)} cards to {json_path}")

# Write TypeScript file
ts_dir = r'C:\Users\user\.gemini\antigravity\scratch\fizika-flashcards\src\data'
os.makedirs(ts_dir, exist_ok=True)
ts_path = os.path.join(ts_dir, 'physicsCards.ts')

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write('// Auto-generated Physics Flashcards Dataset\n')
    f.write('// Source: FIZIKA — TO‘LIQ YODLASH QO‘LLANMASI (270 pages)\n\n')
    f.write('export interface Flashcard {\n')
    f.write('  id: string;\n')
    f.write('  section: number;\n')
    f.write('  sectionTitle: string;\n')
    f.write('  topic: string;\n')
    f.write("  category: 'definition' | 'formula' | 'law' | 'unit' | 'difference' | 'mistake' | 'fact' | 'question' | 'constant';\n")
    f.write("  level: 'A' | 'B' | 'C';\n")
    f.write('  question: string;\n')
    f.write('  answer: string;\n')
    f.write('  formula?: string | null;\n')
    f.write('  symbol_explanation?: string | null;\n')
    f.write('  si_unit?: string | null;\n')
    f.write('  source_page: number;\n')
    f.write('  difficulty: number;\n')
    f.write('  is_favorite?: boolean;\n')
    f.write("  review_status?: 'new' | 'learning' | 'mastered';\n")
    f.write('  next_review_date?: string | null;\n')
    f.write('  repetition_step?: number;\n')
    f.write('}\n\n')
    f.write('export const PHYSICS_FLASHCARDS: Flashcard[] = ')
    json.dump(cards, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print(f"Wrote TypeScript dataset to {ts_path}")
