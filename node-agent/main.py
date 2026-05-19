from config import COWRIE_JSON_PATH
from parser import read_cowrie_events
from classifier import classify_event
from aggregator import build_attack_chain_signals
from sender import send_signal
from state import load_state, save_state
from heartbeat import send_heartbeat


def main():
    print("[drishtimesh-agent] starting")
    print(f"[drishtimesh-agent] reading: {COWRIE_JSON_PATH}")

    heartbeat = send_heartbeat()
    if heartbeat:
        print("[heartbeat]", heartbeat)

    state = load_state()
    last_line = state.get("last_line", 0)

    print(f"[drishtimesh-agent] last processed line: {last_line}")

    events, new_last_line = read_cowrie_events(
        COWRIE_JSON_PATH,
        start_line=last_line,
    )

    print(f"[drishtimesh-agent] new events loaded: {len(events)}")

    all_signals = []

    for event in events:
        signals = classify_event(event)
        all_signals.extend(signals)

    summary_signals = build_attack_chain_signals(all_signals)

    all_signals.extend(summary_signals)

    sent_count = 0

    for signal in all_signals:
        result = send_signal(signal)

        if result:
            sent_count += 1
            print("[sent]", result)

    save_state({"last_line": new_last_line})

    print(f"[drishtimesh-agent] state updated: last_line={new_last_line}")
    print(f"[drishtimesh-agent] completed. signals sent: {sent_count}")


if __name__ == "__main__":
    main()
