app.views.MapsAddView = Backbone.View.extend({

  el: 'body',

  initialize: function(options) {
    var points = options.points,
        width = options.width,
        height = options.height;
    
    points = this.processPoints(points);
    
    // generate lines with points
    var lines = this.generateLines(points, width, height, options);
    
    //this.drawSandbox();
    
    // draw the svg map
    this.drawMap(lines, width, height);
    this.initPanZoom($("#map-svg")); 
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
  
  drawSandbox: function(){
    var svg = d3.select("#svg-wrapper")
      .append("svg")
      .attr("id", "map-svg")
      .attr("width", 800)
      .attr("height", 600);

    var svg_line = d3.svg.line()
      // .interpolate("monotone")
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
      
    var svg_curve = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

    var path = svg.append("path")
      .attr("d", svg_line([{x: 10, y: 10},{x: 100, y: 10},{x: 200, y: 10}]))
      .style("stroke", "red")
      .style("stroke-width", 10)
      .style("stroke-linecap", "round")
      .style("stroke-linejoin", "round")
      .style("fill", "none");
      
    var path2 = svg.append("path")
      .attr("d", svg_curve([{x: 200, y: 10},{x: 300, y: 10},{x: 300, y: 110}]))
      .style("stroke", "red")
      .style("stroke-width", 10)
      .style("stroke-linecap", "round")
      .style("stroke-linejoin", "round")
      .style("fill", "none");
      
    var path3 = svg.append("path")
      .attr("d", svg_line([{x: 300, y: 110},{x: 300, y: 210},{x: 300, y: 310}]))
      .style("stroke", "red")
      .style("stroke-width", 10)
      .style("stroke-linecap", "round")
      .style("stroke-linejoin", "round")
      .style("fill", "none"); 

  },
  
  drawMap: function(lines, width, height){
    var svg = d3.select("#svg-wrapper")
      .append("svg")
      .attr("id", "map-svg")
      .attr("width", width)
      .attr("height", height);

    var svg_line = d3.svg.line()
      // .interpolate("monotone")
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
    
    var labels = [], dots = [];
    _.each(lines, function(line){
      // console.log(line.points)
      svg.append("path")
        .attr("d", svg_line(line.points))
        .style("stroke", line.color)
        .style("stroke-width", line.strokeWidth)
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .style("fill", "none");
      
      var line_labels = _.filter(line.points, function(p){ return p.label !== undefined; }),
          line_dots = _.filter(line.points, function(p){ return p.pointRadius && p.pointRadius > 0; });
      labels = _.union(labels, line_labels);
      dots = _.union(dots, line_dots);     
    });
    
    // add dots and labels
    svg.selectAll("dot")
        .data(dots)
        .enter().append("circle")
        .attr("r", function(d) { return d.pointRadius; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style("fill", function(d){ return d.pointColor; });
  },
  
  exportSVG: function(){    
    var svg_xml = $("#map-svg").parent().html(),
        b64 = window.btoa(svg_xml);
        
    data_url = "data:image/svg+xml;base64,\n"+b64;  
    window.open(data_url, '_blank');
    
    // $("body").append($("<img src='data:image/svg+xml;base64,\n"+b64+"' alt='file.svg'/>"));
  },
  
  generateLines: function(points, width, height, options){
    var that = this,
        // options
        paddingX = options.padding[0],
        paddingY = options.padding[1],
        colors = options.colors,
        pathTypes = options.pathTypes,
        strokeWidth = options.strokeWidth,
        pointRadius = options.pointRadius,
        pointColor = options.pointColor,
        minXDiff = options.minXDiff,
        // calculations
        activeW = width - paddingX*2,
        activeH = height - paddingY*2,
        boundaries = {minX: paddingX, minY: paddingY, maxX: width-paddingX, maxY: height-paddingY},
        pointCount = points.length,
        yUnit = Math.floor(activeH/pointCount),
        // initializers
        lines = [],
        colorIndex = 0;
    
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
        
        // if first line in group, it will be straight
        if (j===0 && lineCount>1 && prevPoint) {
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
          lineLabel: lineLabel
        };
            
        // for first line, just add target point
        if (j===0) {
          firstX = newPoint.x;
          newPoint.label = point.label; // only the target point of the first line gets label
          
        // for additional new lines, place first point next to the first line's target point plus offset
        } else {
          newPoint.x = firstX + j*strokeWidth;
        }
        
        // line already exists
        if (foundLine){
          var transitionPoints = [],
              lastPoint;          

          // retrieve transition points
          transitionPoints = that.getPointsBetween(prevPoint, newPoint, pathTypes);          
          
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
          var newLine = {
                label: lineLabel,
                color: colors[colorIndex].hex,
                strokeWidth: strokeWidth,
                points: []            
              };
          // add point to line, add line to lines
          newLine.points.push(newPoint);
          lines.push(newLine);
          // increment color index
          colorIndex++;
          if (colorIndex>=colors.length)
            colorIndex = 0;
        }
        
      });      
    });
    
    // console.log(lines)
    
    return lines;
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
  
  getPointsBetween: function(p1, p2, pathTypes) {
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
      
      // retrieve points
      var x = x1, y = y1,
          lengths = that.getLengths(xDiff, yDiff, directions);
      _.each(directions, function(direction, i){
        var point = that.translateCoordinates(x, y, direction, lengths[i]);
        x = point.x;
        y = point.y;
        point.id = _.uniqueId('p');
        point.direction1 = direction;
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
  
  getTextPosition: function(direction1, direction2) {
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
  
  processPoints: function(points){
    // sort all the lines consistently
    var lineLabels = _.uniq( _.flatten( _.pluck(points, 'lines') ) );    
    _.each(points, function(p){
      p.lines = _.sortBy(p.lines, function(lineLabel){ return lineLabels.indexOf(lineLabel); });
    });
    return points;
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
    return {
      x: x + length * x_direction,
      y: y + length * y_direction
    };
  }

});
