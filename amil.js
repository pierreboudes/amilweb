var instruction = {
  stop: /stop/i,
  noop: /^noop/i,
  saut: /^saut ([0-9]+)/i,
  sautpos: /^sautpos r([0-9]+) ([0-9]+)/i,
  valeur: /^valeur (-{0,1}\d+) r([0-9]+)/i,
  lecture1: /^lecture ([0-9]+) r([0-9]+)/i,
  ecriture1: /^ecriture r([0-9]+) ([0-9]+)/i,
  inverse: /^inverse r([0-9]+)/i,
  add: /^add r([0-9]+) r([0-9]+)/i,
  soustr: /^soustr r([0-9]+) r([0-9]+)/i,
  mult: /^mult r([0-9]+) r([0-9]+)/i,
  div: /^div r([0-9]+) r([0-9]+)/i,
  et: /^et r([0-9]+) r([0-9]+)/i,
  lecture2: /^lecture \*r([0-9]+) r([0-9]+)/i,
  ecriture2: /^ecriture r([0-9]+) \*r([0-9]+)/i
};
var ri;
var cp = 1;
var mem;
var continuer = false;


function split_mem() {    
    var i;
    mem = ($('#mem > textarea').val()).split('\n');
    $('#mem').empty();
    for (i = 1; i <= mem.length; i += 1) {
	$('#splitmem').append('<div class="ligne"><div class="numeroligne">'+i+'. </div><pre id="MEM'+i+'">'+mem[i - 1]+'</pre></div>');
    }
    $('#splitmem').bind('dblclick',edit_mem);
    $('#splitmem').show();
    if ($('#runtimenav').hasClass("limbes")) {
	$('#runtimenav').animate({left: '265'}, 500, function () {
		$('#runtimenav').removeClass("limbes");		
	  });
    }
    return false;
}

function reading(jQ) {
    jQ.addClass('read');
    setTimeout(function () {
	    jQ.removeClass('read');
	}, 500);
}

function writting(jQ) {
    jQ.addClass('wrote');
    setTimeout(function () {
	    jQ.removeClass('wrote');
	}, 500);
}

function edit_mem() {
    reset();
    $('#mem').html('<textarea rows="'+mem.length+'">'+mem.join('\n')+"</textarea>");
    $('#mem').show();
    $('#splitmem').html('');
    $('#splitmem').hide();
    $('#mem').append('<div id="load">&nbsp;</div>');
    if(!($('#runtimenav').hasClass('limbes'))) {
	$('#runtimenav').animate({left: '-235'}, 500, function () {$('#runtimenav').addClass('limbes');});
    }
    $('#load').animate({left: '+=800'}, 500, function () {});
    $('#load').bind('click', split_mem);
}


function show_stop() {
    if (!($('#run').hasClass('limbes'))) {
	$('#run').animate({left: '-=500'}, 500, function () {
		// $('#run').hide();
	    });
//    $('#stop').show();
	$('#stop').animate({left: '+=500'}, 500, function () {
	    });
	$('#run').addClass('limbes');
    }
}
function hide_stop() {
//    $('#run').show();
    if (($('#run').hasClass('limbes'))) {
	$('#run').animate({left: '+=500'}, 500, function () {
	    });
	$('#stop').animate({left: '-=500'}, 500, function () {
//	    $('#stop').hide();
	    });
	$('#run').removeClass('limbes');
    }
}

function bus_read() {
    $('#addressbus').show();
    $('#addressbus').animate(
	{left: '320'}, 
	400, 
	function () {
	    $('#addressbus').css('left','230px');
	    $('#addressbus').hide(); 
	    $('#datasbus').show();
	    $('#datasbus').animate(
		{left: '230'}, 
		400,
		function () {
		    $('#datasbus').css('left','320px');
		    $('#datasbus').hide();
		});
	});
}

function bus_write() {
    $('#addressbus').show();
    $('#addressbus').animate(
	{left: '320'}, 
	400, 
	function () {
	    $('#addressbus').css('left','230px');
	    $('#addressbus').hide(); 
	    $('#datasbus').show();
	    $('#datasbus').addClass('writebus');
	    $('#datasbus').css('left','230px');
	    $('#datasbus').animate(
		{left: '320'}, 
		400,
		function () {
		    $('#datasbus').removeClass('writebus');
		    $('#datasbus').hide();
		});
	});
}


