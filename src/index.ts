import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nazrin-core'

export const inject = ['nazrin']

export const name = 'nazrin-video-bilibili-nologin'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  const thisPlatform = "bilibili"
  ctx.nazrin.video.push(thisPlatform)

  ctx.on("nazrin/video", async (ctx, keyword) => {
    let result = await ctx.http.get(`https://api.xingzhige.com/API/b_search/?msg=${keyword}&n=15`)
    let findList = []

    if (result.code !== 0) {
      findList = [
        {
          err: true,
          platform: thisPlatform,
        }
      ]
    } else {
      for (let item of result.data) {
        if (item.type === "video") {
          findList.push({
            name: item.video.title,
            author: item.owner.name,
            cover: item.video.cover,
            url: item.video.url,
            platform: thisPlatform,
            err: false,
          })
        }
      }
    }
    ctx.emit('nazrin/search_over', findList)
  })

  ctx.on('nazrin/parse_video', async (ctx, platform, url) => {
    if (platform !== thisPlatform) {return}
    let result = await ctx.http.get(`https://api.xingzhige.com/API/b_parse/?url=${url}`)
    if (result.code !== 0) {
      ctx.emit('nazrin/parse_error', result.msg)
    } else {
      let {data} = result
      ctx.emit('nazrin/parse_over', 
        data.video.url,
        data.video.title,
        data.owner.name,
        data.video.fm,
      )
    }
  })
}
