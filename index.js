const { Wechaty } = require('wechaty')
const moment = require('moment')

const bot = new Wechaty({
  name : 'RainJoy-bot',
})

function getHour () {
  const time = new Date()
  const hour = time.getHours()

  if (hour >= 0 & hour < 6) {
    return 0
  } else if (hour >= 6 & hour < 10) {
    return 1
  } else if (hour >= 10 & hour < 11) {
    return 2
  } else if (hour >= 11 & hour < 14) {
    return 3
  } else if (hour >= 14 & hour < 18) {
    return 4
  } else if (hour >= 18 & hour < 20) {
    return 5
  } else if (hour >= 20 & hour < 23) {
    return 6
  } else if (hour >= 23 & hour < 24) {
    return 7
  }
}

bot.on('scan', (qrcode, status) => {
  if (!/201|200/.test(String(status))){
    const loginUrl = qrcode.replace(/\/qrcode\//, '/l/')

    require('qrcode-terminal').generate(loginUrl, {
      small: true
    })
  }

  console.log(`Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`)
})

bot.on('login', async user => {
  console.log(user)
  console.log(`User ${user} logined`)

  try {
    await bot.say('Wechaty login')
  } catch (e) {
    console.log('RainJoy-bot', e)
  }
})

bot.on('logout', async user => {
  console.log(user)
  console.log(`User ${user} logouted`)
})

bot.on('message', async message => {
  console.log(`Message: ${message}`)

  const messageFrom = message.from() // Contact
  const messageTo = message.to() // Contact || null
  const messageText = message.text() // string
  const messageRoom = message.room() // Room || null. 群聊
  const messageType = message.type() // MessageType
  // 1: 链接 MessageType.Attachment, 2: 语音 MessageType.Audio 6: 图片 MessageType.Image, 7: 文本 MessageType.Text, 13 视频 Message.Video
  // MessageType.Unknown, MessageType.Contact, MessageType.Emoticon, MessageType.Url
  const messageSelf = message.self() // boolean
  const messageDate = moment(message.date()).format('YYYY-MM-DD HH:mm:ss')

  // .toFileBox() ⇒ Promise.<FileBox>
  // .toContact() ⇒ Promise.<Contact>

  let reply = ''

  if (messageRoom) {
    const messageRoomTopic = await messageRoom.topic()
    console.log(`Room: ${messageRoomTopic} Contact: ${messageFrom.name()} Text: ${messageText} Time: ${messageDate}`)

    if (messageRoomTopic === messageFrom.name()) {
      if (/邀请"(.*?)"加入了群聊$/.test(messageText)) {
        let name = ''
        messageText.replace(/(?<=邀请").*?(?="加入了群聊)/, function (value) {
        	name = value

        	return value
        })

        reply = `欢迎【${name}】👏👏`
      } else if (/^你将"(.*?)"移出了群聊$/.test(messageText)) {
        reply = '已踢😠😠'
      }
    }

    if (await message.mentionSelf()) {
      console.log('This message were mentioned me! [You were mentioned] tip ([有人@我]的提示)')
    }
  } else {
    console.log(`Contact: ${messageFrom.name()} Text: ${messageText} Time: ${messageDate}`)

    if (messageType === bot.Message.Type.Text) {
      // 文本

      if (/^(周宇|小宇|宇哥|宇哥哥|宇神|小宇同学|小雨同学|周宇同学|周宇大哥|大哥|帅哥)(\?|？|!|！|~|～)*?$/.test(messageText)) {
        const replys = ['我在～', '怎么了？', '啥事儿？', '嗯嗯～你说']

        reply = replys[Math.floor((Math.random() * replys.length))]
      } else if (/^(早上|中午|下午|晚上)好$/.test(messageText) || /^(早|午|晚)安$/.test(messageText)) {
        const hour = getHour()

        if (hour === 0) {
          reply = '夜深了，别玩了，要乖乖睡觉呦～'
        } else if (hour === 1) {
          reply = '日上三竿啦，起床吃早饭了吗？'
        } else if (hour === 2) {
          reply = '上午在干嘛呢？'
        } else if (hour === 3) {
          reply = '现在是中午，要按时吃饭！对了，午饭吃啥？'
        } else if (hour === 4) {
          reply = '现在是下午，如果困了就来一杯奈雪吧！'
        } else if (hour === 5) {
          reply = '现在的你是否下班了？下班回家开车要小心。道路千万条，安全第一条，行车不规范，小宇两行泪。'
        } else if (hour === 6) {
          reply = '晚上在干嘛呦？'
        } else if (hour === 7) {
          reply = '该睡觉了...'
        }
      } else if (/^问(:|：)/.test(messageText)) {
        const question = messageText.replace(/问：/, '')

        reply = `https://www.baidu.com/s?word=${encodeURIComponent(question)}`
      } else if (/^(ding)$/i.test(messageText)) {
        reply = 'dong'
      }
    }
  }

  if (!reply) return

  try {
    await message.say(reply)
  } catch (e) {
    console.log('RainJoy-bot', e)
  }
})

bot.on('error',  e => console.error('Bot error:', e))

bot.start().catch(async e => {
  console.error('Bot start fail:', e)

  await bot.stop()

  process.exit(-1)
})

const welcome = `
| __        __        _           _
| \\ \\      / /__  ___| |__   __ _| |_ _   _
|  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
|   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
|    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
|                                     |___/
=============== Powered by Wechaty ===============
-------- https://github.com/chatie/wechaty --------
          Version: ${bot.version(true)}
I'm a bot, my superpower is talk in Wechat.
If you send me a 'ding', I will reply you a 'dong'!
__________________________________________________
Hope you like it, and you are very welcome to
upgrade me to more superpowers!
Please wait... I'm trying to login in...
`
console.log(welcome)
