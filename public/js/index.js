
var categories = ['overall', 'fun', 'theme', 'innovation', 'humor', 'graphics', 'audio', 'mood'];
var builtTabs = [];
var author, rates, positions;

$(function(){
  attachEvents();
});

function attachEvents(){

  $('.loading').hide();

  $('.tabs>a').on('click', function(){
    var tab = $(this).attr('data-tab');
    $('.tab-content.active, .tabs>a.active').removeClass('active');
    $('.tab-content.' + tab).add(this).addClass('active');
    buildTab(tab);
  });

  $('#fetch').on('click', function(){
    var author = $('#username').val();
    if (author.trim().length){
      $('.loading').show();
      clearView();
      fetchAuthor(author.trim());
    }
  });
}

function clearView(){
  window.builtTabs = [];
  $('.ct-chart-rates, .rates-data, .position-data, .categories').empty();
}

function fetchAuthor(author){
  $.get('/api/authors/' + author, function(author){
    window.author = author;
    window.rates = getData("rate");
    window.positions = getData("position");

    var curr = $('.tabs>a.active').attr('data-tab');
    buildTab(curr);
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
        buildRatesData(window.rates);
        break;
      case "standings":
        buildPositionsChart(window.positions);
        break;
      case "podium":
        buildPositionData(window.positions);
        break;
    }

    builtTabs.push(tab);
  }
}

function getData(field) {
  return _.map(_.cloneDeep(window.author.entries), function(entry, i){

    var en = {
      ludum: entry.ludum,
      title: entry.title,
      link: entry.link,
      type: entry.type,
      total: entry.total,
      average: 0
    };

    function getValue(name){
      return entry.ratings[name] && entry.ratings[name][field] || 0;
    }

    categories.forEach(function(category){
      var value = getValue(category);
      en[category] = value;
      en.average += value;
    });

    en.average = parseFloat((en.average / categories.length).toFixed(2));
    return en;
  });
}

function buildRatesData(entries, sort){
  var _categories = categories.concat(["average"]);
  sort = sort || { dir: 'asc', col: 'ludum' };

  var $table = $('#rates-data').empty();

  var _cols = '';
  _.times(_categories.length+2, function(i){ _cols += '<colgroup/>'; })
  var $cols = $(_cols).appendTo($table);

  var $thead = $('<thead>').appendTo($table);
  var $tbody = $('<tbody>').appendTo($table);

  $table.append()

  var $theadTR = $(
    '<tr>' +
      '<th data-sort="ludum">LD</th>' +
      '<th data-sort="title">Entry</th>' +
    '</tr>');

  $theadTR.append(
    _.map(_categories, function(category){
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
      _.map(_categories, function(category){
        var value = entry[category];
        if (value >= 4){
          return '<td class="highlight">'+value+'</td>';
        }
        return '<td>'+value+'</td>';
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
      buildRatesData(entries, { dir: dir, col: col });
    });
}

function buildPositionData(entries, sort){
  var _categories = categories;//.concat(["average"]);
  sort = sort || { dir: 'asc', col: 'ludum' };

  var $table = $('#position-data').empty();

  var _cols = '';
  _.times(_categories.length+2, function(i){ _cols += '<colgroup/>'; })
  var $cols = $(_cols).appendTo($table);

  var $thead = $('<thead>').appendTo($table);
  var $tbody = $('<tbody>').appendTo($table);

  $table.append()

  var $theadTR = $(
    '<tr>' +
      '<th data-sort="ludum">LD</th>' +
      '<th data-sort="title">Entry</th>' +
    '</tr>');

  $theadTR.append(
    _.map(_categories, function(category){
      return '<th data-sort="'+category+'">'+category+'</th>';
    })
  );

  $theadTR.append('<th data-sort="total">Entries</th>');

  $thead.append($theadTR);

  var sEntries = _.sortByOrder(entries, [sort.col], [sort.dir]);

  var $rows = _.map(sEntries, function(entry, i){
    var $tr = $('<tr>');
    $tr.append('<td>'+entry.ludum+'</td>');
    $tr.append('<td><a href="'+entry.link+'" target="_blank">'+entry.title+' ('+entry.type+')</a></td>');

    $tr.append(
      _.map(_categories, function(category){
        var value = entry[category];
        if (value > 0 && value <= 100){
          return '<td class="highlight">'+value+'</td>';
        }
        return '<td>'+value+'</td>';
      })
    );

    $tr.append('<td>'+entry.total+'</td>');

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
      buildPositionData(entries, { dir: dir, col: col });
    });
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
      right: 60,
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
          $('g.ct-series-' + idx).show();
          return;
        }

        el.addClass('off');
        $('g.ct-series-' + idx).hide();
      });

      return $li;
    })
  );

  chart.on('created', function() {
    var i = catsPlusAVG.length-1;
    $('g.ct-series-' + String.fromCharCode(97 + i)).hide();
  });

}

function buildPositionsChart(entries){
  var catsPlusTotals = categories.concat(["entries"]);
  var aentries = _.sortBy(entries, 'ludum');

  var labels = _.map(aentries, function(entry){
    return 'LD' + entry.ludum;
  });

  var series = categories.map(function(category){
    return {
      name: category,
      data: _.map(aentries, function(entry){
        return entry[category]*-1 || null;
      })
    };
  });

  series.push({
    name: "entries",
    data: _.map(aentries, function(entry){
      return entry.total*-1 || null;
    })
  });

  var chart = new Chartist.Line('.ct-chart-standings', {
    labels: labels,
    series: series
  }, {
    high: -1,
    //low: -3000,
    chartPadding: {
      top: 20,
      right: 60,
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
      var $li = $('<li>'+category+'</li>');

      $li.on('click', function(){
        var el = $(this);

        if (el.hasClass('off')){
          el.removeClass('off');
          $('g.ct-series-' + idx).show();
          return;
        }

        el.addClass('off');
        $('g.ct-series-' + idx).hide();
      });

      return $li;
    })
  );

}
