const countries = [
  { name: "Portugal", code: "pt", flag: "🇵🇹", recent: true, selected: true },
  { name: "United States", code: "us", flag: "🇺🇸", recent: true },
  { name: "Argentina", code: "ar", flag: "🇦🇷" },
  { name: "Australia", code: "au", flag: "🇦🇺" },
  { name: "Brazil", code: "br", flag: "🇧🇷" },
  { name: "Canada", code: "ca", flag: "🇨🇦" },
  { name: "China", code: "cn", flag: "🇨🇳" },
  { name: "Egypt", code: "eg", flag: "🇪🇬" },
  { name: "France", code: "fr", flag: "🇫🇷" },
  { name: "Germany", code: "de", flag: "🇩🇪" },
  { name: "India", code: "in", flag: "🇮🇳" },
  { name: "Italy", code: "it", flag: "🇮🇹" },
  { name: "Japan", code: "jp", flag: "🇯🇵" },
  { name: "Kenya", code: "ke", flag: "🇰🇪" },
  { name: "Mexico", code: "mx", flag: "🇲🇽" },
  { name: "Netherlands", code: "nl", flag: "🇳🇱" },
  { name: "New Zealand", code: "nz", flag: "🇳🇿" },
  { name: "Nigeria", code: "ng", flag: "🇳🇬" },
  { name: "South Korea", code: "kr", flag: "🇰🇷" },
  { name: "Spain", code: "es", flag: "🇪🇸" },
  { name: "Sweden", code: "se", flag: "🇸🇪" },
  { name: "United Kingdom", code: "gb", flag: "🇬🇧" },
];

type Country = (typeof countries)[number];

function CountryItem({ country }: { country: Country }) {
  return (
    <div
      className="combobox-item"
      data-sp-label={`${country.flag} ${country.name}`}
    >
      <input
        type="radio"
        name="country"
        value={country.code}
        defaultChecked={country.selected}
      />
      <span>{country.flag}</span> {country.name}
    </div>
  );
}

export default function CountryPicker() {
  return (
    <>
      <div className="field w-full max-w-72">
        <label className="label" htmlFor="country-picker-input">
          Country
        </label>
        <div className="input-group" id="country-picker-field">
          <input
            className="input"
            id="country-picker-input"
            placeholder="Select a country"
            defaultValue="🇵🇹 Portugal"
          />
          <span className="input-group-addon input-group-addon-end">
            <button
              className="btn btn-ghost btn-xs btn-icon"
              type="button"
              tabIndex={-1}
              aria-label="Open list"
            >
              <svg className="text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </span>
        </div>
      </div>

      <div className="combobox" data-sp-toggle="#country-picker-field">
        <div className="combobox-empty">No countries found.</div>
        <div className="combobox-list scrollbar scrollbar-sm">
          <div className="combobox-group">
            <div className="combobox-label">Recent</div>
            {countries
              .filter((country) => country.recent)
              .map((country) => (
                <CountryItem key={country.code} country={country} />
              ))}
          </div>
          <div className="combobox-group">
            <div className="combobox-label">All countries</div>
            {countries
              .filter((country) => !country.recent)
              .map((country) => (
                <CountryItem key={country.code} country={country} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
