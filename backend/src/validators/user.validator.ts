import 'dotenv/config'
import { checkSchema } from 'express-validator'
import { HEADER } from '~/constants/auth'
import { UserGender } from '~/constants/users'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'

export const loginValidator = checkSchema(
  {
    email: {
      notEmpty: { errorMessage: 'Email không được để trống' },
      isEmail: { errorMessage: 'Email không hợp lệ' },
      trim: true,
      normalizeEmail: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await databaseService.users.findOne({ email: value })
          if (!isExistEmail) {
            return Promise.reject('Email chưa được đăng ký')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
      }
    }
  },
  ['body']
)

export const registerValidator = checkSchema(
  {
    username: {
      notEmpty: { errorMessage: 'Tên người dùng không được để trống' },
      isLength: {
        options: { min: 1, max: 255 },
        errorMessage: 'Tên người dùng phải có từ 1 đến 255 ký tự'
      },
      trim: true
    },
    email: {
      notEmpty: { errorMessage: 'Email không được để trống' },
      isEmail: { errorMessage: 'Email không hợp lệ' },
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await databaseService.users.findOne({ email: value })
          if (isExistEmail) {
            return Promise.reject('Email đã tồn tại')
          }
          return true
        }
      }
    },
    phoneNumber: {
      notEmpty: { errorMessage: 'Số điện thoại không được để trống' },
      matches: {
        options: /^(03|05|07|08|09)[0-9]{8}$/,
        errorMessage: 'Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam hợp lệ'
      },
      trim: true
    },
    password: {
      notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
      }
    },
    confirm_password: {
      notEmpty: { errorMessage: 'Xác nhận mật khẩu không được để trống' },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Xác nhận mật khẩu không khớp')
          }
          return true
        }
      }
    }
  },
  ['body']
)

export const logoutValidator = checkSchema(
  {
    authorization: {
      notEmpty: {
        errorMessage: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
      },
      trim: true
    },
    'x-client-id': {
      notEmpty: {
        errorMessage: `Headers[${HEADER.CLIENT_ID}] không được để trống`
      },
      trim: true
    }
    // 'x-api-key': {
    //   notEmpty: {
    //     errorMessage: `Headers[${HEADER.API_KEY}] không được để trống`
    //   },
    //   trim: true
    // }
  },
  ['headers']
)

export const refreshTokenValidator = checkSchema(
  {
    'x-rtoken-id': {
      notEmpty: {
        errorMessage: `Headers[${HEADER.REFRESHTOKEN}] không được để trống`
      },
      trim: true
    },
    'x-client-id': {
      notEmpty: {
        errorMessage: `Headers[${HEADER.CLIENT_ID}] không được để trống`
      },
      trim: true
    }
  },
  ['headers']
)

export const emailVerifyValidator = checkSchema(
  {
    'x-email-verify': {
      notEmpty: {
        errorMessage: `Headers[${HEADER.REFRESHTOKEN}] không được để trống`
      },
      trim: true
    },
    'x-client-id': {
      notEmpty: {
        errorMessage: `Headers[${HEADER.CLIENT_ID}] không được để trống`
      },
      trim: true
    }
  },
  ['headers']
)

export const forgotPassWordValidator = checkSchema(
  {
    email: {
      notEmpty: { errorMessage: 'Email không được để trống' },
      isEmail: { errorMessage: 'Email không hợp lệ' },
      trim: true,
      normalizeEmail: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await databaseService.users.findOne({ email: value })
          if (!isExistEmail) {
            return Promise.reject('Email chưa được đăng ký')
          }
          return true
        }
      }
    }
  },
  ['body']
)

export const verifyForgotPassWordValidator = checkSchema(
  {
    forgotPasswordToken: {
      notEmpty: { errorMessage: 'forgotPasswordToken không được để trống' },
      trim: true
    },
    email: {
      notEmpty: { errorMessage: 'Email không được để trống' },
      isEmail: { errorMessage: 'Email không hợp lệ' },
      trim: true,
      normalizeEmail: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await databaseService.users.findOne({ email: value })
          if (!isExistEmail) {
            return Promise.reject('Email chưa được đăng ký')
          }
          return true
        }
      }
    }
  },
  ['body']
)

export const resetPasswordValidator = checkSchema(
  {
    password: {
      notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
      }
    },
    confirm_password: {
      notEmpty: { errorMessage: 'Xác nhận mật khẩu không được để trống' },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Xác nhận mật khẩu không khớp')
          }
          return true
        }
      }
    },
    forgotPasswordToken: {
      notEmpty: { errorMessage: 'forgotPasswordToken không được để trống' },
      trim: true
    }
  },
  ['body']
)

export const changePasswordValidator = checkSchema(
  {
    password: {
      notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
      }
    },
    newPassword: {
      notEmpty: { errorMessage: 'Mật khẩu không được để trống' },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
      }
    },
    confirm_newPassword: {
      notEmpty: { errorMessage: 'Xác nhận mật khẩu không được để trống' },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Xác nhận mật khẩu không khớp')
          }
          return true
        }
      }
    }
  },
  ['body']
)

export const deleteUserValidator = checkSchema({
  authorization: {
    in: ['headers'],
    notEmpty: {
      errorMessage: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
    },
    trim: true
  },
  'x-client-id': {
    in: ['headers'],
    notEmpty: {
      errorMessage: `Headers[${HEADER.CLIENT_ID}] không được để trống`
    },
    trim: true
  },
  id: {
    in: ['query'],
    isString: true,
    notEmpty: {
      errorMessage: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
    },
    trim: true
  }
})

export const getUserByIdValidator = checkSchema(
  {
    id: {
      isString: true,
      notEmpty: {
        errorMessage: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
      },
      trim: true
    }
  },
  ['params']
)

export const updateMeValidator = checkSchema(
  {
    username: {
      notEmpty: { errorMessage: 'Tên người dùng không được để trống' },
      isLength: {
        options: { min: 1, max: 255 },
        errorMessage: 'Tên người dùng phải có từ 1 đến 255 ký tự'
      },
      trim: true,
      optional: true,
      escape: true
    },
    email: {
      optional: true,
      isString: { errorMessage: 'Email phải là chuỗi' },
      isEmail: { errorMessage: 'Email không hợp lệ' },
      normalizeEmail: true
    },
    avatar: {
      optional: true,
      isString: { errorMessage: 'Avatar phải là chuỗi' },
      trim: true,
      escape: true
    },
    coverPhoto: {
      optional: true,
      isString: { errorMessage: 'Cover photo phải là chuỗi' },
      trim: true,
      escape: true
    },
    phoneNumber: {
      notEmpty: { errorMessage: 'Số điện thoại không được để trống' },
      isMobilePhone: {
        options: ['vi-VN'],
        errorMessage: 'Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam hợp lệ'
      },
      optional: true,
      trim: true
    },
    dateOfBirth: {
      optional: true,
      isISO8601: {
        options: { strict: true, strictSeparator: true },
        errorMessage: 'Ngày sinh phải có định dạng ISO8601'
      }
    },
    gender: {
      optional: true,
      isString: { errorMessage: 'Giới tính phải là chuỗi' },
      custom: {
        options: (value) => {
          if (!Object.values(UserGender).includes(value)) {
            throw new BadRequestError('Giới tính không hợp lệ')
          }
          return true
        }
      }
    },
    address: {
      optional: true,
      isString: { errorMessage: 'Địa chỉ phải là chuỗi' },
      trim: true,
      escape: true
    }
  },
  ['body']
)
