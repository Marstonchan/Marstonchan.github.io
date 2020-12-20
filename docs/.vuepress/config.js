module.exports = {
    title: "Marston的学习笔记",
    locals: {
        '/': {
            lang: 'zh-CN',
            title: 'Marston的学习笔记'
        }
    },
    head: [
        ['link', { rel: 'icon', href: '/img/logo.ico' }]
    ],
    themeConfig: {
        nav: [
            { text: '主页', link: '/' },
            {
                text: '前端笔记',
                items: [
                    { text: 'JS', link: '/frontendNote/javascript/' },
                    { text: 'CSS', link: '/frontendNote/css/' },
                    { text: 'HTML', link: '/frontendNote/html/' },
                    { text: '浏览器', link: '/frontendNote/browser/' },
                    { text: '网络', link: '/frontendNote/net/' },
                    { text: '工程化', link: '/frontendNote/engineering/' }
                ]
            },
            {
                text: '进军全栈',
                items: [
                    { text: 'nodejs', link: '/fullStack/nodejs/' },
                    { text: 'koa', link: '/fullStack/koa/' }
                ]
            },
            {
                text: '面经总结',
                items: [
                    { text: '日常实习面经', link: '/myinterview/DailyIntership/' },
                    { text: '2021春招面经', link: '/myinterview/2021Spring/' }
                ]
            },

        ],
        sidebar: {
            // 前端笔记总结 侧边栏
            '/frontendNote/javascript/': [
                '/frontendNote/javascript/',
                '/frontendNote/javascript/ES6Standard',
                '/frontendNote/javascript/JSDataType',
                '/frontendNote/javascript/ergodic',
                '/frontendNote/javascript/typeChange',
                '/frontendNote/javascript/buildInMethods',
                '/frontendNote/javascript/object',
                '/frontendNote/javascript/function',
                '/frontendNote/javascript/JSExecution',
                '/frontendNote/javascript/this',
                '/frontendNote/javascript/domAndBom',
                '/frontendNote/javascript/module',
                '/frontendNote/javascript/asyncCoding',
                '/frontendNote/javascript/ajax',
            ],
            '/frontendNote/css/': [
                '/frontendNote/css/',
            ],
            '/frontendNote/html/': [
                '/frontendNote/html/',
            ],
            '/frontendNote/browser/': [
                '/frontendNote/browser/',
            ],
            '/frontendNote/net/': [
                '/frontendNote/net/',
            ],
            '/frontendNote/engineering/': [
                '/frontendNote/engineering/',
            ],

            // 进军全栈 侧边栏
            '/fullStack/nodejs/': [
                '/fullStack/nodejs/'
            ],
            '/fullStack/koa/': [
                '/fullStack/koa/'
            ],

            // 面经侧边栏
            '/myinterview/DailyIntership/': [
                '/myinterview/DailyIntership/',
                '/myinterview/DailyIntership/ByteBit1',
                '/myinterview/DailyIntership/CVTE1',
                '/myinterview/DailyIntership/CVTE2'
            ],
            '/myinterview/2021Spring/': [
                '/myinterview/2021Spring/'
            ]
        },
        plugins: ['@vuepress/active-header-links']
    }
}