import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from '../../../app/database/db';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      const googleId = account.providerAccountId; // The Google ID from OAuth
      console.log("Google id (in [...nextauth].js): " + googleId);

      try {
        const existingUser = await db.findUserByGoogleId(googleId); // Call the function
        
        if (!existingUser) {
          console.log("Google account not linked to any system user");
          return `/pages/login?error=UNLINKED_ACCOUNT&googleId=${googleId}`;
        } else {
          console.log("Existing user id: " + existingUser.employee_id);
        }

        console.log("User account already linked, returning true.");
        return true;
      } catch (error) {
        console.error("Error during sign-in process:", error);
        return false; // In case of an error, deny login
      }
    },

    async jwt({ token, account, user }) {
      if (account) {
        // Fetch user details from the database using the Google ID
        const googleId = account.providerAccountId;
        const existingUser = await db.findUserByGoogleId(googleId);

        if (existingUser) {
          // Attach user details to the token
          token.employeeId = existingUser.employee_id;
          token.employeeName = existingUser.employee_name;
          token.jobTitle = existingUser.job_title;
        }
      }

      console.log('JWT callback token:', token);
      return token;
    },

    async session({ session, token }) {
      // Add fields from the token to the session
      session.user.googleId = token.sub; // Store the Google ID (from `sub` field)
      session.user.id = token.employeeId; // Employee ID
      session.user.name = token.employeeName; // Employee name
      session.user.jobTitle = token.jobTitle; // Job title

      console.log("Session callback reached: " + session);
      return session;
  },
  },
});
