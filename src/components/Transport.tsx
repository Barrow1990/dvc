import { pointsCharts, transportToParks } from "../lib/data";

interface Props {
  resortIndex: number;
}

const ALL_DESTINATIONS = [
  "Magic Kingdom",
  "EPCOT",
  "Hollywood Studios",
  "Animal Kingdom",
  "Disney Springs",
  "Disneyland Park",
  "Disney California Adventure",
];

export function Transport({ resortIndex }: Props) {
  const chart = pointsCharts[resortIndex];
  const info = (transportToParks.resorts as Record<string, { primary: Record<string, string>; bus: string[]; notes: string }>)[chart.resort];

  return (
    <section>
      <h2>Getting to the parks</h2>
      <p className="muted">
        Disney's rule: if a resort has a direct route (monorail/Skyliner/boat/walking) to a
        park, there's no bus to that same park - bus is either the only option, or a backup
        when the direct route is down.
      </p>
      {!info ? (
        <p className="muted">No transport data for this resort yet.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Destination</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {ALL_DESTINATIONS.filter(
                (d) => info.primary[d] || info.bus.includes(d),
              ).map((d) => (
                <tr key={d}>
                  <td>{d}</td>
                  <td>{info.primary[d] ?? `Bus`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">{info.notes}</p>
          {transportToParks.currentDisruptions.length > 0 && (
            <details>
              <summary className="muted">Current known disruptions</summary>
              <ul>
                {transportToParks.currentDisruptions.map((d) => (
                  <li key={d} className="muted">
                    {d}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
