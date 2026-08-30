import json
import sys

transcript = "/root/.gemini/antigravity-ide/brain/a95e4f19-235e-404f-a2f9-02f1db984051/.system_generated/logs/transcript.jsonl"
with open(transcript, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 260 <= data.get('step_index', 0) <= 280:
                for call in data.get('tool_calls', []):
                    if call['name'] in ['multi_replace_file_content', 'replace_file_content']:
                        args = call['args']
                        if 'Header.tsx' in args.get('TargetFile', ''):
                            print(f"=== STEP {data['step_index']} ===")
                            if 'ReplacementChunks' in args:
                                chunks = json.loads(args['ReplacementChunks'])
                                for idx, chunk in enumerate(chunks):
                                    print(f"--- Chunk {idx} (StartLine {chunk['StartLine']}) ---")
                                    print(chunk['ReplacementContent'])
                            elif 'ReplacementContent' in args:
                                print(f"--- Replace (StartLine {args['StartLine']}) ---")
                                print(args['ReplacementContent'])
        except Exception as e:
            pass
