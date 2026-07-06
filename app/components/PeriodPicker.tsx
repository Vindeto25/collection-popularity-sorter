import {PERIOD_LABELS} from "../modules/sorting/periodLabels";
import type {PeriodType} from "../modules/sorting/sortingTypes";

export function PeriodPicker({
  value,
  onChange,
}: {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
}) {
  return (
    <div className="field">
      <label htmlFor="periodType">Period</label>
      <select
        id="periodType"
        name="periodType"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as PeriodType)}
      >
        {Object.entries(PERIOD_LABELS).map(([periodType, label]) => (
          <option key={periodType} value={periodType}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
