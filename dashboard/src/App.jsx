import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/health-data")
      .then((response) => response.json())
      .then((result) => {
        console.log("Results from API", result);
        setData(result);
      })
      .catch((error) => {
        console.log("Fetch Error:", error);
      });
  }, []);

const filteredData = data.filter((row) => 
  row.state_abbr.toLowerCase().includes(filter.toLowerCase())
)

  return (
    <div>
      <h1>Health Data</h1>
      <label>
        Filter by State:
        <input 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Type state abbreviation">
        </input>
      </label>

      {filteredData.map((row, index) => (
        <p key={index}>
          {row.location_name} - {row.state_abbr}
        </p>
      ))}
    </div>
  );
}
  

export default App;








































// import { useState, useEffect } from "react";

// function App() {
//   // State
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:3000/health-data")
//       .then((response) => response.json())
//       .then((result) => {
//         console.log("RESULTS FROM API:", result);
//         setData(result);
//       })
//       .catch((error) => {
//         console.error("FETCH ERROR:", error);
//       });
//   }, []);

//   console.log("DATA STATE:", data);
//   return (
//   <div>
//     <h1>My Health Data</h1>

//     <table border="1">
//       <thead>
//         <tr>
//           <th>Location Name</th>
//           <th>State</th>
//         </tr>
//       </thead>

//       <tbody>
//         {data.map((row, index) => (
//           <tr key={index}>
//             <td>{row.location_name}</td>
//             <td>{row.state_abbr}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>

//   </div>
// );
// }

// export default App;