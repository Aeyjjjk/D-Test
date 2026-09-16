# Wact DA Test

An admin tool for running compliant random selection of employees for
drug/alcohol testing, tracking who's been drawn, and exporting reports.

## What it does

- **Random draw**: picks 2–3 employees per draw, preferring a spread across
  departments. It never repeats someone within the current cycle. Once every
  active employee has been drawn at least once, that cycle closes automatically
  and the next draw starts a new cycle from the full roster again. Confirming
  the draw shows a blurred-backdrop popup listing everyone selected — it stays
  open until the admin clicks Confirm.
- **Admin dashboard**: cycle progress, pending-result count, a 14-day trend
  chart, a department breakdown chart for the current cycle, and a table of
  recent draws where you can mark each as tested / no-show / excused.
- **Employee roster**: add/edit/deactivate employees one at a time, or bulk
  import via CSV (`tag_id, full_name, department, email, phone`). Sortable by
  Tag ID (default), name, department, or status. Export the current roster to
  CSV any time. Card-based layout on phones instead of a cramped table.
- **Exports**: three separate CSV exports — tested, pending, and not tested —
  each for a daily, weekly, monthly, or yearly window.
- **Activity log**: every draw, cycle change, and roster edit — exportable to
  CSV.
- **Employee status check** (`/status`): an employee types their Tag ID and
  sees whether they're currently due for testing — no login needed.
- **Testing board** (`/board`): a kiosk-style screen listing everyone
  currently due, meant to run on a shared display. Auto-refreshes every 20
  seconds. Never shows test results — only name, department, and "report now."
- **Admin area** (`/admin`): dashboard, employees, exports, logs — all
  behind sign-in. Create admin accounts directly in Supabase Authentication;
  there's no self-signup.
- **Light / dark mode**: a toggle on every screen; the choice is remembered
  per browser.
- Fully responsive, from phone widths up through large desktop screens.
ag ID updates
