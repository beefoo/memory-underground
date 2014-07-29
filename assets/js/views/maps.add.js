app.views.MapsAddView = Backbone.View.extend({

  el: 'body',

  initialize: function(options) {
    var points = options.points,
        width = options.width,
        height = options.height,
        pathInterpolation = options.pathInterpolation,
        lines = [], line_segments = [];
    
    points = this.processPoints(points);
    
    // generate lines with points
    lines = this.makeLines(points, width, height, options);
    
    // draw the svg map
    this.drawMap(lines, width, height, options);
    
    // activate pan-zoom
    this.panZoom($("#map-svg"));
    
    // add listeners
    this.addListeners();
  },
  
  addLabelStyles: function(labels, options){
    var fontFamily = options.fontFamily,
        textColor = options.textColor,
        fontSize = options.fontSize,
        fontWeight = options.fontWeight;
    
    _.each(labels, function(label){
      label.fontFamily = fontFamily;
      label.alignment = "middle";
      // symbol    
      if (label.symbol) {
        label.textColor = "#ffffff";
        label.fontSize = 14;
        label.fontWeight = "bold";
        label.anchor = "middle"; 
        label.text = label.symbol;
        label.offsetX = 0;       
      // label
      } else {
        label.textColor = textColor;
        label.fontSize = fontSize;
        label.fontWeight = fontWeight;
        label.anchor = "end";
        label.text = label.label;
        label.offsetX = -10;   
      }
    });
    
    return labels;
  },
  
  addListeners: function(){
    var that = this;
    
    // keyboard listeners
    $(document).on('keydown', function(e){        
      switch(e.keyCode) {
        // o - output to json
        case 79:
          if (e.ctrlKey) that.exportSVG();
          break;
        default:
          break;
      }
    });
  },
  
  drawDots: function(svg, dots) {
    svg.selectAll("dot")
      .data(dots)
      .enter().append("circle")
      .attr("r", function(d) { return d.pointRadius; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .style("fill", function(d){ return d.pointColor; })
      .style("stroke", function(d){ return d.borderColor; })
      .style("stroke-width", function(d){ return d.borderWidth; });
  },
  
  drawEndLines: function(svg, lines, options){
    var that = this,
        pathInterpolation = options.pathInterpolation,
        svg_line;
    
    svg_line = d3.svg.line()
      .interpolate(pathInterpolation)
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
    
    // draw line segments at the beginning and end
    _.each(lines, function(line){
      var segments = that.getEndLineSegments(line.points);
      _.each(segments, function(segment){
        svg.append("path")
          .attr("d", svg_line(segment))
          .style("stroke", "#aaaaaa")
          .style("stroke-width", 2)
          .style("stroke-dasharray", "2,2")
          .style("stroke-opacity", line.strokeOpacity)
          .style("fill", "none"); 
      });               
    });
  },
  
  drawLabels: function(svg, labels, options) {        
    svg.selectAll("text")
      .data(labels)
      .enter().append("text")
      .text( function (d) { return d.text; })
      .attr("x", function(d) { return d.x + d.offsetX; })
      .attr("y", function(d) { return d.y; })
      .attr("text-anchor",function(d){ return d.anchor; })
      .attr("alignment-baseline",function(d){ return d.alignment; })     
      .style("font-family", function(d){ return d.fontFamily; })
      .style("font-size", function(d){ return d.fontSize; })
      .style("font-weight", function(d){ return d.fontWeight; })
      .style("fill", function(d){ return d.textColor; });
  },
  
  drawLegend: function(svg, lines) {
    
  },
  
  drawLines: function(svg, lines, options) {
    var that = this,
        pathInterpolation = options.pathInterpolation,
        svg_line;
        
    svg_line = d3.svg.line()
      .interpolate(pathInterpolation)
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
      
    _.each(lines, function(line){
      var points = that.getMainLinePoints(line.points);
      svg.append("path")
        .attr("d", svg_line(points))
        .style("stroke", line.color)
        .style("stroke-width", line.strokeWidth)
        .style("stroke-opacity", line.strokeOpacity)
        .style("fill", "none");          
    });
  },
  
  drawMap: function(lines, width, height, options){
    var bgColor = options.bgColor,
        svg, points, dots, labels, symbols;
    
    // init svg and add to DOM
    svg = d3.select("#svg-wrapper")
      .append("svg")
      .attr("id", "map-svg")
      .attr("width", width)
      .attr("height", height);
    
    // give it a background color 
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", bgColor);
            
    // extract points, dots, labels from lines
    points = _.flatten( _.pluck(lines, "points") );
    dots = _.filter(points, function(p){ return p.pointRadius && p.pointRadius > 0; });
    labels = _.filter(points, function(p){ return p.label !== undefined || p.symbol !== undefined; });
    labels = this.addLabelStyles(labels, options);
    
    // draw lines, dots, labels, and legend
    this.drawLines(svg, lines, options);
    this.drawEndLines(svg, lines, options); 
    this.drawDots(svg, dots);     
    this.drawLabels(svg, labels, options);  
    this.drawLegend(svg, lines);
  },
  
  exportSVG: function(){    
    var svg_xml = $("#map-svg").parent().html(),
        b64 = window.btoa(svg_xml);
        
    data_url = "data:image/svg+xml;base64,\n"+b64;  
    window.open(data_url, '_blank');
    
    // $("body").append($("<img src='data:image/svg+xml;base64,\n"+b64+"' alt='file.svg'/>"));
  },
  
  getColor: function(lines, colors){
    var i = lines.length;
    if (i>=colors.length) {
      i = i % lines.length;
    }
    return colors[i];
  },
  
  getEndLineSegments: function(points){
    var range = this.getMainLineRange(points),
        startPoints = points.slice(0, range[0]+1),
        endPoints = points.slice(range[1]-1);
    
    return [startPoints, endPoints];
  },
  
  getLengths: function(xDiff, yDiff, directions) {
    var lengths = [],
        rand = _.random(20,80) / 100,
        firstY;
    
    xDiff = Math.abs(xDiff);
    
    _.each(directions, function(d, i){
      // assuming only 1 east or west
      if (d=="e" || d=="w") {
        lengths.push(xDiff);
       // assuming only 2 souths
      } else { 
        if (i==0) {
          firstY = Math.round(yDiff*rand);
          lengths.push(firstY);
        } else {
          lengths.push(yDiff-firstY);
        }
      }
    });
    
    return lengths;
    
  },
  
  getMainLinePoints: function(points){
    var range = this.getMainLineRange(points);
    
    return points.slice(range[0], range[1]);
  },
  
  getMainLineRange: function(points){
    var indexStart, indexEnd;
    
    // find start index
    for(var i=0; i<points.length; i++) {
      if (points[i].pointRadius && !points[i].symbol) {
        indexStart = i;
        break;
      }
    }
    
    // find end index
    for(var j=points.length-1; j>=0; j--) {
      if (points[j].pointRadius && !points[j].symbol) {
        indexEnd = j + 1;
        break;
      }
    }
    
    return [indexStart, indexEnd];
  },
  
  getNextX: function(boundaries, iterator, totalPoints, width, minXDiff, prevPoint){
    var x = 0,
        prevPadding = 0.2,
        trendPadding = 0.3,
        percentComplete = parseFloat(iterator/totalPoints),
        // absolute min/max based on boundaries
        absMinX = boundaries.minX,
        absMaxX = boundaries.maxX,
        // min/max based on general trend from left to right
        trendMinX = Math.round(percentComplete*width) - Math.round(width*trendPadding),
        trendMaxX = Math.round(percentComplete*width) + Math.round(width*trendPadding),
        // create arrays
        mins = [absMinX, trendMinX],
        maxs = [absMaxX, trendMaxX],
        xDiff = 0;
    
    // make sure point is within x% of previous point
    if (prevPoint) {
      mins.push(prevPoint.x - Math.round(width*prevPadding));
      maxs.push(prevPoint.x + Math.round(width*prevPadding));
    }
    
    // determine the min/max
    minX = _.max(mins);
    maxX = _.min(maxs);   
    
    do {
      // ensure no logic error   
      if (minX<maxX) {
        x =  _.random(minX, maxX);
      } else {
        x =  _.random(maxX, minX);
      }
      if (prevPoint)
        xDiff = Math.abs(Math.floor(x - prevPoint.x));
    } while(prevPoint && xDiff<minXDiff); // ensure xDiff is above min
    
    return x;
  },
  
  getPointsBetween: function(p1, p2, pathTypes, cornerRadius) {
    var that = this,
        points = [],
        x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        yDiff = y2 - y1
        xDiff = x2 - x1,
        xDirection = false,
        pathType = false;
        
    // determine x direction 
    if (xDiff>0) {
      xDirection = "e";
    } else if (xDiff<0) {
      xDirection = "w";
    }
    
    // filter and choose random path type
    pathTypes = _.filter(pathTypes, function(pt){
      return pt.xDirection===xDirection;
    });
    pathType = _.sample(pathTypes);  

    // get points if path type exists
    if (pathType && xDirection) {
      
      // retrieve directions
      var directions = pathType.directions;
      
      // retrieve lengths
      var x = x1, y = y1,
          lengths = that.getLengths(xDiff, yDiff, directions);
          
      // generate points
      _.each(directions, function(direction, i){
        var length = lengths[i],
            point = that.translateCoordinates(x, y, direction, length),
            pointR1 = false, pointR2 = false;
            
        x = point.x;
        y = point.y;        
        point.id = _.uniqueId('p');
        point.direction1 = direction;
        
        // add transition points if corner radius
        if (cornerRadius>0 && cornerRadius<length/2) {
          if (direction=="s") {
            pointR1 = { x: x, y: y-length+cornerRadius };
            pointR2 = { x: x, y: y-cornerRadius };
          } else if (direction=="e") {
            pointR1 = { x: x-length+cornerRadius, y: y };
            pointR2 = { x: x-cornerRadius, y: y };
          } else {
            pointR1 = { x: x+length-cornerRadius, y: y };
            pointR2 = { x: x+cornerRadius, y: y };
          }
        }
        
        // add points
        if (pointR1) points.push(pointR1);
        if (pointR2) points.push(pointR2);
        points.push(point);        
        
        // add direction out
        if (i>0) {
          points[i-1].direction2 = direction;
        }
      });
           
      // ensure the last point matches target
      if (points.length > 0) {
        points[points.length-1].x = x2;
        points[points.length-1].y = y2;
      }
    
    // otherwise, just return target point
    } else {
      points.push({
        id: _.uniqueId('p'),
        direction1: 's',
        x: x2,
        y: y2
      });
    }   
    
    return points;
  },
  
  getSymbol: function(lineLabel, lines) {
    // prioritize characters: uppercase label, numbers, lowercase label
    var str = lineLabel.toUpperCase() + "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ" + lineLabel.toLowerCase() + "abcdefghijklmnopqrstuvwxyz",
        symbols = _.pluck(lines, "symbol"),
        symbol = str.charAt(0);
    
    // loop through string's characters
    for(var i=0; i<str.length; i++) {
      // get next character
      var chr = str.charAt(i);
      // if character not already taken, use as symbol
      if (symbols.indexOf(chr) < 0) {
        symbol = chr;
        break;
      }
    }
    
    return symbol;
  },
  
  makeLines: function(points, width, height, options){
    var that = this,
        // options
        paddingX = options.padding[0],
        paddingY = options.padding[1],
        colors = options.colors,
        pathTypes = options.pathTypes,
        strokeWidth = options.strokeWidth,
        strokeOpacity = options.strokeOpacity,
        offsetWidth = options.offsetWidth,
        pointRadius = options.pointRadius,
        pointRadiusLarge = options.pointRadiusLarge,
        pointColor = options.pointColor,
        borderColor = options.borderColor,
        borderWidth = options.borderWidth,
        cornerRadius = options.cornerRadius,
        minXDiff = options.minXDiff,
        // calculations
        activeW = width - paddingX*2,
        activeH = height - paddingY*2,
        boundaries = {minX: paddingX, minY: paddingY, maxX: width-paddingX, maxY: height-paddingY},
        pointCount = points.length,
        yUnit = Math.floor(activeH/pointCount),
        // initializers
        lines = [],
        prevLines = [];
    
    // ensure y-unit is 2 or more
    if (yUnit<2) yUnit = 2;
    
    // loop through points
    _.each(points, function(point, i){
      var nextY = paddingY + i * yUnit, // next available yUnit
          nextX = that.getNextX(boundaries, i, pointCount, activeW, minXDiff), // random x
          lineCount = point.lines.length,
          firstX = nextX;
          
      // loop through point's lines
      _.each(point.lines, function(lineLabel, j){
        // if line already exists
        var foundLine = _.findWhere(lines, {label: lineLabel}),
            prevPoint = false, newPoint;
        
        // retieve previous point
        if (foundLine) {
          prevPoint = _.last(foundLine.points); 
        }
        
        // if line is in previous lines, it will be straight
        if (prevLines.indexOf(lineLabel)>=0 && prevPoint) {
          nextX = prevPoint.x;
        
        // if line already exists, make sure X is within 20% of previous X
        } else if (prevPoint) {                   
          nextX = that.getNextX(boundaries, i, pointCount, activeW, minXDiff, prevPoint);
        }
        
        // init new point
        newPoint = {
          id: _.uniqueId('p'),
          x: nextX,
          y: nextY,
          pointRadius: pointRadius,
          pointColor: pointColor,
          borderColor: borderColor,
          borderWidth: borderWidth,
          lineLabel: lineLabel
        };
            
        // for first line, just add target point
        if (j===0) {
          firstX = newPoint.x;
          if (point.label) newPoint.label = point.label; // only the target point of the first line gets label
          
        // for additional new lines, place first point next to the first line's target point plus offset
        } else {
          newPoint.x = firstX + j*offsetWidth;
        }
        
        // big dot for symbols
        if (point.symbol) {          
          newPoint.pointRadius = pointRadiusLarge;
          newPoint.symbol = point.symbol;
          if (foundLine) {
            newPoint.pointColor = foundLine.color;
            newPoint.borderColor = foundLine.color;
          }
        }
        
        // line already exists
        if (foundLine){
          var transitionPoints = [],
              lastPoint;          

          // retrieve transition points
          transitionPoints = that.getPointsBetween(prevPoint, newPoint, pathTypes, cornerRadius);          
          
          // add direction2 to previous point
          if (transitionPoints.length > 0 && foundLine.points.length > 0) {
            lastPoint = _.last(foundLine.points);
            lastPoint.direction2 = transitionPoints[0].direction1;
          }

          // add transition points          
          _.each(transitionPoints, function(tp){
            foundLine.points.push(tp);
          });
          
          // update last point with meta data
          lastPoint = _.last(foundLine.points);
          lastPoint = _.extend(lastPoint, newPoint);          
          
        // line does not exist, add a new one
        } else {          
          var color = that.getColor(lines, colors),
              newLine = {
                label: lineLabel,
                color: color.hex,
                strokeWidth: strokeWidth,
                strokeOpacity: strokeOpacity,
                symbol: point.symbol,
                points: []            
              };
          if (point.symbol){
            newPoint.pointColor = color.hex;
            newPoint.borderColor = color.hex; 
          }            
          // add point to line, add line to lines
          newLine.points.push(newPoint);
          lines.push(newLine);
        }
        
      });
      
      prevLines = point.lines;     
    });
    
    // console.log(lines)
    
    return lines;
  },
  
  panZoom: function($selector){    
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
  
  processPoints: function(points){
    var that = this,
        lineLabels = _.uniq( _.flatten( _.pluck(points, 'lines') ) ), // get unique lines
        pps = [], lines = [];
    
    // loop through each point    
    _.each(points, function(p, i){
      var pp = p;
      // sort all the lines consistently
      pp.lines = _.sortBy(p.lines, function(lineLabel){ return lineLabels.indexOf(lineLabel); });
      // loop through lines
      _.each(pp.lines, function(lineLabel, j){
        var foundLine = _.findWhere(lines, {label: lineLabel});
        // check if line already added
        if (foundLine) {
          // keep track of last index
          foundLine.lastIndex = pps.length;
                    
        } else {
          // add line label and symbol
          var symbol = that.getSymbol(lineLabel, lines);          
          // add point for line label
          pps.push({
            symbol: symbol,
            lines: [lineLabel]
          });
          lines.push({
            lastIndex: pps.length,
            label: lineLabel,
            symbol: symbol
          });
        }
      });
      pps.push(pp);
    });
    
    // order lines in descending lastIndex order
    lines = _.sortBy(lines, function(line){ return line.lastIndex * -1; });
    
    // insert line symbol after last point
    _.each(lines, function(line){
      pps.splice(line.lastIndex+1, 0, {
        symbol: line.symbol,
        lines: [line.label]
      });
    });
    
    return pps;
  },
  
  translateCoordinates: function(x, y, direction, length){
    var x_direction = 0, y_direction = 0;
    
    switch(direction){
      case 'e':
        x_direction = 1;
        break;
      case 's':
        y_direction = 1;
        break;
      case 'w':
        x_direction = -1;
        break;
    }
    return {
      x: x + length * x_direction,
      y: y + length * y_direction
    };
  }

});
