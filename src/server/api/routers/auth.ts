import { TRPCError } from "@trpc/server";
import {
  createToken,
  hashPassword,
  setAuthCookie,
  verifyPassword,
} from "~/lib/auth";
import UserModel, { type UserDocument } from "~/server/db/models/user";
import { publicProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";
import nodemailer from "nodemailer";
import OtpModel from "~/server/db/models/otp";
import path from "path";
import fs from "fs";
import { generateRandomFourDigits } from "~/lib/utils";
import { verifyToken } from "~/app/api/auth/verify-jwt";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false, // Use with caution in production, only for testing
  },
} as nodemailer.TransportOptions);

export function updateOtpTemplate(
  otp: string,
  email: string,
  recipientName: string,
): string {
  // Read the HTML template
  const templatePath = path.join(
    process.cwd(),
    "public",
    "email-templates",
    "otp-verification.html",
  );
  const htmlContent = fs.readFileSync(templatePath, "utf-8");

  return htmlContent
    .replace("{Insert OTP}", otp)
    .replaceAll("{Email Address}", email)
    .replace("[Recipient Name]", recipientName);
}

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(5),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Explicitly type the query result
      const existingUser: UserDocument | null = await UserModel.findOne({
        email: input.email,
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      const hashedPassword = await hashPassword(input.password);
      const user: UserDocument = await UserModel.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
      });

      const token = createToken(String(user?.id ?? user?._id));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      await authRouter.createCaller({} as any).sendOtp({ email: input.email });

      ctx.res?.setHeader("Set-Cookie", setAuthCookie(token));

      return {
        user: {
          id: String(user.id ?? user._id),
          email: user.email,
          name: user.name,
        },
        token,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(5),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user: UserDocument | null = await UserModel.findOne({
        email: input.email,
      }).exec();

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const comparePassword = await verifyPassword(
        input.password,
        user.password ?? "",
      );
      if (!comparePassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Password is incorrect",
        });
      }

      const token = createToken(String(user.id ?? user._id));
      const cookie = setAuthCookie(token);

      console.log("Context req:", ctx.req.cookies.get("auth")?.value);

      return {
        user: {
          id: String(user.id ?? user._id),
          email: user.email,
          name: user.name,
        },
        token,
        setCookie: cookie,
      };
    }),

  sendOtp: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input;
      const user = await UserModel.findOne({ email }).exec();

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      // Generate a 6-digit OTP
      const otp = generateRandomFourDigits().toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

      // Store OTP in MongoDB
      await OtpModel.findOneAndUpdate(
        { email },
        { otp, expiresAt, createdAt: new Date() },
        { upsert: true, new: true },
      );

      const mailTemplate = updateOtpTemplate(otp, email, user?.name ?? "User");

      // Send OTP via email
      const mailOptions = {
        from: process.env.EMAIL_SERVER_USER,

        to: email,
        subject: "Verify Your Account",
        html: mailTemplate,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
      } catch (error) {
        console.error("Error sending email:", error);
      }

      return { message: "OTP sent to your email" };
    }),

  resendOtp: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input;

      // Check if the user exists
      const user: UserDocument | null = await UserModel.findOne({
        email,
      }).exec();
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Generate a new OTP
      const otp = generateRandomFourDigits().toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration
      // Update or create the OTP in the database
      await OtpModel.findOneAndUpdate(
        { email },
        { email, otp, expiresAt },
      ).exec();
      // Read the HTML template
      const mailTemplate = updateOtpTemplate(otp, email, user?.name ?? "User");

      // Send OTP via email
      const mailOptions = {
        from: "Everno",
        to: email,
        subject: "Verify Your Account",
        html: mailTemplate,
      };

      await transporter.sendMail(mailOptions);

      return { message: "OTP sent to your email" };
    }),

  getMe: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req?.cookies.get("auth")?.value;

    if (!token)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });

    const decoded = await verifyToken(token);
    if (!decoded)
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });

    // Fetch user from database
    const user = await UserModel.findById(decoded.userId).exec();

    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    // Replace with actual user fetch (e.g., Prisma)
    return {
      user: {
        id: String(user.id ?? user._id),
        email: user.email,
        name: user.name,
      },
    };
  }),

  verifyOtp: publicProcedure
    .input(z.object({ email: z.string().email(), otp: z.string().length(4) }))
    .mutation(async ({ input, ctx }) => {
      const { email, otp } = input;
      const otpDoc = await OtpModel.findOne({ email, otp }).exec();

      if (!otpDoc || otpDoc.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired OTP",
        });
      }

      // Verify user
      await UserModel.findOneAndUpdate({ email }, { isVerified: true }).exec();
      await OtpModel.deleteOne({ email }).exec(); // Clean up OTP

      const user = await UserModel.findOne({ email }).exec();
      const token = createToken(String(user?.id ?? user?._id));
      ctx.res?.setHeader("Set-Cookie", setAuthCookie(token));

      return { message: "Account verified successfully", token };
    }),
});
