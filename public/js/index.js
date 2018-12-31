/* eslint-disable */
var categories = ['overall', 'fun', 'theme', 'innovation', 'humor', 'graphics', 'audio', 'mood'];
var builtTabs = [];
var author, rates, positions;

$(function(){
  attachEvents();
});

function attachEvents(){

  $('.loading').hide();
  $('.tabs-ctn, .tabs').hide();

  $('.tabs a').on('click', function(){
    var tab = $(this).attr('data-tab');
    $('.tab-content.active, .tabs a.active').removeClass('active');
    $('.tab-content.' + tab).add(this).addClass('active');
    buildTab(tab);
  });

  function updateShares(author, username){
    var twLink = 'https://twitter.com/intent/tweet?url=https%3A%2F%2Fldstats.info%2F{{author}}%2F{{username}}&hashtags=ldstats&text=Checkout+my+LudumDare+Stats';
    var fbLink = 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fldstats.info%2F{{author}}%2F{{username}}&t=Checkout+my+LudumDare+Stats';
    var gpLink = 'https://plus.google.com/share?url=https%3A%2F%2Fldstats.info%2F{{author}}%2F{{username}}';

    function setLink(at, link) {
      $(at).attr('href', link.replace('{{author}}', author).replace('{{username}}', username));
    }

    setLink('.zocial.icon.twitter', twLink);
    setLink('.zocial.icon.facebook', fbLink);
    setLink('.zocial.icon.googleplus', gpLink);
  }

  function onFetch(atURL){
    var author = $('#author').val();
    var username = $('#username').val();

    if (author.trim().length || username.trim().length) {
      if (!atURL && window.history && window.history.pushState){
        window.history.pushState(null, null, "/" + author + "/" + username.trim());
      }

      updateShares(author, username);

      $('.loading').show();
      clearView();
      fetchAuthor(author.trim(), username.trim());
    }
  }

  $('#fetch').on('click', function() {
    onFetch()
  })
  $('#username,#author').on('keyup', function(e){
    if (e.keyCode === 13) onFetch();
  });

  if (window.run_author || window.run_username){
    $('#author').val(window.run_author || '');
    $('#username').val(window.run_username || '');
    onFetch(true);
  }
}

function clearView(){
  window.builtTabs = [];
  $('.ct-chart-rates, .rates-data, .position-data, .categories').empty();
}

function fetchAuthor(author, username){
  $('.not-found').hide();
  $('.tabs-ctn, .tabs').hide();

  $.get('/api/authors/' + author + (username ? '/plus/' + username : ''))
    .done(function(author){
      $('.tabs-ctn, .tabs').show();

      window.author = author;
      window.rates = getData(categories.concat(["average"]), "scores");
      window.positions = getData(categories.concat(["total"]), "ranking");
      window.percents = getData(categories, "percents");

      var curr = $('.tabs a.active').attr('data-tab');
      buildTab(curr);
    })
    .fail(function() {
      $('.not-found').show();
    })
    .always(function() {
      $('.loading').hide();
    });
}

function buildTab(tab){
  if (builtTabs.indexOf(tab) === -1){

    switch (tab) {
      case "rates":
        buildRatesChart(window.rates);
        break;
      case "data":
        createDataTable('#rates-data', categories.concat(["average"]), window.rates, function(value){
          if (value >= 4){
            return '<td class="highlight">'+value+'</td>';
          }
        });
        break;
      case "standings":
        buildPositionsChart(window.positions);
        break;
      case "podium":
        createDataTable('#position-data', categories.concat(["total"]), window.positions, function(value){
          if (value > 0 && value <= 100){
            if (value < 4){
              return '<td class="highlight top-'+value+'"><div title="TOP '+value+'"></div></td>';
            }
            return '<td class="highlight">'+value+'</td>';
          }
        });
        break;
      case "percents":
        createDataTable('#percents-data', categories, window.percents, function(value){
          if (value > 0 && value < 10) {
            return '<td class="highlight">'+value+'</td>';
          }
        });
        break;
      case "coolness":
        createDataTable('#coolness-data', ['coolness'], window.author.entries);
        break;
      case "cards":
        createCardsSection(window.author);
        break;
    }

    builtTabs.push(tab);
  }
}

function getData(categories, field) {
  return _.map(_.cloneDeep(window.author.entries), function(entry, i){

    var en = {
      ludum: entry.ludum,
      title: entry.title,
      link: entry.link,
      type: entry.type,
    };

    function getValue(name){
      return entry[field] && entry[field][name] || 0;
    }

    categories.forEach(function(category){
      var value = getValue(category);
      en[category] = value;
    });

    return en;
  });
}

