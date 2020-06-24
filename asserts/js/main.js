$(document).ready( function() {
    /* get i18n language */
    let lang = 'zh-TW'
    let gets = getURL();
    if (gets.length > 0) {
        if (gets.lang == 'en') {
            lang = 'en';
            let eng_name = ''; // your English name
            document.title = `${eng_name} - resume`
        }
    }

    /* render data from vuejs */
    $.getJSON(`/data/lang/${lang}.json`, function(json) {
        /* header */
        let header = new Vue({
            el: '#vue-header',
            data: {
                name: json.name,
                title: json.title,
                menu: json.header.menu
            },
            mounted: function () {
                /* nav menu animation */
                $('.nav-wrapper ul li:not(:last-child) a').on('click', function () {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    let current_herf = $(this).attr('href');
                    let href_top = $(current_herf).position().top - $('nav').height() - 7.5*2;

                    ainmationScrollTop(href_top, 300, 'linear');
                });

                $('ul.sidenav li:not(:last-child) a').on('click', function () {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    $('.sidenav').sidenav('close');

                    let current_herf = $(this).attr('href');
                    let href_top = $(current_herf).position().top - $('nav').height() - 7.5*2;

                    ainmationScrollTop(href_top, 300, 'linear');
                });

                $('.brand-logo').on('click', function () {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    ainmationScrollTop(0, 300, 'linear');
                });

            }
        });

        /* footer */
        let footer = new Vue({
            el: '#vue-footer',
            data: {
                pdf: json.pdf
            }
        });

        /* main */
        let main = new Vue({
            el: '#vue-body',
            data: {
                name: json.name,
                title: json.title,
                avator: json.avator,
                about: json.about,
                schools: json.edu,
                exps: json.exp,
                skills: json.skill,
                projects: json.project,
                infos: json.contact.data,
                links: json.contact.link
            },
            methods: {
                offsetClass: function (index) {
                    return !(index % 2) ? 'offset-l2' : '';
                } 
            },
            mounted: function () {
                /* materialize component initial */
                $('.sidenav').sidenav();
                $('textarea#message').characterCounter();
                $('.parallax').parallax();

                /* AOS initial */
                AOS.init({
                    easing: 'ease-in-out-sine',
                    duration: 700
                });

                /* post mail */
                $('.send-mail').on('click', function (e) {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    let success_str = (lang == 'zh-TW') ? '感謝您的回信！' : 'Thanks for your reply!';
                    let error_str = (lang == 'zh-TW') ? '請正確的填寫表單！' : 'Please filled form corrently!';

                    let name = e.target.form[0].value;
                    let mail = e.target.form[1].value;
                    let subj = e.target.form[2].value;
                    let mesg = e.target.form[3].value;

                    if (!name || !mail || !subj || !mesg) {
                        M.toast({html: error_str,  classes: 'failed'});
                    } else {
                        $.ajax({
                            type: "POST",
                            url: "/exec/post-mail.php",
                            data: { "name": name, "mail": mail, "subj": subj, "mesg": mesg},
                            success: function (res) {
                                if (res == 'good') {
                                    M.toast({html: success_str, classes: 'successed'});
                                } else {
                                    M.toast({html: error_str, classes: 'failed'});
                                }
                            }
                        });
                    }
                })
            }
        });
    });
});

function getURL() 
{
    let url = window.location.href;
    let url_arr = url.split('?');
    let get_dict = {};

    url_arr.splice(0, 1);
    url_arr.forEach(
        function(element) {
            let values = element.split('=');
            if (values.length > 1) {
                get_dict[values[0]] = values[1];
            }
        }
    );

    get_dict.length = url_arr.length;

    return get_dict;
}

function ainmationScrollTop(top, speed, method)
{
    $('body, html').stop(true, true).animate({
        scrollTop: top
    }, speed, method);
}