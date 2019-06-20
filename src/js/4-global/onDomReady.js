$(document).on("ready", function () {

    // Toggle hamburger menu function
    var menu = $(".hamburger-menu");
	menu.on('click', function() {
        $(this).toggleClass('hamburger-menu--open');
        $('nav').toggleClass('nav--open');
	});

    // Add page__scrolling class on scroll
	var body = $("body");
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        scroll >= 50 ? body.addClass("page__scrolling") : body.removeClass("page__scrolling");
    });

    // Toggle sheet header function
    var sheet__header = $(".sheet__header");
    sheet__header.on('click', function() {
        $(this).parent().toggleClass('sheet__container--open');
    });

    function updateCounter(){
        var counter_people = $('.sheet__user').length;
        var counter_people_present = $('.sheet__user--present').length;
        // console.log(counter_people, counter_people_present);
        var span_fraction = $(".sheet__summary__number__counter");
        span_fraction.empty().text(counter_people_present + '/' + counter_people);
    }

    // Toggle sheet user function
    var sheet__user = $(".sheet__user");
    sheet__user.on('click', function() {
        console.log('click');
        $(this).toggleClass('sheet__user--present');
        updateCounter();
    });

    // Parse json file to create list of users in the sheet
    var sheet__users = $('#sheet__users');
    $.getJSON('./data/data.json', function (data) {
        console.log(data, data.length);
        sheet__users.empty();

        if(data.length) {
            $.each(data,function(index, user){

                var user_present = (user.present) ? ' sheet__user--present' : '';
                // var user_warning = (user.warning) ? ' sheet__user--warning--' + user.warning : '';
                var user_warning = '';
                var user_warning_tooltip = ' sheet__user--warning__tooltip';
                var user_warning_tooltip__text = '';

                if(user.balance >= 10) {
                    user_warning_tooltip = '';
                }
                else if((user.balance < 10) && (user.balance > 0)){
                    user_warning = ' sheet__user--warning--yellow';
                    user_warning_tooltip__text = 'Almost empty';
                }
                else{
                    user_warning = ' sheet__user--warning--red';
                    user_warning_tooltip__text = 'Empty';
                }

                var content = '' +
                    '<div class="sheet__user' + user_present + user_warning + user_warning_tooltip + '" id=user_' + user.userId + '>' +
                        '<div class="sheet__user__info">' +
                            '<div class="sheet__user__tick">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24.36"><path d="M32,6.36,29.45,3.82,10.18,23.09,2.54,15.45,0,18,10.18,28.18Z" transform="translate(0 -3.82)"/></svg>' +
                            '</div>' +
                            ' <div class="sheet__user__details">' +
                                '<div class="sheet__user__name">' + user.name + '</div>' +
                                '<div class="sheet__user__extra">' +
                                    '<div class="sheet__user__lastname">' + user.lastname + '</div>' +
                                    '<span class="sheet__user__extra__comma">,</span>' +
                                    '<div class="sheet__user__age">' +
                                        '<span class="sheet__user__age__value">' + user.age + '</span> Years' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="sheet__user__icon">' +
                            '<img src="./assets/img/' + user.gender + '.svg" alt="male user">' +
                            '<div class="sheet__user__warning">' +
                                '<span class="sheet__user__tooltip"><span>' + user_warning_tooltip__text + '</span></span>' +
                                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 19"><path d="M1,21H23L12,2Zm12-3H11V16h2Zm0-4H11V10h2Z" transform="translate(-1 -2)"/></svg>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                sheet__users.append(content);
            });
            updateCounter();
        }
        
    });

    function initHome() {
        displayIntro();
    }

    function displayIntro() {

        var cookie = getCookie('showintro');
        var loader = $('.loader');
        var loader__container = $('.loader__container');
        // console.log('cookie', cookie);
        
        if (!cookie) {
            loader.addClass('loader--visible');
            
            setTimeout(function() {
                loader__container.fadeOut( "slow", function() {
                    // Animation complete.
                });
                setCookie("showintro", "1", 1000);

                setTimeout(function() {
                    loader.fadeOut( "slow", function() {
                        // Animation complete.
                    });
                }, 500);

            }, 2000);

            loader.removeClass('visible');
            
        }

    }

    function setCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // INIT
    if ($('body').hasClass('page-home')) initHome();

    // INIT LAZYLOAD
    // $('img.lazy').lazyload({
    //     threshold: '100%',
    //     effect: 'fadeIn',
    //     // load: resize,
    //     placeholder: ''
    // });

});


