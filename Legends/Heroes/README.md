Heroes — Parking Dashboard (HTML/CSS/JS)

This project is a plain HTML/CSS/JavaScript replica of the LEGENDS app. It demonstrates a simple in-memory "backend" using a PriorityQueue (for optimal slot assignment) and a HashMap (for O(1) lookups).

How to run

Open `index.html` in a browser (double-click or serve with a static server).

Features
- Dashboard Grid: visual parking slots (green = available, red = occupied)
- Control Panel: process Entry (assign slot) and Exit (release slot) by Vehicle ID
- Stats Panel: Total, Available, Occupied counts
- Activity Log: chronological events

Notes
- Data is kept in-memory in the browser.
- PriorityQueue uses smallest-slot-first allocation; adapt policy in `js/app.js`.
