import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "bizleap1@gmail.com";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;

    if (!session || !session.user || !isSuperAdmin) {
      return new NextResponse("Unauthorized: Only Super Admin can impersonate shops.", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return new NextResponse("Email parameter is required", { status: 400 });
    }

    const shop = await prisma.shop.findFirst({
      where: { owner_email: email }
    });

    if (!shop) {
      return new NextResponse("Shop not found", { status: 404 });
    }

    // Return HTML page with auto-submitting form and NextAuth CSRF token
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Opening ${shop.name} Dashboard...</title>
        <style>
          body {
            background-color: #0a0a0a;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: #111111;
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
            max-width: 400px;
          }
          .spinner {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid #f59e0b;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h2 { margin: 0 0 8px; font-size: 18px; }
          p { margin: 0; color: #9ca3af; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h2>🔑 Logging in as ${shop.name}</h2>
          <p>Redirecting to store dashboard...</p>
        </div>

        <form id="impersonateForm" method="POST" action="/api/auth/callback/credentials">
          <input type="hidden" name="csrfToken" id="csrfToken" value="" />
          <input type="hidden" name="email" value="${shop.owner_email}" />
          <input type="hidden" name="password" value="ADMIN_IMPERSONATE_BYPASS" />
          <input type="hidden" name="callbackUrl" value="/dashboard" />
        </form>

        <script>
          async function autoLogin() {
            try {
              const res = await fetch('/api/auth/csrf');
              const data = await res.json();
              document.getElementById('csrfToken').value = data.csrfToken;
              document.getElementById('impersonateForm').submit();
            } catch (err) {
              console.error(err);
              document.getElementById('impersonateForm').submit();
            }
          }
          autoLogin();
        </script>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error: any) {
    return new NextResponse("Server Error: " + error.message, { status: 500 });
  }
}
