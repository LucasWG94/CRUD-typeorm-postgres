import { createTransport } from 'nodemailer'

export const sendMail = async (to: string, subject: string, text: string, html: string) => {
	const transport = createTransport({
		host: process.env.MAIL_HOST,
		port: parseInt(process.env.MAIL_PORT),
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS
		}
	})

	return await transport.sendMail({ from: '"____" <recovery@____.com>', to, subject, text, html })
}