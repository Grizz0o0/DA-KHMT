import * as _ from 'lodash'

const getInfoData = ({ fields = [], object = {} }: { fields: string[]; object: any }) => {
  return _.pick(object, fields)
}

const omitInfoData = ({ fields = [], object = {} }: { fields: string[]; object: any }) => {
  return _.omit(object, fields)
}

export { getInfoData, omitInfoData }
