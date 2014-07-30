var config = {
  "width": 2400,
  "height": 3600,
  "bgColor": "#f2e9b8",
  "padding": [200, 200],  
  "textColor": "#000000",  
  "fontFamily": "OpenSans, sans-serif",
  "fontSize": 13,
  "fontWeight": "normal",
  "maxLines": 32,
  "maxPointsPerLine": 32,
  "minTextLength": 1,
  "maxTextLength": 24,
  "pathInterpolation": "basis", // linear, basis, cardinal, monotone
  "pointColor": "#ffffff",
  "pointColorInverse": "#444444",
  "borderColor": "#444444",
  "borderColorInverse": "#ffffff",  
  "borderWidth": 2,
  "borderRadius": 4,
  "cornerRadius": 40,
  "pointRadius": 4,
  "pointRadiusLarge": 10,
  "strokeWidth": 8,
  "strokeOpacity": 0.8,
  "offsetWidth": 12,
  "minXDiff": 5,
  "hubSize": 4,
  "colors": [
    {"hex":"#e11002","group":"red"},
    {"hex":"#ff6d1c","group":"orange"},
    {"hex":"#fdc615","group":"yellow"},
    {"hex":"#147f35","group":"green"},
    {"hex":"#066cb5","group":"blue"},
    {"hex":"#c52da1","group":"violet"},
    {"hex":"#888888","group":"gray"},

    {"hex":"#ec6f6d","group":"red"},
    {"hex":"#ffa21d","group":"orange"},
    {"hex":"#e1a700","group":"yellow"},
    {"hex":"#9ec33b","group":"green"},
    {"hex":"#2da0e8","group":"blue"},
    {"hex":"#c053d3","group":"violet"},
    {"hex":"#aaaaaa","group":"gray"},
    
    {"hex":"#df054e","group":"red"},
    {"hex":"#e57257","group":"orange"},
    {"hex":"#edd000","group":"yellow"},
    {"hex":"#77ad4d","group":"green"},
    {"hex":"#506ab5","group":"blue"},
    {"hex":"#8152a0","group":"violet"},
    {"hex":"#777777","group":"gray"},

    {"hex":"#d65073","group":"red"},  
    {"hex":"#ff874d","group":"orange"},
    {"hex":"#cec124","group":"yellow"},
    {"hex":"#3d8773","group":"green"},
    {"hex":"#6b78c1","group":"blue"},
    {"hex":"#6d5cb7","group":"violet"},
    {"hex":"#bbbbbb","group":"gray"},
  ],
  "pathTypes": [
    {"xDirection":"s","directions":["s"]}, // straight line
    {"xDirection":"e","directions":["s","e","s"]}, // elbow right
    {"xDirection":"w","directions":["s","w","s"]}, // elbow left
  ]
};