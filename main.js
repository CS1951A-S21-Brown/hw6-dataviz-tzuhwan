// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 100, bottom: 40, left: 175 };

// https://observablehq.com/@d3/bubble-chart
// https://observablehq.com/@unkleho/covid-19-bubble-chart-with-d3-render
// https://www.d3-graph-gallery.com/graph/lollipop_ordered.html
// https://cs1951a-s21-brown.github.io/assignments/data_viz/data_viz.html

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = MAX_WIDTH / 2 - 10,
  graph_1_height = 500;
let graph_2_width = MAX_WIDTH / 2 - 10,
  graph_2_height = 500;
let graph_3_width = MAX_WIDTH / 2,
  graph_3_height = 700;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 1ST GRAPH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let svg1 = d3
  .select("#graph1")
  .append("svg")
  .attr("height", graph_1_height) // HINT: width
  .attr("width", graph_1_width) // HINT: height
  .append("g")
  .style("text-align", "center")
  .attr("transform", `translate(${margin.left + 60}, ${margin.top - 10})`);

// Set up reference to count svg1 group
let countRef1 = svg1.append("g");

NUM_EXAMPLES = 30;

// read the data
d3.csv("./data/netflix.csv").then(function (data) {
  data = d3
    .nest()
    .key(function (d) {
      return d["listed_in"];
    })
    .rollup(function (v) {
      return v.length;
    })
    .entries(data)
    .filter((d) => {
      return d.key.indexOf(",") == -1;
    })
    .sort((a, b) => a.value - b.value)
    .reverse()
    .slice(0, NUM_EXAMPLES);

  let x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return d.value;
      })
    )
    .range([0, graph_1_width - margin.left - margin.right]);

  svg1
    .append("g")
    .attr(
      "transform",
      `translate(0,${graph_1_height - margin.top - margin.bottom})`
    )
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("font-size", "14px")
    .style("text-anchor", "end");

  let y = d3
    .scaleBand()
    .range([0, graph_1_height - margin.bottom - margin.top])
    .domain(
      data.map(function (d) {
        return d.key;
      })
    )
    .padding(0.3);
  svg1
    .append("g")
    .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
    .style("font-size", "14px");

  let bars = svg1.selectAll("rect").data(data);

  let color = d3
    .scaleOrdinal()
    .domain(
      data.map(function (d) {
        return d.key;
      })
    )
    .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

  bars
    .enter()
    .append("rect")
    .merge(bars)
    .attr("fill", function (d) {
      return color(d.key);
    })
    .attr("x", 0)
    .attr("y", function (d) {
      return y(d.key);
    })
    .attr("width", function (d) {
      return x(d.value);
    })
    .attr("height", y.bandwidth());

  let counts = countRef1.selectAll("text").data(data);

  // TODO: Render the text elements on the DOM
  counts
    .enter()
    .append("text")
    .merge(counts)
    .attr("x", function (d) {
      return x(d.value) + 3;
    })
    .attr("y", function (d) {
      return y(d.key) + 10;
    })
    .style("text-anchor", "start")
    .text(function (d) {
      return d.value;
    });

  // Add x-axis label
  svg1
    .append("text")
    .attr(
      "transform",
      `translate(${margin.left}, ${graph_1_height - margin.bottom + 5})`
    )
    .style("text-anchor", "middle")
    .text("Number of Netflix Shows");

  // TODO: Add chart title
  svg1
    .append("text")
    .attr("class", "title")
    .attr("transform", `translate(${margin.left}, ${margin.top - 50})`)
    .style("text-anchor", "middle")
    .text("Top 20 Genres on Netflix");
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 2ND GRAPH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let svg2 = d3
  .select("#graph2")
  .append("svg")
  .attr("height", graph_2_height) // HINT: width
  .attr("width", graph_2_width) // HINT: height
  .append("g")
  .attr("margin", "0, auto")
  .attr("text-align", "center")
  .attr("transform", `translate(${margin.left}, ${margin.top - 10})`);

// Set up reference to count svg2 group
let countRef = svg2.append("g");

// TODO: Add y-axis label
svg2
  .append("text")
  .attr("transform", `translate(${-80}, ${graph_2_height / 2})`)
  .style("text-anchor", "middle")
  .text("Year")
  .style("font-size", "15px");

// TODO: Add x-axis label
svg2
  .append("text")
  .attr(
    "transform",
    `translate(${margin.left}, ${graph_2_height - margin.bottom + 5})`
  )
  .style("text-anchor", "middle")
  .style("font-size", "15px")
  .text("Average Movie Duration(in minutes)");

// TODO: Add chart title
// svg2
//   .append("text")
//   .attr("class", "title")
//   .attr("transform", `translate(${margin.left}, ${margin.top - 50})`)
//   .style("text-anchor", "middle")
//   .text("Average length of Movies on Netflix");

let x = d3.scaleLinear().range([0, graph_2_width - margin.left - margin.right]);

let y = d3.scaleBand().range([0, graph_2_height - margin.bottom - margin.top]);

