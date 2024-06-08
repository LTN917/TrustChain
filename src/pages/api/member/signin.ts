// pages/api/member/signIn.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../mongoDB/dbConnect';
import User from '../../../../mongoDB/User';
import crypto from 'crypto';    

const sha256 = (data: string) => crypto.createHash('sha256').update(data).digest('hex');

const signIn = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();
  const { organizationName, organizationCode, password } = req.body;

  if (req.method === 'POST') {
    try {
      console.log('[test]', req.body );
      const hashedPassword = sha256(password);
      const user = await User.findOne({ organizationName, organizationCode, password: hashedPassword });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      // You might want to add token generation and handling here
      return res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
};

export default signIn;
