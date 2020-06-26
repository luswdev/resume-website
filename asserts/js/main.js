/**
 * main.js
 */

'use strict'

$(document).ready( () => {
    /* get array from url */
    let getURL = () => {
        let url = window.location.href
        let urlArr = url.split('?')
        let getDict = {}

        urlArr.splice(0, 1)
        urlArr.forEach( (element) => {
                let values = element.split('=')
                if (values.length > 1) {
                    getDict[values[0]] = values[1]
                }
            }
        )

        getDict.length = urlArr.length
        return getDict
    }

    /* get i18n language */
    let lang = 'zh-TW'
    let gets = getURL()
    if (gets.length > 0) {
        if (gets.lang === 'en') {
            let eng_name = '' // write down your English name
            lang = 'en'
            document.title = `${eng_name} - Resume`
        }
    }

    var progressBar = new Vue({ 
        el: '#vue-mask',
        data: {
            barWidth: 0,
            isHide: false
        },
        methods: {
            /* run progress bar */
            move(pers) {
                pers = pers > 100 ? 100 : pers
                let frame = () => {
                    if (this.barWidth >= pers) {
                        clearInterval(id)
                    } else {
                        this.barWidth++
                    }
                }
                var id = setInterval(frame, 10)
            }
        }
    })

    /* get data from json file */
    $.getJSON(`/data/lang/${lang}.json`)
    .done( (data) => {
        /* render data from vuejs */
        let header = new Vue({ /* header */
            el: '#vue-header',
            data: {
                name: data.name,
                title: data.title,
                menu: data.header.menu
            },
            methods: {
                /* animation scroll helper function */
                animationScrollTop(top, speed, method) {
                    $('body, html').stop(true, true).animate({
                        scrollTop: top
                    }, speed, method)
                },
                /* nav menu animation */
                navLink(id) {
                    if (id[0] != '#') {
                        window.location.href = id
                        return
                    }

                    let hrefTop = $(id).position().top - $('nav').height() - 7.5*2

                    this.animationScrollTop(hrefTop, 300, 'linear')
                },
                /* sidenav menu animation */
                sidenavLink(id) {
                    $('.sidenav').sidenav('close')

                    if (id[0] != '#') {
                        window.location.href = id
                        return
                    }

                    let hrefTop = $(id).position().top - $('nav').height() - 7.5*2

                    this.animationScrollTop(hrefTop, 300, 'linear')
                }
            },
            mounted: () => {
                /* set progress 0% -> 20% */
                progressBar.move(20)
            }
        })

        let footer = new Vue({ /* footer */
            el: '#vue-footer',
            data: {
                pdf: data.pdf
            },
            mounted: () => {
                /* set progress 20% -> 40% */
                progressBar.move(40)
            }
        })

        let main = new Vue({ /* main */
            el: '#vue-body',
            data: {
                name: data.name,
                title: data.title,
                menu: data.header.menu,
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
                    return !(index % 2) ? 'offset-l2' : ''
                },
                postMail: () => {
                    let successStr = (lang === 'zh-TW') ? '感謝您的回信！' : 'Thanks for your reply!'
                    let errorStr = (lang === 'zh-TW') ? '請正確的填寫表單！' : 'Please filled form corrently!'

                    let name = $('form input')[0].value
                    let mail = $('form input')[1].value
                    let subj = $('form input')[2].value
                    let mesg = this.simplemde.value()

                    /* check if any field is empty */
                    if (!name || !mail || !subj || !mesg) {
                        M.toast({html: errorStr,  classes: 'failed'})
                    } else {
                        $.ajax({
                            type: 'POST',
                            url: '/exec/post-mail.php',
                            data: { name: name, mail: mail, subj: subj, mesg: mesg},
                            success: (res) => {
                                if (res === 'good') {
                                    M.toast({html: successStr, classes: 'successed'})
                                } else {
                                    M.toast({html: errorStr, classes: 'failed'})
                                }
                            }
                        })
                    }
                }
            },
            mounted: () => {
                /* materialize component initial */
                $('.sidenav').sidenav()
                $('.parallax').parallax()

                /* initial send mail textarea to markdown editor */
                this.simplemde = new SimpleMDE({ 
                    element: $('#message')[0],
                    status: false,
                    toolbar: false, 
                    toolbarTips: false,
                })

                /* set progress 40% -> 100% */
                progressBar.move(100)

                /* wait for progress bar growing to 100% */
                setTimeout( () => {
                    /* close rendering mask */
                    progressBar.isHide = true

                    /* AOS initial */
                    AOS.init({
                        easing: 'ease-in-out-sine',
                        duration: 700
                    })
                }, 2500)
            }
        })
    })
})