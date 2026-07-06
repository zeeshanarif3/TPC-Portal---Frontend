import { useState } from "react";
import { useDashboard } from "../../../hooks/useDashboard";
import CollegeTable from "./components/CollegeTable";


import "./colledge.css";

export default function CollegePage({ token }) {
  const {
    colleges = [],

    stats,
    loading,
    error,
  } = useDashboard(token);

  const [selectedColleges, setSelectedColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColleges = colleges.filter((college) => {
    const search = searchTerm.toLowerCase();

    return (
      college.name?.toLowerCase().includes(search) ||
      college._id?.toLowerCase().includes(search) ||
      college.location?.toLowerCase().includes(search) ||
      college.pointOfContact?.toLowerCase().includes(search)
    );
  });

  const handleSelectCollege = (collegeId) => {
    setSelectedColleges((prev) =>
      prev.includes(collegeId)
        ? prev.filter((id) => id !== collegeId)
        : [...prev, collegeId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedColleges(
      checked ? filteredColleges.map((c) => c._id) : []
    );
  };

  const handleExportCSV = () => {
    const headers = [
      "College Name",
      "College ID",
      "Location",
      "Point Of Contact",
      "Moderator",
      "Moderator Email",
      "Created At",
    ];

    const rows = filteredColleges.map((c) => [
      c.name,
      c._id,
      c.location,
      c.pointOfContact,
      c.moderatorId?.name ?? "",
      c.moderatorId?.email ?? "",
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "colleges.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="college-page">
      <div className="college-header">
        <div>
          <h1>Colleges</h1>
          <p>{colleges.length} colleges registered</p>
        </div>

        <button
          className="btn-add-college"
          onClick={() => (window.location.href = "/college/add")}
        >
          + Add College
        </button>

      </div>

      <div className="college-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by name, id, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="btn-export-csv"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
      </div>

      {loading && <p className="loading">Loading colleges...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <CollegeTable
          colleges={filteredColleges}
          selectedColleges={selectedColleges}
          onSelectCollege={handleSelectCollege}
          onSelectAll={handleSelectAll}
          // onDelete={deleteCollege}
        />
      )}
    </div>
  );
}


