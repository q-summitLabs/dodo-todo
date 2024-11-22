import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
        if (account && account.provider === "google") {
          const { name, email, image } = user;
          try {
            await dbConnect();
            const dbUser = await User.findOneAndUpdate(
              { email },
              {
                $set: {
                  name,
                  image,
                  googleId: account.providerAccountId,
                  lastLogin: new Date(),
                },
                $setOnInsert: {
                  createdAt: new Date(),
                },
              },
              { upsert: true, new: true }
            );
  
            user.id = dbUser._id.toString();
            return true;
          } catch (error) {
            console.error("Error during sign in:", error);
            return false;
          }
        }
        return true;
    }
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

