/**
 * main.js
 */

'use strict';

$(document).ready( () => {
    /* get array from url */
    let getURL = () => {
        let url = window.location.href;
        let url_arr = url.split('?');
        let get_dict = {};

        url_arr.splice(0, 1);
        url_arr.forEach( (element) => {
                let values = element.split('=');
                if (values.length > 1) {
                    get_dict[values[0]] = values[1];
                }
            }
        );

        get_dict.length = url_arr.length;
        return get_dict;
    };

    /* get i18n language */
    let lang = 'zh-TW';
    let gets = getURL();
    if (gets.length > 0) {
        if (gets.lang == 'en') {
            let en_name = ''; // write down your English name
            lang = 'en';
            document.title = `${en_name} - Resume`;
        }
    }

    /* run progress bar */
    let move = (pers) => {
        var width = 1;
        pers = pers > 100 ? 100 : pers;
        let frame = () => {
            if (width >= pers) {
                clearInterval(id);
            } else {
                width++;
                $("#myBar").width(width + "%");
                $('#myNum').text(width + "%");
            }
        };
        var id = setInterval(frame, 10);
    };

    /* get data from json file */
    let data;
    $.getJSON(`/data/lang/${lang}.json`, (json) => {
        data = json;
    }).done( () => {
        /* render data from vuejs */
        let header = new Vue({ /* header */
            el: '#vue-header',
            data: {
                name: data.name,
                title: data.title,
                menu: data.header.menu
            },
            mounted: () => {
                /* animation scroll helper function */
                let animationScrollTop = (top, speed, method) => {
                    $('body, html').stop(true, true).animate({
                        scrollTop: top
                    }, speed, method);
                };

                /* nav menu animation */
                $('.nav-wrapper ul li:not(:last-child) a').on('click', () => {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    let current_herf = $(this).attr('href');
                    let href_top = $(current_herf).position().top - $('nav').height() - 7.5*2;

                    animationScrollTop(href_top, 300, 'linear');
                });

                /* sidenav menu animation */
                $('ul.sidenav li:not(:last-child) a').on('click', () => {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    $('.sidenav').sidenav('close');

                    let current_herf = $(this).attr('href');
                    let href_top = $(current_herf).position().top - $('nav').height() - 7.5*2;

                    animationScrollTop(href_top, 300, 'linear');
                });

                /* nav logo animation */
                $('.brand-logo').on('click', () => {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    animationScrollTop(0, 300, 'linear');
                });

                /* set progress 0% -> 20% */
                move(20);
            }
        });

        let footer = new Vue({ /* footer */
            el: '#vue-footer',
            data: {
                pdf: data.pdf
            },
            mounted: () => {
                /* set progress 20% -> 40% */
                move(40);
            }
        });

        let main = new Vue({ /* main */
            el: '#vue-body',
            data: {
                name: data.name,
                title: data.title,
                avatar: data.avatar,
                about: data.about,
                schools: data.edu,
                exps: data.exp,
                skills: data.skill,
                projects: data.project,
                infos: data.contact.data,
                links: data.contact.link
            },
            methods: {
                offsetClass: (index) => {
                    return !(index % 2) ? 'offset-l2' : '';
                } 
            },
            mounted: () => {
                /* materialize component initial */
                $('.sidenav').sidenav();
                $('textarea#message').characterCounter();
                $('.parallax').parallax();

                /* initial send mail textarea to markdown editor */
                var simplemde = new SimpleMDE({ 
                    element: $("#message")[0],
                    status: false,
                    toolbar: false, 
                    toolbarTips: false,
                });

                /* set progress 40% -> 100% */
                move(100);

                /* wait for progress bar growing to 100% */
                setTimeout( () => {
                    /* close rendering mask */
                    $('.before-render').hide();
                    $('body').css({'overflow': "unset"});

                    /* AOS initial */
                    AOS.init({
                        easing: 'ease-in-out-sine',
                        duration: 700
                    });
                }, 2500);

                /* post mail */
                $('form button').on('click', (e) => {
                    event.preventDefault(); 
                    event.stopPropagation(); 

                    let success_str = (lang == 'zh-TW') ? '感謝您的回信！' : 'Thanks for your reply!';
                    let error_str = (lang == 'zh-TW') ? '請正確的填寫表單！' : 'Please filled form corrently!';

                    let name = e.target.form[0].value;
                    let mail = e.target.form[1].value;
                    let subj = e.target.form[2].value;
                    let mesg = simplemde.value();

                    /* check if any field is empty */
                    if (!name || !mail || !subj || !mesg) {
                        M.toast({html: error_str,  classes: 'failed'});
                    } else {
                        /* or ajax post a mail from post-mail.php */
                        $.ajax({
                            type: "POST",
                            url: "/exec/post-mail.php",
                            data: { "name": name, "mail": mail, "subj": subj, "mesg": mesg},
                            success: (res) => {
                                if (res == 'good') {
                                    M.toast({html: success_str, classes: 'successed'});
                                } else {
                                    M.toast({html: error_str, classes: 'failed'});
                                }
                            }
                        });
                    }
                });
            }
        });
    });
});
