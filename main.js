var canvas = require('canvas-api-wrapper')
var fs = require('fs')
var d3 = require('d3-dsv')
var nameStamp = require('name-stamp');

// Gets items of the given subcall
// returns a flattened list of the results
async function getSubItems(initialId, subItemKey, initialApiCall, secondaryApiCall) {
    let collection = [];
    let courseItems = await canvas.get(initialApiCall(initialId));
    let apiCalls = courseItems.map((item) => secondaryApiCall(initialId, item[subItemKey]));
    collection = collection.concat(  ...await Promise.all(apiCalls.map(async apiuri => await canvas.get(apiuri)))   );
    return collection;
}

(async () => {
    var items = []
    var courseTitle;
    var sisId;
    var courses = await canvas.get('/api/v1/accounts/1/courses?enrollment_term_id=5');
    courses = courses.slice(0,10);

    // Filter to courses we want
    courseIds = courses.filter(course => course.account_id == 42 || course.account_id == 39).map(c => c.id)
    let i = 0;
    // Make Initial Api Call
    // for (let cid of courseIds)
    // {
    //     console.log(`Running course: ${cid}, item ${++i}/${courseIds.length}`);
    //     course = await canvas.get(`/api/v1/courses/${cid}`)
    //     // This one works if the module items list isn't too long
    //     courseModules = await canvas.get(`/api/v1/courses/${course.id}/modules`);
    //     for (let courseModule of courseModules)
    //     {
    //         if (courseModule.id === undefined)
    //             debugger;
    //         var moduleItems = await canvas.get(`/api/v1/courses/${course.id}/modules/${courseModule.id}/items`)
    //         for (let moduleItem of moduleItems)
    //         {
    //             items.push({
    //                 "Course Code": course.course_code,
    //                 "Course Title": course.name,
    //                 "Course ID": course.id,
    //                 //"Sis ID": course.sis_course_id,
    //                 "Module": courseModule.name,
    //                 "Item Title": moduleItem.title,
    //                 "Item Type": moduleItem.type,
    //                 "Published": moduleItem.published,
    //                 "Item Url": moduleItem.html_url,
    //             })
    //         }
    //     }
    // }
    var allReports = await Promise.all(courseIds.map(async cid => {
        let localItems = [];
        // console.log(`Running course: ${cid}, item ${++i}/${courseIds.length}`);
        let course = await canvas.get(`/api/v1/courses/${cid}`)
        // This one works if the module items list isn't too long
        let courseModules = await canvas.get(`/api/v1/courses/${course.id}/modules`);
        for (let courseModule of courseModules)
        {
            if (courseModule.id === undefined)
            debugger;
            let moduleItems = await canvas.get(`/api/v1/courses/${course.id}/modules/${courseModule.id}/items`)
            for (let moduleItem of moduleItems)
            {
                localItems.push ({
                    "Course Code": course.course_code,
                    "Course Title": course.name,
                    "Course ID": course.id,
                    //"Sis ID": course.sis_course_id,
                    "Module": courseModule.name,
                    "Item Title": moduleItem.title,
                    "Item Type": moduleItem.type,
                    "Published": moduleItem.published,
                    "Item Url": moduleItem.html_url,
                })
            }
        }
        console.log(`Finished course: ${cid}, item ${++i}/${courseIds.length}`);
        return localItems;
        
    }))
    
    var items = items.concat(...allReports);
    console.log(items.length)
    // Filter to only published items
    items = items.filter((item) => item.Published === true)

    var name = `data_${nameStamp()}.csv`;
    fs.writeFileSync(name, d3.csvFormat(items))
    console.log(`saved file as ${name}`);
    console.log("Done");
    // fs.writeFileSync('data.json',JSON.stringify(courses))
})().catch(console.error)