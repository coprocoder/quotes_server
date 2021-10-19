/*  ### Оболочка объектов в БД

    Каждый объект с полями вида {key: value} оборачивается в оболочку вида {key: {_V: value, _T: time}}
    для того, чтобы отслеживать последнее время изменения каждого поля.
    Это даёт возможность отдавать и принимать только актуальную информацию.
*/

const val_key = '_V'
const time_key = '_T'

/* Оборачивает объекты в оболочки
    ({ value : 1}, <timestamp>) =>  { value: {  _V: 1,  _T: <timestamp>} }
*/
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

/* Разворачивает объекты 
    { value: {  _V: 1,  _T: <timestamp>} } => { value : 1}
*/
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