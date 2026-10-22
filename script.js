
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQFW3HLrjycoMcNfFhRjmHgiQ8yHCfiY5NSYj8XMVUHN3tSxpx6PEurB841ZbaoDBFAa5QX5l1c8dn/pub?gid=1622470823&single=true&output=csv";

const rankingsBody = document.getElementById("rankings");
const statusText = document.getElementById("status");

async function loadRankings() {
  statusText.textContent = "Updating...";

  try {
    const url = CSV_URL + "&t=" + Date.now();

    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Could not fetch rankings");
    }

    const csv = await response.text();

    // Read rows from the CSV.
    const rows = csv.trim().split(/\r?\n/);

    // Remove the header row.
    rows.shift();

    const players = rows
      .filter(row => row.trim() !== "")
      .map(row => {
        const columns = row.split(",");

        return {
          name: columns[0].trim(),
          points: Number(columns[1]),
          rank: Number(columns[2])
        };
      });

    // Sort by the spreadsheet's ranking.
    players.sort((a, b) =>
      a.rank - b.rank ||
      b.points - a.points ||
      a.name.localeCompare(b.name)
    );

    // Clear the previous table.
    rankingsBody.replaceChildren();

    players.forEach(player => {
      const row = document.createElement("tr");

      if (player.rank <= 3) {
        row.classList.add("top-three");
      }

      const rankCell = document.createElement("td");
      const nameCell = document.createElement("td");
      const pointsCell = document.createElement("td");

      rankCell.textContent = player.rank;
      nameCell.textContent = player.name;
      pointsCell.textContent = player.points;

      row.append(rankCell, nameCell, pointsCell);
      rankingsBody.appendChild(row);
    });

    statusText.textContent = "Rankings updated";

  } catch (error) {
    console.error(error);
    statusText.textContent = "Unable to update rankings";

    if (rankingsBody.children.length === 1 &&
        rankingsBody.textContent.includes("Loading")) {
      rankingsBody.textContent = "";

      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 3;
      cell.textContent = "Could not load rankings. Please try again later.";

      row.appendChild(cell);
      rankingsBody.appendChild(row);
    }
  }
}

// Load when the page opens.
loadRankings();

// Check for updated data every 60 seconds.
setInterval(loadRankings, 60000);
