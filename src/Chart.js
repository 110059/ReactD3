import React from 'react';
import * as d3 from 'd3';

class LineChart extends React.Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
        this.createChart = this.createChart.bind(this);
    }

    componentDidMount() {
      this.createChart();
    }

    createChart() {
      let svg = d3.select(this.chartRef.current),
      margin = {top: 20, right: 100, bottom: 30, left: 40},
      widthA = 960, heightA = 500,
      width = widthA - margin.left - margin.right,
      height = heightA - margin.top - margin.bottom;

      let bisectCategory = d3.bisector(function(d) { return d.category; }).left;

      let x = d3.scaleLinear().range([0, width]);
      let y = d3.scaleLinear().range([height, 0]);

      let line = d3.line()
          .x(function(d) { return x(d.category); })
          .y(function(d) { return y(d.percentage); });

      let g = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");   

      d3.json("data.json", function(error, res) {
          if (error) throw error;
          let data = [];
          const total = res.reduce((acc, curr) => {
              return acc + curr.value;
          }, 0);

          res.forEach(function(d) {
            let categoryFound = data.findIndex(x => x.category === d.category);
          if(categoryFound !== -1) {
            data[categoryFound].user = data[categoryFound].user + ", " + d.user;
            data[categoryFound].value = data[categoryFound].value + d.value;
            data[categoryFound].category = d.category;
            data[categoryFound].percentage =  parseInt((data[categoryFound].value/total) * 100);
            
          } else {
            data.push({
              user: d.user,
              value: d.value,
              category: d.category,
              percentage: parseInt((d.value/total) * 100)
            })
          
          }
          
      });
    
      console.log(data);

      x.domain([0, d3.max(data, function(d) { return d.category; })]);
      
      y.domain([0, 100]);

      g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10).tickFormat(function(d) { return d + "%"; }))
        .append("text")
          .attr("class", "axis-title")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .attr("fill", "#5D6971")
          .text("Percentage");
      
    g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat("")
        );

      g.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

      var focus = g.append("g")
          .attr("class", "focus")
          .style("display", "none");

      focus.append("line")
          .attr("class", "x-hover-line hover-line")
          .attr("y1", 0)
          .attr("y2", height);

      focus.append("line")
          .attr("class", "y-hover-line hover-line")
          .attr("x1", 0)
          .attr("x2", width);

      focus.append("circle")
          .attr("r", 7.5);

      focus.append("text")
          .attr("x", 15)
          .attr("dy", ".31em");

      svg.append("rect")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove);

      function mousemove() {
        let x0 = x.invert(d3.mouse(this)[0]),
            i = bisectCategory(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.category > d1.category - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.category) + "," + y(d.percentage) + ")");
        focus.select("text").text(function() { return "Name: " + d.user; });
        focus.select(".x-hover-line").attr("y2", height - y(d.percentage));
        focus.select(".y-hover-line").attr("x2", width);
      }
  });

    }

    render() {
        return <svg width="960" height="500" ref={this.chartRef} ></svg>
               
    }
}

export default LineChart;