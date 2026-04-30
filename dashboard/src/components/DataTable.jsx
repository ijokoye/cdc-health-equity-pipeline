// Renders a table of county rows.
// Props: data (array of { location_name, state_abbr })

function DataTable({ data }) {
  if (data.length === 0) {
    return <p className="empty-message">No counties match your filter.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Location Name</th>
          <th>State</th>
          <th>SVI Score</th>
          <th>Obesity Rate</th>
          <th>Year</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.location_name}</td>
            <td>{row.state_abbr}</td>
            <td>{row.svi}</td>
            <td>{row.obesity}%</td>
            <td>{row.year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;
