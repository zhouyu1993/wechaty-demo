const { Wechaty, Friendship } = require('wechaty')
const { FileBox } = require('file-box')
const moment = require('moment')

let botInfo = {
  root: 'RainJoy',
  name: 'RainJoy-bot',
  contactName: 'RainJoy1993',
  contactAlias: 'RainJoy1993',
  roomTopic: 'RainJoy-bot',
}

const bot = new Wechaty({
  name: botInfo.name,
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

  console.log(`${qrcode}\nScan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`)
})

bot.on('login', async contactSelf => {
  try {
    const avatar = await contactSelf.avatar()
    const avatarName = avatar.name

    botInfo.avatar = avatar
    botInfo.avatarName = avatarName

    const message = `${botInfo.name} login`
    console.log(message)

    // const filehelper = bot.Contact.load('filehelper')
    //
    // if (filehelper) {
    //   await filehelper.say(message)
    // }
    //
    // setTimeout(async () => {
    //   const contactFindByName = await bot.Contact.find({
    //     name: botInfo.contactName
    //   })
    //
    //   if (contactFindByName) {
    //     await contactFindByName.say(message)
    //   } else {
    //     const contactFindByAlias = await bot.Contact.find({
    //       alias: botInfo.contactAlias
    //     })
    //
    //     if (contactFindByAlias) {
    //       await contactFindByAlias.say(message)
    //     }
    //   }
    //
    //   const room = await bot.Room.find({
    //     topic: botInfo.roomTopic
    //   })
    //
    //   if (room) {
    //     await room.say(message)
    //   }
    // }, 3000)
  } catch (e) {
    console.error('catch:', e)
  }
})

bot.on('logout', async contactSelf => {
  try {
    const message = `${botInfo.name} logout`

    console.log(message)
  } catch (e) {
    console.error('catch:', e)
  }
})

bot.on('message', async message => {
  try {
    const messageFrom = message.from() // Contact. 获取发送消息的联系人
    const messageTo = message.to() // 获取消息发送的联系人。在微信群中，Message.to() 会返回 null
    const messageText = message.text() // string. 获取消息的文本内容
    const messageRoom = message.room() // Room || null. 获取消息所在的微信群，如果这条消息不在微信群中，会返回null
    const messageType = message.type() // MessageType
    // 1: 链接 MessageType.Attachment, 2: 语音 MessageType.Audio 6: 图片 MessageType.Image, 7: 文本 MessageType.Text, 13 视频 Message.Video
    // MessageType.Unknown, MessageType.Contact, MessageType.Emoticon, MessageType.Url
    const messageDate = moment(message.date()).format('YYYY-MM-DD HH:mm:ss') // 消息发送的时间

    console.log(message)
    console.log(`Message: ${message} Time: ${messageDate} Self: ${message.self()}`)

    let reply = ''

    if (messageRoom) {
      // 群聊

      const messageRoomTopic = await messageRoom.topic()

      if (messageFrom.name() === messageRoomTopic) {
        // 群系统

        if (/邀请"(.*?)"加入了群聊/.test(messageText)) {
          let userName = ''
          messageText.replace(/(?<=邀请").*?(?="加入了群聊)/, function (value) {
          	userName = value

          	return value
          })

          reply = `欢迎【${userName}】👏👏`
        } else if (/^你将"(.*?)"移出了群聊/.test(messageText)) {
          reply = '已踢😠😠'
        }
      }
    } else if (message.self() || (messageFrom.name() === botInfo.root && messageTo.name() === 'File Transfer')) {
      if (messageType === bot.Message.Type.Text) {
        // 文本消息

        if (/^添加【(.*?)】群成员$/.test(messageText)) {
          let topic = ''
          messageText.replace(/(?<=添加【).*?(?=】群成员$)/, function (value) {
            topic = value

            return value
          })

          const room = await bot.Room.find({
            topic,
          })

          if (room) {
            const memberList = await room.memberList()
            
            for (let i = 0; i < memberList.length; i++) {
              const contact = memberList[i]

              const isFriend = contact.friend()

              if (!isFriend) {
                console.log('添加contact', contact)

                const res = await bot.Friendship.add(contact, `Nice to meet you! I am ${botInfo.name}!`)

                console.log('啦啦啦', res)
              }
            }
          }
        }
      }
    } else {
      if (messageType === bot.Message.Type.Text) {
        // 文本消息

        if (/^(ding)$/i.test(messageText)) {
          reply = 'dong'
        } else if (/^(周宇|小宇|宇哥|宇哥哥|宇神|小宇同学|小雨同学|周宇同学|周宇大哥|大哥|帅哥)(\?|？|!|！|~|～)*?$/.test(messageText)) {
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
        } else if (/(拉|让)我进群/.test(messageText)) {
          const room = await bot.Room.find({
            topic: botInfo.roomTopic
          })

          if (room) {
            const roomHasContact = await room.has(messageFrom)

            if (roomHasContact) {
              reply = '你已经在群里了呀！'
            } else {
              reply = `稍等...等会儿${botInfo.name}就把你拉进群！`
            }
          }
        } else if (/^问(:|：)/.test(messageText)) {
          const question = messageText.replace(/问：/, '')

          reply = `https://www.baidu.com/s?word=${encodeURIComponent(question)}`
        }
      }
    }

    if (!reply) return

    await message.say(reply)
  } catch (e) {
    console.error('catch:', e)
  }
})

bot.on('friendship', async (friendship) => {
  try {
    const friendshipType = friendship.type()

    if (friendshipType === Friendship.Type.Receive){
      // 收到添加好友的申请
      const friendshipHello = friendship.hello()
      if (/^(Hello World)$/.test(friendshipHello)) {
        // 打招呼符合要求，自动同意添加好友
        await friendship.accept()
      }
    } else if (friendshipType === Friendship.Type.Confirm) {
      // 同意添加好友
      const friendshipContact = friendship.contact()
      const friendshipContactName = friendshipContact.name()

      const contactFindByName = await bot.Contact.find({
        name: friendshipContactName
      })

      await contactFindByName.say(`${friendshipContactName}！I am ${botInfo.name}! Nice to meet you!`)
    }
  } catch (e) {
    console.error('catch:', e)
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
