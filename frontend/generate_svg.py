import sys

def create_plaque_svg():
    # Build coordinates for the SVG path
    
    # Top right quadrant
    p1 = "M 500,10"
    p2 = "C 550,10 600,15 620,40"
    p3 = "C 650,30 680,40 700,60"
    p4 = "C 730,50 780,60 800,90"
    p5 = "C 850,70 900,90 920,130"
    p6 = "C 900,150 880,180 870,220"
    p7 = "C 920,200 960,250 960,300"
    p8 = "C 960,380 920,450 850,450"
    p9 = "C 880,500 850,550 800,550"
    p10 = "C 750,580 700,580 650,580"
    p11 = "C 600,580 550,590 500,590"
    
    right_path = " ".join([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11])
    
    # Left quadrant is mirrored 
    # M 500,590
    l1 = "C 450,590 400,580 350,580"
    l2 = "C 300,580 250,580 200,550"
    l3 = "C 150,550 120,500 150,450"
    l4 = "C 80,450 40,380 40,300"
    l5 = "C 40,250 80,200 130,220"
    l6 = "C 120,180 100,150 80,130"
    l7 = "C 100,90 150,70 200,90"
    l8 = "C 220,60 270,50 300,60"
    l9 = "C 320,40 350,30 380,40"
    l10 = "C 400,15 450,10 500,10"
    
    left_path = " ".join([l1, l2, l3, l4, l5, l6, l7, l8, l9, l10])
    
    full_path = right_path + " " + left_path + " Z"
    
    svg = f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600' preserveAspectRatio='none'>
    <path d='{full_path}' fill='#F0EBE1' stroke='#D4AF37' stroke-width='2' vector-effect='non-scaling-stroke'/>
    </svg>"""
    
    print(svg)

create_plaque_svg()
