export const prerender = false;

import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, phone, subject, message } =
      await request.json();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
});

    await transporter.sendMail({
      from: import.meta.env.SMTP_USER,
      to: import.meta.env.CONTACT_RECEIVER,
      replyTo: email,
      subject: `[User Job Portal] ${subject}`,
      html: `
        <h2>Pesan Baru</h2>

        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telepon:</strong> ${phone}</p>

        <hr>

        <p>${message}</p>
      `,
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("SMTP ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      { status: 500 }
    );
  }
};