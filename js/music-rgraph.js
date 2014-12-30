$(function() {

    var w = 600,
        h = 600,
        node,
        link,
        labels,
        root,
        linkIndexes,
        nodeSize;

    function tick(e) {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        
        node.attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });

        labels.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    }

        // function color(d) {
            // return '#c6dbef';
        // return (d.group === '1') ? '#3182bd' : '#c6dbef';
        // return color(d.group);
    // }

 //ED: Setting color variable
        var color = d3.scale.category10();





    // Added this to better control the fill color of the nodes
    //var color = d3.scale.category20();

    // function songsTypeSize(d) {
    //     var s;
    //     // if (d.type === 'g') {
    //     //     s = d.count / root.maxGenreSongs;
    //     // } else {
    //     //     s = d.count / root.maxArtistSongs;
    //     // }
    //     s = d.count / 800;
    //     return s;
    // }

    function nodeSize(d) {
        var s;
        // s = d.count / 800;
        s = d.ft / 12;
        return s;
    }

    // function playsTypeSize(d) {
    //     var s;
    //     if (d.type === 'g') {
    //         s = d.plays / root.maxGenrePlays;
    //     } else {
    //         s = d.plays / root.maxArtistPlays;
    //     }
    //     return s;
    // }
    // typeSize = songsTypeSize;

    // function radius(d) {
    //     var r = typeSize(d);
    //     if (d.type === 'g') {
    //         r = Math.max(r * 40, 4);
    //     } else {
    //         r = Math.max(r * 25, 2);
    //     }
    //     return r;
    // }

    function radius(d) {
        var r = nodeSize(d);
        r = Math.max(r * 15, 1);
        return r;
    }

    function charge(d, i) { 
        var r = nodeSize(d);
        return -r * 100;
    }

    // Originally, the code considers the nodes "connected" whenever there's a link. Anything "connected" will
    // not fade out. Therefore, it will display nodes where the mouseover artist was the primary artist of a song
    // that other artists were featured in. That's not what we want. We only want "connected" to be true when
    // the mouseover artist was the featured artist on someone else's primary track.  

    function isConnected(a, b) {
        return linkIndexes[a.index + ',' + b.index] || a.index == b.index;
    }

    function fade(bo) {
        return function(d) {
            var opacity = bo ? 0.2 : 1;

            var rad = radius(d);
node.style('stroke-opacity', function(o) {
                thisOpac = isConnected(d, o) ? 1 : opacity;
              this.setAttribute('fill-opacity', thisOpac);
               return thisOpac;
           });



             node.style("fill", function(d) { return color(d.group); 
            });

            // Changed this below to only fade-in links where mouseover node is the target
            link.style('stroke-opacity', function(o) {
                // return o.source === d || o.target === d ? 1 : opacity;
               return o.target === d ? 1 : opacity;
            });


            labels.select('text.label').remove();
            node.select('title').remove();

            if (bo) {
                labels.filter(function(o) {
                        // Changed this below to only fade-in links where mouseover node is the target
                        // return isConnected(o, d);
                        return isConnected(d, o);
                    })
                    .append('svg:text')
                    .attr('y', function(o) {
                            return (o == d) ? (rad + 10) + 'px' : '5px';
                        })
                    //This controls the color of the text labels for connections on fade-in
                    .style('fill', '#C17021')
                    .attr('text-anchor', 'middle')
                    .attr('class', 'label')
                    .text(function(o) { return (o !== d) ? o.name.substr(0, 16) : ''; });

                node.filter(function(o) {
                        return o === d;
                    })
                    .append('title')
                    // .text(function(o) { return o.name + ' / Songs: ' + o.count + ' / Plays: ' + o.plays; });
                    .text(function(o) { return o.name + ' / Featured Tracks: ' + o.ft; });
            }
        };
    }
        //LINK DISTANCE
    var force = d3.layout.force()
        .on('tick', tick)
        .size([w, h])
        .linkDistance(10)
        //.gravity(0.05)
        .charge(charge);

    var vis = d3.select('#chart').append('svg:svg')
        .attr('width', w)
        .attr('height', h);

    function update() {
        // Restart the force layout
        force
            .nodes(root.nodes)
            .links(root.links)
            .start();

        // Update the links
        link = vis.selectAll('link.link')
            .data(root.links);

        // Enter any new links
        link.enter().append('svg:line')
            .attr('class', 'link')
            .attr('source', function(d) { return d.source; })
            .attr('target', function(d) { return d.target; })
            //.style('stroke-width', function(d) { return Math.sqrt(d.value); });
            // .style('stroke-width', 3);

        // Exit any old links
        link.exit().remove();

        // Update the nodes
        node = vis.selectAll('circle.node')
            .data(root.nodes);

       
            
        // Enter any new nodes
        node.enter().append('svg:circle')
            .attr('class', 'node')
            // .attr('id', function(d) {
            //         return d.type + d.id;
            //     })
            // .style('fill', color)
            .style('fill', '#3182bd')
            //.style('fill', function(d) { return color(d.group); })
            .attr('r', radius)
            .on('mouseover', fade(true))
            .on('mouseout', fade(false))
            .call(force.drag);

        // Exit any old nodes
        node.exit().remove();

        // Build fast lookup of links
        linkIndexes = {};
        root.links.forEach(function(d) {
            // This controls which other nodes get fade-in. But doesn't alone impact the links fade in/out.
            // Changed this below to only fade-in links where mouseover node is the target.
            // linkIndexes[d.source.index + ',' + d.target.index] = 1;
            linkIndexes[d.target.index + ',' + d.source.index] = 1;
        });

        // Build labels
        labels = vis.selectAll('g.labelParent')
            .data(root.nodes);

        labels.enter().append('svg:g')
            .attr('class', 'labelParent');

        labels.exit().remove();

        // Init fade state
        node.each(fade(false));

        // Button toggles
        // $('#songsBtn').click(function() {
        //     force.stop();

        //     typeSize = songsTypeSize;

        //     vis.selectAll('circle.node')
        //         .attr('r', radius);

        //     force.charge(charge).start();

        //     $(this).addClass('active');
        //     $('#playsBtn').removeClass('active');
        //     return false;
        // });
        // $('#playsBtn').click(function() {
        //     force.stop();

        //     typeSize = playsTypeSize;
            
        //     vis.selectAll('circle.node')
        //         .attr('r', radius);

        //     force.charge(charge).start();

        //     $(this).addClass('active');
        //     $('#songsBtn').removeClass('active');
        //     return false;
        // });

    }

    // Load the json data
    d3.json('js/music-data.json', function(json) {
        root = json;
        update();
    });

});
