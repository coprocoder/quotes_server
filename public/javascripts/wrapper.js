const wrap = (obj, time) => {
    console.log('wrap args', obj, time)
    obj = JSON.parse(JSON.stringify(obj))
    if (Object.prototype.isPrototypeOf(obj) && !Array.prototype.isPrototypeOf(obj))
        Object.keys(obj).forEach(k => {
            obj[k] = wrap(obj[k], time)
        })
    return {
        value: obj,
        time
    }
}

const unwrap = (obj) => {
    console.log('unwrap args', obj)
    obj = JSON.parse(JSON.stringify(obj.value))
    if (Object.prototype.isPrototypeOf(obj) && !Array.prototype.isPrototypeOf(obj))
        Object.keys(obj).forEach(k => {
            obj[k] = unwrap(obj[k])
        })
    return obj
}

module.exports = { wrap, unwrap }