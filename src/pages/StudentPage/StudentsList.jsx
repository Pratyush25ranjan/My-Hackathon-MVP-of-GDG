// src/pages/StudentPage/StudentsList.jsx
import { Input } from "../../components/ui/input";
import { Select, SelectItem } from "../../components/ui/select";

export default function StudentsList({
  students,
  search,
  setSearch,
  filterDept,
  setFilterDept,
  filterYear,
  setFilterYear,
  navigate,
}) {
  const filteredStudents = students.filter((s) => {
    const matchesDept = !filterDept || s.department === filterDept;
    const matchesYear = !filterYear || s.year === filterYear;
    const q = (s.firstName + " " + s.lastName + s.email)
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesDept && matchesYear && q;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectItem value="">All Depts</SelectItem>
          <SelectItem value="it">IT</SelectItem>
          <SelectItem value="cs">CSE</SelectItem>
          <SelectItem value="ee">EE</SelectItem>
          <SelectItem value="ece">ECE</SelectItem>
          <SelectItem value="che">Chemical</SelectItem>
          <SelectItem value="ce">Civil</SelectItem>
          <SelectItem value="aiml">AIML</SelectItem>
          <SelectItem value="anim">Animation</SelectItem>
          <SelectItem value="me">ME</SelectItem>
          <SelectItem value="ipe">IPE</SelectItem>
        </Select>

        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectItem value="">All Years</SelectItem>
          <SelectItem value="1">1st</SelectItem>
          <SelectItem value="2">2nd</SelectItem>
          <SelectItem value="3">3rd</SelectItem>
          <SelectItem value="4">4th</SelectItem>
        </Select>
      </div>

      {filteredStudents.map((s) => (
        <div
          key={s.id}
          className="flex justify-between border p-3 rounded bg-background cursor-pointer"
          onClick={() => navigate(`/chat/${s.id}`)}
        >
          <div>
            <p className="font-medium">
              {s.firstName} {s.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{s.email}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {s.department.toUpperCase()} · Year {s.year}
          </div>
        </div>
      ))}
    </div>
  );
}
