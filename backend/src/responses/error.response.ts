'use strict'

import { HttpResponse } from '~/constants/httpStatusCode'

const { ReasonPhrases, StatusCodes } = HttpResponse

class ErrorResponse extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    Object.setPrototypeOf(this, new.target.prototype) // Đảm bảo kế thừa đúng
  }
}

// Xung đột request
class ConflictRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.CONFLICT, statusCode: number = StatusCodes.CONFLICT) {
    super(message, statusCode)
  }
}

// Lỗi request không hợp lệ
class BadRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.BAD_REQUEST, statusCode: number = StatusCodes.BAD_REQUEST) {
    super(message, statusCode)
  }
}

// Lỗi xác thực thất bại
class UnauthorizedError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.UNAUTHORIZED, statusCode: number = StatusCodes.UNAUTHORIZED) {
    super(message, statusCode)
  }
}

// Lỗi tài nguyên không tìm thấy
class NotFoundError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.NOT_FOUND, statusCode: number = StatusCodes.NOT_FOUND) {
    super(message, statusCode)
  }
}

// Lỗi không có quyền truy cập
class ForbiddenError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.FORBIDDEN, statusCode: number = StatusCodes.FORBIDDEN) {
    super(message, statusCode)
  }
}

// Export các class để sử dụng
export { ErrorResponse, ConflictRequestError, BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError }
