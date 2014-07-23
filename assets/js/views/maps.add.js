app.views.MapsAddView = Backbone.View.extend({

  el: 'body',

  initialize: function(options) {
    this.options = options;
    this.initPanZoom($("#map-canvas"));      
    this.drawMap();    
  },
  
  initPanZoom: function($selector){    
    var $panzoom = $selector.panzoom();    
    $panzoom.parent().on('mousewheel.focal', function( e ) {
      e.preventDefault();
      var delta = e.delta || e.originalEvent.wheelDelta;
      var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
      $panzoom.panzoom('zoom', zoomOut, {
        increment: 0.1,
        animate: false,
        focal: e
      });
    });
  },
  
  drawLine: function(points, iterator){
    var that = this,
        color = this.options.colors[iterator],
        pathStyle = this.options.pathStyle,
        strokeWidth = this.options.strokeWidth;    
      
    var path = new paper.Path({
      segments: _.map(points, function(p){ return [p.x, p.y]; }),
      strokeColor: color.hex,
      strokeWidth: strokeWidth,
      strokeCap: 'round',
      strokeJoin: 'round'
    });
    
    if (pathStyle==="smooth") path.smooth(); 
  },
  
  drawMap: function(){
    var that = this,
        $canvas = $('#map-canvas'), canvas = $canvas[0],
        width = $canvas.width(), height = $canvas.height(),
        gridUnit = this.options.gridUnit,
        canvasPadding = gridUnit,
        activeW = width - 2*canvasPadding,
        activeH = height - 2*canvasPadding,        
        lines = [];
        
    paper.setup(canvas);
    
    // draw the lines first
    for(var i=0; i<5; i++) {      
      var x = _.random(Math.round(activeW*1/3), Math.round(activeW*2/3)),
          y = _.random(Math.round(activeH*1/3), Math.round(activeH*2/3)),
          point = {x: helper.roundToNearest(x, gridUnit), y: helper.roundToNearest(y, gridUnit)},
          initialPoints = [false, false, false, false, false, point, false, false, false, false, false],
          offset = 0, line, pathType1=false, pathType2=false;
      if (i>0) {
        offset++;
        for(var j = 4; j<=6; j++) {
          initialPoints[j] = lines[0].points[j];
          initialPoints[j].offset = offset;
        }
        pathType1 = lines[0].pathType1;
        pathType2 = lines[0].pathType2;
      }
      line  = this.getLine(initialPoints, width, height, pathType1, pathType2);
      this.drawLine(line.points, i);
      lines.push(line);      
    }
    
    // draw the points
    _.each(lines, function(line, i){
      that.drawPoints(line.points, i);
    });
    
    paper.view.draw();
    
    // this.exportSVG();   
  },
  
  drawPoints: function(points, iterator){
    var that = this,
        color = this.options.colors[iterator],
        colorText = this.options.colorText,
        colorPoint = color.inverse ? this.options.colorPointInverse : this.options.colorPoint,
        fontFamily = this.options.fontFamily,
        fontSize = this.options.fontSize,
        minTextLength = this.options.minTextLength,
        maxTextLength = this.options.maxTextLength,
        pointRadius = this.options.pointRadius;
        
    var circle = new paper.Path.Circle({
      radius: pointRadius,
      fillColor: colorPoint
    });
    
    _.each(points, function(p, i){
      var dot = new paper.Symbol(circle);
      dot.place([p.x, p.y]);
      
      var textPosition = that.textPosition(p.direction1, p.direction2),
          textAlign = 'center',
          textOffsetX = 0,
          textOffsetY = 15;
      
      switch(textPosition){
        case 'n':
          textOffsetY *= -1;
          break;
        case 'e':
          textOffsetX = 15;
          textOffsetY = 5;
          textAlign = 'left';
          break;
        case 'w':
          textOffsetX = -15;
          textOffsetY = 5;
          textAlign = 'right';
          break;
        default:          
          break;
      }
      
      var textPoint = [p.x+textOffsetX, p.y+textOffsetY],
          text = new paper.PointText({
          point: textPoint,
          content: helper.randomString(_.random(5, 15))+i,
          fillColor: colorText,
          fontFamily: fontFamily,
          fontSize: fontSize,
          justification: textAlign
      });
    });
    
  },
  
  exportSVG: function(){
    var svg = paper.project.exportSVG();
    
    svg.id = "map-svg";
    $('.svg-wrapper').append(svg);    
    
    var svg_xml = $("#map-svg").parent().html(),
        b64 = window.btoa(svg_xml);
    $("body").append($("<img src='data:image/svg+xml;base64,\n"+b64+"' alt='file.svg'/>"));
  },
  
  getLine: function(initial, width, height, pathType1, pathType2){
    var that = this,
        points = initial;
    
    // randomly choose path type and its opposite   
    var pathTypes = [
        {direction: 'n', directions: ['n', 'ne', 'e', 'w', 'nw'], noFollow: {e: 'w', w: 'e'}},
        {direction: 'ne', directions: ['n', 'ne', 'e', 'se', 'nw'], noFollow: {nw: 'se', se: 'nw'}},
        {direction: 'e', directions: ['n', 'ne', 'e', 'se', 's'], noFollow: {n: 's', s: 'n'}},
        {direction: 'se', directions: ['ne', 'e', 'se', 's', 'sw'], noFollow: {ne: 'sw', sw: 'ne'}},
        {direction: 's', directions: ['e', 'se', 's', 'sw', 'w'], noFollow: {e: 'w', w: 'e'}},
        {direction: 'sw', directions: ['se', 's', 'sw', 'w', 'nw'], noFollow: {nw: 'se', se: 'nw'}},
        {direction: 'w', directions: ['n', 's', 'sw', 'w', 'nw'], noFollow: {n: 's', s: 'n'}},
        {direction: 'nw', directions: ['n', 'ne', 'sw', 'w', 'nw'], noFollow: {ne: 'sw', sw: 'ne'}}      
      ],
      rand1 = _.random(0, pathTypes.length-1),
      rand2 = Math.round(rand1 + pathTypes.length/2);      
    if (rand2>pathTypes.length-1) rand2 = rand2 - pathTypes.length;
    pathType1 = pathType1 || pathTypes[rand1];
    pathType2 = pathType2 || pathTypes[rand2];
        
    // determine starting point  
    var initialPoints = _.filter(points, function(p){ return p!==false; }),
        firstPoint = initialPoints[0], lastPoint = initialPoints[initialPoints.length-1],
        firstIndex = _.indexOf(points, firstPoint),
        lastIndex = _.indexOf(points, lastPoint),
        noFollowDirection = firstPoint.direction1 ? pathType1.noFollow[firstPoint.direction1] : false,
        x = firstPoint.x, y = firstPoint.y,
        newPoint;
    
    // add points to beginning
    if (firstIndex>0) {
      for (var i=firstIndex-1; i>=0; i--) {
        newPoint = this.getPoint(x, y, pathType1, noFollowDirection, width, height);
        points[i] = newPoint;
        if (points[i+1]) points[i+1].direction2 = newPoint.direction1;
        noFollowDirection = pathType1.noFollow[newPoint.direction1];
        x = newPoint.x;
        y = newPoint.y;
      }
    }
    
    // add points to end
    x = lastPoint.x;
    y = lastPoint.y;
    noFollowDirection = lastPoint.direction1 ? pathType2.noFollow[lastPoint.direction1] : false;
    if (lastIndex<points.length-1) {
      for (var j=lastIndex+1; j<points.length; j++) {
        newPoint = this.getPoint(x, y, pathType2, noFollowDirection, width, height);
        points[j] = newPoint;
        if (points[j-1]) points[j-1].direction2 = newPoint.direction1;
        noFollowDirection = pathType2.noFollow[newPoint.direction1];
        x = newPoint.x;
        y = newPoint.y;
      }
    }
    
    // fill in the blanks
    _.each(points, function(p, k){
      if (p===false) {
        // TODO
      }
    });
    
    return {
      pathType1: pathType1,
      pathType2: pathType2,
      points: points
    };
  },
  
  getPoint: function(x, y, pathType, noFollowDirection, width, height){
    var j = 0,
        limit = 50,
        gridUnit = this.options.gridUnit,
        canvasPadding = gridUnit,
        minX = canvasPadding, minY = canvasPadding,
        maxX = width - minX, maxY = height - minY,        
        minSegLen = gridUnit,
        maxSegLen = gridUnit*6,
        _x = x, _y = y;        
    do {        
      // try a random direction
      direction = _.sample(pathType.directions);
      // try a random segment length    
      var length = _.random(minSegLen, maxSegLen),
          coords = this.translateCoordinates(x, y, direction, length);
      _x = helper.roundToNearest(coords[0], gridUnit);
      _y = helper.roundToNearest(coords[1], gridUnit);    
      j++;
    } while(
      j <= limit && // prevent infinite loops
      ( direction === noFollowDirection || // follow the noFollow rules
       _x<minX || _x>maxX || _y<minY || _y>maxY ) // make sure within bounds
    );
    x = _x;
    y = _y;    
    // add new point
    return {
      direction1: direction,
      direction2: false,
      x: x,
      y: y
    };
  },
  
  textPosition: function(direction1, direction2) {
    var pos = 's',
        d1 = direction1, d2 = direction2;
    
    // first segment
    if (!d1) {
      if (_.indexOf(['e','se','s','sw','w'], d2) >= 0) pos = 'n';
    // last segment
    } else if (!d2) {
      if (_.indexOf(['n','ne','e','w','nw'], d1) >= 0) pos = 'n';
    // two segments   
    } else {
      if (d1==='n') {
        if (_.indexOf(['n','ne'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['e','w'], d2) >= 0) pos = 'n';
        else if (_.indexOf(['nw'], d2) >= 0) pos = 'e';
      } else if (d1==='ne') {
        if (_.indexOf(['n','ne','nw'], d2) >= 0) pos = 'e';
        else if (_.indexOf(['e','se'], d2) >= 0) pos = 'n';
      } else if (d1==='e') {
        if (_.indexOf(['se','s'], d2) >= 0) pos = 'n';
      } else if (d1==='se') {
        if (_.indexOf(['se'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['s','sw'], d2) >= 0) pos = 'e';
      } else if (d1==='s') {
        if (_.indexOf(['se','s'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['sw'], d2) >= 0) pos = 'e';
      } else if (d1==='sw') {
        if (_.indexOf(['sw'], d2) >= 0) pos = 'e';
        else if (_.indexOf(['se','s'], d2) >= 0) pos = 'w';
      } else if (d1==='w') {
        if (_.indexOf(['s','sw'], d2) >= 0) pos = 'n';
      } else if (d1==='nw') {
        if (_.indexOf(['n','ne','nw'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['sw','w'], d2) >= 0) pos = 'n';
      }
    }
    
    return pos;
  },
  
  translateCoordinates: function(x, y, direction, length){
    var x_direction = 0, y_direction = 0;
    
    switch(direction){
      case 'n':
        y_direction = -1;
        break;
      case 'ne':
        y_direction = -1; x_direction = 1;
        break;
      case 'e':
        x_direction = 1;
        break;
      case 'se':
        y_direction = 1; x_direction = 1;
        break;
      case 's':
        y_direction = 1;
        break;
      case 'sw':
        y_direction = 1; x_direction = -1;
        break;
      case 'w':
        x_direction = -1;
        break;
      case 'nw':
        y_direction = -1; x_direction = -1;
        break;
    }
    return [
      x + length * x_direction,
      y + length * y_direction
    ];
  }

});
