import json


def read_cowrie_events(file_path: str, start_line: int = 0):
    events = []
    last_line = start_line

    with open(file_path, "r", encoding="utf-8") as f:
        for line_number, line in enumerate(f, start=1):
            if line_number <= start_line:
                continue

            line = line.strip()

            if not line:
                continue

            try:
                event = json.loads(line)
                events.append(event)
                last_line = line_number
            except json.JSONDecodeError:
                print(f"[parser] skipped invalid JSON line: {line_number}")
                last_line = line_number

    return events, last_line
