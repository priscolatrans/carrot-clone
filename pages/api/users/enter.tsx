import twilio from 'twilio';
import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/client/client";

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const { phone, email } = req.body;
  const user = phone ? { phone: +phone } : email ? { email } : null;
  if (!user) return res.status(400).json({ ok: false })

  const payload = Math.floor(100000 + Math.random() * 900000) + '';
  const token = await client.token.create({
    data: {
      payload, // token.
      user: {
        connectOrCreate: {
          where: {
            ...user
          },
          create: {
            name: 'anonymous',
            ...user
          },
        }
      }
    }
  });
  if (phone) {
    const message = await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MSID,
      to: process.env.MY_PHONE!, // Variables that definitely exist
      body: `Your login token is ${payload}`,
    })
    console.log(message);
  }
  return res.json({
    ok: true,
  })
  console.log(token)
}

export default withHandler("POST", handler);

// 1. 폰 번호 전송
// 2. 유저 확인
// 3. 없다면 회원가입 있다면 DB 정보를 가져온다
// 4. 유저 토큰을 받아온다.