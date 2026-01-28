import { useNavigate } from "react-router-dom";
import DarkCard from "../../components/ui/DarkCard";

export default function StudentsList({
  students,
  search,
  setSearch,
  filterDept,
  setFilterDept,
  filterYear,
  setFilterYear,
}) {
  const navigate = useNavigate();

  const filteredStudents = students.filter((s) => {
    const matchesDept = !filterDept || s.department === filterDept;
    const matchesYear = !filterYear || String(s.year) === filterYear;
    const q = (s.firstName + " " + s.lastName + s.email)
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesDept && matchesYear && q;
  });

  return (
    <div className="space-y-6">
      {/* FILTERS */}
      <DarkCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* SEARCH */}
          <input
            placeholder="Search student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              bg-zinc-900
              border border-white/20
              rounded
              px-3 py-2
              text-white
              placeholder-white/40
              focus:outline-none
              focus:border-green-400
              focus:ring-2
              focus:ring-green-500/50
            "
          />

          {/* DEPARTMENT */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="
              bg-zinc-900
              border border-white/20
              rounded
              px-3 py-2
              text-white
              focus:outline-none
              focus:border-green-400
              focus:ring-2
              focus:ring-green-500/50
            "
          >
            <option className="bg-zinc-900 text-white" value="">
              All Depts
            </option>
            <option className="bg-zinc-900 text-white" value="it">IT</option>
            <option className="bg-zinc-900 text-white" value="cs">CSE</option>
            <option className="bg-zinc-900 text-white" value="ee">EE</option>
            <option className="bg-zinc-900 text-white" value="ece">ECE</option>
            <option className="bg-zinc-900 text-white" value="che">Chemical</option>
            <option className="bg-zinc-900 text-white" value="ce">Civil</option>
            <option className="bg-zinc-900 text-white" value="aiml">AIML</option>
            <option className="bg-zinc-900 text-white" value="anim">Animation</option>
            <option className="bg-zinc-900 text-white" value="me">ME</option>
            <option className="bg-zinc-900 text-white" value="ipe">IPE</option>
          </select>

          {/* YEAR */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="
              bg-zinc-900
              border border-white/20
              rounded
              px-3 py-2
              text-white
              focus:outline-none
              focus:border-green-400
              focus:ring-2
              focus:ring-green-500/50
            "
          >
            <option className="bg-zinc-900 text-white" value="">
              All Years
            </option>
            <option className="bg-zinc-900 text-white" value="1">1st</option>
            <option className="bg-zinc-900 text-white" value="2">2nd</option>
            <option className="bg-zinc-900 text-white" value="3">3rd</option>
            <option className="bg-zinc-900 text-white" value="4">4th</option>
          </select>

        </div>
      </DarkCard>

      {/* STUDENT LIST */}
      <div className="space-y-3">
        {filteredStudents.map((s) => (
          <DarkCard
            key={s.id}
            className="cursor-pointer hover:border-green-400 transition"
            onClick={() => navigate(`/chat/${s.id}`)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-white">
                  {s.firstName} {s.lastName}
                </p>
                <p className="text-xs text-white/60">
                  {s.email}
                </p>
              </div>

              <div className="text-xs text-white/60">
                {s.department.toUpperCase()} · Year {s.year}
              </div>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}
