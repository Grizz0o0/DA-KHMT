import { ObjectId } from 'mongodb'

const convertToObjectId = (id: string) => {
  return new ObjectId(id)
}

export { convertToObjectId }
