"use server"

export async function sendEmailAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  // Use the newly provided .env variables for EmailJS
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_placeholder";
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_placeholder";
  
  // The user provided NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in .env
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY; 
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return { success: false, error: "Email configuration is missing." };
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          from_name: `${firstName} ${lastName}`,
          from_email: email,
          subject: subject,
          message: message,
          reply_to: email,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `EmailJS Error: ${text}` };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}
