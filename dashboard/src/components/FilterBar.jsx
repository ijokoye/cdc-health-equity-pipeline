// A simple search input to filter county rows by state abbreviation.
// Props: filter (string), onFilterChange (function)

function FilterBar({ filter, onFilterChange }) {
  return (
    <div className="filter-bar">
      <label className="filter-label" htmlFor="state-filter">
        Filter by State
      </label>
      <input
        id="state-filter"
        className="filter-input"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="e.g. CA, TX, NY"
      />
    </div>
  );
}

export default FilterBar;
