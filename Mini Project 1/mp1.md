## Mini Project 1 Competency Claim

### C3 - Data cleaning and file handling

In `MP1.ipynb`, I cleaned each analysis slice before calculating results by using `dropna` on required columns, converting ranking and year fields with `astype(int)`, parsing timestamps with `pd.to_datetime`, and filling missing listening contexts with `fillna("unknown")`. I also standardized category order for listening windows with `pd.Categorical` so comparisons are consistent across questions. For file handling, I exported all required Q1-Q3 Plotly figures to PNG with Kaleido and included guard checks that raise clear errors when required figure objects are missing.

### C5 - Data analysis with pandas

I answered each research question with reproducible pandas workflows rather than manual inspection. For Q1, I filtered to `top_artists`, built rank and overlap tables with `pivot_table`, set operations, and sorting to quantify stability versus discovery across time windows. For Q2 and Q3, I used `groupby`, `agg`, `value_counts`, and reshaping to compute release-year/decade distributions, context shares, and top artists by listening mode, then interpreted those outputs in markdown.

### C6 - Data visualization

I selected chart types to match each analytical question and explained those choices directly below the figures. I used a connected-dot rank chart for Q1 to show directional rank movement across ordered windows, a strip plot plus mean markers for Q2 to preserve year-level spread and overlap, and a donut plus faceted bars for Q3 to communicate context share and artist differences by mode. I also improved readability with a reversed rank axis, explicit labels/titles, and a high-contrast color palette.

### C7 - Critical evaluation and professional judgment

I documented limitations and uncertainty in the conclusions section and process notes instead of over-claiming from a small API sample. In particular, I noted that deprecated endpoints and per-request data limits constrain what can be inferred, and I framed findings as pattern evidence rather than definitive behavior. I also reflected on what surprised me and identified next steps (larger samples and deeper follow-up analyses), showing critical judgment about scope and validity.