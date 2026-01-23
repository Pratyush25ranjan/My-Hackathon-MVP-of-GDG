import emailjs from "@emailjs/browser";

/* ================= CONFIG ================= */
const SERVICE_ID = "service_7vzpcq7";
const ADMIN_TEMPLATE_ID = "template_bad9g9y";       // admin signup mail
const STUDENT_TEMPLATE_ID = "template_zvdi0zc"; // create this
const PUBLIC_KEY = "Dw81JckZQT7bvPJfh";

emailjs.init(PUBLIC_KEY);

/* =====================================================
   1️⃣ ADMIN EMAIL – when student signs up
===================================================== */
export function sendAdminNotification(student) {
  return emailjs.send(
    "service_7vzpcq7",
    "template_bad9g9y",
    {
      student_name: student.name,
      student_email: student.email,
      department: student.department,
      year: student.year,
     admin_link: `${window.location.origin}/admin`,
    }
  );
}

/* =====================================================
   2️⃣ STUDENT EMAIL – approve / reject
===================================================== */
export function sendStudentStatusEmail({
  student_name,
  student_email,
  status,
}) {
  const isApproved = status === "approved";

  return emailjs.send(
    "service_7vzpcq7",
    "template_zvdi0zc",
    {
      student_name,
      student_email,

      status_text: isApproved ? "APPROVED ✅" : "REJECTED ❌",
      status_color: isApproved ? "#16a34a" : "#dc2626",

      status_message: isApproved
        ? "Congratulations! Your account has been approved."
        : "Unfortunately, your account request was not approved.",

      action_message: isApproved
        ? `You can now log in and start using CampusConnect.<br/>
           👉 <a href="${window.location.origin}/login">Login to CampusConnect</a>`
        : "You may contact the administrator for further clarification.",
    }
  );
}
