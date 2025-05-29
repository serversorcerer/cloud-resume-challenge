'use strict'; 

/*----------------------------------------------------------------------*/
/* =  Preloader
/*----------------------------------------------------------------------*/
$(window).on('load', function () {

  gsap.to($('.preloader .circle'), .7, {strokeDashoffset:0, delay:1 });
  //gsap.to('.preloader .profile-image', {duration: 4, rotationX:360, delay:1.7, ease:Cubic.easeOut});
  
  gsap.to($('.loading'), 0.7, {y:-100, autoAlpha:0, delay:1.7 });
  gsap.to($('#loader'), 3, {y:-3000, delay:2, ease:'easeOutExpo' } );
  
  setTimeout(function(){ $('#loader').remove(); }, 3000);
 

});

function ajaxLoad(){

  header_options();
  testimonialSlider();
  workslider();
  lightbox();
  ContactForm(); 
  videoPlay();
  charts();
  isotope();
  contactmap();
  setTimeout(() => {
    scrollAnimation();
  }, 1000);
  setTimeout(() => {
   typed ();
   clientSlider();
  }, 250);
}

setTimeout(() => {
  
ajaxLoad();
}, 1000);


  // BARBA JS
  function delay(n) {
    n = n || 500;
    return new Promise((done) => {
      setTimeout(() => {
        done();
      }, n);


    });
  }

  barba.init({
    transitions: [{
      async leave(data) {
        const done = this.async();
        pageTransition();
        await delay(700);
        done();
      },

      async enter(data) {
        ajaxLoad();
          scrollbar.scrollTo(0, 0, 0);
        gsap.to(".page-cover", {'margin-top': '0px', autoAlpha:1, delay:.4, ease: Power3.easeOut });
        $('.page-cover').addClass('yoket');
        setTimeout(() => {
          $('.page-cover').removeClass('yoket');
        }, 1500);
      },
    }, ],
  });

  function pageTransition() {
    var tl = new gsap.timeline({
      yoyo: false,
      reversed: false
    });
    tl.to(".page-cover", .5, {'margin-top': '-50px', autoAlpha:0, ease: Power3.easeOut },"Start");
  }




// MAGNIFIC POPUP    
function lightbox() {
  if( $('.lightbox').length ){
    $('.lightbox').attr('data-barba-prevent', 'all');
    $('.lightbox').magnificPopup({
          type:'image',
          gallery:{enabled:true},
          zoom:{enabled: true, duration: 300}
      });
  }
}




// VIDEO HOVER PLAY
function videoPlay(){
  if($('.video-wrapper').length){
    setTimeout(() => {
      $('video').get(0).pause();
    }, 10);
  }


  if($('.grid-item.grid-video').length){
    $('.grid-video').on("mouseenter",  function() {
      $(this).find('video').get(0).play();
    }).on("mouseleave", function(){
      $(this).find('video').get(0).pause();
    });
  }

  if($('.work-hero').length){
    setTimeout(() => {
      $('.work-hero').find('video').get(0).play();
    }, 10);
  }


}


  
  // SCROLL ANIMATION
  function scrollAnimation() {
  if( $('.scroll-animation-on').length ){

  var controller = new ScrollMagic.Controller();
  $('.classic-animation').each(function(){
  var animationDelay = $(this).data('delay') ? $(this).data('delay') : 0;
  var animationDuration = $(this).data('duration') ? $(this).data('duration')  : 1;


    // build a tween
    var tween = gsap.to($(this), animationDuration, {autoAlpha: 1, y:0, scale:1, delay: animationDelay, ease:"expo.out"});
    // build a scene
    var scene = new ScrollMagic.Scene({
      triggerElement: this,
      duration: 0,
      reverse: false,
      offset: -500,
    })
    .setTween(tween)
    .addTo(controller)
  })

  $('.clip-animation').each(function(){
    var animationDelay = $(this).data('delay') ? $(this).data('delay') : 0;
    var animationDuration = $(this).data('duration') ? $(this).data('duration')  : 1;

    // build a tween
    var tween = gsap.to($(this), animationDuration, { clipPath: "polygon(-2% 0%, 100% 0%, 105% 100%, 0% 100%)", delay: animationDelay, ease:"expo.out"});
    // build a scene
    var scene = new ScrollMagic.Scene({
      triggerElement: this,
      duration: 0,
      reverse: false,
      offset: -650,
    })
    .setTween(tween)
    .addTo(controller)
  })

  $('.scale-animation').each(function(){
    var animationDelay = $(this).data('delay') ? $(this).data('delay') : 0;
    var animationDuration = $(this).data('duration') ? $(this).data('duration')  : 1;

    // build a tween
    var tween = gsap.to($(this), animationDuration, { scaleY:1, autoAlpha:1, y:0, delay: animationDelay, ease:"expo.out"});
    // build a scene
    var scene = new ScrollMagic.Scene({
      triggerElement: this,
      duration: 0,
      reverse: false,
      offset: -500,
    })
    .setTween(tween)
    .addTo(controller)
  })

}

}

//CARTS 
function charts() {

  if( $('.chart').length ){
    if ( $(window).width() >= 991  ){
    $(window).on('resize', function(){
      if ( $(window).width() <= 991  ){
        location.reload();
      }
    });
   }else{
    $(window).on('resize', function(){
      if ( $(window).width() >= 991  ){
        location.reload();
      }
    });
   }
  }

  $(".chart").each(function() {

    if ( $(window).width() >= 991  ){
      var charSize = 150;
      var charLine = 8;
    }else{
      var charSize = 100;
      var charLine = 6;
    }

    var bartrack = '#000';
    if( $('body').hasClass('dark-version') ){
      var bartrack = '#363636';
    }

    $(".chart").easyPieChart({
      barColor:  "#D1ED5D",
      scaleColor: "#D1ED5D",
      trackColor: bartrack,
      size: charSize,
      lineWidth: charLine,
      lineCap: "square",
      onStep: function(a, b, c) {
          $(this.el).find(".percent").text(Math.round(c));
      }
    });
  });
  
  
      $(".skill-list li").each(function() {
        var percentBar = $(this).find('.percentage');
        gsap.to(percentBar, {  'width':percentBar.attr("data-percent"), duration:2, delay:2, ease:Power2.easeOut  });
    });
    
}


// HOME TYPED JS
function typed () {
  if ($('.element').length) {
    var animateSpan	= jQuery('.element');
var textWords	= animateSpan.data('values');
var textArray	= textWords.split(',');
var html	=[];
var back_delay = $('.element').data('backdelay') * 1000;

for(var i = 0;i < textArray.length;i++){
html.push(textArray[i]);
}
    
    $('.element').each(function () {
        $(this).typed({
          strings: html,
            loop: $(this).data('loop') ? $(this).data('loop') : false ,
            backDelay: back_delay,               
            typeSpeed: 20,
        });
    });
  }
}

  //CLIENT SLIDER JS
  function clientSlider(){

    $(".bxslider").bxSlider({
      minSlides: 1,
      maxSlides: 5,
      slideMargin: 0,
      ticker: true,
      infiniteLoop: true,
      speed: 30000
    });

  }


  // SMOOTH SCROLL JS


  var onur = 0.1;
  if( $(window).width() <= 1024 ){
    var onur = 0.02;
  }

    var scrollbar = Scrollbar.init(
      document.getElementById('page-scroll'), {
        damping: onur,
      });
    // ensure page always loads scrolled to top
    scrollbar.scrollTo(0, 0, 0);

  if( $('.onepage').length ){

    $('header nav ul li a').on('click', function (e) {
      e.preventDefault();
      $(document).off("scroll");            
      $('header nav ul li a').removeClass('active');          
      $(this).addClass('active');
      var target = $(this).attr("href");
      target = $(target);
      scrollbar.scrollTo(0, target.position().top, 1000);
  });

  }

