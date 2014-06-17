var MINI = require('minified');
var _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;
var reader = new FileReader();

// Array shuffler
Array.prototype.shuffle = function() {
  var curr = this.length;
  var temp;
  var rand;
  while (0 !== curr) {
    rand = Math.floor(Math.random() * curr);
    curr -= 1;
    temp = this[curr];
    this[curr] = this[rand];
    this[rand] = temp;
  }
  return this;
};

$(function() {

  // Cache teams template string
  var teamsTmpl   = '{{each}}<tr><td>{{this.id}}</td><td>{{this.text}}</td></tr>{{/each}}';

  // Cache matches template string
  var matchesTmpl = '{{each}}<tr><td>{{this.id}}</td><td>{{this.date.getDate()}}/{{this.date.getMonth() + 1}}</td><td>{{this.from}} vs. {{this.to}}</td><td>{{this.time}}</td><td>{{this.place}}</td></tr>{{/each}}';

  // Cache players template string
  var playersTmpl = '{{each}}<tr><td>{{this.name}}</td><td>{{this.teams.join("<br>")}}</td></tr>{{/each}}';

  // Cache load file template
  var loadTmpl    = HTML('<input type="file" id="load">');

  // Minified.js struggles to render tables using HTML(), so let's use raw JS
  $('#teams tbody')[0].innerHTML = _.format(teamsTmpl, data.countries);

  // Render fixtures into matches table
  $('#matches tbody')[0].innerHTML = _.format(matchesTmpl, data.matches);

  // One-way evented data binding on keyup
  $('#sweeps').on('keyup', function(ev) {

    $(document.getElementById('load')).replace(loadTmpl);

    // Filter empty lines from raw input
    var raw = this[0].value.split(/\n/).filter(function(e) {
      return (typeof e !== 'undefined' && e !== '');
    });

    // Map each player to its own JSON object to support team assignment
    data.players = raw.map(function(e) {
      return { 'name' : e, 'teams' : [] };
    });

    // Insert people into the sweepstakes players table
    $('#people tbody')[0].innerHTML = _.format(playersTmpl, data.players);

  });

  $('#rand').on('click', function(ev) {

    ev.preventDefault();

    // Create temporary assignment array
    var assignment = [];

    // Shuffle teams data
    var t = data.countries.shuffle();
    var p = data.players;

    // Exit if no competitors are added
    if(p.length <= 1) return alert("Please add some sweepstakes players.");

    // Exit if too many players are added
    if(p.length > t.length) return alert("Too many people, not enough teams to go 'round.");

    // Cut remainder off countries list
    var n = (t.length - (t.length % p.length)) / p.length;

    // Chunk teams array
    while (t.length > 0) {
      assignment.push(t.splice(0,n));
    }

    // Assign teams to players
    for(var i = 0; i < p.length; i++) {
      data.players[i].teams = assignment[i].map(function(e) {
        return e.text;
      });
    }

    // Re-render the players table with assignments
    $('#people tbody')[0].innerHTML = _.format(playersTmpl, data.players);

  });

  // Save JSON dump
  $('#save').on('click', function(ev) {
    if(data.players.length !== 0) {
      window.open("data:text/json;charset=utf-8," + JSON.stringify(data.players));
    } else {
      return alert("Please add assignments.");
    }
  });

  // Load JSON dump
  $('form').on('change', function(ev) {

    if(ev.target.id === 'load') {

      var f = ev.target.files[0];

      reader.readAsText(f);

      reader.onload = function() {

        $(document.getElementById('load')).replace(loadTmpl);

        try {
          data.players = JSON.parse(this.result);
        } catch(error) {
          throw new Error('JSON error: ' + error.message);
        }

        var p = data.players.map(function(e) {
          return e.name;
        });

        playersText = p.join("\n");

        $('#sweeps')[0].innerHTML = playersText;

        $('#people tbody')[0].innerHTML = _.format(playersTmpl, data.players);

      }

    }

  });

});