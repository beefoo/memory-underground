app.views.TransitAddView = Backbone.View.extend({

  el: 'body',

  initialize: function(options) {
    var stations = options.stations,
        width = options.width,
        height = options.height,
        pathInterpolation = options.pathInterpolation,
        lines = [], endLines = [];
    
    stations = this.processStations(stations);
    
    // generate lines with points
    lines = this.makeLines(stations, width, height, options);
    legend = this.makeLegend(lines, options);
    endLines = this.makeEndLines(lines, options);
    lines = _.union(lines, endLines);
    
    // draw the svg map
    this.drawMap(lines, legend, width, height, options);
    
    if (options.animate) {
      this.animateMap();
    }
    
    // activate pan-zoom
    this.panZoom($("#map-svg"));
    
    // add listeners
    this.addListeners();
  },
  
  addDotStyles: function(dots, options){
    var pointColor = options.pointColor,
        borderColor = options.borderColor,
        borderWidth = options.borderWidth;    
    
    _.each(dots, function(dot){
      dot.className = dot.className || '';
      // train symbol
      if (dot.symbol){
        dot.borderColor = dot.pointColor;
        dot.borderWidth = borderWidth;
      // point/station
      } else {
        dot.pointColor = pointColor;
        dot.borderColor = borderColor;
        dot.borderWidth = borderWidth;
      }
    });
    
    return dots;
  },
  
  addRectStyles: function(rects, options){
    var pointColor = options.pointColor,
        borderColor = options.borderColor,
        borderWidth = options.borderWidth,
        borderRadius = options.borderRadius,
        pointRadius = options.pointRadius,        
        dotSize = pointRadius*2,
        offsetWidth = options.offsetWidth - dotSize;
        
    _.each(rects, function(rect){
      rect.className = rect.className || '';
      // hub
      if (rect.hubSize) {
        rect.pointColor = pointColor;
        rect.borderColor = borderColor;
        rect.borderWidth = borderWidth;
        rect.borderRadius = borderRadius;
        rect.width = rect.hubSize*dotSize + offsetWidth*(rect.hubSize-1);
        rect.height = dotSize;
        rect.rectX = rect.x - pointRadius;
        rect.rectY = rect.y - pointRadius;
      // legend
      } else if (rect.type=="legend") {        
        rect.borderColor = borderColor;
        rect.borderWidth = borderWidth;
        rect.borderRadius = 0;
      }
    });
    
    return rects;
  },
  
  addLabelStyles: function(labels, options){
    var fontFamily = options.fontFamily,
        textColor = options.textColor,
        fontSize = options.fontSize,
        fontWeight = options.fontWeight;
    
    _.each(labels, function(label){
      label.className = label.className || '';
      label.fontFamily = fontFamily;
      label.alignment = "middle";
      // symbol    
      if (label.symbol) {
        label.textColor = "#ffffff";
        label.fontSize = 14;
        label.fontWeight = "normal";
        label.anchor = "middle"; 
        label.text = label.symbol;
        label.labelX = label.labelX!==undefined ? label.labelX : label.x;
        label.labelY = label.labelY!==undefined ? label.labelY : label.y + 1;  
      // label
      } else {
        label.textColor = textColor;
        label.fontSize = label.fontSize || fontSize;
        label.fontWeight = fontWeight;
        label.anchor = label.anchor || "end";
        label.text = label.text || label.label;
        label.labelX = label.labelX!==undefined ? label.labelX : label.x-10;
        label.labelY = label.labelY!==undefined ? label.labelY : label.y; 
      }
    });
    
    return labels;
  },
  
  addLineStyles: function(lines, options){
    var strokeOpacity = options.strokeOpacity,
        strokeWidth = options.strokeWidth;
    
    _.each(lines, function(line){
      line.className = line.className || '';
      line.strokeOpacity = strokeOpacity;
      // symbol    
      if (line.type=="symbol") {
        line.color = "#aaaaaa";   
        line.strokeWidth = 2;
        line.strokeDash = "2,2";
   
      // normal line
      } else {
        line.strokeWidth = strokeWidth;
        line.strokeDash = "none";
      }
    });
    
    return lines;
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
  
  animateMap: function(){
    
  },
  
  drawDots: function(svg, dots) {
    svg.selectAll("dot")
      .data(dots)
      .enter().append("circle")
      .attr("r", function(d) { return d.pointRadius; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("class", function(d) { return d.className || ''; })
      .style("fill", function(d){ return d.pointColor; })
      .style("stroke", function(d){ return d.borderColor; })
      .style("stroke-width", function(d){ return d.borderWidth; });
  },
  
  drawRects: function(svg, rects){
    _.each(rects, function(r){
      svg.append("rect")
        .attr("width", r.width)
        .attr("height", r.height)
        .attr("x", r.rectX)
        .attr("y", r.rectY)
        .attr("rx", r.borderRadius)
        .attr("ry", r.borderRadius)
        .attr("class", r.className)
        .style("fill", r.pointColor)
        .style("stroke", r.borderColor)
        .style("stroke-width", r.borderWidth);
    });    
  },
  
  drawLabels: function(svg, labels, options) {        
    svg.selectAll("text")
      .data(labels)
      .enter().append("text")
      .text( function (d) { return d.text; })
      .attr("class", function(d) { return d.className || ''; })
      .attr("x", function(d) { return d.labelX; })
      .attr("y", function(d) { return d.labelY; })
      .attr("text-anchor",function(d){ return d.anchor; })
      .attr("alignment-baseline",function(d){ return d.alignment; })     
      .style("font-family", function(d){ return d.fontFamily; })
      .style("font-size", function(d){ return d.fontSize; })
      .style("font-weight", function(d){ return d.fontWeight; })
      .style("fill", function(d){ return d.textColor; });
  },
  
  drawLines: function(svg, lines, options) {
    var that = this,
        pathInterpolation = options.pathInterpolation,
        animate = options.animate,
        animationDuration = options.animationDuration,
        svg_line;
        
    svg_line = d3.svg.line()
      .interpolate(pathInterpolation)
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
      
    _.each(lines, function(line){
      var points = line.points,
          path = svg.append("path")
                  .attr("d", svg_line(points))
                  .attr("class", line.className)
                  .style("stroke", line.color)
                  .style("stroke-width", line.strokeWidth)
                  .style("stroke-opacity", line.strokeOpacity)                  
                  .style("fill", "none");
                  
      // animate if it's a solid line
      if (path && animate && line.strokeDash=="none" && line.className.indexOf("primary")>=0) {
        var totalLength = path.node().getTotalLength();
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .duration(animationDuration)
            .ease("linear")
            .attr("stroke-dashoffset", 0)   
      
      // otherwise, set the stroke dash
      } else {
        path.style("stroke-dasharray", line.strokeDash);
      }    
                
    });
  },
  
  drawMap: function(lines, legend, width, height, options){
    var bgColor = options.bgColor,        
        svg, points, dots, labels, rects;
    
    // init svg and add to DOM
    svg = d3.select("#svg-wrapper")
      .append("svg")
      .attr("id", "map-svg")
      .attr("width", width)
      .attr("height", height);
            
    // extract points, dots, labels from lines
    points = _.flatten( _.pluck(lines, "points") );
    dots = _.filter(points, function(p){ return p.pointRadius && p.pointRadius > 0; });    
    labels = _.filter(points, function(p){ return p.label !== undefined || p.symbol !== undefined; });
    rects = _.filter(points, function(p){ return p.hubSize; });
    
    // add legend items
    lines = _.union(lines, legend.lines);
    dots = _.union(dots, legend.dots);
    labels = _.union(labels, legend.labels);
    
    // add styles
    lines = this.addLineStyles(lines, options);
    dots = this.addDotStyles(dots, options);
    labels = this.addLabelStyles(labels, options);
    rects = this.addRectStyles(rects, options);
    legend.rects = this.addRectStyles(legend.rects, options);
    
    // draw lines, dots, labels, rects
    this.drawRects(svg, legend.rects);
    this.drawLines(svg, lines, options);
    this.drawDots(svg, dots, options);   
    this.drawRects(svg, rects, options);
    this.drawLabels(svg, labels, options);
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
  
  getNextX: function(boundaries, iterator, totalPoints, width, minXDiff, prevPoint){
    var x = 0,
        prevPadding = 0.25,
        trendPadding = 0.4,
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
    
    // strip spaces
    str = str.replace(" ","");
    
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
  
  getTitleLines: function(title, titleMaxLineChars) {
    var lines = [],
        titleLength = title.length,
        words = title.split(" "),
        currentLine = "";
        
    _.each(words, function(word){
      // if new word goes over max, start new line 
      if (word.length+currentLine.length+1 > titleMaxLineChars) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += ' ' + word;
      }
    });
    
    if (currentLine.length) lines.push(currentLine);
    
    return lines;
  },
  
  makeEndLines: function(lines, options){
    var pointRadiusLarge = options.pointRadiusLarge,
        lineLength = pointRadiusLarge * 2 + 10,
        endLines = [],
        yHash = {};
        
    _.each(lines, function(line, i){
      var firstPoint = line.points[0],
          lastPoint = line.points[line.points.length-1],
          lineClassName = helper.parameterize('line-'+line.label) + ' end-line',
          pointClassName = helper.parameterize('point-'+line.label) + ' end-line',
          lineStart = { className: lineClassName + ' start-line', type: 'symbol', points: [] },
          lineEnd = { className: lineClassName, type: 'symbol', points: [] },
          
          fpId = 'p'+firstPoint.y,
          lpId = 'p'+lastPoint.y;
      
      // keep track of existing y points
      if (yHash[fpId]!==undefined) {
        yHash[fpId]++;
      } else {
        yHash[fpId] = 0;
      }
      if (yHash[lpId]!==undefined) {
        yHash[lpId]++;
      } else {
        yHash[lpId] = 0;
      }
      
      // add start line
      lineStart.points.push({
        x: firstPoint.x,
        y: firstPoint.y - lineLength - yHash[fpId]%2*lineLength, // stagger y's that are next to each other
        symbol: line.symbol,
        pointColor: line.color,
        pointRadius: pointRadiusLarge,
        className: pointClassName + ' symbol'
      });
      lineStart.points.push({
        x: firstPoint.x,
        y: firstPoint.y,
        className: pointClassName
      });
          
      // make end line
      lineEnd.points.push({
        x: lastPoint.x,
        y: lastPoint.y,
        className: pointClassName
      });
      lineEnd.points.push({
        x: lastPoint.x,
        y: lastPoint.y + lineLength + yHash[lpId]%2*lineLength, // stagger y's that are next to each other
        symbol: line.symbol,
        pointColor: line.color,
        pointRadius: pointRadiusLarge,
        className: pointClassName + ' symbol'
      });
      
      // add end lines
      endLines.push(lineStart, lineEnd);      
      
    });
    
    return endLines;
  },
  
  makeLegend: function(lines, options){    
    var // options
        canvasWidth = options.width,
        canvasPaddingX = options.padding[0],
        canvasPaddingY = options.padding[1],
        title = options.title,
        pointRadius = options.pointRadius,
        pointRadiusLarge = options.pointRadiusLarge,
        borderWidth = options.borderWidth,
        width = options.legend.width,
        columns = options.legend.columns,        
        padding = options.legend.padding,
        bgColor = options.legend.bgColor,
        titleFontSize = options.legend.titleFontSize,
        titleMaxLineChars = options.legend.titleMaxLineChars,
        titleLineHeight = options.legend.titleLineHeight,
        fontSize = options.legend.fontSize,
        lineHeight = options.legend.lineHeight,
        gridUnit = options.legend.gridUnit,
        // calculations
        columnWidth = Math.floor((width-padding*2)/columns),        
        titleLines = this.getTitleLines(title, titleMaxLineChars),        
        x1 = canvasWidth - width - canvasPaddingX - borderWidth*2,
        y1 = canvasPaddingY,
        lineCount = lines.length,
        height = padding *2 + lineHeight*Math.ceil(lineCount/columns) + titleLineHeight*titleLines.length,        
        // initializers       
        legend = {dots: [], labels: [], lines: [], rects: []};
    
    // break up lines into columns
    var columnLines = [],
        perColumn = Math.floor(lineCount/columns),
        remainder = lineCount%columns,
        lineIndex = 0;
    _.times(columns, function(i){
      var start = lineIndex,
          end = lineIndex+perColumn;
      // add remainder to first column
      if (i===0)  end += remainder;
      columnLines.push(
        lines.slice(start, end)
      );
      lineIndex = end;
    });
    
    // create rectangle
    legend.rects.push({
      width: width,
      height: height,
      rectX: x1,
      rectY: y1,
      pointColor: bgColor,
      type: "legend"
    });
    
    // add legend padding
    x1 += padding;
    y1 += padding;
    
    // add title
    _.each(titleLines, function(titleLine, i){
      legend.labels.push({
        text: titleLine,
        anchor: "start",
        labelX: x1,
        labelY: y1,
        fontSize: titleFontSize,
        type: "legendTitle"
      });
      y1 += titleLineHeight;
    });
    
    // add a space
    y1 += gridUnit;
    
    // loop through columns
    _.each(columnLines, function(columnLine, c){
      
      var colOffset = columnWidth * c,
          y2 = y1;
      
      // loop through lines
      _.each(columnLine, function(line, i){
        
        var lineClassName = helper.parameterize('line-'+line.label) + ' legend',
            pointClassName = helper.parameterize('point-'+line.label) + ' legend';
        
        // add symbol dot
        legend.dots.push({
          x: colOffset+x1+pointRadiusLarge, y: y2,
          pointColor: line.color,
          symbol: line.symbol,
          pointRadius: pointRadiusLarge,
          className: pointClassName
        });
        // add symbol label
        legend.labels.push({
          text: line.symbol,
          labelX: colOffset+x1+pointRadiusLarge,
          labelY: y2+1,
          symbol: line.symbol,
          className: pointClassName
        });
        
        // add line
        legend.lines.push({
          color: line.color,
          type: "legend",
          className: lineClassName,
          points: [
            {x: colOffset+x1+pointRadiusLarge*2, y: y2, className: pointClassName},
            {x: colOffset+x1+pointRadiusLarge*2+gridUnit*4, y: y2, className: pointClassName}
          ]
        });
        // add line dot
        legend.dots.push({
          x: colOffset+x1+pointRadiusLarge*2+gridUnit*2, y: y2,
          pointRadius: pointRadius,
          className: pointClassName
        });      
        // add line label
        legend.labels.push({
          text: line.label + " Line",
          labelX: colOffset+x1+pointRadiusLarge*2+gridUnit*5,
          labelY: y2,
          fontSize: fontSize,
          anchor: "start",
          type: "legend",
          className: pointClassName
        });
        
        y2+=lineHeight;
      });
      
      
    });
    
    return legend;
    
  },
  
  makeLines: function(stations, width, height, options){
    var that = this,
        // options
        paddingX = options.padding[0],
        paddingY = options.padding[1],
        colors = options.colors,
        pathTypes = options.pathTypes,
        offsetWidth = options.offsetWidth,        
        cornerRadius = options.cornerRadius,
        minXDiff = options.minXDiff,
        pointRadius = options.pointRadius,
        hubSize = options.hubSize,
        // calculations
        activeW = width - paddingX*2,
        activeH = height - paddingY*2,
        boundaries = {minX: paddingX, minY: paddingY, maxX: width-paddingX, maxY: height-paddingY},
        stationCount = stations.length,
        yUnit = Math.floor(activeH/stationCount),
        // initializers
        lines = [],
        prevLines = [];
    
    // ensure y-unit is 2 or more
    if (yUnit<2) yUnit = 2;
    
    // loop through stations
    _.each(stations, function(station, i){
      var nextY = paddingY + i * yUnit, // next available yUnit
          nextX = that.getNextX(boundaries, i, stationCount, activeW, minXDiff), // random x
          lineCount = station.lines.length,
          firstX = nextX;
          
      // loop through station's lines
      _.each(station.lines, function(lineLabel, j){
        // if line already exists
        var foundLine = _.findWhere(lines, {label: lineLabel}),
            prevPoint = false, 
            lineClassName = helper.parameterize('line-'+lineLabel) + " primary",
            pointClassName = helper.parameterize('point-'+lineLabel),
            newPoint;
        
        // retieve previous point
        if (foundLine) {
          prevPoint = _.last(foundLine.points); 
        }
        
        // if line is in previous lines, it will be straight
        if (prevLines.indexOf(lineLabel)>=0 && prevPoint) {
          nextX = prevPoint.x;
        
        // if line already exists, make sure X is within 20% of previous X
        } else if (prevPoint) {                   
          nextX = that.getNextX(boundaries, i, stationCount, activeW, minXDiff, prevPoint);
        }
        
        // init new point
        newPoint = {
          id: _.uniqueId('p'),
          x: nextX,
          y: nextY,
          lineLabel: lineLabel,
          pointRadius: pointRadius,
          className: pointClassName + " station"
        };
            
        // for first line, just add target point
        if (j===0) {
          firstX = newPoint.x;
          newPoint.label = station.label; // only the target point of the first line gets label
          newPoint.className += " primary";
          if (lineCount >= hubSize) {
            newPoint.hubSize = lineCount;
            newPoint.className += " hub";
          }          
          
        // for additional new lines, place first point next to the first line's target point plus offset
        } else {
          newPoint.x = firstX + j*offsetWidth;
          newPoint.className += " secondary";
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
            tp.className = pointClassName;
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
                symbol: that.getSymbol(lineLabel, lines),
                className: lineClassName,
                points: []            
              };         
          // add point to line, add line to lines
          newLine.points.push(newPoint);
          lines.push(newLine);
        }
        
      });
      
      prevLines = station.lines;     
    });
    
    // console.log(lines)
    
    return lines;
  },
  
  panZoom: function($selector){    
    var $panzoom = $selector.panzoom({
      $zoomIn: $('.svg-zoom-in'),
      $zoomOut: $('.svg-zoom-out')
    });    
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
  
  processStations: function(stations){
    var that = this,
        lineLabels = _.uniq( _.flatten( _.pluck(stations, 'lines') ) ); // get unique lines
    
    // loop through each point    
    _.each(stations, function(station, i){
      // sort all the lines consistently
      station.lines = _.sortBy(station.lines, function(lineLabel){ return lineLabels.indexOf(lineLabel); });
    });
    
    return stations;
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
