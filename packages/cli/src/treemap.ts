import fs from 'fs'
import { promisify } from 'util'

export interface PageNode {
  id: string
  blocks: number
  pages: number
  title: string
  children?: PageNode[]
}

const writeFile = promisify(fs.writeFile)

export async function generateTreemaps(folder: string, pageTree: PageNode) {
  const treemapDataPages = computeMetrics(pageTree, 'pages')
  const titlePages = 'Texonom PageTree'
  const outputPathPages = `${folder}/pagetree.html`
  await generateTreemapHTML(treemapDataPages, titlePages, outputPathPages)

  const treemapDataBlocks = computeMetrics(pageTree, 'blocks')
  const titleBlocks = 'Texonom BlockMap'
  const outputPathBlocks = `${folder}/blocktree.html`
  await generateTreemapHTML(treemapDataBlocks, titleBlocks, outputPathBlocks)
}

interface TreemapNode {
  id: string
  name: string
  value: number
  children?: TreemapNode[]
}

function computeMetrics(pageTree: PageNode, metric: 'blocks' | 'pages'): TreemapNode | null {
  function recurse(node: PageNode): TreemapNode | null {
    const children = node.children ? node.children.map(recurse).filter((child): child is TreemapNode => child !== null) : []
    let nodeValue = node[metric] || 0

    // Sum the values of the children
    if (children.length > 0) {
      const childrenValue = children.reduce((sum, child) => sum + child.value, 0)
      if (nodeValue === 0) nodeValue = childrenValue
    }

    // Exclude nodes with zero value
    if (nodeValue <= 0) return null

    return {
      id: node.id,
      name: node.title,
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
    background-color: #202229;
  }
  .header {
    text-align: center;
    margin: 20px;
    font-size: 24px;
    color: white;
  }
  .breadcrumb {
    text-align: center;
    margin: 10px;
    font-size: 16px;
    color: white;
  }
  .current-title {
    text-align: center;
    margin: 10px;
    font-size: 18px;
    color: white;
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
    rx: 8;
    ry: 8;
  }
  .label {
    text-anchor: middle;
    fill: white;
    text-decoration: underline;
    cursor: pointer;
  }
  .count {
    text-anchor: middle;
    fill: lightgray;
  }
</style>
</head>
<body>
<div class="header">${title}</div>
<div class="breadcrumb" id="breadcrumb"></div>
<div class="current-title" id="current-title"></div>
<div class="chart" id="chart"></div>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script>
  var data = ${JSON.stringify(data)};

  var margin = {top: 20, right: 0, bottom: 0, left: 0},
      width = document.getElementById('chart').clientWidth,
      height = document.getElementById('chart').clientHeight;

  var color = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4, 5])
      .range(["#465881", "#5f6d96", "#7882ab", "#9197c0"]);

  var x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);

  var y = d3.scaleLinear()
      .domain([0, height])
      .range([0, height]);

  var treemapLayout = d3.treemap()
      .size([width, height])
      .paddingInner(2)
      .round(false);

  var root = d3.hierarchy(data)
      .sum(function(d) { return d.value; })
      .sort(function(a, b) { return b.value - a.value; });

  treemapLayout(root);

  var svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("font", "10px sans-serif")
      .style("position", "relative");

  display(root);

  function display(d) {
    var currentDepth = d.depth;

    // Update breadcrumb
    var breadcrumb = d.ancestors().reverse().map(function(d) {
      return '<span class="breadcrumb-item" data-id="' + d.data.id + '">' + d.data.name + '</span>';
    }).join(' / ');
    document.getElementById('breadcrumb').innerHTML = breadcrumb;

    // Add click events to breadcrumb
    var breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
    breadcrumbItems.forEach(function(item) {
      item.addEventListener('click', function(event) {
        var id = event.target.getAttribute('data-id');
        var node = findNodeById(root, id);
        if (node) {
          zoom(node);
        }
      });
    });

    // Update current title
    document.getElementById('current-title').innerText = d.data.name;

    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    var nodes = d.descendants().filter(function(node) {
      return node.depth - currentDepth <= 1 && node.depth >= currentDepth;
    });

    svg.selectAll(".node").remove();

    var cell = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.y0) + ")"; })
        .on("click", function(event, d) {
          if (d.children) {
            zoom(d);
          } else {
            window.open('https://texonom.com/' + d.data.id, '_blank');
          }
          event.stopPropagation();
        });

    cell.append("rect")
        .attr("id", function(d) { return d.data.id; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .attr("height", function(d) { return y(d.y1) - y(d.y0); })
        .attr("fill", function(d) { return color(d.depth); })
        .attr("rx", 8)
        .attr("ry", 8);

    cell.append("text")
        .attr("class", "label")
        .attr("x", function(d) { return (x(d.x1) - x(d.x0)) / 2; })
        .attr("y", function(d) { return (y(d.y1) - y(d.y0)) / 2; })
        .text(function(d) { return d.data.name; })
        .style("font-size", function(d) {
          var boxArea = (x(d.x1) - x(d.x0)) * (y(d.y1) - y(d.y0));
          var size = Math.max(10, Math.min(30, Math.sqrt(boxArea) / 5));
          return size + "px";
        })
        .on("click", function(event, d) {
          window.open('https://texonom.com/' + d.data.id, '_blank');
          event.stopPropagation();
        });

    cell.append("text")
        .attr("class", "count")
        .attr("x", function(d) { return (x(d.x1) - x(d.x0)) / 2; })
        .attr("y", function(d) { return (y(d.y1) - y(d.y0)) / 2 + 20; })
        .text(function(d) { return d.data.value; })
        .style("fill", "lightgray")
        .style("font-size", "0.8rem");
  }

  function zoom(d) {
    var currentDepth = d.depth;

    // Update breadcrumb
    var breadcrumb = d.ancestors().reverse().map(function(d) {
      return '<span class="breadcrumb-item" data-id="' + d.data.id + '">' + d.data.name + '</span>';
    }).join(' / ');
    document.getElementById('breadcrumb').innerHTML = breadcrumb;

    // Add click events to breadcrumb
    var breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
    breadcrumbItems.forEach(function(item) {
      item.addEventListener('click', function(event) {
        var id = event.target.getAttribute('data-id');
        var node = findNodeById(root, id);
        if (node) {
          zoom(node);
        }
      });
    });

    // Update current title
    document.getElementById('current-title').innerText = d.data.name;

    var t = svg.transition()
        .duration(750);

    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    var nodes = d.descendants().filter(function(node) {
      return node.depth - currentDepth <= 1 && node.depth >= currentDepth;
    });

    var cell = svg.selectAll(".node")
        .data(nodes, function(d) { return d.data.id; });

    cell.exit().remove();

    var cellEnter = cell.enter().append("g")
        .attr("class", "node")
        .on("click", function(event, d) {
          if (d.children) {
            zoom(d);
          } else {
            window.open('https://texonom.com/' + d.data.id, '_blank');
          }
          event.stopPropagation();
        });

    cellEnter.append("rect")
        .attr("id", function(d) { return d.data.id; })
        .attr("fill", function(d) { return color(d.depth); })
        .attr("rx", 8)
        .attr("ry", 8);

    cellEnter.append("text")
        .attr("class", "label")
        .style("fill", "white")
        .on("click", function(event, d) {
          window.open('https://texonom.com/' + d.data.id, '_blank');
          event.stopPropagation();
        });

    cellEnter.append("text")
        .attr("class", "count")
        .style("fill", "lightgray")
        .style("font-size", "0.8rem");

    cell = cellEnter.merge(cell);

    cell.transition(t)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.y0) + ")"; });

    cell.select("rect").transition(t)
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .attr("height", function(d) { return y(d.y1) - y(d.y0); });

    cell.select(".label").transition(t)
        .attr("x", function(d) { return (x(d.x1) - x(d.x0)) / 2; })
        .attr("y", function(d) { return (y(d.y1) - y(d.y0)) / 2; })
        .text(function(d) { return d.data.name; })
        .style("font-size", function(d) {
          var boxArea = (x(d.x1) - x(d.x0)) * (y(d.y1) - y(d.y0));
          var size = Math.max(10, Math.min(30, Math.sqrt(boxArea) / 5));
          return size + "px";
        });

    cell.select(".count").transition(t)
        .attr("x", function(d) { return (x(d.x1) - x(d.x0)) / 2; })
        .attr("y", function(d) { return (y(d.y1) - y(d.y0)) / 2 + 20; })
        .text(function(d) { return d.data.value; });
  }

  function findNodeById(node, id) {
    if (node.data.id === id) {
      return node;
    }
    if (node.children) {
      for (var child of node.children) {
        var result = findNodeById(child, id);
        if (result) return result;
      }
    }
    return null;
  }
</script>
</body>
</html>
  `

  await writeFile(outputPath, htmlContent, 'utf8')
}
