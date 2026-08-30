import json
import sys

transcript = "/root/.gemini/antigravity-ide/brain/a95e4f19-235e-404f-a2f9-02f1db984051/.system_generated/logs/transcript.jsonl"
with open(transcript, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 266:
                for call in data.get('tool_calls', []):
                    chunks = json.loads(call['args']['ReplacementChunks'])
                    for chunk in chunks:
                        print(f"--- Chunk StartLine {chunk['StartLine']} ---")
                        print(chunk['ReplacementContent'])
        except Exception as e:
            pass