function finerreur() {
    $('.erreur').remove();
    $('.erreur_bus').remove();
    $('.erreur_bus2').remove();
}
function get_mem(index) {
    var chaine; 
    if ((index <= 0) || index > mem.length) {
	continuer = false;
	$('#RI').text('segmentation fault');
	/* <div class='erreur'>Erreur sur le bus d'adresse. "
         +"Il n'y a pas de case mémoire numéro "+index
         +".</div> */	
	$('body').append("<img class='erreur_bus' src='img/explosion.gif' /><img class='erreur_bus2' src='img/explosion.gif' />"); 
	$('div.erreur, img.erreur_bus, img.erreur_bus2').bind('click', finerreur);
	alert("Erreur sur le bus d'adresse. "
         +"Il n'y a pas de case mémoire numéro "+index);
	setTimeout(finerreur,1000);
	return "42";
    }
    chaine = mem[index - 1];
    return chaine;
}
function get_mem2(index) {
    bus_read();
    reading($('#MEM'+index));
    return get_mem(index);
}

function set_mem(index, chaine) {
    bus_write();
    mem[index - 1] = chaine;
    writting($('#MEM'+index));
    $('#MEM'+index).text(chaine);
}

function set_cp(value) {
    $('#splitmem .active').removeClass('active');
    $('#MEM'+value).addClass("active");
    $('#CP').text(value);
    cp = value;
}

function get_register(num) {
    var val;
    reading($('#R'+num));
    val = parseFloat($('#R'+num).text());
    return val; /* type num */
}

function set_register(num, valeur) {
    writting($('#R'+num));
    $('#R'+num).text(valeur);
}

function set_ri(str) {
    $('#RI').text(str);
}

function step() {
    // get_mem2(cp);  //Pour voir le bus a chaque chargement d'instruction
    var code = get_mem(cp);
    if (instruction.stop.test(code)) {
	set_cp(cp + 1);
	set_ri("stop");
	return false; /* <- sortie precoce */
    }
    else if (instruction.noop.test(code)) {
	set_cp(cp + 1);	
	set_ri("noop");
    }
    else if (instruction.saut.test(code)) {
	ri = instruction.saut.exec(code);
	set_cp(cp + 1);
	set_ri(ri[0]);
	set_cp(parseFloat(ri[1]));
    }
    else if (instruction.sautpos.test(code)) {
	ri = instruction.sautpos.exec(code);    
	set_cp(cp + 1);
	set_ri(ri[0]);
	if (0 <= get_register(ri[1])) {
	    writting($('#CP'));
	    set_cp(parseFloat(ri[2]));
	}
    }
  else if (instruction.valeur.test(code)) {
      ri = instruction.valeur.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[2], ri[1]);
  }
  else if (instruction.lecture1.test(code)) {
      ri = instruction.lecture1.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[2], parseFloat(get_mem2(parseFloat(ri[1]))));
  }
  else if (instruction.lecture2.test(code)) {
      ri = instruction.lecture2.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[2], parseFloat(get_mem2(get_register(ri[1]))));
  }
  else if (instruction.ecriture1.test(code)) {
      ri = instruction.ecriture1.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_mem(parseFloat(ri[2]), get_register(ri[1]));
  }
  else if (instruction.ecriture2.test(code)) {
      ri = instruction.ecriture2.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_mem(get_register(ri[2]),  get_register(ri[1]));
  }
  else if (instruction.inverse.test(code)) {
      ri = instruction.inverse.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[1], -get_register(ri[1]));
  }
  else if (instruction.add.test(code)) {
      ri = instruction.add.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[2], get_register(ri[2]) + get_register(ri[1]));
  }
  else if (instruction.soustr.test(code)) {
      ri = instruction.soustr.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[2], get_register(ri[2]) - get_register(ri[1]));
  }
  else if (instruction.mult.test(code)) {      
      ri = instruction.mult.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[2], get_register(ri[2]) * get_register(ri[1]));
  }
  else if (instruction.div.test(code)) {
      ri = instruction.div.exec(code);
      set_cp(cp + 1);
      set_ri(ri[0]);
      set_register(ri[2], Math.floor(get_register(ri[2]) / get_register(ri[1])));
  }
  else {
      set_ri("instruction inconnue");
      /* instruction inconnue */
      return false;
  }
  return true;
}

function interactive_step () {
    if (!step()) {
	alert("fin du programme");
    }
    $('#CP').text(cp);
    return false;
}

function start_run() {
    continuer = true;
    show_stop();
    run();
}

function run() {
    if (continuer) {
	if (step()) {
	    setTimeout(run, 1000);
	} else {
	    continuer = false;
	    alert("fin du programme");
	    hide_stop();
	}
    }
    return false;
}

function stop () {
    continuer = false;
    hide_stop();
};

function reset() {
    var i;
    set_cp(1);
    for (i = 0; i < 8; i += 1) {
	set_register(i, 0);
    }
}
$(document).ready(function () {
  $('#step').bind('click',interactive_step);
  $('#run').bind('click', start_run);
  $('#stop').bind('click', stop);
  $('#reset').bind('click', reset);
  $('#addressbus').hide();
  $('#datasbus').hide();
  split_mem();
  edit_mem();
});


