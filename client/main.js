import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
  var count = 0;
  var images = "";
  
  var showFlickr = function(tag) { 
    images = ""; // cleaning list
    key = formatQuery(tag);
    localStorage.setItem('search', key);  
    count++;
    var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a0ddab17666178023726b34cd67b21e6&tags='+key+'&per_page=12&format=json&nojsoncallback=1';
    console.log("I found this with ", key, count);
    runQuery(url);
  }
  
  formatQuery = function(tag){
    return tag.replace(" ", "+");
  }
  
  runQuery = function(url){
    $.get(url, function (data) {
      console.log(data);
      localStorage.setItem('page', data.photos.page);
      localStorage.setItem('max', data.photos.pages);
      $.each(data.photos.photo, function( index, value ) {
        images = images + "<li id="+index+"><img class='thumbnail' src='http://farm"+value.farm+".staticflickr.com/"+value.server+"/"+value.id+"_"+value.secret+".jpg' /><h6>"+value.title+"</h6></li>"
      });
      $(".fest").html(images);
    });
  }
  
  var runScroll = function(where){
    setTimeout(function() { 
        if (where == "down"){
          var n = $(document).height();
          console.log(n);
          $("html, body").animate({ scrollTop: n}, 50);
        }else if (where == "up"){
          console.log("going to top");
          $('html, body').animate({ scrollTop: 0 }, 50);
        }
     }, 2000);
  }
  
  
  var showMore = function(){
    search = localStorage.getItem('search');
    page = localStorage.getItem('page');
    max = localStorage.getItem('max');
    if (search){
      page++;
      if (page >= max){console.log("no more pages"); return}
      var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a0ddab17666178023726b34cd67b21e6&tags='+search+'&per_page=12&page='+page+'&format=json&nojsoncallback=1';
      console.log(page, url);
      runQuery(url, runScroll("down"));
    }
  }
  
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  
  var removeIt = function(tag){
    console.log(tag);
    var numbers = {one: 0, two: 1, three:2, four: 3, five: 4, six: 5, seven: 6, eight: 7};
    if (isNumeric(tag)){
      the_number = tag-1;
    }else{
      the_number = numbers[tag];
    }
    
    if(typeof the_number !== "undefined"){
      console.log("remove the", the_number);
      $(".fest li#"+the_number).addClass('remove').remove();
    }else{
      var other_numbers = {first: 0, second: 1, third:2};
      the_number = other_numbers[tag];
      if(typeof the_number !== "undefined"){
        console.log("remove the", the_number);
        $(".fest li#"+the_number).addClass('remove').remove();
      }else{
        console.log("we didn`t get it number what?");
      }
    }
  }  
  
  
  // Let's define a command
  var commands = {
    'hello': function() { console.log('Hello world!'); },
    'stop': function() { annyang.pause(); console.log('pause!'); },
    'go on': function() { annyang.resume(); console.log('go on!'); },
    'show me (recipes with) *tag': showFlickr,
    'show me (a recipe with) *tag': showFlickr,
    'show me (a) *tag': showFlickr,
    'I want (to see recipes with) *tag': showFlickr,
    'I meant (to see recipes with) *tag': showFlickr, 
    'more': showMore,
    'show me more': showMore,
    'go on': showMore,
    'more (*tag)': showMore,
    'go to top': function() { runScroll("up") },
    'go back': function() { runScroll("up") },
    'remove the *tag one': removeIt,
    'remove number *tag': removeIt,
  };

  // Add our commands to annyang
  annyang.addCommands(commands);  
  
  
});



Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

var last = true;
Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    var proper = instance.counter.get() + 1;
    instance.counter.set(proper);
    
    console.log(proper);
    // Start listening.
    last = !last;
    if (!last){
      if (proper == 1){
        annyang.start();
      }else{
        annyang.resume();
      }
      //annyang.start({autoRestart: false, continuous: false});
    }else{
      var state = annyang.isListening;
      if (!state){
        annyang.pause();
      }
    }
    
  },
});

Template.body.onRendered(function () {
  $(document).foundation();
});