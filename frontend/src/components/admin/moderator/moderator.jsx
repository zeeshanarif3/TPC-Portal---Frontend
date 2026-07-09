import { useState } from "react";
import ModeratorTable from "./components/moderatorTable";
import NewModeratorPage from "./components/NewModeratorPage";
import UpdateModeratorPage from "./components/UpdateModeratorPage";

import { useDashboard } from "../../../hooks/useDashboard";

import "./moderator.css";

export default function ModeratorPage({ token }) {

  const {
    loading,
    error,
    AllModerators = [],
    createModerator,
    updateModerator,
    deleteModerator,


  } = useDashboard(token);

  const [searchTerm, setSearchTerm] = useState("");
  const [showUpdateModeratorPage, setShowUpdateModeratorPage] = useState(false);
  const [UpdateModeratordata, setUpdateModeratordata] = useState(null);

  // if (showNewModerator) {
  //   return (
  //     <NewModeratorPage
  //       token={token}
  //       onBack={() => setShowNewModerator(false)}
  //     />
  //   );
  // }
  if (showUpdateModeratorPage) {
    return (
      <UpdateModeratorPage
        token={token}
        onBack={() => setShowUpdateModeratorPage(false)}
        moderator={UpdateModeratordata}
        updateModerator={updateModerator}
      />
    );
  }

  const filteredModerators = AllModerators.filter((moderator) => {
    return (
      moderator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moderator._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moderator.speciality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moderator.userId?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const handleExportCSV = () => {
    const headers = [
      "MODERATOR NAME",
      "MODERATOR ID",
      "EMAIL",
      "SPECIALITY",
    ];

    const rows = filteredModerators.map((m) => [
      m.name,
      m._id,
      m.userId?.email || "",
      m.speciality || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "moderators.csv";
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="moderator-page">
      {/* Header */}

      <div className="moderator-header">
        <div>
          <h1>Moderators</h1>
          <p>{AllModerators.length} moderators on record</p>
        </div>

        {/* <button
          className="btn-add-trainer"
          onClick={() => setShowNewModerator(true)}
        >
          + Add Moderator
        </button> */}
      </div>

      {/* Filters */}
      <div className="moderator-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search moderators..."
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

      {/* Table */}
      {loading && (
        <p className="loading">
          Loading moderators...
        </p>
      )}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <ModeratorTable
          moderator={filteredModerators}
          onDelete={deleteModerator}
          onRefresh={() => {}}
          token={token}
          setShowUpdateModeratorPage={setShowUpdateModeratorPage}
          setUpdateModeratordata={setUpdateModeratordata}
        />
      )}
    </div>
  );
}