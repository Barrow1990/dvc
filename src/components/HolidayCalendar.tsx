import { schoolHolidayData } from "../lib/data";

export function HolidayCalendar() {
  return (
    <section>
      <h2>School holiday windows</h2>
      <p className="muted">
        Source: {schoolHolidayData.source} (fetched {schoolHolidayData.fetchedAt}). {schoolHolidayData.note}
      </p>
      <table>
        <thead>
          <tr>
            <th>Window</th>
            <th>Start</th>
            <th>End</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {schoolHolidayData.holidayWindows.map((w) => (
            <tr key={w.name}>
              <td>{w.name}</td>
              <td>{w.start}</td>
              <td>{w.end}</td>
              <td>{w.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