function createDataTable(id, columns, entries, onCellValue, sort){
  sort = sort || { dir: 'asc', col: 'ludum' };
  var $table = $(id).empty();

  var _cols = '';
  _.times(columns.length+2, function(i){ _cols += '<colgroup/>'; })
  var $cols = $(_cols).appendTo($table);

  var $thead = $('<thead>').appendTo($table);
  var $tbody = $('<tbody>').appendTo($table);

  var $theadTR = $(
    '<tr>' +
      '<th data-sort="ludum">LD</th>' +
      '<th data-sort="title">Entry</th>' +
    '</tr>');

  $theadTR.append(
    _.map(columns, function(category){
      return '<th data-sort="'+category+'">'+category+'</th>';
    })
  );

  $thead.append($theadTR);

  var sEntries = _.sortByOrder(entries, [sort.col], [sort.dir]);

  var $rows = _.map(sEntries, function(entry, i){
    var $tr = $('<tr>');
    $tr.append('<td>'+entry.ludum+'</td>');
    $tr.append('<td><a href="'+entry.link+'" target="_blank">'+entry.title+' ('+entry.type+')</a></td>');

    $tr.append(
      _.map(columns, function(category){
        var value = entry[category];
        return (onCellValue && onCellValue(value)) || '<td>'+(value || '-')+'</td>';
      })
    );

    return $tr;
  });

  $tbody.append($rows);

  $thead
    .find('th[data-sort='+sort.col+']')
    .addClass('sorting').addClass(sort.dir)
    .append('<div>');

  $table
    .on('mouseover', 'td', function(){
      var i = $(this).prevAll('td').length;
      $(this).parent().addClass('cell-hover');

      if ($(this).index() > 1) {
        $($cols[i]).addClass('cell-hover');
      }
    })
    .on('mouseout', 'td', function(){
      var i = $(this).prevAll('td').length;
      $(this).parent().removeClass('cell-hover');
      $($cols[i]).removeClass('cell-hover');
    })
    .on('mouseleave', function(){
      $cols.removeClass('cell-hover');
    })
    .on('click', 'th', function(e){
      var th = $(this);
      var col = th.attr('data-sort');

      var isSame = th.hasClass('sorting');
      var dir = isSame && th.hasClass('asc') ? 'desc' : 'asc';

      $table.off();
      createDataTable(id, columns, entries, onCellValue, { dir: dir, col: col });
    });

  return $table;
}

function buildRatesChart(entries){
  var catsPlusAVG = categories.concat(["average"]);
  var aentries = _.sortBy(entries, 'ludum');

  var labels = _.map(aentries, function(entry){
    return 'LD' + entry.ludum;
  });

  var series = catsPlusAVG.map(function(category){
    return {
      name: category,
      data: _.map(aentries, function(entry){
        return entry[category] || null;
      })
    };
  });

  var chart = new Chartist.Line('.ct-chart-rates', {
    labels: labels,
    series: series
  }, {
    high: 5,
    low: 0,
    lineSmooth: Chartist.Interpolation.simple({
      divisor: 4
    }),
    chartPadding: {
      top: 20,
      right: 120,
      bottom: 20,
      left: 0
    },
    axisX: {
      showGrid: true,
      showLabel: true,
      offset: 20,
      labelOffset: {
        x: -20,
        y: 10
      },
    },
    axisY: {
      position: 'start',
      showGrid: true,
      showLabel: true,
      scaleMinSpace: 30,
    },
  });

  var $chart = $('.ct-chart-rates');

  var $toolTip = $chart
    .append('<div class="tooltip"></div>')
    .find('.tooltip')
    .hide();

  $chart.on('mouseenter', '.ct-point', function() {
    var $point = $(this),
      value = $point.attr('ct:value'),
      seriesName = $point.parent().attr('ct:series-name');
    $toolTip.html(seriesName + '<br>' + value).show();
  });

  $chart.on('mouseleave', '.ct-point', function() {
    $toolTip.hide();
  });

  $chart.on('mousemove', function(event) {
    $toolTip.css({
      left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
      top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 40
    });
  });

  var $categories = $('.rates .categories');

  $categories.empty().append(
    catsPlusAVG.map(function(category, i){
      var idx = String.fromCharCode(97 + i);
      var $li = $('<li>'+category+'</li>');

      if (category === "average"){
        $li.addClass('off');
      }

      $li.on('click', function(){
        var el = $(this);

        if (el.hasClass('off')){
          el.removeClass('off');
          $('g.ct-series-' + idx, '.ct-chart-rates').show();
          return;
        }

        el.addClass('off');
        $('g.ct-series-' + idx, '.ct-chart-rates').hide();
      });

      return $li;
    })
  );

  chart.on('created', function() {
    var i = catsPlusAVG.length-1;
    $('g.ct-series-' + String.fromCharCode(97 + i), '.ct-chart-rates').hide();
  });

}

