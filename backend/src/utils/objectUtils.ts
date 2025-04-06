import * as _ from 'lodash'

const getInfoData = ({ fields = [], object = {} }: { fields: string[]; object: any }) => {
  return _.pick(object, fields)
}

const omitInfoData = ({ fields = [], object = {} }: { fields: string[]; object: any }) => {
  return _.omit(object, fields)
}

//['a','b'] => {a: 1, b: 1}
const getSelectData = (select: string[]) => {
  return Object.fromEntries(select.map((e) => [e, 1]))
}

//['a','b'] => {a: 0, b: 0}
const unSelectData = (select: string[]) => {
  return Object.fromEntries(select.map((e) => [e, 0]))
}

export { getInfoData, omitInfoData, getSelectData, unSelectData }
