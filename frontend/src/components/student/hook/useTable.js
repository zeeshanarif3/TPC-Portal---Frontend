import { useMemo, useState } from "react";

export default function useTable(data = [], sortConfig = {}) {
  const [selected, setSelected] = useState([]);

  const [sortField, setSortField] = useState(
    Object.keys(sortConfig)[0] || ""
  );

  const [sortDirection, setSortDirection] =
    useState("asc");

  const [copying, setCopying] = useState(false);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const getter = sortConfig[sortField];

      if (!getter) return 0;

      const aVal = getter(a);
      const bVal = getter(b);

      if (aVal < bVal)
        return sortDirection === "asc"
          ? -1
          : 1;

      if (aVal > bVal)
        return sortDirection === "asc"
          ? 1
          : -1;

      return 0;
    });
  }, [
    data,
    sortField,
    sortDirection,
    sortConfig,
  ]);

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === sortedData.length) {
      setSelected([]);
    } else {
      setSelected(
        sortedData.map((x) => x._id)
      );
    }
  };

  const clearSelection = () =>
    setSelected([]);

  const copyID = async (id) => {
    if (copying) return;

    setCopying(true);

    try {
      await navigator.clipboard.writeText(
        String(id)
      );
    } finally {
      setTimeout(
        () => setCopying(false),
        300
      );
    }
  };

  return {
    sortedData,

    selected,
    toggleSelection,
    selectAll,
    clearSelection,

    sortField,
    sortDirection,
    toggleSort,

    copyID,
    copying,
  };
}