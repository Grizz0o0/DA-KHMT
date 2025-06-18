import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'

config()

// Tạo đối tượng SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

// Hàm khởi tạo SendEmailCommand
const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

// Hàm tổng quát để gửi email
export const sendEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject
  })

  return sesClient.send(sendEmailCommand)
}

// Hàm gửi email xác thực đăng ký tài khoản
export const sendVerifyEmailRegister = (toAddress: string, token: string) => {
  const subject = 'Xác thực email đăng nhập'
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}&email=${encodeURIComponent(toAddress)}`
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center;">
        <h2 style="color: #333333;">Fly24h✈️</h2>
      </div>
      <h3 style="color: #333333;">Xin chào!</h3>
      <p style="color: #555555; line-height: 1.6;">
        Kích vào nút "Xác thực email" bên dưới để kích hoạt tài khoản của bạn.
        Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${verificationLink}"
           style="background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Xác thực email
        </a>
      </div>
      <p style="color: #999999; font-size: 12px;">
        Nếu bạn gặp sự cố khi nhấp vào nút "Xác thực email", hãy sao chép và dán URL sau vào trình duyệt web của bạn:
        <br/>
        <a href="${verificationLink}" style="color: #3498db;">
          ${verificationLink}
        </a>
      </p>
      <p style="color: #999999; font-size: 12px;">
        Trân trọng,<br/>Fly24h✈️
      </p>
    </div>
  `

  return sendEmail(toAddress, subject, body)
}

// Hàm gửi email đặt lại mật khẩu
export const sendForgotPasswordEmail = (toAddress: string, token: string) => {
  const subject = 'Đặt lại mật khẩu tài khoản của bạn'
  const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(toAddress)}`
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center;">
        <h2 style="color: #333333;">Fly24h✈️</h2>
      </div>
      <h3 style="color: #333333;">Xin chào!</h3>
      <p style="color: #555555; line-height: 1.6;">
        Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Nhấn nút "Đặt lại mật khẩu" bên dưới để tiếp tục.
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetPasswordLink}"
           style="background-color: #e74c3c; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Đặt lại mật khẩu
        </a>
      </div>
      <p style="color: #999999; font-size: 12px;">
        Nếu bạn gặp sự cố khi nhấp vào nút "Đặt lại mật khẩu", hãy sao chép và dán URL sau vào trình duyệt web của bạn:
        <br/>
        <a href="${resetPasswordLink}" style="color: #3498db;">
          ${resetPasswordLink}
        </a>
      </p>
      <p style="color: #999999; font-size: 12px;">
        Trân trọng,<br/>Fly24h✈️
      </p>
    </div>
  `

  return sendEmail(toAddress, subject, body)
}
