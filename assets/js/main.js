/**
 * Vistech - Main JavaScript (performance-optimized)
 */
(function ($) {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onScrollThrottled(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        fn();
        ticking = false;
      });
    };
  }

  /* Page Loader — hide quickly; do not wait for all images */
  function initPageLoader() {
    var $loader = $('#page-loader');
    if (!$loader.length) return;

    function hideLoader() {
      $loader.addClass('hidden');
      $('body').removeClass('loading');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(hideLoader, 120);
      });
    } else {
      setTimeout(hideLoader, 80);
    }
  }

  /* Single scroll listener for header, back-to-top, and counters */
  function initScrollHandlers() {
    var $header = $('.site-header');
    var $btn = $('#back-to-top');
    var $counters = $('.stat-number');
    var $statsSection = $('#stats-section');
    var countersAnimated = false;

    if (!$header.length && !$btn.length && !$counters.length) return;

    $(window).on(
      'scroll',
      onScrollThrottled(function () {
        var scrollY = window.scrollY;

        if ($header.length) {
          $header.toggleClass('scrolled', scrollY > 80);
        }
        if ($btn.length) {
          $btn.toggleClass('visible', scrollY > 400);
        }

        if ($counters.length && $statsSection.length && !countersAnimated) {
          var rect = $statsSection[0].getBoundingClientRect();
          if (rect.top < window.innerHeight - 80) {
            countersAnimated = true;
            animateCounters($counters);
          }
        }
      })
    );
  }

  function animateCounters($counters) {
    $counters.each(function () {
      var $el = $(this);
      var target = parseInt($el.data('count'), 10);
      var suffix = $el.data('suffix') || '';
      if (!target || isNaN(target)) return;

      if (prefersReducedMotion) {
        $el.text(target.toLocaleString() + suffix);
        return;
      }

      var start = performance.now();
      var duration = 1200;

      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        $el.text(Math.floor(target * eased).toLocaleString());
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          $el.text(target.toLocaleString() + suffix);
        }
      }
      requestAnimationFrame(tick);
    });
  }

  function initActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var productsPages = ['products.html', 'product-details.html'];
    $('.navbar-nav .nav-link').removeClass('active');
    $('.navbar-nav .nav-link').each(function () {
      var href = $(this).attr('href');
      if (!href || href.indexOf('://') !== -1) return;
      var isProducts = productsPages.indexOf(path) !== -1 && href === 'products.html';
      if (href === path || (path === '' && href === 'index.html') || isProducts) {
        $(this).addClass('active');
      }
    });
  }

  function initMegaMenu() {
    $('.dropdown-mega > .nav-link').on('click', function (e) {
      if ($(window).width() < 992) {
        e.preventDefault();
        $(this).parent().toggleClass('show');
      }
    });
  }

  function pauseSlidersWhenHidden() {
    document.addEventListener('visibilitychange', function () {
      var hidden = document.hidden;
      if (window._heroCarousel) {
        if (hidden) {
          window._heroCarousel.pause();
        } else {
          window._heroCarousel.play();
        }
      }
      $('.testimonial-slider, .product-slider').each(function () {
        if (!$(this).hasClass('slick-initialized')) return;
        if (hidden) {
          $(this).slick('slickPause');
        } else {
          $(this).slick('slickPlay');
        }
      });
    });
  }

  function initHeroSlider() {
    var $hero = $('.hero-slider');
    if (!$hero.length) return;

    var $slides = $hero.children('.hero-slide');
    if (!$slides.length) return;

    var current = 0;
    var total = $slides.length;
    var intervalMs = 5000;
    var fadeMs = prefersReducedMotion ? 0 : 800;
    var timer = null;
    var locked = false;

    $slides.removeClass('is-active');
    $slides.eq(0).addClass('is-active');

    var $dotsWrap = $hero.children('.hero-dots');
    if (!$dotsWrap.length) {
      $dotsWrap = $('<div class="hero-dots" role="tablist" aria-label="Hero slides"></div>');
      for (var i = 0; i < total; i++) {
        $dotsWrap.append(
          '<button type="button" class="hero-dot' +
            (i === 0 ? ' is-active' : '') +
            '" aria-label="Go to slide ' +
            (i + 1) +
            '" data-index="' +
            i +
            '"></button>'
        );
      }
      $hero.append($dotsWrap);
    }

    function loadSlideImages($slide) {
      $slide.find('.hero-bg[data-lazy]').each(function () {
        var $img = $(this);
        var src = $img.attr('data-lazy');
        if (src && !$img.attr('src')) {
          $img.attr('src', src).removeAttr('data-lazy');
        }
      });
    }

    function showSlide(index) {
      if (locked || index === current || index < 0 || index >= total) return;
      locked = true;
      loadSlideImages($slides.eq(index));
      loadSlideImages($slides.eq((index + 1) % total));
      $slides.eq(current).removeClass('is-active');
      $slides.eq(index).addClass('is-active');
      $dotsWrap.find('.hero-dot').removeClass('is-active').eq(index).addClass('is-active');
      current = index;
      $('.hero-content').removeClass('animated');
      animateHeroContent($slides.eq(index).find('.hero-content'));
      setTimeout(function () {
        locked = false;
      }, fadeMs || 50);
    }

    function nextSlide() {
      showSlide((current + 1) % total);
    }

    function startAutoplay() {
      stopAutoplay();
      if (total <= 1) return;
      timer = setInterval(nextSlide, intervalMs);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    $hero.off('click.heroslider');
    $hero.on('click.heroslider', '.hero-dot', function () {
      showSlide(parseInt($(this).attr('data-index'), 10));
      startAutoplay();
    });

    animateHeroContent($slides.eq(0).find('.hero-content'));
    loadSlideImages($slides.eq(0));
    loadSlideImages($slides.eq(1));
    startAutoplay();

    window._heroCarousel = { play: startAutoplay, pause: stopAutoplay };
  }

  function animateHeroContent($el) {
    if ($el.length && !prefersReducedMotion) {
      setTimeout(function () {
        $el.addClass('animated');
      }, 80);
    } else if ($el.length) {
      $el.addClass('animated');
    }
  }

  function initTestimonialSlider() {
    var $slider = $('.testimonial-slider');
    if (!$slider.length || typeof $.fn.slick !== 'function') return;

    $slider.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: !prefersReducedMotion,
      autoplaySpeed: 6500,
      arrows: false,
      dots: true,
      fade: !prefersReducedMotion,
      pauseOnHover: true
    });
  }

  function initBackToTop() {
    $('#back-to-top').on('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  function initSmoothScroll() {
    $('a[href^="#"]').on('click', function (e) {
      var target = $(this.getAttribute('href'));
      if (target.length) {
        e.preventDefault();
        var top = target.offset().top - 80;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  }

  function initAOS() {
    if (typeof AOS === 'undefined' || !document.querySelector('[data-aos]')) return;
    if (prefersReducedMotion) return;
    AOS.init({
      duration: 500,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      disable: function () {
        return window.innerWidth < 768;
      }
    });
  }

  function initContactForm() {
    var $form = $('#contact-form');
    if (!$form.length || typeof $.fn.validate !== 'function') return;

    $form.validate({
      rules: {
        name: { required: true, minlength: 2 },
        mobile: { required: true, minlength: 10 },
        email: { required: true, email: true },
        message: { required: true, minlength: 10 }
      },
      messages: {
        name: 'Please enter your name',
        mobile: 'Please enter a valid mobile number',
        email: 'Please enter a valid email',
        message: 'Please enter your message'
      },
      errorClass: 'text-danger small d-block mt-1',
      submitHandler: function (form) {
        var $btn = $(form).find('[type="submit"]');
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Sending...');

        setTimeout(function () {
          $('#form-success').removeClass('d-none');
          form.reset();
          $btn.prop('disabled', false).html('Send Message');
          setTimeout(function () {
            $('#form-success').addClass('d-none');
          }, 5000);
        }, 1200);
        return false;
      }
    });

    var params = new URLSearchParams(window.location.search);
    var product = params.get('product');
    if (product) {
      $('#contact-message').val('Inquiry for: ' + product);
    }
  }

  function initNewsletter() {
    $('#newsletter-form').on('submit', function (e) {
      e.preventDefault();
      var email = $(this).find('input[type="email"]').val();
      if (email) {
        alert('Thank you for subscribing! We will keep you updated.');
        $(this)[0].reset();
      }
    });
  }

  function initGalleryFilter() {
    $('.gallery-filter .btn-filter').on('click', function () {
      var filter = $(this).data('filter');
      $('.gallery-filter .btn-filter').removeClass('active');
      $(this).addClass('active');

      $('.gallery-item').each(function () {
        var $item = $(this);
        var show = filter === 'all' || $item.data('category') === filter;
        $item.toggleClass('d-none', !show);
      });
    });
  }

  function initPdfModal() {
    $(document).on('click', '.btn-preview-pdf', function (e) {
      e.preventDefault();
      var pdfUrl = $(this).data('pdf');
      $('#pdfModal iframe').attr('src', pdfUrl);
      $('#pdfModal').modal('show');
    });
    $('#pdfModal').on('hidden.bs.modal', function () {
      $(this).find('iframe').attr('src', '');
    });
  }

  $(document).ready(function () {
    initPageLoader();
    initScrollHandlers();
    initActiveNav();
    initMegaMenu();
    initHeroSlider();
    initTestimonialSlider();
    initBackToTop();
    initSmoothScroll();
    initAOS();
    initContactForm();
    initNewsletter();
    initGalleryFilter();
    initPdfModal();
    pauseSlidersWhenHidden();

    $('.current-year').text(new Date().getFullYear());
  });
})(jQuery);
