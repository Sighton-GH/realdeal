# Audited Hammer product overrides

Files are named with RealDeal retailer IDs (saveon, nofrills, walmart, tnt, loblaws, metro, voila, galleria).

Schema:

```json
{
  "excludeProductIds": ["verbatim Hammer product id"],
  "assignments": {"verbatim Hammer product id": "catalogue-item-id"},
  "notes": ["audit explanation"]
}
```

Exclusions always win. An assignment restricts the match to that item, but still requires name and size validation. Invalid assignments do not fall back to another item. These audits were made against the original 128-item catalogue; some exclusions may also exclude a product appropriate for a future category. Review its source before changing an exclusion.

Known-size packages need matching dimensions and quantity within 1%. Unknown sizes, conflicting title/units, ambiguous equal-score matches and unproven per-weight price bases are rejected rather than guessed. "1 ea" metadata can be ignored when a mass or volume is explicit in the title. Egg counts are converted to dozens, and count-based bakery products read pack counts ahead of printed equivalent mass. Spelled-out metric and pound units are supported.

Not every audited assignment passes the matcher. This is deliberate: name/size validation is still required. Audit notes retain candidates for later review. Blanket exceptions for missing sizes or unverified per-pound bases have not been added.

The importer keeps one product per item/store pair, ranked by weeks inside the latest 26-week window. Generic catalogue staples may still compare different brands across chains; branded new-category packages use full names and exact sizes. Hammer is Toronto-area historical pickup data, not confirmed local shelf pricing. See https://jacobfilipp.com/hammer/ for dataset limitations. Its reuse licence has not been confirmed.