// fixed item
if($('#fixed').length   ){
      scrollbar.addListener(({ offset }) => {  
        if (offset.y >= 45 ){
          fixed.style.top = offset.y + 'px';
        }else{
          $('header').removeAttr('style');
        }
      });
}

if( $('.onepage').length ){
  scrollbar.addListener(({ offset }) => {  
  var scrollPos = offset.y;
  $('header nav ul li a').each(function () {
  var currLink = $(this);
  var refElement = $(currLink.attr("href"));
  if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
      $('header nav ul li a').removeClass("active");
      currLink.addClass("active");
  }
  else{
      currLink.removeClass("active");
  }
  });
});
} 

  function header_options(){
    var headerAnimation = new gsap.timeline({yoyo: false,reversed: true });
    headerAnimation.pause();
    headerAnimation.to($('header nav ul li'), .4, { autoAlpha:1, x:0, stagger:0.05, ease:Power2.easeOut });

    $('.hamburger, header ul li a').on('click', function(){
      headerAnimation.reversed() ? headerAnimation.play() : headerAnimation.reverse();
      $('body').toggleClass('header-is-active');
    });
  }  


      // isotope
      function isotope(){
        if ( $('.masonry').length ){
        var $container = $('.masonry');  
        $container.isotope({
          itemSelector: '.grid-item',
          sortBy : 'parseInt',
          gutter:0,
          transitionDuration: "0.5s",
          columnWidth: '.grid-item'
        });
        $('.portfolio_filter ul li a').on("click", function(){
          $(".portfolio_filter ul li a").removeClass("select-cat");
          $(this).addClass("select-cat");        
          var selector = $(this).attr('data-filter');
          $(".masonry").isotope({
              filter: selector,
              animationOptions: {
                  duration: 750,
                  easing: 'linear',
                  queue: false,
        }
      });
          return false;
      });   
          
    }
  }



  // SWIPER JS
function workslider(){
  var swiper = new Swiper(".work-carousel", {
      slidesPerView: 1,
      spaceBetween: 30,
      autoplay:{
          delay: 3000,
      },
      pagination: {
          el: ".swiper-pagination",
          clickable: true,
      },
      });
}


// SWIPER JS
function testimonialSlider(){
  var swiper = new Swiper(".testimonial-carousel", {
      slidesPerView: 1,
      spaceBetween: 30,
      autoplay:{
          delay: 3000,
      },
      pagination: {
          el: ".swiper-pagination",
          clickable: true,
      },
      breakpoints: {
        1200: {
          slidesPerView: 3,
        },
        768: {
          slidesPerView: 2,
        },
      },
      });
}



  //CONTACT FORM
  function ContactForm() {	
	
    if( jQuery('#contact-formular').length > 0 ){
      $('#contactform').submit(function(){
        var action = $(this).attr('action');
        $("#message").slideUp(750,function() {
          $('#message').hide();
          $('#submit').attr('disabled','disabled');		
          $.post(action, {
            name: $('#name').val(),
            email: $('#email').val(),
            comments: $('#comments').val()
          },
          function(data){
            document.getElementById('message').innerHTML = data;
            $('#message').slideDown('slow');
            $('#contactform img.loader').fadeOut('slow',function(){$(this).remove()});
            $('#submit').removeAttr('disabled');
            if(data.match('success') != null) $('#contactform').slideUp('slow');		
          }
        );		
        });		
        return false;		
      });		
  
        
    $("form .form-group input, form .form-group textarea,  form .form-group select").focus(function(){
      
      
        $(this).parents('.form-group').addClass('in');
      
        $('form .form-group input, form .form-group textarea,  form .form-group select').blur(function()
          {
            if( !$(this).val() ) {
              $(this).parents('.form-group').removeClass('in');
            }
          });
      });
    }
  
  }//End ContactForm

   // Javascript Code
  const counter = document.querySelector(".counter-number");
async function updateCounter() {
    let response = await fetch("https://p2g657yagqa4o4llp63id3dmgq0xzcun.lambda-url.us-east-1.on.aws/");
    let data = await response.json();
counter.innerHTML = `Views: ${data.views}`;



}

updateCounter()


