var canvas = require('canvas-api-wrapper')
var fs = require('fs')
var d3 = require('d3-dsv')
var nameStamp = require('name-stamp')

;(async () => {
  var items = []
  var courses = await canvas('https://byui.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=5')

  courseIds = courses.filter(course => course.account_id==42).map(c => c.id)

  await Promise.all(courseIds.map(async cid => {
    course = canvas.getCourse(cid)
    await course.modules.getAll(true)
    course.modules.forEach(module => {
      module.items.forEach(item => {
        items.push({
          "Course Id": cid,
          "Module Name": module.name,
          "Item Title": item.title,
          "Item isPublished": item.published,
          "Item Type": item.type,
          "Item Url": item.html_url,
        })
      })
    })
    await course.files.getAll()
    course.files.map(file => {
      items.push({
        "Course Id": cid,
        "Module Name": "",
        "Item Title": file.display_name,
        "Item isPublished": "",
        "Item Type": "file",
        "Item Url": file.url,
      })
    })
    console.log(cid)
  }))

  fs.writeFileSync(`data_${nameStamp()}.csv`,d3.csvFormat(items))
  // fs.writeFileSync('data.json',JSON.stringify(courses))
})().catch(console.error)