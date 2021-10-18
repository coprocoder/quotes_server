const val_key = '_V'
const time_key = '_T'

const wrap = (obj, time) => {
    // console.log('wrap args', obj, time)
    obj = JSON.parse(JSON.stringify(obj))
    if (Object.prototype.isPrototypeOf(obj) && !Array.prototype.isPrototypeOf(obj))
        Object.keys(obj).forEach(k => {
            obj[k] = wrap(obj[k], time)
        })
    return {
        [val_key]: obj,
        [time_key]: time
    }
}

const unwrap = (obj) => {
    // console.log('unwrap args', obj)
    obj = JSON.parse(JSON.stringify(obj[val_key]))
    if (obj && obj._id)
        delete obj._id
    if (Object.prototype.isPrototypeOf(obj) && !Array.prototype.isPrototypeOf(obj))
        Object.keys(obj).forEach(k => {
            obj[k] = unwrap(obj[k])
        })
    return obj
}

module.exports = { wrap, unwrap, val_key, time_key }