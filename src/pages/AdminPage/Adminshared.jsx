import { Card, CardContent } from "../../components/ui/card";

export function formatYearAdm(year) {
  if (!year) return "";
  if (year === "1" || year === 1) return "1st Year";
  if (year === "2" || year === 2) return "2nd Year";
  if (year === "3" || year === 3) return "3rd Year";
  return `${year}th Year`;
}

export function TabButtonAdm({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function SectionAdm({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

export function StudentCardAdm({ user }) {
  return (
    <Card>
      <CardContent className="p-4">
        <StudentInfoAdm user={user} />
      </CardContent>
    </Card>
  );
}

export function StudentInfoAdm({ user }) {
  return (
    <>
      <p className="font-medium">
        {user.firstName} {user.lastName}
      </p>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <p className="text-sm">
        {user.department} • Year {user.year}
      </p>
    </>
  );
}
