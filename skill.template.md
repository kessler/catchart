---
name: catchart
description: Pipe numeric data from a shell pipeline into a browser chart for quick visual inspection using the globally-installed `catchart` CLI. Use this skill whenever the user asks to "chart", "graph", "plot", or "visualize" some data on the command line, or wants a fast eyeball-check of metrics, log counts, benchmark numbers, query results, time-series, or any tabular output. Also reach for it proactively when you've just produced numeric output (CSV-ish, JSON-per-line, columns of numbers) and a chart would help the user see a pattern more easily than scanning the rows. Prefer catchart over writing one-off matplotlib/gnuplot scripts when the user just wants a quick look.
version: "{{VERSION}}"
---

# catchart

`catchart` turns stdin into a chart.js chart in the browser. It auto-opens the default browser, renders, and once stdin closes it shuts the local HTTP server down a moment later — the rendered chart stays visible in the tab.

It's built for *live* streams (think `tail -f`, `ping`, polling a metric) but works equally well for finite data.

## When to reach for it

Use catchart when the user wants a quick visual on numeric data — not a publication-quality figure. Strong triggers:

- "chart this", "graph this", "plot this", "visualize this", "show me a chart of …"
- After producing tabular numeric output and the user asks "what does it look like?" or "any pattern?"
- Watching a live metric: `tail -f access.log | awk … | catchart`
- Comparing a few series side-by-side from CSV or JSON-lines

Don't use it for: static images to save to disk, charts that need to live in a doc, or anything where Chart.js's defaults won't be good enough (then a Python script writing a PNG is the better tool).

## How to invoke

The general shape is:

```
<producer> | catchart [flags]
```

`catchart` reads stdin one row per line. Each row is parsed as either CSV or JSON — the format is auto-detected from the first character (`{` → JSON, otherwise CSV).

### Most common recipes

**Single series of numbers (y over time)**
```
seq 1 50 | catchart -t "first 50 integers"
```

**Multiple series in CSV (one column per series)**
```
printf "1,2,3\n4,5,6\n-1,-2,-3\n" | catchart -c bar -t "three series"
```
Three values per row → three series. Labels on the X axis default to elapsed time since the first row arrived.

**Multiple series with custom names**
```
printf "1,2\n3,4\n" | catchart --datasetNames='["temp","humidity"]'
```
Names appear in the legend instead of `dataset #1`, `dataset #2`. Pass fewer names than columns to keep defaults for unnamed slots; passing more names than columns errors out.

**CSV with explicit row labels**
```
printf "mon,10,20\ntue,12,18\nwed,15,25\n" | catchart --labelSource=row
```
First field becomes the X-axis label, remaining fields are the data.

**JSON-per-line**
```
printf '{"data":1,"label":"a"}\n{"data":4,"label":"b"}\n' | catchart
```
Default JSON field names are `value`/`data` for the y-value and `label`/`title`/`key` for the X label.

**JSON with custom field names**
```
some-producer | catchart --inputFormat=json --dataField=rps --labelSource=ts
```

**Live tail**
```
tail -f metrics.log | awk -F, '{print $3}' | catchart -w 100 -t "rps"
```
`-w 100` keeps only the last 100 points on screen, which matters for long-running streams.

### Chart types

`-c <type>` where type is one of: `line` (default), `bar`, `radar`, `pie`, `doughnut`, `scatter`, `polar`, `bubble`.

Pick by data shape:

- Time-series, trends → `line` (default)
- Discrete categories with row labels → `bar`
- A handful of values that sum to a whole → `pie` / `doughnut`
- Multi-attribute comparison across a few items → `radar`
- Two-dimensional points → `scatter` / `bubble`

### Useful flags

| Flag | What it does |
|---|---|
| `-t, --title <str>` | Chart title |
| `-c, --chartType <type>` | See list above |
| `-w, --windowSize <n>` | Cap visible points (default 200). Use this for long live streams |
| `--inputFormat <auto\|csv\|json>` | Force a format when auto-detection is wrong |
| `--dataField <name>` | Which JSON field is the value (default: tries `value` then `data`) |
| `--labelSource <auto\|row\|<name>>` | `row` = first CSV field is the label; or a JSON field name |
| `--yLeft '[0,1]' --yRight '[2]'` | Pin specific series to left/right Y axes (for mixed magnitudes) |
| `--datasetNames '["a","b"]'` | JSON array of legend names; missing slots fall back to `dataset #N`, extras error |
| `--disableAutoAlignYAxis` | Turn off the magnitude-based auto-grouping of series across two Y axes |
| `--noFill` | Don't fill area under line |
| `--usePatterns` | Color-blind-friendly fill patterns |
| `--showValueLabels` | Print each value on the chart |
| `--disableAnimation` | Skip the entry animation (snappier for live streams) |
| `--port <n>` | Pin the HTTP port (default: random free port) |

## Things worth knowing

**Auto-detection of input format.** The first byte of the first row decides: starts with `{` → JSON, otherwise CSV. If your CSV ever starts with a `{`-looking field, pass `--inputFormat=csv` explicitly.

**Mixed-magnitude series get split across two Y axes automatically.** If one series is in the 0–1 range and another in the 100s, catchart will put them on opposite Y axes by default. To override, use `--yLeft` and `--yRight` (JSON arrays of series indices) or disable with `--disableAutoAlignYAxis`.

**`-w / --windowSize` is a sliding window, not a cap on input.** For a `tail -f` that runs for hours, catchart will happily process millions of rows and only ever show the last `windowSize` on the chart. Always set this for long-running streams; the default of 200 is usually fine.

**The chart stays after stdin ends.** Once the producer pipe closes, catchart waits ~1 second to let the last frames flush over the websocket, then tears down the server. The browser tab keeps displaying the rendered chart — no special handling needed for finite data.

**One viewer at a time.** Only the first websocket client gets the live stream; subsequent connections are refused. Reopen the same URL only if the first tab closed.

**Pick a chart type that matches the data.** If the user pipes in three series but says "bar chart", honor that. If they just say "chart this" and you're producing time-series, the default `line` is right. For a single category breakdown (e.g. count per status code), pivot the data into one row of numbers and use `-c pie` or `-c bar`.

## Quick decision tree for malformed-looking data

- The numbers are in column 3 of a CSV with other text fields → preprocess with `awk` / `cut` before piping in. catchart parses *every* field as a number unless `--labelSource=row` puts the first field aside.
- The data is JSON but the value field is nested (e.g. `metrics.rps`) → catchart can't reach into nested fields. Flatten with `jq` first: `jq -c '{value: .metrics.rps, label: .ts}'`.
- The data is space-separated, not comma → either swap with `tr ' ' ','` or pass a different row separator (note: `-r` is row separator, not field separator — there's no field separator flag, fields are always comma-split).

## Example: surfacing this to the user

When you decide a chart would help, tell the user what you're piping and what kind of chart you're picking, then run it. Example:

> "I'll pipe the per-minute error counts into catchart as a line chart so you can see the trend."
>
> ```
> grep ERROR app.log | awk '{print $1}' | uniq -c | awk '{print $1}' | catchart -t "errors/min"
> ```

Keep the invocation visible — the user often wants to tweak the flags themselves.
