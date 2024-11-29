import fs from 'fs'
import { promisify } from 'util'
import { getBlockTitle } from '@texonom/nutils'
import type { ExtendedRecordMap } from '@texonom/ntypes'
import { loadRaw } from './notion'

const writeFile = promisify(fs.writeFile)

interface PageNode {
  id: string
  blocks: number
  pages: number
  children?: PageNode[]
}

async function main() {
  const { recordMap, pageTree } = await loadRaw('texonom-raw')

  // Generate treemap for page counts
  const treemapDataPages = computeMetrics(pageTree, recordMap, 'pages')
  const titlePages = 'Texonom PageMap'
  const outputPathPages = 'texonom-raw/page-treemap.html'
  await generateTreemapHTML(treemapDataPages, titlePages, outputPathPages)

  // Generate treemap for block counts
  const treemapDataBlocks = computeMetrics(pageTree, recordMap, 'blocks')
  const titleBlocks = 'Texonom BlockMap'
  const outputPathBlocks = 'texonom-raw/block-treemap.html'
  await generateTreemapHTML(treemapDataBlocks, titleBlocks, outputPathBlocks)

  console.info('Treemap HTML files generated successfully.')
}

interface TreemapNode {
  id: string
  name: string
  value: number
  children?: TreemapNode[]
}

function computeMetrics(pageTree: PageNode, recordMap: ExtendedRecordMap, metric: 'blocks' | 'pages'): TreemapNode | null {
  function recurse(node: PageNode): TreemapNode | null {
    const children = node.children ? node.children.map(recurse).filter((child): child is TreemapNode => child !== null) : []
    const block = recordMap.block[node.id]?.value
    const title = block ? getBlockTitle(block, recordMap) : 'Untitled'

    let nodeValue = node[metric] || 0

    // Sum the values of the children
    if (children.length > 0) {
      const childrenValue = children.reduce((sum, child) => sum + child.value, 0)
      if (nodeValue === 0) nodeValue = childrenValue
    }

    return {
      id: node.id,
      name: title,
      value: nodeValue,
      children: children.length > 0 ? children : undefined
    }
  }
  return recurse(pageTree)
}

async function generateTreemapHTML(data: TreemapNode, title: string, outputPath: string) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body {
    margin: 0;
    font-family: sans-serif;
  }
  .header {
    text-align: center;
    margin: 20px;
    font-size: 24px;
  }
  .chart {
    width: 100%;
    height: 70vh;
    margin: auto;
    position: relative;
  }
  .node rect {
    cursor: pointer;
    stroke: #fff;
    stroke-width: 1px;
  }
  .label {
    text-anchor: middle;
    dominant-baseline: central;
    fill: white;
    text-decoration: underline;
    cursor: pointer;
  }
  .count {
    text-anchor: middle;
    dominant-baseline: central;
    fill: lightgray;
  }
</style>
</head>
<body>
<div class="header">${title}</div>
<div id="chart" class="chart"></div>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script>
  var data = ${JSON.stringify(data)};

  var margin = {top: 20, right: 0, bottom: 0, left: 0},
      width = document.getElementById('chart').clientWidth,
      height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

  var formatNumber = d3.format(",d");

  var transitioning;

  var color = d3.scaleOrdinal(d3.schemePastel1);

  var x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);

  var y = d3.scaleLinear()
      .domain([0, height])
      .range([0, height]);

  var treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([width, height])
      .paddingInner(2)
      .round(false);

  var svg = d3.select("#chart").html("").append("svg")
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .style("font", "10px sans-serif")
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");

  var grandparent = svg.append("g")
      .attr("class", "grandparent");

  grandparent.append("rect")
      .attr("y", -20)
      .attr("width", width)
      .attr("height", 20)
      .attr("fill", '#bbbbbb');

  grandparent.append("text")
      .attr("x", 6)
      .attr("y", -6)
      .attr("dy", ".75em");

  var root = d3.hierarchy(data)
      .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.id; })
      .sum(function(d) { return d.value; })
      .sort(function(a, b) { return b.value - a.value; });

  treemap(root);

  display(root);

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    grandparent
        .datum(d.parent)
      .select("rect")
        .attr("fill", '#bbbbbb');

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d.children)
      .enter().append("g");

    g.filter(function(d) { return d.children; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d.children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .attr("fill", function(d) { return color(d.data.name); })
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
        .attr("fill", function(d) { return color(d.data.name); })
        .attr("rx", 8)
        .attr("ry", 8)
        .on("click", function(event, d) { 
          if (d.children) transition(d); 
          else window.open('https://texonom.com/' + d.data.id, '_blank'); 
        });

    g.append("text")
        .attr("class", "label")
        .attr("dy", ".75em")
        .attr("x", function(d) { return x(d.x0 + (d.x1 - d.x0) / 2); })
        .attr("y", function(d) { return y(d.y0 + (d.y1 - d.y0) / 2 - 10); })
        .text(function(d) { return d.data.name; })
        .style("font-size", function(d) {
          var boxWidth = x(d.x1) - x(d.x0);
          var size = Math.min(20, (boxWidth / d.data.name.length) * 4);
          return size + "px";
        })
        .on("click", function(event, d) {
          window.open('https://texonom.com/' + d.data.id, '_blank'); 
        });

    g.append("text")
        .attr("class", "count")
        .attr("x", function(d) { return x(d.x0 + (d.x1 - d.x0) / 2); })
        .attr("y", function(d) { return y(d.y0 + (d.y1 - d.y0) / 2 + 10); })
        .text(function(d) { return d.data.value; })
        .style("fill", "#888")
        .style("font-size", "12px");

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.on("end.remove", function() {
        g1.remove();
        transitioning = false;
      });
    }

    function text(text) {
      text.attr("x", function(d) { return x(d.x0 + (d.x1 - d.x0) / 2); })
          .attr("y", function(d) { return y(d.y0 + (d.y1 - d.y0) / 2 - 10); });
    }

    function rect(rect) {
      rect
          .attr("x", function(d) { return x(d.x0); })
          .attr("y", function(d) { return y(d.y0); })
          .attr("width", function(d) { return x(d.x1) - x(d.x0); })
          .attr("height", function(d) { return y(d.y1) - y(d.y0); })
          .attr("rx", 8)
          .attr("ry", 8);
    }

    return g;
  }

  function name(d) {
    return d.ancestors().reverse().map(function(d) { return d.data.name; }).join(" / ");
  }
</script>
</body>
</html>
  `

  await writeFile(outputPath, htmlContent, 'utf8')
}

main().catch(error => console.error(error))
