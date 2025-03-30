import databaseService from '~/services/database.services'
import { convertToObjectId } from '~/utils/mongoUtils'

const checkEmailExist = async (email: string) => {
  const user = await databaseService.users.findOne({ email })
  return Boolean(user)
}

export { checkEmailExist }
