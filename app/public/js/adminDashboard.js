// function createEmbedError(url) {
//     let errMsg = document.createElement('span')
//     errMsg.innerHTML = `Cannot GET link ${url}.`
//     return errMsg
// }

// Array.from(document.getElementsByTagName('iframe')).forEach((embed) => {
//     embed.onload = () => {
//         console.log('load')
//         fetch(embed.src, { method: 'get'})
//         .catch((err) => {
//             console.log(err)
//             console.log('test')
//             embed.replaceWith(createEmbedError(embed.src))
//         })
//     }
//     console.log(Object.entries(embed))
// })