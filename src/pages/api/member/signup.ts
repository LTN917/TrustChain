import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../mongoDB/dbConnect';
import User from '../../../../mongoDB/User';
import crypto from 'crypto';

// SHA-256
const sha256 = (data: string) => crypto.createHash('sha256').update(data).digest('hex');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();
  const { method } = req;

  if (method === 'POST') {
    try {
      const hashedPassword = sha256(req.body.password);
      const existingUser = await User.findOne({
        $or: [{ organizationCode: req.body.organizationCode }, { organizationName: req.body.organizationName }]
      });

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Organization code or organizationName already exists' });
      }

      const user = new User({
        organizationCode: req.body.organizationCode,
        organizationName: req.body.organizationName,
        password: hashedPassword
      });

      await user.save();
      console.log('[DB] User registered successfully');
      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, message: 'Error registering new user', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;