function setData(order) {
  d3.selectAll("#myLines").remove();
  d3.selectAll("#myCircles").remove();
  d3.select("#y-axis").remove();
  d3.select("#x-axis").remove();
  // // clean up the chart before re-render

  d3.csv("./data/netflix.csv", function (d) {
    return { type: d.type, release_year: d.release_year, duration: d.duration };
  }).then(function (data) {
    data = data
      .filter((d) => d["type"] == "Movie")
      .map((d) => {
        d["duration"] = parseInt(d["duration"].split(" ")[0]);
        return d;
      })
      .filter((d) => {
        return d["release_year"] % 5 == 0;
      });

    data = d3
      .nest()
      .key(function (d) {
        return d["release_year"];
      })
      .entries(data)
      .map((d) => {
        let average = 0;
        let values = d.values;
        values.forEach((v) => {
          average += v.duration;
        });
        average = average / values.length;
        d.values = average;
        return d;
      });
    if (order == "year") {
      data = data.sort((a, b) => a.key - b.key).reverse();
    } else if (order == "ascending") {
      data = data.sort((a, b) => a.values - b.values);
    } else {
      data = data.sort((a, b) => a.values - b.values).reverse();
    }

    // X axis: Average Movie Length
    x.domain(
      d3.extent(data, function (d) {
        return d.values;
      })
    );
    svg2
      .append("g")
      .attr("id", "x-axis")
      .attr(
        "transform",
        `translate(0,${graph_2_height - margin.top - margin.bottom})`
      )
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("font-size", "14px")
      .style("text-anchor", "end");

    // Y axis: Genres
    y.domain(
      data.map(function (d) {
        return d.key;
      })
    ).padding(1);
    svg2
      .append("g")
      .attr("id", "y-axis")
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .style("font-size", "14px");

    // Lines
    svg2
      .selectAll("myline")
      .data(data)
      .enter()
      .append("line")
      .attr("id", "myLines")
      .attr("x1", function (d) {
        return x(d.values);
      })
      .attr("x2", 0)
      .attr("y1", function (d) {
        return y(d.key);
      })
      .attr("y2", function (d) {
        return y(d.key);
      })
      .attr("stroke", "grey");

    // Circles
    svg2
      .selectAll("mycircle")
      .data(data)
      .enter()
      .append("circle")
      .attr("id", "myCircles")
      .attr("cx", function (d) {
        return x(d.values);
      })
      .attr("cy", function (d) {
        return y(d.key);
      })
      .attr("r", "3")
      .style("fill", "#69b3a2")
      .attr("stroke", "black");

    let counts = countRef.selectAll("text").data(data);

    // Add text beside the bubble
    counts
      .enter()
      .append("text")
      .merge(counts)
      .attr("x", function (d) {
        return x(d.values) + 5;
      })
      .attr("y", function (d) {
        return y(d.key) + 4;
      })
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .text(function (d) {
        return `${d.values.toFixed(2)} mins`;
      });
  });
}

setData("year");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 3RD GRAPH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
A network graph that has actors as nodes and movies that both appear in as links 
Data requirement: 
Columns: type, title, cast, release_year, country 
A list of actor nodes with id and names 
A list of movie links with actor src and dst, movie title

*/

let svg3 = d3
  .select("#graph3")
  .append("svg")
  .attr("id", "svg-3")
  .append("g")
  .attr("margin", "0, auto")
  .attr("text-align", "center");

// Set up reference to count svg3 group
let countRef3 = svg2.append("g");

const findActorId = (name, nodes) => {
  let id = 0;
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].name == name) {
      id = nodes[i].id;
    }
  }
  return id;
};

d3.csv("./data/netflix.csv", function (d) {
  return {
    type: d.type,
    title: d.title,
    cast: d.cast,
    release_year: d.release_year,
    country: d.country,
    genre: d.listed_in,
  };
}).then(function (data) {
  data = data.filter(
    (d) =>
      d["type"] == "Movie" &&
      d.release_year == "2018" &&
      d.country == "United States" &&
      d.genre.includes("Dramas")
  );

  console.log(data);

  nodes = [];
  links = [];

  // populate nodes list
  var a = 0;
  for (var i = 0; i < data.length; i++) {
    let cast = data[i].cast.split(",");

    for (var j = 0; j < cast.length; j++) {
      // add actor into actors array
      // let actor = { id: a, name: cast[j].trim() };
      nodes.push({ id: a, name: cast[j].trim() });
      a++;
    }
  }

  for (var i = 0; i < data.length; i++) {
    let cast = data[i].cast.split(",");
    for (var j = 0; j < cast.length - 1; j++) {
      for (var k = j + 1; k < cast.length; k++) {
        let link = {
          title: data[i].title,
          source: findActorId(cast[j].trim(), nodes),
          target: findActorId(cast[k].trim(), nodes),
        };
        links.push(link);
      }
    }
  }

  links = [...new Set(links)];

  // Define the div for the tooltip
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("padding", "2px")
    .style("border", "1px solid black")
    .style("font-size", "16px")
    .style("opacity", 1);

  // create a tooltip
  var Tooltip = d3
    .select("#graph_3")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  var node = svg3
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", 7)
    .attr("fill", "#e63946")
    // .on("mouseover", mouseover)
    .on("mouseover", function (d) {
      d3.select(this).style("stroke", "#1d3557").style("opacity", 1);
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(`Actor: ${d.name}`)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseleave", function (d) {
      Tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none").style("opacity", 0.8);
    });

  var simulation = d3
    .forceSimulation()
    //add nodes
    .nodes(nodes);

  simulation
    .force("charge_force", d3.forceManyBody().strength(-40))
    .force("forceX", d3.forceX(20))
    .force("forceY", d3.forceY(20))
    .force("center_force", d3.forceCenter(graph_3_width, graph_3_height / 1.5));

  simulation.on("tick", tickActions);

  var link_force = d3.forceLink(links).id(function (d) {
    return d.id;
  });

  simulation.force("links", link_force);

  var link = svg3
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke", "#a8dadc")
    .attr("stroke-width", 1)
    .on("mouseover", function (d) {
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(`Movie: ${d.title}`)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(500).style("opacity", 0);
    });

  function tickActions() {
    //update circle positions each tick of the simulation
    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });

    //update link positions
    //simply tells one end of the line to follow one node around
    //and the other end of the line to follow the other node around
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
  }
});