function buildPositionsChart(entries){
  var catsPlusTotals = categories.concat(["total"]);
  var aentries = _.sortBy(entries, 'ludum');

  var labels = _.map(aentries, function(entry){
    return 'LD' + entry.ludum;
  });

  var series = catsPlusTotals.map(function(category){
    var name = category;
    if (name === "total") name = "total entries";

    return {
      name: name,
      data: _.map(aentries, function(entry){
        return (entry[category] && entry[category]*-1) || null;
      })
    };
  });

  var chart = new Chartist.Line('.ct-chart-standings', {
    labels: labels,
    series: series
  }, {
    high: -1,
    //low: -3000,
    chartPadding: {
      top: 20,
      right: 120,
      bottom: 20,
      left: 10
    },
    axisX: {
      showGrid: true,
      showLabel: true,
      offset: 20,
      labelOffset: {
        x: -20,
        y: 10
      },
    },
    axisY: {
      position: 'start',
      showGrid: true,
      showLabel: true,
      scaleMinSpace: 30,
      labelInterpolationFnc: function(value) {
        return Math.abs(value);
      }
    },
  });

  var $chart = $('.ct-chart-standings');

  var $toolTip = $chart
    .append('<div class="tooltip"></div>')
    .find('.tooltip')
    .hide();

  $chart.on('mouseenter', '.ct-point', function() {
    var $point = $(this),
      value = $point.attr('ct:value'),
      seriesName = $point.parent().attr('ct:series-name');
    $toolTip.html(seriesName + '<br>' + Math.abs(value)).show();
  });

  $chart.on('mouseleave', '.ct-point', function() {
    $toolTip.hide();
  });

  $chart.on('mousemove', function(event) {
    $toolTip.css({
      left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
      top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 40
    });
  });

  var $categories = $('.standings .categories');

  $categories.empty().append(
    catsPlusTotals.map(function(category, i){
      var idx = String.fromCharCode(97 + i);

      var name = category;
      var $li = $('<li>'+name+'</li>');

      $li.on('click', function(){
        var el = $(this);

        if (el.hasClass('off')){
          el.removeClass('off');
          $('g.ct-series-' + idx, '.ct-chart-standings').show();
          return;
        }

        el.addClass('off');
        $('g.ct-series-' + idx, '.ct-chart-standings').hide();
      });

      return $li;
    })
  );

}

function createCardsSection(author){
  var ld = 0;

  var ludums = _.map(author.entries, function(entry, i){
    if (entry.ludum > ld) { ld = entry.ludum; }
    return entry.ludum;
  });

  $('#ludum-numbers')
    .html(_.map(ludums, function(ludum){
      var selected = "";
      if (ludum === ld){
        selected = 'selected="true"';
      }
      return '<option '+selected+' value="'+ludum+'">#'+ludum+'</option>';
    }))
    .on('change', buildCard);

  $('#card-style').on('change', buildCard);

  // auto select all text on focus
  $("#sharer").focus(function() {
    var $this = $(this);
    $this.select();

    // Work around Chrome's little problem
    $this.mouseup(function() {
      // Prevent further mouseup intervention
      $this.unbind("mouseup");
      return false;
    });
  });

  buildCard();
}

function buildCard(){
  var author = window.author.ldUser;
  var username = window.author.plus && window.author.plus.username || '';
  var ld = $('#ludum-numbers').val();
  var style = $('#card-style').val() || "normal";

  var url = "https://codepen.io/pjnovas/full/";

  switch(style){
    case "normal": url+= "yYJqyd"; break;
    case "arcade": url+= "qONgwN"; break;
  }

  url += "?user=" + author + "&ld=" + ld + (username ? "&username=" + username : '');

  var html = '<iframe src="'+url+'" width="100%" height="520" frameborder="0" allowtransparency="true" title="Ludum Dare CARD"></iframe>';
  $("#card-ctn").html(html);
  $("#sharer").val(html);
}
