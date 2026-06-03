## Week 6 Competency Claim

In `week6_mp1_starter.ipynb`, I used Python charts with `plotly` (and `kaleido` to export figures) to make clear claims from my Spotify data by matching chart type to question and structure: a horizontal bar chart for artist rank movement (many categories and long labels), a grouped bar chart for decade comparisons, and a release-year distribution plot for spread over time. I began the explainations for each chart choice in markdown cells and interpreted what the results showed, so the notebook documents both method and reasoning; the published GitHub notebook includes code, outputs, and written findings that someone else can follow end to end. The exported visualizations are in a folder in the `.png` format that was required. 

## Chart Rationales

### Q1 Connected Dot Plot

A connected dot plot is a better fit for this question because the main goal is to show how each artist's rank moves across ordered time windows. The connecting lines make changes in direction easy to see while still keeping exact rank values visible at each point. Reversing the y-axis keeps rank #1 at the top, matching how rankings are read. The key takeaway is that some artists remain consistently near the top while others change position as the listening window broadens.

### Q2 Strip Plot

A strip plot is the best fit here because it shows every top track as an individual point, making it easy to compare the spread and concentration of release years across listening windows. This view preserves detail that summary tables can hide, including outliers and overlap between windows. The main takeaway is that the short-term window clusters more heavily in recent years, while older tracks still appear across the broader windows.

### Q2 Grouped Bar Chart

A grouped bar chart works well for decade-level comparison because it puts listening windows side by side within each decade, so differences in volume are easy to read. Compared with the strip plot, this chart emphasizes broader era patterns instead of individual tracks. The key takeaway is that recent decades account for most top tracks, with the strongest concentration in the shorter listening window.

### Q3 Donut Chart

A donut chart is appropriate for this question because it clearly communicates part-to-whole composition of recent listens by context. The chart makes relative share immediately visible while still showing exact play counts in hover details. The takeaway is that one context category contributes the largest share of recent listening, with album and unknown(Spotify DJ) contexts making up the remainder.

### Q3 Horizontal Grouped Bar Chart

A horizontal grouped bar chart is a strong fit for comparing top artists by listening context because it makes rank and magnitude differences easy to scan within and across contexts. Splitting by context highlights that the artist mix is not identical between album and playlist listening. The key takeaway is that listening mode shapes which artists appear most in recent plays.